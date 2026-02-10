import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-green-800 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <h1 className="text-2xl font-bold">
        <Link to="/">Electro-Hub</Link>
      </h1>

      {/* Desktop Navigation */}
      <div className="hidden md:flex space-x-6">
        <Link to="/" className="hover:underline">Home</Link>
        <Link to="/orders" className="hover:underline">Orders</Link>
        <Link to="/contact" className="hover:underline">Contact Us</Link>
      </div>

      {/* Authentication Buttons */}
      <div className="hidden md:flex space-x-4">
        {isLoggedIn ? (
          <>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" disabled>
              Logged in
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleLogout}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">Login</Link>
            <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Account</Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-white text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-green-800 text-white flex flex-col items-center space-y-4 py-4">
          <Link to="/" className="hover:underline" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/orders" className="hover:underline" onClick={() => setMenuOpen(false)}>Orders</Link>
          <Link to="/contact" className="hover:underline" onClick={() => setMenuOpen(false)}>Contact Us</Link>

          {/* Authentication Buttons (Mobile) */}
          {isLoggedIn ? (
            <button className="bg-red-600 px-4 py-2 rounded hover:bg-red-700" onClick={handleLogout}>Log Out</button>
          ) : (
            <>
              <Link to="/login" className="bg-black px-4 py-2 rounded hover:bg-gray-800">Login</Link>
              <Link to="/signup" className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
