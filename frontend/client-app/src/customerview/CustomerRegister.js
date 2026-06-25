import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./CustomerRegister.css";

function CustomerRegister() {
  const navigate = useNavigate();
  const [cuserid, setCUserId] = useState("");
  const [cuserpass, setCUserPass] = useState("");
  const [crepass, setCRePass] = useState("");

  const [customername, setCustomerName] = useState("");
  const [caddress, setCAddress] = useState("");
  const [ccontact, setCContact] = useState("");
  const [cemail, setCEmail] = useState("");

  const [cstid, setCStid] = useState("");
  const [cctid, setCCtid] = useState("");
  const [stlist, setStlist] = useState([]);
  const [ctlist, setCtlist] = useState([]);

  const [showPass, setShowPass] = useState(false);
  const [showRePass, setShowRePass] = useState(false);

  const [customerList, setCustomerList] = useState([]);
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
    getCustomers();
    getStates();
    getCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCustomers = async () => {
    try {
      const res = await axios.get(
        `${API}/customer/getcustomercount`
      );

      setCustomerList(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getStates = async () => {
    try {
      const res = await axios.get(
        `${API}/state/getall`
      );

      setStlist(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const getCities = async () => {
    try {
      const res = await axios.get(
        `${API}/city/getall`
      );

      setCtlist(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleStateChange = (e) => {
    setCStid(e.target.value);
    // reset city since it belongs to the previously selected state
    setCCtid("");
  };

  const filteredCities = ctlist.filter(
    (c) => String(c.stid) === String(cstid)
  );

  const validateForm = () => {
    let temp = {};
    let valid = true;

    if (cuserid.length < 4) {
      temp.cuserid =
        "User ID must contain minimum 4 characters";
      valid = false;
    }

    if (
      customerList.some(
        (c) => c.CUserId === cuserid
      )
    ) {
      temp.cuserid =
        "User ID already exists";
      valid = false;
    }

    if (cuserpass.length < 6) {
      temp.cuserpass =
        "Password minimum 6 characters";
      valid = false;
    }

    if (cuserpass !== crepass) {
      temp.crepass =
        "Passwords do not match";
      valid = false;
    }

    if (customername.trim() === "") {
      temp.customername =
        "Customer name required";
      valid = false;
    }

    if (caddress.trim() === "") {
      temp.caddress =
        "Address required";
      valid = false;
    }

    if (!/^\d{10}$/.test(ccontact)) {
      temp.ccontact =
        "Enter valid 10 digit mobile number";
      valid = false;
    }

    if (
      !/\S+@\S+\.\S+/.test(cemail)
    ) {
      temp.cemail =
        "Enter valid email";
      valid = false;
    }

    if (
      customerList.some(
        (c) => c.CEmail === cemail
      )
    ) {
      temp.cemail =
        "Email already exists";
      valid = false;
    }

    if (!image.data) {
      temp.image =
        "Please upload image";
      valid = false;
    }

    if (!cstid) {
      temp.cstid =
        "Please select a state";
      valid = false;
    }

    if (!cctid) {
      temp.cctid =
        "Please select a city";
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
      const customerObj = {
        CUserId: cuserid,
        CUserPass: cuserpass,
        CustomerName: customername,
        CAddress: caddress,
        CContact: ccontact,
        CEmail: cemail,
        CStid: Number(cstid),
        CCtid: Number(cctid),
        Status: "Inactive",
      };

      await axios.post(
        `${API}/customer/register`,
        customerObj
      );

      const formData =
        new FormData();

      formData.append(
        "file",
        image.data
      );

      formData.append(
        "CustomerName",
        customername
      );

      formData.append(
        "CAddress",
        caddress
      );

      formData.append(
        "CContact",
        ccontact
      );

      formData.append(
        "CEmail",
        cemail
      );

      await axios.put(
        `${API}/customer/update/${cuserid}`,
        formData
      );

      alert(
        "Customer Registered Successfully"
      );

      setStatus(
        "Registration Successful"
      );

      setCUserId("");
      setCUserPass("");
      setCRePass("");
      setCustomerName("");
      setCAddress("");
      setCContact("");
      setCEmail("");
      setCStid("");
      setCCtid("");

      setImage({
        preview: "",
        data: null,
      });

      getCustomers();
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
          Customer Registration
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
              value={cuserid}
              onChange={(e) =>
                setCUserId(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.cuserid && <span className="form-error">{errors.cuserid}</span>}
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
                value={cuserpass}
                onChange={(e) =>
                  setCUserPass(
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
            {errors.cuserpass && <span className="form-error">{errors.cuserpass}</span>}
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
                value={crepass}
                onChange={(e) =>
                  setCRePass(
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
            {errors.crepass && <span className="form-error">{errors.crepass}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Customer Name</label>
            <input
              type="text"
              value={customername}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.customername && <span className="form-error">{errors.customername}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              value={caddress}
              onChange={(e) =>
                setCAddress(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.caddress && <span className="form-error">{errors.caddress}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">State</label>
            <select
              value={cstid}
              onChange={handleStateChange}
              className="form-select"
            >
              <option value="">
                Select State
              </option>
              {stlist.map((item, index) => (
                <option
                  key={index}
                  value={item.stid}
                >
                  {item.stname}
                </option>
              ))}
            </select>
            {errors.cstid && <span className="form-error">{errors.cstid}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">City</label>
            <select
              value={cctid}
              onChange={(e) =>
                setCCtid(e.target.value)
              }
              disabled={!cstid}
              className="form-select"
            >
              <option value="">
                {cstid
                  ? "Select City"
                  : "Select a state first"}
              </option>
              {filteredCities.map(
                (item, index) => (
                  <option
                    key={index}
                    value={item.ctid}
                  >
                    {item.ctname}
                  </option>
                )
              )}
            </select>
            {errors.cctid && <span className="form-error">{errors.cctid}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contact</label>
            <input
              type="text"
              value={ccontact}
              onChange={(e) =>
                setCContact(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.ccontact && <span className="form-error">{errors.ccontact}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={cemail}
              onChange={(e) =>
                setCEmail(
                  e.target.value
                )
              }
              className="form-input"
            />
            {errors.cemail && <span className="form-error">{errors.cemail}</span>}
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
            onClick={() => navigate("/customer/login")}
          >
            Back to Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default CustomerRegister;