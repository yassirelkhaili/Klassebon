export function Subscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Subscriptions</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Your active recurring plans</h2>
      </div>

      <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
        <p className="text-sm text-slate-400">This page is ready for backend bound subscription data. Once the subscription CRUD API is available, the table can render real user entries, groups, and recurring costs.</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Monthly cost</p>
            <p className="mt-4 text-3xl font-semibold text-white">€87.96</p>
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Annual cost</p>
            <p className="mt-4 text-3xl font-semibold text-white">€1,055.52</p>
          </div>
        </div>
      </section>
    </div>
  );
}
