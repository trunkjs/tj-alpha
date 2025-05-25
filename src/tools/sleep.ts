

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// language=pug
let c = `
doctype html
div(class="container")
    hi(*for="x of items" *for="y of items" @item="this.mama" :item="manila") Hello Word
`;

export class Debouncer {
    private timeout: NodeJS.Timeout | null = null;

    constructor(private delay: number) {}

    public async wait() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        return new Promise((resolve) => {
            this.timeout = setTimeout(() => {
                resolve(true);
            }, this.delay);
        });
    }

    public debounce(callback: () => void) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            callback();
        }, this.delay);
    }
}
