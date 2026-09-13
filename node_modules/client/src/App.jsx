import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Routing Guards
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoutes';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import AdminDashboard from './pages/Admin/AdminDashboard';

// Helper to wrap pages for exit animations
const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes (Logged in Users) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account/*" element={<Account />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<div className="min-h-[60vh] flex items-center justify-center text-2xl font-bold font-playfair text-maroon">404 - Page Not Found</div>} />
      </Routes>
    </AnimatePresence>
  );
};

const AnnouncementBar = () => (
  <div className="bg-secondary text-white text-center py-2 px-4 text-sm font-medium tracking-wide">
    ✨ Spring Navratri Sale: Enjoy 20% off on all Premium Laddu Gopal Poshaks. <span className="font-bold underline ml-1 cursor-pointer">Shop Now</span>
  </div>
);

const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: { background: '#333', color: '#fff' },
            success: { iconTheme: { primary: '#10B981', secondary: '#fff' } }
          }} 
        />
        <AnnouncementBar />
        <Navbar />
        <CartDrawer />
        
        <main className="flex-grow">
          <AnimatedRoutes />
        </main>
        
        <Footer />
      </div>
    </Router>
  );
};

export default App;
