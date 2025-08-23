import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { SWRConfig } from "swr";
import axios from "axios";
import NextNProgress from "nextjs-progressbar";
import Player from "@/components/player";
import Header from "@/components/header";
import RoleBasedNavigation from "@/components/auth/RoleBasedNavigation";
import { AuthProvider, useUser } from "@/components/providers/SupabaseProvider";
import Head from "next/head";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

function AppContent({ Component, pageProps }) {
  const { user, isLoading } = useUser();
  const isAuthenticated = !!user;
  
  // Use role-based navigation for authenticated users, old header for public pages
  const NavigationComponent = isAuthenticated ? RoleBasedNavigation : Header;

  return (
    <>
      <NavigationComponent />
      <Component {...pageProps} />
    </>
  );
}

export default function App({ Component, pageProps }) {
  
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <NextNProgress color="#0117df" />
      <AuthProvider>
        <Player>
          <div className={inter.className}>
            <SWRConfig
              value={{
                fetcher: (url) => axios.get(url).then((res) => res.data),
                onError: (error) => console.error(error),
              }}
            >
              <AppContent Component={Component} pageProps={pageProps} />
            </SWRConfig>
          </div>
        </Player>
      </AuthProvider>
    </>
  );
}
