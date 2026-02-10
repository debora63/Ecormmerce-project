import axios from "axios";
import { refreshAccessToken } from "./authService";

// Set the base URL of your Django backend
const BASE_URL = "http://127.0.0.1:8000/";
const API_URL = "http://127.0.0.1:8000/api";  // Set your Django API base URL

// Create an Axios instance with default settings
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//Token Stuff
// ✅ Add Authorization Token Interceptor
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add Token Refresh Logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        console.log("🔄 Refreshing token...");
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          localStorage.setItem("authToken", newAccessToken);
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return api(originalRequest); // Retry request with new token
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Function to fetch products
export const fetchProducts = async () => {
  try {
    const response = await api.get("api/products/");
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error; // You can handle errors in the frontend UI
  }
};

// Function to add a new product (if needed)
export const addProduct = async (productData) => {
  try {
    const response = await api.post("api/products/", productData);
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const registerUser = async (username, password) => {
  try {
    console.log("Registering user at:", `${API_URL}/register/`); // Debugging

    const response = await axios.post(`${API_URL}/register/`, {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Register API error:", error.response || error);
    return error.response?.data || { message: "Server error. Please try again." };
  }
};


export const loginUser = async (username, password) => {
  try {
    console.log("🔑 Sending login request:", { username, password });

    const response = await axios.post("http://127.0.0.1:8000/api/token/", {
      username,
      password,
    });

    if (response.data.access && response.data.refresh) {
      localStorage.setItem("authToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);

      // ✅ Store user info for state persistence
      localStorage.setItem("user", JSON.stringify({ username })); 

      console.log("✅ Login successful! Tokens & user saved.");
      return response.data;
    } else {
      throw new Error("❌ Missing tokens in response.");
    }
  } catch (error) {
    console.error("❌ Login failed:", error.response?.data || error);
    throw error;
  }
};

export const logoutUser = () => {
  console.log("🚪 Logging out...");

  // ✅ Clear localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // ✅ Ensure UI updates immediately
  window.location.href = "/login"; // Redirect
};

// Export the Axios instance (optional, in case you need it somewhere else)
export default api;
