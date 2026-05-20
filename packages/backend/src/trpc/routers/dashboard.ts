import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";
import { KATEGORIEN } from "../kategorien.js";
import { berechneMonatlichenBetrag } from "../../lib/berechnungen.js";


export const dashboardRouter = router({
    /**
     * Gibt alle Dashboard-Daten in einem einzigen Request zurück.
     * Vermeidet mehrere separate API-Calls vom Frontend.
     *
     * Gibt zurück:
     * - monatskosten:          Gesamtsumme des Monats (ausgaben + abos + gesamt)
     * - nachKategorie:         Kosten pro Kategorie (für Balkendiagramm)
     * - naechsteFaelligkeiten: Abos die in den nächsten 30 Tagen fällig sind
     * - letzteAusgaben:        Die 5 neuesten Ausgaben
     *
     * Testen mit: http://localhost:3000/api/trpc/dashboard.uebersicht?batch=1&input={"0":{"monat":3,"jahr":2026}}
     * Method: GET
     * Headers: Authorization: Bearer <token>
     */
    uebersicht: protectedProcedure
        .input(
            z.object({
                monat: z.number().int().min(1).max(12),
                jahr:  z.number().int().min(2000).max(2100),
            }),
        )
        .query(async ({ ctx, input }) => {
            const { monat, jahr } = input;
            const von = new Date(jahr, monat - 1, 1);
            const bis = new Date(jahr, monat, 1);

            // Alle Daten parallel laden
            const [ausgaben, abonnements, letzteAusgaben] = await Promise.all([
                ctx.prisma.ausgabe.findMany({
                    where: { userId: ctx.user.id, datum: { gte: von, lt: bis } },
                }),
                ctx.prisma.abonnement.findMany({
                    where: { userId: ctx.user.id, aktiv: true },
                }),
                ctx.prisma.ausgabe.findMany({
                    where: { userId: ctx.user.id },
                    orderBy: { datum: "desc" },
                    take: 5,
                }),
            ]);

            const ausgabenSumme = ausgaben.reduce((s, a) => s + a.betrag, 0);
            const abonnementsSumme = abonnements.reduce(
                (s, a) => s + berechneMonatlichenBetrag(a.betrag, a.turnus),
                0,
            );

            // Kosten nach Kategorie aufschlüsseln
            const summen: Record<string, number> = Object.fromEntries(
                KATEGORIEN.map((k) => [k, 0]),
            );
            for (const ausgabe of ausgaben) {
                const kat = ausgabe.kategorie ?? "Sonstiges";
                summen[kat] = (summen[kat] ?? 0) + ausgabe.betrag;
            }
            for (const abo of abonnements) {
                const kat = abo.kategorie ?? "Sonstiges";
                summen[kat] = (summen[kat] ?? 0) + berechneMonatlichenBetrag(abo.betrag, abo.turnus);
            }

            // Abos die in den nächsten 30 Tagen fällig sind
            const heute = new Date();
            const in30Tagen = new Date();
            in30Tagen.setDate(heute.getDate() + 30);
            const naechsteFaelligkeiten = abonnements
                .filter((a) => a.naechsteFaelligkeit >= heute && a.naechsteFaelligkeit <= in30Tagen)
                .sort((a, b) => a.naechsteFaelligkeit.getTime() - b.naechsteFaelligkeit.getTime());

            return {
                monatskosten: {
                    monat,
                    jahr,
                    ausgabenSumme:    Math.round(ausgabenSumme * 100) / 100,
                    abonnementsSumme: Math.round(abonnementsSumme * 100) / 100,
                    gesamt:           Math.round((ausgabenSumme + abonnementsSumme) * 100) / 100,
                },
                nachKategorie: KATEGORIEN.map((kategorie) => ({
                    kategorie,
                    betrag: Math.round((summen[kategorie] ?? 0) * 100) / 100,
                })),
                naechsteFaelligkeiten,
                letzteAusgaben,
            };
        }),
});
