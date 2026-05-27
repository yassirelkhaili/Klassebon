import { useEffect, useMemo, useState } from "react";
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
  Dumbbell,
} from "lucide-react";
import type { Abonement } from "../types";
import { trpcClient } from "../lib/trpc.ts";

interface AbonementsProps {
  onAddAbo: () => void;
  onEditAbo: (abo: Abonement) => void;
  onDeleteAbo: (abo: Abonement) => void;
}

const mapTurnusLabel = (turnus?: string) => {
  switch (turnus) {
    case "WOECHENTLICH":
      return "Weekly";
    case "MONATLICH":
      return "Monthly";
    case "JAEHRLICH":
      return "Yearly";
    default:
      return turnus ?? "";
  }
};

const getIcon = (name: string) => {
  switch (name) {
    case "Netflix":
      return PlayCircle;
    case "Spotify":
      return Music;
    case "iCloud+":
      return Cloud;
    case "Fitness First":
      return Dumbbell;
    default:
      return PlusCircle;
  }
};

export default function Abonements({ onAddAbo, onEditAbo, onDeleteAbo }: AbonementsProps) {
  const [abonements, setAbonements] = useState<Abonement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await trpcClient.abonnements.list.query({ nurAktive: false });
      setAbonements(data as Abonement[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const active = abonements.filter((a) => a.aktiv !== false);
    const monthly = active.reduce((sum, a) => {
      const amount = Number(a.betrag ?? a.price ?? 0);
      const turnus = a.turnus ?? (a.interval === "Monthly" ? "MONATLICH" : "");
      return sum + (turnus === "MONATLICH" ? amount : 0);
    }, 0);

    const yearly = active.reduce((sum, a) => {
      const amount = Number(a.betrag ?? a.price ?? 0);
      const turnus = a.turnus ?? (a.interval === "Monthly" ? "MONATLICH" : "");
      if (turnus === "MONATLICH") return sum + amount * 12;
      if (turnus === "JAEHRLICH") return sum + amount;
      if (turnus === "WOECHENTLICH") return sum + amount * 52;
      return sum;
    }, 0);

    return { activeCount: active.length, monthly, yearly };
  }, [abonements]);

  if (loading) {
    return <div className="px-4 pb-8 pt-4 text-on-surface-variant sm:px-6 lg:px-12 lg:pb-12">Loading...</div>;
  }

  return (
    <div className="px-4 pb-8 pt-4 sm:px-6 lg:px-12 lg:pb-12">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:mb-12">
        <div className="space-y-1">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface sm:text-4xl">
            Abonements
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            <span className="text-xs font-medium text-on-surface-variant tracking-wider uppercase">
              LOCAL-ONLY VAULT
            </span>
          </div>
        </div>
        <button
          onClick={onAddAbo}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-container to-primary px-5 py-2.5 font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 sm:px-6"
        >
          <PlusCircle className="w-5 h-5" />+ New Abo
        </button>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:mb-12 lg:gap-6">
        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 sm:p-6 lg:p-8">
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5" />
            Monatliche Kosten
          </p>
          <h2 className="font-headline text-3xl font-black tracking-tighter text-primary sm:text-4xl">
            €{stats.monthly.toFixed(2)}
          </h2>
          <span className="text-xs text-on-surface-variant/60">
            Basierend auf {stats.activeCount} aktiven Verträgen
          </span>
        </div>

        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 sm:p-6 lg:p-8">
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <TrendingUp className="w-3.5 h-3.5" />
            Jährliche Kosten
          </p>
          <h2 className="font-headline text-3xl font-black tracking-tighter text-on-surface sm:text-4xl">
            €{stats.yearly.toFixed(2)}
          </h2>
        </div>

        <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-5 sm:p-6 lg:p-8">
          <p className="text-on-surface-variant font-medium mb-4 text-xs flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck className="w-3.5 h-3.5" />
            Aktive Abos
          </p>
          <h2 className="font-headline text-3xl font-black tracking-tighter text-on-surface sm:text-4xl">
            {stats.activeCount}
          </h2>
        </div>
      </div>

      <section className="flex flex-col flex-1 mb-12">
        <div className="flex items-center justify-between mb-6 px-2">
          <h3 className="text-xl font-bold font-headline text-on-surface">Deine Abonnements</h3>
          <div className="bg-surface-container-low border border-outline-variant/10 px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-surface-container transition-colors">
            <Filter className="w-3.5 h-3.5 text-on-surface-variant" />
            <span className="text-xs font-semibold text-on-surface-variant">Sortieren nach: Preis</span>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low shadow-2xl">
          <div className="hidden grid-cols-12 gap-4 border-b border-outline-variant/10 bg-surface-container/50 px-8 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant lg:grid">
            <div className="col-span-6">Name & Service</div>
            <div className="col-span-3 text-right">Preis / Monat</div>
            <div className="col-span-3 text-right">Aktionen</div>
          </div>

          <div className="divide-y divide-outline-variant/5">
            {abonements.map((abo) => {
              const Icon = getIcon(abo.name);
              const price = Number(abo.betrag ?? abo.price ?? 0);
              const interval = mapTurnusLabel(abo.turnus ?? abo.interval);

              return (
                <div
                  key={abo.id}
                  className="group grid grid-cols-1 gap-4 px-5 py-5 transition-colors hover:bg-surface-container sm:grid-cols-[1fr_auto] sm:items-center lg:grid-cols-12 lg:px-8 lg:py-6"
                >
                  <div className="flex items-center gap-4 lg:col-span-6">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-on-surface">{abo.name}</h4>
                      <p className="text-xs text-on-surface-variant">
                        {abo.kategorie ?? abo.category ?? "Uncategorized"} • {interval}
                      </p>
                    </div>
                  </div>

                  <div className="sm:text-right lg:col-span-3">
                    <span className="font-bold font-headline text-on-surface">€{price.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-end gap-3 sm:col-start-2 sm:row-span-2 sm:row-start-1 lg:col-span-3 lg:col-start-auto lg:row-auto">
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
        </div>
      </section>

      <div className="mt-auto flex justify-center pb-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-outline-variant/10 bg-surface-container-low px-5 py-3 text-center shadow-xl sm:flex-row sm:gap-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-primary w-4.5 h-4.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              End-to-End Encryption Active
            </span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant/20"></div>
          <div className="flex items-center gap-2">
            <Database className="text-secondary w-4.5 h-4.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Stored on Device Only
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
