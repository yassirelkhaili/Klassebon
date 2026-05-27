import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, CreditCard, ShieldCheck, Trash2 } from "lucide-react";
import type { Abonement, Expense } from "../../types";

type Kategorie = "Streaming" | "Lebensmittel" | "Versicherung" | "Transport" | "Sonstiges";
type Turnus = "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH";

export type AboFormValues = {
  name: string;
  betrag: number;
  turnus: Turnus;
  startDatum: string;
  naechsteFaelligkeit: string;
  kategorie?: Kategorie;
  beschreibung?: string;
  aktiv?: boolean;
};

interface NewAboModalProps {
  onClose: () => void;
  onSave: (abo: AboFormValues) => void | Promise<void>;
  initialData?: Abonement | null;
  isSaving?: boolean;
}

const categories: Kategorie[] = ["Streaming", "Lebensmittel", "Versicherung", "Transport", "Sonstiges"];

const toDateInput = (value?: string | null) => {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

export function NewAboModal({ onClose, onSave, initialData, isSaving = false }: NewAboModalProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [betrag, setBetrag] = useState(initialData ? String(initialData.betrag) : "");
  const [turnus, setTurnus] = useState<Turnus>(initialData?.turnus ?? "MONATLICH");
  const [kategorie, setKategorie] = useState<Kategorie>((initialData?.kategorie as Kategorie) ?? "Streaming");
  const [startDatum, setStartDatum] = useState(toDateInput(initialData?.startDatum));
  const [naechsteFaelligkeit, setNaechsteFaelligkeit] = useState(toDateInput(initialData?.naechsteFaelligkeit));
  const [beschreibung, setBeschreibung] = useState(initialData?.beschreibung ?? "");
  const [aktiv, setAktiv] = useState(initialData?.aktiv ?? true);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({
      name: name.trim(),
      betrag: Number(betrag),
      turnus,
      startDatum: new Date(`${startDatum}T00:00:00.000Z`).toISOString(),
      naechsteFaelligkeit: new Date(`${naechsteFaelligkeit}T00:00:00.000Z`).toISOString(),
      kategorie,
      beschreibung: beschreibung.trim() || undefined,
      aktiv,
    });
  };

  return (
    <form className="space-y-6 px-10 pb-8" onSubmit={handleSubmit}>
      <div>
        <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
          Subscription Name
        </label>
        <div className="relative">
          <input
            required
            className="w-full rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
            placeholder="z.B. Netflix"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <CreditCard className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/30" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
            Price
          </label>
          <div className="relative">
            <input
              required
              min="0.01"
              step="0.01"
              className="w-full rounded-xl border-none bg-surface-container py-4 pl-16 pr-5 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
              placeholder="0.00"
              type="number"
              value={betrag}
              onChange={(event) => setBetrag(event.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-primary">EUR</div>
          </div>
        </div>

        <div>
          <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
            Billing Interval
          </label>
          <div className="relative">
            <select
              className="w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
              value={turnus}
              onChange={(event) => setTurnus(event.target.value as Turnus)}
            >
              <option value="WOECHENTLICH">Woechentlich</option>
              <option value="MONATLICH">Monatlich</option>
              <option value="JAEHRLICH">Jaehrlich</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/30" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
            Startdatum
          </label>
          <input
            required
            className="w-full rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
            type="date"
            value={startDatum}
            onChange={(event) => setStartDatum(event.target.value)}
          />
        </div>
        <div>
          <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
            Naechste Faelligkeit
          </label>
          <input
            required
            className="w-full rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
            type="date"
            value={naechsteFaelligkeit}
            onChange={(event) => setNaechsteFaelligkeit(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="font-label mb-2.5 ml-1 block text-[11px] font-bold uppercase tracking-[0.15em] text-on-surface-variant/60">
          Category
        </label>
        <div className="relative">
          <select
            className="w-full cursor-pointer appearance-none rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
            value={kategorie}
            onChange={(event) => setKategorie(event.target.value as Kategorie)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant/30" />
        </div>
      </div>

      <textarea
        className="w-full resize-none rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
        placeholder="Beschreibung"
        rows={3}
        value={beschreibung}
        onChange={(event) => setBeschreibung(event.target.value)}
      />

      {initialData ? (
        <label className="flex items-center gap-3 text-sm font-semibold text-on-surface">
          <input
            type="checkbox"
            checked={aktiv}
            onChange={(event) => setAktiv(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Aktiv
        </label>
      ) : null}

      <div className="flex items-start gap-4 rounded-xl border border-primary/10 bg-primary/5 p-5">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
        <p className="text-xs leading-relaxed text-on-secondary-container/80">
          This subscription is stored through your protected tRPC backend session.
        </p>
      </div>

      <div className="flex items-center justify-end gap-6 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="font-label text-sm font-bold tracking-wide text-on-surface-variant/70 transition-colors hover:text-on-surface"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2.5 rounded-2xl bg-primary px-10 py-4 font-extrabold text-on-primary transition-all hover:brightness-105 active:scale-95 disabled:opacity-60"
        >
          <span>{isSaving ? "Saving..." : "Save Abo"}</span>
          <CheckCircle2 className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}

interface DeleteConfirmModalProps {
  type: "expense" | "abo" | "logout";
  item?: Expense | Abonement | null;
  onClose: () => void;
  onConfirm: () => void;
  isWorking?: boolean;
}

export function DeleteConfirmModal({ type, item, onClose, onConfirm, isWorking = false }: DeleteConfirmModalProps) {
  const isLogout = type === "logout";
  const title = isLogout ? "Log Out" : type === "expense" ? "Delete Expense" : "Delete Abonement";
  const description = isLogout
    ? "Are you sure you want to log out of KlasseBon?"
    : `Are you sure you want to delete this ${type === "expense" ? "expense" : "subscription"}? This action cannot be undone.`;
  const itemName = item && "titel" in item ? item.titel : item?.name;
  const itemAmount = item && "betrag" in item ? item.betrag : null;

  return (
    <div className="w-full">
      <div className="p-6 text-center">
        <div
          className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${
            isLogout ? "bg-secondary-container/20 text-primary" : "bg-error-container/20 text-error"
          }`}
        >
          {isLogout ? <AlertCircle className="h-6 w-6" /> : <Trash2 className="h-6 w-6" />}
        </div>
        <h2 className={`font-headline mb-2 text-xl font-bold tracking-tight ${isLogout ? "text-primary" : "text-on-surface"}`}>
          {title}
        </h2>
        <p className="px-2 text-sm leading-relaxed text-on-surface-variant">{description}</p>
      </div>

      {!isLogout && item ? (
        <div className="mx-6 mb-6 flex items-center justify-between rounded-xl bg-surface-container p-4">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-highest">
              <CreditCard className="h-5 w-5 text-on-surface" />
            </div>
            <div>
              <p className="font-label text-xs font-semibold uppercase tracking-wider text-on-surface">
                {itemName}
              </p>
              {itemAmount !== null ? (
                <p className="font-label text-[10px] text-on-surface-variant">EUR {itemAmount.toFixed(2)}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex border-t border-outline-variant/10">
        <button
          onClick={onClose}
          disabled={isWorking}
          className="flex-1 py-4 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-bright disabled:opacity-60"
        >
          Cancel
        </button>
        <div className="w-px self-stretch bg-outline-variant/10" />
        <button
          onClick={onConfirm}
          disabled={isWorking}
          className={`flex-1 py-4 text-sm font-bold transition-colors disabled:opacity-60 ${
            isLogout ? "text-primary hover:bg-primary/10" : "text-error hover:bg-error-container/10"
          }`}
        >
          {isWorking ? "Working..." : isLogout ? "Log Out" : "Delete"}
        </button>
      </div>
    </div>
  );
}
