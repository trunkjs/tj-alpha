# Content-Area

ContentArea parses the `layout`attribute of html elements and wrap them into dedicated html elements.

This is useful for rendering Markdown content with Parsedown annotions.

## Usage

```markdown
## Header 1
{: layout="1.5:div.box; style='color: red;'"}

Some Paragraph with a **bold** text.


```

Will be rendered as:

```html
<div class="box" style="color: red;">
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



