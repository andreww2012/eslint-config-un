# eslint-config-un

[![npm](https://img.shields.io/npm/v/esling-config-un)](https://www.npmjs.com/package/esling-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable. Only supports ESLint 9 and the flat config format.

## Installation

```shell
npm i -D eslint-config-un
pnpm i -D eslint-config-un
yarn add -D eslint-config-un
```

## List of configs

Includes the following rules, configs & plugins:
- [Vanilla ESLint rules](https://eslint.org/docs/latest/rules/)
- [typescript-eslint](https://typescript-eslint.io/rules/)
- [vue](https://eslint.vuejs.org/rules/) (+ [vuejs-accessibility](https://www.npmjs.com/package/eslint-plugin-vuejs-accessibility) and [pinia](https://www.npmjs.com/package/eslint-plugin-pinia))
- [unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn)
- [node](https://www.npmjs.com/package/eslint-plugin-n) (`eslint-plugin-n` with `node` prefix)
- [import](https://www.npmjs.com/package/eslint-plugin-import-x) (`eslint-plugin-import-x` with `import` prefix)
- [promise](https://www.npmjs.com/package/eslint-plugin-promise)
- [regexp](https://www.npmjs.com/package/eslint-plugin-regexp)
- [security](https://www.npmjs.com/package/eslint-plugin-security)
- [sonar](https://www.npmjs.com/package/eslint-plugin-sonarjs)
- [tailwind](https://www.npmjs.com/package/eslint-plugin-tailwindcss)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) to disable Prettier-incompatible rules

## Features

- Automatically detects the presence of `typescript`, `vue`, `nuxt` and `pinia` packages and enables corresponding configurations (which can also be enabled or disabled explicitly).
- Every block of rules supports `overrides` for rules.
- Designed to be used separately from Prettier: *almost* all the rules potentially conflicting with Prettier are disabled *by default*.

## Usage

In your `eslint.config.[cm]?js`:

```js
// @ts-check
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // your configuration (optional)
});
```

## Limitations & Caveats

- This package has a peer dependency of `eslint>=9`. Please ensure you have installed the correct version. Some package managers are installing non-optional peer dependencies automatically.
- Packages lookup (such as `typescript` or `vue`) is performed using [`local-pkg`](https://www.npmjs.com/package/local-pkg).
- Type-checked, or type-aware TypeScript rules are *enabled* by default which are known to be performance-demanding. It's just a little heads-up and you should make your own decision whether to keep them enabled. [More about type-aware linting](https://typescript-eslint.io/getting-started/typed-linting).
- By default, TypeScript rules will only be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to true in vue's config options which in turn is *automatically* set to true if `typescript` package found installed. This is because right now it is not possible to apply different rules based on `lang` attribute of `<script>` SFC sections and the only reasonable solution would be to completely disable TypeScript rules to avoid great number of false positives.
- All plugins listed above are enabled by default or enabled automatically under certain conditions, but there is one that is *disabled* by default: `security`.
- Some rules are set to warn by default. You can change some or even all such rule's reporting level using `errorsInsteadOfWarnings` option. You can find all such rules by inspecting this plugin's source code.