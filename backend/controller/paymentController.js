const Payment = require("../models/Payment");
const Order = require("../models/Order");

exports.addPayment = async (req, res) => {
  try {

    const { orderId, method } = req.body;
    const amount = Number(req.body.amount);
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.create({
      orderId,
      customerName: order.customerName,
      amount,
      method
    });

    order.balanceDue -= amount;

    if (order.balanceDue < 0) order.balanceDue = 0;

    await order.save();

    res.json({
      payment,
      balanceDue: order.balanceDue
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPaymentsByOrder = async (req, res) => {

    const payments = await Payment.find({
      orderId: req.params.orderId
    }).sort({ createdAt: -1 });
  
    res.json(payments);
  
  };