import { GOODS } from "./goods.js";
const GOODS_BASE_LOOKUP = GOODS.reduce((acc, g) => {
    acc[g.id] = g.basePrice;
    return acc;
}, {});
// 9 original city names -- none reused from the source game, per the plan's Stage 2/3 guidance.
export const CITIES = [
    {
        id: "millhaven",
        name: "Millhaven",
        x: 170, y: 560,
        connections: ["cragmoor", "saltmere"],
        population: 8200, technology: "Modest", climate: "Temperate Plains", crime: "Low",
        priceMultiplier: { grain: 0.8, cloth: 1.0, iron: 1.1, timber: 0.9, spice: 1.3, moonleaf: 1.2 },
    },
    {
        id: "cragmoor",
        name: "Cragmoor",
        x: 85, y: 460,
        connections: ["millhaven", "thistlewick", "ashfordcross"],
        population: 3100, technology: "Archaic", climate: "Rocky Highlands", crime: "None",
        priceMultiplier: { grain: 1.2, cloth: 1.1, iron: 0.7, timber: 1.0, spice: 1.6, moonleaf: 1.6 },
    },
    {
        id: "saltmere",
        name: "Saltmere",
        x: 260, y: 460,
        connections: ["millhaven", "thistlewick", "redbrook"],
        population: 12500, technology: "Advancing", climate: "Coastal", crime: "Low",
        priceMultiplier: { grain: 1.0, cloth: 0.8, iron: 1.2, timber: 1.3, spice: 0.9, moonleaf: 1.0 },
    },
    {
        id: "thistlewick",
        name: "Thistlewick",
        x: 170, y: 400,
        connections: ["cragmoor", "saltmere", "dunmoor"],
        population: 5400, technology: "Modest", climate: "Rolling Hills", crime: "None",
        priceMultiplier: { grain: 0.9, cloth: 1.0, iron: 1.0, timber: 0.85, spice: 1.2, moonleaf: 1.3 },
    },
    {
        id: "ashfordcross",
        name: "Ashford Cross",
        x: 65, y: 300,
        connections: ["cragmoor", "dunmoor", "fenwickhollow"],
        population: 18900, technology: "Advancing", climate: "River Valley", crime: "High",
        priceMultiplier: { grain: 1.1, cloth: 0.9, iron: 0.9, timber: 1.0, spice: 0.8, moonleaf: 0.75 },
    },
    {
        id: "redbrook",
        name: "Redbrook",
        x: 260, y: 300,
        connections: ["saltmere", "dunmoor", "ironvale"],
        population: 7600, technology: "Modest", climate: "Forest Edge", crime: "Low",
        priceMultiplier: { grain: 0.85, cloth: 1.2, iron: 1.1, timber: 0.7, spice: 1.1, moonleaf: 1.1 },
    },
    {
        id: "dunmoor",
        name: "Dunmoor",
        x: 170, y: 240,
        connections: ["thistlewick", "ashfordcross", "redbrook", "fenwickhollow", "ironvale"],
        population: 41000, technology: "Cutting-Edge", climate: "Crossroads", crime: "Very High",
        priceMultiplier: { grain: 1.3, cloth: 1.1, iron: 0.8, timber: 1.1, spice: 0.7, moonleaf: 0.6 },
    },
    {
        id: "fenwickhollow",
        name: "Fenwick Hollow",
        x: 95, y: 140,
        connections: ["ashfordcross", "dunmoor", "ironvale"],
        population: 2200, technology: "Archaic", climate: "Deep Woods", crime: "None",
        priceMultiplier: { grain: 1.15, cloth: 1.3, iron: 1.2, timber: 0.6, spice: 1.4, moonleaf: 1.5 },
    },
    {
        id: "ironvale",
        name: "Ironvale",
        x: 235, y: 140,
        connections: ["redbrook", "dunmoor", "fenwickhollow"],
        population: 15300, technology: "Advancing", climate: "Mountain Pass", crime: "High",
        priceMultiplier: { grain: 1.25, cloth: 1.0, iron: 0.55, timber: 0.95, spice: 1.0, moonleaf: 0.85 },
    },
];
export function getCity(id) {
    const c = CITIES.find((city) => city.id === id);
    if (!c)
        throw new Error(`Unknown city: ${id}`);
    return c;
}
export function priceAt(cityId, goodId) {
    const city = getCity(cityId);
    const good = GOODS_BASE_LOOKUP[goodId];
    const mult = city.priceMultiplier[goodId] ?? 1.0;
    return Math.max(1, Math.round(good * mult));
}
export function distanceBetween(aId, bId) {
    const a = getCity(aId);
    const b = getCity(bId);
    return Math.hypot(a.x - b.x, a.y - b.y);
}
//# sourceMappingURL=cities.js.map