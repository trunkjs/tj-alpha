# Mini PUG Parser

A simple parser for PUG (formerly known as Jade) templates, designed to be lightweight and easy to use. This parser is built with the goal of providing a minimalistic approach to parsing PUG syntax without the overhead of larger libraries.


## Limitations

MPug does not support all features of PUG, such as:

- Mixins
- Includes
- Interpolation
- Filters
- Multiline text


## Features
- Suppoerts multipe attributes with the same name (e.g. *for="item" and *if="item2"*).


## Usage

```pug
div#container
    p This is a simple PUG template.
    div.container
        h1 Hello, World!
        p#id1.class1(data-attrib="some text") This is escaped text with an attribute.
        #id2.class2 !<strong> This is unescaped html.</strong>
```
