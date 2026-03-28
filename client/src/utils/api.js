import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear auth
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error.message);
  },
);

// Auth endpoints
export const authAPI = {
  register: (email, password) => {
    const fallbackName = email?.split("@")[0]?.trim() || "User";
    return api.post("/auth/register", {
      name: fallbackName,
      email,
      password,
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
};

export default api;
