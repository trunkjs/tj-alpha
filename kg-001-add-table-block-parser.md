---
slugName: add-table-block-parser
includeFiles:
- src/markdown/ul-li-block-parser.ts
- src/markdown/test/ul-li-block-parser.test.ts
- src/markdown/parse-markdown-blocks.ts
- src/markdown/ast-to-html.ts
- src/markdown/parse-inline-markdown.ts
- src/markdown/types.ts
- src/markdown/test/ast-to-html.test.ts
editFiles:
    - src/markdown/test/table-block-parser.test.ts
    - src/markdown/table-block-parser.ts
    - src/markdown/parse-markdown-blocks.ts
    - src/markdown/ast-to-html.ts
    - src/markdown/types.ts
    - src/markdown/test/ast-to-html.test.ts
    - src/markdown/README-table-parser.md
original_prompt: Add a table-block-parser according to ul-li-parser and create test
  cases. It should support tables with and without header and other features that
  jekyll supports. It should support left center right alignment. Kramdown for the
  whole table and row. It should support inline elements within each cell. The generated
  content should support thead tbody and tfoot. Refer to jekyll default behaviour
  for other edge cases. The thead and tbody tfooter are inline elements table-head
  table-body and table-footer with subelements table-cell.
---
# Prepare Add Table Block Parser

Introduce a `table-block-parser` that converts GitHub/Jekyll style markdown tables into a structured Inline-AST similar to `ul-li-block-parser`.  
Key-features to support:

* headerless & headered tables
* left / center / right alignment via `:---`, `:---:`, `---:`
* inline-markdown formatting inside cells
* `{:.klass #id}` kramdown after entire table **and/or** after individual rows
* generation of InlineMarkdownElement tree  
  • table-head / table-body / table-footer  
  • table-cell children
* output html uses `<table><thead><tbody><tfoot>` (ast-to-html)

## Tasks

- **create-table-block-parser**  implement full parser with nesting & kramdown (≤160)
- **table-block-tests**  edge-case vitest suite similar to ul-li tests (≤160)
- **extend-block-detector**  parse_markdown_blocks: detect table blocks (≤160)
- **render-table-html**  ast-to-html: convert table AST → real DOM (≤160)
- **update-types**  add `"table"` block type & new inline element literals (≤160)
- **adjust-existing-tests**  extend ast-to-html test for table (≤160)

## Overview: File changes

- **src/markdown/table-block-parser.ts** new file implementing parser
- **src/markdown/test/table-block-parser.test.ts** test cases
- **src/markdown/parse-markdown-blocks.ts** recognise table blocks and call parser
- **src/markdown/ast-to-html.ts** html generation for table
- **src/markdown/types.ts** extend enum lists
- **src/markdown/test/ast-to-html.test.ts** new expectations
- **src/markdown/README-table-parser.md** (optional) developer doc

## Detail changes

### src/markdown/table-block-parser.ts

**Referenced Tasks**
- **create-table-block-parser**

Add complete implementation:

```ts
import { MarkdownBlockElement } from "@/markdown/types";
import { InlineMarkdownElement, parse_inline_markdown } from "@/markdown/parse-inline-markdown";

/**
 * Similar contract as ulLiBlockParser. Returns a single root “table” Inline element.
 */
export function tableBlockParser(block: MarkdownBlockElement): InlineMarkdownElement[] {
    if (block.type !== "table") return [];

    // 1. split lines, isolate kramdown trailing lines
    // 2. detect alignment row (---, :---, etc.)
    // 3. build head/body rows accordingly
    // 4. parse_inline_markdown on every cell, push as table-cell
    // 5. wrap header rows inside table-head, others inside table-body
    // 6. attach block.kramdown & row-level kramdown
}
export const ALIGN_LEFT = "left"; /* … */
```

Include helper `parseAlignment()` etc. Cover tfoot when `{:tfoot}` marker present after last separator row.

### src/markdown/test/table-block-parser.test.ts

**Referenced Tasks**
- **table-block-tests**

Vitest cases:

* simple table with header row
* table without header
* alignments l/c/r mix
* inline formatting (`**bold**`)
* kramdown after table `{:.klass}` and after row `{:.row-k}`
* blank lines inside table ignored
* verifies resulting element hierarchy and text content

### src/markdown/parse-markdown-blocks.ts

**Referenced Tasks**
- **extend-block-detector**

Inside `readBlock()` detection:

```ts
} else if (/^\s*\|? *:?-+/.test(current_line)) { // probable table
    current.type = "table";
}
```

At end of block, if `current.type==='table'` call `tableBlockParser(current);`

### src/markdown/ast-to-html.ts

**Referenced Tasks**
- **render-table-html**

Add case `"table"`:

```ts
case "table":
    const table = document.createElement("table");
    // build thead / tbody / tfoot from inline elements
    // iterate children to append
    fragment.appendChild(table);
    break;
```

Helper converts table-head etc. to real tags and uses `buildAttributes` for kramdown.

### src/markdown/types.ts

**Referenced Tasks**
- **update-types**

* add `'table'` to MarkdownBlockElement.type union (already exists) ensure inline types include table-head/body/footer/cell (already present).
* no breaking changes.

### src/markdown/test/ast-to-html.test.ts

**Referenced Tasks**
- **adjust-existing-tests**

Add test verifying table renders expected `<thead>` etc.

```ts
it("renders a markdown table", () => { ... })
```

### src/markdown/README-table-parser.md (optional)

Explain algorithm and limitations for future devs.
