---
slugName: implement-loader-functions
inlcudeFiles:
- src/loader/loader.md
editFiles:
- src/loader/loader.ts
- src/loader/README.md

original_prompt: Implementiere die Funktionen, die in src/loader/loader.md definiert
  sind in src/loader/loader.ts
---
# Instructions

This task requires the implementation of the loader functions as specified in the documentation provided in `src/loader/loader.md`. The goal is to create a runlevel-based application loader for micro-frontend components. The loader executes registered callbacks for each runlevel (from 0 to 10) in sequence. For each runlevel, all callbacks should run in parallel. The loader must record the execution time for each callback and issue a warning if any callback takes longer than 200ms to complete. Additionally, the loader should handle version conflicts by using the highest version available if multiple bundles register loaders.

## Files and Classes to Create

No new files are required, but you will create or modify the primary loader class inside:
- src/loader/loader.ts
- src/loader/README.md

## Files and Classes to Modify

- src/loader/loader.ts  
  This file will contain the implementation of the Loader class and its functions.

## Implementation Details

### src/loader/loader.ts

#### Objective

Implement a Loader class that provides runlevel-based execution of registered callbacks. The key function to implement is a method named `runlevel` which:
- Accepts a runlevel number (0 to 10) as the parameter.
- Executes all callbacks registered for that runlevel concurrently.
- Waits for all callbacks to complete before proceeding.
- Measures the execution time of each callback and logs a warning (using `console.warn`) if the callback takes more than 200ms.
- Manages potential version conflicts if multiple loader instances exist (choose the instance with the highest version).

#### Changes

1. **Define the Loader Class**
   - Create a `Loader` class.
   - Include a private property (e.g., `callbacks`) that maps each runlevel (number) to an array of callback functions. Use a data structure like a `Map<number, Array<() => Promise<any> | any>>`.
   - Include an optional `version` property to handle loader versioning.

2. **Registering Callbacks**
   - (Optional enhancement) Add a method `registerCallback(runlevel: number, callback: () => Promise<any> | any): void` to allow registration of callbacks for a specific runlevel. This method adds the callback to the internal storage under the corresponding runlevel.

   Example Prototype:
   function registerCallback(runlevel: number, callback: () => Promise<any> | any): void

3. **Implement runlevel Function**
   - Create an async method `runlevel(runlevel: number): Promise<void>`.
   - Inside the method:
     - Retrieve all registered callbacks for the given runlevel.
     - For each callback, record the start time (using `performance.now()` or `Date.now()`).
     - Execute the callback (make sure to await if it returns a Promise).
     - Record the finish time.
     - If a callback takes more than 200ms, use `console.warn` to log a warning including the runlevel and possibly the callback information.
     - Use `Promise.all` to run all callbacks concurrently and await the resolution of all callbacks before returning.

   Example Prototype:
   async runlevel(level: number): Promise<void> {
       // Retrieve callbacks array
       // Execute all callbacks concurrently and record execution time
       // Log warnings if necessary
   }

4. **Handle Versioning Conflicts**
   - At initialization, check if a global `window.loader` exists.
   - If it exists and has a lower version than the current one, issue a warning and replace it with the current instance. Otherwise, maintain the highest version.
   - Consider adding an initialization block in the Loader constructor to perform this check and assign `window.loader` accordingly.

5. **Documentation and Comments**
   - Add inline comments describing the functions, parameters, and any assumptions.
   - Document that runlevels from 0 to 10 are expected and callbacks are executed in parallel per runlevel, while the overall sequence is sequential.

## Example Code Outline

Below is an example outline that you might use as a starting point in `src/loader/loader.ts`:

--------------------------------------------------
/* Example Implementation Outline */

export type LoaderCallback = (() => Promise<any> | any);

export function runlevel() {
   if (typeof window === 'undefined') {
        throw new Error("Loader must be used in a browser environment.");
    }
   if (typeof window.loader === undefined) {
         new Loader();
   } 
    return window.loader.runlevel(...arguments);
}

export class Loader {
    private callbacks: Map<number, LoaderCallback[]> = new Map();
    public version: number;

    constructor(version: number = 1) {
        this.version = version;
        // Version check: if window.loader exists and has lower version, override it.
        if (typeof window !== 'undefined') {
            if (window.loader) {
                if (window.loader.version < this.version) {
                    console.warn("A lower version of Loader detected. Overriding with higher version.");
                    window.loader = this;
                }
            } else {
                window.loader = this;
            }
        }
    }

    /**
     * Register a callback for a specific runlevel.
     * @param runlevel - The runlevel (number between 0 and 10)
     * @param callback - The callback function to be executed during this runlevel.
     */
    public registerCallback(runlevel: number, callback: LoaderCallback): void {
        const existing = this.callbacks.get(runlevel) || [];
        existing.push(callback);
        this.callbacks.set(runlevel, existing);
    }

    /**
     * Execute all registered callbacks for the specified runlevel.
     * All callbacks are executed concurrently, and each callback's execution time is measured.
     * A warning is logged if any callback takes more than 200ms.
     * @param runlevel - The runlevel to execute.
     */
    public async runlevel(runlevel: number): Promise<void> {
        const tasks = this.callbacks.get(runlevel) || [];
        const promises = tasks.map(async (callback) => {
            const start = performance.now();
            // Execute the callback, awaiting if necessary
            await callback();
            const duration = performance.now() - start;
            if (duration > 200) {
                console.warn(`Callback in runlevel ${runlevel} took ${duration.toFixed(2)}ms`);
            }
        });
        await Promise.all(promises);
    }
}

### README.md

Create a Readme. Explain the concept of Runlevels in a multi bundel microframework environment.

/* Additional global code or export default if needed */
--------------------------------------------------

## Assumptions

- It is assumed that the functions to be implemented reside mainly inside a single Loader class in `src/loader/loader.ts`.
- Callbacks are expected to be asynchronous or synchronous; the implementation wraps them in an async function for uniform handling.
- Version control and conflict resolution are simplified by comparing a numeric `version` property on the Loader instance.
- The `performance.now()` API is used for high-resolution time measurements; if unavailable, a fallback to `Date.now()` may be considered.
- The file `src/loader/loader.md` provides usage examples but does not offer complete API details, so gaps are filled with reasonable assumptions.

This outline should provide a comprehensive guide for implementing the loader functionality based on the documentation provided.
