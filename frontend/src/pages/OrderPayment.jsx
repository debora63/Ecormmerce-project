import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

const OrderPayment = () => {
  const navigate = useNavigate(); 
  const [orderId, setOrderId] = useState(null)
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    mpesa_code: "",
    delivery: false,
    first_name: "",
    last_name: "",
    age: "",
    phone_number: "",
    email: "",
    gender: "Male",
    location: "",
  });

  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    if (storedCart) {
      setCart(storedCart);
      calculateTotal(storedCart);
    }
  }, []);

  useEffect(() => {
    calculateTotal(cart);
  }, [cart]);

  useEffect(() => {
    setFinalTotal(formData.delivery ? totalCost + 1000 : totalCost);
  }, [formData.delivery, totalCost]);

  const calculateTotal = (cartItems) => {
    let total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotalCost(total);
  };
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }
  
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    let token = localStorage.getItem("authToken");

    if (!token) {
        console.error("🚨 No auth token found! Redirecting to homepage.");
        window.location.href = "/";
        return;
    }

    const sanitizedCart = cart.map(({ created_at, ...item }) => item);
    const { created_at, ...cleanedData } = formData;
    const formattedData = { ...cleanedData, cart: sanitizedCart, age: Number(cleanedData.age) };

    console.log("📌 Cleaned data before sending:", JSON.stringify(formattedData, null, 2));

    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/cart/api/orders/",
            formattedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("✅ Order placed successfully:", response.data);

        const successMessage = formData.delivery
            ? `✅ Order Placed Successfully! Delivery in 1 - 4 working days (7 AM - 5 PM). Order ID: ${response.data.order_code}`
            : `✅ Order placed successfully! Pick up your order at Nairobi CBD in 2 hours (6 AM - 8 PM). Order ID: ${response.data.order_code}`;

        setMessage(successMessage);

        // 🚀 Show Alert and Redirect to Orders Page
        window.alert(successMessage);
        navigate("/orders", { state: { message: successMessage } });

    } catch (err) {
        console.error("🚨 Order placement error:", err.response?.data || err);

        if (err.response?.data?.code === "token_not_valid") {
            console.warn("🔄 Token expired, attempting refresh...");
            const refreshed = await refreshToken();

            if (refreshed) {
                token = localStorage.getItem("authToken");
                return handleSubmit(e);
            } else {
                console.error("🚨 Token refresh failed! Redirecting to login.");
                localStorage.removeItem("authToken");
                window.location.href = "/login";
            }
        }

        setError("❌ Failed to place order. Please check your details and try again.");
    }
};

  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white p-4">
      <div className="w-full max-w-2xl bg-gray-900 p-8 shadow-lg rounded-lg">
        
        {/* 🔥 Main Header */}
        <h1 className="text-3xl font-bold text-yellow-400 text-center mb-4">Order Details & Payment</h1>

        {/* M-Pesa Payment Section */}
        <div className="bg-green-700 p-4 rounded-lg mb-4 text-center">
          <h3 className="text-lg font-bold text-white">M-Pesa Payment Details:</h3>
          <p className="text-white text-2xl font-semibold">
            Use Send Money/Pochi La Biashara 07XXXXXXXX
          </p>
          <p className="text-red-300 font-semibold">
            ⚠️ KEEP M-PESA TRANSACTION CODE ! ⚠️
          </p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-blue-400 text-center">Order Payment</h2>
        {message && <p className="text-green-400 text-center">{message}</p>}
        {error && <p className="text-red-400 text-center">{error}</p>}

        {/* Cart Details */}
        {cart.length > 0 ? (
          <div className="bg-black-800 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-bold text-green-300">Your Order:</h3>
            {cart.map((item) => (
              <p key={item.id} className="text-gray-300">
                {item.product.name} x {item.quantity} - Ksh {item.product.price * item.quantity}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No items in your cart</p>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input 
              type="text" 
              name="mpesa_code" 
              placeholder="M-Pesa Code" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
            <p className="text-gray-400 text-sm mt-1">Enter the M-Pesa transaction code.</p>
          </div>

          <div>
            <input 
              type="text" 
              name="first_name" 
              placeholder="First Name" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
          </div>

          <div>
            <input 
              type="text" 
              name="last_name" 
              placeholder="Last Name" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
          </div>

          <div>
            <input 
              type="number" 
              name="age" 
              placeholder="Age" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
          </div>

          {/* Gender Selection */}
          <div>
            <label className="text-gray-300">Gender:</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <input 
              type="text" 
              name="phone_number" 
              placeholder="Phone Number" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
            <p className="text-gray-400 text-sm mt-1">Enter a valid phone number (e.g., 07XXXXXXXX).</p>
          </div>

          <div>
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
          </div>

          <div>
            <input 
              type="text" 
              name="location" 
              placeholder="Location" 
              required 
              className="w-full p-3 bg-gray-800 text-white border border-gray-600 rounded" 
              onChange={handleChange} 
            />
            <p className="text-gray-400 text-sm mt-1">Enter a valid location if for delivery purposes.</p>
          </div>

          {/* Delivery Checkbox */}
          <div className="flex items-center">
            <input 
              type="checkbox" 
              name="delivery" 
              className="mr-2" 
              onChange={handleChange} 
            />
            <label className="text-gray-300">Delivery Required (Extra Ksh 1000 for Transport)</label>
          </div>

          {/* Final Total Cost */}
          <div className="bg-green-800 p-4 rounded-lg mt-4 text-center">
            <h3 className="text-lg font-bold text-white">Final Total Cost:</h3>
            <p className="text-yellow-300 text-2xl font-semibold">Ksh {finalTotal}</p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            ✅ Place Order
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderPayment;
