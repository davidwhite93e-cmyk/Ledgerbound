// Two factions for the Phase 1 prototype slice. The full design (see the plan doc) adds a
// third neutral faction, "the Longhunters" -- a bounty-hunting Mercenaries Guild. Faction
// data is modeled as a list (not two hardcoded fields) specifically so a third entry can be
// added later without reshaping GameState.

export type FactionId = "concord" | "freecompanies";

export interface Faction {
  id: FactionId;
  name: string;
  tagline: string;
  rankNames: string[];
}

export const FACTIONS: Faction[] = [
  {
    id: "concord",
    name: "The Concord",
    tagline: "Order, tariffs, and a great deal of paperwork.",
    rankNames: ["Unknown", "Registered", "Trusted", "Warden's Favor", "Concord Elect"],
  },
  {
    id: "freecompanies",
    name: "The Free Companies",
    tagline: "Nobody's ledger but your own.",
    rankNames: ["Unknown", "Acquainted", "Reliable", "Blooded", "Free Captain"],
  },
];

export function rankForStanding(faction: Faction, standing: number): string {
  const idx = Math.min(faction.rankNames.length - 1, Math.floor(standing / 20));
  return faction.rankNames[Math.max(0, idx)];
}
