---
slugName: table-block-parser
includeFiles:
- src/markdown/ul-li-block-parser.ts
- src/markdown/test/ul-li-block-parser.test.ts
- src/markdown/parse-markdown-blocks.ts
- src/markdown/ast-to-html.ts
- src/markdown/types.ts
- src/markdown/parse-inline-markdown.ts
editFiles:
- src/markdown/table-block-parser.ts
- src/markdown/test/table-block-parser.test.ts
- src/markdown/parse-markdown-blocks.ts
- src/markdown/ast-to-html.ts
- src/markdown/types.ts
- src/markdown/parse-inline-markdown.ts
original_prompt: Add a table-block-parser according to ul-li-parser and create test
  cases. It should support tables with and without header and other features that
  jekyll supports. It should support left center right alignment. Kramdown for the
  whole table and row. It should support inline elements within each cell. The generated
  content should support thead tbody and tfoot. Refer to jekyll default behaviour
  for other edge cases. The thead and tbody tfooter are inline elements table-head
  table-body and table-footer with subelements table-cell.
---
# Prepare Add table-block-parser

Introduce full Markdown table support analogous to the existing ul-li-block-parser.  
Parser must recognise Kramdown/Jekyll table dialects, handle optional header row, alignment colons, `thead` / `tbody` / `tfoot` generation, inline-markdown for each cell and expose a rich AST that other parts of the system can consume.

## Missing Information

None – we replicate Jekyll’s default behaviour; interpretation details are well-documented.

## Tasks

- **parser-core** Implement `table-block-parser.ts` that converts a `MarkdownBlockElement` of type `table` into a tree of `InlineMarkdownElement`s (`table-head`, `table-body`, `table-footer`, `table-cell`).
- **block-dispatch** Hook the new parser into `parse-markdown-blocks.ts` so `children` is filled for table blocks.
- **ast-html** Extend `ast-to-html.ts` to render the new AST nodes to real `<table><thead>…</thead><tbody>…</tbody><tfoot>…</tfoot></table>`.
- **typing** Add new enum literals to `types.ts` & `parse-inline-markdown.ts` to reflect new node kinds.
- **inline-support** Ensure `parse-inline-markdown.ts` is invoked for every cell so emphasis, links, etc. still work.
- **tests** Create `table-block-parser.test.ts` with exhaustive edge-cases (headerless, alignments, mixed rows, tfoot, inline html etc.).

## Overview: File changes

- **src/markdown/table-block-parser.ts** New file – contains full parser logic (+ helper functions).
- **src/markdown/test/table-block-parser.test.ts** New Vitest suite mirroring style of `ul-li-block-parser.test.ts`.
- **src/markdown/parse-markdown-blocks.ts** Detect table blocks (`|` first-char) and delegate to new parser.
- **src/markdown/ast-to-html.ts** Convert parsed table AST into DOM; honour align settings via `text-align`.
- **src/markdown/types.ts** Extend `type` union and adjust interface for table sub-elements.
- **src/markdown/parse-inline-markdown.ts** Extend `InlineMarkdownElement['type']` union with `table-*`.

## Detail changes

### src/markdown/table-block-parser.ts

**Referenced Tasks**
- **parser-core**

Add new module exporting:
```
export function tableBlockParser(block: MarkdownBlockElement): InlineMarkdownElement[]
```
Algorithm:
1. Split `content_raw` into physical lines, normalise EOL.
2. Identify separator line (contains only `|` and `-` and maybe `:`) – marks presence of header.
3. For each row read cells with RegExp `/(?:^|\\|)\\s*([^|]*)/`.
4. Determine per-column alignment by inspecting `:` placement in separator.
5. Build tree:
```
{
  type: 'table-head', content: [ {type:'table-cell', align:'left'|'center'|'right', content: parse_inline_markdown(...)} , ...]
}
```
Similar for body/tfoot.
6. Return `[tableHead, tableBody, tableFoot]` (where missing parts are omitted).

### src/markdown/test/table-block-parser.test.ts

**Referenced Tasks**
- **tests**

Create ~10 tests:
- basic table with header
- table without header
- left/center/right align
- tfoot separated by blank line and `{-}` fence (Jekyll)
- inline emphasis inside cell
- empty block returns []

Use helpers from existing ul-li test to get text inside cells.

### src/markdown/parse-markdown-blocks.ts

**Referenced Tasks**
- **block-dispatch**

Inside `readBlock()` detection section change:
```
} else if (current_line.startsWith("|")) {
    current.type = "table";
```
After finishing a table block add:
```
if (current.type === "table") {
    current.children = tableBlockParser(current);
}
```
Import at top:
```
import { tableBlockParser } from "@/markdown/table-block-parser";
```

### src/markdown/ast-to-html.ts

**Referenced Tasks**
- **ast-html**

Add case `"table"`:  
1. Build `<table>` root.  
2. Iterate over `children` – for `table-head|body|footer` create corresponding section element (`thead`, `tbody`, `tfoot`).  
3. For each `table-cell` produce `<td>` or `<th>` dependent on parent; set `style.textAlign=` according to `align` attr.  
4. Append rows in order.

Remember to support multiple rows per container.

### src/markdown/types.ts

**Referenced Tasks**
- **typing**

Extend `MarkdownBlockElement['type']` union by `"table-head" | "table-body" | "table-footer" | "table-cell"` if necessary or add separate interfaces; simplest: keep top-level block `"table"` but `InlineMarkdownElement['type']` extended with sub types.

### src/markdown/parse-inline-markdown.ts

**Referenced Tasks**
- **inline-support**, **typing**

Extend union:
```
| 'table-head' | 'table-body' | 'table-footer' | 'table-cell'
```
No parser change needed otherwise.

### src/markdown/test/table-block-parser.test.ts

**Referenced Tasks**
- **tests**

Follow style of `ul-li-block-parser.test.ts`.  
Example snippet:
```
const block = mdTableBlock(`| a | **b** |
| - | :-: |
| c | d |`);
const roots = tableBlockParser(block);
expect(roots[0].type).toBe('table-head');
expect(textOf(cellOf(roots[0],0))).toBe('a');
...
```

---

With these changes the new table feature integrates seamlessly with the existing Markdown processing pipeline while maintaining test-coverage parity with list parsing.