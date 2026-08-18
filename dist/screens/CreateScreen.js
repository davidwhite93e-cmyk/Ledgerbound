import { el } from "../ui/dom.js";
import { GameState, STARTING_STAT_POINTS } from "../state/GameState.js";
const STAT_LABELS = [
    { key: "trade", label: "Trade", hint: "Better buy/sell prices" },
    { key: "combat", label: "Combat", hint: "Stronger in encounters" },
    { key: "travel", label: "Travel", hint: "Faster, cheaper travel" },
    { key: "defense", label: "Defense", hint: "Lose less when you lose a fight" },
];
export function renderCreateScreen(container, startCityId, onComplete) {
    let name = "Wanderer";
    const allocated = { trade: 0, combat: 0, travel: 0, defense: 0 };
    let remaining = STARTING_STAT_POINTS;
    const wrap = el("div", { className: "screen screen-create" });
    wrap.append(el("h1", {}, ["Ledgerbound"]));
    wrap.append(el("p", { className: "subtitle" }, ["Prototype build -- character creation"]));
    const nameInput = el("input", {
        type: "text",
        value: name,
        className: "name-input",
        oninput: (e) => {
            name = e.target.value || "Wanderer";
        },
    });
    wrap.append(el("label", {}, ["Name your character"]));
    wrap.append(nameInput);
    const remainingLabel = el("p", { className: "remaining" }, [`Points remaining: ${remaining}`]);
    wrap.append(el("h2", {}, ["Allocate stat points"]));
    wrap.append(remainingLabel);
    const statRows = el("div", { className: "stat-rows" });
    const valueLabels = {};
    for (const stat of STAT_LABELS) {
        const valueLabel = el("span", { className: "stat-value" }, ["1"]);
        valueLabels[stat.key] = valueLabel;
        const minusBtn = el("button", {
            className: "stepper-btn",
            onclick: () => {
                if (allocated[stat.key] > 0) {
                    allocated[stat.key] -= 1;
                    remaining += 1;
                    refresh();
                }
            },
        }, ["-"]);
        const plusBtn = el("button", {
            className: "stepper-btn",
            onclick: () => {
                if (remaining > 0) {
                    allocated[stat.key] += 1;
                    remaining -= 1;
                    refresh();
                }
            },
        }, ["+"]);
        const row = el("div", { className: "stat-row" }, [
            el("div", { className: "stat-info" }, [
                el("div", { className: "stat-label" }, [stat.label]),
                el("div", { className: "stat-hint" }, [stat.hint]),
            ]),
            el("div", { className: "stat-controls" }, [minusBtn, valueLabel, plusBtn]),
        ]);
        statRows.append(row);
    }
    wrap.append(statRows);
    const beginBtn = el("button", {
        className: "primary-btn",
        onclick: () => {
            const stats = {
                trade: 1 + allocated.trade,
                combat: 1 + allocated.combat,
                travel: 1 + allocated.travel,
                defense: 1 + allocated.defense,
            };
            const state = GameState.newGame(name, stats, startCityId);
            state.save();
            onComplete(state);
        },
    }, ["Begin Journey"]);
    wrap.append(beginBtn);
    function refresh() {
        remainingLabel.textContent = `Points remaining: ${remaining}`;
        for (const stat of STAT_LABELS) {
            valueLabels[stat.key].textContent = String(1 + allocated[stat.key]);
        }
        beginBtn.disabled = remaining !== 0;
        beginBtn.textContent = remaining === 0 ? "Begin Journey" : `Allocate ${remaining} more point${remaining === 1 ? "" : "s"}`;
    }
    refresh();
    container.append(wrap);
}
//# sourceMappingURL=CreateScreen.js.map