export type Turnus = "WOECHENTLICH" | "MONATLICH" | "JAEHRLICH";

export function berechneMonatlichenBetrag(betrag: number, turnus: Turnus): number {
    switch (turnus) {
        case "WOECHENTLICH": return betrag * (52 / 12);
        case "MONATLICH":    return betrag;
        case "JAEHRLICH":    return betrag / 12;
    }
}
