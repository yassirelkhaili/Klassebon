/**
 * Expenses.tsx — KlasseBon
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All API calls are imperative awaits inside useEffect or event handlers.
 *
 * Features:
 * - Real ausgaben.list data (no dummy data)
 * - 5 backend categories as filter dropdown
 * - Client-side pagination (PAGE_SIZE items per page)
 * - Loading / error / empty states
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar,
  PlusCircle,
  Filter,
  SortAsc,
  ShoppingBasket,
  Car,
  Shield,
  PlayCircle,
  Wrench,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Brain,
} from "lucide-react";
import { trpcClient } from "../lib/trpc";
import type { Expense } from "../types";

// ── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const KATEGORIEN = [
  "Alle",
  "Streaming",
  "Lebensmittel",
  "Versicherung",
  "Transport",
  "Sonstiges",
] as const;

type KategorieFilter = (typeof KATEGORIEN)[number];

type SortOption = "datum-desc" | "datum-asc" | "betrag-desc" | "betrag-asc";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: Date | string): string {
  return new Date(raw).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getCategoryIcon(kategorie: string | null) {
  switch (kategorie) {
    case "Lebensmittel": return ShoppingBasket;
    case "Transport":    return Car;
    case "Versicherung": return Shield;
    case "Streaming":    return PlayCircle;
    default:             return Wrench;
  }
}

function sortExpenses(expenses: Expense[], sort: SortOption): Expense[] {
  return [...expenses].sort((a, b) => {
    switch (sort) {
      case "datum-desc":  return new Date(b.datum).getTime() - new Date(a.datum).getTime();
      case "datum-asc":   return new Date(a.datum).getTime() - new Date(b.datum).getTime();
      case "betrag-desc": return b.betrag - a.betrag;
      case "betrag-asc":  return a.betrag - b.betrag;
    }
  });
}

// ── Props ────────────────────────────────────────────────────────────────────

interface ExpensesProps {
  onAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  /** App.tsx can pass a ref to trigger refetch after modal save/delete */
  refetchRef?: React.MutableRefObject<(() => void) | null>;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Expenses({
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  refetchRef,
}: ExpensesProps) {
  const [expenses,          setExpenses]          = useState<Expense[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [selectedKategorie, setSelectedKategorie] = useState<KategorieFilter>("Alle");
  const [sortOption,        setSortOption]        = useState<SortOption>("datum-desc");
  const [currentPage,       setCurrentPage]       = useState(1);

  // Internal ref so the extracted fetchExpenses closure stays current
  const internalRefetchRef = useRef<(() => void) | null>(null);

  // ── extracted fetch function ─────────────────────────────────────
  const fetchExpenses = useCallback(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const input =
      selectedKategorie === "Alle"
        ? {}
        : { kategorie: selectedKategorie as Exclude<KategorieFilter, "Alle"> };

    trpcClient.ausgaben.list
      .query(input)
      .then((data: any) => setExpenses(data as Expense[]))
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Fehler beim Laden der Ausgaben"
        )
      )
      .finally(() => setLoading(false));
  }, [selectedKategorie]);

  // Initial fetch + re-fetch when filter changes
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  // Keep refetchRef.current in sync with the current fetchExpenses closure
  useEffect(() => {
    internalRefetchRef.current = fetchExpenses;
    if (refetchRef) {
      refetchRef.current = fetchExpenses;
    }
  }, [fetchExpenses, refetchRef]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const sorted    = sortExpenses(expenses, sortOption);
  const totalBetrag = sorted.reduce((s, e) => s + e.betrag, 0);
  const totalPages  = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated   = sorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-12 pb-12">

      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
            Ausgaben
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">
              Lokale sichere Verarbeitung
            </span>
          </div>
        </div>
        <button
          onClick={onAddExpense}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-lg emerald-glow transition-all hover:brightness-110 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Ausgabe hinzufügen
        </button>
      </header>

      {/* Summary + filters */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="flex gap-12">
          <div className="space-y-1">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
              Anzahl Ausgaben
            </p>
            <p className="text-3xl font-bold font-headline">{sorted.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-on-surface-variant uppercase tracking-widest">
              Gesamtbetrag
            </p>
            <p className="text-3xl font-bold font-headline text-primary">
              €{totalBetrag.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Category filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <select
              value={selectedKategorie}
              onChange={(e) => {
                setSelectedKategorie(e.target.value as KategorieFilter);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 bg-surface-container-low border-none rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary cursor-pointer text-on-surface"
            >
              {KATEGORIEN.map((k) => (
                <option key={k} value={k}>
                  {k === "Alle" ? "Alle Kategorien" : k}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value as SortOption);
                setCurrentPage(1);
              }}
              className="pl-10 pr-8 py-2 bg-surface-container-low border-none rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary cursor-pointer text-on-surface"
            >
              <option value="datum-desc">Datum: Neueste zuerst</option>
              <option value="datum-asc">Datum: Älteste zuerst</option>
              <option value="betrag-desc">Betrag: Hoch → Niedrig</option>
              <option value="betrag-asc">Betrag: Niedrig → Hoch</option>
            </select>
          </div>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">
              Lade Ausgaben…
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mb-8 p-4 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
          <p className="text-sm text-on-surface">{error}</p>
          <button
            onClick={fetchExpenses}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Wiederholen
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container/50 border-b border-outline-variant/10">
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Titel</th>
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Kategorie</th>
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Datum</th>
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-right">Betrag</th>
                  <th className="px-6 py-5 text-xs font-semibold uppercase tracking-widest text-on-surface-variant text-center">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant text-sm">
                      Keine Ausgaben gefunden.
                    </td>
                  </tr>
                ) : (
                  paginated.map((expense) => {
                    const Icon = getCategoryIcon(expense.kategorie);
                    return (
                      <tr
                        key={expense.id}
                        className="hover:bg-surface-container transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-medium text-on-surface">{expense.titel}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-secondary-container text-secondary text-[11px] font-bold rounded-full uppercase tracking-tighter">
                            {expense.kategorie ?? "Sonstiges"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">
                          {formatDate(expense.datum)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-on-surface tracking-tight">
                          €{expense.betrag.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => onEditExpense(expense)}
                              className="p-1.5 hover:text-primary transition-colors"
                              aria-label="Bearbeiten"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => onDeleteExpense(expense)}
                              className="p-1.5 hover:text-error transition-colors"
                              aria-label="Löschen"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination footer */}
            <div className="p-4 flex items-center justify-between border-t border-outline-variant/10 bg-surface-container-low">
              <p className="text-[11px] text-on-surface-variant uppercase tracking-widest font-medium">
                Zeige {Math.min((currentPage - 1) * PAGE_SIZE + 1, sorted.length)}–
                {Math.min(currentPage * PAGE_SIZE, sorted.length)} von {sorted.length} Einträgen
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30"
                  aria-label="Vorherige Seite"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30"
                  aria-label="Nächste Seite"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* AI insight teaser */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-primary-container/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-5">
              <div className="p-3 bg-primary-container/20 rounded-xl">
                <Brain className="text-primary w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold font-headline mb-1">KI-Ausgabenanalyse</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Navigiere zu „AI Tipps", um personalisierte Spartipps basierend auf deinen aktuellen Ausgaben zu erhalten. Alle Berechnungen erfolgen lokal.
                </p>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 flex flex-col justify-center items-center text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-4">
                Datenschutzstatus
              </p>
              <div className="w-16 h-16 rounded-full border-2 border-primary flex items-center justify-center mb-4">
                <Shield className="text-primary w-7 h-7 fill-primary/20" />
              </div>
              <p className="text-sm font-semibold">100% Ende-zu-Ende verschlüsselt</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}