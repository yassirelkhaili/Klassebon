import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";
import { KATEGORIEN } from "../kategorien.js";

/**
 * Rechnet den Abo-Betrag auf einen monatlichen Betrag um.
 *
 * WOECHENTLICH: 52 Wochen / 12 Monate = ~4.33x pro Monat
 * MONATLICH:    direkt übernehmen
 * JAEHRLICH:    geteilt durch 12 Monate
 */
function berechneMonatlichenBetrag(betrag: number, turnus: "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH"): number {
    switch (turnus) {
        case "WOECHENTLICH":
            return betrag * (52 / 12);
        case "MONATLICH":
            return betrag;
        case "JAEHRLICH":
            return betrag / 12;
    }
}

export const monatskostenRouter = router({
    /**
     * Berechnet die Gesamtkosten für einen bestimmten Monat.
     *
     * Gibt zurück:
     * - ausgabenSumme:      Summe aller Einzelausgaben im angegebenen Monat
     * - abonnementsSumme:   Summe aller aktiven Abos (umgerechnet auf monatlich)
     * - gesamt:             ausgabenSumme + abonnementsSumme
     *
     * Testen mit: http://localhost:3000/api/trpc/monatskosten.berechne?batch=1&input={"0":{"monat":3,"jahr":2026}}
     * Method: GET
     * Headers: Authorization: Bearer <token>
     */
    berechne: protectedProcedure
        .input(
            z.object({
                monat: z.number().int().min(1).max(12),
                jahr: z.number().int().min(2000).max(2100),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { monat, jahr } = input;

            // Anfang und Ende des angefragten Monats
            const von = new Date(jahr, monat - 1, 1);
            const bis = new Date(jahr, monat, 1);

            // Alle Einzelausgaben des Users im angegebenen Monat
            const ausgaben = await ctx.prisma.ausgabe.findMany({
                where: {
                    userId: ctx.user.id,
                    datum: { gte: von, lt: bis },
                },
            });

            const ausgabenSumme = ausgaben.reduce((sum, a) => sum + a.betrag, 0);

            // Alle aktiven Abonnements des Users
            const abonnements = await ctx.prisma.abonnement.findMany({
                where: {
                    userId: ctx.user.id,
                    aktiv: true,
                },
            });

            const abonnementsSumme = abonnements.reduce(
                (sum, abo) => sum + berechneMonatlichenBetrag(abo.betrag, abo.turnus),
                0,
            );

            return {
                monat,
                jahr,
                ausgabenSumme: Math.round(ausgabenSumme * 100) / 100,
                abonnementsSumme: Math.round(abonnementsSumme * 100) / 100,
                gesamt: Math.round((ausgabenSumme + abonnementsSumme) * 100) / 100,
            };
        }),

    /**
     * Aufschlüsselung der Monatskosten nach Kategorie (für Dashboard-Balkendiagramm).
     * Ausgaben ohne Kategorie werden automatisch als "Sonstiges" gezählt.
     *
     * Testen mit: http://localhost:3000/api/trpc/monatskosten.nachKategorie?batch=1&input={"0":{"monat":3,"jahr":2026}}
     * Method: GET
     * Headers: Authorization: Bearer <token>
     */
    nachKategorie: protectedProcedure
        .input(
            z.object({
                monat: z.number().int().min(1).max(12),
                jahr: z.number().int().min(2000).max(2100),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { monat, jahr } = input;
            const von = new Date(jahr, monat - 1, 1);
            const bis = new Date(jahr, monat, 1);

            const ausgaben = await ctx.prisma.ausgabe.findMany({
                where: { userId: ctx.user.id, datum: { gte: von, lt: bis } },
            });

            const abonnements = await ctx.prisma.abonnement.findMany({
                where: { userId: ctx.user.id, aktiv: true },
            });

            // Kosten pro Kategorie aufsummieren
            const summen: Record<string, number> = Object.fromEntries(
                KATEGORIEN.map((k) => [k, 0]),
            );

            for (const a of ausgaben) {
                const kat = a.kategorie ?? "Sonstiges";
                summen[kat] = (summen[kat] ?? 0) + a.betrag;
            }

            for (const abo of abonnements) {
                const kat = abo.kategorie ?? "Sonstiges";
                const monatlich = berechneMonatlichenBetrag(abo.betrag, abo.turnus);
                summen[kat] = (summen[kat] ?? 0) + monatlich;
            }

            return KATEGORIEN.map((kategorie) => ({
                kategorie,
                betrag: Math.round((summen[kategorie] ?? 0) * 100) / 100,
            }));
        }),
});
