import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const API_URL = "http://127.0.0.1:8000/cart/api/orders/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
  },
});

// Function to attach Authorization header dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const OrderTracking = () => {
  const [orderCode, setOrderCode] = useState("");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  
  const fetchAllOrders = async () => {
    try {
      console.log("📡 Fetching orders from API...");
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("🚨 No auth token found! Redirecting to login.");
        window.location.href = "/login";
        return;
      }

      const response = await axios.get("http://127.0.0.1:8000/cart/api/orders/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Orders response:", response.data);
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error("🚨 Error fetching orders:", err.response?.data || err);

      if (err.response?.data?.code === "token_not_valid") {
        console.warn("🔄 Token expired, redirecting to login.");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      }

      setError("❌ Error fetching orders. Please try again.");
    }
  };

  const handleSearch = () => {
    if (orderCode.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.order_code.toLowerCase().includes(orderCode.toLowerCase())
      );
      setFilteredOrders(filtered);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const cancelOrder = async (id) => {
    try {
      await axiosInstance.post(`/${id}/cancel/`);
      alert("🚫 Order canceled successfully!");
      fetchAllOrders();
    } catch (error) {
      console.error("Error canceling order", error);
    }
  };

  // Function to calculate the total cost of an order
  const DELIVERY_FEE = 1000; // ✅ Define delivery cost

const calculateTotalCost = (items, deliveryRequired) => {
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    return deliveryRequired ? total + DELIVERY_FEE : total; // ✅ Add delivery fee if selected
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 to-indigo-200 p-6">
      {/* Centered Heading */}
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
        📦  Track Your Orders 📦
      </h2>

      {/* Search Bar */}
      <div className="mb-4 flex gap-2 max-w-3xl mx-auto">
        <input
          type="text"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
          placeholder="Enter Order Code"
          className="flex-grow p-3 border border-gray-400 rounded shadow text-gray-900 bg-white"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-bold"
        >
          🔍 Search
        </button>
      </div>

      {error && <p className="text-red-600 font-semibold text-center">{error}</p>}
        
      {/* Orders List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-900 text-center font-semibold">
            No orders found.
          </p>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-400 rounded-lg p-4 shadow-lg transition-all"
            >
              {/* Order Summary (Click to Expand) */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <span className="text-xl font-bold text-gray-900">
                  {order.order_code}
                </span>

                <div className="flex items-center gap-3">
                <span className="text-gray-800 font-medium">
                📅Date Ordered: {(() => {
                    const date = moment(order.created_at); // Parse the date directly without specifying a format
                    return date.isValid() ? date.format("MMMM Do YYYY, h:mm a") : "Invalid Date";
                })()}
                </span>
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-bold ${
                      order.status === "Pending"
                        ? "bg-yellow-400 text-black"
                        : order.status === "Shipping"
                        ? "bg-blue-500 text-white"
                        : order.status === "Delivered"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Total Cost */}
              <div className="flex justify-between mt-4">
                <span className="text-lg font-semibold text-gray-900">Total Cost:</span>
                <span className="text-lg font-bold text-gray-900">
                    Ksh{" "}
                    {calculateTotalCost(order.items, order.delivery).toLocaleString()}
                </span>
              </div>

              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="mt-4 border-t pt-4">
                    <h3 className="text-lg font-bold text-gray-900">
                    🛍 Ordered Items
                    </h3>
                    <div className="space-y-4">
                    {order.items.map((item) => {
                console.log("Item Product Object:", item.product);  // Log the product object

                return (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-4 bg-gray-100 p-3 rounded-md"
                    >
                      <img
                        src={item.product.image || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <div>
                        <p className="text-gray-900 font-semibold">
                          {item.product.name}
                        </p>
                        <p className="text-gray-800">Qty: {item.quantity}</p>
                        <p className="text-gray-900 font-bold">
                        💰Ksh{" "}
                          {isNaN(item.product?.price) || isNaN(item.quantity)
                            ? "Invalid Price/Quantity"
                            : (Number(item.product?.price) * Number(item.quantity))
                                .toLocaleString()} {/* Total cost with commas */}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Cancel Order Button (Only for Pending Orders) */}
            {order.status === "Pending" && (
            <button
                onClick={() => cancelOrder(order.id)}
                className="mt-4 bg-red-600 text-white px-5 py-2 rounded-md hover:bg-red-700 transition font-bold"
            >
                🚫 Cancel Order
            </button>
            )}
        </div>
        )}
            </div>
          ))
        )}
        {/* Return to Home Button */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-bold"
        >
          🏠 Return to Home
        </button>
      </div>
      </div>
    </div>
  );
};

export default OrderTracking;
