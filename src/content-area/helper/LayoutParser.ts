


export type Layout = {
    i?: string;
    tag?: string;
    inlineClasses: string[];
    id?: string;
    attributes: Record<string, string>;
}



export class LayoutParser {


    /**
     * Example Input
     * @param layoutString
     */
    public parseLayoutSting(layoutString: string): Layout {

        const regex = /^(?<i>[0-9.]+)?:?(?<tag>[\w\-.]+)?/;
        const match = layoutString.match(regex);
        if (!match || !match.groups) {
            throw new Error("Invalid layout string format");
        }
        const { i, tag } = match.groups;
        const layout: Layout = {
            i: i,
            tag: tag || undefined,
            inlineClasses: [],
            attributes: {}
        };
        return layout;
    }

}
