import classNames from "classnames";
import { Dropdown } from "flowbite-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import React, { useMemo, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  HiArrowLeftOnRectangle,
  HiUser,
  HiDownload,
  HiCog6Tooth,
} from "lucide-react";
import {
  Bars3,
  Cog6Tooth,
  MagnifyingGlass,
  XMark,
} from "lucide-react";
import { useMediaQuery } from "react-responsive";
import { apiRoute, openCustomerPortal, resourceUrl } from "@/lib/utils";
import { getStripeProductById } from "@/lib/constants";
import { getUserBrand, BRANDS } from "@/lib/auth0-config";
import qs from "qs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const PlaylistDropdown = ({ recentPlaylists, playlists }) => {
  return (
    <div className="p-12 pt-10 bg-white">
      <div className="flex gap-12">
        <div className="w-7/12 flex flex-col gap-6">
          <h3 className="text-xs font-semibold">Recently Added</h3>
          <div className="flex gap-12">
            {recentPlaylists.map((p) => (
              <div className="w-1/2 h-[160px] overflow-hidden cursor-pointer">
                <div
                  className="h-full w-full bg-cover relative transition hover:scale-105 "
                  style={{
                    backgroundImage: `url(${resourceUrl(
                      p.attributes.cover.data.attributes.url
                    )})`,
                  }}
                >
                  <h4 className="absolute bottom-6 mx-8 font-bold text-2xl text-white">
                    {p.attributes.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-5/12">
          <div className="w-full flex justify-between pb-6 mb-4 border-b border-gray-200">
            <h3 className="text-xs font-semibold">Playlists</h3>
            <Link
              href="/playlists"
              className="text-xs font-semibold text-gray-600"
            >
              Explore All
            </Link>
          </div>
          <div className="flex h-[calc(100%_-_57px)]">
            <ul className="flex-1 flex flex-col justify-around text-sm font-semibold">
              {Array.isArray(playlists) &&
                playlists.slice(0, 4).map((p) => (
                  <Link href={`/playlists/${p.id}`}>
                    <li>{p.attributes.title}</li>
                  </Link>
                ))}
            </ul>
            <ul className="flex-1 flex flex-col justify-around text-sm font-semibold">
              {Array.isArray(playlists) &&
                playlists.slice(4, 8).map((p) => (
                  <Link href={`/playlists/${p.id}`}>
                    <li>{p.attributes.title}</li>
                  </Link>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const menuItems = [
  { label: "Songs", path: "/songs" },
  { label: "Lyrics", path: "/lyrics" },
  { label: "Stems", path: "/stems" },
  { label: "Playlists", path: "/playlists", Dropdown: PlaylistDropdown },
];

function Header() {
  const { user, isAuthenticated, logout } = useAuth0();
  const userBrand = getUserBrand(user);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 1024px)" });
  const [sideMenu, setSideMenu] = useState(false);
  const [subMenu, setSubMenu] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const { data: { data: playlists } = {} } = useSWR(
    apiRoute(
      `/playlists?${qs.stringify({
        fields: ["title"],
        populate: {
          cover: "*",
        },
      })}`
    )
  );

  const recentPlaylists = useMemo(
    () => (playlists ? playlists.slice(0, 2) : []),
    [playlists]
  );

  useEffect(() => {
    const listener = (e) => {
      if (e.target.id === "menu-overlay") {
        setSubMenu(null);
      }
    };
    const el = document.getElementById("menu-overlay");
    if (el) {
      el.addEventListener("mouseover", listener);
    }
    return () => (el ? el.removeEventListener("mouseover", listener) : null);
  }, [subMenu]);

  if (!mounted) return null;

  return (
    <header className="px-3 lg:px-[50px] py-1 h-[55px] border-b border-gray-200 bg-white">
      {isTabletOrMobile ? (
        <>
          <div className="w-full max-h-full flex items-center justify-between">
            <button onClick={() => setSideMenu(true)}>
              <Bars3 className="w-6 h-6" />
            </button>
            <Link href="/" className="h-[47px] flex items-center">
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-gray-900">MSC & Co</span>
                {userBrand && (
                  <span className="text-xs text-gray-600">{userBrand.displayName}</span>
                )}
              </div>
            </Link>
            <button>
              <MagnifyingGlass className="w-6 h-6" />
            </button>
          </div>
          <div
            className={classNames(
              "fixed z-50 inset-y-0 w-full bg-white bg-opacity-90 transition-all",
              sideMenu ? "right-0" : "right-full"
            )}
          >
            <div className="px-3 py-1 h-[55px] flex">
              <button onClick={() => setSideMenu(false)}>
                <XMark className="w-6 h-6" />
              </button>
            </div>
            <div className="px-8 py-6">
              <ul className="flex flex-col gap-6">
                {menuItems.map((mi, i) => (
                  <li key={i}>
                    <Link href={mi.path} className="text-2xl font-bold">
                      {mi.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full max-h-full flex justify-between items-center">
          <div className="flex-1">
            <NavigationMenu className="justify-start">
              <NavigationMenuList>
                {menuItems.map((mi) => (
                  <NavigationMenuItem>
                    {mi.Dropdown ? (
                      <Link href={mi.path}>
                        <NavigationMenuTrigger>
                          {mi.label}
                        </NavigationMenuTrigger>
                      </Link>
                    ) : (
                      <Link
                        href={mi.path}
                        className={navigationMenuTriggerStyle()}
                      >
                        {mi.label}
                      </Link>
                    )}
                    {mi.Dropdown && (
                      <NavigationMenuContent className="md:w-[65vw]">
                        <mi.Dropdown
                          playlists={playlists}
                          recentPlaylists={recentPlaylists}
                        />
                      </NavigationMenuContent>
                    )}
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <Link href="/" className="shrink-0 h-[47px] flex items-center">
            <div className="flex flex-col items-center">
              <span className="text-xl font-bold text-gray-900">MSC & Co</span>
              {userBrand && (
                <span className="text-xs text-gray-600">{userBrand.displayName}</span>
              )}
            </div>
          </Link>
          <div className="flex-1 flex justify-end items-center">
            <ul className="flex items-center">
              <li className="px-5 py-2 text-gray-500">
                <Link href="/pricing">Prices</Link>
              </li>
              <li className="px-5 py-2 text-gray-500">About</li>
              <li className="px-5 py-2 text-gray-500">Support</li>
            </ul>
            {isAuthenticated ? (
              <Dropdown
                color="gray"
                size="sm"
                label={
                  user?.name ? <p>Hi, {user.name}</p> : <p>Hi</p>
                }
                dismissOnClick={false}
              >
                <Link href="/dashboard">
                  <Dropdown.Item icon={HiUser}>Dashboard</Dropdown.Item>
                </Link>
                <Link href="/settings/me">
                  <Dropdown.Item icon={HiUser}>Profile</Dropdown.Item>
                </Link>
                <Link href="/download-history">
                  <Dropdown.Item icon={HiDownload}>Download History</Dropdown.Item>
                </Link>
                <Dropdown.Item icon={HiCog6Tooth} onClick={openCustomerPortal}>
                  Billing
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  icon={HiArrowLeftOnRectangle}
                  onClick={() => logout({ 
                    logoutParams: { 
                      returnTo: window.location.origin 
                    } 
                  })}
                >
                  Logout
                </Dropdown.Item>
              </Dropdown>
            ) : (
              <div className="ml-2 flex gap-4">
                <button className="font-semibold px-4 py-2">
                  <Link href="/login">Login</Link>
                </button>
                <button className="font-semibold px-4 py-2 bg-gray-900 text-white">
                  <Link href="/register">Register</Link>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
