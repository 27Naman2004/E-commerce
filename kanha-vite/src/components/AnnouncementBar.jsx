import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  'Laddu Gopal Dress Soft Cotton Collection',
  'Premium Seva Beautiful Daily Wear',
  'New Arrival Fresh Devotional Styles',
  'Fast Dispatch Order Online Now'
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % messages.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-accent text-sm py-2 text-center overflow-hidden h-[36px] relative">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center font-medium font-body tracking-wider"
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
