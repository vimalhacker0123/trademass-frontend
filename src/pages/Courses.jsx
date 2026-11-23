import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Courses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([
    {
      id: 1,
      name: "Forex Trading - Gold",
      tag: "BESTSELLER ⭐",
      fees: 50000,
      duration: "7 Days Live Class + 30 Live Market",
      level: "Beginner to Advanced",
      color: "#0a2a6b",
      topics: ["Forex Basics & Gold Pair", "Live Market Sessions", "Gold Price Action", "Risk Management"],
      students: 124,
    },
    {
      id: 2,
      name: "Crypto Trading",
      tag: "POPULAR 🔥",
      fees: 50000,
      duration: "7 Days Live Class + 30 Live Market",
      level: "Beginner to Advanced",
      color: "#15803d",
      topics: ["Crypto Basics", "BTC / ETH Trading", "Live Market Sessions", "Risk Management"],
      students: 86,
    },
    {
      id: 3,
      name: "Gold",
      tag: "LIVE MARKET 📈",
      fees: 50000,
      duration: "7 Days Live Class + 30 Live Market",
      level: "Beginner to Advanced",
      color: "#b45309",
      topics: ["Gold Trading Basics", "Chart Reading", "Price Action", "Live Trading"],
      students: 64,
    },
    {
      id: 4,
      name: "Third Eye Rules",
      tag: "NEW ✨",
      fees: 50000,
      duration: "7 Days Live Class + 30 Live Market",
      level: "All Levels",
      color: "#7c3aed",
      topics: ["Third Eye Strategy", "Entry / Exit Rules", "Discipline & Psychology", "Live Market Practice"],
      students: 42,
    },
  ]);

  const [newCourse, setNewCourse] = useState({ name: "", fees: "", duration: "" });

  const addCourse = (e) => {
    e.preventDefault();
    if (!newCourse.name || !newCourse.fees) return;
    setCourses([...courses, {
      id: Date.now(),
      name: newCourse.name,
      tag: "NEW ✨",
      fees: Number(newCourse.fees),
      duration: newCourse.duration || "7 Days Live Class + 30 Live Market",
      level: "All Levels",
      color: "#0a2a6b",
      topics: ["Live Market", "Practical Training"],
      students: 0,
    }]);
    setNewCourse({ name: "", fees: "", duration: "" });
  };

  const deleteCourse = (id) => {
    if (window.confirm("Delete this course?")) setCourses(courses.filter(c => c.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ color: "#0a2a6b" }}>Courses - TradeMass</h2>
        <span style={{ background: "#0a2a6b", color: "white", padding: "6px 14px", borderRadius: 20, fontWeight: "bold" }}>
          {courses.length} Courses
        </span>
      </div>
      <p style={{ color: "#64748b", margin: "5px 0 15px" }}>Learn | Practice | Grow - Trading Education & Training</p>

      {/* ADD COURSE */}
      <form onSubmit={addCourse} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 15, display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
        <input placeholder="Course Name" value={newCourse.name} onChange={e => setNewCourse({ ...newCourse, name: e.target.value })} style={inputStyle} />
        <input type="number" placeholder="Fees ₹" value={newCourse.fees} onChange={e => setNewCourse({ ...newCourse, fees: e.target.value })} style={inputStyle} />
        <input placeholder="Duration (ex: 7 Days Live...)" value={newCourse.duration} onChange={e => setNewCourse({ ...newCourse, duration: e.target.value })} style={inputStyle} />
        <button style={{ background: "#0a2a6b", color: "white", border: "none", padding: "10px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold" }}>+ Add Course</button>
      </form>

      {/* COURSE CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {courses.map(c => (
          <div key={c.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            {/* Top Color Bar */}
            <div style={{ background: c.color, color: "white", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ background: "#f5c518", color: "#111", fontSize: 11, fontWeight: "900", padding: "4px 8px", borderRadius: 20 }}>{c.tag}</span>
              <button onClick={() => deleteCourse(c.id)} style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", padding: "4px 8px", borderRadius: 5, cursor: "pointer" }}>✕</button>
            </div>

            <div style={{ padding: 16 }}>
              <h3 style={{ margin: "0 0 6px", color: "#0a2a6b", fontSize: 20 }}>{c.name}</h3>
              <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 13 }}>{c.level} • 👨‍🎓 {c.students} Students Joined</p>

              <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: "10px 12px", borderRadius: 8, marginBottom: 12 }}>
                <div><div style={{ fontSize: 11, color: "#64748b" }}>FEES</div><b style={{ fontSize: 20, color: "#0a2a6b" }}>₹{c.fees.toLocaleString("en-IN")}</b></div>
                <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: "#64748b" }}>DURATION</div><b style={{ fontSize: 12 }}>{c.duration}</b></div>
              </div>

              <div style={{ marginBottom: 14 }}>
                {c.topics.map(t => (
                  <span key={t} style={{ display: "inline-block", background: "#eff6ff", color: "#0a2a6b", fontSize: 12, padding: "4px 8px", borderRadius: 20, margin: "0 4px 4px 0" }}>✓ {t}</span>
                ))}
              </div>

              <button
                onClick={() => navigate("/payments")}
                style={{ width: "100%", background: "#0a2a6b", color: "white", border: "none", padding: "11px", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 14 }}
              >
                Enroll Now → Add Payment
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 12, marginTop: 20, fontSize: 13, color: "#92400e" }}>
        ⚠️ <b>Note:</b> Educational purpose only. TradeMass is not a SEBI-registered Investment Adviser. No profit or return is guaranteed. Trading involves market risk.
      </div>
    </div>
  );
}

const inputStyle = { padding: "10px", borderRadius: 6, border: "1px solid #cbd5e1", flex: "1 1 200px" };

export default Courses;