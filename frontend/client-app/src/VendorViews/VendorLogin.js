import React, { useState } from "react";
import axios from "axios";
import VendorHome from "./VendorHome";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./VendorLogin.css";

function VendorLogin({ onLogin }) {
  const [vuid, setVuid] = useState("");
  const [vupass, setVupass] = useState("");
  const [vendor, setVendor] = useState(null);
  const [showPass, setShowPass] = useState(false);

  const REACT_APP_BASE_API_URL =
    process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${REACT_APP_BASE_API_URL}/vendor/login`,
        {
          VUserId: vuid,
          VUserPass: vupass,
        }
      );

      if (res.data && res.data.VUserId) {
        setVendor(res.data);
        if (onLogin) onLogin(res.data);
      } else {
        alert("Invalid login");
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        alert(err.response.data || "Login failed");
      } else if (err.request) {
        alert("Server not responding. Make sure backend is running at " + REACT_APP_BASE_API_URL);
      } else {
        alert("Error: " + err.message);
      }
    }
  };

  const handleLogout = () => {
    setVendor(null);
    if (onLogin) onLogin(null);
  };

  if (vendor) {
    return (
      <VendorHome
        vendor={vendor}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="page-center vendorlogin-container">
      <div className="auth-card auth-card-dark vendorlogin-form">
        <h4>Vendor Login</h4>

        <div className="form-group">
          <input
            type="text"
            placeholder="Vendor User ID"
            value={vuid}
            onChange={(e) => setVuid(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group password-field">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={vupass}
            onChange={(e) => setVupass(e.target.value)}
            className="form-input"
          />
          <span
            className="password-toggle"
            onClick={() => setShowPass(!showPass)}
          >
            {showPass ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button
          className="btn btn-primary btn-block btn-lg"
          onClick={handleLogin}
        >
          Login
        </button>
        <a href="/customer/login" style={{ display: "block", textAlign: "center", marginTop: 12, color: "var(--color-primary)" }}>
          Back to Home
        </a>
      </div>
    </div>
  );
}

export default VendorLogin;