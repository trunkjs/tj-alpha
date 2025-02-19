The Responsive module provides a easy way to define breakpoints outside CSS media querys which are processed
by js.

## Breakpoints

The Breakpoints defined in window.config.breakpoints and default to the bootstrap breakpoints.



## Class Features

```html
<div class="-xl:d-none xl:d-block lg-xxl:text-red>"></div>
```

Meaning:
-xl : Below xl breakpoint
xl : Above xl breakpoint
lg-xxl : Between lg and xxl breakpoint

Breakpoints are inclusive.


## Style Features

```html
<div style="display:none" xl-style="dispay:block;color: red"></div>
```


Will add the style display:block and color: red when the xl breakpoint is reached.


## Features

- The adjust-process must be repeatable and idempotent. So the original values have to be stored and restored.


## API

The TjResponsive Class should bind to different types of dom: Root Dom or Shadow dom or adjust single Elmements.
