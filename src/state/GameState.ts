import { GoodId, getGood } from "../data/goods.js";
import { priceAt, getCity } from "../data/cities.js";
import { FactionId } from "../data/factions.js";

export interface StatBlock {
  trade: number;
  combat: number;
  travel: number;
  defense: number;
}

const SAVE_KEY = "ledgerbound-save-v1";
export const STARTING_STAT_POINTS = 12; // small budget for the Phase 1 prototype
export const STARTING_CARGO_CAPACITY = 40;
export const GOLD_WIN_TARGET = 1000; // kept low so the prototype is winnable in a short test session

export interface GameStateData {
  playerName: string;
  stats: StatBlock;
  level: number;
  xp: number;
  gold: number;
  cargo: Partial<Record<GoodId, number>>;
  cargoCapacity: number;
  currentCityId: string;
  day: number;
  factionStanding: Record<FactionId, number>;
  visitedCityIds: string[];
  won: boolean;
}

export class GameState {
  data: GameStateData;

  private constructor(data: GameStateData) {
    this.data = data;
  }

  static newGame(playerName: string, stats: StatBlock, startCityId: string): GameState {
    return new GameState({
      playerName,
      stats,
      level: 1,
      xp: 0,
      gold: 150,
      cargo: {},
      cargoCapacity: STARTING_CARGO_CAPACITY,
      currentCityId: startCityId,
      day: 1,
      factionStanding: { concord: 50, freecompanies: 50 },
      visitedCityIds: [startCityId],
      won: false,
    });
  }

  static load(): GameState | null {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw) as GameStateData;
      return new GameState(data);
    } catch {
      return null;
    }
  }

  static clearSave(): void {
    localStorage.removeItem(SAVE_KEY);
  }

  save(): void {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
  }

  cargoUsed(): number {
    return Object.values(this.data.cargo).reduce((sum, qty) => sum + (qty ?? 0), 0);
  }

  cargoFree(): number {
    return this.data.cargoCapacity - this.cargoUsed();
  }

  addGold(amount: number): void {
    this.data.gold = Math.max(0, this.data.gold + amount);
    if (this.data.gold >= GOLD_WIN_TARGET) {
      this.data.won = true;
    }
  }

  buyGood(goodId: GoodId, quantity: number): { ok: boolean; reason?: string } {
    if (quantity <= 0) return { ok: false, reason: "Quantity must be positive." };
    const price = priceAt(this.data.currentCityId, goodId);
    const cost = price * quantity;
    if (cost > this.data.gold) return { ok: false, reason: "Not enough gold." };
    if (quantity > this.cargoFree()) return { ok: false, reason: "Not enough cargo space." };
    this.data.gold -= cost;
    this.data.cargo[goodId] = (this.data.cargo[goodId] ?? 0) + quantity;
    return { ok: true };
  }

  sellGood(goodId: GoodId, quantity: number): { ok: boolean; reason?: string } {
    const owned = this.data.cargo[goodId] ?? 0;
    if (quantity <= 0) return { ok: false, reason: "Quantity must be positive." };
    if (quantity > owned) return { ok: false, reason: "You don't have that much to sell." };
    const price = priceAt(this.data.currentCityId, goodId);
    this.data.cargo[goodId] = owned - quantity;
    this.addGold(price * quantity);
    return { ok: true };
  }

  loseRandomCargo(maxUnits: number): number {
    const goodIds = Object.keys(this.data.cargo) as GoodId[];
    let lost = 0;
    for (const id of goodIds) {
      if (lost >= maxUnits) break;
      const have = this.data.cargo[id] ?? 0;
      const take = Math.min(have, maxUnits - lost);
      this.data.cargo[id] = have - take;
      lost += take;
    }
    return lost;
  }

  changeFactionStanding(factionId: FactionId, delta: number): void {
    const current = this.data.factionStanding[factionId] ?? 50;
    this.data.factionStanding[factionId] = Math.max(0, Math.min(100, current + delta));
  }

  gainXp(amount: number): boolean {
    this.data.xp += amount;
    const xpForNextLevel = this.data.level * 50;
    if (this.data.xp >= xpForNextLevel) {
      this.data.xp -= xpForNextLevel;
      this.data.level += 1;
      // Real stat growth on level-up -- a direct fix for the original's most specific fan
      // complaint (leveling only granted achievement XP, not character power).
      const statKeys: (keyof StatBlock)[] = ["trade", "combat", "travel", "defense"];
      const boosted = statKeys[Math.floor(Math.random() * statKeys.length)];
      this.data.stats[boosted] += 1;
      return true;
    }
    return false;
  }

  travelTo(cityId: string): void {
    this.data.currentCityId = cityId;
    this.data.day += 1;
    if (!this.data.visitedCityIds.includes(cityId)) {
      this.data.visitedCityIds.push(cityId);
    }
  }

  currentCityName(): string {
    return getCity(this.data.currentCityId).name;
  }

  goodName(id: GoodId): string {
    return getGood(id).name;
  }
}
