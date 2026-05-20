import { describe, test, expect } from "vitest";
import { z } from "zod";
import { kategorieSchema } from "../trpc/kategorien.js";

const ausgabeCreateSchema = z.object({
    titel: z.string().min(1),
    betrag: z.number().positive(),
    datum: z.string().datetime(),
    kategorie: kategorieSchema.optional(),
    beschreibung: z.string().optional(),
});

const abonnementCreateSchema = z.object({
    name: z.string().min(1),
    betrag: z.number().positive(),
    turnus: z.enum(["WOECHENTLICH", "MONATLICH", "JAEHRLICH"]),
    startDatum: z.string().datetime(),
    naechsteFaelligkeit: z.string().datetime(),
    kategorie: kategorieSchema.optional(),
    beschreibung: z.string().optional(),
});

describe("Ausgabe Schema", () => {
    test("akzeptiert gültige Ausgabe", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "REWE Einkauf",
                betrag: 54.30,
                datum: "2026-03-12T00:00:00Z",
                kategorie: "Lebensmittel",
            }),
        ).not.toThrow();
    });

    test("akzeptiert Ausgabe ohne optionale Felder", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "Schulausflug",
                betrag: 12.50,
                datum: "2026-03-20T00:00:00Z",
            }),
        ).not.toThrow();
    });

    test("lehnt leeren Titel ab", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "",
                betrag: 10,
                datum: "2026-03-20T00:00:00Z",
            }),
        ).toThrow();
    });

    test("lehnt negativen Betrag ab", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "Test",
                betrag: -5,
                datum: "2026-03-20T00:00:00Z",
            }),
        ).toThrow();
    });

    test("lehnt ungültiges Datum ab", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "Test",
                betrag: 10,
                datum: "kein-datum",
            }),
        ).toThrow();
    });

    test("lehnt ungültige Kategorie ab", () => {
        expect(() =>
            ausgabeCreateSchema.parse({
                titel: "Test",
                betrag: 10,
                datum: "2026-03-20T00:00:00Z",
                kategorie: "Urlaub",
            }),
        ).toThrow();
    });
});

describe("Abonnement Schema", () => {
    const gueltigesAbo = {
        name: "Netflix",
        betrag: 12.99,
        turnus: "MONATLICH",
        startDatum: "2026-01-01T00:00:00Z",
        naechsteFaelligkeit: "2026-04-01T00:00:00Z",
        kategorie: "Streaming",
    };

    test("akzeptiert gültiges Abonnement", () => {
        expect(() => abonnementCreateSchema.parse(gueltigesAbo)).not.toThrow();
    });

    test("akzeptiert alle Turnus-Werte", () => {
        for (const turnus of ["WOECHENTLICH", "MONATLICH", "JAEHRLICH"]) {
            expect(() =>
                abonnementCreateSchema.parse({ ...gueltigesAbo, turnus }),
            ).not.toThrow();
        }
    });

    test("lehnt ungültigen Turnus ab", () => {
        expect(() =>
            abonnementCreateSchema.parse({ ...gueltigesAbo, turnus: "TAEGLICH" }),
        ).toThrow();
    });

    test("lehnt Betrag 0 ab", () => {
        expect(() =>
            abonnementCreateSchema.parse({ ...gueltigesAbo, betrag: 0 }),
        ).toThrow();
    });

    test("lehnt leeren Namen ab", () => {
        expect(() =>
            abonnementCreateSchema.parse({ ...gueltigesAbo, name: "" }),
        ).toThrow();
    });
});
