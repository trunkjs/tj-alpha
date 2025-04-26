# Application Loader

Runlevel Based Application Loader for Micro-Frontend Components.

## Usage

Inside a bundel:

```javascript
await runlevel(5);
```


Fron outside: (will be executed as soon as the loader is ready)

```javascript
window.onloaderready = async() => {
    await window.loader.runlevel(5);
}
```

Or Event driven:
    
```javascript
window.addEventListener("loaderready", async () => {
    await window.loader.runlevel(5);
});
```

## The Runlevels

The Runlevels are run each from 0-10 in ascending order. The Callbacks of each runlevel are executed
in parallel and waited for all to finish before the next runlevel is started.

The loader will observe the start sequence and record the for each callback the time it took to finish.
If a callback takes more than 200ms to complete a warning is issued.

If multiple bundles have different loader versions, a warning is issued and the loader with the highest version is used.
Make sure to not overwrite callbacks of the older loader.

