import Header from "@/components/header";
import { PlayerContext } from "@/components/player";
import SEO from "@/components/seo";
import WaveSurferConstructor from "wavesurfer.js";
import { apiRoute, resourceUrl } from "@/lib/utils";
import axios from "axios";
import { LucidePause, LucidePlay } from "lucide-react";
import moment from "moment";
import Image from "next/image";
import React, { useContext, useEffect, useRef } from "react";
import { HiArrowLeft, HiPlay, HiPlayCircle } from "lucide-react";
import { Tooltip } from "flowbite-react";

function SinglePlaylist({ playlist }) {
  return (
    <div>
      <SEO pageTitle={playlist.attributes.title} />
      <div className="md:h-[calc(100vh_-_127px)] w-full">
        <div className="flex flex-col md:flex-row h-full relative">
          <div className="w-full md:w-1/2 h-full relative">
            <div
              className="h-full bg-cover bg-no-repeat brightness-50 min-h-[50vh]"
              style={{
                backgroundImage: `url(${resourceUrl(
                  playlist.attributes.cover.data.attributes.url
                )})`,
              }}
            ></div>
            <div className="absolute left-[3%] bottom-1/2 text-white text-xs md:text-sm uppercase md:font-semibold -rotate-90 origin-top-left translate-y-[100px]">
              Updated {moment(playlist.attributes.updatedAt).from()}
            </div>
            <div className="absolute left-[10%] bottom-[10%] md:bottom-[15%] text-white p-2">
              <div className="p-6">
                <HiPlayCircle className="h-28 w-28" />
              </div>
              <h1 className="text-3xl md:text-6xl font-bold">
                {playlist.attributes.title}
              </h1>
              <p className="mt-4 max-w-lg md:text-base font-normal">
                {playlist.attributes.description}
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="px-6 md:px-12 py-8">
              <button className="flex items-center gap-1 group">
                <HiArrowLeft className="group-hover:scale-125 origin-right transition" />{" "}
                View playlists
              </button>
              <div className="mt-6 md:mt-12">
                <div className="flex flex-col">
                  {playlist.attributes.songs?.data?.map((s) => (
                    <Player song={s} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SinglePlaylist;

export const Player = ({ song }) => {
  const playerContext = useContext(PlayerContext);

  const waveSurfer = useRef();
  const waveSurferEl = useRef();
  const [duration, setDuration] = React.useState("0:00");

  useEffect(() => {
    if (waveSurfer.current) {
      waveSurfer.current.destroy();
    }

    waveSurfer.current = WaveSurferConstructor.create({
      container: waveSurferEl.current,
      backend: "MediaElement",
      barWidth: 2,
      barRadius: 1,
      height: 26,
      responsive: true,
      normalize: true,
      partialRender: true,
      hideScrollbar: true,
    });

    if (song.attributes?.mediaPreview?.data?.attributes?.url) {
      waveSurfer.current.load(
        resourceUrl(song.attributes?.mediaPreview?.data?.attributes?.url),
        song.attributes.mediaPreviewPeaks?.data
      );
      waveSurfer.current.on("ready", () => {
        const duration = waveSurfer.current.getDuration();
        setDuration(formatDuration(duration));
      });
    }

    return () => {
      if (waveSurfer.current) {
        waveSurfer.current.destroy();
      }
    };
  }, [song]);
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="w-full flex gap-3 items-center hover:bg-gray-200 p-4">
      <div className="w-1/3 shrink-0 ">
        <div className="flex gap-3 items-center">
          <button
            className="shrink-0 h-[50px] w-[50px] transition rounded-full border border-gray-50 hover:border-gray-500 flex items-center justify-center"
            onClick={() => playerContext.playOrPause(song)}
          >
            {playerContext.isPlaying && playerContext.song?.id === song.id ? (
              <LucidePause className="h-5 w-5 text-gray-600 stroke-[1.5]" />
            ) : (
              <LucidePlay className="h-5 w-5 text-gray-600 stroke-[1.5] ml-[3.33px]" />
            )}
          </button>
          <button
            className="shrink-0 h-[50px] w-[50px] relative group"
            onClick={() => playerContext.playSong(song)}
          >
            <Image
              height={50}
              width={50}
              className="rounded-sm"
              src={resourceUrl(song.attributes.cover.data.attributes.url)}
            />
            <div className="absolute z-10 inset-0 hidden group-hover:flex text-white items-center justify-center">
              <HiPlay className="h-8 w-8" />
            </div>
          </button>

          <div className="truncate">
            <Tooltip content={song.attributes.title} position="top">
              <p className="font-semibold truncate">{song.attributes.title}</p>
            </Tooltip>
            <p className="text-gray-500 truncate">
              {song.attributes.singers.data
                .map((s) => s.attributes.name)
                .join(" & ")}
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/3">
        <div ref={waveSurferEl} />
      </div>
      <div className="w-1/3">
        <p className="text-gray-500">{duration}</p>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { data } = await axios.get(apiRoute(`/playlists/${id}?populate=deep`));

  return {
    props: {
      playlist: data.data,
    },
  };
}
