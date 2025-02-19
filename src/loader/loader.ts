/**
 * Application Loader
 *
 * Runlevel Based Application Loader for Micro-Frontend Components.
 */

export type LoaderCallback = () => Promise<any> | any;

export class Loader {
    private callbacks: Map<number, LoaderCallback[]> = new Map();
    public version: number;
    private maxRunLevel = 10;

    constructor(version: number = 1) {
        this.version = version;

        // Handle global loader versioning conflict
        if (typeof window !== 'undefined') {
            if ((window as any).loader) {
                if ((window as any).loader.version < this.version) {
                    console.warn("A lower version of Loader detected. Overriding with higher version.");
                    (window as any).loader = this;
                }
            } else {
                (window as any).loader = this;
                document.dispatchEvent(new Event("loaderready"));

                if (typeof (window as any).onloaderready === "function") {
                    (window as any).onloaderready();
                }
            }
        }
    }

    /**
     * Registers a callback for a specific runlevel.
     * @param runlevel - The runlevel (number between 0 and 10)
     * @param callback - The callback function to be executed during this runlevel.
     */
    public registerCallback(runlevel: number, callback: LoaderCallback): void {
        if (runlevel < 0 || runlevel > this.maxRunLevel) {
            console.warn(`Runlevel ${runlevel} is out of range (0-${this.maxRunLevel})`);
            return;
        }

        const existingCallbacks = this.callbacks.get(runlevel) || [];
        existingCallbacks.push(callback);
        this.callbacks.set(runlevel, existingCallbacks);
    }

    /**
     * Execute all registered callbacks for the specified runlevel.
     * All callbacks at the given runlevel are executed concurrently.
     * Execution times are recorded, and a warning is issued if any callback exceeds 200ms.
     * @param runlevel - The runlevel to execute.
     */
    public async runlevel(runlevel: number): Promise<void> {
        if (runlevel < 0 || runlevel > this.maxRunLevel) {
            console.warn(`Runlevel ${runlevel} is out of range (0-${this.maxRunLevel})`);
            return;
        }

        const tasks = this.callbacks.get(runlevel) || [];
        const promises = tasks.map(async (callback) => {
            const start = performance.now();
            await callback();
            const duration = performance.now() - start;
            if (duration > 200) {
                console.warn(`Callback in runlevel ${runlevel} took ${duration.toFixed(2)}ms`);
            }
        });

        await Promise.all(promises);
    }
}

export function runlevel(runlevel: number): Promise<void> {
    if (typeof window !== 'undefined') {
        throw new Error("runlevel() should only be called on the server side.");
    }
    if (!(window as any).loader) {
        new Loader();
    }
    return (window as any).loader.runlevel(runlevel);
}


declare global {
    interface Window {
        loader: Loader;
        onloaderready: () => void;
    }
}
