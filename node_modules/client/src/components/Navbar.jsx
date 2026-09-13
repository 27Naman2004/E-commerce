import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCartCount, toggleCart } from '../redux/slices/cartSlice';
import { selectCurrentUser, logout } from '../redux/slices/authSlice';
import { ShoppingBagIcon, UserIcon, Bars3Icon, HeartIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useSelector(selectCartCount);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const userDisplay = user?.name || user?.email || user?.phone || 'My Account';
  const userSub = user?.email || user?.phone || '';

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold font-playfair text-secondary">
              🪷 Kanha Collection
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-main-text hover:text-primary font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-main-text hover:text-primary font-medium transition-colors">Shop All</Link>
            <Link to="/shop?category=Dress" className="text-main-text hover:text-primary font-medium transition-colors">Dresses</Link>
            <Link to="/shop?category=Jewellery" className="text-main-text hover:text-primary font-medium transition-colors">Jewellery</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-5">
            {user ? (
              <div className="relative group cursor-pointer">
                <div className="flex items-center gap-1.5 bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-full px-3 py-2 transition-colors">
                  <UserIcon className="h-5 w-5 text-primary" />
                  <span className="hidden md:block text-sm font-semibold text-secondary max-w-[100px] truncate">
                    {user?.name || 'Account'}
                  </span>
                </div>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-pink-100 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-pink-50">
                    <p className="text-sm font-bold text-main-text truncate">{userDisplay}</p>
                    {userSub && userSub !== userDisplay && (
                      <p className="text-xs text-muted-text truncate">{userSub}</p>
                    )}
                  </div>
                  <Link to="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm text-main-text hover:bg-pink-50 hover:text-primary transition-colors">
                    <UserIcon className="w-4 h-4" /> My Account
                  </Link>
                  <Link to="/account/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm text-main-text hover:bg-pink-50 hover:text-primary transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2.5 text-sm text-main-text hover:bg-pink-50 hover:text-primary transition-colors">
                    <HeartIcon className="w-4 h-4" /> Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="border-t border-pink-50 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login"
                className="hidden md:inline-flex items-center gap-1.5 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                <UserIcon className="h-4 w-4" /> Sign In
              </Link>
            )}

            <button 
              className="text-main-text hover:text-primary relative transition-colors" 
              onClick={() => dispatch(toggleCart())}
            >
              <ShoppingBagIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button 
              className="md:hidden text-main-text hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 absolute w-full left-0 z-30 shadow-lg pb-4">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">Home</Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">Shop All</Link>
            <Link to="/shop?category=Dress" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">Dresses</Link>
            <Link to="/shop?category=Jewellery" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">Jewellery</Link>
            {user ? (
              <>
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">My Account</Link>
                <Link to="/account/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">My Orders</Link>
                <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-medium text-main-text hover:bg-pink-50 hover:text-primary rounded-lg">Wishlist</Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 rounded-lg">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-base font-bold text-primary hover:bg-pink-50 rounded-lg">Sign In / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


