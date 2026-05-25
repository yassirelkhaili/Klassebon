/**
 * Dashboard.tsx — KlasseBon
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All API calls are imperative awaits inside useEffect or event handlers.
 *
 * FIX #2: Two independent loading flags (loadingUebersicht, loadingAbos) so
 *         each parallel call sets its own flag in .finally().
 * FIX #6: SVG donut uses circumference 282.7 (consistent with original design).
 * FIX #9: Month picker uses ChevronLeft / ChevronRight arrow buttons.
 * FIX #10: All data access goes through dashboardData?.field with optional chaining.
 */

import React, { useState, useEffect } from "react";
import {
  Bell,
  TrendingDown,
  ShoppingBag,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { trpcClient } from "../lib/trpc";

// ── Types inferred from backend return shapes ────────────────────────────────

type KategorieEintrag = { kategorie: string; betrag: number };

type DashboardData = {
  monatskosten: {
    monat: number;
    jahr: number;
    ausgabenSumme: number;
    abonnementsSumme: number;
    gesamt: number;
  };
  nachKategorie: KategorieEintrag[];
  naechsteFaelligkeiten: {
    id: string;
    name: string;
    betrag: number;
    turnus: string;
    naechsteFaelligkeit: Date | string;
    kategorie: string | null;
  }[];
  letzteAusgaben: {
    id: string;
    titel: string;
    betrag: number;
    datum: Date | string;
    kategorie: string | null;
  }[];
};

type AboSummary = {
  id: string;
  name: string;
  betrag: number;
  turnus: string;
  aktiv: boolean;
};

// ── Donut chart colours per category ────────────────────────────────────────

const KATEGORIE_COLORS: Record<string, string> = {
  Streaming: "#88d982",
  Lebensmittel: "#4db6ac",
  Versicherung: "#9575cd",
  Transport: "#ffd54f",
  Sonstiges: "#ff8a65",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: Date | string): string {
  return new Date(raw).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatMonthLabel(monat: number, jahr: number): string {
  return new Date(jahr, monat - 1).toLocaleString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

function turnus(t: string): string {
  switch (t) {
    case "WOECHENTLICH": return "Wöchentlich";
    case "MONATLICH":    return "Monatlich";
    case "JAEHRLICH":    return "Jährlich";
    default:             return t;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const now = new Date();
  const [monat, setMonat] = useState(now.getMonth() + 1);
  const [jahr, setJahr]   = useState(now.getFullYear());

  // FIX #2 — independent loading/error states for each parallel call
  const [loadingUebersicht, setLoadingUebersicht] = useState(true);
  const [loadingAbos,       setLoadingAbos]       = useState(true);
  const [errorUebersicht,   setErrorUebersicht]   = useState<string | null>(null);
  const [errorAbos,         setErrorAbos]         = useState<string | null>(null);

  // FIX #10 — all field access goes through dashboardData?.field
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [abos,          setAbos]          = useState<AboSummary[]>([]);

  // ── FIX #9: Month navigation ──────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (monat === 1) { setMonat(12); setJahr((y) => y - 1); }
    else             { setMonat((m) => m - 1); }
  };

  const handleNextMonth = () => {
    if (monat === 12) { setMonat(1); setJahr((y) => y + 1); }
    else              { setMonat((m) => m + 1); }
  };

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    // FIX #2 — each call manages its own flag in .finally()
    setLoadingUebersicht(true);
    setErrorUebersicht(null);

    trpcClient.dashboard.uebersicht.query({ monat, jahr })
      .then((data: any) => setDashboardData(data as DashboardData))
      .catch((err: unknown) =>
        setErrorUebersicht(
          err instanceof Error ? err.message : "Fehler beim Laden des Dashboards"
        )
      )
      .finally(() => setLoadingUebersicht(false));

    setLoadingAbos(true);
    setErrorAbos(null);

    trpcClient.abonnements.list.query({})
      .then((data: any) => setAbos(data as AboSummary[]))
      .catch((err: unknown) =>
        setErrorAbos(
          err instanceof Error ? err.message : "Fehler beim Laden der Abonnements"
        )
      )
      .finally(() => setLoadingAbos(false));
  }, [monat, jahr]);

  // Derived: spinner while either call is pending
  const isLoading = loadingUebersicht || loadingAbos;

  // ── Donut chart computation ───────────────────────────────────────────────
  const CIRCUMFERENCE = 282.7;

  const donutSegments = (() => {
    const data = dashboardData?.nachKategorie ?? [];
    const nonZero = data.filter((k) => k.betrag > 0);
    const total = nonZero.reduce((s, k) => s + k.betrag, 0);
    if (total === 0 || nonZero.length === 0) return [];

    let cumulative = 0;
    return nonZero.map((k) => {
      const pct = (k.betrag / total) * 100;
      const offset = CIRCUMFERENCE * (1 - pct / 100);
      const rotate = cumulative * 3.6;
      cumulative += pct;
      return { ...k, pct, offset, rotate };
    });
  })();

  const donutTotal = dashboardData?.monatskosten.gesamt ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-12 pb-12">

      {/* Header */}
      <header className="flex items-center justify-between py-8">
        <div>
          <h2 className="font-headline font-bold text-on-surface tracking-tight text-xl">
            Willkommen zurück — dein privates Haushaltsbuch ist aktuell.
          </h2>
        </div>
        <div className="flex items-center gap-6">
          {/* FIX #9 — month picker with arrows */}
          <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-1.5">
            <button
              onClick={handlePrevMonth}
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-on-surface min-w-[120px] text-center">
              {formatMonthLabel(monat, jahr)}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-on-surface-variant hover:text-primary transition-colors"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary-container/30 text-primary text-[10px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
            Local-Only Encryption
          </div>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Loading spinner */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">
              Lade Dashboard…
            </p>
          </div>
        </div>
      )}

      {/* Error states */}
      {!isLoading && (errorUebersicht || errorAbos) && (
        <div className="mb-8 p-4 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-on-surface">
            {errorUebersicht ?? errorAbos}
          </p>
          <button
            onClick={() => { setMonat(monat); }} // triggers useEffect retry
            className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Wiederholen
          </button>
        </div>
      )}

      {/* Main content — only renders once both calls are done */}
      {!isLoading && !errorUebersicht && !errorAbos && (
        <>
          {/* Stat cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Monthly spend */}
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label text-sm">Monatsausgaben</span>
                <ShoppingBag className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
              </div>
              <div>
                {/* FIX #10 — optional chaining throughout */}
                <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
                  €{dashboardData?.monatskosten.gesamt.toFixed(2) ?? "0.00"}
                </h2>
                <p className="text-xs text-on-surface-variant mt-2">
                  Ausgaben: €{dashboardData?.monatskosten.ausgabenSumme.toFixed(2) ?? "0.00"} ·
                  Abos: €{dashboardData?.monatskosten.abonnementsSumme.toFixed(2) ?? "0.00"}
                </p>
              </div>
            </div>

            {/* Active subscriptions */}
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label text-sm">Aktive Abonnements</span>
                <Sparkles className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
              </div>
              <div>
                <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                  {abos.filter((a) => a.aktiv).length} Abonnements
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  €{dashboardData?.monatskosten.abonnementsSumme.toFixed(2) ?? "0.00"}/Monat gesamt
                </p>
              </div>
            </div>

            {/* Last expense */}
            <div className="bg-surface-container-low rounded-xl p-6 flex flex-col justify-between group hover:bg-surface-container transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label text-sm">Letzte Ausgabe</span>
                <ShoppingBag className="text-primary/40 group-hover:text-primary transition-colors w-5 h-5" />
              </div>
              <div>
                {dashboardData?.letzteAusgaben?.[0] ? (
                  <>
                    <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">
                      {dashboardData.letzteAusgaben[0].titel} · €{dashboardData.letzteAusgaben[0].betrag.toFixed(2)}
                    </h2>
                    <p className="text-xs text-on-surface-variant mt-2">
                      {formatDate(dashboardData.letzteAusgaben[0].datum)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-on-surface-variant">Keine Ausgaben erfasst</p>
                )}
              </div>
            </div>
          </section>

          {/* Donut chart + recent expenses */}
          <section className="grid grid-cols-12 gap-8 mb-12">

            {/* Donut chart — FIX #6: circumference 282.7 */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
              <div className="flex justify-between items-center mb-10">
                <h3 className="font-headline text-lg font-bold">Ausgaben nach Kategorie</h3>
                <div className="flex flex-wrap gap-4 text-xs font-label text-on-surface-variant">
                  {donutSegments.map((s) => (
                    <span key={s.kategorie} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: KATEGORIE_COLORS[s.kategorie] ?? "#888" }}
                      />
                      {s.kategorie}
                    </span>
                  ))}
                </div>
              </div>

              {dashboardData && (
                <div className="flex flex-col md:flex-row items-center justify-around gap-8">
                  {donutSegments.length === 0 ? (
                    <p className="text-on-surface-variant text-sm">
                      Keine Ausgaben in diesem Monat
                    </p>
                  ) : (
                    <>
                      <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          {/* Background track */}
                          <circle
                            cx="50%" cy="50%"
                            fill="transparent" r="45%"
                            stroke="#1c1b1b" strokeWidth="20"
                          />
                          {/* FIX #6 — segments using 282.7 circumference */}
                          {donutSegments.map((s) => (
                            <circle
                              key={s.kategorie}
                              cx="50%" cy="50%"
                              fill="transparent" r="45%"
                              stroke={KATEGORIE_COLORS[s.kategorie] ?? "#888"}
                              strokeDasharray={CIRCUMFERENCE}
                              strokeDashoffset={s.offset}
                              strokeWidth="20"
                              style={{
                                transformOrigin: "center",
                                transform: `rotate(${s.rotate}deg)`,
                              }}
                            />
                          ))}
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <span className="text-on-surface-variant text-xs font-label">Gesamt</span>
                          <span className="text-2xl font-bold font-headline">
                            €{donutTotal.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-x-12 gap-y-4 w-full md:w-auto">
                        {donutSegments.map((s) => (
                          <div key={s.kategorie} className="flex flex-col">
                            <span className="text-xs text-on-surface-variant font-label">
                              {s.kategorie}
                            </span>
                            <span className="text-xl font-bold text-on-surface">
                              {s.pct.toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* AI tip teaser */}
            <div className="col-span-12 lg:col-span-4 flex flex-col">
              <div className="bg-primary-container/10 border border-primary/20 rounded-xl p-8 h-full flex flex-col relative overflow-hidden group shadow-xl">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-all duration-700" />
                <div className="relative z-10 flex flex-col h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-on-surface mb-4">
                    KI-Spartipp
                  </h3>
                  <p className="font-body text-on-surface/80 leading-relaxed mb-8">
                    Lass dir von unserer lokalen KI personalisierte Spartipps für diesen Monat generieren.
                  </p>
                  <div className="mt-auto">
                    <button className="w-full py-4 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-xl transition-transform active:scale-95 shadow-lg shadow-primary/20">
                      Tipps generieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recent expenses + upcoming subscriptions */}
          <section className="grid grid-cols-12 gap-8">

            {/* Recent expenses */}
            <div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline text-lg font-bold">Letzte Ausgaben</h3>
              </div>
              {dashboardData?.letzteAusgaben && dashboardData.letzteAusgaben.length > 0 ? (
                <div className="space-y-1">
                  <div className="grid grid-cols-4 px-4 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant font-bold border-b border-outline-variant/10 mb-2">
                    <span>Titel</span>
                    <span>Kategorie</span>
                    <span>Datum</span>
                    <span className="text-right">Betrag</span>
                  </div>
                  {dashboardData.letzteAusgaben.map((ausgabe) => (
                    <div
                      key={ausgabe.id}
                      className="grid grid-cols-4 items-center px-4 py-4 rounded-xl hover:bg-surface-container transition-colors"
                    >
                      <span className="font-medium text-sm text-on-surface">{ausgabe.titel}</span>
                      <span className="text-xs text-on-surface-variant">
                        {ausgabe.kategorie ?? "Sonstiges"}
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        {formatDate(ausgabe.datum)}
                      </span>
                      <span className="text-sm font-bold text-right text-on-surface">
                        −€{ausgabe.betrag.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-on-surface-variant text-sm">
                  Keine Ausgaben in diesem Monat erfasst.
                </p>
              )}
            </div>

            {/* Upcoming subscriptions */}
            <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 shadow-2xl border border-outline-variant/10">
              <h3 className="font-headline text-lg font-bold mb-8">
                Bald fällige Abos
              </h3>
              {dashboardData?.naechsteFaelligkeiten &&
              dashboardData.naechsteFaelligkeiten.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.naechsteFaelligkeiten.map((abo) => (
                    <div
                      key={abo.id}
                      className="flex items-center justify-between p-4 bg-surface-container rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold text-on-surface">{abo.name}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {turnus(abo.turnus)} · {formatDate(abo.naechsteFaelligkeit)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        €{abo.betrag.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant">
                  Keine fälligen Abos in den nächsten 30 Tagen.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}