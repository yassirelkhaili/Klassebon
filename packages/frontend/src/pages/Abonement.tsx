import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Cloud,
  Dumbbell,
  Edit2,
  Filter,
  Loader2,
  Music,
  PlayCircle,
  PlusCircle,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import { trpcClient } from "../lib/trpc";

type Turnus = "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH";
type Kategorie = "Streaming" | "Lebensmittel" | "Versicherung" | "Transport" | "Sonstiges";

type Abonnement = {
  id: string;
  name: string;
  betrag: number;
  turnus: Turnus;
  startDatum: string | Date;
  naechsteFaelligkeit: string | Date;
  kategorie?: Kategorie | null;
  beschreibung?: string | null;
  aktiv: boolean;
};

type AbonnementForm = {
  name: string;
  betrag: string;
  turnus: Turnus;
  startDatum: string;
  naechsteFaelligkeit: string;
  kategorie: "" | Kategorie;
  beschreibung: string;
  aktiv: boolean;
};

const kategorien: Array<"" | Kategorie> = [
  "",
  "Streaming",
  "Lebensmittel",
  "Versicherung",
  "Transport",
  "Sonstiges",
];

const turnusLabels: Record<Turnus, string> = {
  WOECHENTLICH: "Woechentlich",
  MONATLICH: "Monatlich",
  JAEHRLICH: "Jaehrlich",
};

const emptyForm: AbonnementForm = {
  name: "",
  betrag: "",
  turnus: "MONATLICH",
  startDatum: new Date().toISOString().slice(0, 10),
  naechsteFaelligkeit: new Date().toISOString().slice(0, 10),
  kategorie: "",
  beschreibung: "",
  aktiv: true,
};

const toDateInputValue = (value: string | Date) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }

  return date.toISOString().slice(0, 10);
};

const toApiDate = (value: string) => new Date(`${value}T00:00:00.000Z`).toISOString();

const formatDate = (value: string | Date) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);

const monthlyAmount = (abo: Abonnement) => {
  if (abo.turnus === "WOECHENTLICH") return (abo.betrag * 52) / 12;
  if (abo.turnus === "JAEHRLICH") return abo.betrag / 12;
  return abo.betrag;
};

const getIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes("netflix") || normalized.includes("disney")) return PlayCircle;
  if (normalized.includes("spotify") || normalized.includes("music")) return Music;
  if (normalized.includes("cloud") || normalized.includes("icloud")) return Cloud;
  if (normalized.includes("fitness") || normalized.includes("gym")) return Dumbbell;
  return PlusCircle;
};

const formFromAbo = (abo: Abonnement): AbonnementForm => ({
  name: abo.name,
  betrag: String(abo.betrag),
  turnus: abo.turnus,
  startDatum: toDateInputValue(abo.startDatum),
  naechsteFaelligkeit: toDateInputValue(abo.naechsteFaelligkeit),
  kategorie: abo.kategorie ?? "",
  beschreibung: abo.beschreibung ?? "",
  aktiv: abo.aktiv,
});

