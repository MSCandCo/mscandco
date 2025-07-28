import "@/styles/globals.css";
import { Inter } from "next/font/google";
import Player from "@/components/player";
import { SWRConfig } from "swr";
import axios from "axios";
import { Flowbite } from "flowbite-react";
import { useState } from "react";
import NextNProgress from "nextjs-progressbar";
import Header from "@/components/header";
import Auth0ProviderWrapper from "@/components/providers/Auth0Provider";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function App({ Component, pageProps }) {
  const [theme, setTheme] = useState({
    tabs: {
      tablist: { base: "hidden" },
      tabpanel: "p-0",
    },
    select: {
      field: {
        select: {
          base: "text-xs",
        },
      },
    },
  });
  return (
    <>
      <NextNProgress color="#0117df" />
      <Auth0ProviderWrapper>
        <div className={inter.className}>
          <Flowbite theme={{ theme }}>
            <SWRConfig
              value={{
                fetcher: (url) => axios.get(url).then((res) => res.data),
                onError: (error) => console.error(error),
              }}
            >
              <Player>
                <Header />
                <Component {...pageProps} />
              </Player>
            </SWRConfig>
          </Flowbite>
        </div>
      </Auth0ProviderWrapper>
    </>
  );
}
