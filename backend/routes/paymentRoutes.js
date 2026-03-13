const express = require("express");
const router = express.Router();

const paymentController = require("../controller/paymentController");

router.post("/payments", paymentController.addPayment);
router.get("/payments/:orderId", paymentController.getPaymentsByOrder);

module.exports = router;