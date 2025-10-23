'use client'

import React from "react";
import classNames from "classnames";
import { Button } from "flowbite-react";
import Link from "next/link";
import { COMPANY_INFO, BRANDS } from "@/lib/brand-config";

function Footer() {
  return (
    <footer
      className="text-xs text-center lg:text-left"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-12 pb-20 flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200">
          <div className="lg:pr-16 w-full sm:pb-12 lg:pb-0 lg:w-1/4">
            <h4 className="text-2xl font-semibold">
              Need Help Finding the Right Song?
            </h4>
            <p className="mt-2">
              Have it delivered to your account within 7 business days
            </p>
            <Link href="/find-my-song">
              <Button 
                className="
                  bg-transparent 
                  text-[#1f2937] 
                  border 
                  border-[#1f2937] 
                  rounded-xl 
                  px-6 
                  py-2 
                  font-bold 
                  shadow 
                  transition-all 
                  duration-300 
                  hover:bg-[#1f2937] 
                  hover:text-white 
                  hover:shadow-lg 
                  hover:-translate-y-1
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#1f2937]
                  mt-6 
                  mx-auto 
                  lg:ml-0
                "
                style={{
                  backgroundColor: 'transparent',
                  color: '#1f2937',
                  borderColor: '#1f2937'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1f2937';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#1f2937';
                }}
              >
                Find My Song
              </Button>
            </Link>
          </div>
          <div className="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 className="font-bold">SERVICES</h4>
            <div className="mt-4 flex flex-col gap-3">
              <StyledLink href="/find-my-song">Song Search</StyledLink>
              <StyledLink href="/pricing">Subscription</StyledLink>
              <StyledLink href="/find-my-song">Custom Music</StyledLink>
            </div>
          </div>
          <div className="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 className="font-bold">BRANDS</h4>
            <div className="mt-4 flex flex-col gap-3">
              <div className="text-sm">
                <div className="font-semibold">{BRANDS.MSC_CO.displayName}</div>
                <div className="text-gray-600">Global music distribution and publishing</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">{BRANDS.AUDIO_MSC.displayName} <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full ml-2">Coming Soon</span></div>
                <div className="text-gray-600">{BRANDS.AUDIO_MSC.description}</div>
              </div>
            </div>
          </div>
          <div className="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 className="font-bold">HELP & SUPPORT</h4>
            <div className="mt-4 flex flex-col gap-3">
              <StyledLink href="/pricing">Pricing</StyledLink>
              <StyledLink href="/faq">FAQ</StyledLink>
              <StyledLink href="/support">Contact Support</StyledLink>
              <StyledLink href="/about">About Us</StyledLink>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 py-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:gap-0">
            <StyledLink href="/">{COMPANY_INFO.copyright}</StyledLink>
            <div className="flex flex-wrap gap-2 sm:gap-4 md:gap-6 justify-center lg:gap-8">
              <StyledLink href="/privacy-policy">Privacy Policy</StyledLink>
              <StyledLink href="/license-terms">License Terms</StyledLink>
              <StyledLink href="/terms-of-use">Terms of Use</StyledLink>
              <StyledLink href="/dmca-policy">DMCA Policy</StyledLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

const StyledLink = ({ className, ...props }) => (
  <Link
    className={classNames(
      "transition text-gray-400 hover:text-gray-800",
      className
    )}
    {...props}
  />
);
