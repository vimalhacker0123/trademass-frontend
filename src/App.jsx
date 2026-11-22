import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Payments from "./pages/Payments";
import Receipts from "./pages/Receipts";
import Reports from "./pages/Reports";

// ===== 1. LOGIN PROTECTION - Idhu dhaan mukkiyam =====
function ProtectedRoute() {
  const token = localStorage.getItem("token");
  // Token illa na Login ku thallidum
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

// ===== 2. PAGE MAARUM BODHU MELA SCROLL AAGANUM =====
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ display: "flex", flex: 1, alignItems: "flex-start" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 20, background: "#f8fafc", minHeight: "calc(100vh - 120px)" }}>
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
}

// ===== 3. 404 PAGE - Thappana URL potta =====
function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: 60, margin: 0, color: "#0a2a6b" }}>404</h1>
      <p style={{ fontSize: 18 }}>Page not found 😕</p>
      <a href="/dashboard" style={{ color: "#0a2a6b", fontWeight: "bold" }}>← Back to Dashboard</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Login panna mattum ulla poga mudiyum - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="courses" element={<Courses />} />
            <Route path="payments" element={<Payments />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Route>

        {/* Thappana URL */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;