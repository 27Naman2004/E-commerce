import { motion } from 'framer-motion';

export default function SplashScreen({ onEnter }) {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 bg-accent dark:bg-darkAccent text-textMain dark:text-darkText flex flex-col items-center justify-center cursor-pointer transition-colors"
      onClick={onEnter}
    >
      <motion.video
        src="/krishna-splash.mp4"
        autoPlay loop muted playsInline
        className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-full shadow-[0_0_80px_rgba(233,30,99,0.3)] dark:shadow-[0_0_80px_rgba(240,98,146,0.3)] border-[6px] border-secondary dark:border-darkGold"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="mt-12 text-center"
        initial={{ y: 30, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl text-primary dark:text-darkPrimary font-heading font-bold mb-4 drop-shadow-sm transition-colors">
          Welcome to Kanha Collection
        </h1>
        <p className="text-gold dark:text-darkGold text-xl font-body font-semibold tracking-[0.2em] uppercase transition-colors">
          Click to Enter
        </p>
      </motion.div>
    </motion.div>
  );
}
