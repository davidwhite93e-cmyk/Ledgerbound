import { initScreenManager, showScreen } from "./screenManager.js";
import { renderCreateScreen } from "./screens/CreateScreen.js";
import { renderMapScreen } from "./screens/MapScreen.js";
import { renderCityScreen } from "./screens/CityScreen.js";
import { renderTravelScreen } from "./screens/TravelScreen.js";
import { renderWinScreen } from "./screens/WinScreen.js";
import { GameState } from "./state/GameState.js";
const START_CITY = "millhaven";
function boot() {
    const root = document.getElementById("app");
    if (!root)
        throw new Error("Missing #app root element");
    initScreenManager(root);
    const existing = GameState.load();
    if (existing && existing.data.won) {
        goWin(existing);
    }
    else if (existing) {
        goMap(existing);
    }
    else {
        goCreate();
    }
}
function goCreate() {
    showScreen((container) => {
        renderCreateScreen(container, START_CITY, (state) => goMap(state));
    });
}
function goMap(state) {
    if (state.data.won) {
        goWin(state);
        return;
    }
    showScreen((container) => {
        renderMapScreen(container, state, {
            toCity: (s) => goCity(s),
            toTravel: (s, destId) => goTravel(s, destId),
        });
    });
}
function goCity(state) {
    showScreen((container) => {
        renderCityScreen(container, state, {
            toMap: (s) => goMap(s),
            checkWin: (s) => {
                if (s.data.won) {
                    goWin(s);
                    return true;
                }
                return false;
            },
        });
    });
}
function goTravel(state, destCityId) {
    showScreen((container) => {
        renderTravelScreen(container, state, destCityId, {
            arrived: (s) => {
                if (s.data.won)
                    goWin(s);
                else
                    goCity(s);
            },
        });
    });
}
function goWin(state) {
    showScreen((container) => {
        renderWinScreen(container, state, { newGame: () => goCreate() });
    });
}
boot();
//# sourceMappingURL=main.js.map