import React, { useContext } from "react";
import Container from "./container";
import classNames from "classnames";
import { Button } from "flowbite-react";
import Link from "next/link";
import { usePlayer } from "./player";
import { COMPANY_INFO, BRANDS } from "@/lib/brand-config";

function Footer() {
  const {
    player: { isPlaying },
  } = usePlayer();
  return (
    <footer
      className={classNames(
        "text-xs text-center lg:text-left",
        isPlaying && "mb-[91px] md:mb-[72px]"
      )}
    >
      <Container>
        <div className="pt-12 pb-20 flex flex-col sm:flex-row sm:flex-wrap gap-8 sm:gap-0 sm:divide-x sm:divide-gray-200">
          <div className="lg:pr-16 w-full sm:pb-12 lg:pb-0 lg:w-1/4">
            <h4 className="text-2xl font-semibold">
              Need Help Finding the Right Song?
            </h4>
            <p className="mt-2">
              Have it delivered to your account within 1 business day
            </p>
            <Button className="mt-6 mx-auto lg:ml-0">Find My Song</Button>
          </div>
          <div className="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 className="font-bold">SERVICES</h4>
            <div className="mt-4 flex flex-col gap-3">
              <StyledLink href="/songs">Song Search</StyledLink>
              <StyledLink href="/pricing">Subscription</StyledLink>
              <StyledLink href="#">Single Use</StyledLink>
              <StyledLink href="#">Custom Music</StyledLink>
              <StyledLink href="#">Covers</StyledLink>
            </div>
          </div>
          <div className="lg:px-8 w-full sm:w-1/3 lg:w-1/4">
            <h4 className="font-bold">{COMPANY_INFO.name}</h4>
            <div className="mt-4 flex flex-col gap-3">
              <div className="text-sm">
                <div className="font-semibold">{BRANDS.YHWH_MSC.displayName}</div>
                <div className="text-gray-600">{BRANDS.YHWH_MSC.description}</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">{BRANDS.AUDIO_MSC.displayName}</div>
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
            <div className="flex gap-2 sm:gap-4 md:gap-6 justify-center lg:gap-12">
              <StyledLink href="/privacy-policy">Privacy Policy</StyledLink>
              <StyledLink href="/license-terms">License Terms</StyledLink>
              <StyledLink href="/terms-of-use">Terms of Use</StyledLink>
            </div>
          </div>
        </div>
      </Container>
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
