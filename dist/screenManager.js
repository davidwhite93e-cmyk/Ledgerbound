import { clear } from "./ui/dom.js";
let root = null;
export function initScreenManager(rootEl) {
    root = rootEl;
}
export function showScreen(render) {
    if (!root)
        throw new Error("Screen manager not initialized");
    clear(root);
    render(root);
    root.scrollTop = 0;
}
//# sourceMappingURL=screenManager.js.map