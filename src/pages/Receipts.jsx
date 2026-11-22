import React, { useEffect, useState } from "react";
import { billApi } from "../services/api";

function Receipts() {
  const [bills, setBills] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const getSaved = () => {
    try { return JSON.parse(localStorage.getItem("trademass_bill_fix") || "{}"); } catch { return {}; }
  };
  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  // ===== FIX: Vera 4 page la irukura adhe fix =====
  const fixBill = (b) => {
    const saved = getSaved()[b.id] || {};
    const name = saved.customerName || pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
    const mobile = saved.mobile || pick(b, ["mobile", "phone", "phoneNumber", "contact", "customerEmail"]) || "-";
    const district = saved.district || pick(b, ["district", "state", "city"]) || "-";
    const course = saved.course || pick(b, ["course", "courseName", "course_name"]) || "Stock Market Trading";
const duration = saved.duration || pick(b, ["duration", "courseDuration"]) || "3 Months";
   

    const amountFromBackend = Number(pick(b, ["amount", "total", "totalAmount", "totalFees", "fees", "billAmount"]) || 0);
    const totalFromSaved = Number(saved.total || saved.amount || 0);
    const paidFromSaved = saved.paidAmount !== undefined ? Number(saved.paidAmount) : undefined;
    const paidFromBackend = Number(pick(b, ["paidAmount", "paid", "amountPaid", "collected"]) || 0);
    const paid = paidFromSaved !== undefined ? paidFromSaved : paidFromBackend;

    let total = totalFromSaved > 0 ? totalFromSaved : amountFromBackend;
    if (total === 0 && paid > 0) total = paid; // Idhu dhaan mukkiyam

    const balance = Math.max(0, total - paid);
    const mode = saved.paymentMode || pick(b, ["paymentMode", "mode", "paymentMethod"]) || "-";
    const txn = pick(b, ["transactionId", "transaction_id", "utr", "utrNo"]) || "-";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || new Date().toISOString().slice(0, 10);

    return { ...b, customerName: name, name: name, mobile: mobile, district: district, course: course, duration: duration, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, transactionId: txn, status: balance <= 0 ? "PAID" : "PENDING", billDate: date };
  };

  const load = () => {
    billApi.getAll()
      .then(res => {
        const list = (res.data || []).map(fixBill);
        setBills(list);
        if (list.length > 0 && !selectedId) setSelectedId(list[list.length - 1].id);
      })
      .catch(() => setBills([]));
  };

  useEffect(() => { load(); }, []);

  const selected = bills.find(b => b.id === selectedId) || bills[bills.length - 1] || null;

  const printReceipt = () => window.print();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }} className="no-print">
        <h2 style={{ color: "#0a2a6b", margin: 0 }}>Receipts</h2>
        <button onClick={printReceipt} style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 18px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>🖨️ Print Receipt</button>
      </div>

      {/* Bill Select Buttons - Ippo Name varum */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "15px 0" }} className="no-print">
        {bills.length === 0 && <p>No bills found - Payments la pudhu bill create pannunga</p>}
        {bills.map(b => (
          <button key={b.id} onClick={() => setSelectedId(b.id)} style={{ padding: "8px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontWeight: "bold", fontSize: 13, background: b.id === selectedId ? "#0a2a6b" : "#e2e8f0", color: b.id === selectedId ? "white" : "#333" }}>
            #{b.id} - {b.customerName} - {b.status === "PAID" ? "✅" : "❌"}
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ maxWidth: 800, margin: "0 auto", background: "white", border: "1px solid #e2e8f0", borderRadius: 10, overflow: "hidden" }} id="receipt">
          {/* Header */}
          <div style={{ display: "flex" }}>
            <div style={{ flex: 1, padding: "20px 25px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 48, fontWeight: "900", color: "#0a2a6b" }}>T<span style={{ color: "#f59e0b" }}>M</span></span>
                <div>
                  <div style={{ fontSize: 32, fontWeight: "900", color: "#0a2a6b", lineHeight: 1 }}>Trade<span style={{ color: "#f59e0b" }}>Mass</span></div>
                  <div style={{ fontSize: 14, fontWeight: "bold" }}>Trading & Wealth Academy</div>
                </div>
              </div>
              <div style={{ marginTop: 12, fontSize: 13, letterSpacing: 1 }}>Learn &nbsp;|&nbsp; Practice &nbsp;|&nbsp; Grow</div>
            </div>
            <div style={{ flex: 1, background: "#0a2a6b", color: "white", padding: "20px 25px", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: "bold" }}>Stock Market Trading</div>
              <div style={{ fontSize: 20, fontWeight: "900", color: "#facc15", margin: "4px 0" }}>Course</div>
              <div style={{ fontSize: 13, fontWeight: "bold" }}>Trade Smart • Grow Wealth</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>📈 Live Market • Options • Intraday • Swing</div>
            </div>
          </div>
          <div style={{ height: 6, background: "#f59e0b", width: "45%" }}></div>

          <div style={{ padding: "20px 25px" }}>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <span style={{ background: "#0a2a6b", color: "white", padding: "8px 28px", borderRadius: 20, fontWeight: "900", fontSize: 20 }}>Course Fees Receipt</span>
            </div>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 380px" }}>
                <table style={{ width: "100%", fontSize: 15, borderCollapse: "collapse" }}>
                  <tbody>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Receipt No</td><td style={{ padding: "6px 0" }}>: &nbsp;TRD/2026/{selected.id}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Date</td><td style={{ padding: "6px 0" }}>: &nbsp;{selected.billDate}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Student Name</td><td style={{ padding: "6px 0", fontWeight: "bold", color: selected.customerName.startsWith("Unknown") ? "#dc2626" : "#111" }}>: &nbsp;{selected.customerName}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Mobile</td><td style={{ padding: "6px 0" }}>: &nbsp;{selected.mobile}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>District</td><td style={{ padding: "6px 0" }}>: &nbsp;{selected.district}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Course</td><td style={{ padding: "6px 0", fontWeight: "bold" }}>: &nbsp;{selected.course}</td></tr>
                    <tr><td style={{ padding: "6px 0", fontWeight: "bold" }}>Course Duration</td><td style={{ padding: "6px 0" }}>: &nbsp;{selected.duration}</td></tr>
                  </tbody>
                </table>

                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 15 }}>
                  <thead><tr style={{ background: "#0a2a6b", color: "white" }}><th style={{ padding: 10, textAlign: "left" }}>Particulars</th><th style={{ padding: 10, textAlign: "right" }}>Amount (₹)</th></tr></thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}><td style={{ padding: 10, fontWeight: "bold" }}>Total Course Fees</td><td style={{ padding: 10, textAlign: "right", fontWeight: "bold" }}>₹{Number(selected.amount || 0).toLocaleString("en-IN")}</td></tr>
                    <tr style={{ background: "#dcfce7", borderBottom: "1px solid #e2e8f0" }}><td style={{ padding: 10, fontWeight: "bold" }}>Paid Amount</td><td style={{ padding: 10, textAlign: "right", fontWeight: "bold", color: "#16a34a" }}>₹{Number(selected.paidAmount || 0).toLocaleString("en-IN")}</td></tr>
                    <tr style={{ background: "#fee2e2" }}><td style={{ padding: 10, fontWeight: "bold" }}>Balance Amount</td><td style={{ padding: 10, textAlign: "right", fontWeight: "bold", color: selected.balanceAmount > 0 ? "#dc2626" : "#16a34a" }}>₹{Number(selected.balanceAmount || 0).toLocaleString("en-IN")}</td></tr>
                    <tr><td style={{ padding: 10, fontWeight: "bold" }}>Payment Mode</td><td style={{ padding: 10, textAlign: "right", fontWeight: "bold" }}>{selected.paymentMode}</td></tr>
                    <tr><td style={{ padding: 10, fontWeight: "bold" }}>Transaction ID</td><td style={{ padding: 10, textAlign: "right" }}>{selected.transactionId}</td></tr>
                    <tr><td style={{ padding: 10, fontWeight: "bold" }}>Status</td><td style={{ padding: 10, textAlign: "right", fontWeight: "bold", color: selected.status === "PAID" ? "#16a34a" : "#dc2626" }}>{selected.status === "PAID" ? "✅ PAID" : "❌ PENDING - ₹" + Number(selected.balanceAmount).toLocaleString("en-IN") + " Balance"}</td></tr>
                  </tbody>
                </table>
              </div>

              <div style={{ flex: "1 1 200px", textAlign: "center" }}>
                <div style={{ background: "#eff6ff", padding: 20, borderRadius: 10 }}>
                  <div style={{ fontSize: 28, fontWeight: "900", color: "#0a2a6b" }}>Thank You!</div>
                  <div style={{ height: 3, background: "#f59e0b", margin: "8px 0" }}></div>
                  <div>for choosing</div>
                  <div style={{ fontWeight: "900", fontSize: 18 }}>TradeMass</div>
                </div>
                <div style={{ marginTop: 15, fontStyle: "italic", fontWeight: "bold", color: "#0a2a6b", fontSize: 13 }}>Keep Learning... Keep Trading...</div>
                <div style={{ marginTop: 30, borderTop: "1px solid #333", paddingTop: 6, fontSize: 13 }}>Authorised Signature</div>
              </div>
            </div>

            <div style={{ marginTop: 18, fontSize: 12, color: "#64748b", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
              This is a computer generated receipt. • TradeMass Trading & Wealth Academy • For queries contact Admin
            </div>
          </div>
        </div>
      )}

      {selected && selected.customerName.startsWith("Unknown") && (
        <p style={{ background: "#fef2f2", padding: 10, borderRadius: 6, fontSize: 13, color: "#991b1b", marginTop: 12, textAlign: "center" }} className="no-print">
          ⚠️ Idhu pazhaya bill - Name illa. Delete panni Payments la pudhusa create pannunga.
        </p>
      )}

      <style>{`@media print { body * { visibility: hidden; } #receipt, #receipt * { visibility: visible; } #receipt { position: absolute; left: 0; top: 0; width: 100%; max-width: 100%; } .no-print { display: none !important; } }`}</style>
    </div>
  );
}
export default Receipts;