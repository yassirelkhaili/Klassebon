/**
 * Abonements.tsx — KlasseBon
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All API calls are imperative awaits inside useEffect or event handlers.
 *
 * Features:
 * - Real abonnements.list data (no dummy data)
 * - Category filter (5 backend categories + "Alle") and nurAktive toggle
 * - Client-side pagination
 * - Monthly / yearly / active-count stat cards computed from real data
 * - Loading / error / empty states
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  PlusCircle,
  Calendar,
  TrendingUp,
  ShieldCheck,
  Database,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  Music,
  Cloud,
  Dumbbell,
  CreditCard,
} from "lucide-react";
import { trpcClient } from "../lib/trpc";
import type { Abonement } from "../types";

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function turnus(t: string): string {
  switch (t) {
    case "WOECHENTLICH": return "Wöchentlich";
    case "MONATLICH":    return "Monatlich";
    case "JAEHRLICH":    return "Jährlich";
    default:             return t;
  }
}

/** Convert any abo to its monthly equivalent for cost summaries */
function monatlichenBetrag(betrag: number, t: string): number {
  switch (t) {
    case "WOECHENTLICH": return betrag * (52 / 12);
    case "MONATLICH":    return betrag;
    case "JAEHRLICH":    return betrag / 12;
    default:             return betrag;
  }
}

function getAboIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("netflix") || lower.includes("disney") || lower.includes("prime"))
    return PlayCircle;
  if (lower.includes("spotify") || lower.includes("apple music") || lower.includes("deezer"))
    return Music;
  if (lower.includes("cloud") || lower.includes("icloud") || lower.includes("dropbox"))
    return Cloud;
  if (lower.includes("fitness") || lower.includes("gym") || lower.includes("sport"))
    return Dumbbell;
  return CreditCard;
}

// ── Props ────────────────────────────────────────────────────────────────────

interface AbonementsProps {
  onAddAbo: () => void;
  onEditAbo: (abo: Abonement) => void;
  onDeleteAbo: (abo: Abonement) => void;
  /** App.tsx can pass a ref to trigger refetch after modal save/delete */
  refetchRef?: React.MutableRefObject<(() => void) | null>;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Abonements({
  onAddAbo,
  onEditAbo,
  onDeleteAbo,
  refetchRef,
}: AbonementsProps) {
  const [abonnements,       setAbonnements]       = useState<Abonement[]>([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState<string | null>(null);
  const [selectedKategorie, setSelectedKategorie] = useState<KategorieFilter>("Alle");
  const [nurAktive,         setNurAktive]         = useState(false);
  const [currentPage,       setCurrentPage]       = useState(1);

  const internalRefetchRef = useRef<(() => void) | null>(null);
  const fetchAbonnements = useCallback(() => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    const input: {
      kategorie?: "Streaming" | "Lebensmittel" | "Versicherung" | "Transport" | "Sonstiges";
      nurAktive?: boolean;
    } = {};

    if (selectedKategorie !== "Alle") {
      input.kategorie = selectedKategorie as Exclude<KategorieFilter, "Alle">;
    }
    if (nurAktive) {
      input.nurAktive = true;
    }

    trpcClient.abonnements.list
      .query(input)
      .then((data: any) => setAbonnements(data as Abonement[]))
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Fehler beim Laden der Abonnements"
        )
      )
      .finally(() => setLoading(false));
  }, [selectedKategorie, nurAktive]);

  // Initial fetch + re-fetch when filters change
  useEffect(() => {
    fetchAbonnements();
  }, [fetchAbonnements]);

  // Keep refetchRef.current in sync
  useEffect(() => {
    internalRefetchRef.current = fetchAbonnements;
    if (refetchRef) {
      refetchRef.current = fetchAbonnements;
    }
  }, [fetchAbonnements, refetchRef]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const aktiveAbos       = abonnements.filter((a) => a.aktiv);
  const monatlichGesamt  = aktiveAbos.reduce(
    (s, a) => s + monatlichenBetrag(a.betrag, a.turnus), 0
  );
  const jaehrlichGesamt  = monatlichGesamt * 12;

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(abonnements.length / PAGE_SIZE));
  const paginated  = abonnements.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-12 pb-12">

