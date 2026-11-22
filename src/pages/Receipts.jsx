// localStorage vendaam - getSaved() function-a full-a delete pannidunga
const fixBill = (b) => {
  const name = pick(b, ["customerName", "name", "studentName", "customer_name", "fullName"]) || `Unknown (ID ${b.id})`;
  const mobile = pick(b, ["mobile", "phone", "phoneNumber", "contact", "customerEmail"]) || "-";
  const district = pick(b, ["district", "state", "city"]) || "-";
  const course = pick(b, ["course", "courseName", "course_name"]) || "Stock Market Trading";
  const duration = pick(b, ["duration", "courseDuration"]) || "3 Months";
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