const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },

  customerName: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  method: {
    type: String,
    enum: ["cash", "upi", "bank", "card"],
    default: "cash",
  },

  note: {
    type: String,
  },

  receivedBy: {
    type: String,
    default: "owner",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Payment", paymentSchema);
