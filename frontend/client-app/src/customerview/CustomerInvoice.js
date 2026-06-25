import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerInvoice.css";

const API = process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || "your_razorpay_key_id";

function CustomerInvoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, products, customer } = location.state || {};
  const isCart = !product && products && products.length > 0;

  const [quantities, setQuantities] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if ((!product && !isCart) || !customer) {
    return (
      <div className="empty-state" style={{ marginTop: 60 }}>
        <h2>No product or customer data</h2>
        <button className="btn btn-primary mt-md" onClick={() => navigate("/")}>
          Go to Login
        </button>
      </div>
    );
  }

  const getQty = (pid) => {
    if (isCart) return quantities[pid] || 1;
    return quantities[pid] || 1;
  };

  const setQty = (pid, val) => {
    setQuantities(prev => ({ ...prev, [pid]: Math.max(1, val) }));
  };

  const totalAmount = isCart
    ? products.reduce((sum, p) => sum + Number(p.opprice) * (quantities[p.pid] || 1), 0)
    : Number(product.opprice) * getQty(product.pid);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        CId: customer.CId,
        CustomerName: customer.CustomerName,
        CContact: customer.CContact,
        CEmail: customer.CEmail,
        CAddress: customer.CAddress,
      };

      if (isCart) {
        payload.items = products.map(p => ({
          pid: p.pid,
          pname: p.pname,
          opprice: p.opprice,
          quantity: quantities[p.pid] || 1,
        }));
      } else {
        payload.pid = product.pid;
        payload.pname = product.pname;
        payload.opprice = product.opprice;
        payload.quantity = getQty(product.pid);
      }

      const res = await axios.post(`${API}/invoice/create`, payload);
      setInvoice(res.data.invoice);
      setSubmitted(true);
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaymentLoading(true);
    try {
      const orderRes = await axios.post(`${API}/invoice/create-razorpay-order`, {
        invoiceId: invoice.invoiceId,
      });

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Marketplace",
        description: `Invoice #${invoice.invoiceId}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await axios.post(`${API}/invoice/verify-payment`, {
              invoiceId: invoice.invoiceId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setPaymentDone(true);
          } catch (err) {
            alert("Payment verification failed: " + (err.response?.data?.error || err.message));
          }
        },
        prefill: {
          name: customer.CustomerName,
          email: customer.CEmail,
          contact: customer.CContact,
        },
        theme: {
          color: "#1f3b73",
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        alert("Payment failed: " + response.error.description);
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      alert("Failed to initiate payment: " + (err.response?.data?.error || err.message));
      setPaymentLoading(false);
    }
  };

  if (submitted && invoice) {
    return (
      <div className="invoice-card">
        {paymentDone ? (
          <>
            <h2 className="text-success">Payment Successful!</h2>
            <p className="text-center">Your invoice has been paid. A copy has been sent to your email.</p>
            <hr className="hr-divider" />
          </>
        ) : (
          <h2>Invoice Generated</h2>
        )}
        <hr className="hr-divider" />
        <p><strong>Invoice ID:</strong> #{invoice.invoiceId}</p>
        <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <hr className="hr-divider" />
        <h4>Customer Details</h4>
        <p><strong>Name:</strong> {invoice.CustomerName}</p>
        <p><strong>Contact:</strong> {invoice.CContact || "N/A"}</p>
        <p><strong>Email:</strong> {invoice.CEmail || "N/A"}</p>
        <p><strong>Address:</strong> {invoice.CAddress || "N/A"}</p>
        <hr className="hr-divider" />
        <h4>Products</h4>
        {invoice.items && invoice.items.length > 0 ? (
          <div>
            {invoice.items.map((item, i) => (
              <div key={i} className="invoice-item">
                <span>{item.pname} × {item.quantity}</span>
                <span>₹{item.subtotal}</span>
              </div>
            ))}
            <div className="invoice-total">
              <span>Total:</span>
              <span>₹{invoice.totalAmount}</span>
            </div>
          </div>
        ) : (
          <>
            <p><strong>Product:</strong> {invoice.pname}</p>
            <p><strong>Unit Price:</strong> ₹{invoice.opprice}</p>
            <p><strong>Quantity:</strong> {invoice.quantity}</p>
            <p className="invoice-total">
              <strong>Total Amount:</strong> ₹{invoice.totalAmount}
            </p>
          </>
        )}
        <p><strong>Status:</strong> {paymentDone ? "Paid" : invoice.status}</p>
        {!paymentDone ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handlePayment}
              disabled={paymentLoading}
            >
              {paymentLoading ? "Processing..." : "Pay Now with Razorpay"}
            </button>
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={() => navigate(-1)}
            >
              Pay Later
            </button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg btn-block mt-lg" onClick={() => navigate(-1)}>
            Continue Shopping
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="invoice-card">
      <h2>{isCart ? "Shopping Cart" : "Customer Invoice"}</h2>
      <hr className="hr-divider" />

      <h4>Customer Details</h4>
      <p><strong>Name:</strong> {customer.CustomerName}</p>
      <p><strong>Customer ID:</strong> {customer.CId}</p>
      <p><strong>Contact:</strong> {customer.CContact || "N/A"}</p>
      <p><strong>Email:</strong> {customer.CEmail || "N/A"}</p>
      <p><strong>Address:</strong> {customer.CAddress || "N/A"}</p>

      <hr className="hr-divider" />

      <h4>Products</h4>
      {isCart ? (
        <div>
          {products.map(p => (
            <div key={p.pid} className="invoice-item">
              <div className="item-info">
                <p style={{ fontWeight: 500 }}>{p.pname}</p>
                <p className="item-price">₹{p.opprice} each</p>
              </div>
              <div className="item-qty">
                <input
                  type="number"
                  min="1"
                  value={quantities[p.pid] || 1}
                  onChange={(e) => setQty(p.pid, Number(e.target.value))}
                  className="qty-input"
                />
                <span className="item-total">₹{Number(p.opprice) * (quantities[p.pid] || 1)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p><strong>Product:</strong> {product.pname}</p>
          <p><strong>Price:</strong> ₹{product.opprice}</p>
          <div className="single-product-qty">
            <label style={{ fontWeight: "bold", display: "block", marginBottom: 5 }}>Quantity:</label>
            <input
              type="number"
              min="1"
              value={getQty(product.pid)}
              onChange={(e) => setQty(product.pid, Number(e.target.value))}
              className="qty-input"
            />
          </div>
        </div>
      )}

      <p className="invoice-total">
        Total Amount: ₹{totalAmount}
      </p>

      <div className="form-actions">
        <button
          className="btn btn-primary btn-lg"
          style={{ flex: 1 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm & Generate Invoice"}
        </button>
        <button
          className="btn btn-primary btn-lg"
          style={{ flex: 1 }}
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default CustomerInvoice;