import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { billApi } from "../services/api";

function Dashboard() {
  const [bills, setBills] = useState([]);

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem("trademass_bill_fix") || "{}"); } catch { return {}; }
  };
  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  // ===== FIX: Name + Total rendu-um sari pannom =====
  const fixBill = (b) => {
    const saved = getSaved()[b.id] || {};

    // NAME - Saved la irundha adhu, illana Backend, illana Unknown + ID
    const name = saved.customerName || pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
    const mobile = saved.mobile || pick(b, ["mobile", "phone", "phoneNumber", "contact"]) || "";
    const course = pick(b, ["course", "courseName"]) || "Stock Market Trading";

    // TOTAL FIX: Backend amount 0 nu thara, aana Paid 4,50,000 nu thara
    // Appo Total = Paid + Balance dhaan correct
    const amountFromBackend = Number(pick(b, ["amount", "total", "totalAmount", "totalFees", "fees", "billAmount"]) || 0);
    const totalFromSaved = Number(saved.total || saved.amount || 0);
    const paidFromSaved = saved.paidAmount !== undefined ? Number(saved.paidAmount) : undefined;
    const paidFromBackend = Number(pick(b, ["paidAmount", "paid", "amountPaid", "collected"]) || 0);
    const paid = paidFromSaved !== undefined ? paidFromSaved : paidFromBackend;

    let total = totalFromSaved > 0 ? totalFromSaved : amountFromBackend;
    // Backend Total 0, Paid 4,50,000 na - Total = Paid dhaan
    if (total === 0 && paid > 0) total = paid;

    const balance = Math.max(0, total - paid);
    const mode = saved.paymentMode || pick(b, ["paymentMode", "mode", "paymentMethod"]) || "-";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || "";

    return { ...b, customerName: name, name: name, mobile: mobile, course: course, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, status: balance <= 0 ? "PAID" : "PENDING", billDate: date };
  };

  const load = () => {
    billApi.getAll()
      .then(res => setBills((res.data || []).map(fixBill)))
      .catch(() => setBills([]));
  };

  useEffect(() => { load(); }, []);

  const deleteBill = async (id) => {
    if (!window.confirm(`ID ${id} - Unknown bill-a delete pannalama? Name illaadha bill-a sari panna mudiyaadhu. Pudhusaa create pannanum.`)) return;
    try {
      await billApi.delete(id);
      const all = getSaved(); delete all[id];
      localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
      load();
    } catch (e) { alert(e.message); }
  };

  const today = new Date().toISOString().slice(0, 10);
  // Ippo Total Fees correct-a varum - Amount illa, Paid+Balance la irundhu
  const totalFees = bills.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalCollected = bills.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
  const totalPending = bills.reduce((s, b) => s + Number(b.balanceAmount || 0), 0);
  const paidCount = bills.filter(b => b.status === "PAID").length;
  const pendingList = bills.filter(b => Number(b.balanceAmount || 0) > 0);
  const todayBills = bills.filter(b => (b.billDate || "").startsWith(today));
  const todayCollected = todayBills.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
  const recentBills = [...bills].slice(-5).reverse();
  const collectionPct = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h2 style={{ color: "#0a2a6b", margin: 0 }}>Dashboard - TradeMass 👋</h2>
          <p style={{ margin: "5px 0 0", color: "#64748b" }}>Welcome back, Admin! Today: 21 November 2026</p>
        </div>
        <Link to="/payments" style={{ background: "#0a2a6b", color: "white", padding: "10px 18px", borderRadius: 6, textDecoration: "none", fontWeight: "bold" }}>+ New Payment</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, margin: "18px 0" }}>
        <div style={{ background: "#0a2a6b", color: "white", padding: 18, borderRadius: 10 }}>
          <div style={{ fontSize: 13, opacity: 0.9 }}>💰 TOTAL COLLECTED</div>
          <h2 style={{ margin: "8px 0 4px" }}>₹{totalCollected.toLocaleString("en-IN")}</h2>
          <small>Total Fees: ₹{totalFees.toLocaleString("en-IN")}</small>
        </div>
        <div style={{ background: "#dcfce7", padding: 18, borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#166534" }}>✅ PAID BILLS</div>
          <h2 style={{ margin: "8px 0 4px", color: "#166534" }}>{paidCount} / {bills.length}</h2>
          <small>Collection: {collectionPct}%</small>
        </div>
        <div style={{ background: "#fee2e2", padding: 18, borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#991b1b" }}>⏳ PENDING BALANCE</div>
          <h2 style={{ margin: "8px 0 4px", color: "#991b1b" }}>₹{totalPending.toLocaleString("en-IN")}</h2>
          <small>{pendingList.length} Students Pending</small>
        </div>
        <div style={{ background: "#dbeafe", padding: 18, borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#0a2a6b" }}>📅 TODAY COLLECTION</div>
          <h2 style={{ margin: "8px 0 4px", color: "#0a2a6b" }}>₹{todayCollected.toLocaleString("en-IN")}</h2>
          <small>{todayBills.length} Bills Today</small>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        <Link to="/students" style={linkBtn}>👤 Add Student</Link>
        <Link to="/courses" style={linkBtn}>📚 View Courses</Link>
        <Link to="/payments" style={linkBtn}>💳 New Payment</Link>
        <Link to="/receipts" style={linkBtn}>🧾 Print Receipt</Link>
        <Link to="/reports" style={linkBtn}>📊 Full Reports</Link>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 550px", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <h3 style={{ margin: 0, color: "#0a2a6b" }}>📋 Recent Bills</h3>
            <Link to="/payments" style={{ color: "#0a2a6b", fontWeight: "bold", textDecoration: "none" }}>View All →</Link>
          </div>
          {recentBills.length === 0 ? <p>No bills found - Payments la pudhu bill create pannunga</p> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8fafc" }}><th style={th}>Name</th><th style={th}>Course</th><th style={th}>Total</th><th style={th}>Paid</th><th style={th}>Balance</th><th style={th}>Status</th><th style={th}></th></tr></thead>
              <tbody>
                {recentBills.map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ ...td, fontWeight: "bold", color: b.customerName.startsWith("Unknown") ? "#dc2626" : "#111" }}>{b.customerName}</td>
                    <td style={td}>{b.course}</td>
                    <td style={td}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                    <td style={{ ...td, color: "#16a34a" }}>₹{Number(b.paidAmount || 0).toLocaleString("en-IN")}</td>
                    <td style={{ ...td, color: b.balanceAmount > 0 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>₹{Number(b.balanceAmount || 0).toLocaleString("en-IN")}</td>
                    <td style={td}><span style={{ color: b.status === "PAID" ? "#16a34a" : "#dc2626", fontWeight: "bold", fontSize: 13 }}>{b.status === "PAID" ? "✅ PAID" : "❌ PENDING"}</span></td>
                    <td style={td}>{b.customerName.startsWith("Unknown") && <button onClick={() => deleteBill(b.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer", fontSize: 12 }}>Delete</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {bills.some(b => b.customerName.startsWith("Unknown")) && (
            <p style={{ background: "#fef2f2", padding: 10, borderRadius: 6, fontSize: 13, color: "#991b1b", marginTop: 12 }}>
              ⚠️ <b>Unknown nu varura bill la Name illa</b> - Backend save pannala. Adha Delete panni Payments la pudhusa create pannunga. Appo dhaan Name varum.
            </p>
          )}
        </div>

        <div style={{ flex: "1 1 300px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 12px", color: "#991b1b" }}>⏳ Pending - Follow Up</h3>
          {pendingList.length === 0 ? <p style={{ color: "green", fontWeight: "bold" }}>🎉 No pending! Ellaam collected.</p> : pendingList.slice(0, 5).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #ffedd5", fontSize: 14 }}>
              <span><b>{b.customerName}</b><br /><small>{b.mobile || ""}</small></span>
              <span style={{ color: "red", fontWeight: "bold" }}>₹{Number(b.balanceAmount).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <Link to="/reports" style={{ display: "block", textAlign: "center", marginTop: 12, background: "white", border: "1px solid #fed7aa", padding: "8px", borderRadius: 6, color: "#991b1b", fontWeight: "bold", textDecoration: "none" }}>View All Pending →</Link>
        </div>
      </div>
    </div>
  );
}
const th = { padding: "10px", textAlign: "left", fontSize: 13 };
const td = { padding: "10px", fontSize: 14 };
const linkBtn = { background: "white", border: "1px solid #e2e8f0", padding: "9px 14px", borderRadius: 6, textDecoration: "none", color: "#0a2a6b", fontWeight: "bold" };
export default Dashboard;