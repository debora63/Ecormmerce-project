import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { fetchCart } from "../services/cartService";
import { registerUser } from "../services/api";
import api from "../services/api"; // Adjust the path based on your project structure
import "./Home.css";

const Home = () => {
  const BASE_MEDIA_URL = "http://127.0.0.1:8000"; 
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("authToken") // ✅ Remove the semicolon (;)
  );
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isAdding, setIsAdding] = useState(false);


  const togglePassword = () => {
    setShowPassword(!showPassword);
  };
  // Login form state
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    console.log("🛒 Products Data:", products); // Log only when products update

    fetch("http://127.0.0.1:8000/api/products/")
      .then((response) => response.json())
      .then((data) => {
        const updatedData = data.map((product) => ({
          ...product,
          stock: Number(product.stock) || 0, // Ensure stock is always a number
        }));

        setTimeout(() => {
          setProducts(updatedData);
          setLoading(false);
        }, 500); // Delay hiding loading by 3 seconds
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setTimeout(() => setLoading(false), );
      });

}, []);

const handleAdd = async (product) => {
  if (isAdding) return; // Prevent multiple clicks

  setIsAdding(true);
  console.log("🛒 Adding product to cart:", product.id);

  try {
      const token = localStorage.getItem("authToken");
      if (!token) {
          alert("⚠ You need to log in to add items to the cart.");
          setIsAdding(false);
          return;
      }

      const response = await api.post(
          "/cart/",
          { product_id: product.id, quantity: 1 }, // ✅ Send only 1, let backend handle increments
          { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Item added to cart:", response.data);

      // ✅ Instead of manually updating state, fetch the latest cart from backend
      const updatedCart = await fetchCart();
      setCart(updatedCart);

      alert("✅ Item added to cart!");
  } catch (error) {
      console.error("🚨 Error adding item:", error.response?.data || error);
      alert("❌ Failed to add item.");
  } finally {
      setIsAdding(false);
  }
};

const [isRemoving, setIsRemoving] = useState(false);

const handleRemove = async (productId) => {
  if (isRemoving || !cart[productId]) return;

  setIsRemoving(true);
  console.log("🗑 Removing product from cart:", productId);

  try {
      const token = localStorage.getItem("authToken");
      if (!token) {
          alert("You need to log in to modify the cart.");
          return;
      }

      const response = await fetch(`http://localhost:8000/cart/${productId}/`, {
          method: "DELETE",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });

      if (!response.ok) {
          const errorData = await response.json();
          console.error("🚨 Backend Error:", errorData);
          throw new Error(errorData.error || "Failed to remove item");
      }

      console.log("✅ Item removed!");

      alert("✅ Item removed from cart completely!");

      setCart((prevCart) => {
          const newCart = { ...prevCart };
          delete newCart[productId]; // Completely remove from state
          return newCart;
      });
  } catch (error) {
      console.error("🚨 Error removing item:", error);
  } finally {
      setIsRemoving(false);
  }
};
  
     // Save cart to localStorage
     useEffect(() => {
     localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);
      // const addToCart = (product) => {
      // setCart((prevCart) => ({
      //  ...prevCart,
      //  [product.id]: (prevCart[product.id] || 0) + 1
      //    }));
      //   };


  // Filter and group products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? product.category === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(product);
    return acc;
  }, {});

      // Handle login action from modal
      const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await loginUser(loginUsername, loginPassword);
    
            console.log("Full login response:", res); // Debugging
    
            // ✅ Check if access token exists
            if (res?.access) {
                localStorage.setItem("authToken", res.access); // Save access token
                localStorage.setItem("refreshToken", res.refresh); // Save refresh token
    
                setIsLoggedIn(true);
                setShowLoginModal(false);
                setLoginUsername("");
                setLoginPassword("");
                navigate("/");
    
                setTimeout(() => {
                    alert(`✅ Login successful, logging in as **${loginUsername}**`);
                }, 100);
            } else {
                throw new Error("Access token missing in response");
            }
    
        } catch (error) {
            console.error("Login Error:", error);
            alert("❌ Invalid login credentials");
        }
    };         

