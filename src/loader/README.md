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

Or event-driven approach:

```javascript
window.addEventListener("loaderready", async () => {
    await window.loader.runlevel(5);
});
```

## The Runlevels

The runlevels are executed sequentially from 0 to 10 in ascending order. The callbacks for each runlevel are executed in parallel, and the system waits for all to complete before proceeding to the next runlevel.

The loader will monitor the startup sequence and record the time each callback takes to complete. If a callback exceeds 200ms, a warning is issued.

If multiple bundles use different versions of the loader, a warning is issued, and the highest version is used. To maintain compatibility, ensure that older loader callbacks are not overwritten.