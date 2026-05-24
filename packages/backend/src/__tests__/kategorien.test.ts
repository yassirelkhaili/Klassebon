import { describe, test, expect } from "vitest";
import { kategorieSchema, KATEGORIEN } from "../trpc/kategorien.js";

describe("kategorieSchema", () => {
    test("akzeptiert alle gültigen Kategorien", () => {
        for (const kat of KATEGORIEN) {
            expect(() => kategorieSchema.parse(kat)).not.toThrow();
        }
    });

    test("lehnt ungültige Kategorie ab", () => {
        expect(() => kategorieSchema.parse("Urlaub")).toThrow();
        expect(() => kategorieSchema.parse("")).toThrow();
        expect(() => kategorieSchema.parse(123)).toThrow();
    });

    test("KATEGORIEN enthält genau 5 Einträge", () => {
        expect(KATEGORIEN).toHaveLength(5);
    });

    test("KATEGORIEN enthält Sonstiges", () => {
        expect(KATEGORIEN).toContain("Sonstiges");
    });
});
