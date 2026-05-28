import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, ModalType, Expense, Abonement } from './types';
import Sidebar from './components/Sidebar';
import Modal from './components/Modal';

// ── Auth pages ────────────────────────────────────────────────────────────────
import { Login, Register, ResetPassword, authClient } from './pages/Auth';

// ── App pages ─────────────────────────────────────────────────────────────────
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Abonements from './pages/Abonements';
import AiTipps from './pages/AiTipps';

// ── Modals ────────────────────────────────────────────────────────────────────


// ── tRPC client (for delete mutations) ───────────────────────────────────────
import { trpcClient } from './lib/trpc';

export default function App() {
  // ── View + modal state ───────────────────────────────────────────────────────
  const [currentView,    setCurrentView]    = useState<View | 'loading'>('loading');
  const [activeModal,    setActiveModal]    = useState<ModalType | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [selectedAbo,    setSelectedAbo]    = useState<Abonement | null>(null);

  // ── Session user (stored on login / session check) ───────────────────────────
  // Kept in App so it survives navigation between views.
  // Not passed as prop to pages (greeting doesn't need it per design decision).
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  // ── Refetch refs ─────────────────────────────────────────────────────────────
  // Pages assign their fetchXxx function to these refs on mount and whenever
  // the relevant filter/sort state changes (via useEffect inside each page).
  // App.tsx calls them after mutations so the list stays in sync.
  const expensesRefetchRef    = useRef<(() => void) | null>(null);
  const abonnementsRefetchRef = useRef<(() => void) | null>(null);

  // ── Session check on mount ───────────────────────────────────────────────────
  useEffect(() => {
    authClient.getSession()
      .then((result: any) => {
        if (result?.data?.user) {
          setCurrentUser({
            name:  result.data.user.name,
            email: result.data.user.email,
          });
          setCurrentView('dashboard');
        } else {
          setCurrentUser(null);
          setCurrentView('login');
        }
      })
      .catch(() => {
        setCurrentUser(null);
        setCurrentView('login');
      });
  }, []);

  // ── Navigation ────────────────────────────────────────────────────────────────
  const handleNavigate = (view: View) => setCurrentView(view);

  // ── Modal helpers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      // better-auth signOut method
      await authClient.signOut();
    } catch (error) {
      // Even if sign-out fails, redirect to login.
    } finally {
      setCurrentUser(null);
      handleNavigate('login');
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedExpense(null);
    setSelectedAbo(null);
  };

  // ── Receipt scan flow ─────────────────────────────────────────────────────────
  const handleStartScan = () => {
    setActiveModal('processing-receipt');
    setTimeout(() => {
      setActiveModal('post-scan-expense');
    }, 2000);
  };

  // ── Delete handlers ───────────────────────────────────────────────────────────
  // These call the real tRPC mutation then trigger a refetch on the page.

  const handleDeleteExpenseConfirm = async () => {
    if (!selectedExpense?.id) return;
    try {
      await trpcClient.ausgaben.delete.mutate({ id: selectedExpense.id });
      expensesRefetchRef.current?.();
    } catch (error) {
      console.error('Ausgabe löschen fehlgeschlagen:', error);
    } finally {
      closeModal();
    }
  };

  const handleDeleteAboConfirm = async () => {
    if (!selectedAbo?.id) return;
    try {
      await trpcClient.abonnements.delete.mutate({ id: selectedAbo.id });
      abonnementsRefetchRef.current?.();
    } catch (error) {
      console.error('Abonnement löschen fehlgeschlagen:', error);
    } finally {
      closeModal();
    }
  };

  // ── Save handlers (close modal + refetch so list reflects the new/edited item) ─
  const handleExpenseSaved = () => {
    closeModal();
    expensesRefetchRef.current?.();
  };

  const handleAboSaved = () => {
    closeModal();
    abonnementsRefetchRef.current?.();
  };

  // ── Auth guard ────────────────────────────────────────────────────────────────
  const isAuthView = ['login', 'register', 'forgot-password', 'loading'].includes(
    currentView as string,
  );

  // ── View renderer ─────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {

      case 'loading':
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">
                Laden…
              </p>
            </div>
          </div>
        );

      case 'login':
        return <Login onNavigate={handleNavigate} />;

      case 'register':
        return <Register onNavigate={handleNavigate} />;

      case 'forgot-password':
        return <ResetPassword onNavigate={handleNavigate} />;

      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;

      case 'expenses':
        return (
          <Expenses
            onAddExpense={() => setActiveModal('add-expense')}
            onEditExpense={(exp) => {
              setSelectedExpense(exp);
              setActiveModal('add-expense');
            }}
            onDeleteExpense={(exp) => {
              setSelectedExpense(exp);
              setActiveModal('delete-expense');
            }}
            refetchRef={expensesRefetchRef}
          />
        );

      case 'abonements':
        return (
          <Abonements
            onAddAbo={() => setActiveModal('new-abo')}
            onEditAbo={(abo) => {
              setSelectedAbo(abo);
              setActiveModal('new-abo');
            }}
            onDeleteAbo={(abo) => {
              setSelectedAbo(abo);
              setActiveModal('delete-abo');
            }}
            refetchRef={abonnementsRefetchRef}
          />
        );

      case 'ai-tips':
        return <AiTipps />;

      default:
        return <Login onNavigate={handleNavigate} />;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-on-background font-body antialiased">

      {/* Sidebar — hidden on auth/loading views */}
      {!isAuthView && (
        <Sidebar
          currentView={currentView as View}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}

      {/* Main content — offset by sidebar width when visible */}
      <main className={!isAuthView ? 'ml-64 min-h-screen' : ''}>
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

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {/* Modal components coming soon: AddExpenseModal, ScanModals, ActionModals */}

    </div>
  );
}