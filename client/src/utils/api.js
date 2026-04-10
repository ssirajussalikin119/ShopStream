import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(
      '[API Interceptor] Response success:',
      response.config.url,
      response.status,
      response.data
    );
    return response.data;
  },
  (error) => {
    console.error(
      '[API Interceptor] Response error:',
      error.config?.url,
      error.response?.status,
      error.response?.data
    );
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  register: (email, password, accountType = 'customer') => {
    const fallbackName = email?.split('@')[0]?.trim() || 'User';
    return api.post('/auth/register', {
      name: fallbackName,
      email,
      password,
      accountType,
    });
  },
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
};

export const productAPI = {
  getFeatured: async () => {
    const response = await api.get('/products/featured');
    return response.data || [];
  },
  getByCategory: async (params) => {
    const response = await api.get('/products', { params });
    return response.data || { products: [], filters: {} };
  },
  search: async (query) => {
    const response = await api.get('/products/search', {
      params: { q: query },
    });
    return response.data || [];
  },
};

export const cartAPI = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data || { items: [], itemCount: 0, subtotal: 0 };
  },
  addItem: async (productId, quantity = 1) => {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  },
  updateItem: async (productId, quantity) => {
    const response = await api.patch(`/cart/items/${productId}`, { quantity });
    return response.data;
  },
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
  checkout: async () => {
    const response = await api.post('/cart/checkout');
    return response.data;
  },
};

export const profileAPI = {
  getDashboard: () => api.get('/profile/dashboard'),
};

export const ordersAPI = {
  getMyOrders: () => api.get('/orders'),
  reorder: (orderId) => api.post(`/orders/${orderId}/reorder`),
};

export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addItem: (productId) => api.post('/wishlist/items', { productId }),
  removeItem: (productId) => api.delete(`/wishlist/items/${productId}`),
};

export const sellerAPI = {
  getProfile: () => api.get('/seller/profile'),
  updateProfile: (payload) => api.put('/seller/profile', payload),
  getProducts: () => api.get('/seller/products'),
  addProduct: (payload) => api.post('/seller/products', payload),
  updateProduct: (productId, payload) =>
    api.put(`/seller/products/${productId}`, payload),
  deleteProduct: (productId) => api.delete(`/seller/products/${productId}`),
  toggleStatus: (productId) =>
    api.patch(`/seller/products/${productId}/status`),
};

export default api;
