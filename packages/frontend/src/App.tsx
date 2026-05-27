import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Modal from "./components/Modal";
import Sidebar from "./components/Sidebar";
import { authClient, Login, Register, ResetPassword } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { default as Abonements } from "./pages/Abonement";
import AiTipps from "./pages/AiTipps";
import Expenses from "./pages/Expenses";
import { trpcClient } from "./lib/trpc";
import type { Expense, ModalType, View } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<View | "loading">("loading");
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const expensesRefetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    authClient
      .getSession()
      .then((result) => {
        setCurrentView(result?.data?.user ? "dashboard" : "login");
      })
      .catch(() => {
        setCurrentView("login");
      });
  }, []);

  const handleNavigate = (view: View) => setCurrentView(view);

  const closeModal = () => {
    setActiveModal(null);
    setSelectedExpense(null);
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } finally {
      closeModal();
      setCurrentView("login");
    }
  };

  const handleDeleteExpenseConfirm = async () => {
    if (!selectedExpense?.id) return;

    try {
      await trpcClient.ausgaben.delete.mutate({ id: selectedExpense.id });
      expensesRefetchRef.current?.();
    } finally {
      closeModal();
    }
  };

  const isAuthView = ["login", "register", "forgot-password", "reset-password", "loading"].includes(
    currentView,
  );

  const renderView = () => {
    switch (currentView) {
      case "loading":
        return (
          <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm uppercase tracking-widest text-on-surface-variant">Laden...</p>
            </div>
          </div>
        );
      case "login":
        return <Login onNavigate={handleNavigate} />;
      case "register":
        return <Register onNavigate={handleNavigate} />;
      case "forgot-password":
      case "reset-password":
        return <ResetPassword onNavigate={handleNavigate} />;
      case "dashboard":
        return <Dashboard />;
      case "expenses":
        return (
          <Expenses
            onAddExpense={() => setActiveModal("add-expense")}
            onEditExpense={(expense) => {
              setSelectedExpense(expense);
              setActiveModal("add-expense");
            }}
            onDeleteExpense={(expense) => {
              setSelectedExpense(expense);
              setActiveModal("delete-expense");
            }}
            refetchRef={expensesRefetchRef}
          />
        );
      case "abonements":
        return <Abonements />;
      case "ai-tips":
        return <AiTipps />;
      default:
        return <Login onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background antialiased">
      {!isAuthView ? (
        <Sidebar currentView={currentView as View} onNavigate={handleNavigate} onLogout={handleLogout} />
      ) : null}

      <main className={!isAuthView ? "ml-64 min-h-screen" : ""}>
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

      <Modal
        isOpen={activeModal === "add-expense"}
        onClose={closeModal}
        title={selectedExpense ? "Ausgabe bearbeiten" : "Ausgabe hinzufuegen"}
      >
        <div className="px-8 pb-8 text-sm text-on-surface-variant">
          Das Formular fuer Ausgaben ist noch nicht angebunden.
        </div>
      </Modal>

      <Modal isOpen={activeModal === "delete-expense"} onClose={closeModal} title="Ausgabe loeschen?">
        <div className="space-y-6 px-8 pb-8">
          <p className="text-sm text-on-surface-variant">
            {selectedExpense?.titel ?? "Diese Ausgabe"} wird dauerhaft geloescht.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-lg border border-outline-variant/20 px-4 py-2 text-sm font-semibold text-on-surface-variant"
            >
              Abbrechen
            </button>
            <button
              type="button"
              onClick={handleDeleteExpenseConfirm}
              className="rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white"
            >
              Loeschen
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
