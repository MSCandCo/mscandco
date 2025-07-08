import React, { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import classNames from "classnames";
import useSWR from "swr";
import { HiCheck, HiMinus, HiPlus } from "lucide-react";
import { X } from "lucide-react";
import { apiRoute } from "@/lib/utils";
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";

const bpmPresets = [
  { label: "Slow", value: [0, 64] },
  { label: "Med-Slow", value: [65, 84] },
  { label: "Medium", value: [85, 115] },
  { label: "Med-Fast", value: [116, 134] },
  { label: "Fast", value: [135, 165] },
];

const generalKeys = [
  "A",
  "Ab",
  "B",
  "Bb",
  "C",
  "D",
  "Db",
  "E",
  "Eb",
  "F",
  "F#",
  "G",
];
const majorKeysOptions = [...generalKeys, "All Major"];
const minorKeysOptions = [...generalKeys, "All Minor"];

function Filters({ openFilter, setOpenFilter }) {
  const isMobile = useMediaQuery({ query: "(max-width: 769px)" });

  useEffect(() => {
    if (isMobile && !openFilter) {
      setOpenFilter("genres");
    }
  }, [isMobile]);

  return (
    <ul className="text-center mx-2 space-y-2">
      <p className="text-xs font-semibold uppercase !mb-4">Basic</p>
      <Filter
        filter={{ label: "Genre", key: "genres" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
      <Filter
        filter={{ label: "Artist", key: "artists" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
      <p className="text-xs font-semibold uppercase !my-4">Advanced</p>
      <Filter
        filter={{ label: "BPM", key: "bpm" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
      <Filter
        filter={{ label: "Song length", key: "length" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
      <Filter
        filter={{ label: "Vocals", key: "vocals" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
      <Filter
        filter={{ label: "Key", key: "key" }}
        isMobile={isMobile}
        openFilter={openFilter}
        setOpenFilter={setOpenFilter}
      />
    </ul>
  );
}

export const useFilters = () => {
  const { data: { data: artists } = {} } = useSWR(apiRoute(`/artists`));
  const { data: { data: genres } = {} } = useSWR(apiRoute(`/genres`));

  const [openFilter, setOpenFilter] = useState();
  const [filtersSlideOut, setFiltersSlideOut] = useState(false);

  const [filterArtists, setFilterArtists] = useState([]);
  const [filterGenres, setFilterGenres] = useState([]);
  const [bpm, setBpm] = useState([0, 165]);
  const [length, setLength] = useState([0, 0]);
  const [lengthLimits, setLengthLimits] = useState([0, 0]);
  const [vocalsFilter, setVocalsFilter] = useState([
    { label: "Ambient" },
    { label: "Choir" },
    { label: "Duet" },
    { label: "Female" },
    { label: "Group" },
    { label: "Harmony" },
    { label: "Male" },
    { label: "Oohs & Ahhs" },
    { label: "Shouts" },
  ]);
  const [keyFilter, setKeyFilter] = useState({ major: [], minor: [] });

  useEffect(() => {
    if (artists) {
      setFilterArtists([...artists]);
    }
  }, [artists]);

  useEffect(() => {
    if (genres) {
      setFilterGenres([...genres]);
    }
  }, [genres]);

  return {
    renderFilters: () => (
      <Filters openFilter={openFilter} setOpenFilter={setOpenFilter} />
    ),
    renderActiveFilter: () => (
      <ActiveFilter
        openFilter={openFilter}
        filterArtists={filterArtists}
        setFilterArtists={setFilterArtists}
        filterGenres={filterGenres}
        setFilterGenres={setFilterGenres}
        bpm={bpm}
        setBpm={setBpm}
        lengthLimits={lengthLimits}
        length={length}
        setLength={setLength}
        vocalsFilter={vocalsFilter}
        setVocalsFilter={setVocalsFilter}
        keyFilter={keyFilter}
        setKeyFilter={setKeyFilter}
      />
    ),
    openFilter,
    setOpenFilter,
    filterArtists,
    setFilterArtists,
    filterGenres,
    setFilterGenres,
    bpm,
    setBpm,
    lengthLimits,
    setLengthLimits,
    length,
    setLength,
    vocalsFilter,
    setVocalsFilter,
    keyFilter,
    setKeyFilter,
    filtersSlideOut,
    setFiltersSlideOut,
  };
};

const Filter = ({
  filter: { label, key },
  openFilter,
  setOpenFilter,
  isMobile,
}) => {
  const isOpen = openFilter === key;
  return (
    <button
      className={classNames(
        "text-left w-full py-3 px-2 text-xs rounded flex justify-between items-center",
        isOpen ? "bg-black bg-opacity-10" : "hover:bg-black hover:bg-opacity-5"
      )}
      onClick={() => setOpenFilter(isOpen && !isMobile ? null : key)}
    >
      {label}
      {isOpen ? <HiMinus strokeWidth={1.25} /> : <HiPlus strokeWidth={1.25} />}
    </button>
  );
};

const CheckButtons = ({ filter, i, onExclude }) => {
  return (
    <div className="flex items-center gap-4">
      <HiCheck
        strokeWidth={2}
        className={classNames(
          "h-5 w-5 rounded-full",
          filter === "include"
            ? "bg-gray-700 text-white p-1"
            : "text-gray-300 p-0.5"
        )}
      />
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onExclude(i);
        }}
      >
        <X
          strokeWidth={2}
          className={classNames(
            "h-5 w-5 rounded-full",
            filter === "exclude"
              ? "bg-gray-700 text-white p-1"
              : "text-gray-300 p-0.5"
          )}
        />
      </button>
    </div>
  );
};

const SmallButton = ({ className, ...props }) => (
  <button
    className={classNames(
      "py-0.5 px-2 border text-[10px] font-semibold border-gray-200",
      className
    )}
    {...props}
  />
);

export const minsFormatted = (mins) => {
  const secs = (mins * 60) % 60;
  return `${parseInt(mins)}:${secs ? secs : "00"}`;
};

const ActiveFilter = ({
  openFilter,
  filterArtists,
  setFilterArtists,
  filterGenres,
  setFilterGenres,
  bpm,
  setBpm,
  lengthLimits,
  length,
  setLength,
  vocalsFilter,
  setVocalsFilter,
  keyFilter,
  setKeyFilter,
}) => {
  return (
    <>
      {openFilter === "artists" &&
        filterArtists?.map((artist, i) => (
          <button
            className="w-full text-left p-2 flex justify-between items-center"
            onClick={() => {
              filterArtists[i].filter =
                filterArtists[i].filter === "include" ? null : "include";
              setFilterArtists([...filterArtists]);
            }}
          >
            {artist.attributes.name}
            <CheckButtons
              filter={artist.filter}
              onExclude={() => {
                filterArtists[i].filter =
                  filterArtists[i].filter === "exclude" ? null : "exclude";
                setFilterArtists([...filterArtists]);
              }}
            />
          </button>
        ))}
      {openFilter === "genres" &&
        filterGenres?.map((genre, i) => (
          <button
            className="w-full text-left p-2 flex justify-between items-center"
            onClick={() => {
              filterGenres[i].filter =
                filterGenres[i].filter === "include" ? null : "include";
              setFilterGenres([...filterGenres]);
            }}
          >
            {genre.attributes.title}
            <CheckButtons
              filter={genre.filter}
              onExclude={() => {
                filterGenres[i].filter =
                  filterGenres[i].filter === "exclude" ? null : "exclude";
                setFilterGenres([...filterGenres]);
              }}
            />
          </button>
        ))}

      {openFilter === "vocals" &&
        vocalsFilter?.map((vocal, i) => (
          <button
            className="w-full text-left p-2 flex justify-between items-center"
            onClick={() => {
              vocalsFilter[i].filter =
                vocalsFilter[i].filter === "include" ? null : "include";
              setVocalsFilter([...vocalsFilter]);
            }}
          >
            {vocal.label}
            <CheckButtons
              filter={vocal.filter}
              onExclude={() => {
                vocalsFilter[i].filter =
                  vocalsFilter[i].filter === "exclude" ? null : "exclude";
                setVocalsFilter([...vocalsFilter]);
              }}
            />
          </button>
        ))}
      {openFilter === "bpm" && (
        <div className="my-4 space-y-4">
          <RangeSlider
            max={165}
            step={5}
            value={bpm}
            onInput={(v) => setBpm(v)}
          />
          <p className="text-center font-bold">
            {bpm[0]} - {bpm[1]}
          </p>
          <div className="flex gap-2 flex-wrap justify-center">
            {bpmPresets.map((p) => (
              <SmallButton onClick={() => setBpm(p.value)}>
                {p.label}
              </SmallButton>
            ))}
          </div>
        </div>
      )}
      {openFilter === "length" && (
        <div className="my-4 space-y-4">
          <RangeSlider
            min={lengthLimits[0]}
            max={lengthLimits[1]}
            step={0.25}
            value={length}
            onInput={(v) => setLength(v)}
          />
          <p className="text-center font-bold">
            {minsFormatted(length[0])} - {minsFormatted(length[1])}
          </p>
        </div>
      )}

      {openFilter === "key" && (
        <div className="my-4 space-y-6">
          <div>
            <h4 className="text-xs font-semibold mb-2 uppercase">Major</h4>
            <div className="flex gap-2 flex-wrap">
              {majorKeysOptions.map((k) => (
                <SmallButton
                  className={
                    keyFilter.major.includes(k) && "!bg-gray-700 !text-white"
                  }
                  onClick={() => {
                    if (k === "All Major") {
                      // if 'all major', just select that one
                      if (keyFilter.major.includes(k)) {
                        keyFilter.major = [];
                      } else {
                        keyFilter.major = [k];
                      }
                    } else {
                      // remove 'all major'
                      keyFilter.major = keyFilter.major.filter(
                        (_k) => _k !== "All Major"
                      );

                      const found = keyFilter.major.find((_k) => _k === k);
                      // toggle
                      if (found) {
                        keyFilter.major = keyFilter.major.filter(
                          (_k) => _k !== k
                        );
                      } else {
                        keyFilter.major.push(k);
                      }
                    }
                    setKeyFilter({ ...keyFilter });
                  }}
                >
                  {k}
                </SmallButton>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold mb-2 uppercase">Minor</h4>
            <div className="flex gap-2 flex-wrap">
              {minorKeysOptions.map((k) => (
                <SmallButton
                  className={
                    keyFilter.minor.includes(k) && "!bg-gray-700 !text-white"
                  }
                  onClick={() => {
                    if (k === "All Minor") {
                      // if 'all minor', just select that one
                      if (keyFilter.minor.includes(k)) {
                        keyFilter.minor = [];
                      } else {
                        keyFilter.minor = [k];
                      }
                    } else {
                      // remove 'all minor'
                      keyFilter.minor = keyFilter.minor.filter(
                        (_k) => _k !== "All Minor"
                      );

                      const found = keyFilter.minor.find((_k) => _k === k);
                      // toggle
                      if (found) {
                        keyFilter.minor = keyFilter.minor.filter(
                          (_k) => _k !== k
                        );
                      } else {
                        keyFilter.minor.push(k);
                      }
                    }
                    setKeyFilter({ ...keyFilter });
                  }}
                >
                  {k}
                </SmallButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Filters;
