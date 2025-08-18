import WaveSurferConstructor from "wavesurfer.js";
import { apiRoute, resourceUrl } from "@/lib/utils";
import { Dialog, Menu, Transition } from "@headlessui/react";
import axios from "axios";
import { Button } from "flowbite-react";
import { useUser } from '@/components/providers/SupabaseProvider';
import { useRouter } from "next/router";
import { saveAs } from "file-saver";
import React, {
  Fragment,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  HiArrowDownTray,
  HiEllipsisHorizontal,
  HiOutlinePlay,
  HiPlay,
  HiStop,
} from "lucide-react";
import { cloneDeep } from "lodash";

export const PlayerContext = createContext({
  playSong: () => {},
  playOrPause: () => {},
  waveSurfer: null,
  song: null,
  isPlaying: false,
});

export const usePlayer = () => {
  const player = useContext(PlayerContext);
  return { player };
};

export const normalizeStemForPlayer = (stem) => {
  const newStem = cloneDeep(stem);
  newStem.attributes.mediaPreview = newStem.attributes.fullPreview;
  newStem.attributes.singers = newStem.attributes.artists;
  return newStem;
};

function Player({ children }) {
  const waveSurfer = useRef(null);
  const waveSurferEl = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState();
  const [song, setSong] = useState(false);
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!waveSurferEl.current) return;

    if (waveSurfer.current) {
      waveSurfer.current.destroy();
    }

    waveSurfer.current = WaveSurferConstructor.create({
      container: waveSurferEl.current,
      backend: "MediaElement",
      barWidth: 2,
      barRadius: 1,
      responsive: true,
      height: 22,
      normalize: true,
      partialRender: true,
      hideScrollbar: true,
    });
    const onReady = () => {
      waveSurfer.current.play();
      setPlaying(true);
    };
    if (song) {
      waveSurfer.current.on("ready", onReady);
      waveSurfer.current.load(
        resourceUrl(song.attributes.mediaPreview.data.attributes.url),
        song.attributes.mediaPreviewPeaks?.data
      );
    }
    return () => {
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
      }
    };
  }, [song]);

  const downloadSong = async () => {
    if (user) {
      try {
        const { data: songFile, headers } = await axios.get(
          apiRoute(`/song/download/${song.id}`),
          {
            headers: {
              Authorization: `Bearer ${user?.sub}`,
            },
            responseType: "blob",
          }
        );
        const fileName = headers["content-disposition"].split('"')[1];
        saveAs(songFile, fileName);
      } catch (e) {
        const response = JSON.parse((await e?.response?.data?.text()) || "");
        if (response && response.error === "no-credit") {
          setError({
            title: "You don't have enough credit!",
            description:
              "Your account doesn't have enough credit to download this item. Please visit pricing page to upgrade to get more credit.",
          });
        }
      }
    } else {
      router.push("/login");
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        playSong: (song) => {
          setSong({ ...song });
        },
        isPlaying: playing,
        playOrPause: (_song) => {
          if (song) {
            // song is set
            if (song.id === _song.id) {
              // the same song
              if (playing) {
                waveSurfer.current.pause();
                setPlaying(false);
              } else {
                waveSurfer.current.play();
                setPlaying(true);
              }
            } else {
              // not the same song
              setSong({ ..._song });
              // it will automatically play it
            }
          } else {
            // song not set
            setSong({ ..._song });
          }
        },
        waveSurfer: waveSurfer.current,
        song,
      }}
    >
      {children}
      {song && (
        <div className="fixed md:h-[72px] bottom-0 inset-x-0 p-2.5 border-t border-gray-200 bg-white">
          <div className="h-full flex flex-col-reverse md:flex-row justify-center items-center gap-2 md:gap-4">
            <div className="h-full shrink-0 w-full md:w-4/12 lg:w-3/12 flex items-center justify-between">
              <div className="h-full flex items-center gap-4">
                <img
                  src={resourceUrl(song.attributes.cover.data.attributes.url)}
                  className="max-h-[40px] md:max-h-full"
                />
                <div>
                  <h4>{song.attributes.title}</h4>
                  <p className="text-xs text-gray-500">
                    {song.attributes.singers.data
                      .map((s) => s.attributes.name)
                      .join(" & ")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <HiOutlinePlay className="rotate-180 h-5 w-5" />
                <button
                  onClick={() => {
                    setPlaying(!playing);
                    waveSurfer.current.playPause();
                  }}
                >
                  {playing ? (
                    <HiStop className="h-6 w-6" />
                  ) : (
                    <HiPlay className="h-6 w-6" />
                  )}
                </button>
                <HiOutlinePlay className="h-5 w-5" />
              </div>
              <div className="block md:hidden">
                <SongOptions downloadSong={downloadSong} />
              </div>
            </div>
            <div className="w-full">
              <div ref={waveSurferEl} id="audio-player" className="w-full" />
            </div>
            <div className="hidden md:block md:pr-4 lg:pl-4 lg:pr-16">
              <Button
                size="sm"
                outline
                gradientDuoTone="purpleToPink"
                onClick={downloadSong}
              >
                Download
              </Button>
            </div>
          </div>
        </div>
      )}
      <ErrorModal error={error} onClose={() => setError(null)} />
    </PlayerContext.Provider>
  );
}

export default Player;

const SongOptions = ({ downloadSong }) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full justify-center rounded-md hover:bg-black hover:bg-opacity-10 px-4 py-1 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75">
          <HiEllipsisHorizontal className="h-6 w-6" />
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        show={true}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-20 mb-1 bottom-full right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1 ">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={downloadSong}
                  className={`${
                    active ? "bg-violet-500 text-white" : "text-gray-900"
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  <HiArrowDownTray
                    className="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Download
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const ErrorModal = ({ error, onClose }) => {
  return (
    <Transition appear show={!!error} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {error?.title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">{error?.description}</p>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Got it, thanks!
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
