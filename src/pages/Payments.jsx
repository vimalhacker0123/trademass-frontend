import React, { useEffect, useState } from "react";
import { billApi } from "../services/api";

function Payments() {
  const [bills, setBills] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Connecting to backend...");
  const [rawSample, setRawSample] = useState(null);
  const [form, setForm] = useState({
    customerName: "", mobile: "", district: "",
    course: "Stock Market Trading",
    duration: "7 Days Live online class - 1 Month Practice",
    amount: 30000, paidAmount: "",
    paymentMode: "UPI - Phone pe", transactionId: "",
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  // ===== HELPER: Backend enna peru la anuppinaalum eduthukom =====
  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem("trademass_bill_fix") || "{}"); } catch { return {}; }
  };
  const saveFix = (key, data) => {
    const all = getSaved();
    all[key] = data;
    localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
  };

  // ===== MAIN FIX: Ella field peru-yum check pannu =====
  const fixBill = (b) => {
    const saved = getSaved()[b.id] || {};

    // NAME - customerName / name / studentName / customer_name ellam paaru
    const name = saved.customerName || pick(b, ["customerName", "name", "studentName", "customer_name", "student_name", "fullName"]) || "";
    // MOBILE - mobile / phone / phoneNumber / contact ellam paaru
    const mobile = saved.mobile || pick(b, ["mobile", "phone", "phoneNumber", "contact", "mobileNumber", "phone_number"]) || "";
    // COURSE
    const course = pick(b, ["course", "courseName", "course_name"]) || "Stock Market Trading";
    // TOTAL - amount / total / totalAmount / totalFees / fees / billAmount ellam paaru
    // Idhu dhaan mukkiyam - Backend amount-a vera peru la anuppudhu
    const totalFromBackend = Number(pick(b, ["amount", "total", "totalAmount", "total_amount", "totalFees", "total_fees", "fees", "billAmount", "courseFees", "courseFee"]) || 0);
    const totalFromSaved = Number(saved.total || saved.amount || 0);
    // Saved la total irundha adhu, illana backend la irundhu
    let total = totalFromSaved > 0 ? totalFromSaved : totalFromBackend;
    // Backend total 0, paid 30000 nu thara na - Paid dhaan Total nu artham
    // Pazhaya bill la Total-a Paid la potutaanga, adha sari pannu
    const paidFromBackend = Number(pick(b, ["paidAmount", "paid", "amountPaid", "paid_amount", "collected", "paidFees"]) || 0);
    const paidFromSaved = saved.paidAmount !== undefined ? Number(saved.paidAmount) : undefined;
    let paid = paidFromSaved !== undefined ? paidFromSaved : paidFromBackend;

    // BACKEND BUG FIX: Total 0 aana Paid 30000 nu irundha, Total = Paid nu eduthuko
    // Illana Total 0 nu kaatum
    if (total === 0 && paid > 0) {
      total = paid;
      // Aana Paid Amount form la empty-a irundha, Paid 0 dhaan irukanum - Saved la paaru
      // Saved la paid 0 nu irundha, adha use pannu
      if (saved.paidAmount === 0) {
        paid = 0;
      }
    }

    const balance = Math.max(0, total - paid);
    const mode = saved.paymentMode || pick(b, ["paymentMode", "mode", "paymentMethod", "payment_method", "method"]) || "-";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || "";

    return { ...b, id: b.id, customerName: name, name: name, mobile: mobile, course: course, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, status: balance <= 0 ? "PAID" : "PENDING", billDate: date, dueDate: date };
  };

  const load = async () => {
    try {
      const res = await billApi.getAll();
      const list = res.data || [];
      if (list.length > 0) setRawSample(list[0]); // Debug ku - Backend raw data
      setBills(list.map(fixBill));
      setStatus(`Connected ✅ - ${list.length} bills found`);
    } catch {
      setStatus("❌ Backend connect aagala.");
      setBills([]);
    }
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const total = Number(form.amount);
    const paid = Number(form.paidAmount || 0);
    if (!form.customerName.trim()) return alert("Student Name enter pannunga!");
    if (!form.mobile.trim()) return alert("Mobile enter pannunga!");
    if (paid > total) return alert(`Paid ₹${paid} Total ₹${total} vida adhigam!`);
    const balance = total - paid;

    // Backend ku ella peru layum anuppurom - Edhu accept pannaalum work aagum
    const payload = {
      customerName: form.customerName, name: form.customerName, studentName: form.customerName,
      customerEmail: form.mobile, mobile: form.mobile, phone: form.mobile, phoneNumber: form.mobile,
      district: form.district, course: form.course, courseName: form.course, duration: form.duration,
      amount: total, total: total, totalAmount: total, totalFees: total, billAmount: total,
      paidAmount: paid, paid: paid, amountPaid: paid,
      balanceAmount: balance, balance: balance,
      paymentMode: form.paymentMode, mode: form.paymentMode, paymentMethod: form.paymentMode,
      transactionId: form.transactionId, billDate: form.paymentDate,
      dueDate: form.paymentDate, paymentDate: form.paymentDate, joiningDate: form.paymentDate,
      status: balance <= 0 ? "PAID" : "PENDING",
    };
    console.log("Anupura Data:", payload);
    try {
      const res = await billApi.create(payload);
      const newId = res?.data?.id;
      if (newId) {
        // Name / Mobile / Total-um save pannitom - Backend marandhalum kaatum
        saveFix(newId, { customerName: form.customerName, mobile: form.mobile, district: form.district, course: form.course, duration: form.duration, total: total, paidAmount: paid, paymentMode: form.paymentMode, transactionId: form.transactionId });
        setForm({ ...form, customerName: "", mobile: "", district: "", paidAmount: "", transactionId: "" });
        setSearch("");
        setTimeout(load, 400);
      } else {
        setTimeout(async () => {
          const r = await billApi.getAll();
          const last = (r.data || []).slice(-1)[0];
          if (last) saveFix(last.id, { customerName: form.customerName, mobile: form.mobile, district: form.district, course: form.course, duration: form.duration, total: total, paidAmount: paid, paymentMode: form.paymentMode, transactionId: form.transactionId });
          setForm({ ...form, customerName: "", mobile: "", district: "", paidAmount: "", transactionId: "" });
          setSearch(""); load();
        }, 500);
      }
      alert(`Bill Created ✅\nName: ${form.customerName}\nTotal: ₹${total} | Paid: ₹${paid} | Pending: ₹${balance} | Mode: ${form.paymentMode}`);
    } catch (err) { alert("Failed: " + err.message); }
  };

  const markPaid = async (bill) => {
    const remaining = Number(bill.balanceAmount);
    if (remaining <= 0) return;
    if (!window.confirm(`Full Balance Pay Pannalama?\n\n${bill.customerName}\nTotal: ₹${bill.amount} | Paid: ₹${bill.paidAmount}\nPending: ₹${remaining} | Mode: ${bill.paymentMode}`)) return;
    const updated = { ...bill, paidAmount: Number(bill.amount), balanceAmount: 0, status: "PAID" };
    setBills(prev => prev.map(b => b.id === bill.id ? updated : b));
    saveFix(bill.id, { customerName: bill.customerName, mobile: bill.mobile, district: bill.district, course: bill.course, duration: bill.duration, total: bill.amount, paidAmount: Number(bill.amount), paymentMode: bill.paymentMode });
    try {
      const payload = { paidAmount: updated.paidAmount, balanceAmount: 0, status: "PAID", paymentMode: bill.paymentMode, mode: bill.paymentMode };
      if (billApi.update) await billApi.update(bill.id, payload);
      else if (billApi.pay) await billApi.pay(bill.id, payload);
      alert(`Full Payment Done ✅ Pending ₹${remaining} Paid`);
      load();
    } catch (err) { alert(`UI la PAID aayiduchu ✅, Backend la save aagala`); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await billApi.delete(id);
      const all = getSaved(); delete all[id];
      localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
      load();
    } catch (e) { alert(e.message); }
  };

  // Pazhaya bill-a sari panna - Clear All button
  const clearOldData = () => {
    if (!window.confirm("Pazhaya thappana bills ellam delete pannalama? (ID 8, 9 maari)")) return;
    localStorage.removeItem("trademass_bill_fix");
    // Backend la irukura ella bill-um delete pannu
    bills.forEach(async (b) => { try { await billApi.delete(b.id); } catch {} });
    setTimeout(() => { setBills([]); load(); }, 500);
  };

  const searchText = search.trim().toLowerCase();
  const filtered = bills.filter(b => {
    if (!searchText) return true;
    return ((b.customerName || "").toLowerCase().includes(searchText) || (b.mobile || "").includes(searchText) || String(b.id).includes(searchText));
  });

  const totalCollected = filtered.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
  const totalPending = filtered.reduce((s, b) => s + Number(b.balanceAmount || 0), 0);
  const paidCount = filtered.filter(b => b.status === "PAID").length;
  const previewTotal = Number(form.amount || 0);
  const previewPaid = Number(form.paidAmount || 0);
  const previewBalance = Math.max(0, previewTotal - previewPaid);

  return (
    <div>
      <h2 style={{ color: "#0a2a6b" }}>Payments / Bills</h2>
      <p style={{ background: "#e0f2fe", padding: 10, borderRadius: 6 }}>{status} | Total Bills: {bills.length} | Showing: {filtered.length}</p>

      {/* DEBUG BOX - Backend enna anupudhu nu paaka - Idha paathu sollu
      {rawSample && (
        <div style={{ background: "#fff7ed", border: "1px solid #fdba74", padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 12, overflowX: "auto" }}>
          <b>🔍 Backend Raw Data (Debug):</b> {JSON.stringify(rawSample)}
          <button onClick={clearOldData} style={{ marginLeft: 10, background: "#ef4444", color: "white", border: "none", padding: "4px 10px", borderRadius: 4, cursor: "pointer" }}>Pazhaya Bills Delete Pannu</button>
        </div>
      )} */}

      <div style={{ display: "flex", gap: 12, margin: "15px 0" }}>
        <div style={{ background: "#dcfce7", padding: 15, borderRadius: 8, flex: 1 }}><b>Collected</b><h3 style={{ margin: "5px 0 0" }}>₹{totalCollected.toLocaleString("en-IN")}</h3></div>
        <div style={{ background: "#fee2e2", padding: 15, borderRadius: 8, flex: 1 }}><b>Pending</b><h3 style={{ margin: "5px 0 0", color: "#991b1b" }}>₹{totalPending.toLocaleString("en-IN")}</h3></div>
        <div style={{ background: "#dbeafe", padding: 15, borderRadius: 8, flex: 1 }}><b>Paid Bills</b><h3 style={{ margin: "5px 0 0" }}>{paidCount} / {filtered.length}</h3></div>
      </div>

      <form onSubmit={create} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 15, display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 15 }}>
        <input placeholder="Student Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required style={inputStyle} />
        <input placeholder="Mobile *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required style={inputStyle} />
        <input placeholder="District / State" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} style={inputStyle} />
        <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} style={inputStyle}>
          <option>Stock Market Trading</option><option>Options Trading</option><option>Intraday Trading</option><option>Swing Trading</option>
        </select>
        <input type="number" placeholder="Total Fee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required style={inputStyle} />
        <input type="number" placeholder="Paid Amount" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} style={inputStyle} />
        <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} style={inputStyle}>
          <option>UPI - Phone pe</option><option>UPI - GPay</option><option>Cash</option><option>Bank Transfer</option>
        </select>
        <input placeholder="Transaction ID / UTR" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} style={inputStyle} />
        <input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} required style={inputStyle} />
        <div style={{ width: "100%", background: "white", border: "1px solid #e2e8f0", padding: "10px 14px", borderRadius: 8, display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
          <span>Total: ₹{previewTotal.toLocaleString("en-IN")} | Paid: ₹{previewPaid.toLocaleString("en-IN")} | Mode: {form.paymentMode}</span>
          <span style={{ color: previewBalance > 0 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>Pending: ₹{Number(previewBalance || 0).toLocaleString("en-IN")}</span>
        </div>
        <button type="submit" style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>+ Create Bill</button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="🔍 Search by Name / Mobile / ID..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>✕ Clear</button>}
        <button onClick={load} style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>🔄 Refresh</button>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#0a2a6b", color: "white" }}>
            <th style={th}>ID</th><th style={th}>Name</th><th style={th}>Mobile</th><th style={th}>Total</th><th style={th}>Paid</th><th style={th}>Pending</th><th style={th}>Mode</th><th style={th}>Status</th><th style={th}>Date</th><th style={th}>Action</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan="10" style={{ textAlign: "center", padding: 25 }}>No bills found - Pudhu bill create pannunga</td></tr>}
            {filtered.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={td}>{b.id}</td>
                <td style={{ ...td, fontWeight: "bold" }}>{b.customerName || "(No Name - Backend la save aagala)"}</td>
                <td style={td}>{b.mobile || "-"}</td>
                <td style={td}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                <td style={{ ...td, color: "#16a34a" }}>₹{Number(b.paidAmount || 0).toLocaleString("en-IN")}</td>
                <td style={{ ...td, color: b.balanceAmount > 0 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>₹{Number(b.balanceAmount || 0).toLocaleString("en-IN")}</td>
                <td style={td}>{b.paymentMode}</td>
                <td style={td}><span style={{ color: b.status === "PAID" ? "#16a34a" : "#dc2626", fontWeight: "bold", fontSize: 13 }}>{b.status === "PAID" ? "✅ PAID" : "❌ PENDING"}</span></td>
                <td style={td}>{b.billDate || b.dueDate}</td>
                <td style={td}>
                  {b.balanceAmount > 0 && <button onClick={() => markPaid(b)} style={payBtn}>Pay Now - Full ₹{Number(b.balanceAmount).toLocaleString("en-IN")}</button>}{" "}
                  <button onClick={() => del(b.id)} style={delBtn}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
const inputStyle = { padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1", flex: "1 1 200px" };
const th = { padding: "12px 10px", textAlign: "left", fontSize: 13 };
const td = { padding: "10px", fontSize: 14 };
const payBtn = { background: "#16a34a", color: "white", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer", fontWeight: "bold" };
const delBtn = { background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer" };
export default Payments;