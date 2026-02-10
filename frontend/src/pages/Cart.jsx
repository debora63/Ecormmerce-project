import React, { useState, useEffect } from "react";
import { fetchCart } from "../services/authService"; // Use authService for fetching
import { updateQuantity, removeItem } from "../services/cartService";
import api from "../services/api";
const Cart = () => {
  const BASE_MEDIA_URL = "http://127.0.0.1:8000"; 

  const [cart, setCart] = useState([]); //[]
  const [isRemoving, setIsRemoving] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCart = async () => {
      const cartData = await fetchCart();
      setCart(cartData || []); // ✅ Always ensure it's an array
    };
  
    loadCart();
  }, []);

  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(id); // Remove item if quantity is zero or negative
      return;
    }
  
    const success = await updateQuantity(id, newQuantity);
    if (success) {
      const updatedCart = await fetchCart(); // Ensure latest cart data
      setCart(updatedCart);
    }
  };
  
  const handleRemoveItem = async (id) => {
    const success = await removeItem(id);
    if (success) {
      const updatedCart = await fetchCart(); // Ensure latest cart data
      setCart(updatedCart);
    }
  };
  

  const formatPrice = (price) => {
    return price.toLocaleString("en-US");
  };

  const totalCost = Array.isArray(cart) 
  ? cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) 
  : 0;

  return (
    <div className="bg-gradient-to-r from-green-700 to-blue-600 min-h-screen p-6">
      <h1 className="text-3xl font-bold text-white text-center mb-5"> 🛒My Cart🛒</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl mx-auto">
        {cart.length > 0 ? (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-3 border-b">
              <div className="flex items-center gap-3">
                <img 
                  src={item.product.image ? `${BASE_MEDIA_URL}${item.product.image}` : "/default-image.jpg"} 
                  alt={item.product.name} 
                  className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                  onClick={() => window.open(item.product.image ? `${BASE_MEDIA_URL}${item.product.image}` : "/default-image.jpg", "_blank")}
                />
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{item.product.name}</h2>
                  <p className="text-gray-700">💰 Ksh {formatPrice(item.product.price)} x {item.quantity}</p>
                  <p className="text-green-600 font-bold">Total: Ksh {formatPrice(item.product.price * item.quantity)}</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-lg"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                >
                  ➕
                </button>
                <span className="text-black text-lg">{item.quantity}</span>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-lg"
                  onClick={() => item.quantity > 1 ? handleUpdateQuantity(item.id, item.quantity - 1) : handleRemoveItem(item.id)}
                >
                  ➖
                </button>
                <button
                  className="bg-black hover:bg-gray-700 text-white px-4 py-1 rounded-full"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={isRemoving} // Disable while removing
                >
                  🗑️ Remove Item
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 font-bold text-lg">😔 No Items in Cart</p>
        )}
      </div>

      {cart.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl mx-auto mt-5">
          <h2 className="text-2xl font-bold text-gray-900">🛒 Cart Total</h2>
          <p className="text-lg font-bold text-green-600">Total Amount: Ksh {formatPrice(totalCost)}</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-lg mt-3 w-full"
            onClick={() => {
              if (window.confirm("Confirm your order?")) {
                localStorage.setItem("cart", JSON.stringify(cart)); // Store cart before navigating
                window.location.href = "/payment";
              }
            }}
          >
            ✅ Proceed to Pay
          </button>

        </div>
      )}
    </div>
  );
};

export default Cart;
