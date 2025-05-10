type Attrs = Record<string, string>;

export function create_element(
    tag: string,
    attrs: Attrs = {},
    children: (Node | string)[] | string | Node = []
): HTMLElement {
    if ( ! Array.isArray(children)) {
        children = [children];
    }
    const el = document.createElement(tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    for (const c of children)
        el.append(typeof c === 'string' ? document.createTextNode(c) : c);
    return el;
}
