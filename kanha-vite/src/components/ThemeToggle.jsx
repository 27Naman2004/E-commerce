import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 dark:bg-darkPrimary/20 dark:hover:bg-darkPrimary/30 transition-all duration-300 flex items-center justify-center"
      aria-label="Toggle theme"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-xl inline-block"
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
};

export default ThemeToggle;
