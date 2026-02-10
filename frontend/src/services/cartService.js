import axios from "axios";
import { refreshAccessToken } from "./authService";

const API_BASE_URL = "http://127.0.0.1:8000/";

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

    // 🔍 Ensure `cart` is always an array
    if (Array.isArray(data.cart)) {
      return data.cart; // ✅ If API returns an array, use it directly
    } else if (typeof data.cart === "object" && data.cart !== null) {
      return Object.values(data.cart); // ✅ Convert object to an array
    } else {
      return []; // ✅ Return an empty array as fallback
    }

  } catch (error) {
    console.error("🚨 Error fetching cart:", error);
    return []; // ✅ Ensure an array is always returned
  }
};

export const removeItem = async (id) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ Access token missing. Please log in again.");
      return false;
    }

    // ✅ Ensure API URL is formatted correctly
    const url = `http://127.0.0.1:8000/api/cart/${id}/`.replace(/([^:]\/)\/+/g, "$1");

    console.log(`🔹 Deleting item: ${id}, URL: ${url}`); // Debugging

    const response = await axios.delete(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`✅ Item ${id} removed successfully`);
    return true;
  } catch (error) {
    console.error("🚨 Error removing item:", error.response?.data || error);
    return false;
  }
};

export const updateQuantity = async (id, quantity) => {
  try {
    const token = await getAuthToken(); // ✅ Get the latest valid token
    if (!token) {
      console.error("⚠️ No valid token found. Please log in again.");
      return false;
    }

    await axios.patch(
      `${API_BASE_URL}cart/${id}/`,
      { quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
  } catch (error) {
    console.error("🚨 Error updating quantity:", error.response?.data || error);
    return false;
  }
};
  