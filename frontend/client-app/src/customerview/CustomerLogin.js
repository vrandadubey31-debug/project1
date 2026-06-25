import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CustomerLogin.css";

import { FaEye, FaEyeSlash } from "react-icons/fa";

function CustomerLogin({ onLogin }) {
  const navigate = useNavigate();

  const [cuid, setCuId] = useState("");
  const [cupass, setCuPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  const REACT_APP_BASE_API_URL =
    process.env.REACT_APP_BASE_API_URL;

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${REACT_APP_BASE_API_URL}/customer/login`,
        { cuid, cupass }
      );

      if (res.data && res.data.CUserId) {
        if (res.data.Status === "Inactive") {
          alert("User not active. Please wait for admin activation.");
          return;
        }
        onLogin(res.data);
        navigate("/customer/home");
      } else {
        alert("Invalid Login");
      }
    } catch (err) {
      console.log(err);

      if (err.response) {
        alert(
          "Status: " +
          err.response.status +
          "\nMessage: " +
          err.response.data
        );
      } else {
        alert("Server not responding");
      }
    }
  };

  return (
    <div className="page-center customerlogin-container">
      <div className="auth-card auth-card-dark customerlogin-form">
        <h4>Customer Login</h4>

        <div className="form-group">
          <input
            type="text"
            placeholder="Customer User ID"
            value={cuid}
            onChange={(e) =>
              setCuId(e.target.value)
            }
            className="form-input"
          />
        </div>

        <div className="form-group password-field">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={cupass}
            onChange={(e) =>
              setCuPass(e.target.value)
            }
            className="form-input"
          />
          <span
            className="password-toggle"
            onClick={() =>
              setShowPass(!showPass)
            }
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
      </div>
    </div>
  );
}

export default CustomerLogin;
