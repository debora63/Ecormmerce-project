import axios from "axios";
import { apiClient } from "./authService"; // Ensure API client attaches token

const API_URL = "http://127.0.0.1:8000/api/";

export const placeOrder = async (orderData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("User not authenticated");
  }
  return axios.post(`${API_URL}order/`, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

//payment stuff
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post("orders/", orderData);
    return response.data;
  } catch (error) {
    console.error("🚨 Error creating order:", error);
    throw error;
  }
};


class ErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-600 p-4 text-white">
          <h2>Something went wrong</h2>
          <details>
            <summary>Click for details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;