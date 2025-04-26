# Application Loader

Runlevel Based Application Loader for Micro-Frontend Components.

## Usage

Inside a bundle:

```javascript
await runlevel(5);
```

From outside (will be executed as soon as the loader is ready):

```javascript
window.onloaderready = async () => {
    await window.loader.runlevel(5);
};
```

Or event-driven:

```javascript
window.addEventListener("loaderready", async () => {
    await window.loader.runlevel(5);
});
```

## The Runlevels

The runlevels are executed sequentially from 0 to 10 in ascending order. The callbacks for each runlevel are executed in parallel, and the system waits for all to complete before proceeding to the next runlevel.

The loader now orchestrates execution using a new internal `run()` method:
- **Runlevel 0** executes immediately.
- **Runlevels 1–4** execute once the document body is ready.
- **Runlevels 5–9** execute after the DOM content is fully loaded.
- **Runlevel 10** executes after the window load event (when everything is fully loaded).

### Ensuring Proper Execution Order
Each runlevel now returns a `Promise` that resolves only when all callbacks at that level have completed. This guarantees that if a component uses:

```javascript
await runlevel(n);
```

it will pause execution until the corresponding phase of initialization has finished and all registered callbacks for that runlevel have executed.

### Performance Monitoring
- The loader monitors execution times and logs warnings for any callback that exceeds **200ms**.
- If multiple bundles use different loader versions, a warning is issued, and the highest version is used.
- Developers should ensure they do not overwrite previously registered callbacks from an older loader.

By leveraging this updated loader mechanism, applications can achieve structured loading and initialization with improved synchronization and reliability.
