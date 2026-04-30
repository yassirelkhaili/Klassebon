import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HealthResponse } from "@klassebon/shared";
import type { View, ModalType, Expense, Abonement } from "./types";
import { Login, Register, ResetPassword } from "./pages/Auth";

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [currentView, setCurrentView] = useState<View>('login');
  const isAuthView = ['login', 'register', 'forgot-password'].includes(currentView);

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  }

  const closeModal = () => {
    // Logic to close modal
  }

  const handleLogout = () => {
    //setCurrentView('logout-confirm');
  }

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth(null));
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'login': return <Login onNavigate={handleNavigate} />;
      case 'register': return <Register onNavigate={handleNavigate} />;
      case 'forgot-password': return <ResetPassword onNavigate={handleNavigate} />;
    };
  }
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

/*<h1 className="text-red-500">Klassebon</h1>
      <p>Vite frontend + workspace shared types.</p>
      {health && <pre style={{ background: "#f4f4f4", padding: "1rem" }}>{JSON.stringify(health, null, 2)}</pre>}*/