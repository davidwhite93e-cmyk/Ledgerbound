export function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith("on") && typeof value === "function") {
            node.addEventListener(key.slice(2).toLowerCase(), value);
        }
        else if (key === "className") {
            node.className = String(value);
        }
        else if (typeof value === "boolean") {
            if (value)
                node.setAttribute(key, "");
        }
        else {
            node.setAttribute(key, String(value));
        }
    }
    for (const child of children) {
        node.append(typeof child === "string" ? document.createTextNode(child) : child);
    }
    return node;
}
export function clear(node) {
    while (node.firstChild)
        node.removeChild(node.firstChild);
}
//# sourceMappingURL=dom.js.map