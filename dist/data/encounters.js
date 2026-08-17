// Random travel encounters. At least one is a genuine "ignore or engage" choice, matching the
// original game's "a party approaches -- what is your action?" pattern (confirmed from direct
// gameplay footage) rather than a forced ambush every time.
export const ENCOUNTERS = [
    {
        id: "free-company-raiders",
        title: "Free Company Raiders",
        description: "A ragged band steps out from the tree line, blades already drawn. \"Toll's due, friend -- or we take it the hard way.\"",
        kind: "combat",
        engageLabel: "Fight them off",
        ignoreLabel: "Try to slip past",
        enemyMin: 8,
        enemyMax: 22,
        goldRewardMin: 30,
        goldRewardMax: 90,
    },
    {
        id: "concord-patrol",
        title: "Concord Patrol",
        description: "A Concord patrol flags your wagon down for inspection. If you're carrying Moonleaf, they'll notice.",
        kind: "inspection",
        engageLabel: "Let them search",
        ignoreLabel: "Bribe them to move on",
        enemyMin: 10,
        enemyMax: 18,
        goldRewardMin: 0,
        goldRewardMax: 0,
    },
    {
        id: "traveling-merchant",
        title: "Traveling Merchant",
        description: "A fellow trader hails you on the road, keen to swap notes on prices a few towns over.",
        kind: "peaceful",
        engageLabel: "Trade tips",
        ignoreLabel: "Wave and continue",
        enemyMin: 0,
        enemyMax: 0,
        goldRewardMin: 10,
        goldRewardMax: 35,
    },
];
export function rollEncounter() {
    return ENCOUNTERS[Math.floor(Math.random() * ENCOUNTERS.length)];
}
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//# sourceMappingURL=encounters.js.map