export function AiTips() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">AI Tips</p>
        <h2 className="mt-2 text-3xl font-semibold text-white">Saving ideas from local intelligence</h2>
      </div>

      <section className="rounded-[28px] border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/40">
        <p className="text-slate-300">This page is prepared for the local AI tip engine. It demonstrates the planned layout and can be connected when the Ollama integration is ready.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Potential savings</p>
            <p className="mt-4 text-3xl font-semibold text-white">€124.50</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Top category</p>
            <p className="mt-4 text-3xl font-semibold text-white">Streaming</p>
          </article>
          <article className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Last generated</p>
            <p className="mt-4 text-3xl font-semibold text-white">Oct 15, 2024</p>
          </article>
        </div>
      </section>
    </div>
  );
}
