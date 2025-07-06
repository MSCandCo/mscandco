import Header from "@/components/header";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  HiAdjustmentsHorizontal,
  HiMagnifyingGlass,
  HiXMark,
} from "react-icons/hi2";
import { apiRoute } from "@/lib/utils";
import classNames from "classnames";
import qs from "qs";
import { DataLoader } from "./playlists";
import { useMediaQuery } from "react-responsive";
import { Badge, Button, Select } from "flowbite-react";
import SEO from "@/components/seo";
import { isEqual, max, min } from "lodash";
import { minsFormatted, useFilters } from "@/components/filters";
import StemCard from "@/components/stemCard";

function SongsPage() {
  const {
    openFilter,
    setOpenFilter,
    renderFilters,
    renderActiveFilter,
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
  } = useFilters();
  const isMobile = useMediaQuery({ query: "(max-width: 769px)" });

  const checkedArtists = useMemo(
    () => filterArtists.filter((a) => a.filter),
    [filterArtists]
  );
  const checkedGenres = useMemo(
    () => filterGenres.filter((a) => a.filter),
    [filterGenres]
  );
  const checkedVocals = useMemo(
    () => vocalsFilter.filter((a) => a.filter),
    [vocalsFilter]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState({
    sort: "createdAt:desc",
    fields: ["title"],
    populate: { cover: "*", artists: "*", fullPreview: "*" },
    filters: {
      $or: [
        {
          title: {
            $containsi: "",
          },
        },
        {
          artists: {
            name: {
              $containsi: "",
            },
          },
        },
      ],
      artists: {
        id: {
          $in: [],
          $notIn: [],
        },
      },
      genres: {
        id: {
          $in: [],
          $notIn: [],
        },
      },
      vocals: {
        $contains: [],
        $notContains: [],
      },
      length: {},
      majorKeys: {
        $contains: [],
      },
      minorKeys: {
        $contains: [],
      },
      bpm: {},
    },
  });

  const formatKeyFilterForAPI = (selected = []) => {
    if (selected.find((key) => key.startsWith("All"))) {
      return [...generalKeys];
    }
    return selected;
  };

  useEffect(() => {
    const id = setTimeout(() => {
      setFilterQuery((query) => {
        if (!isEqual(bpm, [0, 165])) {
          query.filters.bpm.$gte = bpm[0];
          query.filters.bpm.$lte = bpm[1];
        } else {
          query.filters.bpm = {};
        }

        if (keyFilter.major.length) {
          query.filters.majorKeys.$contains = formatKeyFilterForAPI(
            keyFilter.major
          );
        } else {
          query.filters.majorKeys.$contains = [];
        }

        if (keyFilter.minor.length) {
          query.filters.minorKeys.$contains = formatKeyFilterForAPI(
            keyFilter.minor
          );
        } else {
          query.filters.minorKeys.$contains = [];
        }

        // lengthLimits checks to prevent one extra call at the start (with calculated limits)
        // or we could say, when both extremes are selected, just remove the filter
        if (
          length[0] &&
          length[1] &&
          (length[0] !== lengthLimits[0] || length[1] !== lengthLimits[1])
        ) {
          query.filters.length.$gte = length[0] * 60;
          query.filters.length.$lte = length[1] * 60;
        } else {
          query.filters.length = {};
        }
        if (checkedArtists.length) {
          query.filters.artists.id.$in = checkedArtists
            .filter((a) => a.filter === "include")
            .map((a) => a.id);
          query.filters.artists.id.$notIn = checkedArtists
            .filter((a) => a.filter === "exclude")
            .map((a) => a.id);
        } else {
          query.filters.artists.id.$in = [];
          query.filters.artists.id.$notIn = [];
        }

        if (checkedGenres.length) {
          query.filters.genres.id.$in = checkedGenres
            .filter((a) => a.filter === "include")
            .map((a) => a.id);
          query.filters.genres.id.$notIn = checkedGenres
            .filter((a) => a.filter === "exclude")
            .map((a) => a.id);
        } else {
          query.filters.genres.id.$in = [];
          query.filters.genres.id.$notIn = [];
        }

        if (vocalsFilter.some((a) => Boolean(a.filter))) {
          query.filters.vocals.$contains = vocalsFilter
            .filter((a) => a.filter === "include")
            .map((a) => a.label);
          query.filters.vocals.$notContains = vocalsFilter
            .filter((a) => a.filter === "exclude")
            .map((a) => a.label);
        } else {
          query.filters.vocals.$contains = [];
          query.filters.vocals.$notContains = [];
        }

        query.filters.$or[0].title.$containsi = searchQuery;
        query.filters.$or[1].artists.name.$containsi = searchQuery;
        return { ...query };
      });
    }, 750);
    return () => clearTimeout(id);
  }, [
    checkedArtists,
    checkedGenres,
    searchQuery,
    length,
    lengthLimits,
    keyFilter,
    bpm,
    vocalsFilter,
  ]);

  const { data: { data: songs } = {}, isLoading } = useSWR(
    apiRoute(
      `/stems?${qs.stringify(filterQuery, {
        encodeValuesOnly: true,
      })}`
    )
  );

  useEffect(() => {
    // so it only runs at start (first api call)
    if (songs && lengthLimits[0] === 0 && lengthLimits[1] === 0) {
      const lengths = songs.map((s) => s.attributes.length / 60);
      const minLength = Math.floor(min(lengths));
      const maxLength = Math.ceil(max(lengths));
      setLengthLimits([minLength, maxLength]);
      setLength([minLength, maxLength]);
    }
  }, [songs]);

  const isLengthFilterSet = () => {
    return (
      !isEqual(length, [0, 0]) &&
      !isEqual(lengthLimits, [0, 0]) &&
      !isEqual(length, lengthLimits)
    );
  };

  const resetAllFilters = () => {
    setKeyFilter({ minor: [], major: [] });
    setVocalsFilter([
      ...vocalsFilter.map(({ filter, ...rest }) => ({ ...rest })),
    ]);
    setLength([...lengthLimits]);
    setBpm([0, 165]);
    setFilterArtists([
      ...filterArtists.map(({ filter, ...rest }) => ({ ...rest })),
    ]);
    setFilterGenres([
      ...filterGenres.map(({ filter, ...rest }) => ({ ...rest })),
    ]);
  };

  return (
    <div>
      <SEO pageTitle="Stems" />
      <div>
        <div className="py-2 px-3 md:px-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <HiMagnifyingGlass className="h-5 w-5" />
            <input
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
              className="flex-1 p-2 md:p-4 focus:outline-none"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="md:hidden py-2 px-3 border-b border-gray-200">
          <div className="flex justify-between">
            <button
              className="px-2"
              onClick={() => setFiltersSlideOut(!filtersSlideOut)}
            >
              <HiAdjustmentsHorizontal className="h-5 w-5" />
            </button>
            <Select
              sizing="sm"
              value={filterQuery.sort}
              onChange={(e) => {
                filterQuery.sort = e.target.value;
                setFilterQuery({ ...filterQuery });
              }}
            >
              <option value="createdAt:desc">Recent</option>
              <option value="title">Alphabetical</option>
            </Select>
          </div>
        </div>
        <div className="flex md:h-[calc(100vh_-_124px)]">
          <ResponsiveFilters
            smallScreen={isMobile}
            filtersSlideOut={filtersSlideOut}
            setFiltersSlideOut={setFiltersSlideOut}
          >
            <div className="w-40 py-4 border-r border-gray-200">
              {renderFilters()}
            </div>
            <div
              className={classNames(
                "transition-all border-r border-gray-200",
                openFilter ? "w-60" : "w-60 md:w-0"
              )}
            >
              <div className="p-4 divide-y divide-gray-200">
                {renderActiveFilter()}
              </div>
            </div>
          </ResponsiveFilters>
          <div className="transition-all flex-1 p-4 md:p-12 space-y-1">
            {checkedArtists.length ||
            checkedGenres.length ||
            checkedVocals.length ||
            !isEqual(bpm, [0, 165]) ||
            isLengthFilterSet() ||
            keyFilter.major.length ||
            keyFilter.minor.length ? (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center flex-wrap gap-2">
                  {checkedArtists?.map((a) => (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => {
                        setFilterArtists(
                          filterArtists.map((_a) => {
                            if (_a.id === a.id) {
                              _a.filter = null;
                            }
                            return _a;
                          })
                        );
                      }}
                    >
                      {a.filter === "exclude" && (
                        <span className="font-semibold mr-0.5">Exclude:</span>
                      )}
                      {a.attributes.name}
                    </Badge>
                  ))}
                  {checkedGenres?.map((a) => (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => {
                        setFilterGenres(
                          filterGenres.map((_a) => {
                            if (_a.id === a.id) {
                              _a.filter = null;
                            }
                            return _a;
                          })
                        );
                      }}
                    >
                      {a.filter === "exclude" && (
                        <span className="font-semibold mr-0.5">Exclude:</span>
                      )}
                      {a.attributes.title}
                    </Badge>
                  ))}
                  {checkedVocals?.map((a) => (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => {
                        setVocalsFilter(
                          vocalsFilter.map((_a) => {
                            if (_a.label === a.label) {
                              _a.filter = null;
                            }
                            return _a;
                          })
                        );
                      }}
                    >
                      {a.filter === "exclude" && (
                        <span className="font-semibold mr-0.5">Exclude:</span>
                      )}
                      {a.label}
                    </Badge>
                  ))}
                  {/* so default is not shown */}
                  {!isEqual(bpm, [0, 165]) && (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => setBpm([0, 165])}
                    >
                      <span className="font-semibold mr-1">BPM:</span>
                      {bpm[0]} - {bpm[1]}
                    </Badge>
                  )}
                  {isLengthFilterSet() && (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => setLength([...lengthLimits])}
                    >
                      <span className="font-semibold mr-1">Length:</span>
                      {minsFormatted(length[0])} - {minsFormatted(length[1])}
                    </Badge>
                  )}
                  {keyFilter.major?.map((k) => (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => {
                        setKeyFilter({
                          ...keyFilter,
                          major: keyFilter.major.filter((_k) => _k !== k),
                        });
                      }}
                    >
                      <span className="font-semibold mr-1">Major:</span>
                      {k}
                    </Badge>
                  ))}
                  {keyFilter.minor?.map((k) => (
                    <Badge
                      color="gray"
                      icon={HiXMark}
                      onClick={() => {
                        setKeyFilter({
                          ...keyFilter,
                          minor: keyFilter.minor.filter((_k) => _k !== k),
                        });
                      }}
                    >
                      <span className="font-semibold mr-1">Minor:</span>
                      {k}
                    </Badge>
                  ))}
                </div>
                <div className="shrink-0">
                  <Button
                    color="light"
                    size="sm"
                    pill
                    onClick={resetAllFilters}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            ) : null}
            {isLoading && <DataLoader />}
            <div className="flex flex-col gap-4 divide-y divide-gray-200">
              {songs?.map((stem, i) => (
                <div className={i !== 0 && "pt-4"}>
                  <StemCard stem={stem} />
                </div>
              ))}
            </div>
            {songs?.length === 0 && (
              <p className="text-center">Could not find any result.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongsPage;

const ResponsiveFilters = ({
  smallScreen,
  filtersSlideOut,
  setFiltersSlideOut,
  children,
}) => {
  if (smallScreen) {
    return (
      <div
        id="to-be-closed"
        className={classNames(
          "absolute bottom-0 w-full h-[calc(100vh_-_166px)] bg-black bg-opacity-5 shadow z-20 transition-all",
          filtersSlideOut ? "left-0" : "-left-full"
        )}
        onClick={(e) =>
          e.target.id === "to-be-closed" ? setFiltersSlideOut(false) : null
        }
      >
        <div className="h-full bg-white inline-flex">{children}</div>
      </div>
    );
  }
  return children;
};
