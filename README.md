# eslint-config-un

[![npm](https://img.shields.io/npm/v/eslint-config-un)](https://www.npmjs.com/package/eslint-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable. Only supports ESLint 9 and the flat config format.

## Features

- **All major plugins** are included (50+ in total):
[![JavaScript](./assets/devicon-javascript.svg) Vanilla JS rules](https://eslint.org/docs/latest/rules),
[![TypeScript](./assets/devicon-typescript.svg) typescript-eslint](https://typescript-eslint.io/rules),
[🦄unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn),
[⭐regexp](https://github.com/ota-meshi/eslint-plugin-regexp),
[![NodeJS](./assets/devicon-nodejs.svg) node](https://github.com/eslint-community/eslint-plugin-n),
[![VueJS](./assets/devicon-vuejs.svg) vue](https://eslint.vuejs.org),
[![Angular](./assets/devicon-angular.svg) angular](https://github.com/angular-eslint/angular-eslint)
[![ReactJS](./assets/devicon-react.svg) react](https://github.com/jsx-eslint/eslint-plugin-react) and 4 sister plugins,
[![SolidJS](./assets/devicon-solidjs.svg) solid](https://github.com/solidjs-community/eslint-plugin-solid),
[![tailwindcss](./assets/devicon-tailwindcss.svg) tailwind](https://github.com/francoismassart/eslint-plugin-tailwindcss),
[![CSS](./assets/devicon-css3.svg) css](https://github.com/eslint/css),
[![YAML](./assets/devicon-yaml.svg) yaml](https://github.com/ota-meshi/eslint-plugin-yml)
and many more;
- **Every single rule** was evaluated and given a reasonable default severity and options;
- **Extremely configurable:** you can easily override any rule's severity and **granularly** alter the default options;
- **Zero configuration by default:** exporting `eslintConfig()` from `eslint.config.ts` is enough to get started;
- **Strictly typed:** all the options and rule names exist in TypeScript types;
- **Well documented:** every single config, sub-config and their options are documented in JSDoc format;
- **Respects your `.gitignore`**: those files are not linted by default.
- Provides the ability **to disable autofix** on a per-rule basis.

## Installation

Node.JS 20.10 or 21.1 is required. `eslint` is a peer dependency, the minimum supported version is 9.15.0.

```shell
npm i -D eslint-config-un eslint@latest
pnpm i -D eslint-config-un eslint@latest
yarn add -D eslint-config-un eslint@latest
```

All the used plugins are direct dependencies of this package, you don't need to install them separately.

We aim to update the dependencies within 1 month after their release.

### Usage

In your `eslint.config.ts`:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // ... optional configuration ...
});
```

> [!NOTE]
> We highly recommend using TypeScript config file, which is supported since eslint v9.18.0, or [`@ts-check` directive](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#ts-check) at the start of the file otherwise.

## List of configs

### Most popular and well known

| Un config name                                      | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                                                       | Description/Notes |
| --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| ![JavaScript](./assets/devicon-javascript.svg) `js` | ✅                                           | [Vanilla ESLint rules](https://eslint.org/docs/latest/rules)                                                                                               | -                 |
| ![TypeScript](./assets/devicon-typescript.svg) `ts` | ✅                                           | [typescript-eslint](https://typescript-eslint.io/rules) (`@typescript-eslint`)                                                                             | -                 |
| 🦄 `unicorn`                                         | ✅                                           | [eslint-plugin-unicorn](https://npmjs.com/eslint-plugin-unicorn) (`unicorn`)                                                                               | -                 |
| ⭐ `regexp`                                          | ✅                                           | [eslint-plugin-regexp](https://npmjs.com/eslint-plugin-regexp) (`regexp`)                                                                                  | -                 |
| `promise`                                           | ✅                                           | [eslint-plugin-promise](https://npmjs.com/eslint-plugin-promise) (`promise`)                                                                               | -                 |
| `import`                                            | ✅                                           | [eslint-plugin-import-x](https://npmjs.com/eslint-plugin-import-x) (`import`)                                                                              | -                 |
| `sonarjs`                                           | ✅                                           | [eslint-plugin-sonarjs](https://npmjs.com/eslint-plugin-sonarjs) (`sonarjs`)                                                                               | -                 |
| `eslintComments`                                    | ✅                                           | [@eslint-community/eslint-plugin-eslint-comments](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments) (`@eslint-community/eslint-comments`) | Since v0.1.3                 |
| `jsdoc`                                    | ✅                                           | [eslint-plugin-jsdoc](https://npmjs.com/eslint-plugin-jsdoc) (`jsdoc`) | Since v0.3.1                 |

### Web frameworks & related

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| ![VueJS](./assets/devicon-vuejs.svg) `vue`         | ✅ (`vue` is installed)           | [eslint-plugin-vue](https://npmjs.com/eslint-plugin-vue) (`vue`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | -                 |
| ![Angular](./assets/devicon-angular.svg) `angular` | ✅ (`@angular/core` is installed) | [@angular-eslint/eslint-plugin](https://npmjs.com/@angular-eslint/eslint-plugin) (`@angular-eslint`)<br>[@angular-eslint/eslint-plugin](https://npmjs.com/@angular-eslint/eslint-plugin/template) (`@angular-eslint/template`)                                                                                                                                                                                                                                                                                                                    | -                 |
| ![ReactJS](./assets/devicon-react.svg) `react`     | ✅ (`react` is installed)         | [@eslint-react/eslint-plugin](https://www.npmjs.com/package/@eslint-react/eslint-plugin) (`@eslint-react`)<br>[eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react) (`react`)<br>[eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks) (`react-hooks`)<br>[eslint-plugin-react-refresh](https://www.npmjs.com/package/eslint-plugin-react-refresh) (`react-refresh`)<br>[eslint-plugin-react-compiler](https://www.npmjs.com/package/eslint-plugin-react-compiler) (`react-compiler`) | -                 |
| ![NextJS](./assets/devicon-nextjs.svg) `nextJs`   | ✅ (`next` is installed)      | [@next/eslint-plugin-next](https://www.npmjs.com/package/@next/eslint-plugin-next) (`@next/next`)                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -                 |
| ![SolidJS](./assets/devicon-solidjs.svg) `solid`   | ✅ (`solid-js` is installed)      | [eslint-plugin-solid](https://www.npmjs.com/package/eslint-plugin-solid) (`solid`)                                                                                                                                                                                                                                                                                                                                                                                                                                                        | -                 |
| ![SolidJS](./assets/devicon-qwik.svg) `qwik`                                           | ✅(`@builder.io/qwik` or `@qwik.dev/core` is installed)                                           | [eslint-plugin-qwik](https://npmjs.com/eslint-plugin-qwik) (`qwik`)   | Since v0.6.0 |
| ![Astro](./assets/devicon-astro.svg) `astro`                                           | ✅(`astro` is installed)                                           | [eslint-plugin-astro](https://npmjs.com/eslint-plugin-astro) (`astro`)   | Since v0.9.0 |
| ![Svelte](./assets/devicon-svelte.svg) `svelte`                                           | ✅(`svelte` is installed)                                           | [eslint-plugin-svelte](https://npmjs.com/eslint-plugin-svelte) (`svelte`)   | Since v0.10.0 |
| ![TailwindCSS](./assets/devicon-tailwindcss.svg) `tailwind` | ✅ (`tailwindcss` is installed) | [eslint-plugin-tailwindcss](https://www.npmjs.com/package/eslint-plugin-tailwindcss) (`tailwindcss`)                                                                                                                                                                                                                                                                                                                                                                                                                                       | -                 |

### Runtimes & related

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| ![NodeJS](./assets/devicon-nodejs.svg) `node`  | ✅                   | [eslint-plugin-n](https://npmjs.com/eslint-plugin-n) (`node`)                               | -                 |
| ![npm](./assets/devicon-npm.svg) `packageJson` | ❌                   | [eslint-plugin-package-json](https://npmjs.com/eslint-plugin-package-json) (`package-json`) | Since v0.1.5      |
| ![npm](./assets/devicon-npm.svg) `nodeDependencies` | ❌                   | [eslint-plugin-node-dependencies](https://npmjs.com/eslint-plugin-node-dependencies) (`node-dependencies`) | Since v0.10.0      |
| ![pnpm](./assets/devicon-pnpm.svg) `pnpm` | ✅ (pnpm is detected as a package manager)                   | [eslint-plugin-pnpm](https://npmjs.com/eslint-plugin-pnpm) (`pnpm`) | Since v0.8.0      |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions` | ❌                   | - | Since v0.10.0<br>For linting [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)      |

### Languages

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| ![Markdown](./assets/mdi-language-markdown.svg) `markdown`    | ✅                   | [@eslint/markdown](https://npmjs.com/@eslint/markdown) (`markdown`)                 | Since v0.7.0<br>Configured to also lint fenced code blocks |
| ![CSS](./assets/devicon-css3.svg) `css`    | ✅ (unless `stylelint` is installed)                   | [@eslint/css](https://npmjs.com/@eslint/css) (`css`)                 | Since v0.7.0 |
| ![CSS](./assets/devicon-css3.svg) `cssInJs`    | ✅                  | [eslint-plugin-css](https://npmjs.com/eslint-plugin-css) (`css-in-js`)                 | Since v0.2.0<br>Lints inlined CSS |
| `jsxA11y`    | ✅                  | [eslint-plugin-jsx-a11y](https://npmjs.com/eslint-plugin-jsx-a11y) (`jsx-a11y`)                 | Since v0.8.0 |
| ![YAML](./assets/devicon-yaml.svg) `yaml` | ❌                   | [eslint-plugin-yaml](https://npmjs.com/eslint-plugin-yaml) (`yaml`) | Since v0.1.0                                |
| ![JSON](./assets/devicon-json.svg) `jsonc` | ❌                   | [eslint-plugin-jsonc](https://npmjs.com/eslint-plugin-jsonc) (`jsonc`) | Since v0.1.4<br>Supports JSON, JSON5, JSONC                                |
| `jsonSchemaValidator` | ❌                   | [eslint-plugin-json-schema-validator](https://npmjs.com/eslint-plugin-json-schema-validator) (`json-schema-validator`) | Since v0.6.0             |
| ![TOML](./assets/tabler-toml.svg) `toml` | ❌                   | [eslint-plugin-toml](https://npmjs.com/eslint-plugin-toml) (`toml`) | Since v0.1.3             |
| ![HTML](./assets/devicon-html5.svg) `html` | ✅                   | [@html-eslint/eslint-plugin](https://npmjs.com/@html-eslint/eslint-plugin) (`@html-eslint`) | Since v0.10.0             |

### JS/TS - Miscellaneous

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| `security`                                           | ❌                                           | [eslint-plugin-security](https://npmjs.com/eslint-plugin-security) (`security`)   | - |
| `unusedImports`                                           | ❌                                           | [eslint-plugin-unused-imports](https://npmjs.com/eslint-plugin-unused-imports) (`unused-imports`)   | Since v0.7.0 |
| `prefer-arrow-functions`                                           | ❌                                           | [eslint-plugin-prefer-arrow-functions](https://npmjs.com/eslint-plugin-prefer-arrow-functions) (`prefer-arrow-functions`)   | Since v0.1.0 |
| `perfectionist`                                           | ❌                                           | [eslint-plugin-perfectionist](https://npmjs.com/eslint-plugin-perfectionist) (`perfectionist`)   | Since v0.4.0 |
| `de-morgan`                                           | ❌                                           | [eslint-plugin-de-morgan](https://npmjs.com/eslint-plugin-de-morgan) (`de-morgan`)   | Since v0.5.0 |
| `es`                                           | ❌                                           | [eslint-plugin-es-x](https://npmjs.com/eslint-plugin-es-x) (`es-x`)   | Since v0.10.0 |
| `jsInline`                                           | ✅                                           | [eslint-plugin-html](https://npmjs.com/eslint-plugin-html) (`html`)   | Since v0.10.0<br>For linting inlined JS in HTML files |
| `math`                                           | ✅                                           | [eslint-plugin-math](https://npmjs.com/eslint-plugin-math) (`math`)   | Since v?.?.? |

### Libraries

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| `jest`                                           | ✅ (`jest` is installed)                                           | [eslint-plugin-jest](https://npmjs.com/eslint-plugin-jest) (`jest`)   | Since v0.3.0 |
| `vitest`                                           | ✅ (`vitest` is installed)                                           | [@vitest/eslint-plugin](https://npmjs.com/@vitest/eslint-plugin) (`vitest`)   | Since v0.3.0 |

### Miscellaneous

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)  | Description/Notes |
| -------------  | ------------------------------------------- | -------------------------------------- | ----------------- |
| `casePolice`                                           | ❌                                           | [eslint-plugin-case-police](https://npmjs.com/eslint-plugin-case-police) (`case-police`)   | Since v0.9.0 |

<!-- TODO vuejs-accessibility, pinia, jest-extended, prettier -->

## Configuration guide

### `configs` option

eslint-config-un has a concept of Configs and Sub-configs. They are similar, but not the same as ESLint flat config objects.

The Config has the following interface (exact types are simplified for docs):

```ts
type UnConfig = boolean | { 
  files?: string[];
  ignores?: string[];
  overrides?: {
    [RuleName in string]:
      | Severity
      | [Severity, RuleOptions[RuleName]]
      | (( // These are severity and options *maybe* set by eslint-config-un
          ourSeverity: Severity,
          ourOptions?: RuleOptions[RuleName],
        ) => Severity | [Severity, RuleOptions[RuleName]]);
  };

  [`config${string}`]: UnConfig; // These are Sub-configs

  [customOptions: string]: unknown; // Custom config options, individual for each config
}

type Severity = 0 | 1 | 2 | 'off' | 'warn' | 'error';
```

- `files` is an array of file globs to which this Config will be applied. If you specify an empty array `[]`, the Config **will be disabled**, but not its Sub-configs.
- `ignores` is exactly the same as ESLint's `ignores`.
- `overrides` is similar to ESLint's `rules`, but with a very important advantage: you can provide a function that will be called with the rule severity and options set by eslint-config-un, which allows you to **granularly override the options** or change the severity of each rule. 
- Sub-configs are the same as Configs, but configured within Config options. All Sub-configs use `configXXX` naming convention.
- The Config is usually tied to a one or more ESLint plugins and produces one or more ESLint flat config objects.
- After evaluating all the flat configs, eslint-config-un will **load only those plugins that were actually used**, unless `loadPluginsOnDemand` option is set to `false`.

Example of configuration:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    // This is a Config
    node: {
      // By default `node` rules are applied to all files, so let's narrow the file list down
      files: ['backend/**'], 
    },
    vue: {
      // For some reason we're not ready to lint *.vue files
      files: [],
      // This is a Sub-config
      configPinia: {
        ignores: ['./path/to/pinia/store/with-many-error.ts'],
      },
    },
    // This config is disabled by default, let's enable it by specifying `true`
    deMorgan: true,
    // This config is disabled too, and if we provide an object with configuration, it will be enabled too
    perfectionist: {
      files: ['src/big-list-of-something.ts'],
      overrides: {
        'perfectionist/sort-objects': 2,
      },
    },
    // This plugin is enabled by default, but we don't use JSDoc so don't need it
    jsdoc: false,
    // This plugin is conversely disabled by default, but we want to use it
    security: true,
  },
})
```

### TypeScript

Rules [requiring type information](https://typescript-eslint.io/rules/?=typeInformation), which are [known to be performance-demanding](https://typescript-eslint.io/getting-started/typed-linting/#performance), are *enabled* by default, and will be applied to the same files as `ts` config is applied to. It's just a little heads up; you should make your own decision whether to keep them enabled. Use `configTypeAware` to control to which files such rules will be applied to, if any.

### Vue

<!-- TODO -->

By default, TypeScript rules will be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to true in vue's config options which in turn is *automatically* set to true if `typescript` package found installed. If you have `.vue` files authored in both TypeScript and JavaScript, use `enforceTypescriptInScriptSection.{files,ignores}` to manually specify TS & JS Vue components respectively. It is not currently possible to apply different ESLint rules depending on the value of `lang` attribute of `<script>` SFC section.

### Angular

<!-- TODO -->

### React

<!-- TODO -->

### Markdown

<!-- TODO -->

If `markdown` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files. This works because under the hood the plugin [`@eslint/markdown`](https://www.npmjs.com/package/@eslint/markdown) that provides that functionality will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports). You can find the full list of disabled rules in `src/configs/markdown.ts` file.

## Other root options

### `ignores`

Specifies a list of globally ignored files. By default will be merged with our ignore patterns, unless `overrideIgnores` is set to `true`.

### `overrideIgnores`

Set to `true` if you don't want `ignores` to be merged with our ignore patterns, which are `['**/dist']`.

### `gitignore`

By default `.gitignore`d files will be added to `ignores` list. Set to `false` to disable this behavior. You may also provide an object which configures [eslint-config-flat-gitignore](https://www.npmjs.com/package/eslint-config-flat-gitignore), which provides this functionality in the first place. 

## TODO Disabling rule autofix

ESLint [doesn't (yet?) have the ability to disable autofix](https://github.com/eslint/rfcs/pull/125) for a rule by the user.

## FAQ

### How do I add my own flat configs?

### Do I have to install any of the used plugins?

<!-- TODO -->

### How does exactly eslint-config-un knows if some package is installed?

<!-- TODO -->

### How to debug?

<!-- TODO -->

## Troubleshooting

### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace.

Install `globals` package as a dev dependency.

### jiti/ts config