import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

const METHODS = ["cash", "upi", "card", "bank_transfer", "other"];
const METHOD_CONFIG = {
  cash: { label: "Cash", icon: "💵", color: "#f59e0b" },
  upi: { label: "UPI", icon: "📱", color: "#6366f1" },
  card: { label: "Card", icon: "💳", color: "#3b82f6" },
  bank_transfer: { label: "Bank Transfer", icon: "🏦", color: "#8b5cf6" },
  other: { label: "Other", icon: "🔁", color: "#64748b" },
};

function daysAgo(dateStr) {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function whatsappURL(order) {
  const balance = order.balanceDue ?? 0;
  const msg =
    `Hello ${order.customerName}! 👋\n\n` +
    `This is a reminder that your order (*${order.item}*) is ready.\n` +
    `remaining balance balance: *₹${balance}*\n\n` +
    `Please arrange payment at your earliest convenience. Thank you! 🙏`;
  return `https://wa.me/${(order.phone || "").replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
}

// ── Toast ──────────────────────────────────────────────────────────────────────
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        zIndex: 999,
        padding: "11px 20px",
        borderRadius: "12px",
        background: toast.type === "error" ? "#ef4444" : "#10b981",
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        animation: "toastIn 0.25s ease",
      }}
    >
      {toast.type === "error" ? "⚠️" : "✓"} {toast.msg}
    </div>
  );
}

// ── Collect Payment Modal ──────────────────────────────────────────────────────
function CollectModal({ order, onClose, onSuccess }) {
  const [form, setForm] = useState({ amount: "", method: "cash" });
  const [submitting, setSubmitting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    setLoadingHistory(true);
    axios
      .get(`${API}/payments/${order._id}`)
      .then((r) => setPayments(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoadingHistory(false));
  }, [order._id]);

  const handleCollect = async () => {
    const amt = parseFloat(form.amount);
    if (!amt || amt <= 0) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/payments`, {
        orderId: order._id,
        amount: amt,
        method: form.method,
      });
      onSuccess(res.data); // { payment, balanceDue }
      setForm({ amount: "", method: "cash" });
      // refresh history
      const h = await axios.get(`${API}/payments/${order._id}`);
      setPayments(Array.isArray(h.data) ? h.data : []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 400,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#161b27",
          borderRadius: "20px",
          border: "1px solid rgba(255,255,255,0.08)",
          width: "100%",
          maxWidth: "480px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          animation: "modalIn 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "22px 24px 0",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "18px",
                  color: "#f1f5f9",
                  fontWeight: 700,
                }}
              >
                Collect Payment
              </div>
              <div
                style={{ fontSize: "13px", color: "#64748b", marginTop: "3px" }}
              >
                {order.customerName} · {order.phone}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "none",
                color: "#94a3b8",
                width: 32,
                height: 32,
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginTop: "16px",
            }}
          >
            {[
              {
                label: "Total",
                value: `₹${order.totalAmount ?? 0}`,
                color: "#94a3b8",
              },
              {
                label: "Advance",
                value: `₹${order.advancePaid ?? 0}`,
                color: "#6ee7b7",
              },
              {
                label: "Balance Due",
                value: `₹${order.balanceDue ?? 0}`,
                color: "#f87171",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "10px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: s.color,
                    marginTop: "2px",
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Amount Received (₹)</label>
            <input
              type="number"
              placeholder={`Max ₹${order.balanceDue ?? 0}`}
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              style={inputStyle}
              min="1"
              max={order.balanceDue}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>Payment Method</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {METHODS.map((m) => {
                const cfg = METHOD_CONFIG[m];
                const active = form.method === m;
                return (
                  <button
                    key={m}
                    onClick={() => setForm((f) => ({ ...f, method: m }))}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: `1.5px solid ${active ? cfg.color : "rgba(255,255,255,0.08)"}`,
                      background: active ? `${cfg.color}20` : "transparent",
                      color: active ? cfg.color : "#64748b",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.15s",
                    }}
                  >
                    {cfg.icon} {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCollect}
            disabled={submitting || !form.amount}
            style={{
              width: "100%",
              padding: "12px",
              background:
                submitting || !form.amount
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: "10px",
              color: submitting || !form.amount ? "#475569" : "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "15px",
              fontWeight: 600,
              cursor: submitting || !form.amount ? "default" : "pointer",
              transition: "all 0.2s",
              boxShadow:
                submitting || !form.amount
                  ? "none"
                  : "0 4px 16px rgba(16,185,129,0.3)",
            }}
          >
            {submitting ? "Recording..." : "✓ Record Payment"}
          </button>

          {/* WhatsApp reminder */}
          {(order.balanceDue ?? 0) > 0 && (
            <a
              href={whatsappURL(order)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                marginTop: "10px",
                padding: "11px",
                background: "rgba(37,211,102,0.1)",
                border: "1.5px solid rgba(37,211,102,0.25)",
                borderRadius: "10px",
                color: "#4ade80",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.15s",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Send WhatsApp Reminder
            </a>
          )}
        </div>

        {/* Payment History */}
        <div style={{ padding: "0 24px 24px" }}>
          <div
            style={{
              fontSize: "11px",
              color: "#475569",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: "10px",
            }}
          >
            Payment History
          </div>
          {loadingHistory ? (
            <div style={{ color: "#475569", fontSize: "13px" }}>Loading...</div>
          ) : payments.length === 0 ? (
            <div style={{ color: "#475569", fontSize: "13px" }}>
              No payments recorded yet.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "160px",
                overflowY: "auto",
              }}
            >
              {payments.map((p, i) => {
                const cfg = METHOD_CONFIG[p.method] ?? METHOD_CONFIG.other;
                return (
                  <div
                    key={p._id ?? i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px" }}>{cfg.icon}</span>
                      <div>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#cbd5e1",
                            fontWeight: 600,
                          }}
                        >
                          ₹{p.amount}
                        </div>
                        <div style={{ fontSize: "11px", color: "#475569" }}>
                          {cfg.label}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#475569",
                        textAlign: "right",
                      }}
                    >
                      {p.createdAt
                        ? new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function PaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortBy, setSortBy] = useState("balanceDue"); // "balanceDue" | "daysOverdue"
  const [showAll, setShowAll] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const fetchOrders = () => {
    setLoading(true);
    axios
      .get(`${API}/orders`)
      .then((r) => setOrders(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load orders", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Only orders with balance due (unless showAll)
  const displayed = useMemo(() => {
    let list = orders.filter((o) => showAll || (o.balanceDue ?? 0) > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          (o.customerName ?? "").toLowerCase().includes(q) ||
          (o.phone ?? "").includes(q),
      );
    }

    if (sortBy === "balanceDue") {
      list = [...list].sort(
        (a, b) => (b.balanceDue ?? 0) - (a.balanceDue ?? 0),
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
    }

    return list;
  }, [orders, sortBy, showAll, search]);

  const totalOutstanding = useMemo(
    () => orders.reduce((s, o) => s + (o.balanceDue ?? 0), 0),
    [orders],
  );

  const handlePaymentSuccess = ({ balanceDue }) => {
    // Update local order state instantly
    setOrders((prev) =>
      prev.map((o) => (o._id === selectedOrder._id ? { ...o, balanceDue } : o)),
    );
    setSelectedOrder((prev) => ({ ...prev, balanceDue }));
    showToast("Payment recorded!");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        body { margin: 0; background: #0a0d13; }

        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pcard {
          background: #161b27;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
          transition: border-color 0.2s, transform 0.2s;
          animation: fadeUp 0.3s ease both;
          cursor: default;
        }
        .pcard:hover {
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }

        .sort-btn {
          padding: 6px 14px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600;
          cursor: pointer; border: 1.5px solid rgba(255,255,255,0.08);
          background: transparent; color: #64748b;
          transition: all 0.15s;
        }
        .sort-btn:hover { border-color: rgba(255,255,255,0.15); color: #94a3b8; }
        .sort-btn.active { background: rgba(16,185,129,0.12); border-color: #10b981; color: #6ee7b7; }

        .collect-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          background: rgba(16,185,129,0.12); border: 1.5px solid rgba(16,185,129,0.25);
          color: #6ee7b7; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .collect-btn:hover { background: rgba(16,185,129,0.2); border-color: #10b981; }

        .wa-btn {
          display: flex; align-items: center; gap: 5px;
          padding: 7px 12px; border-radius: 8px;
          background: rgba(37,211,102,0.08); border: 1.5px solid rgba(37,211,102,0.2);
          color: #4ade80; font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 600; cursor: pointer;
          text-decoration: none; transition: all 0.15s; white-space: nowrap;
        }
        .wa-btn:hover { background: rgba(37,211,102,0.15); border-color: rgba(37,211,102,0.4); }

        .search-input {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 9px 14px 9px 36px;
          color: #f1f5f9; font-family: 'DM Sans', sans-serif;
          font-size: 14px; outline: none; width: 100%;
          transition: border-color 0.2s;
        }
        .search-input::placeholder { color: #475569; }
        .search-input:focus { border-color: rgba(16,185,129,0.4); }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <Toast toast={toast} />

      {selectedOrder && (
        <CollectModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          minHeight: "100vh",
          background: "#0a0d13",
          color: "#f1f5f9",
        }}
      >
        <div
          style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}
        >
          {/* Page header */}
          <div style={{ marginBottom: "28px" }}>
            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#f1f5f9",
              }}
            >
              💰 Payments
            </div>
            <div
              style={{ fontSize: "14px", color: "#475569", marginTop: "4px" }}
            >
              Track balances, collect payments, send reminders
            </div>
          </div>

          {/* Summary cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
              marginBottom: "28px",
            }}
          >
            {[
              {
                label: "Total Outstanding",
                value: `₹${totalOutstanding.toLocaleString("en-IN")}`,
                color: "#f87171",
                bg: "rgba(248,113,113,0.08)",
                icon: "📊",
              },
              {
                label: "Pending Orders",
                value: orders.filter((o) => (o.balanceDue ?? 0) > 0).length,
                color: "#fbbf24",
                bg: "rgba(251,191,36,0.08)",
                icon: "⏳",
              },
              {
                label: "Fully Paid",
                value: orders.filter(
                  (o) => (o.totalAmount ?? 0) > 0 && (o.balanceDue ?? 0) === 0,
                ).length,
                color: "#6ee7b7",
                bg: "rgba(110,231,183,0.08)",
                icon: "✅",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: s.bg,
                  border: `1px solid ${s.color}22`,
                  borderRadius: "14px",
                  padding: "16px 20px",
                }}
              >
                <div style={{ fontSize: "20px", marginBottom: "6px" }}>
                  {s.icon}
                </div>
                <div
                  style={{ fontSize: "22px", fontWeight: 700, color: s.color }}
                >
                  {s.value}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "2px",
                    fontWeight: 500,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "18px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <span
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "14px",
                  pointerEvents: "none",
                }}
              >
                🔍
              </span>
              <input
                className="search-input"
                placeholder="Search by name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                className={`sort-btn${sortBy === "balanceDue" ? " active" : ""}`}
                onClick={() => setSortBy("balanceDue")}
              >
                ↓ By Amount
              </button>
              <button
                className={`sort-btn${sortBy === "daysOverdue" ? " active" : ""}`}
                onClick={() => setSortBy("daysOverdue")}
              >
                ↓ Days Overdue
              </button>
            </div>

            {/* Toggle all */}
            <button
              className={`sort-btn${showAll ? " active" : ""}`}
              onClick={() => setShowAll((p) => !p)}
            >
              {showAll ? "Outstanding Only" : "Show All"}
            </button>
          </div>

          {/* List */}
          {loading ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 0",
                color: "#475569",
              }}
            >
              Loading orders...
            </div>
          ) : displayed.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "70px 20px",
                color: "#475569",
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
              <div
                style={{ fontSize: "16px", fontWeight: 600, color: "#64748b" }}
              >
                No outstanding balances!
              </div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                All orders are fully paid.
              </div>
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {displayed.map((order, i) => {
                const balance = order.balanceDue ?? 0;
                const days = daysAgo(order.createdAt);
                const isPaid = balance === 0;
                const urgency =
                  !isPaid && days > 7
                    ? "#f87171"
                    : !isPaid && days > 3
                      ? "#fbbf24"
                      : "#6ee7b7";

                return (
                  <div
                    key={order._id}
                    className="pcard"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      {/* Left: customer info */}
                      <div
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            flexShrink: 0,
                            background: isPaid
                              ? "rgba(110,231,183,0.1)"
                              : "rgba(248,113,113,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "17px",
                            fontWeight: 700,
                            color: isPaid ? "#6ee7b7" : "#f87171",
                          }}
                        >
                          {(order.customerName ?? "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: "15px",
                              color: "#f1f5f9",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {order.customerName}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#475569",
                              marginTop: "1px",
                            }}
                          >
                            📞 {order.phone}
                          </div>
                        </div>
                      </div>

                      {/* Right: balance + actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexShrink: 0,
                        }}
                      >
                        {/* Days overdue chip */}
                        {!isPaid && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "100px",
                              color: urgency,
                              background: `${urgency}15`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {days === 0 ? "Today" : `${days}d ago`}
                          </span>
                        )}

                        {isPaid ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                padding: "5px 12px",
                                borderRadius: "100px",
                                color: "#6ee7b7",
                                background: "rgba(110,231,183,0.1)",
                              }}
                            >
                              ✓ Paid
                            </span>
                            <a
                              className="wa-btn"
                              href={whatsappURL(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Remind
                            </a>
                          </div>
                        ) : (
                          <>
                            <button
                              className="collect-btn"
                              onClick={() => setSelectedOrder(order)}
                            >
                              ₹{balance.toLocaleString("en-IN")} · Collect
                            </button>
                            <a
                              className="wa-btn"
                              href={whatsappURL(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                              Remind
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Order meta row */}
                    <div
                      style={{
                        marginTop: "12px",
                        display: "flex",
                        gap: "20px",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.03)",
                        fontSize: "13px",
                        color: "#64748b",
                        flexWrap: "wrap",
                      }}
                    >
                      <span>
                        <span style={{ color: "#475569" }}>Item:</span>{" "}
                        <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                          {order.item}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#475569" }}>Total:</span>{" "}
                        <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                          ₹{order.totalAmount ?? 0}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#475569" }}>Advance:</span>{" "}
                        <span style={{ color: "#6ee7b7", fontWeight: 500 }}>
                          ₹{order.advancePaid ?? 0}
                        </span>
                      </span>
                      <span>
                        <span style={{ color: "#475569" }}>Status:</span>{" "}
                        <span style={{ color: "#a5b4fc", fontWeight: 500 }}>
                          {order.status?.replace("_", " ")}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Shared input styles ────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1.5px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#f1f5f9",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: "11px",
  fontWeight: 700,
  color: "#475569",
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: "7px",
};
