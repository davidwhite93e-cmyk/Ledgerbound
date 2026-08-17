import { el, clear } from "../ui/dom.js";
import { GameState } from "../state/GameState.js";
import { GOODS } from "../data/goods.js";
import { priceAt } from "../data/cities.js";
import { FACTIONS, rankForStanding } from "../data/factions.js";
import { renderStatusBar } from "./MapScreen.js";
import { randomInt } from "../data/encounters.js";

export interface CityNav {
  toMap: (state: GameState) => void;
  checkWin: (state: GameState) => boolean;
}

type Tab = "market" | "guild";

export function renderCityScreen(
  container: HTMLElement,
  state: GameState,
  nav: CityNav,
  initialTab: Tab = "market"
): void {
  let activeTab: Tab = initialTab;

  const wrap = el("div", { className: "screen screen-city" });
  wrap.append(renderStatusBar(state));

  const tabBar = el("div", { className: "tab-bar" });
  const marketTabBtn = el("button", { className: "tab-btn", onclick: () => setTab("market") }, ["Market"]);
  const guildTabBtn = el("button", { className: "tab-btn", onclick: () => setTab("guild") }, ["Guild Hall"]);
  tabBar.append(marketTabBtn, guildTabBtn);
  wrap.append(tabBar);

  const content = el("div", { className: "tab-content" });
  wrap.append(content);

  const backBtn = el("button", { className: "secondary-btn back-btn", onclick: () => nav.toMap(state) }, ["← Back to Map"]);
  wrap.append(backBtn);

  function setTab(tab: Tab): void {
    activeTab = tab;
    marketTabBtn.classList.toggle("active", tab === "market");
    guildTabBtn.classList.toggle("active", tab === "guild");
    clear(content);
    if (tab === "market") content.append(renderMarket(state, nav));
    else content.append(renderGuildHall(state, nav));
  }
  setTab(activeTab);

  container.append(wrap);
}

function renderMarket(state: GameState, nav: CityNav): HTMLElement {
  const table = el("div", { className: "market-table" });
  table.append(
    el("div", { className: "market-header" }, [
      el("span", {}, ["Good"]),
      el("span", {}, ["Price"]),
      el("span", {}, ["Owned"]),
      el("span", {}, ["Qty"]),
      el("span", {}, [""]),
    ])
  );

  for (const good of GOODS) {
    let qty = 1;
    const price = priceAt(state.data.currentCityId, good.id);
    const owned = state.data.cargo[good.id] ?? 0;

    const qtyLabel = el("span", { className: "qty-value" }, [String(qty)]);
    const row = el("div", { className: `market-row${good.contraband ? " contraband" : ""}` }, [
      el("span", { className: "good-name" }, [good.contraband ? `${good.name} ⚠` : good.name]),
      el("span", {}, [`${price}g`]),
      el("span", {}, [String(owned)]),
      el("span", { className: "qty-controls" }, [
        el("button", { className: "stepper-btn", onclick: () => { if (qty > 1) { qty--; qtyLabel.textContent = String(qty); } } }, ["-"]),
        qtyLabel,
        el("button", { className: "stepper-btn", onclick: () => { qty++; qtyLabel.textContent = String(qty); } }, ["+"]),
      ]),
      el("span", { className: "trade-buttons" }, [
        el(
          "button",
          {
            className: "buy-btn",
            onclick: () => {
              const result = state.buyGood(good.id, qty);
              if (!result.ok) alert(result.reason ?? "Can't buy that.");
              else refreshRow();
            },
          },
          ["Buy"]
        ),
        el(
          "button",
          {
            className: "sell-btn",
            onclick: () => {
              const result = state.sellGood(good.id, qty);
              if (!result.ok) {
                alert(result.reason ?? "Can't sell that.");
                return;
              }
              state.save();
              if (nav.checkWin(state)) return;
              refreshRow();
            },
          },
          ["Sell"]
        ),
      ]),
    ]);

    const ownedSpan = row.children[2] as HTMLElement;
    function refreshRow(): void {
      ownedSpan.textContent = String(state.data.cargo[good.id] ?? 0);
      state.save();
      statusRefreshHook?.();
    }

    table.append(row);
  }

  const wrap = el("div", {}, [
    el("p", { className: "hint" }, ["⚠ = contraband. Getting caught with it by a Concord patrol has consequences."]),
    table,
  ]);
  return wrap;
}

// Simple hook so buy/sell actions can refresh the status bar's gold/cargo line without a full
// screen re-render. Set by renderCityScreen's caller if desired; safe to leave unset.
let statusRefreshHook: (() => void) | null = null;
export function setStatusRefreshHook(fn: (() => void) | null): void {
  statusRefreshHook = fn;
}

function renderGuildHall(state: GameState, nav: CityNav): HTMLElement {
  const wrap = el("div", { className: "guild-hall" });

  for (const faction of FACTIONS) {
    const standing = state.data.factionStanding[faction.id];
    const rank = rankForStanding(faction, standing);

    const bar = el("div", { className: "standing-bar-track" }, [
      el("div", { className: "standing-bar-fill", style: `width:${standing}%` }),
    ]);

    const card = el("div", { className: "faction-card" }, [
      el("h3", {}, [faction.name]),
      el("p", { className: "faction-tagline" }, [faction.tagline]),
      bar,
      el("p", { className: "faction-rank" }, [`Standing: ${standing} (${rank})`]),
      el(
        "button",
        {
          className: "secondary-btn",
          onclick: () => {
            const other = FACTIONS.find((f) => f.id !== faction.id)!;
            state.changeFactionStanding(faction.id, 5);
            state.changeFactionStanding(other.id, -3);
            const reward = randomInt(5, 15);
            state.addGold(reward);
            state.save();
            alert(`You ran an errand for ${faction.name} and earned ${reward} gold. Standing improved.`);
            if (nav.checkWin(state)) return;
            renderGuildHallRefresh(wrap, state, nav);
          },
        },
        [`Do a favor for ${faction.name.split(" ").pop()}`]
      ),
    ]);
    wrap.append(card);
  }

  return wrap;
}

function renderGuildHallRefresh(container: HTMLElement, state: GameState, nav: CityNav): void {
  clear(container);
  container.append(renderGuildHall(state, nav));
}
