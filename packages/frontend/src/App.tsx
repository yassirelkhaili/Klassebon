import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import Modal from "./components/Modal";
import Sidebar from "./components/Sidebar";
import AddExpenseModal, { type ExpenseFormValues } from "./components/modals/AddExpense";
import { DeleteConfirmModal, NewAboModal, type AboFormValues } from "./components/modals/ActionAbonements";
import { PostScanModal, ProcessingState, ScanReceiptModal } from "./components/modals/ScanModals";
import { authClient, ForgotPassword, Login, Register, ResetPassword } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Abonements from "./pages/Abonements";
import AiTipps from "./pages/AiTipps";
import Expenses from "./pages/Expenses";
import { trpcClient } from "./lib/trpc";
import type { Abonement, Expense, ModalType, View } from "./types";

const mapReceiptCategory = (category?: string | null): ExpenseFormValues["kategorie"] => {
  switch (category) {
    case "LEBENSMITTEL":
      return "Lebensmittel";
    case "TRANSPORT":
      return "Transport";
    case "VERSICHERUNG":
      return "Versicherung";
    case "STREAMING":
      return "Streaming";
    default:
      return "Sonstiges";
  }
};

function getViewFromPath(pathname: string): View | "loading" {
  switch (pathname) {
    case "/register":
      return "register";
    case "/forgot-password":
      return "forgot-password";
    case "/reset-password":
      return "reset-password";
    default:
      return "loading";
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<View | "loading">(() => getViewFromPath(window.location.pathname));
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedAbo, setSelectedAbo] = useState<Abonement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [scanDraft, setScanDraft] = useState<ExpenseFormValues | null>(null);

  const expensesRefetchRef = useRef<(() => void) | null>(null);
  const abonnementsRefetchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    authClient
      .getSession()
      .then((result) => {
        const pathView = getViewFromPath(window.location.pathname);
        if (pathView !== "loading") {
          setCurrentView(pathView);
          return;
        }

        setCurrentView(result?.data?.user ? "dashboard" : "login");
      })
      .catch(() => {
        const pathView = getViewFromPath(window.location.pathname);
        setCurrentView(pathView === "loading" ? "login" : pathView);
      });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const pathView = getViewFromPath(window.location.pathname);
      setCurrentView(pathView === "loading" ? "login" : pathView);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleNavigate = (view: View) => {
    setCurrentView(view);

    const pathMap: Partial<Record<View, string>> = {
      login: "/",
      register: "/register",
      "forgot-password": "/forgot-password",
      "reset-password": "/reset-password",
    };

    const nextPath = pathMap[view];
    if (nextPath && window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedExpense(null);
    setSelectedAbo(null);
    setModalError(null);
    setScanDraft(null);
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
      setIsSaving(true);
      setModalError(null);
      await trpcClient.ausgaben.delete.mutate({ id: selectedExpense.id });
      expensesRefetchRef.current?.();
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Ausgabe konnte nicht geloescht werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveExpense = async (values: ExpenseFormValues) => {
    try {
      setIsSaving(true);
      setModalError(null);
      if (selectedExpense) {
        await trpcClient.ausgaben.update.mutate({ id: selectedExpense.id, ...values });
      } else {
        await trpcClient.ausgaben.create.mutate(values);
      }
      expensesRefetchRef.current?.();
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Ausgabe konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbo = async (values: AboFormValues) => {
    try {
      setIsSaving(true);
      setModalError(null);
      if (selectedAbo) {
        await trpcClient.abonnements.update.mutate({ id: selectedAbo.id, ...values });
      } else {
        const { aktiv: _aktiv, ...createValues } = values;
        await trpcClient.abonnements.create.mutate(createValues);
      }
      abonnementsRefetchRef.current?.();
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Abo konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAboConfirm = async () => {
    if (!selectedAbo?.id) return;
    try {
      setIsSaving(true);
      setModalError(null);
      await trpcClient.abonnements.delete.mutate({ id: selectedAbo.id });
      abonnementsRefetchRef.current?.();
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Abo konnte nicht geloescht werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartScan = () => {
    setActiveModal("processing-receipt");
    window.setTimeout(() => setActiveModal("post-scan-expense"), 900);
  };

  const handleReceiptFileSelected = async (file: File) => {
    try {
      setIsSaving(true);
      setModalError(null);
      setActiveModal("processing-receipt");

      const formData = new FormData();
      formData.append("receipt", file);

      const uploadResponse = await fetch("/api/receipts/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.json().catch(() => null);
        throw new Error(errorBody?.error ?? "Receipt upload failed.");
      }

      const upload = (await uploadResponse.json()) as { id: string };
      const ocr = await trpcClient.receipt.processOcr.mutate({ receiptId: upload.id });

      setScanDraft({
        titel: file.name.replace(/\.[^.]+$/, "") || "Gescanntes Receipt",
        betrag: Number(ocr.extractedAmount ?? 1),
        datum: new Date().toISOString(),
        kategorie: mapReceiptCategory(ocr.extractedCategory),
        beschreibung: ocr.ocrText ? `OCR Text:\n${ocr.ocrText.slice(0, 500)}` : "Aus Receipt-Scan erstellt.",
      });
      setActiveModal("post-scan-expense");
    } catch (error) {
      setModalError(error instanceof Error ? error.message : "Receipt konnte nicht verarbeitet werden.");
      setActiveModal("scan-receipt");
    } finally {
      setIsSaving(false);
    }
  };

  const isAuthView = ["login", "register", "forgot-password", "reset-password", "loading"].includes(currentView);

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
        return <ForgotPassword onNavigate={handleNavigate} />;
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
        return (
          <Abonements
            onAddAbo={() => setActiveModal("new-abo")}
            onEditAbo={(abo) => {
              setSelectedAbo(abo);
              setActiveModal("new-abo");
            }}
            onDeleteAbo={(abo) => {
              setSelectedAbo(abo);
              setActiveModal("delete-abo");
            }}
            refetchRef={abonnementsRefetchRef}
          />
        );
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

      <main className={!isAuthView ? "min-h-screen pb-20 lg:ml-64 lg:pb-0" : ""}>
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
        {modalError ? <ModalError message={modalError} /> : null}
        <AddExpenseModal
          initialData={selectedExpense}
          isSaving={isSaving}
          onClose={closeModal}
          onScan={() => setActiveModal("scan-receipt")}
          onSave={handleSaveExpense}
        />
      </Modal>

      <Modal
        isOpen={activeModal === "new-abo"}
        onClose={closeModal}
        title={selectedAbo ? "Abo bearbeiten" : "Neues Abo"}
      >
        {modalError ? <ModalError message={modalError} /> : null}
        <NewAboModal initialData={selectedAbo} isSaving={isSaving} onClose={closeModal} onSave={handleSaveAbo} />
      </Modal>

      <Modal isOpen={activeModal === "scan-receipt"} onClose={closeModal} title="Scan Receipt">
        {modalError ? <ModalError message={modalError} /> : null}
        <ScanReceiptModal
          onClose={closeModal}
          onStartScan={handleStartScan}
          onFileSelected={handleReceiptFileSelected}
        />
      </Modal>

      <Modal isOpen={activeModal === "processing-receipt"} onClose={closeModal} showClose={false}>
        <ProcessingState />
      </Modal>

      <Modal isOpen={activeModal === "post-scan-expense"} onClose={closeModal} showClose={false}>
        <PostScanModal
          draft={scanDraft}
          onClose={closeModal}
          onRescan={() => setActiveModal("scan-receipt")}
          onSave={handleSaveExpense}
        />
      </Modal>

      <Modal isOpen={activeModal === "delete-expense"} onClose={closeModal}>
        {modalError ? <ModalError message={modalError} /> : null}
        <DeleteConfirmModal
          type="expense"
          item={selectedExpense}
          isWorking={isSaving}
          onClose={closeModal}
          onConfirm={handleDeleteExpenseConfirm}
        />
      </Modal>

      <Modal isOpen={activeModal === "delete-abo"} onClose={closeModal}>
        {modalError ? <ModalError message={modalError} /> : null}
        <DeleteConfirmModal
          type="abo"
          item={selectedAbo}
          isWorking={isSaving}
          onClose={closeModal}
          onConfirm={handleDeleteAboConfirm}
        />
      </Modal>
    </div>
  );
}

function ModalError({ message }: { message: string }) {
  return (
    <div className="mx-5 mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error sm:mx-6">
      {message}
    </div>
  );
}
