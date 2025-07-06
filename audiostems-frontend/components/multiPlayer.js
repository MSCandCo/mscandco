import WaveSurferMultiConstructor from "wavesurfer-multitrack";
import { apiRoute, cn, resourceUrl } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  HiOutlineEllipsisHorizontalCircle,
  HiOutlinePlayCircle,
  HiOutlineStopCircle,
} from "react-icons/hi2";

import { AudioLines, Volume, Volume2, VolumeX } from "lucide-react";
import NextImage from "next/image";
import { Slider } from "./ui/slider";
import Container from "./container";
import classNames from "classnames";
import axios from "axios";
import { ScaleLoader } from "react-spinners";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const MultiPlayer = ({ stem }) => {
  const [tracks, setTracks] = useState([]);
  const [tracksOptions, setTracksOptions] = useState([]);

  useEffect(() => {
    const newTracks = stem.attributes.tracks.map((t) => {
      return {
        ...t,
        peaks: t.sourcePeaks,
        url: resourceUrl(t.source.data.attributes.url),

        options: {
          barWidth: 2,
          barRadius: 1,
          responsive: true,
          height: 40,
          normalize: true,
          partialRender: true,
          hideScrollbar: true,
        },
      };
    });
    setTracksOptions(newTracks.map((t) => ({ volume: 1 })));
    setTracks(newTracks);
  }, [stem]);

  const waveSurfer = useRef();
  const waveSurferEl = useRef();
  const [playing, setPlaying] = useState(false);
  const [soloIndex, setSoloIndex] = useState(-1);
  const [readyToPlay, setReadyToPlay] = useState(false);

  useEffect(() => {
    if (!tracks.length) return;
    waveSurfer.current = WaveSurferMultiConstructor.create([...tracks], {
      container: waveSurferEl.current,
    });

    waveSurfer.current.once("canplay", () => {
      console.log("ready to play!");
      setReadyToPlay(true);
    });
    return () => {
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
      }
    };
  }, [tracks]);

  const ws = waveSurfer.current;

  useEffect(() => {
    if (readyToPlay) {
      waveSurfer.current.wavesurfers.forEach((wsSingle) => {
        wsSingle.once("ready", () => {
          const src = wsSingle.getSrc();
          const peaks = wsSingle.exportPeaks();

          const track = stem.attributes.tracks.find(
            (t) => t.source.data.attributes.url === src
          );
          // store peaks
          if (!track.sourcePeaks) {
            axios.post(apiRoute("/save-peaks"), {
              track: track.id,
              stem: stem.id,
              peaks: peaks,
            });
          }
          console.log(src, peaks);
        });
      });
    }
  }, [readyToPlay]);

  const playToggle = () => {
    if (playing) {
      ws && ws.pause();
      setPlaying(false);
    } else {
      ws && ws.play();
      setPlaying(true);
    }
  };

  return (
    <div>
      <div
        className="h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: stem.attributes.cover.data.attributes.url
            ? `url(${resourceUrl(stem.attributes.cover.data.attributes.url)})`
            : "bg-gray-800",
        }}
      >
        <div className="h-full backdrop-blur-md">
          <Container className="!max-w-5xl h-full py-12 flex items-center gap-12">
            <div className="w-[288px]">
              <NextImage
                src={resourceUrl(stem.attributes.image.data.attributes.url)}
                width={500}
                height={500}
                className="rounded-md shadow"
              />
            </div>
            <div className="w-3/4 text-white">
              <h1 className="text-4xl font-bold">{stem.attributes.title}</h1>
              {stem.attributes.artists.data.length ? (
                <h2 className="mt-2 leading-none text-lg font-medium">
                  {stem.attributes.artists.data
                    .map((a) => a.attributes.name)
                    .join(", ")}
                </h2>
              ) : null}

              <div className="mt-6 flex items-center gap-2">
                <button onClick={playToggle} disabled={!readyToPlay}>
                  {playing ? (
                    <HiOutlineStopCircle className="h-12 w-12" />
                  ) : (
                    <HiOutlinePlayCircle className="h-12 w-12" />
                  )}
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div>
                      <HiOutlineEllipsisHorizontalCircle className="h-12 w-12" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>Download MP3</DropdownMenuItem>
                    <DropdownMenuItem>Download WAV</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {stem.attributes.key && (
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-800 p-1">
                    <dt className="px-2 bg-gray-200 text-gray-600">Key</dt>
                    <dd className="px-2 font-medium">{stem.attributes.key}</dd>
                  </div>
                )}

                {stem.attributes.bpm && (
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-800 p-1">
                    <dt className="px-2 bg-gray-200 text-gray-600">BPM</dt>
                    <dd className="px-2 font-medium">{stem.attributes.bpm}</dd>
                  </div>
                )}

                {stem.attributes.vocals && (
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-800 p-1">
                    <dt className="px-2 bg-gray-200 text-gray-600">Vocals</dt>
                    <dd className="px-2 font-medium">
                      {stem.attributes.vocals}
                    </dd>
                  </div>
                )}

                {stem.attributes.length && (
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-800 p-1">
                    <dt className="px-2 bg-gray-200 text-gray-600">Length</dt>
                    <dd className="px-2 font-medium">
                      {formatTime(stem.attributes.length)}
                    </dd>
                  </div>
                )}
                {stem.attributes.genres.data.length ? (
                  <div className="flex items-center gap-1 bg-gray-50 text-gray-800 p-1">
                    <dt className="px-2 bg-gray-200 text-gray-600">Genre</dt>
                    <dd className="px-2 font-medium">
                      {stem.attributes.genres.data
                        .map((g) => g.attributes.title)
                        .join(", ")}
                    </dd>
                  </div>
                ) : null}
              </div>
            </div>
          </Container>
        </div>
      </div>

      <div className="relative w-full max-w-5xl mx-auto flex bg-white -mt-6 backdrop-blur-0 rounded-md p-6 shadow">
        {!readyToPlay && (
          <div className="absolute inset-0 bg-black/10 z-10 flex justify-center pt-20 rounded-md">
            <ScaleLoader />
          </div>
        )}
        <div className="w-36">
          {tracks.map((t, i) => (
            <div key={t.id} className="h-[64px] p-3 odd:bg-gray-50">
              <p className="text-sm mb-2">
                {t.name || t.source.data.attributes.name.replace(/\..+/, "")}
              </p>

              <Slider
                max={1}
                step={0.1}
                value={[tracksOptions[i].volume]}
                onValueChange={(v) => {
                  if (!ws || !ws.wavesurfers[i]) return;

                  ws.wavesurfers[i].setVolume(v);
                  tracksOptions[i].volume = v;
                  setTracksOptions([...tracksOptions]);
                }}
              />
            </div>
          ))}
        </div>
        <div ref={waveSurferEl} className="as-multiplayer flex-1" />
        <div>
          {tracks.map((t, i) => (
            <div key={t.id} className="h-[64px] p-3 odd:bg-gray-50 flex gap-2">
              <button
                className={cn(
                  "p-2 rounded-full",
                  soloIndex !== i ? "text-gray-500" : "text-white bg-gray-500"
                )}
                onClick={() => {
                  if (!ws || !ws.wavesurfers[i]) return;

                  if (soloIndex === i) {
                    ws.wavesurfers.forEach((_ws, _i) => {
                      // last one is not real
                      if (!tracksOptions[_i]) return;
                      _ws.setVolume(1);
                      tracksOptions[_i].volume = 1;
                    });
                    setTracksOptions([...tracksOptions]);
                    setSoloIndex(-1);
                    return;
                  }

                  ws.wavesurfers.forEach((_ws, _i) => {
                    // last one is not real
                    if (!tracksOptions[_i]) return;
                    _ws.setVolume(0);
                    tracksOptions[_i].volume = 0;
                  });

                  ws.wavesurfers[i].setVolume(1);
                  tracksOptions[i].volume = 1;

                  setTracksOptions([...tracksOptions]);
                  setSoloIndex(i);
                }}
              >
                <AudioLines className="h-6 w-6" />
              </button>
              <button
                className={cn(
                  "p-2 rounded-full",
                  tracksOptions[i].volume > 0
                    ? "text-gray-500"
                    : "text-white bg-gray-500"
                )}
                onClick={() => {
                  if (!ws || !ws.wavesurfers[i]) return;
                  const vol = ws.wavesurfers[i].getVolume();

                  if (vol > 0) {
                    // mute it
                    tracksOptions[i].volume = 0;
                    ws.wavesurfers[i].setVolume(0);
                  } else {
                    tracksOptions[i].volume = 1;
                    ws.wavesurfers[i].setVolume(1);
                  }

                  setTracksOptions([...tracksOptions]);
                }}
              >
                <VolumeX className="h-6 w-6" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="py-16"></div>
    </div>
  );
};
