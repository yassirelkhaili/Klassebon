import { describe, it, expect } from "vitest";
import { extractAmount, extractCategory } from "./ocr.js";

// ─── extractAmount ───────────────────────────────────────

describe("extractAmount", () => {
  it("extracts amount after 'Gesamt'", () => {
    expect(extractAmount("Gesamt: 12,99")).toBe(12.99);
  });

  it("extracts amount after 'TOTAL'", () => {
    expect(extractAmount("TOTAL  45.50 EUR")).toBe(45.5);
  });

  it("extracts amount after 'Summe:'", () => {
    expect(extractAmount("Summe: 7,50")).toBe(7.5);
  });

  it("extracts amount after 'Zu zahlen'", () => {
    expect(extractAmount("Zu zahlen 23,00")).toBe(23.0);
  });

  it("extracts amount after 'Endbetrag'", () => {
    expect(extractAmount("Endbetrag 99,99")).toBe(99.99);
  });

  it("extracts EUR-prefixed amount", () => {
    expect(extractAmount("EUR 15,00")).toBe(15.0);
  });

  it("extracts €-prefixed amount", () => {
    expect(extractAmount("€ 8,50")).toBe(8.5);
  });

  it("extracts amount followed by EUR", () => {
    expect(extractAmount("33,33 EUR")).toBe(33.33);
  });

  it("extracts amount followed by €", () => {
    expect(extractAmount("22,22 €")).toBe(22.22);
  });

  it("falls back to largest number when no keyword found", () => {
    const text = "Milch 1,99\nBrot 3,49\nKäse 5,99";
    expect(extractAmount(text)).toBe(5.99);
  });

  it("handles dot as decimal separator", () => {
    expect(extractAmount("Total 19.99")).toBe(19.99);
  });

  it("returns null for text without amounts", () => {
    expect(extractAmount("No numbers here")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractAmount("")).toBeNull();
  });
});

// ─── extractCategory ─────────────────────────────────────

describe("extractCategory", () => {
  it("detects LEBENSMITTEL from store names", () => {
    expect(extractCategory("REWE Markt")).toBe("LEBENSMITTEL");
    expect(extractCategory("ALDI SÜD")).toBe("LEBENSMITTEL");
    expect(extractCategory("Edeka Neukauf")).toBe("LEBENSMITTEL");
    expect(extractCategory("Lidl Filiale")).toBe("LEBENSMITTEL");
  });

  it("detects STREAMING from service names", () => {
    expect(extractCategory("Netflix Abo")).toBe("STREAMING");
    expect(extractCategory("Spotify Premium")).toBe("STREAMING");
  });

  it("detects VERSICHERUNG from keywords", () => {
    expect(extractCategory("Allianz Versicherung")).toBe("VERSICHERUNG");
    expect(extractCategory("Haftpflicht")).toBe("VERSICHERUNG");
  });

  it("detects TRANSPORT from keywords", () => {
    expect(extractCategory("Aral Tankstelle")).toBe("TRANSPORT");
    expect(extractCategory("Deutsche Bahn Ticket")).toBe("TRANSPORT");
  });

  it("detects WOHNUNG from keywords", () => {
    expect(extractCategory("Stadtwerke Strom")).toBe("WOHNUNG");
    expect(extractCategory("Miete Januar")).toBe("WOHNUNG");
  });

  it("detects GESUNDHEIT from keywords", () => {
    expect(extractCategory("Apotheke am Markt")).toBe("GESUNDHEIT");
    expect(extractCategory("Zahnarzt Praxis")).toBe("GESUNDHEIT");
  });

  it("detects FREIZEIT from keywords", () => {
    expect(extractCategory("Kino CineStar")).toBe("FREIZEIT");
    expect(extractCategory("Restaurant Da Luigi")).toBe("FREIZEIT");
  });

  it("detects BILDUNG from keywords", () => {
    expect(extractCategory("Thalia Buchhandlung")).toBe("BILDUNG");
    expect(extractCategory("Udemy Kurs")).toBe("BILDUNG");
  });

  it("returns SONSTIGES for unrecognised text", () => {
    expect(extractCategory("Random unknown merchant 12345")).toBe("SONSTIGES");
  });

  it("is case-insensitive", () => {
    expect(extractCategory("NETFLIX")).toBe("STREAMING");
    expect(extractCategory("netflix")).toBe("STREAMING");
    expect(extractCategory("NeTfLiX")).toBe("STREAMING");
  });

  it("returns SONSTIGES for empty string", () => {
    expect(extractCategory("")).toBe("SONSTIGES");
  });
});
