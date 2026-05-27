import { FormEvent, useState } from "react";
import { Calendar, ChevronDown, Lock, Scan } from "lucide-react";
import type { Expense } from "../../types";

type Kategorie = "Streaming" | "Lebensmittel" | "Versicherung" | "Transport" | "Sonstiges";

export type ExpenseFormValues = {
   titel: string;
   betrag: number;
   datum: string;
   kategorie?: Kategorie;
   beschreibung?: string;
};

interface AddExpenseModalProps {
   onClose: () => void;
   onScan: () => void;
   onSave: (expense: ExpenseFormValues) => void | Promise<void>;
   initialData?: Expense | null;
   isSaving?: boolean;
}

const categories: Kategorie[] = ["Lebensmittel", "Transport", "Versicherung", "Streaming", "Sonstiges"];

const toDateInput = (value?: string | null) => {
   if (!value) return new Date().toISOString().slice(0, 10);
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? new Date().toISOString().slice(0, 10) : date.toISOString().slice(0, 10);
};

export default function AddExpenseModal({
   onClose,
   onScan,
   onSave,
   initialData,
   isSaving = false,
}: AddExpenseModalProps) {
   const [titel, setTitel] = useState(initialData?.titel ?? "");
   const [kategorie, setKategorie] = useState<Kategorie>((initialData?.kategorie as Kategorie) ?? "Lebensmittel");
   const [datum, setDatum] = useState(toDateInput(initialData?.datum));
   const [betrag, setBetrag] = useState(initialData ? String(initialData.betrag) : "");
   const [beschreibung, setBeschreibung] = useState(initialData?.beschreibung ?? "");

   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSave({
         titel: titel.trim(),
         betrag: Number(betrag),
         datum: new Date(`${datum}T00:00:00.000Z`).toISOString(),
         kategorie,
         beschreibung: beschreibung.trim() || undefined,
      });
   };

   return (
      <form className="space-y-6 px-8 pb-10" onSubmit={handleSubmit}>
         <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-primary">
               Expense Name
            </label>
            <input
               required
               className="w-full rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface placeholder:text-on-surface-variant/40 transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
               placeholder="z.B. Supermarkt"
               type="text"
               value={titel}
               onChange={(event) => setTitel(event.target.value)}
            />
         </div>

         <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
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
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
               </div>
            </div>

            <div className="space-y-2">
               <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Date
               </label>
               <div className="relative">
                  <input
                     required
                     className="w-full rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
                     type="date"
                     value={datum}
                     onChange={(event) => setDatum(event.target.value)}
                  />
                  <Calendar className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
               </div>
            </div>
         </div>

         <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
               Amount
            </label>
            <div className="relative">
               <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">EUR</div>
               <input
                  required
                  min="0.01"
                  step="0.01"
                  className="font-headline w-full rounded-xl border-none bg-surface-container py-6 pl-20 pr-5 text-4xl font-black text-on-surface placeholder:text-on-surface-variant/20 transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                  type="number"
                  value={betrag}
                  onChange={(event) => setBetrag(event.target.value)}
               />
            </div>
         </div>

         <div className="space-y-2">
            <label className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
               Beschreibung
            </label>
            <textarea
               className="w-full resize-none rounded-xl border-none bg-surface-container px-5 py-4 text-on-surface transition-all focus:bg-surface-bright focus:ring-1 focus:ring-primary"
               rows={3}
               value={beschreibung}
               onChange={(event) => setBeschreibung(event.target.value)}
            />
         </div>

         <div className="flex items-center justify-between pt-4">
            <button
               type="button"
               onClick={onScan}
               className="flex items-center gap-2 rounded-full bg-surface-container-highest px-5 py-3 text-sm font-bold text-primary transition-all hover:brightness-110 active:scale-95"
            >
               <Scan className="h-5 w-5" />
               Scan Receipt
            </button>
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full px-6 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:text-on-surface"
               >
                  Cancel
               </button>
               <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-gradient-to-br from-primary-container to-primary px-8 py-3 text-sm font-bold text-on-primary transition-all active:scale-95 disabled:opacity-60"
               >
                  {isSaving ? "Saving..." : "Save Expense"}
               </button>
            </div>
         </div>

         <div className="-mx-8 -mb-10 mt-6 flex items-center gap-2 bg-surface-container-lowest px-8 py-3">
            <Lock className="h-3.5 w-3.5 text-primary" />
            <span className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
               End-to-end local encryption active
            </span>
         </div>
      </form>
   );
}
