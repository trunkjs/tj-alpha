

export async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class Debouncer {
    private timeout: NodeJS.Timeout | null = null;

    constructor(private delay: number) {}

    public debounce(callback: () => void) {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            callback();
        }, this.delay);
    }
}
