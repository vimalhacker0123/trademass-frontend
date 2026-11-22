import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  const menus = [
    { to: "/dashboard", label: "Dashboard", icon: "📊" },
    { to: "/students", label: "Students", icon: "👨‍🎓" },
    { to: "/courses", label: "Courses", icon: "📚" },
    { to: "/payments", label: "Payments", icon: "💰" },
    { to: "/receipts", label: "Receipts", icon: "🧾" },
    { to: "/reports", label: "Reports", icon: "📈" },
  ];

  return (
    <div style={{ width: "220px", background: "#f8fafc", borderRight: "1px solid #e2e8f0", minHeight: "calc(100vh - 58px)", paddingTop: 12, flexShrink: 0 }}>
      {menus.map(m => (
        <NavLink
          key={m.to}
          to={m.to}
          style={({ isActive }) => ({
            display: "block",
            padding: "12px 18px",
            margin: "2px 10px",
            borderRadius: 8,
            color: isActive ? "white" : "#334155",
            background: isActive ? "#0a2a6b" : "transparent",
            textDecoration: "none",
            fontWeight: isActive ? "bold" : "500",
          })}
        >
          {m.icon} &nbsp; {m.label}
        </NavLink>
      ))}

      <div style={{ margin: "20px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: 10, fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
        <b>💡 TradeMass Tip</b><br />
        Pending payment irundha Reports la paathu follow-up pannunga.
      </div>
    </div>
  );
}
export default Sidebar;