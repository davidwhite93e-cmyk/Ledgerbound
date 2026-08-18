import { el } from "../ui/dom.js";
import { GameState, GOLD_WIN_TARGET } from "../state/GameState.js";
export function renderWinScreen(container, state, nav) {
    const wrap = el("div", { className: "screen screen-win" }, [
        el("h1", {}, ["🏆 Fortune Made"]),
        el("p", {}, [
            `${state.data.playerName} reached ${state.data.gold} gold (target: ${GOLD_WIN_TARGET}) by Day ${state.data.day}, level ${state.data.level}.`,
        ]),
        el("p", { className: "subtitle" }, [
            "This is the prototype's first win condition. The full design adds faction-questline endings and a Longhunter bounty-hunting path -- see the plan document.",
        ]),
        el("button", {
            className: "primary-btn",
            onclick: () => {
                GameState.clearSave();
                nav.newGame();
            },
        }, ["Start a New Journey"]),
    ]);
    container.append(wrap);
}
//# sourceMappingURL=WinScreen.js.map