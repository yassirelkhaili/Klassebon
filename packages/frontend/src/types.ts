export type View = 'login' | 'register' | 'forgot-password' | 'dashboard' | 'expenses' | 'abonements' | 'ai-tips';

export type ModalType = 
  | 'add-expense' 
  | 'scan-receipt' 
  | 'processing-receipt' 
  | 'post-scan-expense' 
  | 'new-abo' 
  | 'delete-expense' 
  | 'delete-abo' 
  | 'logout-confirm';

/** Expense — matches backend Ausgabe model */
export interface Expense {
  id: string;
  titel: string;
  betrag: number;
  datum: string; // ISO datetime
  kategorie: string; // "Streaming" | "Lebensmittel" | "Versicherung" | "Transport" | "Sonstiges"
  beschreibung?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

/** Abonnement — matches backend model */
export interface Abonement {
  id: string;
  name: string;
  betrag: number;
  turnus: "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH";
  startDatum: string; // ISO datetime
  naechsteFaelligkeit: string; // ISO datetime
  kategorie: string;
  beschreibung?: string;
  aktiv: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}