import React from "react";
import { useNavigate } from "react-router-dom";
import CustomerProducts from "./CustomerProducts";
import "./CustomerBuying.css";

function CustomerBuying({ customer }) {
  const navigate = useNavigate();

  return (
    <div className="customer-buying-container">
      <div className="customer-buying-header">
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/customer/home")}>
          Back to Home
        </button>
        <h2>Buying</h2>
      </div>
      <CustomerProducts customer={customer} />
    </div>
  );
}

export default CustomerBuying;
