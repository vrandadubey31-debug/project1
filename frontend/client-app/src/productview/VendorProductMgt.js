import React, { useEffect, useState } from "react";
import axios from "axios";
import "./VendorProductMgt.css";

function VendorProductMgt({ vendor, onBack }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPid, setEditingPid] = useState(null);

  const [formData, setFormData] = useState({
    pid: "",
    pname: "",
    ppprice: "",
    opprice: "",
    pcatgid: "",
    pdesc: "",
    ppicname: null,
  });

  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const API = process.env.REACT_APP_BASE_API_URL || "http://localhost:9191";
  
  // Extract VId - try multiple property names as fallback
  const VId = vendor?.VId || vendor?.vid || vendor?.VUserId;

  // Debug log
  useEffect(() => {
    console.log("VendorProductMgt mounted with vendor:", vendor);
    console.log("Available vendor properties:", vendor ? Object.keys(vendor) : "No vendor");
    console.log("VId extracted:", VId);
    if (!vendor) {
      console.warn("⚠️ No vendor prop provided to VendorProductMgt");
    }
    if (!VId) {
      console.warn("⚠️ VId is missing from vendor object. Vendor object:", vendor);
      console.warn("Available properties:", vendor ? Object.keys(vendor) : "None");
    }
  }, [vendor, VId]);

  useEffect(() => {
    // Always fetch categories
    getCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products when VId becomes available
  useEffect(() => {
    if (VId) {
      console.log("Fetching products for vendor:", VId);
      getVendorProducts();
    } else {
      console.warn("⚠️ Cannot fetch products: VId not available");
      setProducts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [VId]);

  const getVendorProducts = async () => {
    if (!VId) {
      console.error("Cannot fetch products: VId is missing");
      return;
    }
    setIsLoading(true);
    try {
      console.log(`Fetching products from: ${API}/product/showproductbyvendor/${VId}`);
      const res = await axios.get(`${API}/product/showproductbyvendor/${VId}`);
      console.log("Products fetched successfully:", res.data);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      setProducts([]);
      alert(`❌ Failed to fetch products: ${err.response?.data?.error || err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategories = async () => {
    try {
      console.log(`Fetching categories from: ${API}/productcatg/showproductcatg`);
      const res = await axios.get(`${API}/productcatg/showproductcatg`);
      console.log("Categories fetched successfully:", res.data);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      console.error("Error details:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setCategories([]);
    }
  };

  const getNextPid = async () => {
    try {
      console.log(`Fetching next product ID from: ${API}/product/getmaxpid`);
      const res = await axios.get(`${API}/product/getmaxpid`);
      const nextPid = res.data.nextPid || 1;
      console.log("Next Product ID:", nextPid);
      return nextPid;
    } catch (err) {
      console.error("Error fetching next PID:", err);
      console.warn("Using fallback: products.length + 1 =", products.length + 1);
      return products.length + 1;
    }
  };

  const handleNewProduct = async () => {
    const nextPid = await getNextPid();
    setFormData({
      pid: nextPid,
      pname: "",
      ppprice: "",
      opprice: "",
      pcatgid: "",
      pdesc: "",
      ppicname: null,
    });
    setImagePreview("");
    setEditingPid(null);
    setErrors({});
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    setFormData({
      pid: product.pid,
      pname: product.pname,
      ppprice: product.ppprice,
      opprice: product.opprice,
      pcatgid: product.pcatgid || "",
      pdesc: product.pdesc,
      ppicname: product.ppicname,
    });
    setImagePreview(product.ppicname || "");
    setEditingPid(product.pid);
    setErrors({});
    setShowForm(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, ppicname: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    let temp = {};
    let valid = true;

    if (!formData.pname.trim()) {
      temp.pname = "Product name required";
      valid = false;
    }

    if (!formData.ppprice || Number(formData.ppprice) <= 0) {
      temp.ppprice = "Valid wholesale price required";
      valid = false;
    }

    if (!formData.opprice || Number(formData.opprice) <= 0) {
      temp.opprice = "Valid retail price required";
      valid = false;
    }

    if (Number(formData.opprice) < Number(formData.ppprice)) {
      temp.opprice = "Retail price must be greater than wholesale price";
      valid = false;
    }

    if (!editingPid && !formData.ppicname) {
      temp.ppicname = "Please upload product image";
      valid = false;
    }

    setErrors(temp);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }

    if (!validateForm()) {
      console.log("Form validation failed:", errors);
      alert("Please fix the form errors before submitting");
      return;
    }

    if (!VId) {
      console.error("VId is missing:", { VId, vendor });
      alert("Vendor ID is missing. Please reload the page and login again.");
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Submitting product with VId:", VId);
      
      const formDataToSend = new FormData();
      formDataToSend.append("pid", formData.pid);
      formDataToSend.append("pname", formData.pname);
      formDataToSend.append("ppprice", Number(formData.ppprice));
      formDataToSend.append("opprice", Number(formData.opprice));
      formDataToSend.append("pcatgid", formData.pcatgid || "");
      formDataToSend.append("pdesc", formData.pdesc);
      formDataToSend.append("vid", VId);
      formDataToSend.append("status", "Inactive");

      if (formData.ppicname && formData.ppicname instanceof File) {
        formDataToSend.append("file", formData.ppicname);
      }

      console.log("FormData entries:", {
        pid: formData.pid,
        pname: formData.pname,
        ppprice: formData.ppprice,
        opprice: formData.opprice,
        pcatgid: formData.pcatgid,
        pdesc: formData.pdesc,
        vid: VId,
        status: "Inactive",
        hasFile: formData.ppicname instanceof File,
      });

      let response;
      if (editingPid) {
        console.log("Updating product:", editingPid);
        response = await axios.put(
          `${API}/product/updateproduct/${editingPid}`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        console.log("Update response:", response);
        alert("✅ Product updated successfully");
      } else {
        console.log("Creating new product");
        response = await axios.post(`${API}/product/saveproduct`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Save response:", response);
        alert("✅ Product added successfully");
      }

      setShowForm(false);
      getVendorProducts();
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error message:", err.message);
      console.error("Error data:", err.response?.data);
      
      let errorMsg = "Failed to save product";
      
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data) {
        errorMsg = typeof err.response.data === 'string' 
          ? err.response.data 
          : JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.error("Final error message to show:", errorMsg);
      alert("❌ Error: " + errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (pid) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${API}/product/deleteproduct/${pid}`);
        alert("Product deleted successfully");
        getVendorProducts();
      } catch (err) {
        console.log(err);
        alert("Failed to delete product");
      }
    }
  };

  return (
    <div className="vendor-product-container">
      <div className="product-header">
        <h2>Manage Products</h2>
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Home
        </button>
      </div>


      {!showForm ? (
        <div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={handleNewProduct}>
              + Add New Product
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={getVendorProducts}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>

          <div className="products-list">
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{ fontSize: 16, color: "#6B7280" }}>⟳ Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div key={product.pid} className="product-card">
                  {product.ppicname && (
                    <img
                      src={product.ppicname}
                      alt={product.pname}
                      className="product-image"
                    />
                  )}

                  <div className="product-details">
                    <h4>{product.pname}</h4>
                    <p>
                      <strong>Wholesale Price:</strong> ₹{product.ppprice}
                    </p>
                    <p>
                      <strong>Retail Price:</strong> ₹{product.opprice}
                    </p>
                    <p>
                      <strong>Category:</strong>{" "}
                      {categories.find((c) => c.pcatgid === product.pcatgid)
                        ?.pcatgname || "N/A"}
                    </p>
                    <p>
                      <strong>Description:</strong> {product.pdesc}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`status-badge ${product.status.toLowerCase()}`}
                      >
                        {product.status}
                      </span>
                    </p>
                  </div>

                  <div className="product-actions">
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleDeleteProduct(product.pid)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-products">No products yet. Click "Add New Product" to get started!</p>
            )
            }
          </div>
        </div>
      ) : (
        <div className="product-form-container">
          <h3>{editingPid ? "Edit Product" : "Add New Product"}</h3>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label>Product ID</label>
              <input
                type="number"
                value={formData.pid}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.pname}
                onChange={(e) =>
                  setFormData({ ...formData, pname: e.target.value })
                }
                placeholder="Enter product name"
              />
              {errors.pname && <span className="error">{errors.pname}</span>}
            </div>

            <div className="form-group">
              <label>Wholesale Price (₹) *</label>
              <input
                type="number"
                value={formData.ppprice}
                onChange={(e) =>
                  setFormData({ ...formData, ppprice: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
              />
              {errors.ppprice && <span className="error">{errors.ppprice}</span>}
            </div>

            <div className="form-group">
              <label>Retail Price (₹) *</label>
              <input
                type="number"
                value={formData.opprice}
                onChange={(e) =>
                  setFormData({ ...formData, opprice: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
              />
              {errors.opprice && <span className="error">{errors.opprice}</span>}
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.pcatgid}
                onChange={(e) =>
                  setFormData({ ...formData, pcatgid: e.target.value })
                }
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.pcatgid} value={cat.pcatgid}>
                    {cat.pcatgname}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.pdesc}
                onChange={(e) =>
                  setFormData({ ...formData, pdesc: e.target.value })
                }
                placeholder="Enter product description"
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Product Image {!editingPid && "*"}</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {errors.ppicname && (
                <span className="error">{errors.ppicname}</span>
              )}
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="image-preview" />
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (editingPid ? "Updating..." : "Adding...") 
                  : (editingPid ? "Update Product" : "Add Product")
                }
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                style={{ flex: 1 }}
                onClick={() => setShowForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default VendorProductMgt;