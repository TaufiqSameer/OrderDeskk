const express = require("express");
const appRoutes = require("./routes/appRoutes");
const connectDB = require("./config/mongoose");
require("dotenv").config();
const cors = require("cors");
require("./jobs/dailySummary"); 
const app = express();

app.use(cors());
connectDB();

app.use(express.json());

app.get("/test-summary", async (req, res) => {           
  const { sendDailySummary } = require("./jobs/dailySummary");
  await sendDailySummary();
  res.json({ success: true, message: "Summary sent!" });
});

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/api", appRoutes);
app.use("/api", require("./routes/paymentRoutes"));

const port = 8000;

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
