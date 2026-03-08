import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ss01 from '@/assets/screenshots/ss01.jpeg';
import ss02 from '@/assets/screenshots/ss02.jpeg';
import ss03 from '@/assets/screenshots/ss03.jpeg';
import ss04 from '@/assets/screenshots/ss04.jpeg';
import ss05 from '@/assets/screenshots/ss05.jpeg';
import ss06 from '@/assets/screenshots/ss06.jpeg';
import ss07 from '@/assets/screenshots/ss07.jpeg';
import ss08 from '@/assets/screenshots/ss08.jpeg';
import ss09 from '@/assets/screenshots/ss09.jpeg';
import ss10 from '@/assets/screenshots/ss10.jpeg';
import ss11 from '@/assets/screenshots/ss11.jpeg';
import ss12 from '@/assets/screenshots/ss12.jpeg';

const screenshots = [ss01, ss02, ss03, ss04, ss05, ss06, ss07, ss08, ss09, ss10, ss11, ss12];

const INTERVAL = 3000;

// Preload all images on mount
const preloadImages = (srcs: string[]) => {
  srcs.forEach((src) => {
    const img = new Image();
    img.src = src;
  });
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.95 }),
};

const PhoneMockup = () => {
  const [[current, direction], setCurrent] = useState([0, 1]);

  const advance = useCallback(() => {
    setCurrent(([prev]) => [(prev + 1) % screenshots.length, 1]);
  }, []);

  // Preload all screenshots on mount for instant transitions
  useEffect(() => {
    preloadImages(screenshots);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL);
    return () => clearInterval(id);
  }, [advance]);

  const goTo = (idx: number) => {
    setCurrent(([prev]) => [idx, idx > prev ? 1 : -1]);
  };

  return (
    <div className="relative w-[280px] sm:w-[300px] md:w-[320px] mx-auto">
      {/* Glow effect behind phone */}
      <div className="absolute inset-0 -m-8 rounded-full bg-neon/10 blur-3xl animate-glow-pulse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-neon/20 blur-[100px] rounded-full" />

      {/* Phone Frame */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="relative bg-dark-200 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
        style={{ aspectRatio: '9/19.5' }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-dark-200 rounded-b-2xl z-20 flex items-center justify-center">
          <div className="w-16 h-4 bg-dark rounded-full" />
        </div>

        {/* Screenshot carousel */}
        <div className="relative w-full h-full overflow-hidden bg-dark pt-7">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.img
              key={current}
              src={screenshots[current]}
              alt={`App screenshot ${current + 1}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
          </AnimatePresence>

          {/* Vignette */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-dark/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-dark/70 to-transparent z-10 pointer-events-none" />
        </div>

        {/* Dot indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {screenshots.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to screenshot ${i + 1}`}
              className="group p-0.5"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-4 h-1.5 bg-neon shadow-[0_0_8px_rgba(124,255,107,0.6)]'
                    : 'w-1.5 h-1.5 bg-white/30 group-hover:bg-white/60'
                }`}
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reflection */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[60%] h-6 bg-neon/10 blur-2xl rounded-full" />
    </div>
  );
};

export default PhoneMockup;
