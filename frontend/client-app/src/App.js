import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";

import { useState, useEffect } from "react";
import { FaUser, FaUserPlus, FaTruck, FaClipboardList, FaCog, FaCity, FaTag, FaLock, FaMoon, FaSun } from "react-icons/fa";

import CustomerLogin from "./customerview/CustomerLogin";
import CustomerRegister from "./customerview/CustomerRegister";
import CustomerHome from "./customerview/CustomerHome";
import CustomerBuying from "./customerview/CustomerBuying";
import CustomerEditProfile from "./customerview/CustomerEditProfile";
import CustomerProfileView from "./customerview/CustomerProfileView";
import CustomerChangePassword from "./customerview/CustomerChangePassword";
import CustomerInvoice from "./customerview/CustomerInvoice";
import CustomerOrders from "./customerview/CustomerOrders";

import VendorLogin from "./VendorViews/VendorLogin";
import VendorRegister from "./VendorViews/VendorRegister";
import VendorProductMgt from "./productview/VendorProductMgt";

import StateMgt from "./AdminViews/StateMgt";
import CityMgt from "./AdminViews/CityMgt";
import ProductMgt from "./AdminViews/ProductMgt";
import AdminLogin from "./AdminViews/AdminLogin";

import "./Navbar.css";

const NAV = [
  { to: "/customer/login", label: "Login", group: "Customer", icon: FaUser },
  { to: "/customer/register", label: "Register", group: "Customer", icon: FaUserPlus },
  { to: "/vendor/login", label: "Login", group: "Vendor", icon: FaTruck },
  { to: "/vendor/register", label: "Register", group: "Vendor", icon: FaUserPlus },
  { to: "/vendor/products", label: "Products", group: "Vendor", icon: FaClipboardList },
  { to: "/admin/login", label: "Login", group: "Admin", icon: FaLock },
  { to: "/admin/state", label: "State", group: "Admin", icon: FaCog },
  { to: "/admin/city", label: "City", group: "Admin", icon: FaCity },
  { to: "/admin/product", label: "Category", group: "Admin", icon: FaTag },
];

function NavBar({ theme, onToggleTheme }) {
  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <strong className="navbar-brand">Marketplace</strong>

        {groups.map((group) => (
          <div key={group} className="navbar-group">
            <span className="navbar-group-label">{group}</span>
            {NAV.filter((n) => n.group === group).map((n) => {
              const Icon = n.icon;
              return (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    `navbar-link${isActive ? " active" : ""}`
                  }
                >
                  <Icon style={{ marginRight: 4, fontSize: 12 }} />
                  {n.label}
                </NavLink>
              );
            })}
          </div>
        ))}

        <button
          onClick={onToggleTheme}
          className="theme-toggle"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <FaSun /> : <FaMoon />}
        </button>
      </div>
    </nav>
  );
}

function App() {
  const [vendor, setVendor] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app-theme") || "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleCustomerLogout = () => {
    setCustomer(null);
  };

  return (
    <BrowserRouter>
      <NavBar theme={theme} onToggleTheme={toggleTheme} />

      <div style={{ padding: 16 }}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/customer/login" replace />}
          />

          <Route
            path="/customer/login"
            element={<CustomerLogin onLogin={setCustomer} />}
          />
          <Route path="/customer/register" element={<CustomerRegister />} />

          <Route
            path="/customer/home"
            element={
              customer ? (
                <CustomerHome
                  customer={customer}
                  onLogout={handleCustomerLogout}
                />
              ) : (
                <Navigate to="/customer/login" replace />
              )
            }
          />

          <Route
            path="/customer/products"
            element={
              customer ? (
                <CustomerBuying customer={customer} />
              ) : (
                <Navigate to="/customer/login" replace />
              )
            }
          />

          <Route
            path="/customer/edit-profile"
            element={
              customer ? (
                <CustomerEditProfile
                  customer={customer}
                  onUpdate={setCustomer}
                />
              ) : (
                <Navigate to="/customer/login" replace />
              )
            }
          />

          <Route
            path="/customer/profile-view"
            element={
              customer ? (
                <CustomerProfileView customer={customer} />
              ) : (
                <Navigate to="/customer/login" replace />
              )
            }
          />

          <Route
            path="/customer/change-password"
            element={
              customer ? (
                <CustomerChangePassword customer={customer} />
              ) : (
                <Navigate to="/customer/login" replace />
              )
            }
          />

          <Route path="/customer/invoice" element={<CustomerInvoice />} />
          <Route path="/customer/orders" element={<CustomerOrders />} />

          <Route
            path="/vendor/login"
            element={<VendorLogin onLogin={setVendor} />}
          />
          <Route path="/vendor/register" element={<VendorRegister />} />

          <Route
            path="/vendor/products"
            element={
              vendor ? (
                <VendorProductMgt
                  vendor={vendor}
                  onBack={() => {}}
                />
              ) : (
                <div style={{ textAlign: "center", marginTop: 40 }}>
                  <h2>Please log in as a vendor first</h2>
                  <a href="/vendor/login">Go to Vendor Login</a>
                </div>
              )
            }
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/state" element={<StateMgt />} />
          <Route path="/admin/city" element={<CityMgt />} />
          <Route path="/admin/product" element={<ProductMgt />} />

          <Route
            path="*"
            element={<Navigate to="/customer/login" replace />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
