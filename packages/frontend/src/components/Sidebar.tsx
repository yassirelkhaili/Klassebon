import { LayoutDashboard, Receipt, CreditCard, Sparkles, LogOut, Wallet } from "lucide-react";
import type { View } from "../types";

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const navItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
    { id: "expenses" as View, label: "Expenses", icon: Receipt },
    { id: "abonements" as View, label: "Abonements", icon: CreditCard },
    { id: "ai-tips" as View, label: "AI Tips", icon: Sparkles },
  ];

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 flex h-16 border-t border-outline-variant/15 bg-surface-container-lowest px-2 py-2 lg:inset-y-0 lg:left-0 lg:right-auto lg:h-screen lg:w-64 lg:flex-col lg:overflow-y-auto lg:border-r lg:border-t-0 lg:px-4 lg:py-8">
      <div className="mb-10 hidden px-6 lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="text-on-primary w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold font-headline tracking-tight text-on-surface leading-tight">
              KlasseBon
            </h1>
            <p className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase leading-none mt-1">
              THE PRIVATE LEDGER
            </p>
          </div>
        </div>
      </div>

      <nav className="grid flex-1 grid-cols-4 gap-1 lg:block lg:space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`group flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors duration-200 lg:h-auto lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:py-3 lg:text-base ${
                isActive
                  ? "bg-primary-container/10 text-primary font-semibold"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="truncate font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-outline-variant/10 px-2 pt-6 lg:block">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors duration-200 rounded-lg group"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
