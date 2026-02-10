import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import "./index.css";
import OrderPayment from "./pages/OrderPayment";
import ContactUs from "./pages/ContactUs";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<OrderTracking />} />
        <Route path="contact-us" element={<ContactUs />} />
        <Route path="/payment" element={<OrderPayment />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
