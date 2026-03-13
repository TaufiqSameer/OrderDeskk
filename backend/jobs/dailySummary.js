const cron = require("node-cron");
const Order = require("../models/Order");
const { sendWhatsApp } = require("../services/whatsapp");

async function sendDailySummary() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [dueToday, overdue] = await Promise.all([
      Order.find({
        deliveryDate: { $gte: todayStart, $lte: todayEnd },
        status: { $in: ["received", "in_progress"] },
      }).sort({ deliveryDate: 1 }),

      Order.find({
        deliveryDate: { $lt: todayStart },
        status: { $in: ["received", "in_progress"] },
      }).sort({ deliveryDate: 1 }),
    ]);

    let message = `📦 *Daily Order Summary*\n`;
    message += `📅 ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n`;
    message += `${"─".repeat(25)}\n\n`;

    message += `🟢 *Due Today (${dueToday.length}):*\n`;
    if (dueToday.length === 0) {
      message += `None ✅\n`;
    } else {
      dueToday.forEach((o, i) => {
        const balance = o.balanceDue > 0 ? ` | Bal: ₹${o.balanceDue}` : "";
        message += `${i + 1}. ${o.customerName} – ${o.item}${balance}\n`;
        message += `   📞 ${o.phone}\n`;
      });
    }

    message += `\n🔴 *Overdue (${overdue.length}):*\n`;
    if (overdue.length === 0) {
      message += `None ✅\n`;
    } else {
      overdue.forEach((o, i) => {
        const daysLate = Math.floor(
          (new Date() - new Date(o.deliveryDate)) / 86400000,
        );
        const balance = o.balanceDue > 0 ? ` | Bal: ₹${o.balanceDue}` : "";
        message += `${i + 1}. ${o.customerName} – ${o.item}${balance}\n`;
        message += `   📞 ${o.phone} | 🔴 ${daysLate}d overdue\n`;
      });
    }

    message += `\n_Use the app to mark orders as ready._`;

    await sendWhatsApp(process.env.OWNER_WHATSAPP, message);
    console.log(
      `[DailySummary] Sent — Due: ${dueToday.length}, Overdue: ${overdue.length}`,
    );
  } catch (err) {
    console.error("[DailySummary] Error:", err.message);
  }
}

cron.schedule("*/5 * * * *", sendDailySummary, {
    timezone: "Asia/Kolkata",
  });

console.log("[DailySummary] Scheduled for 8 AM IST daily");

module.exports = { sendDailySummary };
