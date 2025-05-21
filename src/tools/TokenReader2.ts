

export enum PeekType {
    Include,
    Exclude,
    Peek
}






export class TokenReader2 {

    private _string: string = "";
    private _index: number = 0;
    private _curLine: number = 0;
    private _curColumn: number = 0;

    constructor(string: string) {
        this._string = string;
    }

    public get curLine(): number {
        return this._curLine;
    }

    public get curColumn(): number {
        return this._curColumn;
    }

    public get index(): number {
        return this._index;
    }
    public get string(): string {
        return this._string;
    }

    public get rest(): string {
        return this._string.substring(this._index);
    }

    public get length(): number {
        return this._string.length;
    }
    public isEnd(): boolean {
        return this._index >= this._string.length;
    }
    public hasMore(): boolean {
        return this._index < this._string.length;
    }


    public readWhiteSpace(): string {
        let input = this._string.substring(this._index);
        const match = input.match(/^\s*/);
        if (!match || match.index === undefined) {
            return "";
        }
        const result = match[0];
        this._index += result.length;
        return result;
    }



    private buildRegex(peek: string | string[] | RegExp, fromStart = false): RegExp {
        if (peek instanceof RegExp) {
            return peek;
        } else {
            let pattern = Array.isArray(peek)
                ? "(" + peek.map(str => this.escapeRegExp(str)).join('|') + ")"
                : this.escapeRegExp(peek);
            if (fromStart)
                pattern = '^' + pattern;
            return new RegExp(pattern, 's');
        }
    }



    public peek (peek : number | string | string[] | RegExp) : string | null {
        if (Number.isInteger(peek)) {
            // Return next peek chars
            return this._string.substring(this._index, this._index + (peek as number));
        }
        let regex = this.buildRegex(peek as string | string[] | RegExp, true); // From Start

        let input = this.rest;
        const match = input.match(regex);
        if ( ! match || match.index === undefined)
            return null;
        const result = match[0];
        return result;
    }

    private escapeRegExp(string: string): string {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }
    public readUntil(peek : string | string[] | RegExp, type : PeekType = PeekType.Exclude) : { content: string; match: string | null }
    {
        let input = this._string.substring(this._index);

        let result = "";
        let regex = this.buildRegex(peek);

        const match = input.match(regex);
        if (!match || match.index === undefined) {
            this._index += input.length;
            return { content: input, match: null };
        }
        result = input.slice(0, match.index);
        this._index += match.index;
        if (type === PeekType.Include) {
            result += match[0];
            this._index += match[0].length; // Position after the match and include it
        } else if (type === PeekType.Exclude) {
            this._index += match[0].length; // Position after the match
        } else if (type === PeekType.Peek) {
            // Postition before the match
        }
        return {
            content: result,
            match: match[0]
        };
    }

    public read(num : number = 1) {
        let input = this._string.substring(this._index);
        if (input.length < num) {
            num = input.length;
        }
        const result = input.slice(0, num);
        this._index += num;
        return result;
    }
}
