from datetime import timedelta, datetime
import os
from pathlib import Path
import pickle
from tempfile import NamedTemporaryFile
from typing import Annotated, Union
import uuid
import pandas as pd
from pydantic import BaseModel
from sklearn.base import BaseEstimator

from sqlalchemy.orm import Session
from fastapi import FastAPI, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from jose import JWTError, jwt


from . import crud, models, schemas
from .database import SessionLocal, engine
from paddel.enums import Side, Gender
from paddel.preprocessing.input.features import extract_video_features
from paddel import settings

models.Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Paddel",
    description="Documentation of the API for the PaDDeL website.",
    version="0.1",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


###################
# USER MANAGEMENT #
###################

SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Union[str, None] = None


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def get_user(db, username: str):
    if username in db:
        user_dict = db[username]
        return models.User(**user_dict)


def authenticate_user(db: Session, username: str, password: str):
    user = crud.get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user


def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_username(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


@app.post("/token", response_model=Token, tags=["users"])
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/current", response_model=schemas.User, tags=["users"])
def get_users_current(current_user: Annotated[schemas.User, Depends(get_current_user)]):
    return current_user


@app.post("/users/", response_model=schemas.User, tags=["users"])
def create_user(
    _: Annotated[schemas.User, Depends(get_current_user)],
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
):
    if len(crud.get_users(db)) == 100:
        raise HTTPException(status_code=403, detail="Cannot add more than 100 users")

    db_user = crud.get_user_by_username(db, username=user.username)

    if db_user:
        raise HTTPException(status_code=400, detail={"Username already registered"})

    if len(user.password) < 8:
        raise HTTPException(status_code=400, detail="Password has to be at least 8 characters long")
    
    if len(user.username) < 3:
        raise HTTPException(status_code=400, detail="Username has to be at least 3 characters long")

    user.password = get_password_hash(user.password)
    return crud.create_user(db=db, user=user)


@app.get("/users/", response_model=list[schemas.User], tags=["users"])
def read_users(
    _: Annotated[schemas.User, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    users = crud.get_users(db=db, skip=skip, limit=limit)
    return users


@app.get("/users/{user_id}", response_model=schemas.User, tags=["users"])
def read_user(
    _: Annotated[schemas.User, Depends(get_current_user)],
    user_id: int,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.delete("/users/{user_id}", response_model=schemas.User, tags=["users"])
def delete_user(
    current_user: Annotated[schemas.User, Depends(get_current_user)],
    user_id: int,
    db: Session = Depends(get_db),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=401, detail="You can't delete yourself")

    db_user = crud.delete_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found or can't be deleted.")
    return db_user


####################
# MODEL MANAGEMENT #
####################

@app.post("/models/", response_model=schemas.Model, tags=["models"])
def add_model(
    _: Annotated[schemas.User, Depends(get_current_user)],
    name: str = Form(),
    model: UploadFile = File(),
    db: Session = Depends(get_db),
):
    if len(crud.get_models(db)) == 100:
        raise HTTPException(status_code=403, detail="Cannot add more than 100 models")

    if len(name) < 3:
        raise HTTPException(status_code=400, detail="Model name has to be at least 3 characters long")

    db_model = crud.get_model_by_name(db, name=name)
    if db_model:
        raise HTTPException(status_code=400, detail="Model with that name already exists")

    filename = str(uuid.uuid4())
    path = Path("/data") / f"{filename}.pkl"
    
    contents = model.file.read()

    try:
        clf = pickle.loads(contents)
    except pickle.UnpicklingError as e:
        raise HTTPException(status_code=422, detail="File does not look like a sklearn estimator")

    if not isinstance(clf, BaseEstimator):
        raise HTTPException(status_code=422, detail="File does not look like a sklearn estimator")

    with open(path, "wb") as f:
        f.write(contents)

    new_model = crud.add_model(db, name, str(path))

    if not crud.get_selected_model(db):
        crud.select_model(db, new_model.id)
    
    return new_model

@app.delete("/models/{model_id}", response_model=schemas.Model, tags=["models"])
def delete_model(
    _: Annotated[schemas.User, Depends(get_current_user)],
    model_id: int,
    db: Session = Depends(get_db),
):
    selected_model = crud.get_selected_model(db)
    if (selected_model.id == model_id):
        raise HTTPException(status_code=400, detail="Selected model cannot be deleted")

    db_model = crud.delete_model(db, model_id=model_id)
    if db_model is None:
        raise HTTPException(status_code=404, detail="Model not found")
    
    os.remove(db_model.path)

    return db_model


@app.get("/models/", response_model=list[schemas.Model], tags=["models"])
def read_models(
    _: Annotated[schemas.User, Depends(get_current_user)],
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    models = crud.get_models(db=db, skip=skip, limit=limit)
    return models

@app.post("/select_model", response_model=schemas.Model, tags=["models"])
def select_model(
    _: Annotated[schemas.User, Depends(get_current_user)],
    model_id: int = Form(),
    db: Session = Depends(get_db),
):
    return crud.select_model(db, model_id)


##############
# PREDICTION #
##############

@app.post("/predict", tags=["predictions"])
def obtain_prediction(
    video_hand: Side = Form(),
    dominant_hand: Side = Form(),
    sex: Gender = Form(),
    age: int = Form(),
    video: UploadFile = File(),
    db: Session = Depends(get_db),
):
    file = NamedTemporaryFile()
    file_path = file.name

    contents = video.file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    (
        classic_features,
        fresh_features,
        detection_time,
    ) = extract_video_features(file_path)

    os.remove(file_path)

    if detection_time < settings.min_detection_seconds:
        raise HTTPException(
            status_code=422, detail="Not enough hand poses detected in provided video."
        )

    misc_features = pd.Series(
        [sex.value, age, int(dominant_hand == video_hand)],
        index=["gender", "age", "dominant_hand"],
    )

    all_features = pd.concat([misc_features, classic_features, fresh_features])

    all_features = all_features.to_frame().T

    clf_path = crud.get_selected_model(db).path

    with open(clf_path, "rb") as f:
        clf = pickle.load(f)

    return list(clf.predict_proba(all_features)[0])