export default function Abonements() {
  const [abonements, setAbonements] = useState<Abonnement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyActive, setOnlyActive] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"" | Kategorie>("");
  const [editingAbo, setEditingAbo] = useState<Abonnement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Abonnement | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<AbonnementForm>(emptyForm);

  const loadAbonements = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await trpcClient.abonnements.list.query({
        nurAktive: onlyActive || undefined,
        kategorie: categoryFilter || undefined,
      });
      setAbonements(data as Abonnement[]);
    } catch {
      setError("Abonnements konnten nicht geladen werden. Bitte pruefe Login und Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAbonements();
  }, [onlyActive, categoryFilter]);

  const stats = useMemo(() => {
    const active = abonements.filter((abo) => abo.aktiv);
    const monthly = active.reduce((sum, abo) => sum + monthlyAmount(abo), 0);

    return {
      activeCount: active.length,
      monthly,
      yearly: monthly * 12,
    };
  }, [abonements]);

  const sortedAbonements = useMemo(
    () => [...abonements].sort((a, b) => monthlyAmount(b) - monthlyAmount(a)),
    [abonements],
  );

  const openCreateForm = () => {
    setEditingAbo(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEditForm = (abo: Abonnement) => {
    setEditingAbo(abo);
    setForm(formFromAbo(abo));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setEditingAbo(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      betrag: Number(form.betrag),
      turnus: form.turnus,
      startDatum: toApiDate(form.startDatum),
      naechsteFaelligkeit: toApiDate(form.naechsteFaelligkeit),
      kategorie: form.kategorie || undefined,
      beschreibung: form.beschreibung.trim() || undefined,
    };

    try {
      if (editingAbo) {
        await trpcClient.abonnements.update.mutate({
          id: editingAbo.id,
          ...payload,
          aktiv: form.aktiv,
        });
      } else {
        await trpcClient.abonnements.create.mutate(payload);
      }

      closeForm();
      await loadAbonements();
    } catch {
      setError("Speichern fehlgeschlagen. Bitte pruefe die Eingaben.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSaving(true);
    setError(null);

    try {
      await trpcClient.abonnements.delete.mutate({ id: deleteTarget.id });
      setDeleteTarget(null);
      await loadAbonements();
    } catch {
      setError("Abonnement konnte nicht geloescht werden.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-6 pb-12 md:px-12">
      <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface">
            Abonements
          </h1>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
              tRPC verbunden
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-br from-primary-container to-primary px-6 py-2.5 font-bold text-on-primary shadow-xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-5 w-5" />
          Neues Abo
        </button>
      </header>

      {error ? (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      ) : null}

      <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <SummaryCard
          icon={Calendar}
          label="Monatliche Kosten"
          value={formatCurrency(stats.monthly)}
          note={`Basierend auf ${stats.activeCount} aktiven Vertraegen`}
        />
        <SummaryCard
          icon={TrendingUp}
          label="Jaehrliche Kosten"
          value={formatCurrency(stats.yearly)}
          note="Auf monatliche Kosten hochgerechnet"
        />
        <SummaryCard
          icon={ShieldCheck}
          label="Aktive Abos"
          value={String(stats.activeCount)}
          note={`${abonements.length} Eintraege geladen`}
        />
      </div>

      <section className="mb-12 flex flex-col">
        <div className="mb-6 flex flex-col gap-4 px-2 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="font-headline text-xl font-bold text-on-surface">
            Deine Abonnements
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant">
              <Filter className="h-3.5 w-3.5" />
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value as "" | Kategorie)}
                className="bg-transparent outline-none"
              >
                {kategorien.map((kategorie) => (
                  <option key={kategorie || "all"} value={kategorie}>
                    {kategorie || "Alle Kategorien"}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg border border-outline-variant/10 bg-surface-container-low px-3 py-2 text-xs font-semibold text-on-surface-variant">
              <input
                type="checkbox"
                checked={onlyActive}
                onChange={(event) => setOnlyActive(event.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Nur aktive
            </label>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-outline-variant/10 bg-surface-container-low shadow-2xl">
          <div className="grid grid-cols-12 gap-4 border-b border-outline-variant/10 bg-surface-container/50 px-5 py-5 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant md:px-8">
            <div className="col-span-7 md:col-span-5">Name & Service</div>
            <div className="hidden text-right md:col-span-2 md:block">Turnus</div>
            <div className="hidden text-right md:col-span-2 md:block">Naechste Faelligkeit</div>
            <div className="col-span-3 text-right md:col-span-2">Preis / Monat</div>
            <div className="col-span-2 text-right md:col-span-1">Aktion</div>
          </div>

          <div className="divide-y divide-outline-variant/5">
            {loading ? (
              <div className="flex items-center gap-3 px-8 py-10 text-sm text-on-surface-variant">
                <Loader2 className="h-5 w-5 animate-spin" />
                Lade Abonnements...
              </div>
            ) : sortedAbonements.length === 0 ? (
              <div className="px-8 py-10 text-sm text-on-surface-variant">
                Keine Abonnements gefunden.
              </div>
            ) : (
              sortedAbonements.map((abo) => {
                const Icon = getIcon(abo.name);

                return (
                  <div
                    key={abo.id}
                    className="grid grid-cols-12 items-center gap-4 px-5 py-5 transition-colors hover:bg-surface-container md:px-8"
                  >
                    <div className="col-span-7 flex min-w-0 items-center gap-4 md:col-span-5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-highest">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-on-surface">{abo.name}</h3>
                        <p className="truncate text-xs text-on-surface-variant">
                          {abo.kategorie ?? "Sonstiges"}
                          {abo.aktiv ? "" : " - inaktiv"}
                        </p>
                      </div>
                    </div>

                    <div className="hidden text-right text-sm text-on-surface-variant md:col-span-2 md:block">
                      {turnusLabels[abo.turnus]}
                    </div>

                    <div className="hidden text-right text-sm text-on-surface-variant md:col-span-2 md:block">
                      {formatDate(abo.naechsteFaelligkeit)}
                    </div>

                    <div className="col-span-3 text-right md:col-span-2">
                      <span className="font-headline font-bold text-on-surface">
                        {formatCurrency(monthlyAmount(abo))}
                      </span>
                    </div>

                    <div className="col-span-2 flex justify-end gap-1 md:col-span-1">
                      <button
                        type="button"
                        onClick={() => openEditForm(abo)}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-primary"
                        aria-label={`${abo.name} bearbeiten`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(abo)}
                        className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-bright hover:text-error"
                        aria-label={`${abo.name} loeschen`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {isFormOpen ? (
        <AboFormModal
          form={form}
          isEditing={Boolean(editingAbo)}
          saving={saving}
          onClose={closeForm}
          onSubmit={handleSubmit}
          onFormChange={setForm}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteModal
          abo={deleteTarget}
          saving={saving}
          onClose={() => setDeleteTarget(null)}
          onDelete={handleDelete}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-8">
      <p className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-on-surface-variant">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <h2 className="font-headline text-4xl font-black tracking-tighter text-on-surface">
        {value}
      </h2>
      <span className="mt-3 block text-xs text-on-surface-variant/60">{note}</span>
    </div>
  );
}

function AboFormModal({
  form,
  isEditing,
  saving,
  onClose,
  onSubmit,
  onFormChange,
}: {
  form: AbonnementForm;
  isEditing: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (form: AbonnementForm) => void;
}) {
  const updateForm = <Key extends keyof AbonnementForm>(key: Key, value: AbonnementForm[Key]) => {
    onFormChange({ ...form, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-2xl rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              {isEditing ? "Abo bearbeiten" : "Neues Abo"}
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Daten werden direkt ueber tRPC gespeichert.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-bright"
            aria-label="Schliessen"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Name
            <input
              required
              value={form.name}
              onChange={(event) => updateForm("name", event.target.value)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Betrag
            <input
              required
              min="0.01"
              step="0.01"
              type="number"
              value={form.betrag}
              onChange={(event) => updateForm("betrag", event.target.value)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Turnus
            <select
              value={form.turnus}
              onChange={(event) => updateForm("turnus", event.target.value as Turnus)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              {Object.entries(turnusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Kategorie
            <select
              value={form.kategorie}
              onChange={(event) => updateForm("kategorie", event.target.value as "" | Kategorie)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            >
              {kategorien.map((kategorie) => (
                <option key={kategorie || "none"} value={kategorie}>
                  {kategorie || "Keine Kategorie"}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Startdatum
            <input
              required
              type="date"
              value={form.startDatum}
              onChange={(event) => updateForm("startDatum", event.target.value)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>

          <label className="space-y-2 text-sm font-semibold text-on-surface">
            Naechste Faelligkeit
            <input
              required
              type="date"
              value={form.naechsteFaelligkeit}
              onChange={(event) => updateForm("naechsteFaelligkeit", event.target.value)}
              className="w-full rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-2 text-sm font-semibold text-on-surface">
          Beschreibung
          <textarea
            rows={3}
            value={form.beschreibung}
            onChange={(event) => updateForm("beschreibung", event.target.value)}
            className="w-full resize-none rounded-lg border border-outline-variant/20 bg-surface-container px-4 py-3 text-on-surface outline-none focus:border-primary"
          />
        </label>

        {isEditing ? (
          <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-on-surface">
            <input
              type="checkbox"
              checked={form.aktiv}
              onChange={(event) => updateForm("aktiv", event.target.checked)}
              className="h-4 w-4 accent-primary"
            />
            Aktiv
          </label>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-outline-variant/20 px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteModal({
  abo,
  saving,
  onClose,
  onDelete,
}: {
  abo: Abonnement;
  saving: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl border border-outline-variant/10 bg-surface-container-low p-6 shadow-2xl">
        <h2 className="font-headline text-2xl font-bold text-on-surface">Abo loeschen?</h2>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">
          {abo.name} wird dauerhaft entfernt.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-outline-variant/20 px-5 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-error px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Loeschen
          </button>
        </div>
      </div>
    </div>
  );
}
