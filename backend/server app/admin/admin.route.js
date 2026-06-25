const express = require("express");
const adminRoute = express.Router();

const Customer = require("./../customer/customer.model");
const Vendor = require("./../vendor/vendor.model");

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";

adminRoute.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.send({ message: "Login Successful", admin: true });
  }
  res.status(401).send("Invalid credentials");
});

adminRoute.get("/customers", async (req, res) => {
  try {
    const customers = await Customer.find({}, "CUserId CustomerName CEmail CContact CAddress Status CId CPicName");
    res.send(customers);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch customers");
  }
});

adminRoute.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({}, "VUserId VendorName VEmail VContact VAddress Status VId VPicName");
    res.send(vendors);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch vendors");
  }
});

adminRoute.put("/customer/status/:cid/:status", async (req, res) => {
  try {
    await Customer.updateOne({ CId: req.params.cid }, { Status: req.params.status });
    res.send("Customer status updated");
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to update customer status");
  }
});

adminRoute.put("/vendor/status/:vid/:status", async (req, res) => {
  try {
    await Vendor.updateOne({ VId: req.params.vid }, { Status: req.params.status });
    res.send("Vendor status updated");
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to update vendor status");
  }
});

module.exports = adminRoute;
