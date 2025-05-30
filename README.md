# eslint-config-un

[![npm](https://img.shields.io/npm/v/eslint-config-un)](https://www.npmjs.com/package/eslint-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable. Only supports ESLint 9 and the flat config format.

## Installation

```shell
npm i -D eslint-config-un
pnpm i -D eslint-config-un
yarn add -D eslint-config-un
```

## List of configs

Includes the rules from the following configs & plugins:
- [Vanilla ESLint rules](https://eslint.org/docs/latest/rules/)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) to disable Prettier-incompatible rules
- [typescript-eslint](https://typescript-eslint.io/rules/)
- [vue](https://eslint.vuejs.org/rules/) (+ [vuejs-accessibility](https://www.npmjs.com/package/eslint-plugin-vuejs-accessibility) and [pinia](https://www.npmjs.com/package/eslint-plugin-pinia))
- [unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn)
- [node](https://www.npmjs.com/package/eslint-plugin-n) (`eslint-plugin-n` with `node` prefix)
- [import](https://www.npmjs.com/package/eslint-plugin-import-x) (`eslint-plugin-import-x` with `import` prefix)
- [promise](https://www.npmjs.com/package/eslint-plugin-promise)
- [regexp](https://www.npmjs.com/package/eslint-plugin-regexp)
- [security](https://www.npmjs.com/package/eslint-plugin-security)
- [sonar](https://www.npmjs.com/package/eslint-plugin-sonarjs) (v3 since v0.4.0, v1 before)
- [tailwind](https://www.npmjs.com/package/eslint-plugin-tailwindcss)
- [jsonc](https://www.npmjs.com/package/eslint-plugin-jsonc) (since v0.1.4)
- [yaml](https://www.npmjs.com/package/eslint-plugin-yaml) (since v0.1.0)
- [toml](https://www.npmjs.com/package/eslint-plugin-toml) (since v0.1.3)
- [prefer-arrow-functions](https://www.npmjs.com/package/eslint-plugin-prefer-arrow-functions) (since v0.1.0)
- [eslint-comments](https://www.npmjs.com/package/@eslint-community/eslint-plugin-eslint-comments) (since v0.1.3)
- [package-json](https://www.npmjs.com/package/eslint-plugin-package-json) (since v0.1.5)
- [markdown](https://www.npmjs.com/package/@eslint/markdown) (since v0.2.0)
- `cssInJs` (since v0.2.0), using [`eslint-plugin-css`](https://www.npmjs.com/package/eslint-plugin-css)
- [jest](https://www.npmjs.com/package/eslint-plugin-jest) (+ [jest-extended](https://www.npmjs.com/package/eslint-plugin-jest-extended)) (since v0.3.0)
- [vitest](https://www.npmjs.com/package/@vitest/eslint-plugin) (since v0.3.0)
- [jsdoc](https://www.npmjs.com/package/eslint-plugin-jsdoc) (since v0.3.1)
- [perfectionist](https://www.npmjs.com/package/eslint-plugin-perfectionist) (since v0.4.0)
- [de-morgan](https://www.npmjs.com/package/eslint-plugin-de-morgan) (since v0.5.0)
- [qwik](https://www.npmjs.com/package/eslint-plugin-qwik) (since v0.6.0)
- [json-schema-validator](https://www.npmjs.com/package/eslint-plugin-json-schema-validator) (since v0.6.0)
- `angular` (since v0.7.0), using [`@angular-eslint/eslint-plugin`](https://www.npmjs.com/package/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://www.npmjs.com/package/@angular-eslint/eslint-plugin-template)
- `css` (since v0.7.0), using [`@eslint/css`](https://www.npmjs.com/package/@eslint/css)
- `noUnusedImports` (since v0.7.0), using [`eslint-plugin-unused-imports`](https://www.npmjs.com/package/eslint-plugin-unused-imports)
- `react` (since v0.8.0), using [`@eslint-react/eslint-plugin`](https://www.npmjs.com/package/@eslint-react/eslint-plugin), [`eslint-plugin-react`](https://www.npmjs.com/package/eslint-plugin-react), [`eslint-plugin-react-hooks`](https://www.npmjs.com/package/eslint-plugin-react-hooks), [`eslint-plugin-react-refresh`](https://www.npmjs.com/package/eslint-plugin-react-refresh) and [`eslint-plugin-react-compiler`](https://www.npmjs.com/package/eslint-plugin-react-compiler)
- `jsxA11y` (since v0.8.0), using [`eslint-plugin-jsx-a11y`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y)
- `pnpm` (since v0.8.0), using [`eslint-plugin-pnpm`](https://www.npmjs.com/package/eslint-plugin-pnpm)
- `nextJs` (since v0.9.0), using [`@next/eslint-plugin-next`](https://www.npmjs.com/package/@next/eslint-plugin-next)
- `casePolice` (since v0.9.0), using [`eslint-plugin-case-police`](https://www.npmjs.com/package/eslint-plugin-case-police)
- `astro` (since v0.9.0), using [`eslint-plugin-astro`](https://www.npmjs.com/package/eslint-plugin-astro)
- `svelte` (since v0.10.0), using [`eslint-plugin-svelte`](https://www.npmjs.com/package/eslint-plugin-svelte)
- `es` (since v0.10.0), using [`eslint-plugin-es-x`](https://www.npmjs.com/package/eslint-plugin-es-x)
- `cloudfrontFunctions` (since v0.10.0) for [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
- `solid` (since v0.10.0), using [`eslint-plugin-solid`](https://www.npmjs.com/package/eslint-plugin-solid)
- `nodeDependencies` (since v0.10.0), using [`eslint-plugin-node-dependencies`](https://www.npmjs.com/package/eslint-plugin-node-dependencies)
- `jsInline` (since v0.10.0), using [`eslint-plugin-html`](https://www.npmjs.com/package/eslint-plugin-html)
- `html` (since v0.10.0), using [`@html-eslint/eslint-plugin`](https://www.npmjs.com/package/@html-eslint/eslint-plugin)
- `math` (since v0.?.?), using [`eslint-plugin-math`](https://www.npmjs.com/package/eslint-plugin-math)

## Features

- Automatically detects the presence of `typescript`, `vue`, `nuxt`, `pinia`, `jest`, `jest-extended`, `vitest`, `@builder.io/qwik`, `@qwik.dev/core`, `@angular/core`, `react`, `next`, `astro`, `svelte` and `solid-js` packages and enables corresponding configurations (which can also be enabled or disabled explicitly).
- Every block of rules supports `overrides` for rules.
- Designed to be used separately from Prettier: *almost* all the rules potentially conflicting with Prettier are disabled *by default*.
- Written in TypeScript so all the options are typed.

## Usage

In your `eslint.config.[cm]?js`:

```js
// @ts-check
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // your configuration (optional)
});
```

## Notes

- You don't need to install any of the mentioned configs/plugins as they are all the dependencies of this package.
- This package has a peer dependency of `eslint>=9`. Please ensure you have installed the correct version. Some package managers are installing non-optional peer dependencies automatically.
- Packages lookup (such as `typescript` or `vue`) is performed using [`local-pkg`](https://www.npmjs.com/package/local-pkg).
- Type-checked, or type-aware TypeScript rules are *enabled* by default which are known to be performance-demanding. It's just a little heads-up and you should make your own decision whether to keep them enabled. [More about type-aware linting](https://typescript-eslint.io/getting-started/typed-linting).
- By default, TypeScript rules will be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to true in vue's config options which in turn is *automatically* set to true if `typescript` package found installed. If you have `.vue` files authored in both TypeScript and JavaScript, use `enforceTypescriptInScriptSection.{files,ignores}` to manually specify TS & JS Vue components respectively. It is not currently possible to apply different ESLint rules depending on the value of `lang` attribute of `<script>` SFC section.
- All configs listed above are enabled by default or enabled automatically under certain conditions, but there is some that are *disabled* by default:
  - `preferArrowFunctions`
  - `security`
  - `json`
  - `yaml`
  - `toml`
  - `packageJson`
  - `perfectionist`
  - `deMorgan`
  - `jsonSchemaValidator`
  - `casePolice`
  - `es`
  - `cloudfrontFunctions`
  - `nodeDependencies`
  - `depend`
- Some rules are set to warn by default. You can change some or even all such rule's reporting level using `errorsInsteadOfWarnings` option. You can find all such rules by inspecting the source code of this package.

### Certain rules are disabled for code blocks inside `*.md` files

If `markdown` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files. This works because under the hood the plugin [`@eslint/markdown`](https://www.npmjs.com/package/@eslint/markdown) that provides that functionality will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports). You can find the full list of disabled rules in `src/configs/markdown.ts` file.

## Troubleshooting

### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace.

Install `globals` package as a dev dependency.