import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PromoBanner } from '../types';

interface PromoBannerSliderProps {
  banners: PromoBanner[];
}

export const PromoBannerSlider: React.FC<PromoBannerSliderProps> = ({ banners }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (banners.length <= 1) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 6000); // 6 seconds slide interval
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [banners, isPaused]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handleBannerClick = (banner: PromoBanner) => {
    if (banner.targetUrl) {
      if (banner.targetUrl.startsWith('http')) {
        window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
      } else {
        navigate(banner.targetUrl);
      }
    }
  };

  return (
    <div 
      id="promo-banner-slider-container"
      className="relative w-full aspect-[19/6] bg-slate-950 rounded-[32px] overflow-hidden shadow-md select-none group border border-slate-800"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          onClick={() => handleBannerClick(currentBanner)}
          className="absolute inset-0 w-full h-full cursor-pointer"
        >
          {/* Banner Image */}
          <img 
            src={currentBanner.imageUrl} 
            alt={currentBanner.title || 'Promotional Banner'} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Dark scrim overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Title or Info (if present) */}
          {currentBanner.title && (
            <div className="absolute bottom-4 left-6 right-6 z-10">
              <span className="bg-amber-400 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider mr-2">
                AD
              </span>
              <span className="text-white font-black text-xs md:text-sm tracking-wide drop-shadow-sm font-sans">
                {currentBanner.title}
              </span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators / Dots */}
      {banners.length > 1 && (
        <div className="absolute top-4 right-6 flex gap-1.5 z-10 bg-black/40 px-2 py-1 rounded-full backdrop-blur-xs">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Subtle indicator of pause state */}
      {isPaused && banners.length > 1 && (
        <div className="absolute top-4 left-6 bg-black/60 px-2.5 py-1 rounded-full text-[8px] text-amber-400 font-extrabold uppercase tracking-widest flex items-center gap-1 backdrop-blur-xs shadow-xs animate-pulse">
          <span className="inline-block w-1.5 h-1.5 rounded-xs bg-amber-400"></span> Paused
        </div>
      )}
    </div>
  );
};