      {/* Header */}
      <header className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">
            Abonnements
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">
              Lokale Datenhaltung
            </span>
          </div>
        </div>
        <button
          onClick={onAddAbo}
          className="bg-gradient-to-br from-primary-container to-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
        >
          <PlusCircle className="w-5 h-5" />
          + Neues Abo
        </button>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            Monatliche Kosten
          </p>
          <h2 className="text-4xl font-black font-headline text-primary tracking-tighter">
            €{monatlichGesamt.toFixed(2)}
          </h2>
          <p className="mt-4 text-xs text-on-surface-variant/60">
            Basierend auf {aktiveAbos.length} aktiven Abonnements
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-tertiary/10 transition-colors" />
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            Jährliche Kosten
          </p>
          <h2 className="text-4xl font-black font-headline text-on-surface tracking-tighter">
            €{jaehrlichGesamt.toFixed(2)}
          </h2>
          <p className="mt-4 text-xs text-on-surface-variant/60">
            Hochrechnung auf 12 Monate
          </p>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-colors" />
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aktive Abos
          </p>
          <h2 className="text-4xl font-black font-headline text-on-surface tracking-tighter">
            {aktiveAbos.length}
          </h2>
          <p className="mt-4 text-xs text-on-surface-variant/60">
            {abonnements.length - aktiveAbos.length} inaktiv
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 px-2">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <select
            value={selectedKategorie}
            onChange={(e) => {
              setSelectedKategorie(e.target.value as KategorieFilter);
              setCurrentPage(1);
            }}
            className="pl-10 pr-8 py-2 bg-surface-container-low border border-outline-variant/10 rounded-lg text-sm appearance-none focus:ring-1 focus:ring-primary cursor-pointer text-on-surface"
          >
            {KATEGORIEN.map((k) => (
              <option key={k} value={k}>
                {k === "Alle" ? "Alle Kategorien" : k}
              </option>
            ))}
          </select>
        </div>

        {/* nurAktive toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => { setNurAktive((v) => !v); setCurrentPage(1); }}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              nurAktive ? "bg-primary" : "bg-surface-container-highest"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                nurAktive ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs font-semibold text-on-surface-variant">
            Nur aktive
          </span>
        </label>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">
              Lade Abonnements…
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
            onClick={fetchAbonnements}
            className="ml-auto flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <RefreshCw className="w-3 h-3" /> Wiederholen
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <section className="flex flex-col flex-1 mb-12">
          <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10">
            <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-surface-container/50 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
              <div className="col-span-5">Name & Service</div>
              <div className="col-span-2">Kategorie</div>
              <div className="col-span-2 text-center">Turnus</div>
              <div className="col-span-2 text-right">Preis / Monat</div>
              <div className="col-span-1 text-right">Aktionen</div>
            </div>

            <div className="divide-y divide-outline-variant/5">
              {paginated.length === 0 ? (
                <div className="px-8 py-16 text-center text-on-surface-variant text-sm">
                  Keine Abonnements gefunden.
                </div>
              ) : (
                paginated.map((abo) => {
                  const Icon = getAboIcon(abo.name);
                  return (
                    <div
                      key={abo.id}
                      className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-surface-container transition-colors items-center group"
                    >
                      <div className="col-span-5 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface">{abo.name}</h4>
                          {!abo.aktiv && (
                            <span className="text-[10px] font-bold text-error uppercase">
                              Inaktiv
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="px-2 py-1 bg-secondary-container text-secondary text-[10px] font-bold rounded-full uppercase tracking-tighter">
                          {abo.kategorie ?? "Sonstiges"}
                        </span>
                      </div>

                      <div className="col-span-2 text-center">
                        <span className="text-xs text-on-surface-variant">
                          {turnus(abo.turnus)}
                        </span>
                      </div>

                      <div className="col-span-2 text-right">
                        <span className="font-bold font-headline text-on-surface">
                          €{monatlichenBetrag(abo.betrag, abo.turnus).toFixed(2)}
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end gap-2">
                        <button
                          onClick={() => onEditAbo(abo)}
                          className="p-2 hover:bg-surface-bright rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                          aria-label="Bearbeiten"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteAbo(abo)}
                          className="p-2 hover:bg-surface-bright rounded-lg text-on-surface-variant hover:text-error transition-colors"
                          aria-label="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination footer */}
            <div className="bg-surface-container-low px-8 py-4 flex items-center justify-between border-t border-outline-variant/10">
              <p className="text-xs text-on-surface-variant">
                {abonnements.length === 0
                  ? "Keine Einträge"
                  : `Zeige ${Math.min((currentPage - 1) * PAGE_SIZE + 1, abonnements.length)}–${Math.min(currentPage * PAGE_SIZE, abonnements.length)} von ${abonnements.length}`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30"
                  aria-label="Vorherige Seite"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant disabled:opacity-30"
                  aria-label="Nächste Seite"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer encryption badge */}
      <div className="mt-auto flex justify-center pb-4">
        <div className="bg-surface-container-low px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl border border-outline-variant/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Ende-zu-Ende verschlüsselt
            </span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20" />
          <div className="flex items-center gap-2">
            <Database className="text-secondary w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Nur lokal gespeichert
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}