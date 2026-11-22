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

// ===== 1. LOGIN PROTECTION =====
function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  if (!token) {
    // Enga irundhu vandhom nu nyabagam vechu, login mudinjadhum anga anuppa
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

// ===== 2. LOGIN PAGE LA IRUKKUMBODHU ALREADY LOGIN PANNI IRUNDHA DASHBOARD KU POGANUM =====
function PublicRoute() {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// ===== 3. HOME ROUTE - "/" =====
function HomeRedirect() {
  const token = localStorage.getItem("token");
  // Token irundha dashboard, illana login
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

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

function NotFound() {
  const token = localStorage.getItem("token");
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: 60, margin: 0, color: "#0a2a6b" }}>404</h1>
      <p style={{ fontSize: 18 }}>Page not found 😕</p>
      <a href={token ? "/dashboard" : "/login"} style={{ color: "#0a2a6b", fontWeight: "bold" }}>← Back to Home</a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        {/* Login pannadhavangalukku mattum */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Login pannavangalukku mattum */}
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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;