import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Checkout() {
  const { finalTotal, cart, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });

  const nextStep = (e) => {
    e.preventDefault();
    if (step < 3) setStep(step + 1);
    
    if (step === 2) {
      // Trigger order success and cleanup after 3 seconds
      setTimeout(() => {
        cart.forEach(item => removeFromCart(item.id));
        navigate('/home');
      }, 4000);
    }
  };

  return (
    <div className="bg-accent dark:bg-darkAccent transition-colors duration-300 min-h-[80vh] py-16 px-4">
      <div className="max-w-3xl mx-auto bg-surface dark:bg-darkSurface p-8 md:p-12 rounded-3xl shadow-lg border border-borderSoft dark:border-darkBorder transition-colors">
        
        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-borderSoft dark:bg-darkBorder -z-10" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary dark:bg-darkPrimary -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
          {[1, 2, 3].map(num => (
            <div key={num} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors border-[3px]
              ${step >= num ? 'bg-primary dark:bg-darkPrimary border-primary text-white' : 'bg-surface dark:bg-darkSurface border-borderSoft dark:border-darkBorder text-textMuted'}
            `}>
              {num}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: Shipping Details */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-heading font-bold text-textMain dark:text-darkText mb-8">Shipping Address</h2>
              <form onSubmit={nextStep} className="flex flex-col gap-5 font-body">
                <input required type="text" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="bg-transparent border border-borderSoft dark:border-darkBorder rounded-lg p-4 text-textMain dark:text-darkText outline-none focus:border-primary transition-colors" />
                <input required type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="bg-transparent border border-borderSoft dark:border-darkBorder rounded-lg p-4 text-textMain dark:text-darkText outline-none focus:border-primary transition-colors" />
                <textarea required placeholder="Complete Delivery Address" rows="4" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="bg-transparent border border-borderSoft dark:border-darkBorder rounded-lg p-4 text-textMain dark:text-darkText outline-none focus:border-primary transition-colors" />
                <button type="submit" className="bg-gold hover:bg-[#b08e22] text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-md transition-colors mt-4">Continue to Payment</button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Mock Payment */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-3xl font-heading font-bold text-textMain dark:text-darkText mb-8">Secure Payment</h2>
              <div className="bg-accent dark:bg-darkAccent p-6 rounded-xl border border-primary/20 mb-8 flex justify-between items-center transition-colors">
                <span className="font-body text-textMain dark:text-darkText">Amount Payable:</span>
                <span className="text-2xl font-bold text-primary dark:text-darkPrimary">₹{finalTotal}</span>
              </div>
              <form onSubmit={nextStep} className="flex flex-col gap-4">
                <label className="flex items-center gap-4 cursor-pointer p-4 border border-borderSoft dark:border-darkBorder rounded-lg hover:border-primary transition-colors">
                  <input required type="radio" name="payment" className="w-5 h-5 accent-primary" />
                  <span className="font-bold text-textMain dark:text-darkText">UPI (GPay, PhonePe, Paytm)</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer p-4 border border-borderSoft dark:border-darkBorder rounded-lg hover:border-primary transition-colors">
                  <input required type="radio" name="payment" className="w-5 h-5 accent-primary" />
                  <span className="font-bold text-textMain dark:text-darkText">Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer p-4 border border-borderSoft dark:border-darkBorder rounded-lg hover:border-primary transition-colors">
                  <input required type="radio" name="payment" className="w-5 h-5 accent-primary" />
                  <span className="font-bold text-textMain dark:text-darkText">Cash on Delivery (COD)</span>
                </label>
                
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 border border-borderSoft dark:border-darkBorder rounded-xl font-bold text-textMain dark:text-darkText hover:bg-borderSoft/30 transition-colors">Back</button>
                  <button type="submit" className="flex-1 flex justify-center items-center bg-gold hover:bg-[#b08e22] text-white py-4 rounded-xl font-bold uppercase tracking-widest shadow-md transition-colors">Place Order</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* STEP 3: Success Confetti */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-10">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, delay: 0.2 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </motion.div>
              <h2 className="text-3xl font-heading font-bold text-textMain dark:text-darkText mb-4">Order Placed Successfully!</h2>
              <p className="font-body text-textMuted dark:text-darkTextMuted mb-2">Thank you for your devotional purchase, {formData.name}.</p>
              <p className="font-body text-textMuted dark:text-darkTextMuted">You will be redirected back to the shop seamlessly.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
