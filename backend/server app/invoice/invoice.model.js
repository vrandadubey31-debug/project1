const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
{
    invoiceId: {
        type: Number,
        required: true,
        unique: true
    },
    CId: {
        type: Number,
        required: true
    },
    CustomerName: {
        type: String,
        required: true
    },
    CContact: {
        type: String
    },
    CEmail: {
        type: String
    },
    CAddress: {
        type: String
    },
    items: [{
        pid: { type: Number },
        pname: { type: String },
        opprice: { type: Number },
        quantity: { type: Number, default: 1 },
        subtotal: { type: Number }
    }],
    pid: {
        type: Number
    },
    pname: {
        type: String
    },
    opprice: {
        type: Number
    },
    quantity: {
        type: Number,
        default: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    invoiceDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending"
    },
    paymentStatus: {
        type: String,
        default: "unpaid"
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    }
},
{
    collection: "Invoice"
});

module.exports = mongoose.model("Invoice", InvoiceSchema);
