import { useEffect, useMemo, useState } from "react";
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
}
