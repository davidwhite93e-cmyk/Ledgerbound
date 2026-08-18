// Tradeable goods. 5 ordinary goods + 1 contraband good, per the MVP prototype scope.
// NOTE: "Moonleaf" is used instead of a real-world drug name (e.g. "narcotics") on purpose --
// most mobile app stores flag literal drug references for a stricter age rating, so the
// contraband good in a shipping build should stay fictional. Swap the flavor text, not the mechanic.
export const GOODS = [
    { id: "grain", name: "Grain", basePrice: 6, contraband: false },
    { id: "cloth", name: "Cloth", basePrice: 14, contraband: false },
    { id: "iron", name: "Iron", basePrice: 28, contraband: false },
    { id: "timber", name: "Timber", basePrice: 20, contraband: false },
    { id: "spice", name: "Spice", basePrice: 55, contraband: false },
    { id: "moonleaf", name: "Moonleaf", basePrice: 140, contraband: true },
];
export function getGood(id) {
    const g = GOODS.find((good) => good.id === id);
    if (!g)
        throw new Error(`Unknown good: ${id}`);
    return g;
}
//# sourceMappingURL=goods.js.map