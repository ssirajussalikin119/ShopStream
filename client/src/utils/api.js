import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// Return response.data so callers get { success, message, data } directly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

export const authAPI = {
  register: (email, password, accountType = "customer") => {
    const fallbackName = email?.split("@")[0]?.trim() || "User";
    return api.post("/auth/register", {
      name: fallbackName,
      email,
      password,
      accountType,
    });
  },
  login: (email, password) => api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
};

export const productAPI = {
  getFeatured: async () => {
    const response = await api.get("/products/featured");
    return response.data || [];
  },
  getByCategory: async (params) => {
    const response = await api.get("/products", { params });
    return response.data || { products: [], filters: {} };
  },
  getByIds: async (ids = []) => {
    if (!ids.length) return [];
    const response = await api.get("/products/by-ids", {
      params: { ids: ids.join(",") },
    });
    return response.data || [];
  },
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    // response is already { success, message, data } — data holds { product, related }
    return response.data || { product: null, related: [] };
  },
  search: async (query) => {
    const response = await api.get("/products/search", {
      params: { q: query },
    });
    return response.data || [];
  },
  getReviews: async (id) => {
    const response = await api.get(`/products/${id}/reviews`);
    return response.data || [];
  },
  addReview: async (id, payload) => {
    const response = await api.post(`/products/${id}/reviews`, payload);
    return response.data;
  },
};

export const cartAPI = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data || { items: [], itemCount: 0, subtotal: 0 };
  },
  addItem: async (productId, quantity = 1) => {
    const response = await api.post("/cart/items", { productId, quantity });
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
    const response = await api.delete("/cart");
    return response.data;
  },
};

// Used by CartContext checkout()
export const orderAPI = {
  placeOrder: async (payload) => {
    const response = await api.post("/orders/checkout", payload);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get("/orders");
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return response?.data?.orders || response?.orders || [];
  },
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response?.data || response;
  },
};

export const offerAPI = {
  getOffers: async (params) => {
    const response = await api.get("/offers", { params });
    return response.data || [];
  },
  validateCode: async (code) => {
    const response = await api.get(`/offers/validate/${code}`);
    return response.data;
  },
};

export const newsletterAPI = {
  subscribe: (email) => api.post("/newsletter/subscribe", { email }),
};

export const aiAPI = {
  sendMessage: (message) => api.post("/ai/chat", { message }),
};

export const profileAPI = {
  getDashboard: () => api.get("/profile/dashboard"),
};

// ordersAPI: used by Profile.jsx for order list + reorder
export const ordersAPI = {
  getMyOrders: () => api.get("/orders"),
  reorder: (orderId) => api.post(`/orders/${orderId}/reorder`),
};

export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addItem: (productId) => api.post("/wishlist/items", { productId }),
  removeItem: (productId) => api.delete(`/wishlist/items/${productId}`),
};

export const sellerAPI = {
  getProfile: () => api.get("/seller/profile"),
  updateProfile: (payload) => api.put("/seller/profile", payload),
  getProducts: () => api.get("/seller/products"),
  getOrders: () => api.get("/seller/orders"),
  updateOrderStatus: (orderId, status) =>
    api.patch(`/seller/orders/${orderId}/status`, { status }),
  addProduct: (payload) => api.post("/seller/products", payload),
  updateProduct: (productId, payload) =>
    api.put(`/seller/products/${productId}`, payload),
  deleteProduct: (productId) => api.delete(`/seller/products/${productId}`),
  toggleStatus: (productId) =>
    api.patch(`/seller/products/${productId}/status`),
};

export const paymentAPI = {
  initiate: async (productId, amount, customerInfo) => {
    const response = await api.post("/payment/initiate", {
      productId,
      amount,
      customerInfo,
    });
    return response;
  },
};

export default api;
