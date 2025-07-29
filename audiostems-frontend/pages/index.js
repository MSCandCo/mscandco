import Container from "@/components/container";
import Header from "@/components/header";
import MainLayout from "@/components/layouts/mainLayout";
import { PlayerContext } from "@/components/player";
import SEO from "@/components/seo";
import { apiRoute, resourceUrl } from "@/lib/utils";
import { Tab, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Button, Carousel as FlowbiteCarousel } from "flowbite-react";
import { useAuth0 } from "@auth0/auth0-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { HiArrowRight, HiPlay, HiPlayCircle } from "lucide-react";
import ReactPlayer from "react-player/youtube";
import useSWR from "swr";
import { COMPANY_INFO, BRANDS } from "@/lib/brand-config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const slides = [
  { title: "Real Artists", image: "/tabs/collaborate_1.png" },
  { title: "100+ Ways to Filter", image: "/tabs/collaborate_1.png" },
  {
    title: "Playlists for Filmmakers By Filmmakers",
    image: "/tabs/collaborate_1.png",
  },
  { title: "Free Song Pitches", image: "/tabs/collaborate_1.png" },
  {
    title: "Instrumental & Lyrical Song Versions",
    image: "/tabs/lyrical-instrumental_1.png",
  },
  { title: "Collaborate With Your Team", image: "/tabs/collaborate_1.png" },
];

