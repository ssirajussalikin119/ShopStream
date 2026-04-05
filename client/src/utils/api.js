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
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name: name || email?.split("@")[0] || "User", email, password }),
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
  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data || { product: null, related: [] };
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

export const orderAPI = {
  placeOrder: async (payload) => {
    const response = await api.post("/orders/checkout", payload);
    return response.data;
  },
  getOrders: async () => {
    const response = await api.get("/orders");
    return response.data || [];
  },
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
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

export default api;
