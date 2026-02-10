import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logout from "./components/Logout";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/products/")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  // const addToCart = (product) => {
  //   setCart([...cart, product]);
  // };

  const checkout = () => {
    if (!user) {
      alert("You must be logged in to checkout!");
    } else {
      alert("Proceeding to checkout...");
      // Add checkout logic here
    }
  };

  return (
    <div>
      <h1>Accounts App</h1>

      {user ? (
        <>
          <p>Welcome, {user}!</p>
          <Logout setUser={setUser} />
        </>
      ) : (
        <>
          <Login setUser={setUser} />
          <Signup />
        </>
      )}

      {/* Product List Visible to Everyone */}
      <h2>Product List</h2>
      {products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <li key={product.id}>
              {product.name} - ${product.price}
              <button onClick={() => addToCart(product)}>Add to Cart</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No products available</p>
      )}

      {/* Cart Section */}
      <h2>Shopping Cart</h2>
      {cart.length > 0 ? (
        <ul>
          {cart.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>Cart is empty</p>
      )}

      {/* Checkout Button (Login Required) */}
      <button onClick={checkout}>Checkout</button>
    </div>
  );
}

export default App;
