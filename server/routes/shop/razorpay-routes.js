// routes/shop/razorpay-routes.js
const express = require("express");
const { createRazorpayOrder, verifyRazorpayPayment } = require("../../controllers/shop/razorpay-controller");
const router = express.Router();

router.post("/create-order", createRazorpayOrder);
router.post("/verify", verifyRazorpayPayment);

module.exports = router;
