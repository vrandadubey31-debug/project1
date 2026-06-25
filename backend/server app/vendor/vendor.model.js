const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VendorSchema = new Schema({
    VUserId: {
        type: String,
        unique: true,
        required: true
    },

    VUserPass: {
        type: String,
        required: true
    },

    VendorName: {
        type: String,
        required: true
    },

    VAddress: {
        type: String
    },

    VContact: {
        type: Number
    },

    VEmail: {
        type: String,
        unique: true,
        required: true
    },

    VPicName: {
        type: String,
        default: ""
    },

    VId: {
        type: Number,
        unique: true,
        required: true
    },

    Status: {
        type: String,
        default: "Inactive"
    }

}, {
    collection: "Vendor"
});

module.exports = mongoose.model("Vendor", VendorSchema);