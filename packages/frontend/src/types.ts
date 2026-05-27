export type View =
  | "login"
  | "register"
  | "reset-password"
  | "forgot-password"
  | "dashboard"
  | "expenses"
  | "abonement"
  | "abonements"
  | "ai-tips";

export type ModalType =
  | "add-expense"
  | "scan-receipt"
  | "processing-receipt"
  | "post-scan-expense"
  | "new-abo"
  | "delete-expense"
  | "delete-abo"
  | "logout-confirm";

export interface Expense {
  id: string;
  titel: string;
  betrag: number;
  datum: string;
  kategorie?: string | null;
  beschreibung?: string | null;
  name?: string;
  category?: string;
  date?: string;
  amount?: number;
}

export interface Abonement {
  id: string;
  name: string;
  betrag: number;
  turnus: "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH";
  startDatum: string;
  naechsteFaelligkeit: string;
  kategorie?: string | null;
  beschreibung?: string | null;
  aktiv: boolean;
  category?: string;
  interval?: string;
  price?: number;
}
