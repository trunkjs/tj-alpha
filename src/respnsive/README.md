# Responsive Module

The **Responsive Module** provides an easy way to define breakpoints outside of CSS media queries, allowing dynamic DOM updates using JavaScript.

## Breakpoints

Breakpoints are defined in `window.config.breakpoints` and default to Bootstrap's breakpoint system:

- **xs**: 0px
- **sm**: 576px
- **md**: 768px
- **lg**: 992px
- **xl**: 1200px
- **xxl**: 1400px

You can override these values by configuring `window.config.breakpoints`.

## Class-Based Features

The module allows class names to be applied dynamically based on breakpoints.

```html
<div class="-xl:d-none xl:d-block lg-xxl:text-red"></div>
```

### Explanation:
- **`-xl:`** → This class applies **below** the `xl` breakpoint.
- **`xl:`** → This class applies **above** the `xl` breakpoint.
- **`lg-xxl:`** → This class applies **between** `lg` and `xxl` breakpoints.

### Example Behavior:
- When the viewport width is **1300px**, the `xl:d-block` rule applies, making the element visible.
- When the viewport width is **500px**, the `-xl:d-none` rule applies, hiding the element.

## Style-Based Features

You can also define inline styles for different breakpoints using `*-style` attributes.

```html
<div style="display:none" xl-style="display:block;color:red"></div>
```

### Behavior:
- When the viewport width reaches the `xl` breakpoint, `display:block` and `color:red` are applied.

## Features

- **Idempotency:** The adjustment process is repeatable, meaning original classes and styles are stored and restored appropriately.
- **Mutation Observation:** The module dynamically adjusts content when DOM elements are added or modified.

## API and Usage

### Import and Initialize:

```typescript
import { TjResponsive } from "./responsive";

const responsive = new TjResponsive();
responsive.adjust(document.body);
responsive.observe(document.body);
```

### Methods:

- **`adjust(target: HTMLElement)`**  
  Adjusts and applies responsive classes and styles to the target element and its children.

- **`observe(target: HTMLElement)`**  
  Observes changes in the DOM and dynamically applies responsive styles and classes.

This enables responsive designs without relying solely on CSS media queries.