import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./CustomerChangePassword.css";

function CustomerChangePassword({ customer }) {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_BASE_API_URL;

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    try {
      await axios.put(
        `${API}/customer/changepassword/${customer.CUserId}`,
        { oldPassword, newPassword }
      );

      alert("Password Changed Successfully");
      navigate("/customer/home");
    } catch (err) {
      setError(err.response?.data || "Password Change Failed");
    }
  };

  return (
    <div className="page-center change-pass-container">
      <div className="card change-pass-card">
        <h1>Change Password</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Old Password</label>
            <div className="password-field">
              <input
                type={showOld ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowOld(!showOld)}
              >
                {showOld ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="password-field">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
              />
              <span
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          {error && <span className="form-error">{error}</span>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              Update Password
            </button>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              style={{ flex: 1 }}
              onClick={() => navigate("/customer/home")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CustomerChangePassword;
