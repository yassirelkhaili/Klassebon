import { useMemo, useEffect, useState } from "react";
import { trpcClient } from "../lib/trpc";

const categories = ["All", "Streaming", "Food", "Transport", "Insurance", "Other"];

const sampleExpenses = [
  { name: "Whole Foods", category: "Food", date: "Oct 12, 2024", amount: "€84.50" },
  { name: "Uber Ride", category: "Transport", date: "Oct 11, 2024", amount: "€12.30" },
  { name: "Health Insurance", category: "Insurance", date: "Oct 10, 2024", amount: "€210.00" },
  { name: "Netflix", category: "Streaming", date: "Oct 08, 2024", amount: "€17.99" },
  { name: "Hardware Store", category: "Other", date: "Oct 05, 2024", amount: "€45.20" },
];

export function Expenses() {
  const [healthStatus, setHealthStatus] = useState("Loading...");
  const [activeCategory, setActiveCategory] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 3;

  useEffect(() => {
    trpcClient.health
      .query()
      .then(() => setHealthStatus("Online"))
      .catch(() => setHealthStatus("Offline"));
  }, []);

  const filteredExpenses = useMemo(() => {
    const filtered = activeCategory === "All" ? sampleExpenses : sampleExpenses.filter((item) => item.category === activeCategory);
    return filtered.slice((page - 1) * perPage, page * perPage);
  }, [activeCategory, page]);

  const totalPages = Math.ceil((activeCategory === "All" ? sampleExpenses.length : sampleExpenses.filter((item) => item.category === activeCategory).length) / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Expenses</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">All expense entries</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
            Add Expense
          </button>
          <span className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            Backend health: {healthQuery.isLoading ? "loading..." : healthQuery.isError ? "offline" : "online"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Expense overview</p>
              <p className="mt-2 text-2xl font-semibold text-white">{sampleExpenses.length} transactions</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-300">Total €360.99</div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-slate-300">
              Category
              <select
                className="rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                value={activeCategory}
                onChange={(event) => {
                  setActiveCategory(event.target.value);
                  setPage(1);
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}> {category} </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950/90 text-sm text-slate-200">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-slate-900/95 text-slate-400">
                <tr>
                  <th className="px-5 py-4">Name</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Date</th>
                  <th className="px-5 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={`${expense.name}-${expense.date}`} className="border-t border-slate-800 hover:bg-slate-900/80">
                    <td className="px-5 py-4">{expense.name}</td>
                    <td className="px-5 py-4 text-slate-300">{expense.category}</td>
                    <td className="px-5 py-4 text-slate-300">{expense.date}</td>
                    <td className="px-5 py-4 text-right font-semibold text-white">{expense.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Backend integration</p>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The expenses list is ready for backend payloads once authentication and receipt APIs are connected. For now, this page demonstrates your navigation, filter UI, and pagination layout.
            </p>
          </div>
          <div className="rounded-3xl bg-slate-950/80 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Backend status</p>
            <p className="mt-2">{healthQuery.isLoading ? "Checking..." : healthQuery.isError ? "Offline / not reachable" : "Online"}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
