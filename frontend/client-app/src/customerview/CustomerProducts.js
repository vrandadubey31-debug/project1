import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerProducts.css";

function CustomerProducts({ customer }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API}/product/showproductbyvendor/10`
        );
        setProducts(response.data || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API]);

  const toggleCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.pid === product.pid);
      if (exists) {
        return prev.filter((p) => p.pid !== product.pid);
      }
      return [...prev, product];
    });
  };

  const isInCart = (pid) => cart.some((p) => p.pid === pid);

  const cartTotal = cart.reduce((sum, p) => sum + Number(p.opprice), 0);

  const handleBuy = () => {
    if (cart.length === 0) return;
    navigate("/customer/invoice", {
      state: { products: cart, customer },
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <h2>Error loading products</h2>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="empty-state">
        <h3>No products available</h3>
        <p>Please check back later.</p>
      </div>
    );
  }

  return (
    <div className="customer-products-wrapper">
      <h2>Products</h2>

      {cart.length > 0 && (
        <div className="cart-bar">
          <span>{cart.length} item{cart.length > 1 ? "s" : ""} selected — ₹{cartTotal}</span>
          <button
            className="btn btn-primary"
            onClick={handleBuy}
          >
            Buy Selected
          </button>
        </div>
      )}

      <div className="grid-products">
        {products.map((product) => (
          <div
            key={product.pid}
            className={`product-grid-item${isInCart(product.pid) ? " selected" : ""}`}
            style={{ border: isInCart(product.pid) ? "2px solid var(--color-primary-light)" : "1px solid var(--color-border-light)" }}
          >
            {product.ppicname && (
              <img
                src={product.ppicname}
                alt={product.pname}
              />
            )}
            <h3>{product.pname}</h3>
            <p><strong>Price:</strong> ₹{product.opprice}</p>
            <p><strong>Wholesale:</strong> ₹{product.ppprice}</p>
            {product.pdesc && (
              <p className="product-desc">{product.pdesc}</p>
            )}
            <p className="price-tag">
              <span className={`status-badge ${product.status === "Active" ? "active" : "inactive"}`}>
                {product.status}
              </span>
            </p>
            <button
              className={`btn ${isInCart(product.pid) ? "btn-primary" : "btn-primary"} btn-block`}
              onClick={() => toggleCart(product)}
            >
              {isInCart(product.pid) ? "Remove" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CustomerProducts;
