import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  Sparkles, 
  LogOut,
  Wallet
} from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onNavigate, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses' as View, label: 'Expenses', icon: Receipt },
    { id: 'abonements' as View, label: 'Abonements', icon: CreditCard },
    { id: 'ai-tips' as View, label: 'AI Tips', icon: Sparkles },
  ];

  return (
    <aside className="h-screen w-64 border-r border-outline-variant/15 flex flex-col py-8 px-4 bg-surface-container-lowest fixed left-0 top-0 overflow-y-auto z-50">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Wallet className="text-on-primary w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold font-headline tracking-tight text-on-surface leading-tight">KlasseBon</h1>
            <p className="text-[10px] font-bold tracking-[0.25em] text-primary uppercase leading-none mt-1">THE PRIVATE LEDGER</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 transition-colors duration-200 rounded-lg group ${
                isActive 
                  ? 'bg-primary-container/10 text-primary font-semibold' 
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/20' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-outline-variant/10 px-2">
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