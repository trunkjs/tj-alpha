# Content-Area

ContentArea parses the `layout`attribute of html elements and wrap them into dedicated html elements.

This is useful for rendering Markdown with Parsedown annotions.

## Usage

```markdown
## Header 1
{: layout="1.:div.box(style='color: red;')"}

Some Paragraph with a **bold** text.


```

Will be rendered as:

```html
<div i="1.0" class="box" style="color: red;">
    <h2>Header 1</h2>
    <p>Some Paragraph with a <strong>bold</strong> text.</p>
</div>
```


## Layout definition:

```
(<i>:)(<use>;)<attrribute: value>
```

## Example

```markdown
2:div.box; style: 'color: red;'; hidden; 
```



---

# Comprehensive Guide

> A detailed README for both developers integrating Content-Area into their own projects and for end-users who only need to know how to write content that leverages the `layout` attribute.

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Getting Started](#getting-started)  
   3.1. [Prerequisites](#prerequisites)  
   3.2. [Installation](#installation)  
   3.3. [Quick Start](#quick-start)  
4. [The `layout` Attribute Explained](#the-layout-attribute-explained)  
   4.1. [Index (`i`)](#index-i)  
   4.2. [Modifiers](#modifiers)  
   4.3. [Tag, Classes & ID](#tag-classes--id)  
   4.4. [Inline Attributes](#inline-attributes)  
5. [Runtime Architecture](#runtime-architecture)  
   5.1. [ContentBuilder](#contentbuilder)  
   5.2. [LayoutParser](#layoutparser)  
   5.3. [ElementI](#elementi)  
6. [Custom Elements](#custom-elements)  
   6.1. [`<tj-content-area>`](#tj-content-area)  
   6.2. [Slot Management](#slot-management)  
7. [Responsive Behaviour](#responsive-behaviour)  
8. [Testing](#testing)  
9. [Contributing](#contributing)  
10. [Roadmap](#roadmap)  
11. [License](#license)  
12. [Authors & Acknowledgements](#authors--acknowledgements)

---

## Introduction
Content-Area is a lightweight client-side utility that transforms “annotated” HTML (often generated from Markdown) into semantically rich, nested markup.  
By decorating individual elements with a `layout` attribute (or simply by using heading levels as shorthand), writers can control the final HTML structure without leaving the comfort of Markdown.

Typical use-cases include:
* Building complex article layouts within CMSs that only support Markdown.
* Creating design-system aware documentation sites.
* Generating slide decks or handouts where each `layout` instruction defines a new slide/section.

---

## Features
* ⚡ **Fast**: Zero-dependency parsing logic runs entirely in the browser.
* 🖇 **Declarative**: Authors describe structure; Content-Area does the heavy lifting.
* 📐 **Fine-grained control**: Index & modifier system (`i`, `+`, `-`) dictates wrapping behaviour.
* 🔌 **Framework-agnostic**: Works with vanilla JS, Lit, React, Vue or any framework that outputs HTML.
* 🧪 **Well-tested**: Comprehensive unit tests via Vitest.
* 📱 **Responsive**: Optional integration with `TjResponsive` for breakpoint-aware class toggling.

---

## Getting Started

### Prerequisites
* Modern browser (ES6+).
* Node ≥ 18 (for building or running tests).
* Package manager of your choice (npm, pnpm or yarn).

### Installation
```bash
npm i @your-scope/content-area
```
or include the compiled bundle directly:
```html
<script src="dist/content-area.web.js" type="module"></script>
```

### Quick Start
```html
<tj-content-area>
  <h2 layout="1:section.card">First Card</h2>
  <p>This paragraph will live inside the section tagged <code>.card</code>.</p>

  <h3 layout="+1:div.card__footer">Footer <em>(appended)</em></h3>
</tj-content-area>
```
The script will output:
```html
<section class="card">
  <h2>First Card</h2>
  <p>…</p>
  <div class="card__footer">
    <h3>Footer <em>(appended)</em></h3>
  </div>
</section>
```

---

## The `layout` Attribute Explained

### Index (`i`)
Defines the hierarchical level at which an element should open a new container.  
Fractional parts allow intermediate depths:

| Syntax | Meaning |
|--------|---------|
| `1`    | first level (e.g., article) |
| `1.5`  | halfway between level 1 and 2 |
| `+2`   | append to the most-recent level 2 container |
| `-`    | **skip**: do not wrap, render as-is |

### Modifiers
* `+` (plus)   Append to existing container at the same index.  
* `-` (dash)   Skip processing entirely.

### Tag, Classes & ID
After the optional index and colon, a Pug-like expression defines the wrapper:
```
div.card#main
```
* `div` → tag  
* `.card` → class  
* `#main` → id  

Multiple classes allowed:
```
section.card.primary.xl
```

### Inline Attributes
Parentheses encode arbitrary HTML attributes:
```
div.card(style='--bg: red;' hidden)
```
* Key without value (`hidden`) becomes boolean `true`.

---

## Runtime Architecture

### ContentBuilder
Located in `src/content-area/ContentBuilder.ts`.  
Responsible for:
1. Traversing child nodes of `<tj-content-area>`.
2. Delegating layout detection to `LayoutParser`.
3. Creating or re-using wrapper containers.
4. Appending or skipping nodes based on `ElementI` rules.

### LayoutParser
Parses the `layout` string into a structured `Layout` object consisting of:
* `i` (index string)
* `tag`
* `inlineClasses`
* `attributes`
* `id`

Unit tests live in `helper/test/LayoutParser.test.ts`.

### ElementI
Encapsulates the numeric index & modifier logic.  
Important helpers:
* `getNasInt()` → returns integer representation (e.g., `1.5` → `15`)
* `getNasString()` → returns canonical string
* `getModifier()` → returns `APPEND`, `SKIP` or `null`

---

## Custom Elements

### `<tj-content-area>`
Web component that acts as the root for Content-Area processing.  
Drop it anywhere inside your HTML, populate with raw content, and on `connectedCallback` it rearranges the DOM.

Props _(coming soon)_:
| Property | Type | Description |
|----------|------|-------------|
| `watch`  | Boolean | Re-runs arrange logic when new children are added. |

### Slot Management
`slot-maschine.ts` helps wire arbitrary content into ShadowDOM slots by querying `slot[select]` definitions.  
Example:
```html
<slot name="hero" select="h1, h2"></slot>
<slot name="media" select=".gif || img[src$='.webm']"></slot>
```

---

## Responsive Behaviour
Combined with `TjResponsive`, wrappers can carry responsive class tokens:
```markdown
1:section.card.-md:card--compact
```
Where `-md:` is automatically toggled when the viewport hits the `md` breakpoint.

---

## Testing
Run the unit-test suite:
```bash
npm test
```
Vitest watches for changes and provides coverage information.

---

## Contributing
We welcome contributions of any size!

1. Fork the repo.
2. `git checkout -b feat/my-awesome-improvement`
3. Write code & tests.
4. `npm run lint && npm test`
5. Open a pull request.

Refer to `CONTRIBUTING.md` for detailed guidelines (code style, commit message conventions, CLA).

---

## Roadmap
* SSR compatibility.
* Live observers for dynamic content injection.
* TypeScript strict-mode cleanup.
* Visual editor plugin for WYSIWYG builders.

---

## License
MIT © Your-Name-Here

---

## Authors & Acknowledgements
* **Primary author**: Jane Doe (@jane)  
* **Maintainers**: John Smith, Ravi Patel  
* Inspired by [Pug](https://pugjs.org) syntax and [Parsedown](https://parsedown.org). Special thanks to the open-source community for continuous feedback and pull-requests.
