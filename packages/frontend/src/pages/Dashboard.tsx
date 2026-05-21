/*import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowUpRight, CircleDot, Sparkles, Wifi } from "lucide-react";
import { trpcClient } from "../lib/trpc";

const categoryData = [
  { name: "Housing", value: 45 },
  { name: "Food", value: 22 },
  { name: "Transport", value: 18 },
  { name: "Leisure", value: 10 },
];

const overviewCards = [
  { title: "Monthly Spend", value: "€1,420.50", note: "4.2% less than last month", icon: Activity },
  { title: "Active Subscriptions", value: "12 subscriptions", note: "€87.96 / month total", icon: CircleDot },
  { title: "Last Expense", value: "Starbucks · €5.50", note: "Oct 24, 2024", icon: ArrowUpRight },
];

const recentExpenses = [
  { merchant: "Apple Store", category: "Technology", date: "Oct 24", amount: "-€129.00" },
  { merchant: "The Green Bistro", category: "Food & Dining", date: "Oct 23", amount: "-€42.50" },
  { merchant: "Shell Station", category: "Transport", date: "Oct 22", amount: "-€85.20" },
];

export function Dashboard() {
  const [health, setHealth] = useState<string>("Loading...");


  
  useEffect(() => {
    trpcClient.health
      .query()
      .then((result) => setHealth(`Connected to ${result.service}`))
      .catch(() => setHealth("Backend offline"));
  }, []);

  const connectionStatus = useMemo(() => health, [health]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Welcome back</p>
          <h1 className="mt-2 text-4xl font-semibold text-white">Your private ledger is up to date.</h1>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-5 py-4 text-sm text-slate-300 shadow-sm shadow-slate-950/40">
          <div className="flex items-center gap-2 text-emerald-300">
            <Wifi className="h-4 w-4" />
            <span>{connectionStatus}</span>
          </div>
        </div>
      </header>

      <section className="grid gap-4 xl:grid-cols-3">
        {overviewCards.map((card) => (
          <article key={card.title} className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{card.title}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-500/15 text-emerald-300">
                <card.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-5 text-sm text-slate-400">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Spending distribution</p>
              <p className="mt-2 text-lg font-semibold text-white">Total spent €1.4k</p>
            </div>
            <Sparkles className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="mt-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 0, left: -20, bottom: 10 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "rgba(15,23,42,0.8)" }}
                  contentStyle={{ background: "#020617", border: "1px solid #334155" }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <article className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">AI Saving Tip</p>
            <p className="mt-5 text-xl font-semibold text-white">Switch to annual billing for Netflix and save €24/year.</p>
            <button type="button" className="mt-6 inline-flex items-center justify-center rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
              Generate more
            </button>
          </article>

          <article className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Recent expenses</p>
            <div className="mt-6 space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.merchant} className="rounded-3xl bg-slate-950/70 p-4">
                  <p className="font-semibold text-white">{expense.merchant}</p>
                  <p className="mt-1 text-sm text-slate-400">{expense.category} · {expense.date}</p>
                  <p className="mt-3 text-sm font-semibold text-emerald-300">{expense.amount}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Backend integration</p>
            <p className="mt-2 text-lg text-white">This dashboard uses the active backend health probe from tRPC before deeper integration.</p>
          </div>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
            <Wifi className="h-4 w-4 text-emerald-300" />
            <span>{connectionStatus}</span>
          </div>
        </div>
      </section>
    </div>
  );
}*/
import React from 'react';
import {
  Bell,
  TrendingDown,
  ShoppingBag,
  Utensils,
  Car,
  Dumbbell,
  Coffee,
  Sparkles,
  Plus,
  Cloud,
  Music
} from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="px-12 pb-12">
      <header className="flex items-center justify-between py-8">
        <div>
          <h2 className="font-headline font-bold text-on-surface tracking-tight text-xl">Welcome back, your private ledger is up to date.</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/30 text-primary text-[10px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Local-Only Encryption
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-opacity">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full border border-outline-variant/30 overflow-hidden">
            <img alt="User Avatar" className="w-full h-full object-cover" src="https://picsum.photos/seed/user/100/100" />
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label text-sm">Monthly Spend</span>
            <ShoppingBag className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">€1,420.50</h2>
            <p className="text-xs text-primary mt-2 flex items-center gap-1">
              <TrendingDown className="w-3 h-3" />
              4.2% less than last month
            </p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label text-sm">Active Subscriptions</span>
            <Sparkles className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">12 subscriptions</h2>
            <p className="text-sm text-on-surface-variant mt-1">€87.96/month total</p>
          </div>
        </div>

        <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label text-sm">Last Expense</span>
            <ShoppingBag className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
          </div>
          <div>
            <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">Starbucks · €5.50</h2>
            <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
              Oct 24, 2024
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-headline text-lg font-bold">Spending Distribution</h3>
            <div className="flex gap-4 text-xs font-label text-on-surface-variant">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#88d982]"></span> Housing</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#4db6ac]"></span> Food</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#9575cd]"></span> Transport</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="50%" cy="50%" fill="transparent" r="45%" stroke="#1c1b1b" strokeWidth="20"></circle>
                <circle cx="50%" cy="50%" fill="transparent" r="45%" stroke="#88d982" strokeDasharray="282.7" strokeDashoffset="155.5" strokeWidth="20"></circle>
                <circle className="origin-center rotate-[162deg]" cx="50%" cy="50%" fill="transparent" r="45%" stroke="#4db6ac" strokeDasharray="282.7" strokeDashoffset="220.5" strokeWidth="20"></circle>
                <circle className="origin-center rotate-[241deg]" cx="50%" cy="50%" fill="transparent" r="45%" stroke="#9575cd" strokeDasharray="282.7" strokeDashoffset="231.8" strokeWidth="20"></circle>
                <circle className="origin-center rotate-[306deg]" cx="50%" cy="50%" fill="transparent" r="45%" stroke="#ffd54f" strokeDasharray="282.7" strokeDashoffset="254.4" strokeWidth="20"></circle>
                <circle className="origin-center rotate-[342deg]" cx="50%" cy="50%" fill="transparent" r="45%" stroke="#ff8a65" strokeDasharray="282.7" strokeDashoffset="268.6" strokeWidth="20"></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-on-surface-variant text-xs font-label">Total spent</span>
                <span className="text-2xl font-bold font-headline">€1.4k</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-label">Housing</span>
                <span className="text-xl font-bold text-on-surface">45%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-label">Food</span>
                <span className="text-xl font-bold text-on-surface">22%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-label">Transport</span>
                <span className="text-xl font-bold text-on-surface">18%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-on-surface-variant font-label">Leisure</span>
                <span className="text-xl font-bold text-on-surface">10%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-8 h-full flex flex-col relative overflow-hidden group shadow-xl">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700"></div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">AI Saving Tip</h3>
              <p className="font-body text-on-surface/80 leading-relaxed mb-8">
                "Switch to annual billing for <span className="text-primary font-bold">Netflix</span> and save <span className="bg-primary/20 px-1 rounded">€24/year</span>."
              </p>
              <div className="mt-auto">
                <button className="w-full py-4 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-primary/20">
                  Generate more
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline text-lg font-bold">Recent Expenses</h3>
            <button className="text-primary text-sm font-medium hover:underline">View All</button>
          </div>
          <div className="space-y-1">
            <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold border-b border-outline-variant/10 mb-2">
              <span>Merchant</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
            </div>
            {[
              { name: 'Apple Store', cat: 'Technology', date: 'Oct 24, 2023', amount: '-€129.00', icon: ShoppingBag },
              { name: 'The Green Bistro', cat: 'Food & Dining', date: 'Oct 23, 2023', amount: '-€42.50', icon: Utensils },
              { name: 'Shell Station', cat: 'Transport', date: 'Oct 22, 2023', amount: '-€85.20', icon: Car },
              { name: 'Fitness First', cat: 'Leisure', date: 'Oct 20, 2023', amount: '-€35.00', icon: Dumbbell },
              { name: 'Blue Bottle Coffee', cat: 'Food & Dining', date: 'Oct 19, 2023', amount: '-€5.50', icon: Coffee },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="grid grid-cols-4 items-center px-4 py-4 rounded-xl hover:bg-surface-container transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                  <span className="text-xs text-on-surface-variant">{item.cat}</span>
                  <span className="text-xs text-on-surface-variant">{item.date}</span>
                  <span className="text-sm font-bold text-right text-on-surface">{item.amount}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold mb-8">Active Subscriptions</h3>
          <div className="space-y-4">
            {[
              { name: 'Netflix', plan: 'Monthly Plan', price: '€17.99', color: '#E50914', icon: 'N' },
              { name: 'Spotify', plan: 'Premium Individual', price: '€10.99', color: '#1DB954', icon: Music },
              { name: 'iCloud+', plan: '2TB Storage', price: '€9.99', color: 'white', icon: Cloud },
              { name: 'Fitness First', plan: 'All Access Gym', price: '€49.00', color: '#88d982', icon: Dumbbell },
            ].map((sub, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface-container rounded-xl hover:translate-x-1 transition-transform cursor-pointer">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant/10 overflow-hidden"
                    style={{ backgroundColor: sub.color === 'white' ? 'rgba(255,255,255,0.1)' : sub.color }}
                  >
                    {typeof sub.icon === 'string' ? (
                      <span className="text-white font-black text-xs">{sub.icon}</span>
                    ) : (
                      <sub.icon className={`w-5 h-5 ${sub.color === 'white' ? 'text-white' : 'text-black'}`} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{sub.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{sub.plan}</p>
                  </div>
                </div>
                <span className="text-sm font-bold">{sub.price}</span>
              </div>
            ))}
            <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-xs font-bold text-on-surface-variant border border-outline-variant/20 rounded-xl hover:bg-surface-container-high hover:border-primary/30 transition-all">
              <Plus className="w-4 h-4" />
              Manage Subscriptions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

