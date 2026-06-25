import React from "react";
import { useNavigate } from "react-router-dom";
import "./CustomerProfileView.css";

function CustomerProfileView({ customer }) {
  const navigate = useNavigate();

  if (!customer) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>No customer data</h2>
        <button onClick={() => navigate("/customer/login")}>Login</button>
      </div>
    );
  }

  const { CustomerName, CUserId, CEmail, CContact, CAddress, CPicName, Status } = customer;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "C";
  };

  return (
    <div className="page-center profile-view-container">
      <div className="card profile-view-card">
        <h1>Profile Details</h1>

        {CPicName ? (
          <img src={CPicName} alt="profile" className="profile-pic" />
        ) : (
          <div className="profile-pic-placeholder">
            {getInitial(CustomerName)}
          </div>
        )}

        <div className="details-card">
          <p>
            <strong>Name</strong>
            <span>{CustomerName || "N/A"}</span>
          </p>
          <p>
            <strong>User ID</strong>
            <span>{CUserId || "N/A"}</span>
          </p>
          <p>
            <strong>Email</strong>
            <span>{CEmail || "N/A"}</span>
          </p>
          <p>
            <strong>Contact</strong>
            <span>{CContact || "N/A"}</span>
          </p>
          <p>
            <strong>Address</strong>
            <span>{CAddress || "N/A"}</span>
          </p>
          <p>
            <strong>Status</strong>
            <span>{Status || "N/A"}</span>
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={() => navigate("/customer/home")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default CustomerProfileView;
