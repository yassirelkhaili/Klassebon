import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HealthResponse } from "@klassebon/shared";
import type { View, ModalType, Expense, Abonement } from "./types";
import { Login, Register, ResetPassword, ForgotPassword } from "./pages/Auth";

function getViewFromPath(pathname: string): View {
  switch (pathname) {
    case "/register":
      return "register";
    case "/forgot-password":
      return "forgot-password";
    case "/reset-password":
      return "reset-password";
    default:
      return "login";
  }
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [currentView, setCurrentView] = useState<View>(() =>
    getViewFromPath(window.location.pathname)
  );

  const handleNavigate = (view: View) => {
    setCurrentView(view);

    const pathMap: Partial<Record<View, string>> = {
      login: "/login",
      register: "/register",
      "forgot-password": "/forgot-password",
      "reset-password": "/reset-password",
    };

    const nextPath = pathMap[view];
    if (nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  };

  useEffect(() => {
    const onPopState = () => {
      setCurrentView(getViewFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const renderView = () => {
    switch (currentView) {
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "register":
        return <Register onNavigate={handleNavigate} />;
      case "forgot-password":
        return <ForgotPassword onNavigate={handleNavigate} />;
      case "reset-password":
        return <ResetPassword onNavigate={handleNavigate} />;
      default:
        return <Login onNavigate={handleNavigate} />;
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", padding: "2rem" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}