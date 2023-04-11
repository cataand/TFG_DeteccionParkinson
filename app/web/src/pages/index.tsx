import Link from "next/link";
import {
  UserIcon,
  ArrowTopRightOnSquareIcon,
  VideoCameraIcon,
} from "@heroicons/react/20/solid";

import Logo from "@/components/Logo";
import ButtonSecondary from "@/components/ButtonSecondary";
import ButtonPrimary from "@/components/ButtonPrimary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Head from "next/head";

const Home = () => (
  <>
    <Head>
      <title>PaDDeL</title>
    </Head>

    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <nav className="flex justify-between py-2">
        <Link href={"/"} className="group inline-flex items-center gap-2 p-2">
          <Logo></Logo>
          <span className="hidden font-bold group-hover:underline sm:inline">
            PaDDeL
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={`${process.env.NEXT_PUBLIC_API_LOCATION}/docs`}
            target="_blank"
          >
            <ButtonSecondary>
              API Docs
              <ArrowTopRightOnSquareIcon
                className="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              />
            </ButtonSecondary>
          </a>
          <Link href={"/admin"}>
            <ButtonPrimary>
              Admin
              <UserIcon
                className="-ml-0.5 h-5 w-5"
                aria-hidden="true"
              ></UserIcon>
            </ButtonPrimary>
          </Link>
        </div>
      </nav>

      <form
        action={`${process.env.NEXT_PUBLIC_API_LOCATION}/predict`}
        method="post"
        encType="multipart/form-data"
      >
        <div className="mt-12">
          <div className="border-b border-zinc-900/10 pb-12 dark:border-white/10">
            <h2 className="text-xl font-semibold leading-7 text-zinc-900 dark:text-white">
              Predecir
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Introduzca la siguiente información para obtener una predicción.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="dominant_hand"
                  className="block text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Su mano dominante
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="dominant-hand-left"
                      name="dominant_hand"
                      type="radio"
                      value={0}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="dominant-hand-left"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Izquierda
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="dominant-hand-right"
                      name="dominant_hand"
                      type="radio"
                      value={1}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="dominant-hand-right"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Derecha
                    </label>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="video_hand"
                  className="block text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Mano que muestra en el vídeo
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="video-hand-left"
                      name="video_hand"
                      type="radio"
                      value={0}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="video-hand-left"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Izquierda
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="video-hand-right"
                      name="video_hand"
                      type="radio"
                      value={1}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="video-hand-right"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Derecha
                    </label>
                  </div>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="age"
                  className="block text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Edad
                </label>
                <div className="mt-2 flex w-28">
                  <input
                    type="number"
                    name="age"
                    id="age"
                    min={0}
                    max={255}
                    step={1}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-0 py-1.5 text-right text-zinc-900 ring-1 ring-inset ring-zinc-300 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 dark:bg-zinc-700 dark:text-white dark:ring-zinc-600 dark:focus:ring-indigo-400 sm:text-sm sm:leading-6"
                    required
                  />
                  <span className="inline-flex select-none items-center rounded-r-md border border-l-0 border-zinc-300 px-3 text-zinc-500 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-400 sm:text-sm">
                    años
                  </span>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="sex"
                  className="block text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Sexo
                </label>
                <div className="mt-2 space-y-3">
                  <div className="flex items-center gap-x-3">
                    <input
                      id="sex-male"
                      name="sex"
                      type="radio"
                      value={0}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="sex-male"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Masculino
                    </label>
                  </div>
                  <div className="flex items-center gap-x-3">
                    <input
                      id="sex-female"
                      name="sex"
                      type="radio"
                      value={1}
                      required
                      className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-700 dark:text-indigo-400 dark:focus:ring-indigo-400 dark:focus:ring-offset-zinc-900"
                    />
                    <label
                      htmlFor="sex-female"
                      className="block text-sm font-medium leading-6 text-zinc-900 dark:text-white"
                    >
                      Femenino
                    </label>
                  </div>
                </div>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="cover-photo"
                  className="block text-base font-semibold leading-6 text-zinc-900 dark:text-white"
                >
                  Vídeo
                </label>
                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-zinc-900/25 px-6 py-10 dark:border-zinc-100/25">
                  <div className="text-center">
                    <VideoCameraIcon
                      className="dark:text-zinc-7500 mx-auto h-12 w-12 text-zinc-500"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                      <label
                        htmlFor="hand-video-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500 dark:bg-zinc-900 dark:text-indigo-400 dark:focus-within:ring-indigo-400"
                      >
                        <span>Suba un archivo</span>
                        <input
                          id="hand-video-upload"
                          name="video"
                          type="file"
                          className="sr-only"
                          required
                        />
                      </label>
                      <p className="pl-1">o arrastre y suelte</p>
                    </div>
                    <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
                      MP4, MOV, AVI hasta 100MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Obtener predicción
          </button>
        </div>
      </form>

      <footer>
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a
              key="GitHub"
              href="https://github.com/cataand/tfg"
              target="_blank"
              className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span className="sr-only">GitHub</span>
              <FontAwesomeIcon
                icon={faGithub}
                className="h-6 w-6"
                aria-hidden="true"
              />
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              &copy; 2023 Catalin Andrei, Cacuci
            </p>
          </div>
        </div>
      </footer>
    </div>
  </>
);

export default Home;
