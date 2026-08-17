import { el, clear } from "../ui/dom.js";
import { CITIES, getCity, distanceBetween } from "../data/cities.js";
import { FACTIONS, rankForStanding } from "../data/factions.js";
const CANVAS_W = 300;
const CANVAS_H = 600;
const NODE_RADIUS = 12;
export function travelCostFor(distance) {
    return { gold: Math.max(5, Math.round(distance / 4)), days: Math.max(1, Math.round(distance / 70)) };
}
export function renderMapScreen(container, state, nav) {
    const wrap = el("div", { className: "screen screen-map" });
    wrap.append(renderStatusBar(state));
    const canvasHolder = el("div", { className: "map-canvas-holder" });
    const canvas = el("canvas", { width: String(CANVAS_W), height: String(CANVAS_H), className: "map-canvas" });
    canvasHolder.append(canvas);
    wrap.append(canvasHolder);
    const infoPanel = el("div", { className: "travel-panel" });
    wrap.append(infoPanel);
    const currentCity = getCity(state.data.currentCityId);
    function draw() {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        // connections
        ctx.strokeStyle = "#a98f6b";
        ctx.lineWidth = 2;
        const drawn = new Set();
        for (const city of CITIES) {
            for (const connId of city.connections) {
                const key = [city.id, connId].sort().join("-");
                if (drawn.has(key))
                    continue;
                drawn.add(key);
                const other = getCity(connId);
                ctx.beginPath();
                ctx.moveTo(city.x, city.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        }
        // nodes
        for (const city of CITIES) {
            const isCurrent = city.id === state.data.currentCityId;
            const isReachable = currentCity.connections.includes(city.id);
            const visited = state.data.visitedCityIds.includes(city.id);
            ctx.beginPath();
            ctx.arc(city.x, city.y, NODE_RADIUS, 0, Math.PI * 2);
            ctx.fillStyle = isCurrent ? "#e0a940" : isReachable ? "#6f8f5a" : visited ? "#8a8a7a" : "#5a5a52";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#2b2620";
            ctx.stroke();
            ctx.fillStyle = "#f4ecd8";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(city.name, city.x, city.y + NODE_RADIUS + 14);
        }
    }
    draw();
    canvas.addEventListener("click", (ev) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = CANVAS_W / rect.width;
        const scaleY = CANVAS_H / rect.height;
        const x = (ev.clientX - rect.left) * scaleX;
        const y = (ev.clientY - rect.top) * scaleY;
        const clicked = CITIES.find((c) => Math.hypot(c.x - x, c.y - y) <= NODE_RADIUS + 6);
        if (!clicked)
            return;
        if (clicked.id === state.data.currentCityId) {
            nav.toCity(state);
            return;
        }
        if (currentCity.connections.includes(clicked.id)) {
            showTravelConfirm(clicked);
            return;
        }
        clear(infoPanel);
        infoPanel.append(el("p", { className: "info-note" }, [
            `${clicked.name} isn't directly reachable from here -- travel through a connected city first.`,
        ]));
    });
    function showTravelConfirm(dest) {
        clear(infoPanel);
        const distance = distanceBetween(state.data.currentCityId, dest.id);
        const { gold, days } = travelCostFor(distance);
        infoPanel.append(el("div", { className: "travel-confirm" }, [
            el("h3", {}, [`Travel to ${dest.name}`]),
            el("p", {}, [`Pop. ${dest.population.toLocaleString()} • ${dest.technology} • ${dest.climate}`]),
            el("p", {}, [`Crime level: ${dest.crime}`]),
            el("p", { className: "cost-line" }, [`Cost: ${gold} gold • ${days} day${days === 1 ? "" : "s"}`]),
            el("div", { className: "button-row" }, [
                el("button", {
                    className: "primary-btn",
                    onclick: () => {
                        if (state.data.gold < gold) {
                            alert("Not enough gold for this trip.");
                            return;
                        }
                        state.addGold(-gold);
                        nav.toTravel(state, dest.id);
                    },
                }, ["Confirm"]),
                el("button", { className: "secondary-btn", onclick: () => clear(infoPanel) }, ["Cancel"]),
            ]),
        ]));
    }
    container.append(wrap);
}
export function renderStatusBar(state) {
    const cargoLine = `${state.cargoUsed()}/${state.data.cargoCapacity}`;
    const factionLine = FACTIONS.map((f) => `${f.name.split(" ").pop()}: ${rankForStanding(f, state.data.factionStanding[f.id])}`).join("   ");
    return el("div", { className: "status-bar" }, [
        el("div", { className: "status-row" }, [
            el("span", { className: "status-city" }, [state.currentCityName()]),
            el("span", {}, [`Day ${state.data.day}`]),
        ]),
        el("div", { className: "status-row" }, [
            el("span", {}, [`💰 ${state.data.gold} gold`]),
            el("span", {}, [`Cargo ${cargoLine}`]),
            el("span", {}, [`Lv.${state.data.level}`]),
        ]),
        el("div", { className: "status-row faction-row" }, [el("span", {}, [factionLine])]),
    ]);
}
//# sourceMappingURL=MapScreen.js.map