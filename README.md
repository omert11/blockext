<style>
    h1{
		font-size:45px;
		color:#a2d2ff;
    }
    h2{
		font-size:25px;
		color:#cdb4db;
    }
    h3{
		font-size:16px;
		color:#bde0fe;
    }
	.tag::before{
		content:"["attr(tag-type)"] ";
		font-size:12px;
		color:#ffafcc;
        font-weight:900;
	}
    
</style>

# Blockext

Frontend Based Template Engine!

Easily render your template via attributes without using a different structure.

**Table of Contents**

-   [Blockext](#blockext)

    -   [Installation](#installation)
    -   [Get started](#get-started)
    -   [Tags](#tags)

        -   [for (loop)](#for)
        -   [as-template & get-template](#as-template--get-template)
        -   [context](#context)
        -   [break](#break)
        -   [break-is](#break-is)
        -   [show-is](#show-is)
        -   [get-text](#get-text)
        -   [get-value](#get-value)

-   [License](#license)

## Installation

Installation;

`npm install --save blockext`

or

`www.cdn.com`

or

`Download raw zip file use files from dist`

## Get started

```html
<foo id="bx-holder">
    ....
    <div bx-main></div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render();
</script>
```

## Functions

### Render()

It renders the bx-main attribute fields under the specified dom object. It finds the tags used and processes them in line with their purposes.

```html
<foo id="bx-holder">
    ....
    <div bx-main id="main-1">... Rendered ...</div>
    <div bx-main id="main-2">... Rendered ...</div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render();
</script>
```

### Clean()

Cleans the rendered template and returns it to its original state.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <p bx-each-id="{n}"></p>
        <p bx-each-id="{n}"></p>
        ...
        <p bx-each-id="{n}"></p>
    </div>
    ...
</foo>
<script>
    ...
    bX.clean();
</script>
```

Expected output

```html
...
<foo id="bx-holder">
    ....
    <div bx-main>
        <p bx-for="this"></p>
    </div>
    ...
</foo>
...
```

## Tags

<h3 class="tag" tag-type="each">For</h3>

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <p bx-for="this"></p>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render([0, 1, 2, 3, 4]);
</script>
```

Expected output

```html
...
<div bx-main>
    <p bx-each-id="{n}"></p>
    <p bx-each-id="{n}"></p>
    ...
    <p bx-each-id="{n}"></p>
</div>
...
```

<h3 class="tag" tag-type="block">As template & Get template</h3>
Save the template and call it wherever you want.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <i bx-as-template="star">star</i>
        <p bx-for="this" bx-get-template="star"></p>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render([0, 1, 2, 3, 4]);
</script>
```

Expected output

```html
...
<div bx-main>
    <p bx-each-id="{n}">
        <i>star</i>
    </p>
    <p bx-each-id="{n}">
        <i>star</i>
    </p>
    ...
    <p bx-each-id="{n}">
        <i>star</i>
    </p>
</div>
...
```

<h3 class="tag" tag-type="block">Context</h3>

Assign a different reference to the context.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <div bx-context="foo">
            <p bx-get-text="bar"></p>
            <p bx-get-text="baz.0"></p>
        </div>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render({
        foo: {
            bar: 1,
            baz: [0, 1, 2],
        },
    });
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-context="foo">
        <p bx-get-text="bar">1</p>
        <p bx-get-text="baz.0">0</p>
    </div>
</div>
...
```

<h3 class="tag" tag-type="block">Break</h3>

Any element under this tag will not be processed.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <p bx-for="this">Render Me</p>
        <div bx-break>
            <div bx-as-template="inaccessible">Pls don't render me!!</div>
        </div>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render([0, 1]);
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-main>
        <p bx-each-index="{n}">Render Me</p>
        <p bx-each-index="{n}">Render Me</p>
        <div bx-break>
            <div bx-as-template="inaccessible">Pls don't render me!!</div>
        </div>
    </div>
</div>
...
```

<h3 class="tag" tag-type="block">Break is</h3>
No items under this tag are created when the data is undefined or empty.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <div bx-break-is="foo">
            <p bx-for="foo">Render Me</p>
        </div>
        <div bx-break-is="bar">
            <p bx-for="bar">Pls don't render me!!</p>
        </div>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render({
        foo: [0, 1],
    });
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-main>
        <div bx-break-is="foo">
            <p bx-each-index="{n}">Render Me</p>
            <p bx-each-index="{n}">Render Me</p>
        </div>
        <div bx-break-is="bar">
            <p bx-for="bar">Pls don't render me!!</p>
        </div>
    </div>
</div>
...
```

<h3 class="tag" tag-type="block">Show is</h3>

This element becomes visible when data is defined.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <div bx-show-is="foo" style="display:none">
            <p bx-for="foo">Show Me</p>
        </div>
        <div bx-show-is="bar" style="display:none">
            <p bx-for="bar">Pls don't show me!!</p>
        </div>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render({
        foo: [0, 1],
    });
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-main>
        <div bx-show-is="foo">
            <p bx-for="foo">Show Me</p>
        </div>
        <div bx-show-is="bar" style="display:none">
            <p bx-for="bar">Pls don't show me!!</p>
        </div>
    </div>
</div>
...
```

<h3 class="tag" tag-type="helper">Get text</h3>
Assigns the data referenced to the context to the text content.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <p bx-get-text="foo"></p>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render({
        foo: "Bar",
    });
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-main>
        <p bx-get-text="foo">Bar</p>
    </div>
</div>
...
```

<h3 class="tag" tag-type="helper">Get value</h3>
Assigns the data referenced to the context to the value content.

```html
<foo id="bx-holder">
    ....
    <div bx-main>
        <input bx-get-value="foo" value=""></input>
    </div>
    ...
</foo>
<script>
    const bX = new Blockext("#bx-holder");
    bX.render({
        foo: "Bar",
    });
</script>
```

Expected output

```html
...
<div bx-main>
    <div bx-main>
        <input bx-get-value="foo" value="Bar"></input>
    </div>
</div>
...
```

## License

License Blockext is licensed under the MIT license. Open Sans is licensed under the Apache license`
