const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true,
  },

  phone: {
    type: String,
    required: true,
  },

  item: {
    type: String,
    required: true,
  },

  deliveryDate: {
    type: Date,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  advancePaid: {
    type: Number,
    default: 0,
  },

  balanceDue: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["received", "in_progress", "ready", "delivered"],
    default: "received",
  },

  photoUrl: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
