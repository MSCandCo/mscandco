'use client'

// Simple Horizontal Scroll Indicator
import { useState, useEffect, useRef } from 'react';

export default function SimpleScrollIndicator({ children, className = '' }) {
  const containerRef = useRef(null);
  const [scrollInfo, setScrollInfo] = useState({ 
    hasScroll: false, 
    scrollLeft: 0, 
    scrollWidth: 0, 
    clientWidth: 0 
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const hasScroll = scrollWidth > clientWidth;
      setScrollInfo({ hasScroll, scrollLeft, scrollWidth, clientWidth });
    };

    updateScroll();
    container.addEventListener('scroll', updateScroll);
    window.addEventListener('resize', updateScroll);

    return () => {
      container.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const scrollPercentage = scrollInfo.scrollWidth > scrollInfo.clientWidth 
    ? (scrollInfo.scrollLeft / (scrollInfo.scrollWidth - scrollInfo.clientWidth)) * 100 
    : 0;

  const thumbWidth = scrollInfo.scrollWidth > scrollInfo.clientWidth 
    ? (scrollInfo.clientWidth / scrollInfo.scrollWidth) * 100 
    : 100;

  return (
    <div className={className}>
      <div ref={containerRef} className="overflow-x-auto no-scrollbar">
        {children}
      </div>
      
      {scrollInfo.hasScroll && (
        <div className="mt-2">
          <div className="w-full h-0.5 bg-slate-300 rounded-full relative overflow-hidden">
            <div 
              className="h-0.5 rounded-full transition-all duration-300 ease-out"
              style={{
                backgroundColor: '#1f2937',
                width: `${thumbWidth}%`,
                transform: `translateX(${scrollPercentage}%)`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
