/**
 * AITipps.tsx — KlasseBon
 *
 * PATTERN: createTRPCProxyClient (NOT React Query hooks).
 * All API calls are imperative awaits inside event handlers.
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

const LAST_AI_TIP_STORAGE_KEY = "klassebon:last-ai-tip";
const LAST_AI_TIPPS_STATE_STORAGE_KEY = "klassebon:last-ai-tipps-state";

type StoredAiTippsState = {
  monat: number;
  jahr: number;
  tippsRaw: string;
  generatedAt: string;
  gesamtkosten: number;
  highestCategory: string;
};

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
 * Handles formats: "1. tip", "**1. tip**", inline numbers after preamble text.
 */
function parseTipps(raw: string): string[] {
  // Normalize: move **N. inline markers onto their own line, strip remaining **
  const normalized = raw.replace(/\*\*(\d+\.)/g, "\n$1").replace(/\*\*/g, "");

  return normalized
    .split(/\n(?=\d+\.)/)
    .filter((s) => /^\d+\./.test(s))
    .map((s) => s.replace(/^\d+\.\s*/, "").trim())
    .filter((s) => s.length > 10);
}

function readStoredAiTippsState(): StoredAiTippsState | null {
  try {
    const raw = localStorage.getItem(LAST_AI_TIPPS_STATE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredAiTippsState>;
    if (
      typeof parsed.monat !== "number" ||
      typeof parsed.jahr !== "number" ||
      typeof parsed.tippsRaw !== "string" ||
      typeof parsed.generatedAt !== "string" ||
      typeof parsed.gesamtkosten !== "number" ||
      typeof parsed.highestCategory !== "string"
    ) {
      return null;
    }

    return parsed as StoredAiTippsState;
  } catch {
    return null;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AITipps() {
  const now = new Date();
  const [storedTippsState] = useState(() => readStoredAiTippsState());
  const [monat, setMonat] = useState(storedTippsState?.monat ?? now.getMonth() + 1);
  const [jahr, setJahr] = useState(storedTippsState?.jahr ?? now.getFullYear());

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tip content
  const [tippsRaw, setTippsRaw] = useState<string | null>(storedTippsState?.tippsRaw ?? null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(
    storedTippsState ? new Date(storedTippsState.generatedAt) : null,
  );

  // Stat card values
  const [gesamtkosten, setGesamtkosten] = useState<number | null>(storedTippsState?.gesamtkosten ?? null);
  const [highestCategory, setHighestCategory] = useState<string>(storedTippsState?.highestCategory ?? "—");

  const clearGeneratedTippsState = () => {
    setError(null);
    setTippsRaw(null);
    setLastGenerated(null);
    setGesamtkosten(null);
    setHighestCategory("—");
    localStorage.removeItem(LAST_AI_TIPPS_STATE_STORAGE_KEY);
  };

  // ── Month navigation ──────────────────────────────────────────────
  const handlePrevMonth = () => {
    clearGeneratedTippsState();

    if (monat === 1) {
      setMonat(12);
      setJahr((y) => y - 1);
    } else {
      setMonat((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    clearGeneratedTippsState();

    if (monat === 12) {
      setMonat(1);
      setJahr((y) => y + 1);
    } else {
      setMonat((m) => m + 1);
    }
  };

  // ── Generate tips ─────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // both calls run in parallel
      const [tipsResult, kategorienResult] = await Promise.all([
        trpcClient.spartipps.generiere.query({ monat, jahr }),
        trpcClient.monatskosten.nachKategorie.query({ monat, jahr }),
      ]);

      // use kontext.gesamt labelled as "Gesamtausgaben"
      setGesamtkosten(tipsResult.kontext.gesamt);
      setTippsRaw(tipsResult.spartipps);
      const generatedAt = new Date();
      const [firstTip] = parseTipps(tipsResult.spartipps);
      if (firstTip) {
        localStorage.setItem(
          LAST_AI_TIP_STORAGE_KEY,
          JSON.stringify({
            tip: firstTip,
            generatedAt: generatedAt.toISOString(),
            monat,
            jahr,
          }),
        );
        window.dispatchEvent(new Event("klassebon:last-ai-tip-updated"));
      }
      setLastGenerated(generatedAt);

      // filter zeros, check empty before reduce
      const nonZero = kategorienResult.filter((k: { kategorie: string; betrag: number }) => k.betrag > 0);
      let nextHighestCategory = "—";
      if (nonZero.length === 0) {
        setHighestCategory("—");
      } else {
        const highest = nonZero.reduce((prev: { kategorie: string; betrag: number }, curr: { kategorie: string; betrag: number }) => (curr.betrag > prev.betrag ? curr : prev));
        nextHighestCategory = highest.kategorie;
        setHighestCategory(nextHighestCategory);
      }

      localStorage.setItem(
        LAST_AI_TIPPS_STATE_STORAGE_KEY,
        JSON.stringify({
          monat,
          jahr,
          tippsRaw: tipsResult.spartipps,
          generatedAt: generatedAt.toISOString(),
          gesamtkosten: tipsResult.kontext.gesamt,
          highestCategory: nextHighestCategory,
        }),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Fehler beim Generieren der Spartipps. Ist Ollama gestartet?");
    } finally {
      setIsGenerating(false);
    }
  };

  const parsedTipps = tippsRaw ? parseTipps(tippsRaw) : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="px-4 pb-8 pt-4 sm:px-6 lg:px-12 lg:pb-12">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 lg:mb-12 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">AI Tipps</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">
              Lokale Verarbeitung
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* month picker with arrows */}
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
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-container to-primary px-5 py-2.5 font-bold text-on-primary transition-all emerald-glow hover:brightness-110 active:scale-95 disabled:opacity-50 sm:px-6"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generiere…" : "Neue Tipps generieren"}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:mb-12 lg:gap-6">
          {/* "Gesamtausgaben" not "Sparpotenzial" */}
          <div className="group flex flex-col justify-between rounded-2xl bg-surface-container-low p-5 transition-colors duration-300 hover:bg-surface-container sm:p-6 lg:p-8">
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
              <p className="font-label text-sm text-on-surface-variant mb-1">Gesamtausgaben</p>
              <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface transition-colors group-hover:text-primary sm:text-4xl">
                {gesamtkosten !== null ? `€${gesamtkosten.toFixed(2)}` : "—"}
              </h3>
            </div>
          </div>

          {/* Highest category */}
          <div className="group flex flex-col justify-between rounded-2xl bg-surface-container-low p-5 transition-colors duration-300 hover:bg-surface-container sm:p-6 lg:p-8">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-tertiary-container/20 text-tertiary rounded-2xl">
                <LayoutGrid className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">Höchste Kategorie</p>
              <h3 className="font-headline text-3xl font-extrabold tracking-tighter text-on-surface sm:text-4xl">
                {highestCategory}
              </h3>
            </div>
          </div>

          {/* Last generated */}
          <div className="group flex flex-col justify-between rounded-2xl bg-surface-container-low p-5 transition-colors duration-300 hover:bg-surface-container sm:p-6 lg:p-8">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-outline-variant/20 text-on-surface-variant rounded-2xl">
                <History className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">Letztes Update</p>
              <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">
                {lastGenerated ? lastGenerated.toLocaleDateString("de-DE") : "—"}
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
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
              <div>
                <h4 className="font-headline font-bold text-3xl tracking-tighter mb-2">Personalisierte Spartipps</h4>
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
                    className="group flex flex-col gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 shadow-sm transition-all hover:bg-surface-container sm:flex-row sm:items-start sm:gap-8 sm:p-6"
                  >
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
                      <Icon className={`w-8 h-8 ${iconColors[index % iconColors.length]}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-headline font-bold text-xl text-on-surface">Tipp {index + 1}</h5>
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
            <h4 className="font-headline font-bold text-2xl text-on-surface mb-2">Noch keine Tipps generiert</h4>
            <p className="text-on-surface-variant max-w-sm leading-relaxed">
              Wähle einen Monat und klicke auf „Neue Tipps generieren&quot;. Ollama muss lokal laufen.
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
