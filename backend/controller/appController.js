const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { totalAmount, advancePaid } = req.body; // 

    const order = new Order({
      ...req.body,
      balanceDue: Math.max(0, (totalAmount || 0) - (advancePaid || 0)), 
    });
    await order.save();

    res.json({
      success: true,
      message: "Order created",
      order,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
  
    });
  }
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });

  res.json(orders);
};

exports.searchOrder = async (req, res) => {
  const q = req.query.q;

  const orders = await Order.find({
    $or: [
      { customerName: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
    ],
  });

  res.json(orders);
};

exports.updateStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true },
  );

  res.json(order);
};

exports.getOutstandingOrders = async (req, res) => {
  const orders = await Order.find({
    balanceDue: { $gt: 0 },
  }).sort({ balanceDue: -1 });

  res.json(orders);
};

exports.getReminderLink = async (req, res) => {
  const order = await Order.findById(req.params.id);

  const message = `Hi ${order.customerName}, your balance payment of ₹${order.balanceDue} for "${order.item}" is pending. Kindly clear it.`;

  const link = `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;

  res.json({ whatsappLink: link });
};

exports.markReady = async (req, res) => {
  const order = await Order.findById(req.params.id);

  order.status = "ready";
  await order.save();

  const message = `Hi ${order.customerName}, your order "${order.item}" is ready.`;

  const whatsapp = `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;

  res.json({
    order,
    notifyLink: whatsapp,
  });
};
