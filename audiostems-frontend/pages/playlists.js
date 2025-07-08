import Container from "@/components/container";
import Header from "@/components/header";
import { apiRoute, resourceUrl } from "@/lib/utils";
import classNames from "classnames";
import { Spinner, Tabs } from "flowbite-react";
import Link from "next/link";
import { useRef, useState } from "react";
import useSWR from "swr";
import qs from "qs";
import { Search } from "lucide-react";
import SEO from "@/components/seo";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function PlaylistsPage() {
  const [activeTab, setActiveTab] = useState(3);
  const [search, setSearch] = useState(false);
  const tabsRef = useRef(null);
  const [query, setQuery] = useState({
    sort: "createdAt:desc",
    filters: {
      title: {
        $containsi: "",
      },
    },
    populate: "*",
  });

  const { data: { data: playlists } = {}, isLoading } = useSWR(
    apiRoute(`/playlists/?${qs.stringify(query, { encodeValuesOnly: true })}`)
  );
  return (
    <div>
      <SEO pageTitle="Playlists" />
      <Container fluid>
        <div className="pt-20 mb-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:px-20 lg:gap-20">
            <div className="text-6xl font-bold">Playlists</div>
            <div className="flex-1 flex flex-col md:flex-row border-b-0 justify-between md:border-b-2 border-gray-200">
              <div className="flex items-center border-b-2 border-gray-200 md:border-b-0">
                <TabButton
                  title="Genres"
                  tabIndex={0}
                  activeTabIndex={activeTab}
                  tabsRef={tabsRef}
                />
                <TabButton
                  title="Vibes"
                  tabIndex={1}
                  activeTabIndex={activeTab}
                  tabsRef={tabsRef}
                />
                <TabButton
                  title="Filmmakers"
                  tabIndex={2}
                  activeTabIndex={activeTab}
                  tabsRef={tabsRef}
                />
                <TabButton
                  title="All"
                  tabIndex={3}
                  activeTabIndex={activeTab}
                  tabsRef={tabsRef}
                />
              </div>
              <div className="border-b border-gray-200 md:border-0 p-3 md:p-0 md:pr-3 flex items-center justify-between md:justify-start gap-6 relative">
                <button onClick={() => setSearch(!search)}>
                  <Search className="h-5 w-5" />
                </button>
                {search || query.filters.title.$containsi ? (
                  <div className="absolute left-[40px] md:left-auto md:right-full top-1/2 -translate-y-1/2 z-20 md:mr-4 md:w-48">
                    <Input
                      placeholder="Search ..."
                      value={query.filters.title.$containsi}
                      onChange={(e) => {
                        query.filters.title.$containsi = e.target.value;
                        setQuery({ ...query });
                      }}
                    />
                  </div>
                ) : null}
                <Select
                  value={query.sort}
                  onValueChange={(v) => {
                    query.sort = v;
                    setQuery({ ...query });
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt:desc">Recent</SelectItem>
                    <SelectItem value="title">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Tabs
            className="mt-8"
            ref={tabsRef}
            onActiveTabChange={(tab) => setActiveTab(tab)}
            aria-label="Playlists tabs"
            style="default"
          >
            <Tabs.Item>Genres</Tabs.Item>
            <Tabs.Item>Vibes</Tabs.Item>
            <Tabs.Item>Filmmakers</Tabs.Item>
            <Tabs.Item active>
              {isLoading && <DataLoader />}
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4 xl:gap-4">
                {playlists?.map((p) => (
                  <Item p={p} key={p.id} />
                ))}
              </div>
            </Tabs.Item>
          </Tabs>
        </div>
      </Container>
    </div>
  );
}

export default PlaylistsPage;

const TabButton = ({ tabIndex, activeTabIndex, title, tabsRef }) => {
  return (
    <button
      className={classNames(
        "flex-1 md:flex-none p-3 md:p-5",
        tabIndex === activeTabIndex && "-mb-0.5 border-b-2 border-blue-500"
      )}
      onClick={() => tabsRef.current.setActiveTab(tabIndex)}
    >
      {title}
    </button>
  );
};

const Item = ({ p }) => {
  return (
    <Link
      href={`/playlists/${p.id}`}
      className="block aspect-video overflow-hidden relative"
    >
      <div
        className="h-full w-full transition hover:scale-105 bg-no-repeat bg-cover"
        style={{
          backgroundImage: `url(${resourceUrl(
            p.attributes.cover.data.attributes.url
          )})`,
        }}
      />
      <h2 className="absolute bottom-2 mx-3 lg:bottom-4 lg:mx-5 font-bold lg:text-2xl text-white">
        {p.attributes.title}
      </h2>
    </Link>
  );
};

export const DataLoader = () => (
  <div className="py-10 text-center">
    <Spinner size="xl" />
  </div>
);
