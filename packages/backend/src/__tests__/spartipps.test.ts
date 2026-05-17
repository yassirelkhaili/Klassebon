import { describe, test, expect } from "vitest";
import { bauePrompt } from "../trpc/routers/spartipps.js";

describe("bauePrompt", () => {
    const kategorien = [
        { kategorie: "Streaming", betrag: 39.47 },
        { kategorie: "Lebensmittel", betrag: 54.30 },
    ];

    const abonnements = [
        { name: "Netflix", betrag: 12.99, turnus: "MONATLICH" },
        { name: "Amazon Prime", betrag: 89.99, turnus: "JAEHRLICH" },
    ];

    test("enthält die Gesamtkosten", () => {
        const prompt = bauePrompt(100, 50, kategorien, abonnements);
        expect(prompt).toContain("100.00€");
        expect(prompt).toContain("50.00€");
        expect(prompt).toContain("150.00€");
    });

    test("enthält die Kategorien", () => {
        const prompt = bauePrompt(100, 50, kategorien, abonnements);
        expect(prompt).toContain("Streaming");
        expect(prompt).toContain("Lebensmittel");
    });

    test("enthält die Abonnements", () => {
        const prompt = bauePrompt(100, 50, kategorien, abonnements);
        expect(prompt).toContain("Netflix");
        expect(prompt).toContain("Amazon Prime");
    });

    test("enthält den Fallback wenn keine Kategorien", () => {
        const prompt = bauePrompt(0, 0, [], []);
        expect(prompt).toContain("Keine Kategorien erfasst");
        expect(prompt).toContain("Keine Abonnements vorhanden");
    });
});
