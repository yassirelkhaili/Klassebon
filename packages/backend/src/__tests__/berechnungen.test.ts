import { describe, test, expect } from "vitest";
import { berechneMonatlichenBetrag } from "../lib/berechnungen.js";

describe("berechneMonatlichenBetrag", () => {
    test("MONATLICH gibt den Betrag direkt zurück", () => {
        expect(berechneMonatlichenBetrag(12.99, "MONATLICH")).toBe(12.99);
    });

    test("JAEHRLICH teilt durch 12", () => {
        expect(berechneMonatlichenBetrag(120, "JAEHRLICH")).toBe(10);
    });

    test("WOECHENTLICH multipliziert mit 52/12", () => {
        const ergebnis = berechneMonatlichenBetrag(10, "WOECHENTLICH");
        expect(ergebnis).toBeCloseTo(43.33, 1);
    });

    test("Betrag 0 ergibt immer 0", () => {
        expect(berechneMonatlichenBetrag(0, "MONATLICH")).toBe(0);
        expect(berechneMonatlichenBetrag(0, "JAEHRLICH")).toBe(0);
        expect(berechneMonatlichenBetrag(0, "WOECHENTLICH")).toBe(0);
    });
});
