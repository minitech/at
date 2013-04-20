# @

@ is another template engine. All the rest of them have too many features.

## Syntax

If there’s an `@` at the beginning of a line (excluding tabs and spaces at the beginning of a line), it’s treated as code. For example:

```html
@ if(false) {
	<p>Strange things are happening.</p>
@ } else {
	<p>Oh, good.</p>
@ }
```

Outside of those code blocks, `@(…)` sections are treated as expressions and inserted as text, escaped as HTML. For raw HTML, use `@!(…)`. It even counts parentheses, so you can totally do things like this:

```html
Operator precedence! <code>(5 + 3) * (2 + 8) = @((5 + 3) * (2 + 8))</code>
```

If you have an ambiguity with `@(` appearing at the start of a line that should be a code block, just put a space between then:

```html
@ (odd + prototypes).whatever();
```

## Installation

    npm install at

## Usage

```js
var at = require('at');
var template = at.compile('@(data.subject) is simplish!');

template({subject: '@'}) // @ is simplish!
```
