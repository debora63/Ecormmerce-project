import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/";

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

// Interceptor to attach token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken"); // Get token from storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Attach token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("🚨 No refresh token found.");
      return false;
    }

    const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
      refresh: refreshToken,
    });

    const newAccessToken = response.data.access;
    localStorage.setItem("token", newAccessToken);
    console.log("✅ Token refreshed:", newAccessToken);
    return newAccessToken;
  } catch (error) {
    console.error("🚨 Failed to refresh token:", error.response?.data || error);
    return false;
  }
};

// Register function
export const registerUser = async (username, password) => {
  return apiClient.post("register/", { username, password });
};

export const loginUser = async (username, password) => {
  try {
    console.log("Sending login request:", { username, password });

    // ✅ Correct token endpoint
    const response = await axios.post("http://127.0.0.1:8000/api/token/", {
      username,
      password,
    });

    console.log("Response data:", response.data);

    if (response.data.access && response.data.refresh) {
      localStorage.setItem("authToken", response.data.access); // Save access token
      localStorage.setItem("refreshToken", response.data.refresh); // Save refresh token
    } else {
      throw new Error("Access or refresh token missing in response");
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error.response ? error.response.data : error);
    throw error;
  }
};

export const fetchCart = async () => {
  try {
      const token = localStorage.getItem("authToken");

      const response = await fetch("http://127.0.0.1:8000/cart/", {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json",
              "Content-Type": "application/json",
          },
      });

      const text = await response.text();
      console.log("📡 RAW RESPONSE:", text);

      if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
      }

      const data = JSON.parse(text);
      console.log("✅ Parsed JSON:", data);
      return data.cart;  // ✅ Make sure it returns the cart array

  } catch (error) {
      console.error("🚨 Error fetching cart:", error);
      return [];  // Return an empty array if there's an error
  }
};
