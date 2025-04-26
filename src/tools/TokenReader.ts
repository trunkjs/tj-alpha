export type TokenReaderValue = {
    value_str: string;
    value_number: number | null;
    quoted: boolean;
    column: number;
}

/**
 * TokenReader provides utilities to read tokens like words, expressions, and quoted strings from a line input.
 *
 * @example
 * const tr = new TokenReader('foo bar', 1);
 * const word = tr.readWord(); // 'foo'
 */
export class TokenReader {
    private line: string;
    private index: number = 0;
    private lineNumber: number;

    /**
     * Creates a TokenReader instance.
     *
     * @param input - The input string to tokenize.
     * @param lineNumber - The line number for error reporting (default 1).
     *
     * @example
     * const reader = new TokenReader('some text here', 5);
     */
    constructor(input: string, lineNumber = 1) {
        this.line = input;
        this.lineNumber = lineNumber;
    }

    /**
     * Checks if the reading position has reached the end of the line.
     *
     * @returns true if at end of input, false otherwise.
     *
     * @example
     * reader.isEOF(); // false
     */
    public isEOF(): boolean {
        return this.index >= this.line.length;
    }

    /**
     * Reads a value from the input, which can be a string or number.
     * Handles quoted strings and numbers.
     *
     */
    public readValue(stopChar = ";"): TokenReaderValue | null {
        this.skipWhitespace();
        if (this.isEOF()) return null;

        let ret : TokenReaderValue = {
            value_str: '',
            value_number: null,
            quoted: false,
            column: this.index
        }

        // Read quoted string
        const quote = this.peekChar();
        if (quote === '"' || quote === "'") {
            this.readChar(); // consume the quote
            ret.value_str = this.readEscapedString(quote);
            ret.quoted = true;
            let next = this.peekChar();
            if (this.isNextChar(quote)) {
                this.readChar(); // consume the closing quote
            } else {
                throw new Error(this.failmsg(`Unterminated string starting at index ${this.index}`));
            }
            return ret;
        }

        // Read unquoted string or number
        const raw = this.readUntil(stopChar);
        ret.value_str = raw;

        // detect numeric values (support +/- , integer & float)
        const num = Number(raw);
        if (!Number.isNaN(num) && raw.trim() !== '') {
            ret.value_number = num;
        }

        return ret;
    }

    /**
     * Peeks at the next character without advancing the position.
     *
     * @returns The next character or null if at EOF.
     *
     * @example
     * reader.peekChar(); // 'a'
     */
    public peekChar(): string | null {
        return this.isEOF() ? null : this.line[this.index];
    }

    /**
     * Reads and advances one character.
     *
     * @returns The next character or null if at EOF.
     *
     * @example
     * reader.readChar(); // 'a'
     */
    public readChar(): string | null {
        if (this.isEOF()) return null;
        return this.line[this.index++];
    }

    /**
     * Reads characters until a specified stop character is encountered or EOF.
     * @param stopChar
     */
    public readUntil(stopChar : string) : string {
        let buf = '';
        while (!this.isEOF()) {
            const ch = this.readChar();
            if (ch === stopChar) break;
            buf += ch;
        }
        return buf;
    }

    /**
     * Skips any whitespace characters (spaces, tabs, newlines).
     *
     * @example
     * reader.skipWhitespace();
     */
    public skipWhitespace(): void {
        while (!this.isEOF() && /\s/.test(this.line[this.index])) {
            this.index++;
        }
    }

    /**
     * Reads a word consisting of alphanumeric or underscore characters.
     * Stops at whitespace or non-word boundaries.
     *
     * @returns The word string, or null if none found.
     *
     * @example
     * const word = reader.readWord(); // 'hello' or null
     */
    public readWord(wordRegex : RegExp = /\w/): string | null {
        this.skipWhitespace();
        if (this.isEOF()) return null;

        let word = '';
        while (!this.isEOF() && wordRegex.test(this.line[this.index])) {
            word += this.line[this.index++];
        }
        return word;
    }

    /**
     * Attempts to read one of the expected expressions.
     * Only accepted expressions will advance the pointer.
     *
     * @param expectedExpressions - List of accepted expressions.
     * @returns Matching expression string or null if none found.
     *
     * @example
     * const expr = reader.readExpression(['>=', '<=', '==']);
     */
    public readExpression(expectedExpressions: string[] = []): string | null {
        this.skipWhitespace();
        if (this.isEOF()) return null;
        const start = this.index;
        let expression : string|null = null;
        for(let curExpression of expectedExpressions) {
            if (this.line.startsWith(curExpression, this.index)) {
                expression = curExpression;
                this.index += expression.length;
                break;
            }
        }
        return expression;
    }

    /**
     * Reads a quoted string, handling escape sequences like \" or \\.
     * Throws an error if the string is unterminated.
     *
     * @param untilChar - The character that closes the quoted string (e.g., '"').
     * @returns The unescaped string content.
     *
     * @throws Error if unterminated string encountered.
     *
     * @example
     * const str = reader.readEscapedString('"'); // returns parsed string inside quotes
     */
    public readEscapedString(untilChar : string): string {
        let escaped = false;
        let str = '';
        while (!this.isEOF()) {
            const ch = this.readChar();

            if (ch === '\\' && !escaped) {
                escaped = true;
                continue;
            }
            str += ch;
            escaped = false;
            if (this.peekChar() === untilChar && !escaped) break;
        }

        if (escaped) {
            throw new Error(this.failmsg(`Unterminated string starting at index ${this.index}`));
        }
        return str;
    }

    /**
     * Generates a formatted fail message with line and column information.
     *
     * @param msg - Error message.
     * @returns Formatted message.
     *
     * @example
     * throw new Error(reader.failmsg('Unexpected character'));
     */
    public failmsg(msg: string): string {
        return `Line ${this.lineNumber}, Col ${this.index + 1}: ${msg}`;
    }

    /**
     * Checks if the next character matches a given character.
     *
     * @param ch - Character to match.
     * @returns true if matches, false otherwise.
     *
     * @example
     * if (reader.isNextChar(')')) { ... }
     */
    public isNextChar(ch: string): boolean {
        return this.peekChar() === ch;
    }

    /**
     * Saves the current reading index.
     *
     * @returns Current index value.
     *
     * @example
     * const saved = reader.saveIndex();
     */
    public saveIndex(): number {
        return this.index;
    }

    /**
     * Restores a previously saved index.
     *
     * @param saved - An index value previously returned by saveIndex().
     *
     * @example
     * reader.restoreIndex(saved);
     */
    public restoreIndex(saved: number): void {
        this.index = saved;
    }

}
