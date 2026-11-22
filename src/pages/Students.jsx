import React, { useEffect, useState } from "react";
import { billApi } from "../services/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    customerName: "", mobile: "", district: "",
    course: "Stock Market Trading",
    amount: 30000, paidAmount: "",
    paymentMode: "UPI - Phone pe",
    paymentDate: new Date().toISOString().slice(0, 10),
  });

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem("trademass_bill_fix") || "{}"); } catch { return {}; }
  };
  const saveFix = (key, data) => {
    const all = getSaved();
    all[key] = data;
    localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
  };
  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  // ===== FIX: Payments / Dashboard la irukura adhe fix =====
  const fixBill = (b) => {
    const saved = getSaved()[b.id] || {};
    const name = saved.customerName || pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
    const mobile = saved.mobile || pick(b, ["mobile", "phone", "phoneNumber", "contact", "customerEmail"]) || "";
    const district = saved.district || pick(b, ["district", "state", "city", "place"]) || "-";
    const course = saved.course || pick(b, ["course", "courseName"]) || "Stock Market Trading";

    const amountFromBackend = Number(pick(b, ["amount", "total", "totalAmount", "totalFees", "fees", "billAmount"]) || 0);
    const totalFromSaved = Number(saved.total || saved.amount || 0);
    const paidFromSaved = saved.paidAmount !== undefined ? Number(saved.paidAmount) : undefined;
    const paidFromBackend = Number(pick(b, ["paidAmount", "paid", "amountPaid", "collected"]) || 0);
    const paid = paidFromSaved !== undefined ? paidFromSaved : paidFromBackend;

    let total = totalFromSaved > 0 ? totalFromSaved : amountFromBackend;
    if (total === 0 && paid > 0) total = paid;

    const balance = Math.max(0, total - paid);
    const mode = saved.paymentMode || pick(b, ["paymentMode", "mode", "paymentMethod"]) || "-";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || "";

    return { ...b, customerName: name, name: name, mobile: mobile, district: district, course: course, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, status: balance <= 0 ? "PAID" : "PENDING", billDate: date };
  };

  const load = () => {
    billApi.getAll()
      .then(res => setStudents((res.data || []).map(fixBill)))
      .catch(() => setStudents([]));
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

    // Backend ku ella peru layum anuppurom
    const payload = {
      customerName: form.customerName, name: form.customerName, studentName: form.customerName,
      customerEmail: form.mobile, mobile: form.mobile, phone: form.mobile, phoneNumber: form.mobile,
      district: form.district, state: form.district, course: form.course, courseName: form.course,
      amount: total, total: total, totalAmount: total, totalFees: total,
      paidAmount: paid, paid: paid,
      balanceAmount: balance, balance: balance,
      paymentMode: form.paymentMode, mode: form.paymentMode,
      billDate: form.paymentDate, dueDate: form.paymentDate, paymentDate: form.paymentDate,
      status: balance <= 0 ? "PAID" : "PENDING",
    };
    try {
      const res = await billApi.create(payload);
      const newId = res?.data?.id;
      const saveData = { customerName: form.customerName, mobile: form.mobile, district: form.district, course: form.course, total: total, paidAmount: paid, paymentMode: form.paymentMode };
      if (newId) {
        saveFix(newId, saveData);
        setForm({ ...form, customerName: "", mobile: "", district: "", paidAmount: "" });
        setSearch("");
        setTimeout(load, 400);
      } else {
        setTimeout(async () => {
          const r = await billApi.getAll();
          const last = (r.data || []).slice(-1)[0];
          if (last) saveFix(last.id, saveData);
          setForm({ ...form, customerName: "", mobile: "", district: "", paidAmount: "" });
          setSearch(""); load();
        }, 500);
      }
      alert(`Student Added ✅\n${form.customerName} - ₹${total} | Paid ₹${paid} | Pending ₹${balance}`);
    } catch (err) { alert("Failed: " + err.message); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await billApi.delete(id);
      const all = getSaved(); delete all[id];
      localStorage.setItem("trademass_bill_fix", JSON.stringify(all));
      load();
    } catch (e) { alert(e.message); }
  };

  const searchText = search.trim().toLowerCase();
  const filtered = students.filter(b => {
    if (!searchText) return true;
    return ((b.customerName || "").toLowerCase().includes(searchText) || (b.mobile || "").includes(searchText) || (b.district || "").toLowerCase().includes(searchText) || (b.course || "").toLowerCase().includes(searchText) || String(b.id).includes(searchText));
  });

  const totalFees = filtered.reduce((s, b) => s + Number(b.amount || 0), 0);
  const totalPaid = filtered.reduce((s, b) => s + Number(b.paidAmount || 0), 0);
  const totalPending = filtered.reduce((s, b) => s + Number(b.balanceAmount || 0), 0);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#0a2a6b", margin: 0 }}>Students - TradeMass</h2>
        <span style={{ background: "#0a2a6b", color: "white", padding: "6px 14px", borderRadius: 20, fontWeight: "bold", fontSize: 14 }}>Total: {students.length}</span>
      </div>
      <p style={{ background: "#e0f2fe", padding: 10, borderRadius: 6, marginTop: 12 }}>Total Bills: {students.length} | Showing: {filtered.length} | Total Fees: ₹{totalFees.toLocaleString("en-IN")} | Collected: ₹{totalPaid.toLocaleString("en-IN")} | Pending: ₹{totalPending.toLocaleString("en-IN")}</p>

      <form onSubmit={create} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 15, display: "flex", flexWrap: "wrap", gap: 10, margin: "15px 0" }}>
        <input placeholder="Student Name *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} required style={inputStyle} />
        <input placeholder="Mobile Number *" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} required style={inputStyle} />
        <input placeholder="District / State" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} style={inputStyle} />
        <select value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} style={inputStyle}>
          <option>Stock Market Trading</option><option>Options Trading</option><option>Intraday Trading</option><option>Swing Trading</option>
        </select>
        <input type="date" value={form.paymentDate} onChange={e => setForm({ ...form, paymentDate: e.target.value })} required style={inputStyle} />
        <input type="number" placeholder="Total Fee" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required style={inputStyle} />
        <input type="number" placeholder="Paid Amount" value={form.paidAmount} onChange={e => setForm({ ...form, paidAmount: e.target.value })} style={inputStyle} />
        <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })} style={inputStyle}>
          <option>UPI - Phone pe</option><option>UPI - GPay</option><option>Cash</option><option>Bank Transfer</option>
        </select>
        <button type="submit" style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>+ Add Student</button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="🔍 Search by Name / Mobile / District..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #cbd5e1" }} />
        {search && <button onClick={() => setSearch("")} style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>✕ Clear</button>}
        <button onClick={load} style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>🔄 Refresh</button>
      </div>

      <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #e2e8f0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: "#0a2a6b", color: "white" }}>
            <th style={th}>ID</th><th style={th}>Name</th><th style={th}>Mobile</th><th style={th}>District</th><th style={th}>Course</th><th style={th}>Total Fee</th><th style={th}>Paid</th><th style={th}>Balance</th><th style={th}>Mode</th><th style={th}>Status</th><th style={th}>Date</th><th style={th}>Action</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan="12" style={{ textAlign: "center", padding: 25 }}>
                {students.length === 0 ? "No students found" : <><div style={{ fontWeight: "bold", marginBottom: 8 }}>Search "{search}" ku edhuvum illa. Total {students.length} students irukku.</div><button onClick={() => setSearch("")} style={{ background: "#0a2a6b", color: "white", border: "none", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>Show All {students.length} Students</button></>}
              </td></tr>
            )}
            {filtered.map(b => (
              <tr key={b.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={td}>{b.id}</td>
                <td style={{ ...td, fontWeight: "bold", color: b.customerName.startsWith("Unknown") ? "#dc2626" : "#111" }}>{b.customerName}</td>
                <td style={td}>{b.mobile || "-"}</td>
                <td style={td}>{b.district || "-"}</td>
                <td style={td}>{b.course}</td>
                <td style={td}>₹{Number(b.amount || 0).toLocaleString("en-IN")}</td>
                <td style={{ ...td, color: "#16a34a" }}>₹{Number(b.paidAmount || 0).toLocaleString("en-IN")}</td>
                <td style={{ ...td, color: b.balanceAmount > 0 ? "#dc2626" : "#16a34a", fontWeight: "bold" }}>₹{Number(b.balanceAmount || 0).toLocaleString("en-IN")}</td>
                <td style={td}>{b.paymentMode}</td>
                <td style={td}><span style={{ color: b.status === "PAID" ? "#16a34a" : "#dc2626", fontWeight: "bold", fontSize: 13 }}>{b.status === "PAID" ? "✅ PAID" : "❌ PENDING"}</span></td>
                <td style={td}>{b.billDate}</td>
                <td style={td}><button onClick={() => del(b.id)} style={delBtn}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {students.some(b => b.customerName.startsWith("Unknown")) && <p style={{ background: "#fef2f2", padding: 10, borderRadius: 6, fontSize: 13, color: "#991b1b", marginTop: 12 }}>⚠️ Unknown nu varura student la Name illa - Backend save pannala. Delete panni pudhusa add pannunga.</p>}
    </div>
  );
}
const inputStyle = { padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1", flex: "1 1 200px" };
const th = { padding: "12px 10px", textAlign: "left", fontSize: 13 };
const td = { padding: "10px", fontSize: 14 };
const delBtn = { background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: 5, cursor: "pointer" };
export default Students;