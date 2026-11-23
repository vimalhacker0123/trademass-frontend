import React, { useEffect, useState } from "react";
import { billApi } from "../services/api";

function Receipts() {
  const [bills, setBills] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const pick = (b, keys) => {
    for (const k of keys) {
      if (b[k] !== undefined && b[k] !== null && b[k] !== "") return b[k];
    }
    return undefined;
  };

  // localStorage vendaam - Backend mattum dhaan unmai
  const fixBill = (b) => {
    const name = pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
    const mobile = pick(b, ["mobile", "phone", "phoneNumber", "contact", "customerEmail"]) || "-";
    const district = pick(b, ["district", "state", "city"]) || "-";
    const course = pick(b, ["course", "courseName", "course_name"]) || "Forex Trading - Gold";
    const duration = pick(b, ["duration", "courseDuration"]) || "7 Days Live online class - 1 Month Practice";
    const total = Number(pick(b, ["amount", "total", "totalAmount", "totalFees", "fees", "billAmount"]) || 0);
    let paid = Number(pick(b, ["paidAmount", "paid", "amountPaid", "collected"]) || 0);
    // Backend PAID nu sonna, full amount paid
    if (b.status === "PAID" || String(b.status).toUpperCase() === "PAID") {
      paid = total;
    }
    const balance = Math.max(0, total - paid);
    const mode = pick(b, ["paymentMode", "mode", "paymentMethod"]) || "-";
    const txn = pick(b, ["transactionId", "transaction_id", "utr", "utrNo"]) || "-";
    const date = pick(b, ["billDate", "date", "paymentDate", "createdAt", "dueDate"]) || new Date().toLocaleDateString("en-CA");
    return { ...b, customerName: name, name, mobile, district, course, duration, amount: total, paidAmount: paid, balanceAmount: balance, paymentMode: mode, transactionId: txn, status: balance <= 0 && total > 0 ? "PAID" : "PENDING", billDate: date };
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
          <div style={{ display: "flex" }}>
            {/* LEFT - LOGO ONLY - OUTER BORDER REMOVED */}
            <div style={{ flex: 1, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="TradeMass Logo" style={{ width: 115, height: 115, objectFit: "cover", borderRadius: 12, border: "none" }} />
              <div>
                <div style={{ fontSize: 13, letterSpacing: 1, fontWeight: "bold", color: "#0a2a6b" }}>Learn &nbsp;|&nbsp; Practice &nbsp;|&nbsp; Grow</div>
              </div>
            </div>
            <div style={{ flex: 1, background: "#0a2a6b", color: "white", padding: "20px 25px", textAlign: "center" }}>
              <div style={{ fontSize: 17, fontWeight: "bold" }}>{selected.course}</div>
              <div style={{ fontSize: 20, fontWeight: "900", color: "#facc15", margin: "4px 0" }}>Course</div>
              <div style={{ fontSize: 13, fontWeight: "bold" }}>Trade Smart • Grow Wealth</div>
              <div style={{ fontSize: 11, marginTop: 6 }}>📈 Live Market • Forex • Gold • Crypto</div>
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
                {/* SIGNATURE - UPDATED - Blue Signature, No Rotate, No Black Filter */}
                <div style={{ marginTop: 18, height: 75, display: "flex", justifyContent: "center", alignItems: "flex-end", overflow: "hidden" }}>
                  <img src="/signature.png" alt="Authorised Signature" style={{ width: 175, height: "auto", maxHeight: 70, objectFit: "contain" }} />
                </div>
                <div style={{ borderTop: "1px solid #333", paddingTop: 6, fontSize: 13 }}>Authorised Signature</div>
              </div>
            </div>

            {/* IMPORTANT TERMS & REFUND POLICY */}
            <div style={{ marginTop: 20, padding: "14px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderTop: "3px solid #f59e0b", borderRadius: 8, textAlign: "left" }}>
              <div style={{ color: "#0a2a6b", fontWeight: "900", fontSize: 13, marginBottom: 4 }}>IMPORTANT TERMS</div>
              <p style={{ fontSize: 11.5, lineHeight: 1.6, color: "#334155", margin: "0 0 12px 0" }}>
                Educational purpose only. Trade Mass is not a SEBI-registered Investment Adviser or Research Analyst. No profit or return is guaranteed. Trading involves market risk; students make their own trading decisions. Refunds are governed by the terms disclosed and agreed before payment and applicable law.
              </p>
              <div style={{ color: "#0a2a6b", fontWeight: "900", fontSize: 13, marginBottom: 4 }}>REFUND &amp; CANCELLATION POLICY</div>
              <ol style={{ fontSize: 11.5, lineHeight: 1.6, color: "#334155", margin: 0, paddingLeft: 16 }}>
                <li>Students can request a refund within the first 2 days from the course commencement date if they are not satisfied with the course.</li>
                <li>Refund requests made after the initial 2-day period will not be accepted.</li>
                <li>Once the 2-day refund period is completed, the course fee becomes non-refundable, subject to applicable laws.</li>
                <li>Students are requested to carefully read and agree to these terms before joining the course.</li>
              </ol>
            </div>

            <div style={{ marginTop: 18, fontSize: 12, color: "#64748b", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
              This is a computer generated receipt. • TradeMass • For queries contact Admin
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