import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Scan, ShieldCheck, ArrowRight, X, FileText, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import type { ExpenseFormValues } from "./AddExpense";

interface ScanReceiptModalProps {
  onClose: () => void;
  onStartScan: () => void;
  onFileSelected?: (file: File) => void;
}

export function ScanReceiptModal({ onClose, onStartScan, onFileSelected }: ScanReceiptModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (onFileSelected) {
      onFileSelected(file);
    } else {
      onStartScan();
    }

    event.target.value = "";
  };

  return (
    <div className="px-5 pb-5 sm:px-6 sm:pb-6">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <div className="mt-2 group">
        <div
          onClick={openFilePicker}
          className="relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/50 p-7 text-center transition-all hover:border-primary/50 group-hover:bg-surface-container-lowest sm:p-9"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-transform group-hover:scale-110">
            <Scan className="h-7 w-7 text-primary" />
          </div>
          <p className="mb-2 text-base font-medium text-on-surface sm:text-lg">
            Upload or scan a receipt to automatically extract expense details
          </p>
          <p className="mb-5 text-sm text-on-surface-variant">Supported formats: JPG, PNG, WEBP</p>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
            className="flex items-center gap-2 text-primary font-medium hover:underline transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Browse files</span>
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-xl border border-secondary-container/20 bg-secondary-container/10 p-4">
        <ShieldCheck className="text-primary w-4 h-4 mt-0.5" />
        <div className="text-xs text-on-secondary-container leading-relaxed">
          <span className="font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Privacy Priority</span>
          Local-only OCR processing for maximum privacy. Your financial data never leaves this device for extraction
          purposes.
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={onClose}
          className="rounded-full px-6 py-2.5 font-semibold text-on-surface-variant transition-all hover:bg-surface-container-highest hover:text-on-surface"
        >
          Cancel
        </button>
        <button
          onClick={openFilePicker}
          className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary-container to-primary px-8 py-2.5 font-bold text-on-primary bloom-shadow transition-all hover:scale-105 active:scale-95"
        >
          <span>Start Scan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center sm:p-10">
      <div className="relative mb-6 h-20 w-20">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Scan className="text-primary w-8 h-8" />
        </div>
      </div>
      <h3 className="mb-2 text-xl font-bold text-on-surface sm:text-2xl">Analyzing Receipt</h3>
      <p className="text-on-surface-variant max-w-xs">
        Our local AI is extracting merchant, date, and amount details from your image.
      </p>

      <div className="mt-6 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-0"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150"></div>
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-300"></div>
      </div>
    </div>
  );
}

interface PostScanModalProps {
  onClose: () => void;
  onRescan: () => void;
  onSave: (values: ExpenseFormValues) => void;
  draft?: ExpenseFormValues | null;
}

type Kategorie = NonNullable<ExpenseFormValues["kategorie"]>;

const postScanCategories: Kategorie[] = ["Lebensmittel", "Transport", "Versicherung", "Streaming", "Sonstiges"];

const toDateInput = (value?: string | null) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

export function PostScanModal({ onClose, onRescan, onSave, draft }: PostScanModalProps) {
  const [titel, setTitel] = useState(draft?.titel ?? "Gescanntes Receipt");
  const [kategorie, setKategorie] = useState<Kategorie>(draft?.kategorie ?? "Sonstiges");
  const [datum, setDatum] = useState(toDateInput(draft?.datum));
  const [betrag, setBetrag] = useState(String(draft?.betrag ?? ""));
  const [beschreibung, setBeschreibung] = useState(draft?.beschreibung ?? "");

  useEffect(() => {
    if (!draft) return;
    setTitel(draft.titel);
    setKategorie(draft.kategorie ?? "Sonstiges");
    setDatum(toDateInput(draft.datum));
    setBetrag(String(draft.betrag));
    setBeschreibung(draft.beschreibung ?? "");
  }, [draft]);

  const handleSave = () => {
    onSave({
      titel: titel.trim() || "Gescanntes Receipt",
      betrag: Number(betrag.replace(",", ".")) || 1,
      datum: new Date(`${datum}T00:00:00.000Z`).toISOString(),
      kategorie,
      beschreibung: beschreibung.trim() || undefined,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="border-b border-white/5 px-5 pt-5 pb-4 sm:px-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
            <h2 className="font-headline text-xl font-bold tracking-tight text-on-surface">Add Expense</h2>
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">
              <CheckCircle2 className="w-3.5 h-3.5 fill-primary/20" />
              Receipt scanned successfully
            </span>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-on-surface-variant font-body">Review the extracted receipt details before saving</p>
      </div>

      <div className="space-y-4 px-5 py-5 sm:px-6">
        <div className="space-y-2 group">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">
              Expense Name
            </label>
            <span className="text-[10px] font-medium text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OCR Auto-filled
            </span>
          </div>
          <input
            className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary transition-all font-medium"
            type="text"
            value={titel}
            onChange={(event) => setTitel(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Category</label>
              <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> OCR
              </span>
            </div>
            <select
              className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium"
              value={kategorie}
              onChange={(event) => setKategorie(event.target.value as Kategorie)}
            >
              {postScanCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Date</label>
              <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> OCR
              </span>
            </div>
            <input
              className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary font-medium"
              type="date"
              value={datum}
              onChange={(event) => setDatum(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Amount</label>
            <span className="text-[10px] font-medium text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OCR
            </span>
          </div>
          <div className="relative">
            <span className="font-headline absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-on-surface">
              €
            </span>
            <input
              className="w-full bg-surface-container-highest border-0 rounded-lg pl-10 pr-4 py-4 text-on-surface focus:ring-2 focus:ring-primary font-headline text-2xl font-bold tracking-tight"
              inputMode="decimal"
              pattern="[0-9]*[.,]?[0-9]*"
              type="text"
              value={betrag}
              onChange={(event) => setBetrag(event.target.value)}
            />
          </div>
        </div>

        <textarea
          className="w-full resize-none rounded-lg border-0 bg-surface-container-highest px-4 py-3 text-sm text-on-surface transition-all focus:ring-2 focus:ring-primary"
          rows={3}
          value={beschreibung}
          onChange={(event) => setBeschreibung(event.target.value)}
        />

        <div className="p-3 rounded-lg bg-secondary-container/10 flex items-center gap-3">
          <ShieldCheck className="text-secondary w-5 h-5 fill-secondary/20" />
          <p className="text-[11px] text-on-secondary-container leading-tight">
            Processed on-device. This receipt data has not been transmitted to any external servers.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/5 bg-surface-container px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <button
          onClick={onRescan}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Rescan Receipt
        </button>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-primary-container to-primary px-8 py-2.5 rounded-full text-on-primary font-bold text-sm shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}
