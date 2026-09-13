import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  selectCartItems, selectCartSubtotal, selectDiscount, 
  clearCart, selectCoupon, applyCoupon, removeCoupon 
} from '../redux/slices/cartSlice';
import { selectCurrentUser } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const shippingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Valid 10-digit phone number required'),
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^[0-9]{6}$/, 'Valid 6-digit pincode required'),
});

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const user = useSelector(selectCurrentUser);
  const cartItems = useSelector(selectCartItems);
  const cartSubtotal = useSelector(selectCartSubtotal);
  const tierDiscount = useSelector(selectDiscount);
  const coupon = useSelector(selectCoupon);

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [shippingAddress, setShippingAddress] = useState(null);
  
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Load Razorpay Script
  useEffect(() => {
    const loadRazorpay = async () => {
      if (window.Razorpay) return;
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    };
    loadRazorpay();
  }, []);

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
    if (!user) {
      toast('Please login to checkout', { icon: '🔐' });
      navigate('/login?redirect=/checkout');
    }
  }, [cartItems, navigate, user]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(shippingSchema),
    defaultValues: user?.addresses?.[0] || {}
  });

  const onShippingSubmit = (data) => {
    setShippingAddress(data);
    setStep(2);
  };

  // Pricing calculations
  // If manual coupon is better than tier discount, use coupon
  let appliedDiscountPercent = tierDiscount.percent;
  let appliedCouponCode = null;
  
  if (coupon && coupon.discountPercent > tierDiscount.percent) {
    appliedDiscountPercent = coupon.discountPercent;
    appliedCouponCode = coupon.code;
  }

  const discountAmount = Math.round((cartSubtotal * appliedDiscountPercent) / 100);
  const itemsSubtotalAfterDiscount = cartSubtotal - discountAmount;
  const shippingPrice = itemsSubtotalAfterDiscount > 499 ? 0 : 49;
  const totalPrice = itemsSubtotalAfterDiscount + shippingPrice;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const { data } = await api.post('/coupons/validate', { code: couponCode, orderTotal: cartSubtotal });
      if (data.discountPercent <= tierDiscount.percent) {
        toast.success(`Coupon valid, but your auto-tier discount (${tierDiscount.percent}%) is better!`);
      } else {
        dispatch(applyCoupon({ code: data.code, discountPercent: data.discountPercent }));
        toast.success(`Coupon applied! ${data.discountPercent}% OFF`);
      }
      setCouponCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const placeOrder = async () => {
    try {
      setPlacingOrder(true);
      const orderData = {
        orderItems: cartItems,
        shippingAddress,
        paymentMethod,
        couponApplied: appliedCouponCode ? { code: appliedCouponCode, discountPercent: appliedDiscountPercent } : null
      };

      const { data: order } = await api.post('/orders', orderData);

      if (paymentMethod === 'COD') {
        dispatch(clearCart());
        navigate(`/order-confirmation/${order._id}`);
      } else {
        // Razorpay flow
        const { data: rzpOrder } = await api.post('/payment/razorpay/create-order', {
          amount: totalPrice,
          receipt: order._id,
        });

        const options = {
          key: rzpOrder.keyId,
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "Kanha Collection",
          description: `Order #${order._id}`,
          order_id: rzpOrder.orderId,
          handler: async (response) => {
            try {
              // Verify payment signature
              await api.post('/payment/razorpay/verify', {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              
              // Mark order as paid
              await api.put(`/orders/${order._id}/pay`, {
                paymentResult: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  status: 'Success'
                }
              });

              dispatch(clearCart());
              navigate(`/order-confirmation/${order._id}`);
            } catch (err) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: shippingAddress.phone,
          },
          theme: {
            color: "#FF9933"
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response){
          toast.error(response.error.description);
        });
        rzp.open();
        setPlacingOrder(false); // Enable button if they close modal
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Order creation failed');
      setPlacingOrder(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* Left Side: Steps (Shipping, Payment, Review) */}
        <div className="flex-1">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {['Shipping', 'Payment', 'Review'].map((s, i) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-2 ${step > i+1 ? 'bg-green-500 text-white' : step === i+1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {step > i+1 ? <CheckCircleIcon className="w-5 h-5" /> : i+1}
                </div>
                <span className={`text-xs uppercase font-semibold ${step >= i+1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</span>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            
            {/* STEP 1: SHIPPING */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Shipping Address</h2>
                <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input {...register('fullName')} className={`input-field ${errors.fullName ? 'border-red-500' : ''}`} />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                      <input type="tel" {...register('phone')} className={`input-field ${errors.phone ? 'border-red-500' : ''}`} />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input {...register('line1')} placeholder="House/Flat No., Building Name, Street" className={`input-field ${errors.line1 ? 'border-red-500' : ''}`} />
                    {errors.line1 && <p className="text-red-500 text-xs mt-1">{errors.line1.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input {...register('line2')} placeholder="Landmark, Area, etc." className="input-field" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input {...register('city')} className={`input-field ${errors.city ? 'border-red-500' : ''}`} />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                      <input {...register('state')} className={`input-field ${errors.state ? 'border-red-500' : ''}`} />
                      {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                      <input {...register('pincode')} maxLength="6" className={`input-field ${errors.pincode ? 'border-red-500' : ''}`} />
                      {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode.message}</p>}
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="btn-primary px-8">Continue to Payment</button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2: PAYMENT */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  <label className={`block flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'Razorpay' ? 'border-primary bg-[var(--color-soft-bg)]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary focus:ring-primary" />
                    <div className="ml-4">
                      <span className="block font-semibold text-gray-900">Pay Online (UPI, Cards, NetBanking)</span>
                      <span className="block text-sm text-gray-500 mt-1">Secured by Razorpay. Recommended & fastest delivery.</span>
                    </div>
                  </label>

                  <label className={`block flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-primary bg-[var(--color-soft-bg)]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-primary focus:ring-primary" />
                    <div className="ml-4">
                      <span className="block font-semibold text-gray-900">Cash on Delivery (COD)</span>
                      <span className="block text-sm text-gray-500 mt-1">Pay when you receive the order at your doorstep.</span>
                    </div>
                  </label>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="btn-secondary px-6">Back to Shipping</button>
                  <button onClick={() => setStep(3)} className="btn-primary px-8">Review Order</button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Review Order</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Shipping To:</h3>
                    <p className="text-gray-600 text-sm">{shippingAddress.fullName} ({shippingAddress.phone})</p>
                    <p className="text-gray-600 text-sm mt-1">{shippingAddress.line1}, {shippingAddress.line2}</p>
                    <p className="text-gray-600 text-sm">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                    <button onClick={() => setStep(1)} className="text-primary text-sm font-medium mt-2 hover:underline">Edit Address</button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Method:</h3>
                    <p className="text-gray-600 font-medium">
                      {paymentMethod === 'Razorpay' ? '💳 Online Payment (Razorpay)' : '💵 Cash on Delivery'}
                    </p>
                    <button onClick={() => setStep(2)} className="text-primary text-sm font-medium mt-2 hover:underline">Change Method</button>
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(2)} className="text-gray-500 font-medium hover:text-gray-700">Back</button>
                  <button onClick={placeOrder} disabled={placingOrder} className="btn-primary px-10 text-lg shadow-lg">
                    {placingOrder ? 'Processing...' : paymentMethod === 'Razorpay' ? 'Pay Now' : 'Place Order'}
                  </button>
                </div>
                
                {paymentMethod === 'Razorpay' && (
                  <p className="text-xs text-center text-gray-500 mt-4">
                    Clicking "Pay Now" will securely redirect you to Razorpay.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Order Summary ({cartItems.length} items)</h3>
            
            <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="flex gap-4">
                  <div className="relative w-16 h-16 rounded-md border border-gray-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">{item.qty}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</span>
                    {item.size && <span className="text-xs text-gray-500 mt-0.5">Size: {item.size}</span>}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm flex items-center">
                    {formatCurrency(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Section */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">Have a coupon code?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)} 
                  placeholder="Enter code" 
                  className="input-field py-2 bg-gray-50 text-sm uppercase"
                  disabled={!!coupon}
                />
                {!coupon ? (
                  <button onClick={handleApplyCoupon} disabled={couponLoading} className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition">
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                ) : (
                  <button onClick={() => dispatch(removeCoupon())} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition">
                    Remove
                  </button>
                )}
              </div>
              {appliedCouponCode && (
                <p className="text-green-600 text-xs font-medium mt-2">Coupon '{appliedCouponCode}' applied successfully!</p>
              )}
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 pt-4 border-t border-gray-100 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              
              {appliedDiscountPercent > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedDiscountPercent}%) 
                    <span className="text-xs ml-1 text-green-500 font-normal">
                      {appliedCouponCode ? `(Code)` : `(Tier)`}
                    </span>
                  </span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>{shippingPrice === 0 ? <span className="text-green-600 font-medium">Free</span> : formatCurrency(shippingPrice)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-gray-900">{formatCurrency(totalPrice)}</span>
            </div>
            {shippingPrice > 0 && (
              <p className="text-xs text-primary text-center mt-3 font-medium">
                Add {formatCurrency(500 - itemsSubtotalAfterDiscount)} more to get FREE shipping!
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
