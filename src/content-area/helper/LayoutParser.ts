


export type Layout = {
    i: string | null;
    tag: string | null;
    inlineClasses: string[];
    id: string | null;
    attributes: Record<string, string | true>;
}


/**
 * Layout is a basic PUG statement prefixed by an nummeric index. Prefixed by a + to indicate append to
 * the existing node on the same index.
 *
 * e.g.
 * 1.5:div.box.class2(attribute1='attval' enabled)
 * +1.5:div.box.class2
 *
 */
export class LayoutParser {



  public parseAttributes(attrString: string): Record<string, string | true> {

    let ret = {} as Record<string, string | true>;
    const attrRegex = /(?<name>[^\s=]+)(?:=(?<quote>['"])(?<value>.*?)\k<quote>)?/g;
    for (const match of attrString.matchAll(attrRegex)) {
      if (!match.groups) {
        throw new Error(`Invalid attribute format in string: '${attrString}'`);
      }
      ret[match.groups.name] = match.groups.value ? match.groups.value : true; // If value is undefined, set to true

    }
    return ret;
  }


    /**
     * Public wrapper used by tests
     * @param layoutString
     */
    public parse(layoutString: string): Layout {

      const originalLayoutString = layoutString.trim();
      let ret = {
        i: null,
        tag: null,
        inlineClasses: [],
        attributes: {},
        id: null
      } as Layout;

      // Detect i
      const regexI = /^(\+?[0-9.]+)/;
      const matches = layoutString.match(regexI);
      if (matches){
        ret.i = matches[1] || null; // Extract the index if present
        layoutString = layoutString.replace(regexI, '');
      }

      if (layoutString.startsWith(":")) {
        // Remove the leading colon
        layoutString = layoutString.slice(1);
      }

      // Split by the first occurrence of parentheses to separate tag and attributes
      const regex = /^(?<tag>[a-zA-Z0-9]+)?(?<inline>[a-zA-Z0-9:#_.-]+)?(?<attr>\(.*)?/;
      const match = layoutString.match(regex);
      if ( ! match) {
        throw new Error(`Invalid layout string: '${layoutString}'`);
      }

      // Detect Tag
      ret.tag = match.groups?.tag  || null;

      // Detect Attributes (inline)
      const inline = match.groups?.inline || '';
      for (let match of inline.matchAll(/[.#][a-zA-Z0-9:_-]+/g)) {
        if (match[0].startsWith('.')) {
          ret.inlineClasses.push(match[0].slice(1)); // Remove the leading dot
        } else if (match[0].startsWith('#')) {
          ret.id = match[0].slice(1); // Remove the leading hash
        }
      }


      const attrString = match.groups?.attr;
      if (attrString) {
        // check for closing parenthesis
        if (!attrString.endsWith(')')) {
          throw new Error(`Unterminated attribute format in string: '${originalLayoutString}'`);
        }
        try {
          ret.attributes = this.parseAttributes(attrString.slice(1, -1)); // Remove the leading and trailing parentheses

        } catch (e) {
          throw new Error(`Error parsing attributes in layout: '${originalLayoutString}' - ${e}`);
        }
      }



     return ret;


    }




}
