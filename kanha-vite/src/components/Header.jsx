import { Link, NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import ThemeToggle from './ThemeToggle';
import { motion } from 'framer-motion';

export default function Header() {
  const { totalItems } = useContext(CartContext);
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="bg-primary dark:bg-darkPrimary text-white sticky top-0 z-40 shadow-sm border-b-[3px] border-secondary dark:border-darkGold transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <Link to="/home" className="text-2xl md:text-3xl font-heading font-bold tracking-wide hover:text-gold dark:hover:text-darkGold transition-colors">
          Kanha Collection
        </Link>
        <nav className="hidden md:flex gap-8 font-body text-[15px] uppercase tracking-wider font-medium">
          {[
            { name: 'HOME', path: '/home' },
            { name: 'DRESSES', path: '/dresses' },
            { name: 'COMBOS', path: '/combos' },
            { name: 'ACCESSORIES', path: '/accessories' },
            { name: 'ABOUT', path: '/about' },
            { name: 'CONTACT', path: '/contact' },
          ].map(link => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `relative group hover:text-gold dark:hover:text-darkGold transition-colors pb-1 ${isActive ? 'text-gold dark:text-darkGold' : ''}`
              }
            >
              {link.name}
              <span className="absolute left-0 bottom-0 w-full h-[2px] bg-gold dark:bg-darkGold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login" className="p-2 text-white hover:text-gold dark:hover:text-darkGold transition-colors">
            <UserIcon className="w-7 h-7" />
          </Link>
          <Link to="/cart" className="relative p-2 text-white hover:text-gold dark:hover:text-darkGold transition-colors flex items-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <ShoppingCartIcon className="w-8 h-8" />
            </motion.div>
            {totalItems > 0 && (
              <motion.span
                key={totalItems}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="absolute -top-1 -right-1 bg-gold dark:bg-darkGold text-[#3D1F2B] text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border border-primary dark:border-darkPrimary"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
