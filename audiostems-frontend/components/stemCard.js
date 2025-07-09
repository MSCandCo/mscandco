import { resourceUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useContext, useEffect, useRef, useState } from "react";
import { HiPlay, HiDownload } from "lucide-react";
import { PlayerContext, normalizeStemForPlayer } from "./player";
import { LucidePause, LucidePlay } from "lucide-react";
import { Tooltip, Button, Spinner } from "flowbite-react";
import WaveSurferConstructor from "wavesurfer.js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import axios from "axios";
import { saveAs } from "file-saver";

function StemCard({ stem }) {
  if (!stem || !stem.attributes) return null;
  const playerContext = useContext(PlayerContext);
  const { data: session } = useSession();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);

  const waveSurfer = useRef();
  const waveSurferEl = useRef();
  const [duration, setDuration] = React.useState("0:00");

  useEffect(() => {
    if (typeof window === 'undefined') return;
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

    if (stem.attributes?.fullPreview?.data?.attributes?.url) {
      waveSurfer.current.load(
        resourceUrl(stem.attributes?.fullPreview?.data?.attributes?.url),
        stem.attributes.fullPreviewPeaks?.data
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
  }, [stem]);
  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const downloadStem = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    setDownloading(true);
    try {
      const { data: stemFile, headers } = await axios.get(
        `/api/req/stem/download/${stem.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.jwt}`,
          },
          responseType: "blob",
        }
      );
      const fileName = headers["content-disposition"].split('"')[1];
      saveAs(stemFile, fileName);
    } catch (error) {
      console.error("Download failed:", error);
      // Handle error (show notification, etc.)
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="w-full flex gap-3 items-center hover:bg-gray-200 p-4 transition">
      <div className="w-1/3 shrink-0 ">
        <div className="flex gap-3 items-center">
          <Link href={`/stems/${stem.id}`} className="shrink-0">
            {stem.attributes.cover?.data?.attributes?.url && (
              <Image
                height={50}
                width={50}
                className="rounded-sm"
                src={resourceUrl(stem.attributes.cover.data.attributes.url)}
                alt={stem.attributes.title}
              />
            )}
          </Link>

          <div className="truncate">
            <Link href={`/stems/${stem.id}`}>
              <p className="font-semibold truncate">{stem.attributes.title}</p>
            </Link>
            <p className="text-gray-500 truncate">
              {stem.attributes.artists?.data
                ? stem.attributes.artists.data
                    .map((s) => s.attributes.name)
                    .join(" & ")
                : ""}
            </p>
          </div>
        </div>
      </div>
      <div className="w-1/3 flex items-center gap-3">
        <button
          className="shrink-0 h-[50px] w-[50px] transition rounded-full border border-gray-50 hover:border-gray-500 flex items-center justify-center"
          onClick={() =>
            playerContext.playOrPause(normalizeStemForPlayer(stem))
          }
        >
          {playerContext.isPlaying && playerContext.song?.id === stem.id ? (
            <LucidePause className="h-5 w-5 text-gray-600 stroke-[1.5]" />
          ) : (
            <LucidePlay className="h-5 w-5 text-gray-600 stroke-[1.5] ml-[3.33px]" />
          )}
        </button>
        <div ref={waveSurferEl} className="flex-1 shrink-0" />
        <p className="text-gray-500">{duration}</p>
        <Button
          size="sm"
          color="gray"
          onClick={downloadStem}
          disabled={downloading}
        >
          {downloading ? (
            <Spinner size="sm" className="mr-2" />
          ) : (
            <HiDownload className="h-4 w-4 mr-2" />
          )}
          Download
        </Button>
      </div>
    </div>
  );
}

export default StemCard;
