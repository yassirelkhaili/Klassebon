import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc.js";
import { ollama, OLLAMA_MODEL } from "../../lib/ollama.js";
import { berechneMonatlichenBetrag } from "../../lib/berechnungen.js";

export function bauePrompt(
    ausgabenSumme: number,
    abonnementsSumme: number,
    kategorien: { 
        kategorie: string; 
        betrag: number 
    }[],
    abonnements: { 
        name: string; 
        betrag: number; 
        turnus: string 
    }[],
): string {
    const kategorienText = kategorien
        .filter((k) => k.betrag > 0)
        .map((k) => `  - ${k.kategorie}: ${k.betrag.toFixed(2)}€`)
        .join("\n");

    const abonnementsText = abonnements
        .map((a) => `  - ${a.name}: ${a.betrag.toFixed(2)}€ (${a.turnus})`)
        .join("\n");

    return `Du bist ein freundlicher Finanzberater. Analysiere die folgenden Monatsausgaben eines Nutzers und gib 3 konkrete, personalisierte Spartipps auf Deutsch.

    Ausgaben dieses Monats: ${ausgabenSumme.toFixed(2)}€
    Laufende Abonnements (monatlich umgerechnet): ${abonnementsSumme.toFixed(2)}€
    Gesamtkosten: ${(ausgabenSumme + abonnementsSumme).toFixed(2)}€

    Ausgaben nach Kategorie:
    ${kategorienText || "  - Keine Kategorien erfasst"}

    Aktive Abonnements:
    ${abonnementsText || "  - Keine Abonnements vorhanden"}

    Gib genau 3 Spartipps. Jeder Tipp soll:
    - konkret auf die obigen Daten eingehen (z.B. Kategorien oder Abos nennen)
    - eine realistische Einsparung in Euro schätzen
    - freundlich und motivierend formuliert sein

    Format: Nummerierte Liste (1. 2. 3.)`;
}

export const spartippsRouter = router({
    /**
     * Generiert 3 personalisierte Spartipps via lokalem Ollama-LLM.
     * Ollama muss lokal laufen: https://ollama.com
     *
     * Testen mit: http://localhost:3000/api/trpc/spartipps.generiere?batch=1&input={"0":{"monat":3,"jahr":2026}}
     * Method: GET
     * Headers: Authorization: Bearer <token>
     */
    generiere: protectedProcedure
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

            // Ausgaben und Abonnements des Users laden
            const [ausgaben, abonnements] = await Promise.all([
                ctx.prisma.ausgabe.findMany({
                    // gte: >=
                    // lt:  <
                    where: { userId: ctx.user.id, datum: { gte: von, lt: bis } },
                }),
                ctx.prisma.abonnement.findMany({
                    where: { userId: ctx.user.id, aktiv: true },
                }),
            ]);

            const ausgabenSumme = ausgaben.reduce((s, a) => s + a.betrag, 0);
            const abonnementsSumme = abonnements.reduce(
                (s, a) => s + berechneMonatlichenBetrag(a.betrag, a.turnus),
                0,
            );

            // Kosten nach Kategorie aufschlüsseln
            const summen: Record<string, number> = {};
            for (const a of ausgaben) {
                const kat = a.kategorie ?? "Sonstiges";
                summen[kat] = (summen[kat] ?? 0) + a.betrag;
            }

            for (const abo of abonnements) {
                const kat = abo.kategorie ?? "Sonstiges";
                summen[kat] = (summen[kat] ?? 0) + berechneMonatlichenBetrag(abo.betrag, abo.turnus);
            }
            
            const kategorien = Object.entries(summen).map(([kategorie, betrag]) => ({
                kategorie,
                betrag: Math.round(betrag * 100) / 100,
            }));

            const prompt = bauePrompt(ausgabenSumme, abonnementsSumme, kategorien, abonnements);

            try {
                const response = await ollama.chat({
                    model: OLLAMA_MODEL,
                    messages: [{ role: "user", content: prompt }],
                });

                return {
                    spartipps: response.message.content,
                    monat,
                    jahr,
                    kontext: {
                        ausgabenSumme:     Math.round(ausgabenSumme * 100) / 100,
                        abonnementsSumme:  Math.round(abonnementsSumme * 100) / 100,
                        gesamt:            Math.round((ausgabenSumme + abonnementsSumme) * 100) / 100,
                    },
                };
            } catch {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "Ollama ist nicht erreichbar. Bitte sicherstellen, dass Ollama lokal läuft.",
                });
            }
        }),
});
