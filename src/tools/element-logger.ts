
let counter = 0;

export class ElementLogger {

    element: HTMLElement;
    id = counter++;

    constructor(element: HTMLElement) {
        this.element = element;

    }


    protected prefixMsg(...args: any) {
        args.unshift([this.element.tagName.toLowerCase()].join('#' + this.id));
        return args;
    }

    dbg(...args : any[]) {
        if (! this.element.hasAttribute('debug')) {
            return;
        }
        console.debug(...this.prefixMsg(...args));
    }

    warn(msg : string, expected? : string , found?: string, ...args : any[]) {
        if (expected !== undefined) {
            msg += " (expected: '" + expected  + "' found: '" + found + "')\n\n";
        }

        console.warn(...this.prefixMsg(msg, expected, found, ...args));
    }

    excpetion(message: string) : Error {
        const error = new Error(message);
        console.error(error);
        return error;
    }


}
