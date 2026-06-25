import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaUser, FaTruck, FaCheckCircle, FaTimesCircle, FaEye, FaArrowLeft } from "react-icons/fa";

const API = process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";

function AdminLogin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleLogin = async () => {
    setError("");
    try {
      const res = await axios.post(`${API}/admin/login`, { username, password });
      if (res.data.admin) {
        setLoggedIn(true);
        fetchData();
      }
    } catch (err) {
      setError(err.response?.data || err.message || "Login failed");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, vRes] = await Promise.all([
        axios.get(`${API}/admin/customers`),
        axios.get(`${API}/admin/vendors`),
      ]);
      setCustomers(cRes.data);
      setVendors(vRes.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (cid, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(`${API}/admin/customer/status/${cid}/${newStatus}`);
      setCustomers(prev =>
        prev.map(c => (c.CId === cid ? { ...c, Status: newStatus } : c))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  const toggleVendorStatus = async (vid, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await axios.put(`${API}/admin/vendor/status/${vid}/${newStatus}`);
      setVendors(prev =>
        prev.map(v => (v.VId === vid ? { ...v, Status: newStatus } : v))
      );
    } catch {
      alert("Failed to update status");
    }
  };

  if (!loggedIn) {
    return (
      <div className="page-center" style={{ background: "#dbeafe" }}>
        <div className="auth-card card" style={{ maxWidth: 400 }}>
          <h1 style={{ color: "var(--color-primary)" }}>Admin Login</h1>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>
          <button className="btn btn-primary btn-block btn-lg" onClick={handleLogin}>
            Login
          </button>
          <a href="/customer/login" style={{ display: "block", textAlign: "center", marginTop: 12, color: "var(--color-primary)" }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  if (selectedItem) {
    const isCustomer = selectedItem.CId !== undefined;
    return (
      <div className="page-center" style={{ background: "#dbeafe" }}>
        <div className="card" style={{ maxWidth: 500, width: "100%" }}>
          <button className="btn btn-secondary btn-sm mb-md" onClick={() => setSelectedItem(null)}>
            <FaArrowLeft /> Back
          </button>
          <h1>{isCustomer ? "Customer Details" : "Vendor Details"}</h1>
          <div className="details-card">
            {isCustomer ? (
              <>
                <p><strong>ID</strong><span>{selectedItem.CId}</span></p>
                <p><strong>User ID</strong><span>{selectedItem.CUserId}</span></p>
                <p><strong>Name</strong><span>{selectedItem.CustomerName}</span></p>
                <p><strong>Email</strong><span>{selectedItem.CEmail}</span></p>
                <p><strong>Contact</strong><span>{selectedItem.CContact || "N/A"}</span></p>
                <p><strong>Address</strong><span>{selectedItem.CAddress || "N/A"}</span></p>
                <p><strong>Status</strong><span className={`status-badge ${selectedItem.Status === "Active" ? "active" : "inactive"}`}>{selectedItem.Status}</span></p>
              </>
            ) : (
              <>
                <p><strong>ID</strong><span>{selectedItem.VId}</span></p>
                <p><strong>User ID</strong><span>{selectedItem.VUserId}</span></p>
                <p><strong>Name</strong><span>{selectedItem.VendorName}</span></p>
                <p><strong>Email</strong><span>{selectedItem.VEmail}</span></p>
                <p><strong>Contact</strong><span>{selectedItem.VContact || "N/A"}</span></p>
                <p><strong>Address</strong><span>{selectedItem.VAddress || "N/A"}</span></p>
                <p><strong>Status</strong><span className={`status-badge ${selectedItem.Status === "Active" ? "active" : "inactive"}`}>{selectedItem.Status}</span></p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: "0 auto" }}>
      <div className="flex flex-between mb-lg" style={{ flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <button className="btn btn-danger" onClick={() => setLoggedIn(false)}>Logout</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>
      ) : (
        <>
          <div className="card mb-lg">
            <div className="flex flex-between mb-md">
              <h2 style={{ margin: 0 }}><FaUser /> Customers ({customers.length})</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr><td colSpan={6}>No customers found</td></tr>
                  ) : customers.map(c => (
                    <tr key={c.CId}>
                      <td>{c.CId}</td>
                      <td>{c.CustomerName}</td>
                      <td>{c.CEmail}</td>
                      <td>{c.CContact || "—"}</td>
                      <td><span className={`status-badge ${c.Status === "Active" ? "active" : "inactive"}`}>{c.Status}</span></td>
                      <td>
                        <div className="flex gap-sm" style={{ justifyContent: "center" }}>
                          <button className="btn btn-info btn-sm" onClick={() => setSelectedItem(c)} title="View Details"><FaEye /></button>
                          <button
                            className={`btn btn-sm ${c.Status === "Active" ? "btn-warning" : "btn-success"}`}
                            onClick={() => toggleCustomerStatus(c.CId, c.Status)}
                          >
                            {c.Status === "Active" ? <FaTimesCircle /> : <FaCheckCircle />}
                            {c.Status === "Active" ? " Deactivate" : " Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="flex flex-between mb-md">
              <h2 style={{ margin: 0 }}><FaTruck /> Vendors ({vendors.length})</h2>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 ? (
                    <tr><td colSpan={6}>No vendors found</td></tr>
                  ) : vendors.map(v => (
                    <tr key={v.VId}>
                      <td>{v.VId}</td>
                      <td>{v.VendorName}</td>
                      <td>{v.VEmail}</td>
                      <td>{v.VContact || "—"}</td>
                      <td><span className={`status-badge ${v.Status === "Active" ? "active" : "inactive"}`}>{v.Status}</span></td>
                      <td>
                        <div className="flex gap-sm" style={{ justifyContent: "center" }}>
                          <button className="btn btn-info btn-sm" onClick={() => setSelectedItem(v)} title="View Details"><FaEye /></button>
                          <button
                            className={`btn btn-sm ${v.Status === "Active" ? "btn-warning" : "btn-success"}`}
                            onClick={() => toggleVendorStatus(v.VId, v.Status)}
                          >
                            {v.Status === "Active" ? <FaTimesCircle /> : <FaCheckCircle />}
                            {v.Status === "Active" ? " Deactivate" : " Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AdminLogin;