export type ParsedSelector = {
    tag: string | null; // Default to null if no tag is specified
    classes: string[]; // Default to an empty array if no classes are specified
    id: string | null; // Default to null if no id is specified
};

export function parseSelector(selector: string): ParsedSelector {
    const tagMatch = selector.match(/^[a-zA-Z][a-zA-Z0-9:_-]*/);
    const tag = tagMatch ? tagMatch[0] : null;

    const classMatches = [...selector.matchAll(/\.([a-zA-Z0-9:_-]+)/g)];
    const classes = classMatches.map(match => match[1]);

    const idMatch = selector.match(/#([a-zA-Z0-9_-]+)/);
    const id = idMatch ? idMatch[1] : null;

    return { tag, classes, id };
}
