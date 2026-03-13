import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

const API = "http://localhost:8000/api";
const ORDER_STATUSES = ["received", "in_progress", "ready", "delivered"];

const STATUS_CONFIG = {
  received:    { color: "#3b82f6", bg: "#eff6ff",  icon: "📥" },
  in_progress: { color: "#f59e0b", bg: "#fffbeb",  icon: "⚙️" },
  ready:       { color: "#10b981", bg: "#ecfdf5",  icon: "✅" },
  delivered:   { color: "#8b5cf6", bg: "#f5f3ff",  icon: "🎉" },
};

const NEXT_STATUS = {
  received:    "in_progress",
  in_progress: "ready",
  ready:       "delivered",
  delivered:   "delivered",
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1.5px solid #e5e7eb",
  background: "#fafafa",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "#111",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function OrderPage() {
  const { t } = useTranslation();

  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    item: "",
    deliveryDate: "",
    advancePaid: "",
    totalAmount: "",
  });

  useEffect(() => { fetchOrders(); }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${API}/orders`, formData);
      await fetchOrders();
      setFormData({ customerName: "", phone: "", item: "", deliveryDate: "", advancePaid: "", totalAmount: "" });
      showToast(t("orderSaved"));
    } catch (err) {
      console.error(err);
      showToast(t("orderFailed"), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateOrderStatus = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next || next === order.status) return;
    try {
      await axios.patch(`${API}/orders/${order._id}/status`, { status: next });
      await fetchOrders();
      showToast(`${t("movedTo")} "${t(next)}"`);
    } catch (err) {
      console.error(err);
      showToast(t("updateFailed"), "error");
    }
  };

  const counts = useMemo(() => {
    const c = { all: orders.length };
    ORDER_STATUSES.forEach((s) => { c[s] = orders.filter((o) => o.status === s).length; });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return orders.filter((o) => {
      if (!o || !o.status) return false;
      const matchSearch = !q || (o.customerName ?? "").toLowerCase().includes(q) || (o.phone ?? "").includes(q);
      const matchFilter = activeFilter === "all" || o.status === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [orders, searchTerm, activeFilter]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #f1f5f9; }
        .order-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important; background: #fff !important; }
        .order-card { background: #fff; border: 1.5px solid #f0f0f0; border-radius: 14px; padding: 18px 20px; transition: box-shadow 0.2s, transform 0.2s; animation: slideIn 0.3s ease both; }
        .order-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.08); transform: translateY(-2px); }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .filter-pill { padding: 6px 14px; border-radius: 100px; border: 1.5px solid #e5e7eb; background: #fff; cursor: pointer; font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500; color: #6b7280; transition: all 0.15s; white-space: nowrap; }
        .filter-pill:hover { border-color: #6366f1; color: #6366f1; }
        .filter-pill.active { background: #6366f1; border-color: #6366f1; color: #fff; }
        .action-btn { border: none; border-radius: 8px; padding: 8px 14px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .action-btn:hover:not(:disabled) { filter: brightness(0.92); transform: scale(0.98); }
        .action-btn:disabled { opacity: 0.45; cursor: default; }
        .submit-btn { width: 100%; padding: 12px; border: none; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(99,102,241,0.35); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.45); }
        .submit-btn:disabled { opacity: 0.6; cursor: default; transform: none; }
        .toast { position: fixed; bottom: 28px; right: 28px; padding: 12px 20px; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #fff; z-index: 9999; animation: toastIn 0.3s ease; box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .label { display: block; font-size: 12px; font-weight: 600; color: #6b7280; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 6px; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      {toast && (
        <div className="toast" style={{ background: toast.type === "error" ? "#ef4444" : "#10b981" }}>
          {toast.type === "error" ? "⚠️" : "✓"} {toast.msg}
        </div>
      )}

      <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f1f5f9" }}>

        <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 36px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: 36, height: 36, borderRadius: "10px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>📦</div>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "18px", color: "#111", lineHeight: 1.1 }}>OrderDesk</div>
              <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500 }}>{t("orderManagement")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {ORDER_STATUSES.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "8px", background: STATUS_CONFIG[s].bg }}>
                <span style={{ fontSize: "11px" }}>{STATUS_CONFIG[s].icon}</span>
                <span style={{ fontSize: "12px", fontWeight: 600, color: STATUS_CONFIG[s].color }}>{counts[s] || 0}</span>
                <span style={{ fontSize: "11px", color: "#9ca3af" }}>{t(s)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "30px 24px", display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>

          {/* Create Order Form */}
          <div style={{ background: "#fff", borderRadius: "18px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1.5px solid #f0f0f0", position: "sticky", top: "84px" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "20px", color: "#111" }}>{t("newOrder")}</div>
              <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: "2px" }}>{t("fillDetails")}</div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label className="label">{t("customerName")}</label>
                <input className="order-input" style={inputStyle} name="customerName" placeholder="e.g. Priya Sharma" value={formData.customerName} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">{t("phone")}</label>
                <input className="order-input" style={inputStyle} name="phone" placeholder="e.g. 9876543210" value={formData.phone} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">{t("item")}</label>
                <textarea className="order-input" style={{ ...inputStyle, height: "80px", resize: "vertical" }} name="item" placeholder={t("itemPlaceholder")} value={formData.item} onChange={handleChange} required />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label className="label">{t("deliveryDate")}</label>
                  <input className="order-input" style={inputStyle} type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required />
                </div>
                <div>
                  <label className="label">{t("totalAmount")} (₹)</label>
                  <input className="order-input" style={inputStyle} type="number" name="totalAmount" placeholder="e.g. 1500" value={formData.totalAmount} onChange={handleChange} required />
                </div>
              </div>
              <div>
                <label className="label">{t("advancePaid")} (₹)</label>
                <input className="order-input" style={inputStyle} type="number" name="advancePaid" placeholder="0" value={formData.advancePaid} onChange={handleChange} />
              </div>
              <button className="submit-btn" disabled={submitting} style={{ marginTop: "4px" }}>
                {submitting ? t("saving") : `＋ ${t("saveOrder")}`}
              </button>
            </form>
          </div>

          {/* Orders List */}
          <div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative", minWidth: "200px" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none" }}>🔍</span>
                <input className="order-input" style={{ ...inputStyle, paddingLeft: "36px" }} placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button className={`filter-pill ${activeFilter === "all" ? "active" : ""}`} onClick={() => setActiveFilter("all")}>
                  {t("all")} ({counts.all})
                </button>
                {ORDER_STATUSES.map((s) => (
                  <button key={s} className={`filter-pill ${activeFilter === s ? "active" : ""}`} onClick={() => setActiveFilter(s)}>
                    {STATUS_CONFIG[s].icon} {t(s)} ({counts[s] || 0})
                  </button>
                ))}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
                <div style={{ fontSize: "40px", marginBottom: "12px" }}>📭</div>
                <div style={{ fontSize: "15px", fontWeight: 500 }}>{t("noOrders")}</div>
                <div style={{ fontSize: "13px", marginTop: "4px" }}>{t("adjustSearch")}</div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "12px" }}>
                {filteredOrders.map((order, i) => {
                  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG["received"];
                  const isLast = order.status === "delivered";
                  const daysUntil = order.deliveryDate
                    ? Math.ceil((new Date(order.deliveryDate) - new Date()) / 86400000)
                    : null;

                  return (
                    <div key={order._id} className="order-card" style={{ animationDelay: `${i * 0.04}s` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                          <div style={{ width: 40, height: 40, borderRadius: "12px", background: `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                            {order.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: "15px", color: "#111" }}>{order.customerName}</div>
                            <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "1px" }}>📞 {order.phone}</div>
                          </div>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "100px", background: cfg.bg, color: cfg.color, fontSize: "12px", fontWeight: 600 }}>
                          {cfg.icon} {t(order.status)}
                        </span>
                      </div>

                      <div style={{ background: "#f8fafc", borderRadius: "10px", padding: "12px 14px", marginBottom: "12px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                        <div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{t("item")}</div>
                          <div style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>{order.item}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{t("deliveryDate")}</div>
                          <div style={{ fontSize: "13px", color: "#374151", fontWeight: 500 }}>
                            {order.deliveryDate?.split("T")[0]}
                            {daysUntil !== null && daysUntil >= 0 && daysUntil <= 3 && (
                              <span style={{ marginLeft: "5px", fontSize: "11px", color: daysUntil === 0 ? "#ef4444" : "#f59e0b", fontWeight: 600 }}>
                                {daysUntil === 0 ? t("today") : `${daysUntil}d ${t("left")}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{t("advancePaid")}</div>
                          <div style={{ fontSize: "13px", color: "#374151", fontWeight: 600 }}>₹{order.advancePaid || 0}</div>
                        </div>
                      </div>

                      <button
                        className="action-btn"
                        onClick={() => updateOrderStatus(order)}
                        disabled={isLast}
                        style={{ background: isLast ? "#f3f4f6" : `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`, color: isLast ? "#9ca3af" : "#fff", boxShadow: isLast ? "none" : `0 2px 8px ${cfg.color}44` }}
                      >
                        {isLast ? `✓ ${t("delivered")}` : `→ ${t("next_" + order.status)}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}