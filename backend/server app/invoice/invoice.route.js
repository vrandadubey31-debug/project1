const express = require("express");
const invoiceRoute = express.Router();
const Invoice = require("./invoice.model");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const emailUser = process.env.EMAIL || process.env.GMAIL_USER || process.env.GMAIL_EMAIL;
const emailPass = process.env.EMAIL_PASSWORD || process.env.GMAIL_APP_PASS || process.env.GMAIL_PASS;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: emailUser,
        pass: emailPass,
    },
});

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

function buildInvoiceEmailHtml(invoice) {
    let productsHtml = "";
    if (invoice.items && invoice.items.length > 0) {
        productsHtml = invoice.items.map(item => `
        <tr>
            <td style="padding:8px; border-bottom:1px solid #ddd;">${item.pname}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd;">&#8377;${item.opprice}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${item.quantity}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">&#8377;${item.subtotal}</td>
        </tr>`).join("");
    } else {
        productsHtml = `
        <tr>
            <td style="padding:8px; border-bottom:1px solid #ddd;">${invoice.pname}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd;">&#8377;${invoice.opprice}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:center;">${invoice.quantity}</td>
            <td style="padding:8px; border-bottom:1px solid #ddd; text-align:right;">&#8377;${invoice.totalAmount}</td>
        </tr>`;
    }

    return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial, sans-serif; max-width:600px; margin:auto; padding:20px;">
    <h2 style="color:#1f3b73;">Invoice #${invoice.invoiceId}</h2>
    <hr style="border:1px solid #ddd;" />
    <h4 style="color:#1f3b73;">Customer Details</h4>
    <p><strong>Name:</strong> ${invoice.CustomerName || ""}</p>
    <p><strong>Contact:</strong> ${invoice.CContact || "N/A"}</p>
    <p><strong>Email:</strong> ${invoice.CEmail || "N/A"}</p>
    <p><strong>Address:</strong> ${invoice.CAddress || "N/A"}</p>
    <hr style="border:1px solid #ddd;" />
    <h4 style="color:#1f3b73;">Products</h4>
    <table style="width:100%; border-collapse:collapse;">
        <thead>
            <tr style="background:#f5f5f5;">
                <th style="padding:8px; text-align:left; border-bottom:2px solid #ddd;">Product</th>
                <th style="padding:8px; text-align:left; border-bottom:2px solid #ddd;">Price</th>
                <th style="padding:8px; text-align:center; border-bottom:2px solid #ddd;">Qty</th>
                <th style="padding:8px; text-align:right; border-bottom:2px solid #ddd;">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${productsHtml}
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" style="padding:10px; text-align:right; font-weight:bold;">Total:</td>
                <td style="padding:10px; text-align:right; font-weight:bold; font-size:18px; color:#1f3b73;">&#8377;${invoice.totalAmount}</td>
            </tr>
        </tfoot>
    </table>
    <p><strong>Status:</strong> ${invoice.status}</p>
    <hr style="border:1px solid #ddd;" />
    <p style="color:#666; font-size:12px;">Thank you for your purchase!</p>
</body>
</html>`;
}

async function sendInvoiceEmail(invoice) {
    try {
        const emailHtml = buildInvoiceEmailHtml(invoice);

        await transporter.sendMail({
            from: emailUser,
            to: invoice.CEmail,
            subject: `Invoice #${invoice.invoiceId} - Order Confirmation`,
            html: emailHtml,
        });
        console.log("Invoice email sent to", invoice.CEmail);
    } catch (e) {
        console.error("Failed to send invoice email:", e && e.message ? e.message : e);
    }
}

invoiceRoute.post("/create", async (req, res) => {
    try {
        const { CId, CustomerName, CContact, CEmail, CAddress, items, pid, pname, opprice, quantity } = req.body;

        const lastInvoice = await Invoice.findOne().sort({ invoiceId: -1 });
        const newInvoiceId = lastInvoice ? lastInvoice.invoiceId + 1 : 1;

        let totalAmount = 0;
        let invoiceData = {
            invoiceId: newInvoiceId,
            CId: Number(CId),
            CustomerName: CustomerName || "",
            CContact: CContact || "",
            CEmail: CEmail || "",
            CAddress: CAddress || "",
            status: "Pending",
            paymentStatus: "unpaid"
        };

        if (items && items.length > 0) {
            if (!CId) {
                return res.status(400).json({ error: "Customer ID is required" });
            }
            const itemsWithSubtotal = items.map(item => ({
                pid: Number(item.pid),
                pname: item.pname,
                opprice: Number(item.opprice),
                quantity: item.quantity || 1,
                subtotal: Number(item.opprice) * (item.quantity || 1)
            }));
            totalAmount = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);
            invoiceData.items = itemsWithSubtotal;
        } else {
            if (!pid || !pname || !opprice) {
                return res.status(400).json({ error: "Product ID, Product Name, and Price are required" });
            }
            const qty = quantity || 1;
            totalAmount = Number(opprice) * qty;
            invoiceData.pid = Number(pid);
            invoiceData.pname = pname;
            invoiceData.opprice = Number(opprice);
            invoiceData.quantity = qty;
        }

        invoiceData.totalAmount = totalAmount;

        const invoice = new Invoice(invoiceData);
        await invoice.save();

        sendInvoiceEmail(invoice).catch(err => console.error("Background email send failed:", err));

        res.json({ message: "Invoice created successfully", invoice });
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: err.message || "Failed to create invoice" });
    }
});

invoiceRoute.post("/create-razorpay-order", async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findOne({ invoiceId: Number(invoiceId) });
        if (!invoice) {
            return res.status(404).json({ error: "Invoice not found" });
        }

        const options = {
            amount: invoice.totalAmount * 100,
            currency: "INR",
            receipt: `invoice_${invoice.invoiceId}`,
        };

        const order = await razorpayInstance.orders.create(options);

        invoice.razorpayOrderId = order.id;
        await invoice.save();

        res.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            invoiceId: invoice.invoiceId,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message || "Failed to create Razorpay order" });
    }
});

invoiceRoute.post("/verify-payment", async (req, res) => {
    try {
        const { invoiceId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: "Payment verification failed - signature mismatch" });
        }

        await Invoice.updateOne(
            { invoiceId: Number(invoiceId) },
            {
                $set: {
                    paymentStatus: "paid",
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: "Paid",
                },
            }
        );

        res.json({ message: "Payment verified successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message || "Payment verification failed" });
    }
});

invoiceRoute.get("/show", async (req, res) => {
    try {
        const data = await Invoice.find().sort({ invoiceId: -1 });
        res.send(data);
    } catch (err) {
        res.status(500).send("Error fetching invoices");
    }
});

invoiceRoute.get("/showbycustomer/:CId", async (req, res) => {
    try {
        const data = await Invoice.find({ CId: Number(req.params.CId) }).sort({ invoiceId: -1 });
        res.send(data);
    } catch (err) {
        res.status(500).send("Error fetching invoices");
    }
});

invoiceRoute.get("/getmaxinvoiceid", async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ invoiceId: -1 }).limit(1);
        if (invoices.length > 0) {
            res.json({ maxInvoiceId: invoices[0].invoiceId, nextInvoiceId: invoices[0].invoiceId + 1 });
        } else {
            res.json({ maxInvoiceId: 0, nextInvoiceId: 1 });
        }
    } catch (err) {
        res.status(500).json({ error: "Error fetching max invoice ID" });
    }
});

module.exports = invoiceRoute;