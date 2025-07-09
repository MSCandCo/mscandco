import Container from "@/components/container";
import Header from "@/components/header";
import React, { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import {
  HiCheck,
  HiX,
} from "react-icons/hi";
import { apiRoute } from "@/lib/utils";
import classNames from "classnames";
import qs from "qs";
import { DataLoader } from "./playlists";
import { useMediaQuery } from "react-responsive";
import { Select } from "flowbite-react";
import SEO from "@/components/seo";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const verseTypeBadge = {
  Verse: "bg-orange-50 text-orange-600",
  Chorus: "bg-blue-50 text-blue-600",
  Outro: "bg-purple-50 text-purple-600",
  Bridge: "bg-red-50 text-red-600",
};

function LyricsPage() {
  const isMobile = useMediaQuery({ query: "(max-width: 769px)" });
  const { data: { data: artists } = {} } = useSWR(apiRoute(`/artists`));
  const { data: { data: genres } = {} } = useSWR(apiRoute(`/genres`));

  const [filtersSlideOut, setFiltersSlideOut] = useState(false);
  const [opened, setOpened] = useState(false);

  const [filterArtists, setFilterArtists] = useState([]);
  const [filterGenres, setFilterGenres] = useState([]);
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

  const checkedArtists = useMemo(
    () => filterArtists.filter((a) => a.filter),
    [filterArtists]
  );
  const checkedGenres = useMemo(
    () => filterGenres.filter((a) => a.filter),
    [filterGenres]
  );

  const [openFilter, setOpenFilter] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterQuery, setFilterQuery] = useState({
    sort: "createdAt:desc",
    filters: {
      $or: [
        {
          title: {
            $containsi: "",
          },
        },
        {
          writers: {
            name: {
              $containsi: "",
            },
          },
        },
      ],
      writers: {
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
    },
  });

  useEffect(() => {
    const id = setTimeout(() => {
      setFilterQuery((query) => {
        if (checkedArtists.length) {
          query.filters.writers.id.$in = checkedArtists
            .filter((a) => a.filter === "include")
            .map((a) => a.id);
          query.filters.writers.id.$notIn = checkedArtists
            .filter((a) => a.filter === "exclude")
            .map((a) => a.id);
        } else {
          query.filters.writers.id.$in = [];
          query.filters.writers.id.$notIn = [];
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

        query.filters.$or[0].title.$containsi = searchQuery;
        query.filters.$or[1].writers.name.$containsi = searchQuery;
        return { ...query };
      });
    }, 750);
    return () => clearTimeout(id);
  }, [checkedArtists, checkedGenres, searchQuery]);

  const { data: { data: lyrics } = {}, isLoading } = useSWR(
    apiRoute(
      `/lyrics?populate=deep&${qs.stringify(filterQuery, {
        encodeValuesOnly: true,
      })}`
    )
  );

  useEffect(() => {
    if (isMobile && !openFilter) {
      setOpenFilter("genres");
    }
  }, [isMobile]);

  useEffect(() => {
    setOpened(-1);
  }, [lyrics]);

  return (
    <div>
      <SEO pageTitle="Lyrics" />
      <div>
        <div className="py-2 px-3 md:px-16 border-b border-gray-200">
          <div className="flex items-center gap-2">
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
              <HiX className="h-5 w-5" />
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
            <div className="w-20 py-4 border-r border-gray-200">
              <ul className="text-center mx-2 space-y-2">
                <button
                  className={classNames(
                    "w-full py-3 px-2 text-xs hover:bg-black hover:bg-opacity-5 rounded",
                    openFilter === "genres" && "bg-black bg-opacity-10"
                  )}
                  onClick={() =>
                    setOpenFilter(
                      openFilter === "genres" && !isMobile ? null : "genres"
                    )
                  }
                >
                  Genre
                </button>
                <button
                  className={classNames(
                    "w-full py-3 px-2 text-xs hover:bg-black hover:bg-opacity-5 rounded",
                    openFilter === "artists" && "bg-black bg-opacity-10"
                  )}
                  onClick={() =>
                    setOpenFilter(
                      openFilter === "artists" && !isMobile ? null : "artists"
                    )
                  }
                >
                  Artist
                </button>
              </ul>
            </div>
            <div
              className={classNames(
                "transition-all border-r border-gray-200",
                openFilter ? "w-60" : "w-60 md:w-0"
              )}
            >
              <div className="p-4 divide-y divide-gray-200">
                {openFilter === "artists" &&
                  filterArtists?.map((artist, i) => (
                    <button
                      className="w-full text-left p-2 flex justify-between items-center"
                      onClick={() => {
                        filterArtists[i].filter =
                          filterArtists[i].filter === "include"
                            ? null
                            : "include";
                        setFilterArtists([...filterArtists]);
                      }}
                    >
                      {artist.attributes.name}
                      <CheckButtons
                        filter={artist.filter}
                        onExclude={() => {
                          filterArtists[i].filter =
                            filterArtists[i].filter === "exclude"
                              ? null
                              : "exclude";
                          setFilterArtists([...filterArtists]);
                        }}
                      />
                    </button>
                  ))}
                {openFilter === "genres" &&
                  genres?.map((genre, i) => (
                    <button
                      className="w-full text-left p-2 flex justify-between items-center"
                      onClick={() => {
                        filterGenres[i].filter =
                          filterGenres[i].filter === "include"
                            ? null
                            : "include";
                        setFilterGenres([...filterGenres]);
                      }}
                    >
                      {genre.attributes.title}
                      <CheckButtons
                        filter={genre.filter}
                        onExclude={() => {
                          filterGenres[i].filter =
                            filterGenres[i].filter === "exclude"
                              ? null
                              : "exclude";
                          setFilterGenres([...filterGenres]);
                        }}
                      />
                    </button>
                  ))}
              </div>
            </div>
          </ResponsiveFilters>
          <div className="flex-1 overflow-auto">
            <div className="max-w-prose mx-auto p-4 md:p-8">
              {checkedArtists.length || checkedGenres.length ? (
                <div className="flex items-center gap-4 mb-4">
                  {checkedArtists.length ? (
                    <div className="flex items-center gap-1">
                      {checkedArtists.map((a) => (
                        <div className="py-0.5 px-3 rounded-full bg-gray-200 flex items-center gap-1">
                          {a.filter === "exclude" && (
                            <span className="font-semibold">Exclude:</span>
                          )}
                          {a.attributes.name}{" "}
                          <button
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
                            <HiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {checkedGenres.length ? (
                    <div className="flex items-center gap-1">
                      {checkedGenres.map((a) => (
                        <div className="py-0.5 px-3 rounded-full bg-gray-200 flex items-center gap-1">
                          {a.filter === "exclude" && (
                            <span className="font-semibold">Exclude:</span>
                          )}
                          {a.attributes.title}{" "}
                          <button
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
                            <HiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
              {isLoading && <DataLoader />}
              <Accordion type="single" collapsible>
                {lyrics?.map((lyric, i) => (
                  <AccordionItem value={`item-${i}`}>
                    <AccordionTrigger className="w-full p-3 md:px-6 md:py-4 flex justify-between items-center">
                      <p className="text-gray-600 font-semibold truncate">
                        {lyric.attributes.title}
                      </p>
                      <div className="text-xs text-gray-500 flex-wrap flex items-center gap-2 truncate">
                        {lyric.attributes.genres.data.map((g) => (
                          <div className="py-0.5 px-2 bg-gray-100 rounded truncate">
                            {g.attributes.title}
                          </div>
                        ))}
                      </div>
                      <div className="text-gray-500">
                        {lyric.attributes.writers.data
                          .map((g) => g.attributes.name)
                          .join(", ")}
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="border-t border-gray-200">
                      <div className="p-3 md:p-6 space-y-6">
                        {lyric.attributes.verses.map((v) => (
                          <div className="flex flex-col items-start gap-3">
                            <div
                              className={classNames(
                                "py-0.5 px-2 text-xs rounded-sm font-medium",
                                verseTypeBadge[v.type]
                              )}
                            >
                              {v.type}
                            </div>
                            <div className="w-full flex flex-col gap-2">
                              {v.content.split("\n").map((l) => (
                                <p className="text-sm md:text-md">
                                  <div className="py-0.5 px-2 bg-gray-50 rounded-sm">
                                    {l}
                                  </div>
                                </p>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              {lyrics?.length === 0 && (
                <p className="text-center">Could not find any result.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LyricsPage;

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
        <HiCheck
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