// Check login state on component mount
useEffect(() => {
  const token = localStorage.getItem("token");
  if (token) {
    setIsLoggedIn(true);
  }
}, []);

  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("authToken");  // ✅ Remove the correct token
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  
    setIsLoggedIn(false); // ✅ Update UI state
    navigate("/"); // ✅ Redirect to homepage
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();

    if (signupPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await registerUser(signupUsername, signupPassword);
        console.log("Signup response:", res);  // Debugging

        // Handle different response messages correctly
        if (res.message.includes("Account created successfully")) {
            alert("Account creation successful! Redirecting...");
            window.location.href = "http://localhost:5173/";  // ✅ Adjust if needed
        } else {
            alert("Error creating account: " + res.message);
        }

    } catch (error) {
        console.error("Signup error:", error.response ? error.response.data : error);
        alert("Error creating account: " + (error.response?.data?.message || "Please try again."));
    }
};

  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + "=") {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };
  
  const handleRestrictedAction = () => {
    if (!isLoggedIn) {
      alert("Unauthorized access: Log in first to perform this action");
      return;
    }
  
    // Proceed with the action if logged in
    console.log("Action performed successfully!");
  };
  

  if (loading)   //⏳🔄
    return (
      <div className="flex items-center justify-center h-screen">
        <h2 className="text-4xl font-bold text-center animate-blink">
          <span className="animate-rotate">⏳</span> Loading products... Please be patient
          <span className="animate-blink">...</span>
        </h2>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 relative">
     <header className="bg-green-800 text-white p-4 flex justify-between items-center">
    {/* Electro-Hub with Flash Icon */}
    <h1 className="text-3xl font-extrabold flex items-center">
      ⚡ Electro-Hub-Ke ⚡
    </h1>

    {/* Centered Navigation Links */}
    <nav className="flex space-x-6 text-xl font-extrabold text-white">
    <Link 
        to={isLoggedIn ? "/orders" : "#"}  // Prevent navigation if not logged in
        onClick={(e) => {
          if (!isLoggedIn) {
            e.preventDefault(); // Stop navigation
            alert("Unauthorized access: Log in first to view your orders.");
          }
        }}
        className="flex items-center space-x-2 text-white hover:underline"
      >
        <span className="text-white text-2xl">📦 Orders</span>
      </Link>
      
      <Link to="/contact-us" className="flex items-center space-x-2 text-white hover:underline">
        <span className="text-white text-2xl">📞 Contact Us</span>
      </Link>

      <Link 
          to={isLoggedIn ? "/cart" : "#"}  // Prevent navigation if not logged in
          onClick={(e) => {
            if (!isLoggedIn) {
              e.preventDefault(); // Stop navigation
              alert("Unauthorized access: Log in first to view your cart.");
            }
          }}
          className="relative flex items-center space-x-2 text-white hover:underline"
        >
          <span className="text-white text-2xl">🛒 Cart</span>
          {Object.values(cart).reduce((total, qty) => total + qty, 0) > 0 && (
            <span className="absolute -top-2 -right-4 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">
              {Object.values(cart).reduce((total, qty) => total + qty, 0)}
            </span>
          )}
        </Link>
    </nav>

    {/* Auth Buttons with Icons */}
    <div className="flex items-center space-x-4">
      {isLoggedIn ? (
        <>
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled>
            🔒 Logged in
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleLogout}>
          👋 Log Out
          </button>
        </>
      ) : (
        <>
          <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 flex items-center space-x-2" onClick={() => setShowLoginModal(true)}>
            🔑 Login
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2" onClick={() => { setShowSignupModal(true); setShowLoginModal(false); }}>
            🆕 Create Account
          </button>
        </>
      )}
    </div>
  </header>

  {/* Flash Sales Banner */}
  <div className="bg-blue-600 text-white text-lg font-extrabold p-3 text-center animate-pulse">
    🚀 FLASH SALE: 80% OFF ON ALL ELECTRONICS! HURRY BEFORE STOCK RUNS OUT! ⏳
  </div>

      {/* Search & Filter Section */}
      <div className="p-4 flex flex-col md:flex-row items-center justify-between bg-blue-100">
        <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search products..."
            className="p-2 pl-10 border border-blue-300 rounded w-full text-black placeholder-black"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
            </svg>
          </div>
        </div>
        <select
          className="p-2 border border-blue-300 rounded w-full md:w-1/4 text-black"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Array.from(new Set(products.map((p) => p.category))).map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Products Grouped by Category */}
      <div className="p-4">
        {Object.keys(groupedProducts).length === 0 ? (
          <p className="text-center mt-8 text-black">No products available</p>
        ) : (
          Object.keys(groupedProducts).map((category) => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 text-center">
                {category.toUpperCase()}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {groupedProducts[category].map((product) => (
                  <div
                    key={product.id}
                    className="bg-white p-4 rounded shadow text-center flex flex-col"
                  >
                    {/* 🖼️ Image Section */}
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                    ) : (
                      <div className="w-full h-40 bg-gray-200 text-black flex items-center justify-center rounded mb-2">
                        🖼️ No Image
                      </div>
                    )}

                    {/* 📌 Product Name & Description */}
                    <h3 className="font-bold text-lg mb-1 text-black">{product.name}</h3>
                    <p className="text-gray-700 text-sm mb-2">
                      {product.description || "No description available."}
                    </p>
                    <p className="text-blue-600 font-semibold mb-2">Ksh {product.price}</p>

                    {/* ✅ Stock Level */}
                    <p className={`font-semibold ${product.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                      {product.stock > 0 ? `In Stock: ${product.stock}` : "Out of Stock"}
                    </p>

                    {/* ➖ REMOVE / ADD BUTTONS */}
                    <div className="flex justify-center items-center space-x-3 mt-2">
                      {/* ➖ REMOVE BUTTON */}
                      <button
                        onClick={() => {
                          if (cart[product.id]?.quantity > 0) {
                            handleRemove(product.id);
                          } else {
                            console.error("🚨 Item not added to cart yet:", product);
                            alert("❌ Can't remove item, Item not added to cart yet!");
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        ➖
                      </button>

                      {/* 🛒 ITEM QUANTITY DISPLAY */}
                      <span className="font-semibold text-black">
                        {cart[product.id]?.quantity || 0}
                      </span>

                      {/* ➕ ADD BUTTON (DISABLED IF OUT OF STOCK) */}
                      <button
                        onClick={() => {
                          if (product.stock === 0) {
                            alert("❌ This item is out of stock and cannot be added to cart. Sending alert to Creator");
                          } else {
                            handleAdd(product);
                          }
                        }}
                        className={`px-3 py-1 rounded ${
                          product.stock === 0 ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-600 text-white"
                        }`}
                      >
                        ➕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>


      {/* Footer */}
      <footer className="bg-blue-600 text-white p-4 flex justify-center">
        <p className="text-center">
          All rights reserved. &copy; 2026. Built By Dee Dev
        </p>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
      <button
        onClick={() => setShowLoginModal(false)}
        className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
      >
        &#10005;
      </button>
      <h2 className="text-3xl font-bold text-green-700 text-center mb-6">
        Login
      </h2>
      <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Username"
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-green-700 text-white p-3 rounded hover:bg-green-800 transition"
        >
          Login
        </button>
      </form>
    </div>
  </div>
)}
        {showSignupModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
    <div className="bg-white p-6 rounded shadow-lg w-96">
      {/* Title */}
      <h2 className="text-2xl font-bold text-green-700 text-center">Create Account</h2>

      {/* Signup Form */}
      <form onSubmit={handleSignupSubmit} className="flex flex-col gap-4 mt-4">
        {/* Username Input */}
        <div>
          <input
            type="text"
            placeholder="Enter Username"
            value={signupUsername}
            onChange={(e) => setSignupUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            required
          />
          {!signupUsername && <p className="text-red-500 text-sm mt-1">Please input this field</p>}
        </div>

        {/* Password Input with Toggle */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
            required
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {/* Show/Hide Icon */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-green-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <span className="text-lg">🙈</span> : <span className="text-lg">👁</span>}
          </button>
          {!signupPassword && <p className="text-red-500 text-sm mt-1">Please input this field</p>}
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg text-black placeholder-black focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {/* Show/Hide Icon */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-green-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <span className="text-lg">🙈</span> : <span className="text-lg">👁</span>}
          </button>
          {!confirmPassword && <p className="text-red-500 text-sm mt-1">Please input this field</p>}
        </div>

        {/* Signup Button (uses `type="submit"`) */}
        <button
          type="submit"
          className="w-full mt-6 bg-green-700 hover:bg-green-800 text-white py-2 rounded-lg transition"
        >
          Sign Up
        </button>
      </form>

      {/* Close Button */}
      <button
        className="w-full mt-3 text-blue-600 hover:underline"
        onClick={() => setShowSignupModal(false)}
      >
        Cancel
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Home;
