import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const logout = () => {
    if (window.confirm("Logout pannalama?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };
  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "#0a2a6b", color: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
      <h2 style={{ margin: 0, cursor: "pointer", fontSize: 20 }} onClick={() => navigate("/dashboard")}>
        Trade<span style={{ color: "#f5c518" }}>Mass</span> Billing 💳
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ background: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: 20, fontSize: 13 }}>👨‍💼 Admin</span>
        <button onClick={logout} style={{ padding: "7px 16px", cursor: "pointer", background: "white", color: "#0a2a6b", border: "none", borderRadius: 6, fontWeight: "bold" }}>Logout</button>
      </div>
    </nav>
  );
}
export default Navbar;