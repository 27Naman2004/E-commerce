import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SplashScreen from './components/SplashScreen';
import AnnouncementBar from './components/AnnouncementBar';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import About from './pages/About';
import Contact from './pages/Contact';
import { products } from './data/products';
import ProductCard from './components/ProductCard';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="flex-grow flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/dresses" element={<Shop initialCategory="dresses" />} />
          <Route path="/combos" element={<Shop initialCategory="combos" />} />
          <Route path="/accessories" element={<Shop initialCategory="accessories" />} />
          <Route path="/shop" element={<Shop initialCategory="all" />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      <AnimatePresence>
        {showSplash && <SplashScreen key="splash" onEnter={() => setShowSplash(false)} />}
      </AnimatePresence>

      {!showSplash && (
        <div className="min-h-screen flex flex-col bg-accent text-textMain dark:bg-darkAccent dark:text-darkText transition-colors duration-300">
          <AnnouncementBar />
          <Header />
          <AnimatedRoutes />
          <Footer />
        </div>
      )}
    </BrowserRouter>
  );
}
