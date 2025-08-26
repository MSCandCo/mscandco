import Container from "@/components/container";
import Header from "@/components/header";
import MainLayout from "@/components/layouts/mainLayout";
import { PlayerContext } from "@/components/player";
import SEO from "@/components/seo";
import { apiRoute, resourceUrl } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { Button } from "flowbite-react";
import { useUser } from "@/components/providers/SupabaseProvider";
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
  { 
    title: "You Need a Major Label to Succeed", 
    image: "/hpimage1.png",
    type: "image"
  },
  { 
    title: "Digital Distribution is Too Expensive", 
    image: "/hpimage2.png",
    type: "pricing"
  },
  {
    title: "Independent Artists Can't Compete",
    image: "/hpimage3.png",
    type: "image"
  },
  { 
    title: "Gospel Music Has Limited Reach", 
    image: "/hpimage4.png",
    type: "image"
  },
  {
    title: "You Need Connections to Get Heard",
    image: "/hpimage5.png",
    type: "image"
  }
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



// VideoThumbnail component with load detection
const VideoThumbnail = ({ release, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleImageLoad = () => {
    setIsLoaded(true)
    setHasError(false)
  }

  const handleImageError = () => {
    setHasError(true)
    setIsLoaded(false)
  }

  // Don't render if image failed to load
  if (hasError) {
    return null
  }

  return (
    <div 
      className={`flex-shrink-0 group cursor-pointer transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClick}
    >
      <div className="relative w-96 h-60 bg-gray-900 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
        <img 
          src={release.thumbnail}
          alt=""
          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Subtle play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-20 h-20 bg-white bg-opacity-25 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

const LatestReleasesSection = () => {
  const [releases, setReleases] = useState([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)

  useEffect(() => {
    const fetchAndValidateReleases = async () => {
      try {
        // Check if we have cached data (valid for 10 minutes)
        const cachedData = localStorage.getItem('youtube_releases_cache')
        const cacheTime = localStorage.getItem('youtube_releases_cache_time')
        const now = Date.now()
        
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 600000) { // 10 minutes
          console.log('📦 Using cached YouTube data')
          const cached = JSON.parse(cachedData)
          setReleases(cached)
          setLoading(false)
          return
        }

        console.log('🔄 Fetching fresh YouTube data')
        // First try to get releases from API
        const response = await fetch('/api/releases/latest')
        const result = await response.json()
        
        let releasesToValidate = []
        
        if (result.success && result.data && result.data.length > 0) {
          releasesToValidate = result.data
        } else {
          // Fallback to verified active gospel videos (official channels - updated Dec 2024)
          releasesToValidate = [
            {
              id: 'waymaker-sinach-official',
              title: 'Way Maker',
              artist: 'Sinach',
              thumbnail: 'https://img.youtube.com/vi/29IWTzKdTCk/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=29IWTzKdTCk'
            },
            {
              id: 'goodness-bethel-official',
              title: 'Goodness of God',
              artist: 'Bethel Music',
              thumbnail: 'https://img.youtube.com/vi/uWDkOAmDc5Q/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=uWDkOAmDc5Q'
            },
            {
              id: 'reckless-cory-official',
              title: 'Reckless Love',
              artist: 'Cory Asbury',
              thumbnail: 'https://img.youtube.com/vi/Sc6SSHuZvQE/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=Sc6SSHuZvQE'
            },
            {
              id: 'beautiful-hillsong-official',
              title: 'What A Beautiful Name',
              artist: 'Hillsong Worship',
              thumbnail: 'https://img.youtube.com/vi/nQWFzMvCfLE/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=nQWFzMvCfLE'
            },
            {
              id: 'oceans-hillsong-official',
              title: 'Oceans (Where Feet May Fail)',
              artist: 'Hillsong United',
              thumbnail: 'https://img.youtube.com/vi/dy9nwe9_xzw/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=dy9nwe9_xzw'
            },
            {
              id: 'great-allsons-official',
              title: 'Great Are You Lord',
              artist: 'All Sons & Daughters',
              thumbnail: 'https://img.youtube.com/vi/3BVEbM0bDwc/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=3BVEbM0bDwc'
            },
            {
              id: 'howgreat-tomlin-official',
              title: 'How Great Is Our God',
              artist: 'Chris Tomlin',
              thumbnail: 'https://img.youtube.com/vi/KO2YMxhkEtE/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=KO2YMxhkEtE'
            },
            {
              id: 'amazing-tomlin-official',
              title: 'Amazing Grace (My Chains Are Gone)',
              artist: 'Chris Tomlin',
              thumbnail: 'https://img.youtube.com/vi/Jbe7OruLk8I/maxresdefault.jpg',
              youtubeUrl: 'https://www.youtube.com/watch?v=Jbe7OruLk8I'
            }
          ]
        }
        
        // Validate all thumbnails to ensure they load
        const validatedReleases = await validateThumbnails(releasesToValidate)
        
        if (validatedReleases.length > 0) {
          setReleases(validatedReleases)
          // Cache the validated data
          localStorage.setItem('youtube_releases_cache', JSON.stringify(validatedReleases))
          localStorage.setItem('youtube_releases_cache_time', now.toString())
          console.log(`💾 Cached ${validatedReleases.length} validated releases`)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching releases:', err)
        // Use fallback data even on error
        setReleases([
          {
            id: 'waymaker-fallback',
            title: 'Waymaker',
            artist: 'Michael W. Smith',
            thumbnail: 'https://img.youtube.com/vi/29IWTzKdTCk/maxresdefault.jpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=29IWTzKdTCk'
          }
        ])
        setLoading(false)
      }
    }

    fetchAndValidateReleases()
  }, [])

  // Validate thumbnail URLs to ensure they actually load
  const validateThumbnails = async (releases) => {
    const validReleases = []
    
    for (const release of releases) {
      try {
        const isValid = await new Promise((resolve) => {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          
          const timeout = setTimeout(() => resolve(false), 5000) // 5 second timeout
          
          img.onload = () => {
            clearTimeout(timeout)
            resolve(true)
          }
          
          img.onerror = () => {
            clearTimeout(timeout)
            resolve(false)
          }
          
          img.src = release.thumbnail
        })
        
        if (isValid) {
          validReleases.push(release)
        } else {
          console.log(`Invalid thumbnail for: ${release.title}`)
        }
      } catch (error) {
        console.log(`Thumbnail validation failed for: ${release.title}`)
      }
    }
    
    return validReleases
  }

  // Continuous scroll animation
  useEffect(() => {
    if (releases.length === 0) return

    let animationId
    
    const scroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current
        const scrollWidth = container.scrollWidth
        const clientWidth = container.clientWidth
        const maxScroll = scrollWidth - clientWidth
        
        // Continuous slower scroll
        container.scrollLeft += 0.5
        
        // Reset when reaching the end for infinite loop
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft = 0
        }
      }
      
      animationId = requestAnimationFrame(scroll)
    }
    
    // Start scrolling after a short delay
    const timeout = setTimeout(() => {
      animationId = requestAnimationFrame(scroll)
    }, 1000)

    return () => {
      clearTimeout(timeout)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [releases])

  // Show loading state
  if (loading) {
    return (
      <section className="py-8 bg-gray-900">
        <div className="flex items-center justify-center">
          <div className="text-white text-lg">Loading latest releases...</div>
        </div>
      </section>
    )
  }

  if (releases.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gray-800 text-gray-100 overflow-hidden">
      <div className="w-full">
        <div className="relative overflow-hidden">
          <div 
            ref={scrollRef}
            className="flex space-x-8 overflow-x-auto scrollbar-hide"
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitScrollbar: { display: 'none' }
            }}
          >
            {/* Duplicate releases for seamless infinite scroll */}
            {releases.concat(releases).concat(releases).map((release, index) => (
              <div 
                key={`${release.id}-${index}`}
                className="flex-shrink-0 group cursor-pointer"
                onClick={() => release.youtubeUrl && window.open(release.youtubeUrl, '_blank')}
              >
                <div className="relative w-96 h-60 bg-gray-900 rounded-lg overflow-hidden shadow-lg group-hover:shadow-2xl transform group-hover:scale-105 transition-all duration-500">
                  <img 
                    src={release.thumbnail}
                    alt=""
                    className="w-full h-full object-cover group-hover:opacity-90 transition-opacity duration-300"
                  />
                  
                  {/* Play button overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-20 h-20 bg-white bg-opacity-25 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [activeSlide, setActiveSlide] = useState(1); // Default to second slide (pricing)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
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

  const { user, isLoading } = useUser();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f2937]"></div>
        </div>
      </MainLayout>
    );
  }

  // Don't render homepage content for authenticated users (will redirect)
  if (user) {
    return null;
  }

  return (
    <MainLayout>
      <SEO />
      <section>
        {user ? (
          <div className="h-[calc(100vh_-_72px_-_55px)] index-page-carousel">
          <Carousel className="h-full">
            <CarouselContent className="h-full">
              {playlists?.map((playlist, i) => (
                <CarouselItem key={i} className="h-full min-w-full">
                  <div className="h-full relative">
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
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 h-10 w-10" />
            <CarouselNext className="right-4 h-10 w-10" />
          </Carousel>
          </div>
        ) : (
          <div className="w-full relative">
            <div
              className="h-[370px] md:h-[670px] bg-cover bg-no-repeat bg-right md:bg-center"
              style={{
                backgroundImage: "url(/desktop-hero2.jpg)",
              }}
            ></div>
            <div className="md:absolute md:inset-y-0 md:left-[8%] flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="py-12 md:py-4 text-center md:text-left md:text-white md:max-w-md">
                <div className="mb-6 flex justify-center md:justify-start">
                  <img 
                    src="/logos/msc-logo.png" 
                    alt="MSC & Co Logo" 
                    className="h-16 md:h-20 w-auto filter brightness-0 invert"
                    style={{
                      filter: 'brightness(0) invert(1)'
                    }}
                  />
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  Multi-Brand Music Distribution & Publishing
                </h1>
                <h3 className="text-xl font-normal mb-8">
                  {COMPANY_INFO.name} - Discover highly curated roster of label-quality musicians and composers across gospel, christian, and general music licensing.
                </h3>
                <Button
                  className="
                    bg-white 
                    text-[#1f2937] 
                    border 
                    border-white 
                    rounded-xl 
                    px-8 
                    py-3 
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
                    focus:ring-white
                    mx-auto 
                    md:ml-0
                  "
                  style={{
                    backgroundColor: 'white',
                    color: '#1f2937',
                    borderColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#1f2937';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#1f2937';
                  }}
                  onClick={() => router.push("/register")}
                >
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
      <section className="py-16">
        <Container>
          <div className="flex flex-col lg:flex-row gap-16 items-center lg:min-h-[500px]">
            <div className="w-full lg:w-3/12 flex justify-center lg:justify-end lg:items-center">
              <div className="flex flex-col justify-center">
                <div className="flex flex-col gap-6">
                                    {slides.map((s, i) => (
                    <div
                      key={i}
                      className={classNames(
                        "text-left text-lg font-bold cursor-pointer transition-colors duration-200",
                        activeSlide === i ? "text-gray-900" : "text-gray-300 hover:text-gray-600"
                      )}
                      onMouseEnter={() => !isMobile && setActiveSlide(i)}
                      onMouseLeave={() => !isMobile && setActiveSlide(1)}
                      onClick={() => isMobile && setActiveSlide(i)}
                    >
                      {s.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-4/12 flex justify-center lg:justify-start lg:items-center">
              <div className="relative">
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
                    {slides[activeSlide]?.type === "pricing" ? (
                      <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-800 max-w-sm mx-auto">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">Artist Starter</h3>
                          <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-800">£9.99</span>
                            <span className="text-gray-600">/month</span>
                          </div>
                          <div className="space-y-3 text-sm text-gray-700 mb-8 text-left">
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Up to 10 releases per year
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Basic analytics dashboard
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Email support only
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Distribution to 5+ major platforms
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Basic earnings overview
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Standard release management
                            </div>
                            <div className="flex items-start">
                              <svg className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Basic artist profile
                            </div>
                          </div>
                          <button className="w-full bg-gray-800 text-white py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors font-semibold">
                            Get Started Today
                          </button>
                        </div>
                      </div>
                    ) : (
                      <img
                        className="w-full rounded-lg shadow-md max-w-sm mx-auto"
                        src={slides[activeSlide]?.image}
                        alt={slides[activeSlide]?.title}
                      />
                    )}
                        </div>
                      </Transition>
              </div>
            </div>
            <div className="w-full lg:w-3/12 text-center lg:text-left flex flex-col justify-center lg:items-start">
              <div className="flex flex-col justify-center">
                <h2 className="text-5xl font-bold mb-8">
                  Music Distribution Myths
                </h2>
                <Button 
                  className="
                    bg-transparent 
                    text-[#1f2937] 
                    border 
                    border-[#1f2937] 
                    rounded-xl 
                    px-8 
                    py-3 
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
                  "
                  style={{
                    '--tw-bg-opacity': '1',
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
                  onClick={() => router.push("/register")}
                >
                  Create Free Account
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
      <LatestReleasesSection />
      <section className="py-16">
        <div className="pt-16 flex flex-col justify-center items-center">
          <h4 className="mb-4 text-4xl font-bold text-center">
            Your Music. Your Ministry. Our Mission.
          </h4>
          <p className="mb-10 text-lg text-gray-600">
            Empowering gospel artists to reach the world with their calling.
          </p>
          <Button 
            className="
              bg-transparent 
              text-[#1f2937] 
              border 
              border-[#1f2937] 
              rounded-xl 
              px-8 
              py-3 
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
            onClick={() => router.push("/register")}
          >
            Create Free Account
          </Button>
        </div>
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
                <video
                  controls
                  width="100%"
                  className="rounded-lg shadow-lg"
                >
                  <source src="/videos/yhwh-track.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
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
        </Container>
      </section>
      
      {/* Latest Releases Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <h2 className="pb-8 text-4xl font-bold text-center">
            Latest Releases
          </h2>
          <p className="pb-12 text-lg text-gray-600 text-center max-w-2xl mx-auto">
            Discover the newest gospel and Christian music from our talented artists
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Sample gospel/christian releases - these would be dynamically loaded */}
            {[
              { title: "Waymaker", artist: "Sinach", thumbnail: "https://img.youtube.com/vi/29IxnsqOkmE/maxresdefault.jpg" },
              { title: "Goodness of God", artist: "Bethel Music", thumbnail: "https://img.youtube.com/vi/cnyVFp8rGwE/maxresdefault.jpg" },
              { title: "Reckless Love", artist: "Cory Asbury", thumbnail: "https://img.youtube.com/vi/Sc6SSHuZvQE/maxresdefault.jpg" },
              { title: "What A Beautiful Name", artist: "Hillsong Worship", thumbnail: "https://img.youtube.com/vi/r5L6QlAH3L4/maxresdefault.jpg" },
              { title: "Great Are You Lord", artist: "All Sons & Daughters", thumbnail: "https://img.youtube.com/vi/7wbZhRayMWA/maxresdefault.jpg" },
              { title: "How Great Is Our God", artist: "Chris Tomlin", thumbnail: "https://img.youtube.com/vi/KO7Q1KZhTpE/maxresdefault.jpg" },
              { title: "Oceans", artist: "Hillsong United", thumbnail: "https://img.youtube.com/vi/dy9nwe9_xzw/maxresdefault.jpg" },
              { title: "10,000 Reasons", artist: "Matt Redman", thumbnail: "https://img.youtube.com/vi/DXDGE_lRI0E/maxresdefault.jpg" },
              { title: "Amazing Grace", artist: "Chris Tomlin", thumbnail: "https://img.youtube.com/vi/Jbe7OruLk8I/maxresdefault.jpg" },
              { title: "Build My Life", artist: "Pat Barrett", thumbnail: "https://img.youtube.com/vi/QvLxZEU02uI/maxresdefault.jpg" },
              { title: "King of Kings", artist: "Hillsong Worship", thumbnail: "https://img.youtube.com/vi/DbLxPnkr_e0/maxresdefault.jpg" },
              { title: "Yes I Will", artist: "Vertical Worship", thumbnail: "https://img.youtube.com/vi/F3zt1adPmCc/maxresdefault.jpg" }
            ].map((release, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={release.thumbnail}
                    alt={release.title}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                    <h4 className="text-white text-sm font-semibold truncate">{release.title}</h4>
                    <p className="text-gray-300 text-xs truncate">{release.artist}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button 
              className="
                bg-transparent 
                text-[#1f2937] 
                border 
                border-[#1f2937] 
                rounded-xl 
                px-8 
                py-3 
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
              "
              onClick={() => router.push("/register")}
            >
              Explore All Releases
          </Button>
          </div>
        </Container>
      </section>
    </MainLayout>
  );
}
