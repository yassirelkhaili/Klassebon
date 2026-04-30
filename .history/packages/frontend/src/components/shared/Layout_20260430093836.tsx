import { NavLink } from "react-router-dom";
import { Home, ListChecks, Wallet, Sparkles, Menu } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Expenses", path: "/expenses", icon: Wallet },
  { label: "Subscriptions", path: "/subscriptions", icon: ListChecks },
  { label: "AI Tips", path: "/ai-tips", icon: Sparkles },
];

function NavItem({ label, path, icon: Icon }: { label: string; path: string; icon: typeof Home }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors duration-200 ${
          isActive ? "bg-slate-800 text-emerald-300 shadow-sm shadow-emerald-500/20" : "text-slate-300 hover:bg-slate-900 hover:text-white"
        }`
      >
      <Icon className="h-5 w-5" />
      {label}
    </NavLink>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="grid min-h-screen grid-cols-[280px_1fr] gap-6 px-6 py-6 xl:px-10 xl:py-8">
        <aside className="flex flex-col gap-8 rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500 text-slate-950">
              <Menu className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">KlasseBon</p>
              <p className="text-lg font-semibold text-white">Private Ledger</p>
            </div>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
          </nav>

          <div className="mt-auto rounded-3xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300 shadow-inner shadow-slate-950/30">
            <p className="font-semibold text-slate-100">Team status</p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              You are working on the frontend dashboard, navigation, chart views, and expense list.
            </p>
          </div>
        </aside>

        <main className="rounded-[32px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl shadow-black/40">
          {children}
        </main>
      </div>
    </div>
  );
}
