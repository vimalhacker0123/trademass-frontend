import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "https://trademass-backend-java1.onrender.com";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Email & Password enter pannunga");

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Backend la irundhu token varum
      localStorage.setItem("token", data.token || "trademass-token");
      localStorage.setItem("user", JSON.stringify(data.user || { name: "Admin", email }));
      navigate("/dashboard");
    } catch (err) {
      // Backend down-a irundha / Demo-ku
      if (email === "admin@trademass.com" && password === "admin123") {
        localStorage.setItem("token", "trademass-token");
        localStorage.setItem("user", JSON.stringify({ name: "Admin", email }));
        navigate("/dashboard");
      } else {
        alert("❌ Login Failed: " + err.message + "\n\nDemo Login:\nEmail: admin@trademass.com\nPassword: admin123");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a2a6b", padding: 15 }}>
      <div style={{ width: "100%", maxWidth: 380, background: "white", padding: 28, borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 34, color: "#0a2a6b" }}>Trade<span style={{ color: "#f5a623" }}>Mass</span></h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Trading & Wealth Academy • Billing System</p>
          <div style={{ height: 4, background: "#f5a623", borderRadius: 4, margin: "12px 60px 0" }}></div>
        </div>

        <h2 style={{ textAlign: "center", margin: "0 0 16px", fontSize: 20 }}>Admin Login</h2>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={input} />
          <div style={{ display: "flex", gap: 6 }}>
            <input type={showPass ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ ...input, flex: 1 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ padding: "10px", border: "1px solid #cbd5e1", borderRadius: 6, background: "white", cursor: "pointer" }}>{showPass ? "🙈" : "👁️"}</button>
          </div>
          <button disabled={loading} style={{ padding: 12, background: "#0a2a6b", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", fontSize: 15 }}>
            {loading ? "Checking... ⏳" : "Login →"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "14px 0 0" }}>
          Educational purpose only. TradeMass is not a SEBI-registered Adviser.
        </p>
      </div>
    </div>
  );
}

const input = { padding: "11px 12px", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: 14, width: "100%", boxSizing: "border-box" };

export default Login;