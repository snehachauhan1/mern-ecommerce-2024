// controllers/shop/razorpay-controller.js
const razorpay = require("../../helpers/razorpay");
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    };

    const response = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: response.id,
      amount: response.amount,
      currency: response.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to create Razorpay order" });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    // You can optionally verify the signature here using crypto
    // Save the order and update stock just like PayPal

    const newOrder = new Order({
      ...orderData,
      paymentId: razorpay_payment_id,
      paymentStatus: "paid",
      orderStatus: "confirmed",
    });

    await newOrder.save();

    for (let item of orderData.cartItems) {
      const product = await Product.findById(item.productId);
      product.totalStock -= item.quantity;
      await product.save();
    }

    await Cart.findByIdAndDelete(orderData.cartId);

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Failed to verify payment" });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpayPayment,
};
