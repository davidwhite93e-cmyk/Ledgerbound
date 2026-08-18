import { GameState } from "../state/GameState.js";
import { EncounterDef, randomInt } from "../data/encounters.js";

export interface EncounterOutcome {
  message: string;
  leveledUp: boolean;
}

export function resolveEncounter(
  state: GameState,
  encounter: EncounterDef,
  choice: "engage" | "ignore"
): EncounterOutcome {
  let leveledUp = false;

  if (encounter.kind === "combat") {
    if (choice === "ignore") {
      return { message: "You keep your head down and slip past without a fight.", leveledUp };
    }
    const playerPower = state.data.stats.combat * 3 + state.data.level * 2 + randomInt(0, 6);
    const enemyPower = randomInt(encounter.enemyMin, encounter.enemyMax);
    if (playerPower >= enemyPower) {
      const reward = randomInt(encounter.goldRewardMin, encounter.goldRewardMax);
      state.addGold(reward);
      leveledUp = state.gainXp(20);
      state.changeFactionStanding("concord", 3);
      state.changeFactionStanding("freecompanies", -3);
      return {
        message: `You fought them off and claimed ${reward} gold from the wreckage.${
          leveledUp ? " You feel stronger for it." : ""
        }`,
        leveledUp,
      };
    } else {
      const lost = state.loseRandomCargo(5);
      const goldLost = Math.min(state.data.gold, 20);
      state.addGold(-goldLost);
      return {
        message: `You were beaten back. You lost ${lost} units of cargo and ${goldLost} gold fleeing.`,
        leveledUp,
      };
    }
  }

  if (encounter.kind === "inspection") {
    if (choice === "engage") {
      const moonleaf = state.data.cargo["moonleaf"] ?? 0;
      if (moonleaf > 0) {
        state.data.cargo["moonleaf"] = 0;
        state.changeFactionStanding("concord", -5);
        return {
          message: `The patrol finds your Moonleaf and confiscates all ${moonleaf} units. Word of this will travel.`,
          leveledUp,
        };
      }
      state.changeFactionStanding("concord", 2);
      return { message: "The patrol finds nothing of concern and waves you through.", leveledUp };
    } else {
      const bribe = 15;
      state.addGold(-Math.min(state.data.gold, bribe));
      state.changeFactionStanding("freecompanies", 1);
      return { message: `You slip the patrol ${bribe} gold and they lose interest.`, leveledUp };
    }
  }

  // peaceful
  if (choice === "engage") {
    const reward = randomInt(encounter.goldRewardMin, encounter.goldRewardMax);
    state.addGold(reward);
    return { message: `Good intel pays off -- you pick up ${reward} gold worth of trade tips.`, leveledUp };
  }
  return { message: "You wave and continue on your way.", leveledUp };
}
