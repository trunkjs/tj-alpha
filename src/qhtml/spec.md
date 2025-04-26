# QHtml is a shortcut language for HTML

Short syntax and on the fly compilation written in TypeScript.


## Usage

```typescript

const tpl = qhtml`
div class="class1" .class2 #id %% Comment
> div onclick="alert( \"Hello World\" )"
>> p
| Some Text inside the P element
> p | Some Text inside the P element
.class1 
> 
`;

```

## Features

- Shortcuts for classes (".classname" => "class=\"classname\"") and ids ("#idname" => "id=\"idname\"")
- Escaped characters (e.g. `\"` for double quotes)
- Nested elements (e.g. `>>` for child elements)
- Text nodes (e.g. `|` for text content)
- no need to write div (default element id div)
- Number of > defines the depth of the element
