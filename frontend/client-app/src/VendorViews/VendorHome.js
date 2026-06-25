import React, { useState } from "react";
import "./VendorHome.css";

// correct relative path to productview
import VendorProductMgt from "../productview/VendorProductMgt";

function VendorHome({ vendor, onLogout }) {
  const [showProductMgt, setShowProductMgt] = useState(false);

  // guard against missing vendor prop to prevent runtime crashes / blank page
  if (!vendor) {
    return (
      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h2>Loading vendor...</h2>
        <button onClick={onLogout}>Back</button>
      </div>
    );
  }

  if (showProductMgt) {
    return (
      <VendorProductMgt 
        vendor={vendor} 
        onBack={() => setShowProductMgt(false)} 
      />
    );
  }

  return (
    <div className="page-center vendor-home-container">
      <div className="card vendor-home-card">
        <h1>Welcome Vendor Home</h1>

        {vendor.VPicName ? (
          <img
            src={vendor.VPicName}
            alt="vendor pic"
            className="profile-pic"
            onError={(e) => {
              console.error("Image failed to load:", vendor.VPicName);
              e.target.style.display = "none";
            }}
          />
        ) : null}

        <h5 style={{ color: "#2f4d8f", fontSize: 20, marginBottom: 15 }}>
          {vendor.VendorName || "Vendor"}
        </h5>

        <div className="vendor-info">
          <p><strong>Email:</strong> {vendor.VEmail || "N/A"}</p>
          <p><strong>Contact:</strong> {vendor.VContact || "N/A"}</p>
          <p><strong>Address:</strong> {vendor.VAddress || "N/A"}</p>
          <p><strong>Status:</strong> {vendor.Status || "N/A"}</p>
        </div>

        <div className="vendor-actions">
          <button 
            className="btn btn-primary btn-block"
            onClick={() => setShowProductMgt(true)}
          >
            Manage Products
          </button>
          <button 
            className="btn btn-danger btn-block"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default VendorHome; 
 