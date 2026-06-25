import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerHome.css";

const API = process.env.REACT_APP_BASE_API_URL;

function CustomerHome({ customer, onLogout }) {
  const navigate = useNavigate();

  const handleOrder = async () => {
    try {
      const res = await axios.get(`${API}/customer/orders/${customer.CUserId}`);
      navigate("/customer/orders", { state: res.data });
    } catch (err) {
      console.log(err);
      alert(err.response?.data || "Failed to fetch orders");
    }
  };

  if (!customer) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>No customer data</h2>
        <button onClick={onLogout}>Back</button>
      </div>
    );
  }

  const { CustomerName, CPicName } = customer;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  return (
    <div className="page-center customer-home-container">
      <div className="card customer-home-card">
        <h1>Welcome</h1>

        {CPicName ? (
          <img
            src={CPicName}
            alt="profile"
            className="profile-pic"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="profile-pic-placeholder"
          style={CPicName ? { display: "none" } : {}}
        >
          {getInitial(CustomerName)}
        </div>

        <h5>{CustomerName || "Customer"}</h5>

        <div className="customer-home-actions">
          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate("/customer/products")}
          >
            Buying
          </button>

          <button
            className="btn btn-primary btn-block"
            onClick={handleOrder}
          >
            Order
          </button>

          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate("/customer/edit-profile")}
          >
            Edit Profile
          </button>

          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate("/customer/profile-view")}
          >
            Profile View
          </button>

          <button
            className="btn btn-primary btn-block"
            onClick={() => navigate("/customer/change-password")}
          >
            Change Password
          </button>

          <button
            className="btn btn-primary btn-block"
            onClick={() => {
              onLogout();
              navigate("/customer/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerHome;
