import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: '/hero-krishna.jpg',
    heading: 'Elegance of Devotion',
    subtext: 'Discover our exquisite new arrivals of heavily handcrafted poshak and traditional shringar for your beloved Laddu Gopal Ji.',
  },
  {
    image: '/hero-krishna2.jpg',
    heading: 'Handcrafted with Love',
    subtext: 'Soft cotton poshak, intricate shringar, and devotional elegance — made for your Kanha Ji.',
  },
  {
    image: '/hero-krishna3.jpg',
    heading: 'Shringar for Laddu Gopal',
    subtext: 'Celebrate every festival with our exclusive collection of dresses, mukut, and bansuri.',
  },
];

const HeroSlideshow = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused]);

  const next = () => setIndex(prev => (prev + 1) % slides.length);
  const prev = () => setIndex(prev => (prev - 1 + slides.length) % slides.length);

  const slide = slides[index];

  return (
    <section
      className="relative w-full h-[400px] md:h-[600px] overflow-hidden bg-primary dark:bg-darkAccent border-b-[6px] border-gold dark:border-darkGold"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Image crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <motion.img
            src={slide.image}
            alt={slide.heading}
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 4, ease: 'linear' }}
          />
          {/* Rose overlay */}
          <div className="absolute inset-0 bg-primary/60 dark:bg-darkAccent/70" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="font-heading text-4xl md:text-6xl font-bold text-white dark:text-darkText drop-shadow-lg"
            >
              {slide.heading}
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              className="mt-4 max-w-2xl text-sm md:text-lg text-white/90 dark:text-darkTextMuted mx-auto"
            >
              {slide.subtext}
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 inline-block"
            >
              <Link to="/dresses" className="block px-8 py-3 rounded-md bg-primaryDark hover:bg-primary dark:bg-darkPrimary dark:hover:bg-darkPrimaryHover text-white font-semibold tracking-wide shadow-lg transition-colors duration-300">
                SHOP NOW
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gold/70 hover:bg-gold text-white flex items-center justify-center opacity-0 hover:opacity-100 md:opacity-70 transition cursor-pointer"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-gold/70 hover:bg-gold text-white flex items-center justify-center opacity-0 hover:opacity-100 md:opacity-70 transition cursor-pointer"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              i === index
                ? 'bg-gold w-6'
                : 'bg-white/50 dark:bg-darkTextMuted/50 w-2.5'
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlideshow;
