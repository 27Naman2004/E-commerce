import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartSubtotal, selectDiscount, removeFromCart, updateQty } from '../redux/slices/cartSlice';
import { formatCurrency, getNextTierMessage } from '../utils/formatCurrency';
import { TrashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const discount = useSelector(selectDiscount);

  const discountAmount = Math.round((subtotal * discount.percent) / 100);
  const total = subtotal - discountAmount;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream px-4 text-center">
        <img src="https://placehold.co/200x200/FFF8F0/D4AF37?text=Empty+Cart" alt="Empty" className="w-48 h-48 rounded-full mb-8 opacity-50" />
        <h2 className="text-3xl font-bold font-playfair text-maroon mb-4">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 max-w-md">You have not added any items yet. Browse our collection of divine products for Laddu Gopal Ji.</p>
        <Link to="/shop" className="btn-primary">Shop Now</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl font-bold font-playfair text-maroon mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          {/* Discount Banner */}
          <div className="bg-[var(--color-soft-bg)] border border-orange-200 rounded-lg p-4 mb-6 text-primary flex items-center justify-between">
            <span className="font-medium">{getNextTierMessage(subtotal)}</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-200 hidden sm:table-header-group">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Quantity</th>
                  <th className="px-6 py-4 font-semibold text-gray-700">Total</th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={`${item._id}-${item.size}`} className="flex flex-col sm:table-row py-4 sm:py-0">
                    <td className="px-4 sm:px-6 py-4 flex items-center">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-md border border-gray-200 mr-4 shrink-0" />
                      <div className="flex flex-col">
                        <Link to={`/product/${item.slug}`} className="font-semibold text-gray-900 hover:text-maroon line-clamp-2">
                          {item.name}
                        </Link>
                        <span className="text-sm text-gray-500 mt-1">{item.size ? `Size: ${item.size}` : 'Standard'}</span>
                        <span className="text-sm font-medium text-gray-900 mt-2 sm:hidden">{formatCurrency(item.price)}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-middle">
                      <div className="flex items-center border border-gray-300 rounded-lg w-24">
                        <button onClick={() => dispatch(updateQty({ id: item._id, size: item.size, qty: item.qty - 1 }))} disabled={item.qty <= 1} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-50">-</button>
                        <span className="flex-1 text-center font-medium text-sm">{item.qty}</span>
                        <button onClick={() => dispatch(updateQty({ id: item._id, size: item.size, qty: item.qty + 1 }))} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-middle font-semibold text-gray-900 hidden sm:table-cell">
                      {formatCurrency(item.price * item.qty)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 align-middle text-left sm:text-right">
                      <button 
                        onClick={() => dispatch(removeFromCart({ id: item._id, size: item.size }))}
                        className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium"
                      >
                        <TrashIcon className="w-5 h-5 mr-1" />
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold font-playfair text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({cartItems.reduce((a,c) => a+c.qty, 0)} items)</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Tier Discount ({discount.percent}%)</span>
                  <span>- {formatCurrency(discountAmount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mb-8">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-gray-900">{formatCurrency(total)}</span>
                  <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full flex justify-center items-center py-4 text-lg rounded-xl"
            >
              Checkout Now <ArrowRightIcon className="w-5 h-5 ml-2" />
            </button>
            
            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-center text-xs text-gray-500">
              <div className="p-3 bg-gray-50 rounded-lg">🔒 Secure Payment</div>
              <div className="p-3 bg-gray-50 rounded-lg">📦 Fast Dispatch</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
