import React, { useRef } from 'react';
import { Scan, ShieldCheck, ArrowRight, X, FileText, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react';

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

   const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (onFileSelected) {
         onFileSelected(file);
      } else {
         onStartScan();
      }

      event.target.value = '';
   };

   return (
      <div className="px-8 pb-8">
         <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
         />
         <div className="mt-4 group">
            <div
               onClick={openFilePicker}
               className="relative border-2 border-dashed border-outline-variant/30 hover:border-primary/50 rounded-2xl p-12 transition-all bg-surface-container-lowest/50 group-hover:bg-surface-container-lowest flex flex-col items-center justify-center text-center cursor-pointer"
            >
               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                  <Scan className="text-primary w-8 h-8" />
               </div>
               <p className="font-medium text-lg mb-2 text-on-surface">Upload or scan a receipt to automatically extract expense details</p>
               <p className="text-on-surface-variant text-sm mb-6">Supported formats: JPG, PNG, WEBP</p>
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

         <div className="mt-6 flex items-start gap-3 p-4 bg-secondary-container/10 rounded-xl border border-secondary-container/20">
            <ShieldCheck className="text-primary w-4 h-4 mt-0.5" />
            <div className="text-xs text-on-secondary-container leading-relaxed">
               <span className="font-bold block mb-0.5 uppercase tracking-wider text-[10px]">Privacy Priority</span>
               Local-only OCR processing for maximum privacy. Your financial data never leaves this device for extraction purposes.
            </div>
         </div>

         <div className="pt-8 flex items-center justify-between">
            <button
               onClick={onClose}
               className="px-6 py-2.5 rounded-full font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
            >
               Cancel
            </button>
            <button
               onClick={openFilePicker}
               className="px-8 py-2.5 rounded-full font-bold bg-gradient-to-br from-primary-container to-primary text-on-primary flex items-center gap-2 bloom-shadow hover:scale-105 active:scale-95 transition-all"
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
      <div className="p-12 flex flex-col items-center justify-center text-center">
         <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
               <Scan className="text-primary w-8 h-8" />
            </div>
         </div>
         <h3 className="text-2xl font-bold text-on-surface mb-2">Analyzing Receipt</h3>
         <p className="text-on-surface-variant max-w-xs">Our local AI is extracting merchant, date, and amount details from your image.</p>

         <div className="mt-8 flex gap-2">
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
   onSave: () => void;
}

export function PostScanModal({ onClose, onRescan, onSave }: PostScanModalProps) {
   return (
      <div className="flex flex-col">
         <div className="px-8 pt-8 pb-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-3">
                  <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Add Expense</h2>
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

         <div className="px-8 py-8 space-y-6 overflow-y-auto max-h-[614px]">
            <div className="space-y-2 group">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Expense Name</label>
                  <span className="text-[10px] font-medium text-primary flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> OCR Auto-filled
                  </span>
               </div>
               <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary transition-all font-medium" type="text" defaultValue="Whole Foods" />
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Category</label>
                     <span className="text-[10px] font-medium text-primary flex items-center gap-1"><Sparkles className="w-3 h-3" /> OCR</span>
                  </div>
                  <select className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary appearance-none cursor-pointer font-medium">
                     <option selected>Food</option>
                     <option>Transportation</option>
                     <option>Utilities</option>
                     <option>Entertainment</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Date</label>
                     <span className="text-[10px] font-medium text-primary flex items-center gap-1"><Sparkles className="w-3 h-3" /> OCR</span>
                  </div>
                  <input className="w-full bg-surface-container-highest border-0 rounded-lg px-4 py-3.5 text-on-surface focus:ring-2 focus:ring-primary font-medium" type="text" defaultValue="Oct 15, 2024" />
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-on-surface-variant tracking-wider uppercase">Amount</label>
                  <span className="text-[10px] font-medium text-primary flex items-center gap-1"><Sparkles className="w-3 h-3" /> OCR</span>
               </div>
               <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline font-bold text-on-surface text-lg">€</span>
                  <input className="w-full bg-surface-container-highest border-0 rounded-lg pl-10 pr-4 py-4 text-on-surface focus:ring-2 focus:ring-primary font-headline text-2xl font-bold tracking-tight" type="text" defaultValue="42.80" />
               </div>
            </div>

            <div className="p-3 rounded-lg bg-secondary-container/10 flex items-center gap-3">
               <ShieldCheck className="text-secondary w-5 h-5 fill-secondary/20" />
               <p className="text-[11px] text-on-secondary-container leading-tight">
                  Processed on-device. This receipt data has not been transmitted to any external servers.
               </p>
            </div>
         </div>

         <div className="px-8 py-6 bg-surface-container border-t border-white/5 flex items-center justify-between">
            <button
               onClick={onRescan}
               className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm"
            >
               <RefreshCw className="w-4 h-4" />
               Rescan Receipt
            </button>
            <div className="flex items-center gap-4">
               <button onClick={onClose} className="px-6 py-2.5 text-on-surface-variant hover:text-on-surface transition-colors font-semibold text-sm">
                  Cancel
               </button>
               <button
                  onClick={onSave}
                  className="bg-gradient-to-r from-primary-container to-primary px-8 py-2.5 rounded-full text-on-primary font-bold text-sm shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-[0.98] transition-all"
               >
                  Save Expense
               </button>
            </div>
         </div>
      </div>
   );
}
