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

export interface Expense {
   id: string;
   name: string;
   category: string;
   date: string;
   amount: number;
}

export interface Abonement {
   id: string;
   name: string;
   category: string;
   interval: string;
   price: number;
}
