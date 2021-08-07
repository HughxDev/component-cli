<p align="center"><img src="https://raw.githubusercontent.com/HughxDev/component-cli/master/component-cli-logo.svg?sanitize=true" width="150" alt="logo" /></p>

<h1 align="center">Component CLI</h1>

<p align="center">Perform CRUD operations on components. Framework-agnostic.</p>

<p align="center"><a href="https://www.npmjs.com/package/@hughx/component-cli"><img src="https://img.shields.io/npm/dm/@hughx/component-cli.svg" alt="Downloads per month (NPM)"></a></p>

----

## Installation

<b>ℹ Note:</b> This documentation uses `yarn` for examples but you may substitute with the `npm` equivalents.

Per-project:

```zsh
yarn add -D @hughx/component-cli
```

Global:

```zsh
yarn global add @hughx/component-cli
```

Then, in your project directory:

```zsh
mkdir -p _templates/components/Component/
```

Currently the script outputs to `src/components`, so you’ll need to also create that directory if it doesn’t already exist. A future version may make this path configurable.

## Usage

Component CLI assumes (and enforces) that your components are organized in a modular fashion, with each component having its own directory. Beyond that, the actual file structure, frameworks, preprocessors, etc. are up to you.

In your file names and in your code, use the template variables `#component#` or `#Component#`, and the corresponding BEM- or Pascal-cased identifiers will be filled in upon execution of `component add`. You may also use the dollar sign character (`$`) instead of the hash character (`#`) in order to preserve syntax highlighting in JavaScript/TypeScript. Similarly, you may escape the delimiters to preserve syntax highlighting in CSS, e.g. `.my-\#component\# {}`.

Here is how a typical component template might look:

```
#Component#
├── #Component#.scss
├── #Component#.test.js
├── index.js
└── methods.js
```

To use the CLI, you must first build a skeleton component and place it under `_templates/components/#Component#/` in your project directory. In each file, place any scaffolding work that is common across all components.

For instance, for a React component:

```jsx
import React from 'react';

export default function $Component$() {
  return <div className="acme-#component#"></div>
};
```

(`acme` being a namespace to avoid collisions with third-party CSS.)

Then, when you run the CLI, it will copy all files and replace all template variables with the name you specify, e.g. `add Widget` would result in the following substitutions:

- `function $Component$()` → `function Widget()`
- `acme-#component#` → `acme-widget`.

Currently, the CLI only makes replacements for the following file extensions:

- `.js`
- `.jsx`
- `.ts`
- `.tsx`
- `.scss`
- `.sass`
- `.less`
- `.styl`

For more detail on usage, please see the API section.

## API

If you installed the package globally, you will invoke with `component`. This is the invocation that will be used in examples.

If you installed the package locally, you will invoke with `yarn component` (shorthand for `yarn run component`).

### Add

```zsh
component add Widget
```

This copies everything under `_templates/components/#Component#` to `src/components/Widget` and does a BEM-case replacement for `#component#`/`$component$`, and a Pascal-case replacement for `#Component#`/`$Component$`, replacing them with your new component’s name. For instance, this `index.js` template:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import './#Component#.scss';

function $Component$( props ) {
  return (
    <div data-testid="acme-#component#" className={ `acme-#component#${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

$Component$.displayName = '#Component#';

$Component$.propTypes = {
  "children": PropTypes.node,
  "className": PropTypes.string,
};

export default $Component$;
```

…becomes this:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import './Widget.scss';

function Widget( props ) {
  return (
    <div data-testid="acme-widget" className={ `acme-widget${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

Widget.displayName = 'Widget';

Widget.propTypes = {
  "children": PropTypes.node,
  "className": PropTypes.string,
};

export default Widget;
```

Subcomponents can also be added. These are useful if you want to encapsulate some functionality inside of a larger component, but this smaller component isn’t useful elsewhere in the app.

```zsh
component add Widget/Gadget
```

This creates the directory `src/components/Widget/_WidgetGadget` containing this `index.js`:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import './_WidgetGadget.scss';

function _WidgetGadget( props ) {
  return (
    <div data-testid="acme-widget__gadget" className={ `acme-widget__gadget${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

_WidgetGadget.displayName = '_WidgetGadget';

_WidgetGadget.propTypes = {
  "children": PropTypes.node,
  "className": PropTypes.string,
};

export default _WidgetGadget;
```

As you can see, the hierarchical relationship between Widget and Gadget is reflected in the naming:

1. The React display name is `_WidgetGadget`. The leading underscore indicates that the component is “private”, i.e. not meant to be used outside the context of its parent.
2. The CSS class name is `widget__gadget`. The double underscore indicates that this is a [BEM](http://getbem.com/) element `gadget` belonging to the `widget` block.

These naming conventions are not currently configurable, but may be in a future release.

### Rename

```zsh
component rename Widget Doohickey
```

This renames the directory and does a find-and-replace on its contents, as well as the contents of any nested directories one level deep (i.e., non-recursively).

### Remove

```zsh
component remove Doohickey
```
