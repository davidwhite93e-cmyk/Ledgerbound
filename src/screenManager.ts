import { clear } from "./ui/dom.js";

let root: HTMLElement | null = null;

export function initScreenManager(rootEl: HTMLElement): void {
  root = rootEl;
}

export function showScreen(render: (container: HTMLElement) => void): void {
  if (!root) throw new Error("Screen manager not initialized");
  clear(root);
  render(root);
  root.scrollTop = 0;
}
