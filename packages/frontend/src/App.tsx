import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Layout } from "./components/shared/Layout";
import Dashboard from "./pages/Dashboard";
import { Expenses } from "./pages/Expenses";
import Abonements from "./pages/Abonement";
import { AiTips } from "./pages/AiTips";
import { Login, Register, ResetPassword, ForgotPassword } from "./pages/Auth";
import type { View } from "./types";

function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (view: View) => {
    const pathMap: Partial<Record<View, string>> = {
      login: "/login",
      register: "/register",
      "forgot-password": "/forgot-password",
      "reset-password": "/reset-password",
      dashboard: "/dashboard",
    };

    const nextPath = pathMap[view];
    if (nextPath) {
      navigate(nextPath);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login onNavigate={handleNavigate} />} />
          <Route path="/register" element={<Register onNavigate={handleNavigate} />} />
          <Route path="/forgot-password" element={<ForgotPassword onNavigate={handleNavigate} />} />
          <Route path="/reset-password" element={<ResetPassword onNavigate={handleNavigate} />} />

          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/expenses" element={<Layout><Expenses /></Layout>} />
          <Route path="/abonements" element={<Layout><Abonements /></Layout>} />
          <Route path="/ai-tips" element={<Layout><AiTips /></Layout>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}




/*import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

import { Layout } from "./components/shared/Layout";
import { Dashboard } from "./pages/Dashboard"; 
import { Expenses } from "./pages/Expenses";
import { Subscriptions } from "./pages/Subscriptions";
import { AiTips } from "./pages/AiTips";
import { Login, Register, ResetPassword, ForgotPassword } from "./pages/Auth";
import type { View } from "./types";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -10 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/dashboard"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/expenses"
            element={
              <Layout>
                <Expenses />
              </Layout>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <Layout>
                <Subscriptions />
              </Layout>
            }
          />
          <Route
            path="/ai-tips"
            element={
              <Layout>
                <AiTips />
              </Layout>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}*/
