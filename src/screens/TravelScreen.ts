import { el, clear } from "../ui/dom.js";
import { GameState } from "../state/GameState.js";
import { getCity, distanceBetween } from "../data/cities.js";
import { rollEncounter } from "../data/encounters.js";
import { resolveEncounter } from "../systems/encounterResolution.js";
import { travelCostFor } from "./MapScreen.js";

export interface TravelNav {
  arrived: (state: GameState) => void;
}

const ENCOUNTER_CHANCE = 0.45;
const PROGRESS_DURATION_MS = 1600;

export function renderTravelScreen(container: HTMLElement, state: GameState, destCityId: string, nav: TravelNav): void {
  const dest = getCity(destCityId);
  const originId = state.data.currentCityId;
  const distance = distanceBetween(originId, destCityId);
  const { days } = travelCostFor(distance);

  const wrap = el("div", { className: "screen screen-travel" });
  wrap.append(el("h2", {}, [`Traveling to ${dest.name}`]));
  wrap.append(el("p", { className: "subtitle" }, [`${days} day${days === 1 ? "" : "s"} on the road`]));

  const track = el("div", { className: "progress-track" });
  const fill = el("div", { className: "progress-fill" });
  track.append(fill);
  wrap.append(track);

  const skipBtn = el("button", { className: "secondary-btn", onclick: () => finishTravel() }, ["Skip ahead"]);
  wrap.append(skipBtn);

  container.append(wrap);

  let start: number | null = null;
  let done = false;
  function step(ts: number): void {
    if (done) return;
    if (start === null) start = ts;
    const pct = Math.min(1, (ts - start) / PROGRESS_DURATION_MS);
    fill.style.width = `${pct * 100}%`;
    if (pct >= 1) {
      finishTravel();
    } else {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);

  function finishTravel(): void {
    if (done) return;
    done = true;
    if (Math.random() < ENCOUNTER_CHANCE) {
      showEncounter();
    } else {
      arrive();
    }
  }

  function showEncounter(): void {
    clear(wrap);
    const encounter = rollEncounter();
    wrap.append(el("h2", {}, [encounter.title]));
    wrap.append(el("p", { className: "encounter-desc" }, [encounter.description]));

    const resultBox = el("div", { className: "encounter-result" });

    const choose = (choice: "engage" | "ignore") => {
      const outcome = resolveEncounter(state, encounter, choice);
      clear(resultBox);
      resultBox.append(el("p", {}, [outcome.message]));
      const continueBtn = el("button", { className: "primary-btn", onclick: () => arrive() }, ["Continue"]);
      resultBox.append(continueBtn);
      engageBtn.remove();
      ignoreBtn.remove();
    };

    const engageBtn = el("button", { className: "primary-btn", onclick: () => choose("engage") }, [encounter.engageLabel]);
    const ignoreBtn = el("button", { className: "secondary-btn", onclick: () => choose("ignore") }, [encounter.ignoreLabel]);
    wrap.append(el("div", { className: "button-row" }, [engageBtn, ignoreBtn]));
    wrap.append(resultBox);
  }

  function arrive(): void {
    state.travelTo(destCityId);
    state.save();
    nav.arrived(state);
  }
}
