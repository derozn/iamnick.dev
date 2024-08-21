# Design System Package

## Editor Setup

## Intellisense

Install the Tailwind VSCode extension for intellisense of the theme 👉 https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss

We also use Tailwind Variants, to get this working for VSCode add the following snippet to your settings.json (VSCode)

```
"tailwindCSS.experimental.classRegex": [
  ["tv\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
]
```

Read more here https://www.tailwind-variants.org/docs/getting-started

---

## Theme

> Please refer to https://tailwindcss.com/docs/theme for an overview of Tailwind theming

### Design Tokens

Design tokens are exported from Figma and converted using [Style-Dictionary](https://amzn.github.io/style-dictionary/#/) This allows for the tokens to be converted into Typescript ready for usage.

To update design tokens do the following:

- Add the new JSON tokens file to `src/tokens/properties/variables.json`
- Run `yarn build-dictionary` - this will then output the design tokens into the correct format which can be viewed in `src/tokens/output`

### Tailwind Tokens

With the design tokens exported, they need to be translated so tailwind can consume them. Tailwind have top level categories i.e colors, fontFamily, fontSize etc.. each one of these can then be extended/overriden to use the design tokens instead.

There is a custom preset `src/tokens/dictionary/presets/tailwind` which converts design tokens to the correct tailwind structure. This is then to be used within the `tailwind.config` file.

### Understanding Tailwind Theming

#### Namespacing

The splatter package namespaces all tailwind classes with `ui-` for example to add a colour to text you'd prefix the following class `text-brand-snow-white` with `ui-text-brand-snow-white` this is to ensure not classname clashes occur when used in other applications.

#### Overriding default config

When adding the custom theme to tailwind config, tailwind will use that theme over it's default. For example given a default tailwind config of:

```
  {
    colors: {
      green: {
        100: '#00ff00
      }
    }
  }
```

if the custom theme passed in has a `colors` object of

```
  {
    colors: {
      brand: {
        green: '#005500
      }
    }
  }
```

then only the colors set in the custom theme can be used.

However, any key/values not passed in via the custom theme will then use the defaults from tailwind.

---

## Components & Variants

Components are built with React and Tailwind therefore all styling should be in the form of tailwind classes (where available)

To keep things neat & tidy a tailwind package called `tailwind-variants` is used which allows for easy composition components to create variants. This should be used across components.

Read more here 👉 [tailwind-variants](https://www.tailwind-variants.org/)
