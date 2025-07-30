import classNames from "classnames";
import { Dropdown } from "flowbite-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  HiArrowLeftOnRectangle,
  HiUser,
  HiDownload,
  HiCog6Tooth,
} from "lucide-react";
import { openCustomerPortal } from "@/lib/utils";
import { getUserBrand, BRANDS } from "@/lib/auth0-config";

function Header() {
  const { user, isAuthenticated, logout } = useAuth0();
  const userBrand = getUserBrand(user);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="px-3 lg:px-[50px] py-1 h-[55px] border-b border-gray-200 bg-white">
      <div className="w-full max-h-full flex justify-between items-center">
        <Link href="/" className="shrink-0 h-[47px] flex items-center">
          <div className="flex flex-col items-center">
            <img 
              src="/logos/msc-logo.png" 
              alt="MSC & Co" 
              className="h-16 w-auto"
              onError={(e) => {
                e.target.src = '/logos/msc-logo.svg';
                e.target.onerror = () => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                };
              }}
            />
            <span className="text-xl font-bold text-gray-900 hidden">
              MSC & Co
            </span>
            {userBrand && (
              <span className="text-xs text-gray-600">{userBrand.displayName}</span>
            )}
          </div>
        </Link>
        <div className="flex-1 flex justify-end items-center">
          <ul className="flex items-center">
            {!isAuthenticated && (
              <li className="px-5 py-2 text-gray-500">
                <Link href="/pricing">Prices</Link>
              </li>
            )}
            <li className="px-5 py-2 text-gray-500">
              <Link href="/about">About</Link>
            </li>
            <li className="px-5 py-2 text-gray-500">
              <Link href="/support">Support</Link>
            </li>
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
    </header>
  );
}

export default Header;
