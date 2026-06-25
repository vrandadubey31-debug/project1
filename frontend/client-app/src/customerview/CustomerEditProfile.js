import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./CustomerEditProfile.css";

function CustomerEditProfile({ customer, onUpdate }) {
  const navigate = useNavigate();
  const API = process.env.REACT_APP_BASE_API_URL;

  const [form, setForm] = useState({
    CustomerName: customer.CustomerName || "",
    CAddress: customer.CAddress || "",
    CContact: customer.CContact || "",
    CEmail: customer.CEmail || "",
  });

  const [image, setImage] = useState({ preview: "", data: null });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage({ preview: URL.createObjectURL(file), data: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const formData = new FormData();
      formData.append("CustomerName", form.CustomerName);
      formData.append("CAddress", form.CAddress);
      formData.append("CContact", form.CContact);
      formData.append("CEmail", form.CEmail);

      if (image.data) {
        formData.append("file", image.data);
      }

      const res = await axios.put(
        `${API}/customer/update/${customer.CUserId}`,
        formData
      );

      onUpdate({
        ...customer,
        CustomerName: form.CustomerName,
        CAddress: form.CAddress,
        CContact: form.CContact,
        CEmail: form.CEmail,
        CPicName: res.data.updatedData?.CPicName || customer.CPicName,
      });

      alert("Profile Updated Successfully");
      navigate("/customer/home");
    } catch (err) {
      setError(err.response?.data || "Profile Update Failed");
    }
  };

  return (
    <div className="page-center edit-profile-container">
      <div className="card edit-profile-card">
        <h1>Edit Profile</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              name="CustomerName"
              value={form.CustomerName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              name="CAddress"
              value={form.CAddress}
              onChange={handleChange}
              className="form-textarea"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact</label>
            <input
              type="text"
              name="CContact"
              value={form.CContact}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="CEmail"
              value={form.CEmail}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="form-input-file" />
            {(image.preview || customer.CPicName) && (
              <img
                src={image.preview || customer.CPicName}
                alt="Preview"
                className="edit-profile-preview"
              />
            )}
          </div>

          {error && <span className="form-error">{error}</span>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 1 }}>
              Save Changes
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

export default CustomerEditProfile;
