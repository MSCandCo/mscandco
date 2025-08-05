"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CarouselContext = createContext(null)

function useCarousel() {
  const context = useContext(CarouselContext)
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }
  return context
}

const Carousel = React.forwardRef(({ 
  opts = {}, 
  className, 
  children, 
  ...props 
}, ref) => {
  const [current, setCurrent] = useState(0)
  const [carouselRef, setCarouselRef] = useState(null)

  const scrollPrev = useCallback(() => {
    if (carouselRef) {
      carouselRef.scrollBy({ left: -carouselRef.offsetWidth, behavior: 'smooth' })
    }
  }, [carouselRef])

  const scrollNext = useCallback(() => {
    if (carouselRef) {
      carouselRef.scrollBy({ left: carouselRef.offsetWidth, behavior: 'smooth' })
    }
  }, [carouselRef])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        setCarouselRef,
        scrollPrev,
        scrollNext,
        opts,
      }}
    >
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  const { setCarouselRef } = useCarousel()

  return (
    <div
      ref={(node) => {
        if (ref) {
          if (typeof ref === 'function') ref(node)
          else ref.current = node
        }
        setCarouselRef(node)
      }}
      className={cn(
        "flex overflow-x-auto scrollbar-hide scroll-smooth",
        className
      )}
      style={{ scrollSnapType: 'x mandatory' }}
      {...props}
    />
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn("min-w-0 shrink-0", className)}
    style={{ scrollSnapAlign: 'start' }}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef(({ 
  className, 
  variant = "outline", 
  size = "icon", 
  ...props 
}, ref) => {
  const { scrollPrev } = useCarousel()

  return (
    <button
      ref={ref}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 left-4 z-10",
        "flex h-8 w-8 items-center justify-center rounded-full border border-gray-200",
        "bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef(({ 
  className, 
  variant = "outline", 
  size = "icon", 
  ...props 
}, ref) => {
  const { scrollNext } = useCarousel()

  return (
    <button
      ref={ref}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 right-4 z-10",
        "flex h-8 w-8 items-center justify-center rounded-full border border-gray-200",
        "bg-white/80 hover:bg-white shadow-sm hover:shadow-md transition-all",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}