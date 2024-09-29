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
- All plugins listed above are enabled by default or enabled automatically under certain conditions, but there is some that are *disabled* by default:
  - `security`
  - `prefer-arrow-functions`
- Some rules are set to warn by default. You can change some or even all such rule's reporting level using `errorsInsteadOfWarnings` option. You can find all such rules by inspecting the source code of this package.

## Troubleshooting

### TypeError: Key `rules`: Key `disable-autofix/<rule name>`: Could not find `<rule name>` in plugin `disable-autofix`

We disable autofix for some rules in this package via `eslint-plugin-disable-autofix`. However, it requires all the configs/plugins packages to be hoisted (installed to the top level of `node_modules`). You might need to reinstall this package, re-create `node_modules` directory (do not delete your lock file!) or set `shamefully-hoist=true` in your `.npmrc` if you're using pnpm. Sometimes you'll need to manually install some packages refused to be hoisted (happens with `@typescript-eslint/eslint-plugin`: `npm i @typescript-eslint/eslint-plugin -D --legacy-peer-deps`);

### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace.

Install `globals` package as a dev dependency.