import { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Cart() {
  const { cartItems, updateQty, removeFromCart, subTotal, discountPercent, discountAmount, finalTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-accent dark:bg-darkAccent transition-colors"
      >
        <h2 className="text-4xl font-heading font-bold text-primary dark:text-darkPrimary mb-4 drop-shadow-sm transition-colors">Your Cart is Empty</h2>
        <p className="text-textMain/80 dark:text-darkText/80 mb-10 font-body text-lg transition-colors">It looks like you haven't added any devotional items yet.</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/home" className="bg-primary hover:bg-primaryDark text-white dark:bg-darkPrimary dark:hover:bg-primary px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-md transition-colors">
            Return to Shop
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="bg-accent dark:bg-darkAccent min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-heading font-bold text-primary dark:text-darkPrimary mb-8 border-b-[3px] border-secondary dark:border-darkGold pb-4 drop-shadow-sm transition-colors">Your Divine Cart</h2>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-6">
            {cartItems.map(item => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                key={item.id} 
                className="flex gap-6 bg-surface dark:bg-darkSurface p-5 rounded-2xl shadow-sm border border-borderSoft dark:border-darkBorder transition-colors"
              >
                <img src={item.image} alt={item.name} className="w-28 h-28 object-cover rounded-xl border-2 border-accent dark:border-darkAccent" />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <h3 className="font-heading font-bold text-xl text-textMain dark:text-darkText tracking-wide">{item.name}</h3>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeFromCart(item.id)} className="text-primary dark:text-darkPrimary hover:text-red-700 text-sm font-semibold uppercase tracking-wider underline">Remove</motion.button>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex items-center gap-5 bg-accent dark:bg-darkAccent rounded-lg px-3 py-1 border border-borderSoft dark:border-darkBorder shadow-inner transition-colors">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQty(item.id, -1)} className="text-primary dark:text-darkPrimary font-bold text-xl px-2">-</motion.button>
                      <span className="font-body font-bold text-lg w-6 text-center text-textMain dark:text-darkText">{item.qty}</span>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => updateQty(item.id, 1)} className="text-primary dark:text-darkPrimary font-bold text-xl px-2">+</motion.button>
                    </div>
                    <p className="text-primary dark:text-darkPrimary font-bold text-2xl transition-colors">₹{item.price * item.qty}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="w-full lg:w-[400px] bg-surface dark:bg-darkSurface p-8 rounded-3xl border border-borderSoft dark:border-darkBorder h-fit sticky top-28 shadow-md transition-colors">
            <h3 className="text-3xl font-heading font-bold text-primary dark:text-darkPrimary mb-8 drop-shadow-sm transition-colors">Order Summary</h3>
            <div className="space-y-5 font-body text-textMain dark:text-darkText text-lg transition-colors">
              <div className="flex justify-between border-b border-primary/10 dark:border-darkPrimary/10 pb-4">
                <span className="opacity-80">Subtotal</span>
                <span className="font-bold">₹{subTotal}</span>
              </div>
              {discountAmount > 0 ? (
                <div className="flex justify-between text-[#2e5d32] dark:text-[#81c784] font-semibold border-b border-primary/10 dark:border-darkPrimary/10 pb-4 transition-colors">
                  <span>Discount ({discountPercent}%)</span>
                  <span>- ₹{discountAmount}</span>
                </div>
              ) : (
                <div className="text-sm font-semibold text-primary dark:text-[#FCE4EC] bg-secondary/20 dark:bg-darkPrimary/30 p-3 rounded-lg border border-secondary/50 text-center transition-colors">
                  Add ₹{999 - subTotal} more to get 3% off!
                </div>
              )}
              <div className="pt-2 flex justify-between font-bold text-3xl text-primary dark:text-darkPrimary transition-colors">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
            <motion.button 
              onClick={() => navigate('/checkout')}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-full py-4 mt-10 bg-primary hover:bg-primaryDark text-white dark:bg-darkPrimary dark:hover:bg-primary font-body font-bold rounded-xl shadow-lg transition-colors text-lg uppercase tracking-widest"
            >
              Proceed to Checkout
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
