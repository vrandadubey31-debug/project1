import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerOrders.css";

const API = process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";
const RAZORPAY_KEY_ID = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_T4YctQuzWnebkd";

function CustomerOrders() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;
  const [orders, setOrders] = useState(data?.orders || []);
  const [payingId, setPayingId] = useState(null);
  const customer = data?.customer || {};

  const handlePayment = async (invoice) => {
    setPayingId(invoice.invoiceId);
    try {
      const orderRes = await axios.post(`${API}/invoice/create-razorpay-order`, {
        invoiceId: invoice.invoiceId,
      });

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount,
        currency,
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
            setOrders((prev) =>
              prev.map((o) =>
                o.invoiceId === invoice.invoiceId
                  ? { ...o, paymentStatus: "paid", status: "Paid" }
                  : o
              )
            );
            alert("Payment successful!");
          } catch (err) {
            alert("Payment verification failed: " + (err.response?.data?.error || err.message));
          }
        },
        prefill: {
          name: customer.CustomerName,
          email: invoice.CEmail,
          contact: invoice.CContact,
        },
        theme: { color: "#1f3b73" },
        modal: {
          ondismiss: () => setPayingId(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function () {
        alert("Payment failed");
        setPayingId(null);
      });
      rzp.open();
    } catch (err) {
      alert("Failed to initiate payment: " + (err.response?.data?.error || err.message));
      setPayingId(null);
    }
  };

  if (!orders.length) {
    return (
      <div className="page-center">
        <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 500 }}>
          <h2>No Orders Found</h2>
          <p>No orders have been placed by this customer yet.</p>
          <button
            className="btn btn-primary btn-block btn-lg mt-md"
            onClick={() => navigate("/customer/home")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card" style={{ padding: 40, maxWidth: 800, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/customer/home")}>
            ← Back to Home
          </button>
          <h2 style={{ margin: 0 }}>Order History</h2>
        </div>
        <p><strong>Customer:</strong> {customer.CustomerName || "N/A"}</p>
        <hr className="hr-divider" />

        {orders.map((invoice) => (
          <div key={invoice.invoiceId} className="customer-order-card">
            <div className="customer-order-header">
              <strong>Invoice #{invoice.invoiceId}</strong>
              <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
            </div>
            <div className="customer-order-status">
              <span>Status: {invoice.status}</span>
              <span>Payment: {invoice.paymentStatus}</span>
            </div>

            {invoice.items && invoice.items.length > 0
              ? invoice.items.map((item, i) => (
                  <div key={i} className="customer-order-item">
                    <span>{item.pname} × {item.quantity}</span>
                    <span>₹{item.subtotal}</span>
                  </div>
                ))
              : (
                <div className="customer-order-item">
                  <span>{invoice.pname} × {invoice.quantity}</span>
                  <span>₹{invoice.totalAmount}</span>
                </div>
              )}

            <hr className="hr-divider" />
            <div className="customer-order-total">
              <span>Total</span>
              <span>₹{invoice.totalAmount}</span>
            </div>

            {invoice.paymentStatus === "unpaid" && (
              <button
                className="btn btn-primary btn-block btn-lg mt-md"
                onClick={() => handlePayment(invoice)}
                disabled={payingId === invoice.invoiceId}
                style={{ marginTop: 12 }}
              >
                {payingId === invoice.invoiceId ? "Processing..." : `Pay Now ₹${invoice.totalAmount}`}
              </button>
            )}
            {invoice.paymentStatus === "paid" && (
              <p style={{ color: "#34d399", textAlign: "center", marginTop: 12, fontWeight: 600 }}>
                ✓ Paid
              </p>
            )}
          </div>
        ))}

        <button
          className="btn btn-primary btn-block btn-lg mt-md"
          onClick={() => navigate("/customer/home")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default CustomerOrders;
