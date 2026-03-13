const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrders,
  searchOrder,
  updateStatus,
  getOutstandingOrders,
  getReminderLink,
  markReady,
} = require("../controller/appController");

router.post("/orders", createOrder);

router.get("/orders", getOrders);

router.get("/orders/search", searchOrder);

router.patch("/orders/:id/status", updateStatus);
router.get("/orders/outstanding", getOutstandingOrders);
router.get("/orders/:id/reminder", getReminderLink);
router.patch("/orders/:id/ready", markReady);

module.exports = router;
