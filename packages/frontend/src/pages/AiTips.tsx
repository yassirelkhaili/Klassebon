import React, { useState } from 'react';
import { 
  Wallet, 
  Calendar, 
  Sparkles, 
  TrendingDown, 
  LayoutGrid, 
  History, 
  Film, 
  Utensils, 
  Bus,
  RefreshCw,
  ChevronDown
} from 'lucide-react';

export default function AITipps() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="px-12 pb-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-headline text-on-surface">AI Tipps</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">Local-Only Processing</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10 text-sm font-medium hover:bg-surface-container-high transition-colors">
            <Calendar className="text-primary w-4.5 h-4.5" />
            <span>October 2024</span>
            <ChevronDown className="text-on-surface-variant w-4 h-4" />
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold rounded-lg emerald-glow transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Generating...' : 'New Tipps Generate'}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-primary-container/20 text-primary rounded-2xl">
                <Wallet className="w-6 h-6" />
              </span>
              <span className="text-[10px] font-bold text-primary px-2 py-1 bg-primary/10 rounded-md tracking-tighter uppercase">High Potential</span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">Sparpotenzial</p>
              <h3 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface group-hover:text-primary transition-colors">€124.50</h3>
            </div>
          </div>

          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-tertiary-container/20 text-tertiary rounded-2xl">
                <LayoutGrid className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">Höchste Kategorie</p>
              <h3 className="font-headline font-extrabold text-4xl tracking-tighter text-on-surface">Streaming</h3>
            </div>
          </div>

          <div className="col-span-4 bg-surface-container-low p-8 rounded-[2rem] flex flex-col justify-between group hover:bg-surface-container transition-colors duration-300">
            <div className="flex justify-between items-start mb-8">
              <span className="p-3 bg-outline-variant/20 text-on-surface-variant rounded-2xl">
                <History className="w-6 h-6" />
              </span>
            </div>
            <div>
              <p className="font-label text-sm text-on-surface-variant mb-1">Datum der letzten Generierung</p>
              <h3 className="font-headline font-extrabold text-2xl tracking-tight text-on-surface">Oct 15, 2024</h3>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <h4 className="font-headline font-bold text-3xl tracking-tighter mb-2">Personalized Insights</h4>
            <p className="text-on-surface-variant">Our local AI analyzed your spending patterns to identify sustainable saving opportunities.</p>
          </div>
          <div className="hidden lg:block h-px bg-outline-variant/20 flex-1 mx-8 mb-4"></div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-8 bg-surface-container-low p-6 rounded-[1.5rem] hover:bg-surface-container transition-all group border border-outline-variant/10 shadow-sm">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
              <Film className="text-tertiary w-8 h-8 fill-tertiary/20" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h5 className="font-headline font-bold text-xl text-on-surface">Streaming</h5>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-tertiary/10 text-tertiary rounded uppercase">Optimization</span>
              </div>
              <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl group-hover:text-on-surface transition-colors">
                You have 3 active video subscriptions. Consider cancelling the one you use the least to save <span className="text-primary font-bold">€17.99/month</span>.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-bright transition-colors">Dismiss</button>
              <button className="text-primary text-xs font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all">Details</button>
            </div>
          </div>

          <div className="flex items-start gap-8 bg-surface-container-low p-6 rounded-[1.5rem] hover:bg-surface-container transition-all group border border-outline-variant/10 shadow-sm">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
              <Utensils className="text-primary w-8 h-8 fill-primary/20" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h5 className="font-headline font-bold text-xl text-on-surface">Food</h5>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-primary/10 text-primary rounded uppercase">Behavioral</span>
              </div>
              <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl group-hover:text-on-surface transition-colors">
                Your grocery spending is <span className="text-error font-medium">15% higher</span> than last month. Shopping with a list could help reduce impulsive buys.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-bright transition-colors">Dismiss</button>
              <button className="text-primary text-xs font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all">Details</button>
            </div>
          </div>

          <div className="flex items-start gap-8 bg-surface-container-low p-6 rounded-[1.5rem] hover:bg-surface-container transition-all group border border-outline-variant/10 shadow-sm">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center border border-outline-variant/10">
              <Bus className="text-secondary w-8 h-8 fill-secondary/20" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h5 className="font-headline font-bold text-xl text-on-surface">Transport</h5>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary-container text-secondary rounded uppercase tracking-tighter">Smart Choice</span>
              </div>
              <p className="text-on-surface-variant font-body leading-relaxed max-w-2xl group-hover:text-on-surface transition-colors">
                Switching to a monthly public transit pass could save you approximately <span className="text-primary font-bold">€22.00</span> compared to individual tickets.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="bg-surface-container-highest px-4 py-2 rounded-xl text-sm font-bold text-on-surface hover:bg-surface-bright transition-colors">Dismiss</button>
              <button className="text-primary text-xs font-bold underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all">Details</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}