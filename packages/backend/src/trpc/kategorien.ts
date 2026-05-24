import { z } from "zod";

/**
 * Vordefinierte Kategorien laut Projektantrag (TA3.3).
 * Wird in ausgaben.ts, abonnements.ts und monatskosten.ts wiederverwendet.
 */
export const kategorieSchema = z.enum([
    "Streaming",
    "Lebensmittel",
    "Versicherung",
    "Transport",
    "Sonstiges",
]);

export type Kategorie = z.infer<typeof kategorieSchema>;

export const KATEGORIEN = kategorieSchema.options;
