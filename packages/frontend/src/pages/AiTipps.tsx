/**
 * AITipps.tsx — KlasseBon
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All API calls are imperative awaits inside event handlers.
 *
 * FIX #3: nachKategorie is fetched on button click (parallel with spartipps.generiere).
 *         Array is filtered for betrag > 0 BEFORE calling reduce.
 *         If filtered array is empty: highestCategory = "—"
 * FIX #4: Pattern documentation comment at top of file.
 * FIX #8: First stat card is labelled "Gesamtausgaben" and shows kontext.gesamt
 *         (not "Sparpotenzial" — that data is not returned by the backend).
 * FIX #9: Month picker uses ChevronLeft / ChevronRight arrow buttons.
 */

import { useState } from "react";
import {
  Wallet,
  LayoutGrid,
  History,
  Film,
  Utensils,
  Bus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { trpcClient } from "../lib/trpc";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatMonthLabel(monat: number, jahr: number): string {
  return new Date(jahr, monat - 1).toLocaleString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

/** Map tip index → icon so the rendered cards stay visually distinct */
function getTipIcon(index: number) {
  const icons = [Film, Utensils, Bus];
  return icons[index % icons.length];
}

/**
 * Parse the raw numbered-list string from Ollama into individual tip strings.
 * Expects format: "1. tip one\n2. tip two\n3. tip three"
 */
function parseTipps(raw: string): string[] {
  return raw
    .split(/\n(?=\d+\.)/)
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AITipps() {
  const now = new Date();
  const [monat, setMonat] = useState(now.getMonth() + 1);
  const [jahr,  setJahr]  = useState(now.getFullYear());

  const [isGenerating,    setIsGenerating]    = useState(false);
  const [error,           setError]           = useState<string | null>(null);

  // Tip content
  const [tippsRaw,        setTippsRaw]        = useState<string | null>(null);
  const [lastGenerated,   setLastGenerated]   = useState<Date | null>(null);

  // Stat card values
  const [gesamtkosten,    setGesamtkosten]    = useState<number | null>(null);
  const [highestCategory, setHighestCategory] = useState<string>("—");

  // ── FIX #9: Month navigation ──────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (monat === 1) { setMonat(12); setJahr((y) => y - 1); }
    else             { setMonat((m) => m - 1); }
  };

  const handleNextMonth = () => {
    if (monat === 12) { setMonat(1); setJahr((y) => y + 1); }
    else              { setMonat((m) => m + 1); }
  };

  // ── Generate tips ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // FIX #3 — both calls run in parallel
      const [tipsResult, kategorienResult] = await Promise.all([
        trpcClient.spartipps.generiere.query({ monat, jahr }),
        trpcClient.monatskosten.nachKategorie.query({ monat, jahr }),
      ]);

      // FIX #8 — use kontext.gesamt labelled as "Gesamtausgaben"
      setGesamtkosten(tipsResult.kontext.gesamt);
      setTippsRaw(tipsResult.spartipps);
      setLastGenerated(new Date());

      // FIX #3 — filter zeros, check empty before reduce
      const nonZero = kategorienResult.filter((k: any) => k.betrag > 0);
      if (nonZero.length === 0) {
        setHighestCategory("—");
      } else {
        const highest = nonZero.reduce((prev: any, curr: any) =>
          curr.betrag > prev.betrag ? curr : prev
        );
        setHighestCategory(highest.kategorie);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Fehler beim Generieren der Spartipps. Ist Ollama gestartet?"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const parsedTipps = tippsRaw ? parseTipps(tippsRaw) : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-12 pb-12">

      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">
            AI Tipps
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">
              Lokale Verarbeitung
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* FIX #9 — month picker with arrows */}
          <div className="flex items-center gap-2 bg-surface-container rounded-lg border border-outline-variant/10 px-3 py-2">
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

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-lg emerald-glow transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generiere…" : "Neue Tipps generieren"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">

        {/* Stat cards */}
        <div className="grid grid-cols-12 gap-6 mb-12">

          {/* FIX #8 — "Gesamtausgaben" not "Sparpotenzial" */}
          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-primary-container/20 text-primary rounded-2xl">
                <Wallet className="w-6 h-6" />
              </span>
              {gesamtkosten !== null && (
                <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md tracking-tighter uppercase">
                  Dieser Monat
                </span>
              )}
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">
                Gesamtausgaben
              </p>
              <h3 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface group-hover:text-primary transition-colors">
                {gesamtkosten !== null ? `€${gesamtkosten.toFixed(2)}` : "—"}
              </h3>
            </div>
          </div>

          {/* Highest category */}
          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-tertiary-container/20 text-tertiary rounded-2xl">
                <LayoutGrid className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">
                Höchste Kategorie
              </p>
              <h3 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface">
                {highestCategory}
              </h3>
            </div>
          </div>

          {/* Last generated */}
          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-outline-variant/20 text-on-surface-variant rounded-2xl">
                <History className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">
                Letztes Update
              </p>
              <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                {lastGenerated
                  ? lastGenerated.toLocaleDateString("de-DE")
                  : "—"}
              </h3>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-error-container/20 border border-error/30 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            <p className="text-sm text-on-surface">{error}</p>
          </div>
        )}

        {/* Tips section — only shown after successful generation */}
        {parsedTipps.length > 0 && (
          <>
            <div className="flex items-end justify-between mb-8">
              <div>
                <h4 className="font-headline font-bold text-3xl tracking-tighter mb-2">
                  Personalisierte Spartipps
                </h4>
                <p className="text-on-surface-variant">
                  Unsere lokale KI hat deine Ausgaben analysiert und folgende Tipps für dich.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {parsedTipps.map((tip, index) => {
                const Icon = getTipIcon(index);
                const tagLabels = ["Optimierung", "Verhalten", "Kluge Wahl"];
                const tagColors = [
                  "bg-tertiary/10 text-tertiary",
                  "bg-primary/10 text-primary",
                  "bg-secondary-container text-secondary",
                ];
                const iconColors = ["text-tertiary", "text-primary", "text-secondary"];

                return (
                  <div
                    key={index}
                    className="flex items-start gap-8 bg-surface-container-low p-6 rounded-[1.5rem] hover:bg-surface-container transition-all group border border-outline-variant/10 shadow-sm"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
                      <Icon className={`w-8 h-8 ${iconColors[index % iconColors.length]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-headline font-bold text-xl text-on-surface">
                          Tipp {index + 1}
                        </h5>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            tagColors[index % tagColors.length]
                          }`}
                        >
                          {tagLabels[index % tagLabels.length]}
                        </span>
                      </div>
                      <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl group-hover:text-on-surface transition-colors">
                        {tip}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Empty state — before first generation */}
        {!isGenerating && parsedTipps.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-container/20 flex items-center justify-center mb-6">
              <RefreshCw className="w-10 h-10 text-primary" />
            </div>
            <h4 className="font-headline font-bold text-2xl text-on-surface mb-2">
              Noch keine Tipps generiert
            </h4>
            <p className="text-on-surface-variant max-w-sm leading-relaxed">
              Wähle einen Monat und klicke auf „Neue Tipps generieren". Ollama muss lokal laufen.
            </p>
          </div>
        )}

        {/* Loading state */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-on-surface-variant text-sm font-label tracking-widest uppercase">
              KI analysiert deine Ausgaben…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}