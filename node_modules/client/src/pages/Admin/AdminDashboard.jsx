import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Tab } from '@headlessui/react';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  ChartBarIcon, ShoppingBagIcon, UsersIcon, TicketIcon, PlusIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for other panels (Simplified for this file)
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Not authorized as admin');
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        // Fetch dashboard stats
        const { data: statsData } = await api.get('/admin/stats');
        setStats(statsData);

        // Fetch recent orders (just a GET to /orders, limited)
        const { data: ordersData } = await api.get('/orders');
        setRecentOrders(ordersData.slice(0, 10)); // Just took top 10

        // Fetch products for product tab
        const { data: prodsData } = await api.get('/products?limit=100');
        setProducts(prodsData.products);

      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [user, navigate]);

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/deliver`, { status });
      setRecentOrders(recentOrders.map(o => o._id === id ? { ...o, orderStatus: status } : o));
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const tabs = [
    { name: 'Dashboard', icon: ChartBarIcon },
    { name: 'Products', icon: ShoppingBagIcon },
    { name: 'Orders', icon: ChartBarIcon },
    { name: 'Customers', icon: UsersIcon },
    { name: 'Coupons', icon: TicketIcon },
  ];

  if (loading) return <div className="p-20 text-center text-saffron text-xl font-bold font-playfair">Loading Admin Workspace...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      
      {/* Top Header */}
      <div className="bg-maroon-dark text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold font-playfair flex items-center">
            <span className="text-saffron mr-2">✦</span> Kanha Admin Portal
          </h1>
          <div className="text-sm">Logged in as <span className="font-bold">{user.name}</span></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 flex flex-col md:flex-row gap-8">
        
        <Tab.Group>
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-24">
              <Tab.List className="flex flex-col space-y-1">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors outline-none w-full ${
                        selected
                          ? 'bg-maroon/10 text-maroon'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 min-h-[60vh] overflow-hidden">
            <Tab.Panels>
              
              {/* Dashboard / Overview Panel */}
              <Tab.Panel className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
                
                {/* Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <p className="text-sm font-medium text-primary mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.totalSales || 0)}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <p className="text-sm font-medium text-blue-800 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">Products</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
                  </div>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-sm font-medium text-purple-800 mb-1">Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                </div>

                {/* Charts */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
                  <div className="h-72 w-full">
                    {stats?.salesByCategory && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.salesByCategory} maxBarSize={50} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                          <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="totalSales" fill="#FF9933" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </Tab.Panel>

              {/* Products Panel */}
              <Tab.Panel className="p-0">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">Products Catalog</h2>
                  <button className="btn-primary flex items-center text-sm py-2 px-4 rounded-lg">
                    <PlusIcon className="w-4 h-4 mr-1" /> Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Product</th>
                        <th className="px-6 py-4 font-medium">Category</th>
                        <th className="px-6 py-4 font-medium">Price</th>
                        <th className="px-6 py-4 font-medium">Stock</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-3 flex items-center">
                            <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded object-cover mr-3 border border-gray-200" />
                            <div className="font-medium text-gray-900 w-48 truncate">{p.name}</div>
                          </td>
                          <td className="px-6 py-3 text-gray-600">{p.category}</td>
                          <td className="px-6 py-3 text-gray-900 font-medium">{formatCurrency(p.price)}</td>
                          <td className="px-6 py-3">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.stock > 10 ? 'bg-green-100 text-green-800' : p.stock > 0 ? 'bg-orange-100 text-primary' : 'bg-red-100 text-red-800'}`}>
                              {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button className="text-saffron hover:text-primary font-medium text-sm mr-3">Edit</button>
                            <button className="text-red-500 hover:text-red-700 font-medium text-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tab.Panel>

              {/* Orders Panel */}
              <Tab.Panel className="p-0">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white text-gray-500 uppercase tracking-wider text-xs border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-medium">Order ID</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">Total</th>
                        <th className="px-6 py-4 font-medium">Status / Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentOrders.map(o => (
                        <tr key={o._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 text-xs font-mono text-gray-500">{o._id}</td>
                          <td className="px-6 py-4 text-gray-600">{new Date(o.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-medium text-gray-900">{o.user?.name || o.shippingAddress?.fullName}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(o.totalPrice)}</td>
                          <td className="px-6 py-4">
                            <select 
                              value={o.orderStatus}
                              onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                              className={`text-xs font-semibold rounded-full px-3 py-1 border-0 focus:ring-0 cursor-pointer
                                ${o.orderStatus === 'Pending' ? 'bg-orange-100 text-primary' :
                                  o.orderStatus === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Tab.Panel>

              {/* Placeholders for others */}
              <Tab.Panel className="p-16 text-center text-gray-500">
                Customers Management UI coming soon.
              </Tab.Panel>
              <Tab.Panel className="p-16 text-center text-gray-500">
                Coupons Management UI coming soon.
              </Tab.Panel>

            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </div>
  );
};

export default AdminDashboard;
