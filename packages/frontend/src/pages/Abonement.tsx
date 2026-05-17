import React from 'react';
import { 
  PlusCircle, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  Database, 
  Filter, 
  Edit2, 
  Trash2, 
  PlayCircle, 
  Music, 
  Cloud, 
  Dumbbell 
} from 'lucide-react';
import { Abonement } from '../types';

interface AbonementsProps {
  onAddAbo: () => void;
  onEditAbo: (abo: Abonement) => void;
  onDeleteAbo: (abo: Abonement) => void;
}

export default function Abonements({ onAddAbo, onEditAbo, onDeleteAbo }: AbonementsProps) {
  const abonements: Abonement[] = [
    { id: '1', name: 'Netflix', category: 'Entertainment', interval: 'Monthly', price: 17.99 },
    { id: '2', name: 'Spotify', category: 'Audio', interval: 'Monthly', price: 10.99 },
    { id: '3', name: 'iCloud+', category: 'Cloud Storage', interval: 'Monthly', price: 9.99 },
    { id: '4', name: 'Fitness First', category: 'Lifestyle', interval: 'Monthly', price: 49.00 },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Netflix': return PlayCircle;
      case 'Spotify': return Music;
      case 'iCloud+': return Cloud;
      case 'Fitness First': return Dumbbell;
      default: return PlusCircle;
    }
  };

  return (
    <div className="px-12 pb-12">
      <header className="flex items-center justify-between mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Abonements</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">LOCAL-ONLY VAULT</span>
          </div>
        </div>
        <button 
          onClick={onAddAbo}
          className="bg-gradient-to-br from-primary-container to-primary text-on-primary px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
        >
          <PlusCircle className="w-5 h-5" />
          + New Abo
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            Monatliche Kosten
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-black font-headline text-primary tracking-tighter">€87,96</h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-on-surface-variant/60">Basierend auf 12 aktiven Verträgen</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-tertiary/10 transition-colors"></div>
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            Jährliche Kosten
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-black font-headline text-on-surface tracking-tighter">€1.055,52</h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-error font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +2.4% vs Vorjahr
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl relative overflow-hidden group border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aktive Abos
          </p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-4xl font-black font-headline text-on-surface tracking-tighter">12</h2>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-primary-container border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-primary-container">N</div>
              <div className="w-6 h-6 rounded-full bg-secondary-container border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-secondary-container">S</div>
              <div className="w-6 h-6 rounded-full bg-tertiary-container border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-on-tertiary-container">F</div>
            </div>
            <span className="text-xs text-on-surface-variant/60 ml-2">Alle im Blick</span>
          </div>
        </div>
      </div>

      <section className="flex flex-col flex-1 mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-bold font-headline text-on-surface">Deine Abonnements</h3>
          <div className="flex items-center gap-4">
            <div className="bg-surface-container-low border border-outline-variant/10 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
              <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
              <span className="text-xs font-semibold text-on-surface-variant">Sortieren nach: Preis</span>
            </div>
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/10">
          <div className="grid grid-cols-12 gap-4 px-8 py-5 bg-surface-container/50 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
            <div className="col-span-6">Name & Service</div>
            <div className="col-span-3 text-right">Preis / Monat</div>
            <div className="col-span-3 text-right">Aktionen</div>
          </div>
          <div className="divide-y divide-outline-variant/5">
            {abonements.map((abo) => {
              const Icon = getIcon(abo.name);
              return (
                <div key={abo.id} className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-surface-container transition-colors items-center group">
                  <div className="col-span-6 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${abo.name === 'Netflix' ? 'text-error' : abo.name === 'Spotify' ? 'text-primary' : 'text-secondary'}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{abo.name}</h4>
                      <p className="text-xs text-on-surface-variant">{abo.category} • {abo.interval}</p>
                    </div>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-bold font-headline text-on-surface">€{abo.price.toFixed(2)}</span>
                  </div>
                  <div className="col-span-3 flex justify-end gap-3">
                    <button 
                      onClick={() => onEditAbo(abo)}
                      className="p-2 hover:bg-surface-bright rounded-lg text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDeleteAbo(abo)}
                      className="p-2 hover:bg-surface-bright rounded-lg text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-surface-container-low px-8 py-4 flex items-center justify-between border-t border-outline-variant/10">
            <p className="text-xs text-on-surface-variant italic">Kündigungserinnerungen sind für alle Abos aktiviert.</p>
            <button className="text-xs font-bold text-primary hover:underline transition-all">Alle anzeigen (12)</button>
          </div>
        </div>
      </section>

      <div className="mt-auto flex justify-center pb-4">
        <div className="bg-surface-container-low px-6 py-3 rounded-2xl flex items-center gap-4 shadow-xl border border-outline-variant/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary w-4.5 h-4.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">End-to-End Encryption Active</span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20"></div>
          <div className="flex items-center gap-2">
            <Database className="text-secondary w-4.5 h-4.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Stored on Device Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
