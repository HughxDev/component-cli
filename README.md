<p align="center"><img src="https://raw.githubusercontent.com/hguiney/component-cli/master/component-cli.svg?sanitize=true" width="150" alt="logo" /></p>

<h1 align="center">Component CLI</h1>

<p align="center">Perform CRUD operations on components. Framework-agnostic.</p>

<p align="center"><a href="https://www.npmjs.com/package/@hughx/component-cli"><img src="https://img.shields.io/npm/dm/@hughx/component-cli.svg" alt="Downloads per month (NPM)"></a></p>

----

## Installation

<b>ℹ Note:</b> This documentation uses `yarn` for examples but you may substitute with the `npm` equivalents.

Per-project:

```zsh
yarn add -D component-cli
```

Global:

```zsh
yarn global add component-cli
```

Then, in your project directory:

```zsh
mkdir -p _templates/components/Component/
```

Currently the script outputs to `src/components`, so you’ll need to also create that directory if it doesn’t already exist. A future version may make this path configurable.

## Usage

Component CLI assumes (and enforces) that your components are organized in a modular fashion, with each component having its own directory. Beyond that, the actual file structure, frameworks, preprocessors, etc. are up to you. Here is how a typical component tree might look:

```
Component
├── Component.scss
├── Component.test.js
├── index.js
└── methods.js
```

To use the CLI, you must first build a skeleton component and place it under `_templates/components/Component/` in your project directory. In each file, place any scaffolding work that is common across all components. For instance, for a React component:

```jsx
import React from 'react';

export default function Component() {
  return <div className="acme-component"></div>
};
```

(`acme` being a namespace to avoid collisions with third-party CSS.)

Then, when you run the CLI, it will replace all instances of the word “component” or “Component” (case-preserving) with the name you specify, e.g. `function Component()` → `function Widget()`, `acme-component` → `acme-widget`.

<b>⚠️ Known issue:</b> This means that if you use the word “component” in the HTML or in a comment, it too will be replaced. A future version may switch to delimiter-based replacement.

For more detail on usage, please see the API section.

## API

If you installed the package globally, you will invoke with `component`. This is the invocation that will be used in examples.

If you installed the package locally, you will invoke with `yarn component` (shorthand for `yarn run component`).

### Add

```bash
component add Widget
```

This copies everything under `_templates/components/Component` to `src/components/Widget` and does a case-preserving find-and-replace on the term “component”, replacing it with your new component’s name. For instance, this `index.js` template:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import './Component.scss';

function Component( props ) {
  return (
    <div data-testid="acme-component" className={ `acme-component${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

Component.displayName = 'Component';

Component.propTypes = {
  "children": PropTypes.node,
  "className": PropTypes.string,
};

export default Component;
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

```bash
component add Widget/Gadget
```

This creates the directory `src/components/Widget/_WidgetGadget` containing this `index.js`:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

import './WidgetGadget.scss';

function WidgetGadget( props ) {
  return (
    <div data-testid="acme-widget__gadget" className={ `acme-widget__gadget${props.className ? ` ${props.className}` : ''}` }>
      { props.children }
    </div>
  );
}

WidgetGadget.displayName = 'WidgetGadget';

WidgetGadget.propTypes = {
  "children": PropTypes.node,
  "className": PropTypes.string,
};

export default WidgetGadget;
```

As you can see, the hierarchical relationship between Widget and Gadget is reflected in the naming. The React display name is `WidgetGadget`, and the CSS class name uses a [BEM](http://getbem.com/) element `gadget` belonging to the `widget` block, i.e. `widget__gadget`.

### Rename

```bash
component rename Widget Doohickey
```

This renames the directory and does a find-and-replace on its contents.

<b>⚠️ Known issue:</b> The component renaming algorithm does not fully find/replace on subcomponents.

### Remove

```bash
component remove Doohickey
```
