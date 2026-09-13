import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { formatCurrency } from '../utils/formatCurrency';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="min-h-screen py-20 flex justify-center text-primary">Loading Order...</div>;
  if (!order) return <div className="text-center py-20 text-red-500">Order not found</div>;

  return (
    <div className="bg-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-[var(--color-soft-bg)] px-6 py-8 text-center border-b border-[var(--color-border)]">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Jai Shri Krishna 🙏 Thank you for your order.</p>
          <p className="font-medium text-gray-900 mt-2">Order ID: #{order._id}</p>
        </div>

        <div className="p-6 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-3">Shipping Address</h3>
              <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
              <p className="text-gray-600 text-sm mt-1">{order.shippingAddress.line1}, {order.shippingAddress.line2}</p>
              <p className="text-gray-600 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="text-gray-600 text-sm mt-1">Phone: {order.shippingAddress.phone}</p>
            </div>
            <div>
              <h3 className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-3">Payment Info</h3>
              <p className="text-gray-600"><span className="font-semibold">Method:</span> {order.paymentMethod}</p>
              <p className="text-gray-600"><span className="font-semibold">Status:</span> {order.isPaid ? <span className="text-green-600 font-bold">Paid</span> : <span className="text-primary font-bold">Pending (COD)</span>}</p>
              {order.isPaid && order.paymentResult?.razorpayPaymentId && (
                <p className="text-gray-500 text-xs mt-1">Txn: {order.paymentResult.razorpayPaymentId}</p>
              )}
            </div>
          </div>

          <h3 className="text-gray-500 uppercase tracking-wider text-xs font-bold mb-4">Order Items</h3>
          <div className="space-y-4 mb-8 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {order.orderItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="w-12 h-16 object-cover rounded-md" />
                  <div>
                    <Link to={`/product/${item.product}`} className="font-semibold text-gray-900 hover:text-maroon line-clamp-1">{item.name}</Link>
                    <p className="text-xs text-gray-500">Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</p>
                  </div>
                </div>
                <div className="font-semibold text-gray-900 ml-4 whitespace-nowrap">
                  {formatCurrency(item.price * item.qty)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3 max-w-xs ml-auto">
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.itemsPrice)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>Discount {order.couponApplied?.code ? `(${order.couponApplied.code})` : ''}</span>
                <span>- {formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600 text-sm">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : formatCurrency(order.shippingPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-xl border-t border-gray-200 pt-3 mt-3">
              <span>Total</span>
              <span>{formatCurrency(order.totalPrice)}</span>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link to="/shop" className="btn-secondary px-8 py-3 outline-none">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
