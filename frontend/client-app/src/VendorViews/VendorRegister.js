import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./VendorRegister.css";

function VendorRegister() {
  const navigate = useNavigate();
  const [vuserid, setVUserId] = useState("");
  const [vuserpass, setVUserPass] = useState("");
  const [vrepass, setVRePass] = useState("");

  const [vendorname, setVendorName] = useState("");
  const [vaddress, setVAddress] = useState("");
  const [vcontact, setVContact] = useState("");
  const [vemail, setVEmail] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);

  const [vendorList, setVendorList] = useState([]);
  const [image, setImage] = useState({
    preview: "",
    data: null,
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const API =
    process.env.REACT_APP_BASE_API_URL ||
    "http://localhost:9191";

  useEffect(() => {
    getVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getVendors = async () => {
    try {
      const res = await axios.get(
        `${API}/vendor/getvendorcount`
      );

      setVendorList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const validateForm = () => {
    let temp = {};
    let valid = true;

    if (vuserid.length < 4) {
      temp.vuserid =
        "User ID must contain minimum 4 characters";
      valid = false;
    }

    if (
      vendorList.some(
        (v) => v.VUserId === vuserid
      )
    ) {
      temp.vuserid =
        "User ID already exists";
      valid = false;
    }

    if (vuserpass.length < 6) {
      temp.vuserpass =
        "Password minimum 6 characters";
      valid = false;
    }

    if (vuserpass !== vrepass) {
      temp.vrepass =
        "Passwords do not match";
      valid = false;
    }

    if (vendorname.trim() === "") {
      temp.vendorname =
        "Vendor name required";
      valid = false;
    }

    if (vaddress.trim() === "") {
      temp.vaddress =
        "Address required";
      valid = false;
    }

    if (!/^\d{10}$/.test(vcontact)) {
      temp.vcontact =
        "Enter valid 10 digit mobile number";
      valid = false;
    }

    if (
      !/\S+@\S+\.\S+/.test(vemail)
    ) {
      temp.vemail =
        "Enter valid email";
      valid = false;
    }

    if (
      vendorList.some(
        (v) => v.VEmail === vemail
      )
    ) {
      temp.vemail =
        "Email already exists";
      valid = false;
    }

    if (!image.data) {
      temp.image =
        "Please upload image";
      valid = false;
    }

    setErrors(temp);

    return valid;
  };

  const handleFileChange = (e) => {
    const file =
      e.target.files[0];

    if (file) {
      setImage({
        preview:
          URL.createObjectURL(file),
        data: file,
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const vendorObj = {
        VUserId: vuserid,
        VUserPass: vuserpass,
        VendorName: vendorname,
        VAddress: vaddress,
        VContact: vcontact,
        VEmail: vemail,
        Status: "Inactive",
      };

      await axios.post(
        `${API}/vendor/register`,
        vendorObj
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        image.data
      );

      formData.append(
        "VendorName",
        vendorname
      );

      formData.append(
        "VAddress",
        vaddress
      );

      formData.append(
        "VContact",
        vcontact
      );

      formData.append(
        "VEmail",
        vemail
      );

      await axios.put(
        `${API}/vendor/update/${vuserid}`,
        formData
      );

      alert(
        "Vendor Registered Successfully"
      );

      setStatus(
        "Registration Successful"
      );

      setVUserId("");
      setVUserPass("");
      setVRePass("");
      setVendorName("");
      setVAddress("");
      setVContact("");
      setVEmail("");

      setImage({
        preview: "",
        data: null,
      });

      getVendors();
    } catch (err) {
      console.log(err);

      alert(
        err.response?.data ||
          "Registration Failed"
      );
    }
  };

  return (
    <div className="page-center">
      <div className="auth-card auth-card-dark" style={{ maxWidth: 550 }}>

        <h1>
          Vendor Registration
        </h1>

        <hr className="hr-divider" />

        {status && <p className="alert alert-success">{status}</p>}

        <form
          onSubmit={handleRegister}
        >

          <div className="form-group">
            <label className="form-label">User ID</label>
            <input
              type="text"
              value={vuserid}
              onChange={(e) =>
                setVUserId(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.vuserid && <span className="form-error">{errors.vuserid}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-box">
              <input
                type={
                  showPass
                    ? "text"
                    : "password"
                }
                value={vuserpass}
                onChange={(e) =>
                  setVUserPass(
                    e.target.value
                  )
                }
                className="form-input"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() =>
                  setShowPass(
                    !showPass
                  )
                }
              >
                {showPass
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
            {errors.vuserpass && <span className="form-error">{errors.vuserpass}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Re-enter Password</label>
            <div className="password-box">
              <input
                type={
                  showRePass
                    ? "text"
                    : "password"
                }
                value={vrepass}
                onChange={(e) =>
                  setVRePass(
                    e.target.value
                  )
                }
                className="form-input"
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() =>
                  setShowRePass(
                    !showRePass
                  )
                }
              >
                {showRePass
                  ? "Hide"
                  : "Show"}
              </button>
            </div>
            {errors.vrepass && <span className="form-error">{errors.vrepass}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Vendor Name</label>
            <input
              type="text"
              value={vendorname}
              onChange={(e) =>
                setVendorName(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.vendorname && <span className="form-error">{errors.vendorname}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              value={vaddress}
              onChange={(e) =>
                setVAddress(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.vaddress && <span className="form-error">{errors.vaddress}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact</label>
            <input
              type="text"
              value={vcontact}
              onChange={(e) =>
                setVContact(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.vcontact && <span className="form-error">{errors.vcontact}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={vemail}
              onChange={(e) =>
                setVEmail(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.vemail && <span className="form-error">{errors.vemail}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={
                handleFileChange
              }
              className="form-input-file"
            />
            {image.preview && (
              <img
                src={image.preview}
                alt="Preview"
                className="preview"
              />
            )}
            {errors.image && <span className="form-error">{errors.image}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
          >
            Register
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-block btn-lg"
            style={{ marginTop: 8 }}
            onClick={() => navigate("/vendor/login")}
          >
            Back to Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default VendorRegister;