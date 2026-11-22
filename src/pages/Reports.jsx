import React, { useEffect, useState } from "react";
import { billApi } from "../services/api";

function Reports() {
  const [bills, setBills] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem("trademass_bill_fix") || "{}"); } catch { return {}; }
  };
  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  // ===== FIX: Dashboard / Payments la irukura adhe fix =====
  const fixBill = (b) => {
    const saved = getSaved()[b.id] || {};
    const name = saved.customerName || pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
    const mobile = saved.mobile || pick(b, ["mobile", "phone", "phoneNumber", "contact"]) || "";
    const course = saved.course || pick(b, ["course", "courseName", "course_name"]) || "Stock Market Trading";

    // TOTAL FIX: Backend amount 0, Paid 80000 na Total = Paid dhaan
    const amountFromBackend = Number(pick(b, ["amount", "total", "totalAmount", "totalFees", "fees", "billAmount"]) || 0);
    const totalFromSaved = Number(saved.total || saved.amount || 0);
    const paidFromSaved = saved.paidAmount !== undefined ? Number(saved.paidAmount) : undefined;
    const paidFromBackend = Number(pick(b, ["paidAmount", "paid", "amountPaid", "collected"]) || 0);
    const paid = paidFromSaved !== undefined ? paidFromSaved : paidFromBackend;

    let total = totalFromSaved > 0 ? totalFromSaved : amountFromBackend;
    if (total === 0 && paid > 0) total = paid; // Idhu dhaan mukkiyam

    const balance = Math.max(0, total - paid);
    const mode = saved.paymentMode || pick(b, ["paymentMode", "mode", "paymentMethod"]) || "Unknown";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || "";

    return { ...b, customerName: name, name: name, mobile: mobile, course: course, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, status: balance <= 0 ? "PAID" : "PENDING", billDate: date };
  };

  const load = () => {
    billApi.getAll()
      .then(res => setBills((res.data || []).map(fixBill)))
      .catch(() => setBills([]));
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().slice(0, 10);
  const thisMonth = today.slice(0, 7);
  let filtered = [...bills];
  if (filter === "today") filtered = filtered.filter(b => (b.billDate || "").startsWith(today));
  if (filter === "month") filtered = filtered.filter(b => (b.billDate || "").startsWith(thisMonth));
  if (filter === "paid") filtered = filtered.filter(b => b.status === "PAID");
  if (filter === "pending") filtered = filtered.filter(b => b.status === "PENDING");
  if (search) filtered = filtered.filter(b => (b.customerName || "").toLowerCase().includes(search.toLowerCase()) || (b.mobile || "").includes(search));

  // ===== CALCULATION FIX =====
  const totalFees = filtered.reduce((s, b) => s + Number(b.amount || 0), 0);
  const paidAmt = filtered.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
  const pendingAmt = filtered.reduce((s, b) => s + Number(b.balanceAmount || 0), 0);
  const paidCount = filtered.filter(b => b.status === "PAID").length;
  // Collection % FIX: Total 0 na 0% illa, Paid irundha 100% nu kaatu
  const collectionPct = totalFees > 0 ? Math.round((paidAmt / totalFees) * 100) : (paidAmt > 0 ? 100 : 0);

  const courseWise = {};
  filtered.forEach(b => {
    const c = b.course || "Stock Market Trading";
    if (!courseWise[c]) courseWise[c] = { count: 0, collected: 0, pending: 0, total: 0 };
    courseWise[c].count += 1;
    courseWise[c].collected += Number(b.paidAmount || 0);
    courseWise[c].pending += Number(b.balanceAmount || 0);
    courseWise[c].total += Number(b.amount || 0);
  });

  const modeWise = {};
  filtered.forEach(b => {
    const m = b.paymentMode || "Unknown";
    if (!modeWise[m]) modeWise[m] = 0;
    modeWise[m] += Number(b.paidAmount || 0);
  });

  const pendingList = filtered.filter(b => Number(b.balanceAmount || 0) > 0);

  const exportCSV = () => {
    const header = "ID,Name,Mobile,Course,Total,Paid,Balance,Mode,Status,Date\n";
    const rows = filtered.map(b => `${b.id},"${b.customerName}",${b.mobile || ""},${b.course},${b.amount},${b.paidAmount},${b.balanceAmount},${b.paymentMode},${b.status},${b.billDate}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `TradeMass-Report-${today}.csv`; a.click();
  };

  const maxCollected = Math.max(...Object.values(courseWise).map(c => c.collected), 1);

  const del = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await billApi.delete(id);
      const all = getSaved(); delete all[id];
      localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 style={{ color: "#0a2a6b", margin: 0 }}>Reports - TradeMass</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={btnGreen}>📥 Export CSV</button>
          <button onClick={() => window.print()} style={btnBlue}>🖨️ Print</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, margin: "15px 0", flexWrap: "wrap" }}>
        {["all", "today", "month", "paid", "pending"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: "bold", background: filter === f ? "#0a2a6b" : "#e2e8f0", color: filter === f ? "white" : "#333", textTransform: "capitalize" }}>{f === "all" ? "All Time" : f}</button>
        ))}
        <input placeholder="🔍 Search student..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "8px 12px", borderRadius: 20, border: "1px solid #cbd5e1", flex: 1, minWidth: 180 }} />
      </div>

      {/* SUMMARY - Ippo correct-a varum */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#0a2a6b", color: "white", padding: 18, borderRadius: 10 }}><div style={{ fontSize: 13, opacity: 0.8 }}>TOTAL COURSE FEES</div><h2 style={{ margin: "6px 0 0" }}>₹{totalFees.toLocaleString("en-IN")}</h2><small>{filtered.length} Bills</small></div>
        <div style={{ background: "#dcfce7", padding: 18, borderRadius: 10 }}><div style={{ fontSize: 13, color: "#166534" }}>✅ COLLECTED (PAID)</div><h2 style={{ margin: "6px 0 0", color: "#166534" }}>₹{paidAmt.toLocaleString("en-IN")}</h2><small>{paidCount} Paid Bills</small></div>
        <div style={{ background: "#fee2e2", padding: 18, borderRadius: 10 }}><div style={{ fontSize: 13, color: "#991b1b" }}>⏳ PENDING BALANCE</div><h2 style={{ margin: "6px 0 0", color: "#991b1b" }}>₹{pendingAmt.toLocaleString("en-IN")}</h2><small>{pendingList.length} Students Pending</small></div>
        <div style={{ background: "#dbeafe", padding: 18, borderRadius: 10 }}><div style={{ fontSize: 13, color: "#0a2a6b" }}>📊 COLLECTION %</div><h2 style={{ margin: "6px 0 0", color: "#0a2a6b" }}>{collectionPct}%</h2><small>Collection Rate</small></div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 350px", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 14px", color: "#0a2a6b" }}>📚 Course-wise Collection</h3>
          {Object.keys(courseWise).length === 0 && <p>No data</p>}
          {Object.entries(courseWise).map(([course, d]) => (
            <div key={course} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}><b>{course}</b><span>₹{d.collected.toLocaleString("en-IN")} • {d.count} students • Total ₹{d.total.toLocaleString("en-IN")}</span></div>
              <div style={{ background: "#e2e8f0", height: 10, borderRadius: 10, marginTop: 5, overflow: "hidden" }}><div style={{ width: `${(d.collected / maxCollected) * 100}%`, background: "#0a2a6b", height: "100%" }}></div></div>
              {d.pending > 0 && <div style={{ fontSize: 12, color: "red", marginTop: 3 }}>Pending: ₹{d.pending.toLocaleString("en-IN")}</div>}
            </div>
          ))}
        </div>
        <div style={{ flex: "1 1 250px", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
          <h3 style={{ margin: "0 0 14px", color: "#0a2a6b" }}>💳 Payment Mode-wise</h3>
          {Object.entries(modeWise).map(([mode, amt]) => (
            <div key={mode} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1f5f9", fontSize: 14 }}><span>{mode}</span><b>₹{amt.toLocaleString("en-IN")}</b></div>
          ))}
          {Object.keys(modeWise).length === 0 && <p>No data</p>}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: "bold", borderTop: "2px solid #0a2a6b", marginTop: 8 }}><span>Total</span><span>₹{paidAmt.toLocaleString("en-IN")}</span></div>
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginTop: 16 }}>
        <h3 style={{ margin: "0 0 12px", color: "#991b1b" }}>⏳ Pending Payments - Follow Up List ({pendingList.length})</h3>
        {pendingList.length === 0 ? <p style={{ color: "green", fontWeight: "bold" }}>🎉 No pending! Ellaam full collected.</p> : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr style={{ background: "#fef2f2" }}><th style={th}>Name</th><th style={th}>Mobile</th><th style={th}>Course</th><th style={th}>Total</th><th style={th}>Paid</th><th style={th}>Balance Due</th></tr></thead>
            <tbody>{pendingList.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={td}><b>{b.customerName}</b></td><td style={td}>{b.mobile || "-"}</td><td style={td}>{b.course}</td><td style={td}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td><td style={td}>₹{Number(b.paidAmount || 0).toLocaleString("en-IN")}</td><td style={{ ...td, color: "red", fontWeight: "bold" }}>₹{Number(b.balanceAmount || 0).toLocaleString("en-IN")}</td></tr>
            ))}</tbody>
          </table>
        )}
      </div>

      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginTop: 16 }}>
        <h3 style={{ margin: "0 0 12px", color: "#0a2a6b" }}>📋 All Bills ({filtered.length})</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#0a2a6b", color: "white" }}><th style={th}>ID</th><th style={th}>Name</th><th style={th}>Course</th><th style={th}>Total</th><th style={th}>Paid</th><th style={th}>Balance</th><th style={th}>Status</th><th style={th}>Date</th><th style={th}></th></tr></thead>
          <tbody>{filtered.map(b => (
            <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9" }}><td style={td}>{b.id}</td><td style={{ ...td, fontWeight: "bold", color: b.customerName.startsWith("Unknown") ? "#dc2626" : "#111" }}>{b.customerName}</td><td style={td}>{b.course}</td><td style={td}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td><td style={td}>₹{Number(b.paidAmount || 0).toLocaleString("en-IN")}</td><td style={td}>₹{Number(b.balanceAmount || 0).toLocaleString("en-IN")}</td><td style={td}><span style={{ color: b.status === "PAID" ? "#16a34a" : "#dc2626", fontWeight: "bold", fontSize: 13 }}>{b.status === "PAID" ? "✅ PAID" : "❌ PENDING"}</span></td><td style={td}>{b.billDate}</td><td style={td}>{b.customerName.startsWith("Unknown") && <button onClick={() => del(b.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "4px 8px", borderRadius: 4, cursor: "pointer" }}>Delete</button>}</td></tr>
          ))}</tbody>
        </table>
        {bills.some(b => b.customerName.startsWith("Unknown")) && <p style={{ background: "#fef2f2", padding: 10, borderRadius: 6, fontSize: 13, color: "#991b1b", marginTop: 12 }}>⚠️ Unknown nu varura bill la Name illa - Backend save pannala. Delete panni Payments la pudhusa create pannunga.</p>}
      </div>
    </div>
  );
}
const th = { padding: "10px", textAlign: "left", fontSize: 13 };
const td = { padding: "10px", fontSize: 14 };
const btnGreen = { background: "#16a34a", color: "white", border: "none", padding: "9px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" };
const btnBlue = { background: "#0a2a6b", color: "white", border: "none", padding: "9px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" };
export default Reports;