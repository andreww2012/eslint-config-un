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
- [sonar](https://www.npmjs.com/package/eslint-plugin-sonarjs)
- [tailwind](https://www.npmjs.com/package/eslint-plugin-tailwindcss)
- [jsonc](https://www.npmjs.com/package/eslint-plugin-jsonc) (since v0.1.4)
- [yaml](https://www.npmjs.com/package/eslint-plugin-yaml) (since v0.1.0)
- [toml](https://www.npmjs.com/package/eslint-plugin-toml) (since v0.1.3)
- [prefer-arrow-functions](https://www.npmjs.com/package/eslint-plugin-prefer-arrow-functions) (since v0.1.0)
- [eslint-comments](https://www.npmjs.com/package/@eslint-community/eslint-plugin-eslint-comments) (since v0.1.3)
- [package-json](https://www.npmjs.com/package/eslint-plugin-package-json) (since v0.1.5)
- [markdown](https://www.npmjs.com/package/@eslint/markdown) (since v0.1.6) <!-- TODO -->
- [css](https://www.npmjs.com/package/eslint-plugin-css) (since v0.1.6) <!-- TODO -->

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
  - `prefer-arrow-functions`
  - `security`
  - `json`
  - `yaml`
  - `toml`
  - `package-json`
- Some rules are set to warn by default. You can change some or even all such rule's reporting level using `errorsInsteadOfWarnings` option. You can find all such rules by inspecting the source code of this package.

### Certain rules are disabled for code blocks inside `*.md` files

If `markdown` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files. This works because under the hood the plugin [`@eslint/markdown`](https://www.npmjs.com/package/@eslint/markdown) that provides that functionality will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports). You can find the full list of disabled rules in `src/configs/markdown.ts` file.

## Troubleshooting

### TypeError: Key `rules`: Key `disable-autofix/<rule name>`: Could not find `<rule name>` in plugin `disable-autofix`

We disable autofix for some rules in this package via `eslint-plugin-disable-autofix`. However, it requires all the configs/plugins packages to be hoisted (installed to the top level of `node_modules`). You might need to reinstall this package, re-create `node_modules` directory (do not delete your lock file!) or set `shamefully-hoist=true` in your `.npmrc` if you're using pnpm. Sometimes you'll need to manually install some packages refused to be hoisted (happens with `@typescript-eslint/eslint-plugin`: `npm i @typescript-eslint/eslint-plugin -D --legacy-peer-deps`).

This error could also happen if a dependency of this package is installed in your project separately.

### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace.

Install `globals` package as a dev dependency.