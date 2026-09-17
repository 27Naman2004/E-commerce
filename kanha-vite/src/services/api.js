import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enables sending HTTP-only refresh token cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kanha_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        if (refreshResponse.data?.success && refreshResponse.data?.data?.accessToken) {
          const newToken = refreshResponse.data.data.accessToken;
          localStorage.setItem('kanha_access_token', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('kanha_access_token');
        localStorage.removeItem('kanha_user');
        window.dispatchEvent(new Event('auth:logout'));
      }
    }
    return Promise.reject(error);
  }
);

// API Service Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const productApi = {
  getProducts: (params) => api.get('/products', { params }),
  getProductBySlug: (slug) => api.get(`/products/${slug}`),
  getProductById: (id) => api.get(`/products/id/${id}`),
};

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (variantId, quantity = 1) => api.post('/cart/items', { variantId, quantity }),
  updateQuantity: (cartItemId, quantity) => api.put(`/cart/items/${cartItemId}`, { quantity }),
  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  clearCart: () => api.delete('/cart'),
};

export const orderApi = {
  checkout: (data) => api.post('/orders/checkout', data),
  getUserOrders: (page = 0, size = 10) => api.get('/orders/me', { params: { page, size } }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => api.delete(`/orders/${orderId}/cancel`),
};

export const paymentApi = {
  createRazorpayOrder: (orderId) => api.post(`/payments/create-order/${orderId}`),
  verifySignature: (data) => api.post('/payments/verify-signature', data),
};

export const couponApi = {
  validateCoupon: (data) => api.post('/coupons/validate', data),
};

export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (addressId, data) => api.put(`/users/addresses/${addressId}`, data),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  setDefaultAddress: (addressId) => api.patch(`/users/addresses/${addressId}/default`),
};

export default api;
