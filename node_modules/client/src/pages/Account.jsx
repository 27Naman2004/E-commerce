import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser, setCredentials } from '../redux/slices/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { formatCurrency } from '../utils/formatCurrency';
import { Link } from 'react-router-dom';
import { UserCircleIcon, MapPinIcon, ShoppingBagIcon, HeartIcon } from '@heroicons/react/24/outline';

const Account = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get('/orders/myorders');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchMyOrders();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const res = await api.put('/auth/profile', { name, email, password });
      dispatch(setCredentials(res.data));
      toast.success('Profile updated successfully');
      setPassword(''); // Clear password field
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (!user) return <div className="p-20 text-center">Please log in.</div>;

  const tabs = [
    { name: 'Profile', icon: UserCircleIcon },
    { name: 'My Orders', icon: ShoppingBagIcon },
    { name: 'Addresses', icon: MapPinIcon },
    { name: 'Wishlist', icon: HeartIcon },
  ];

  return (
    <div className="bg-cream min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold font-playfair text-maroon mb-8">My Account</h1>
        
        <Tab.Group>
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar */}
            <div className="md:w-64 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24 space-y-2">
                <div className="p-4 mb-4 bg-[var(--color-soft-bg)] rounded-xl border border-[var(--color-border)] text-center">
                  <div className="w-16 h-16 bg-saffron text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>

                <Tab.List className="flex flex-col space-y-1">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab.name}
                      className={({ selected }) =>
                        `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors outline-none ${
                          selected
                            ? 'bg-saffron text-white shadow-sm'
                            : 'text-gray-600 hover:bg-[var(--color-soft-bg)] hover:text-primary'
                        }`
                      }
                    >
                      <tab.icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </Tab>
                  ))}
                </Tab.List>
              </div>
            </div>

            {/* Panels */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
              <Tab.Panels>
                
                {/* Profile Panel */}
                <Tab.Panel>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
                  
                  <form onSubmit={handleUpdateProfile} className="max-w-md space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="input-field" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="input-field" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                      <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="input-field" 
                        placeholder="••••••••" 
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={updatingProfile}
                      className="btn-primary w-full py-2.5 mt-4"
                    >
                      {updatingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </Tab.Panel>

                {/* Orders Panel */}
                <Tab.Panel>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Order History</h2>
                  
                  {loadingOrders ? (
                    <div className="text-gray-500 py-10 flex justify-center">Loading orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                      <p className="text-gray-500 mb-6">You haven't placed any orders with us.</p>
                      <Link to="/shop" className="btn-secondary">Start Shopping</Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map((order) => (
                        <div key={order._id} className="bg-white border text-left border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Order Placed</p>
                              <p className="text-sm font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Total</p>
                              <p className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold
                                ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                  order.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' : 
                                  'bg-orange-100 text-primary'}`}>
                                {order.orderStatus}
                              </span>
                            </div>
                            <div>
                              <Link to={`/order-confirmation/${order._id}`} className="text-primary hover:text-primary text-sm font-medium border border-orange-200 rounded-md px-3 py-1.5 hover:bg-[var(--color-soft-bg)] transition">
                                View Details
                              </Link>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <div className="flex gap-4 overflow-x-auto pb-2">
                              {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 relative group">
                                  <Link to={`/product/${item.product}`}>
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md border border-gray-200" />
                                    <div className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <span className="text-white text-xs font-medium">View</span>
                                    </div>
                                  </Link>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Tab.Panel>

                {/* Addresses Panel (Placeholder/Basic UI) */}
                <Tab.Panel>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">Saved Addresses</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {user.addresses?.map((addr, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-5 relative">
                        <span className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">Default</span>
                        <h4 className="font-semibold text-gray-900 mb-2">{addr.fullName}</h4>
                        <p className="text-sm text-gray-600">{addr.line1}</p>
                        {addr.line2 && <p className="text-sm text-gray-600">{addr.line2}</p>}
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                        <p className="text-sm text-gray-600 mt-2 font-medium">Ph: {addr.phone}</p>
                      </div>
                    ))}
                    {(!user.addresses || user.addresses.length === 0) && (
                      <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
                        No addresses saved yet. Addresses are saved automatically at checkout.
                      </div>
                    )}
                  </div>
                </Tab.Panel>

                {/* Wishlist Panel */}
                <Tab.Panel>
                  <h2 className="text-2xl font-bold font-playfair text-gray-900 mb-6 border-b border-gray-100 pb-4">My Wishlist</h2>
                  
                  {(!user.wishlist || user.wishlist.length === 0) ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Your wishlist is empty</h3>
                      <p className="text-gray-500 mb-6">Save items you like to your wishlist to view them later.</p>
                      <Link to="/shop" className="btn-secondary">Explore Collection</Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                      {/* Would map over actual wishlist products here if populated */}
                      <p className="col-span-full py-10 text-center text-gray-500">Wishlist feature coming soon!</p>
                    </div>
                  )}
                </Tab.Panel>

              </Tab.Panels>
            </div>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
};

export default Account;