const logos = [
  "/logos/amazon.svg",
  "/logos/cartoon-network.svg",
  "/logos/espn.svg",
  "/logos/fox.svg",
  "/logos/google.svg",
  "/logos/lamborghini.svg",
  "/logos/nbc.svg",
  "/logos/netflix.svg",
  "/logos/nike.svg",
  "/logos/samsung.svg",
  "/logos/Tesla_1.svg",
  "/logos/xbox.svg",
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const playerContext = useContext(PlayerContext);
  const router = useRouter();
  const { data: { data: playlists } = {} } = useSWR(
    apiRoute(
      "/playlists?populate=*&sort=updatedAt:desc&pagination[limit]=3&filters[coverBackground][id][$notNull]=true"
    )
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: { data: differentPlaylists } = {} } = useSWR(
    apiRoute("/playlists?populate=*&sort=createdAt:desc&pagination[limit]=8")
  );

  const { user, isAuthenticated, isLoading } = useAuth0();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  // Don't render homepage content for authenticated users (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <MainLayout>
      <SEO />
      <section>
        {user ? (
          <div className="h-[calc(100vh_-_72px_-_55px)] index-page-carousel">
            <FlowbiteCarousel>
              {playlists?.map((playlist, i) => (
                <div className="h-full relative" key={i}>
                  <div
                    className="h-full bg-no-repeat bg-top bg-cover"
                    style={{
                      backgroundImage: `url(${resourceUrl(
                        playlist.attributes.coverBackground?.data?.attributes
                          ?.url
                      )})`,
                    }}
                  ></div>
                  <Link href={`/playlists/${playlist.id}`}>
                    <div className="absolute bottom-[8%] left-[8%] md:bottom-0 md:left-[10%] p-4 md:p-8 bg-black text-white">
                      <div className="flex gap-4 md:gap-8 items-center">
                        <img
                          className="-ml-6 md:-ml-12 h-[120px] md:h-[180px] w-auto shadow"
                          src={resourceUrl(
                            playlist.attributes.cover?.data?.attributes?.url
                          )}
                        />
                        <div>
                          <h4 className="text-xl md:text-3xl font-semibold">
                            {playlist.attributes.title}
                          </h4>
                          {playlist.attributes.genres?.data?.length > 0 ? (
                            <p>
                              {playlist.attributes.genres.data
                                ?.map((g) => g.attributes.title)
                                .join(", ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </FlowbiteCarousel>
          </div>
        ) : (
          <Container fluid className="!p-6 md:!p-12 relative">
            <div
              className="h-[370px] md:h-[670px] bg-cover bg-no-repeat bg-right md:bg-center"
              style={{
                backgroundImage: "url(/desktop-hero.jpg)",
              }}
            ></div>
            <div className="md:absolute md:inset-y-0 md:left-[10%] flex items-center">
              <div className="py-12 md:py-4 text-center md:text-left md:text-white md:max-w-md">
                <h1 className="text-4xl font-bold mb-4">
                  Multi-Brand Music Distribution & Publishing
                </h1>
                <h3 className="text-xl font-normal mb-8">
                  {COMPANY_INFO.name} - Discover highly curated roster of label-quality musicians and composers across gospel, christian, and general music licensing.
                </h3>
                <Button
                  className="mx-auto md:ml-0"
                  onClick={() => router.push("/register")}
                >
                  Create Free Account
                </Button>
              </div>
            </div>
          </Container>
        )}
      </section>
      <section className="py-16">
        <Container>
          <Tab.Group>
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:mt-16 w-full lg:w-3/12">
                <Tab.List className="flex flex-col gap-6">
                  {slides.map((s, i) => (
                    <Tab as={Fragment} key={i}>
                      {({ selected }) => (
                        <button
                          className={classNames(
                            "text-left text-2xl font-bold focus:outline-none",
                            !selected && "text-gray-300"
                          )}
                        >
                          {s.title}
                        </button>
                      )}
                    </Tab>
                  ))}
                </Tab.List>
              </div>
              <div className="w-full lg:w-4/12">
                <Tab.Panels>
                  {slides.map((s, i) => (
                    <Tab.Panel key={i}>
                      <Transition
                        appear
                        show={true}
                        as={Fragment}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <div className="relative">
                          <img
                            className="w-full"
                            src={s.image}
                            alt={s.title}
                          />
                        </div>
                      </Transition>
                    </Tab.Panel>
                  ))}
                </Tab.Panels>
              </div>
              <div className="lg:mt-16 w-full lg:w-3/12">
                <h2 className="text-5xl font-bold mb-8">
                  Built for Filmmakers & Artists
                </h2>
                <Button onClick={() => router.push("/register")}>
                  Create Free Account
                </Button>
              </div>
            </div>
          </Tab.Group>
        </Container>
      </section>
      <section className="py-32 bg-gray-800 text-gray-100 overflow-hidden">
        <Container className="md:!px-16" fluid>
          <h2 className="text-4xl font-semibold">Recently added</h2>
          <div className="mt-8">
            <Carousel
              opts={{
                loop: true,
              }}
            >
              <CarouselContent>
                {differentPlaylists?.map((p, i) => (
                  <CarouselItem
                    className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                    key={i}
                  >
                    <div
                      className="aspect-square bg-cover bg-no-repeat bg-top"
                      style={{
                        backgroundImage: `url(${resourceUrl(
                          p.attributes.cover.data.attributes.url
                        )})`,
                      }}
                    ></div>
                    <Link href={`/playlists/${p.id}`}>
                      <p className="mt-3 text-xl">{p.attributes.title}</p>
                      <p className="font-normal">
                        {p.attributes.genres.data
                          .map((g) => g.attributes.title)
                          .join(" x ")}
                      </p>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="-left-10 h-5 w-5 text-gray-400" />
              <CarouselNext className="-right-10 h-5 w-5 text-gray-400" />
            </Carousel>
          </div>
        </Container>
      </section>
      <section className="py-16">
        <div className="pt-16 flex flex-col justify-center items-center">
          <h4 className="mb-4 text-4xl font-bold text-center">
            Less Red Tape. More Creating.
          </h4>
          <p className="mb-10 text-lg text-gray-600">
            Simplify your process with a subscription.
          </p>
          <Button onClick={() => router.push("/register")}>
            Create Free Account
          </Button>
        </div>
      </section>
      <section className="py-16 bg-white">
        <Container>
          <h2 className="text-4xl font-bold text-center mb-16">
            Choose Your Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Artist Starter Plan */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Artist Starter</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Up to 10 releases per year
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic analytics and reporting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Email support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Distribution to major platforms
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Basic earnings tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Release management tools
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => router.push("/register")}
              >
                Get Started
              </Button>
            </div>

            {/* Artist Pro Plan */}
            <div className="bg-blue-50 p-8 rounded-lg border-2 border-blue-200">
              <h3 className="text-2xl font-bold mb-4">Artist Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited releases per year
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced analytics and reporting
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority email and phone support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Custom branding options
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Distribution to all major platforms
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Detailed earnings tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Marketing campaign tools
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced royalty tracking
                </li>
              </ul>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                onClick={() => router.push("/register")}
              >
                Get Started
              </Button>
            </div>

            {/* Label Admin Plan */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Label Management</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited Artists Management
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Label Analytics Dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Artist Content Oversight
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced Reporting Tools
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Release Management
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Artist Performance Tracking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Label Branding Options
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority Email Support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Content Approval Workflows
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Revenue Tracking
                </li>
              </ul>
              <Button 
                className="w-full" 
                onClick={() => router.push("/register")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </Container>
      </section>
      <section className="mx-3 md:mx-8 mb-16 py-16 bg-gray-100">
        <Container>
          <h2 className="pb-16 text-4xl font-bold text-center">
            Setting the Tone for the World's Best
          </h2>
          <div className="pb-16 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex-1">
              <div className="grid grid-cols-3 items-center">
                {logos.map((l, i) => (
                  <img
                    key={i}
                    className="h-[72px] max-w-[50%] mx-auto lg:ml-0 my-3"
                    src={l}
                  />
                ))}
              </div>
            </div>
            <div className="flex-1">
              {mounted && (
                <ReactPlayer
                  url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
                  width="100%"
                />
              )}
            </div>
          </div>
          <div className="pb-16 grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="text-base border-t border-gray-400 flex flex-col">
              <p className="mt-3 flex-1">
                "We had a lot of constraints, but working with {COMPANY_INFO.name} made
                it really easy. They see the bigger picture, which is helpful."
              </p>
              <div className="mt-8 flex gap-3 items-center">
                <img className="w-[60px]" src="/people/omid.png" />
                <div>
                  <h5 className="text-xl font-semibold">Omid Fatemi</h5>
                  <h6 className="text-xs font-semibold">
                    Executive Producer, Stink Studios
                  </h6>
                </div>
              </div>
            </div>
            <div className="text-base border-t border-gray-400 flex flex-col">
              <p className="mt-3 flex-1">
                "{COMPANY_INFO.name} has the best collection of music and scores
                available, hands-down. The quality and diversity are
                overwhelmingly better than any other source."
              </p>
              <div className="mt-8 flex gap-3 items-center">
                <img className="w-[60px]" src="/people/joel.png" />
                <div>
                  <h5 className="text-xl font-semibold">Joel Edwards</h5>
                  <h6 className="text-xs font-semibold">
                    President, Evolve Studio
                  </h6>
                </div>
              </div>
            </div>
            <div className="text-base border-t border-gray-400 flex flex-col">
              <p className="mt-3 flex-1">
                "The {COMPANY_INFO.name} team has helped me find songs that match the
                vibe that I'm looking for perfectly. It has saved me hours on
                projects."
              </p>
              <div className="mt-8 flex gap-3 items-center">
                <img className="w-[60px]" src="/people/ezra.png" />
                <div>
                  <h5 className="text-xl font-semibold">Ezra Cohen</h5>
                  <h6 className="text-xs font-semibold">Filmmaker</h6>
                </div>
              </div>
            </div>
            <div className="text-base border-t border-gray-400 flex flex-col">
              <p className="mt-3 flex-1">
                "{COMPANY_INFO.name} is constantly putting out awesome music that makes
                our lives (and our job) so much easier."
              </p>
              <div className="mt-8 flex gap-3 items-center">
                <img className="w-[60px]" src="/people/white-in-revery.png" />
                <div>
                  <h5 className="text-xl font-semibold">White in Revery</h5>
                  <h6 className="text-xs font-semibold">Filmmaker</h6>
                </div>
              </div>
            </div>
          </div>
          <Button className="mx-auto" onClick={() => router.push("/register")}>
            Create Free Account
          </Button>
        </Container>
      </section>
    </MainLayout>
  );
}
