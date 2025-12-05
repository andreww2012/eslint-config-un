# eslint-config-un [![npm](https://img.shields.io/npm/v/eslint-config-un)](https://npmjs.com/eslint-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable.

## Features

- **Every major plugin** is included (50+ in total): 
  [![JavaScript](./assets/devicon-javascript.svg) Vanilla JS rules](https://eslint.org/docs/latest/rules),
  [![TypeScript] typescript-eslint](https://typescript-eslint.io/rules),
  [🦄unicorn](https://npmjs.com/eslint-plugin-unicorn),
  [⭐regexp](https://github.com/ota-meshi/eslint-plugin-regexp),
  [![NodeJS](./assets/devicon-nodejs.svg) node](https://github.com/eslint-community/eslint-plugin-n),
  [![VueJS] vue](https://eslint.vuejs.org),
  [![Angular] angular](https://github.com/angular-eslint/angular-eslint)
  [![ReactJS] react](https://github.com/jsx-eslint/eslint-plugin-react) and 4 sister plugins,
  [![SolidJS](./assets/devicon-solidjs.svg) solid](https://github.com/solidjs-community/eslint-plugin-solid),
  [![tailwindcss][TailwindCSS] tailwind](https://github.com/francoismassart/eslint-plugin-tailwindcss),
  [![CSS] css](https://github.com/eslint/css),
  [![YAML](./assets/devicon-yaml.svg) yaml](https://github.com/ota-meshi/eslint-plugin-yml)
  and many more;
- **Every single rule** was evaluated and given a reasonable default severity and options;
- **Extremely configurable:** you can easily override any rule's severity and **granularly** alter the default options;
- **Zero configuration by default:** exporting `eslintConfig()` from `eslint.config.ts` is enough to get started;
- **Strictly typed:** all the options and rule names exist in TypeScript types;
- **Well documented:** every single config, sub-config and their options are documented in JSDoc format;
- **Respects your root `.gitignore`**: specified files are not linted by default.
- Provides the ability **to disable autofix** on a per-rule basis.
- **Works great with Prettier**: conflicting rules are disabled if you use Prettier.
- **Rename plugin prefixes** easily if you would like to.
- **Bring your own plugins** and their rules will also be typed as much as it's possible to.

## Installation

Minimum supported versions:

- NodeJS: ^20.19 or ^22.16.0 or >=24
- ESLint: ^9.15.0 (peer dependency)

```sh
npm i -D eslint-config-un eslint@latest
pnpm i -D eslint-config-un eslint@latest
yarn add -D eslint-config-un eslint@latest # Yarn Berry only (v2+)
```

Commonly used plugins are direct dependencies of this package, you don't need to install them separately. 
We aim to update the dependencies within 1 month after their release.
You can always override plugins' implementation with [`pluginOverrides` option](#pluginoverrides) or using your package manager's overrides functionality.

Certain plugins (usually framework/library specific ones) are optional peer dependencies, which means that you need to install them manually if they are end up being used. 
You need to run ESLint with our config once to find out which plugins should be installed manually.

<details>
<summary>Installation with Yarn Classic (v1)</summary>

Yarn Classic (v1) does not support installing packages by npm name that have dependencies referenced by `file:` protocol - which we're using in this package. 
It fails with "Tarball is not in network and can not be located in cache" error.
Installing directly from the tarball does work:

```sh
yarn add -D https://registry.npmjs.org/eslint-config-un/-/eslint-config-un-<VERSION>.tgz eslint@latest
```

Note that if you're using custom registry, the URL should be changed accordingly.

</details>

<details>
<summary>List of optional peer dependencies</summary>

| Package name                             | Default plugin prefix      |
| ---------------------------------------- | -------------------------- |
| `@angular-eslint/eslint-plugin-template` | `@angular-eslint/template` |
| `@angular-eslint/eslint-plugin`          | `@angular-eslint`          |
| `@cspell/eslint-plugin`                  | `@cspell`                  |
| `@darraghor/eslint-plugin-nestjs-typed`  | `nestjs`                   |
| `@docusaurus/eslint-plugin`              | `docusaurus`               |
| `@eslint-react/eslint-plugin`            | `@eslint-react`            |
| `@intlify/eslint-plugin-vue-i18n`        | `@intlify/vue-i18n`        |
| `@next/eslint-plugin-next`               | `@next/next`               |
| `@tanstack/eslint-plugin-query`          | `@tanstack/query`          |
| `eslint-plugin-astro`                    | `astro`                    |
| `eslint-plugin-ava`                      | `ava`                      |
| `eslint-plugin-better-tailwindcss`       | `better-tailwindcss`       |
| `eslint-plugin-boundaries`               | `boundaries`               |
| `eslint-plugin-case-police`              | `case-police`              |
| `eslint-plugin-check-file`               | `check-file`               |
| `eslint-plugin-command`                  | `command`                  |
| `eslint-plugin-de-morgan`                | `de-morgan`                |
| `eslint-plugin-ember`                    | `ember`                    |
| `eslint-plugin-erasable-syntax-only`     | `erasable-syntax-only`     |
| `eslint-plugin-es-x`                     | `es`                       |
| `eslint-plugin-eslint-plugin`            | `eslint-plugin`            |
| `eslint-plugin-expect-type`              | `expect-type`              |
| `eslint-plugin-fast-import`              | `fast-import`              |
| `@graphql-eslint/eslint-plugin`          | `graphql`                  |
| `eslint-plugin-header`                   | `header`                   |
| `eslint-plugin-headers`                  | `headers`                  |
| `eslint-plugin-import-zod`               | `import-zod`               |
| `eslint-plugin-jest-extended`            | `jest-extended`            |
| `eslint-plugin-jest`                     | `jest`                     |
| `@nx/eslint-plugin`                      | `nx`                       |
| `eslint-plugin-perfectionist`            | `perfectionist`            |
| `eslint-plugin-pinia`                    | `pinia`                    |
| `eslint-plugin-playwright`               | `playwright`               |
| `eslint-plugin-prefer-arrow-functions`   | `prefer-arrow-functions`   |
| `eslint-plugin-qunit`                    | `qunit`                    |
| `eslint-plugin-qwik`                     | `qwik`                     |
| `eslint-plugin-react-hooks`              | `react-hooks`              |
| `eslint-plugin-react-refresh`            | `react-refresh`            |
| `eslint-plugin-react`                    | `react`                    |
| `@smarttools/eslint-plugin-rxjs`         | `rxjs`                     |
| `eslint-plugin-solid`                    | `solid`                    |
| `eslint-plugin-storybook`                | `storybook`                |
| `eslint-plugin-svelte`                   | `svelte`                   |
| `eslint-plugin-tailwindcss`              | `tailwindcss`              |
| `eslint-plugin-testing-library`          | `testing-library`          |
| `eslint-plugin-turbo`                    | `turbo`                    |
| `@vitest/eslint-plugin`                  | `vitest`                   |
| `eslint-plugin-vue-scoped-css`           | `vue-scoped-css`           |
| `eslint-plugin-vue`                      | `vue`                      |
| `eslint-plugin-vuejs-accessibility`      | `vuejs-accessibility`      |
| `eslint-plugin-zod-x`                    | `zod`                      |

</details>

### Usage

In your `eslint.config.ts`:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // ... optional configuration ...
});
```

> [!NOTE]
> We highly recommend using TypeScript config file, which is supported since ESLint v9.18.0, or [`@ts-check` directive](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#ts-check) at the start of the file otherwise.

## List of configs

eslint-config-un has a concept of Configs and Sub-configs, further referred to as Configs. 
They are similar to ESLint flat config objects, but with some useful extensions.
Every Config is *usually* tied to a one or more ESLint plugins produces one or more ESLint flat config items.

You can enable any Config by setting it to `true` or an object with the Config's options. 
Passing `false` disables the Config. 
Passing an empty array to `files` disables the Config, but not its' Sub-configs.

<details>
<summary>Config interface & docs</summary>

The Config has the following interface (exact types are simplified for docs):

```ts
type UnConfig =
  | boolean
  | {
      files?: string[];
      ignores?: string[];

      [RuleName in ('overrides' | 'overridesAny')]?: {
        [RuleName in string]:
          | Severity
          | [Severity, RuleOptions[RuleName]]
          | ((
              // These are severity and options *maybe* set by eslint-config-un
              ourSeverity: Severity,
              ourOptions?: RuleOptions[RuleName],
            ) => Severity | [Severity, RuleOptions[RuleName]]);
      };

      forceSeverity?: '2' | 'error' | '1' | 'warn';

      [`config${string}`]: UnConfig; // These are Sub-configs

      [customOptions: string]: unknown; // Custom options, individual for each Config
    };

type Severity = 0 | 1 | 2 | 'off' | 'warn' | 'error';
```

</details>

<br>

- Sub-configs are the same as Configs, but configured within Config options. 
  All Sub-configs use `configXXX` naming convention.
- After evaluating all the flat configs, eslint-config-un will **load only those plugins that were actually used**, unless `loadPluginsOnDemand` option is set to `false`.
- `files` and `ignores` have exactly the same meaning as the corresponding ESLint flat config item properties, with the only difference being an empty array `[]` handling:
  - If you specify an empty array for `files`, the Config **will be disabled**, but of its' Sub-configs remain unaffected.
  - If you specify an empty array for `ignores`, the default ignore list won't be used.
- `overrides`/`overridesAny` is similar to ESLint's `rules`, but with a very important advantage: you can provide a function that will be called with the rule severity and options set by eslint-config-un, which allows you to **granularly override the options** or change the severity of each rule.
  - The difference between `overrides` and `overridesAny` is that `overridesAny` will allow *any* rule to be overridden (from TypeScript's stand point; technically you can pass any rule to `overrides` too), while `overrides` will only allow those rules which are tied to the config.
  - `overridesAny` will be applied **after** `overrides`.
- `forceSeverity` allows to bulk override the severity of all the rules not overridden via `overrides` or `overridesAny`.
- Custom options are individual for each Config and are documented in JSDoc format.

Sub-config is a Config located within Config's options. 
If the parent config is disabled by passing `false`, all its' Sub-configs are disabled too. 
In the following table, Sub-configs have `/` in their names.

### Most popular and well known

| Un config name                                      | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                                                       | Description/Notes                                                    |
| --------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![JavaScript](./assets/devicon-javascript.svg) `js` | ✅                                          | [Vanilla ESLint rules](https://eslint.org/docs/latest/rules)                                                                                               | -                                                                    |
| ![TypeScript] `ts`                                  | ✅                                          | [typescript-eslint](https://npmjs.com/typescript-eslint) (`ts`)                                                                                            | Only rules **not** requiring type information.                       |
| ![TypeScript] `ts/typeAware`                        | ✅                                          | ^                                                                                                                                                          | Only rules requiring type information.                               |
| ![TypeScript] `ts/noTypeAssertion`                  | ✅                                          | [eslint-plugin-no-type-assertion](https://npmjs.com/eslint-plugin-no-type-assertion) (`no-type-assertion`)                                                 | -                                                                    |
| ![TypeScript] `ts/sortTsconfigKeys`                 | ❌                                          | -                                                                                                                                                          | Sort type-level and `compilerOptions` keys in tsconfig files.        |
| 🦄 `unicorn`                                        | ✅                                          | [eslint-plugin-unicorn](https://npmjs.com/eslint-plugin-unicorn) (`unicorn`)                                                                               | -                                                                    |
| ⭐ `regexp`                                         | ✅                                          | [eslint-plugin-regexp](https://npmjs.com/eslint-plugin-regexp) (`regexp`)                                                                                  | -                                                                    |
| `promise`                                           | ✅                                          | [eslint-plugin-promise](https://npmjs.com/eslint-plugin-promise) (`promise`)                                                                               | -                                                                    |
| `import`                                            | ✅                                          | [eslint-plugin-import-x] (`import`)                                                                                                                        | -                                                                    |
| `sonarjs`                                           | ✅                                          | [eslint-plugin-sonarjs](https://npmjs.com/eslint-plugin-sonarjs) (`sonarjs`)                                                                               | -                                                                    |
| `eslintComments`                                    | ✅                                          | [@eslint-community/eslint-plugin-eslint-comments](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments) (`@eslint-community/eslint-comments`) | Since v0.1.3                                                         |
| `jsdoc`                                             | ✅                                          | [eslint-plugin-jsdoc](https://npmjs.com/eslint-plugin-jsdoc) (`jsdoc`)                                                                                     | Since v0.3.1                                                         |
| `jsdoc/typescript`                                  | ✅ (`ts` config is enabled)                 | -                                                                                                                                                          | Config for disabling or disabling certain rules for TypeScript files |

### Web frameworks & related

| Un config name                                       | Enabled by default?<br>(optional condition)              | Primary plugin(s) (`default-prefix`)                                                                                                                          | Description/Notes                                                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| ![VueJS] `vue`                                       | ✅ (`vue` is installed)                                  | [eslint-plugin-vue](https://npmjs.com/eslint-plugin-vue) (`vue`)                                                                                              | -                                                                                                                                  |
| ![VueJS] `vue/a11y`                                  | ✅                                                       | [eslint-plugin-vuejs-accessibility](https://npmjs.com/eslint-plugin-vuejs-accessibility) (`vuejs-accessibility`)                                              | -                                                                                                                                  |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt`        | ✅ (`nuxt` is installed)                                 | [@nuxt/eslint-plugin](https://npmjs.com/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Since v1.0.0                                                                                                                       |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt/config` | ✅                                                       | [@nuxt/eslint-plugin](https://npmjs.com/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Rules related to Nuxt config file<br>Since v1.0.0                                                                                  |
| ![Pinia](./assets/logos-pinia.svg) `vue/pinia`       | ✅ (`pinia` is installed)                                | [eslint-plugin-pinia](https://npmjs.com/eslint-plugin-pinia) (`pinia`)                                                                                        | -                                                                                                                                  |
| ![Angular] `angular`                                 | ✅ (`@angular/core` is installed)                        | [@angular-eslint/eslint-plugin](https://npmjs.com/@angular-eslint/eslint-plugin) (`@angular-eslint`)                                                          | Since v0.78.0                                                                                                                      |
| ![Angular] `angular/template`                        | ✅                                                       | [@angular-eslint/eslint-plugin/template](https://npmjs.com/@angular-eslint/eslint-plugin-template) (`@angular-eslint/template`)                               | -                                                                                                                                  |
| ![ReactJS] `react`                                   | ✅ (`react` is installed)                                | [eslint-plugin-react](https://npmjs.com/eslint-plugin-react) (`react`)                                                                                        | Since v0.8.0                                                                                                                       |
| ![ReactJS] `react/reactX`                            | ✅                                                       | [@eslint-react/eslint-plugin] (`@eslint-react`)                                                                                                               | -                                                                                                                                  |
| ![ReactJS] `react/hooks`                             | ✅                                                       | [eslint-plugin-react-hooks](https://npmjs.com/eslint-plugin-react-hooks) (`react-hooks`)<br>[@eslint-react/eslint-plugin] (`@eslint-react`)                   | Includes rules with `@eslint-react/hooks-extra` prefix from `@eslint-react/eslint-plugin`                                          |
| ![ReactJS] `react/dom`                               | ✅ (`react-dom` is installed)                            | [@eslint-react/eslint-plugin] (`@eslint-react`)<br>[eslint-plugin-react](https://npmjs.com/eslint-plugin-react)                                               | Includes rules with `@eslint-react/dom` prefix from `@eslint-react/eslint-plugin` and DOM related rules from `eslint-plugin-react` |
| ![ReactJS] `react/refresh`                           | ✅                                                       | [eslint-plugin-react-refresh](https://npmjs.com/eslint-plugin-react-refresh) (`react-refresh`)                                                                | -                                                                                                                                  |
| ![ReactJS] `react/youMightNotNeedAnEffect`           | ✅                                                       | [eslint-plugin-react-you-might-not-need-an-effect](https://npmjs.com/eslint-plugin-react-you-might-not-need-an-effect) (`react-you-might-not-need-an-effect`) | Since v1.0.0                                                                                                                       |
| ![ReactJS] `react/allowDefaultExportsInJsxFiles`     | ✅                                                       | -                                                                                                                                                             | Config that allows default exports in all JSX files                                                                                |
| ![NextJS](./assets/devicon-nextjs.svg) `nextJs`      | ✅ (`next` is installed)                                 | [@next/eslint-plugin-next](https://npmjs.com/@next/eslint-plugin-next) (`@next/next`)                                                                         | Since v0.9.0                                                                                                                       |
| ![SolidJS](./assets/devicon-solidjs.svg) `solid`     | ✅ (`solid-js` is installed)                             | [eslint-plugin-solid](https://npmjs.com/eslint-plugin-solid) (`solid`)                                                                                        | Since v0.10.0                                                                                                                      |
| ![SolidJS](./assets/devicon-qwik.svg) `qwik`         | ✅ (`@builder.io/qwik` or `@qwik.dev/core` is installed) | [eslint-plugin-qwik](https://npmjs.com/eslint-plugin-qwik) (`qwik`)                                                                                           | Since v0.6.0                                                                                                                       |
| ![Astro](./assets/devicon-astro.svg) `astro`         | ✅ (`astro` is installed)                                | [eslint-plugin-astro](https://npmjs.com/eslint-plugin-astro) (`astro`)                                                                                        | Since v0.9.0<br>Without A11Y rules                                                                                                 |
| ![Astro](./assets/devicon-astro.svg) `astro/jsxA11y` | ✅                                                       | ^                                                                                                                                                             | Only A11Y rules from `eslint-plugin-astro`                                                                                         |
| ![Svelte](./assets/devicon-svelte.svg) `svelte`      | ✅ (`svelte` is installed)                               | [eslint-plugin-svelte](https://npmjs.com/eslint-plugin-svelte) (`svelte`)                                                                                     | Since v0.10.0                                                                                                                      |
| ![Ember] `ember`                                     | ✅ (`ember-source` is installed)                         | [eslint-plugin-ember](https://npmjs.com/eslint-plugin-ember) (`ember`)                                                                                        | Since v1.0.0                                                                                                                       |
| ![Ember] `ember/testFiles`                           | ✅                                                       | ^                                                                                                                                                             | Since v1.0.0                                                                                                                       |
| ![Ember] `ember/testFiles/noOnlyTests`               | ✅                                                       | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                               | Since v1.0.0                                                                                                                       |
| ![Lit](./assets/logos-lit-icon.svg) `lit`            | ✅ (`lit` is installed)                                  | [eslint-plugin-lit](https://npmjs.com/eslint-plugin-lit) (`lit`)                                                                                              | Since v1.0.0                                                                                                                       |
| ![Lit](./assets/logos-lit-icon.svg) `lit/a11y`       | ✅                                                       | [eslint-plugin-lit-a11y](https://npmjs.com/eslint-plugin-lit-a11y) (`lit-a11y`)                                                                               | Since v1.0.0                                                                                                                       |
| ![TailwindCSS] `betterTailwind`                      | ✅ (`tailwindcss` is installed)                          | [eslint-plugin-better-tailwindcss](https://npmjs.com/eslint-plugin-better-tailwindcss) (`better-tailwindcss`)                                                 | Since v1.0.0<br>Supports v4 and v3                                                                                                 |
| ![TailwindCSS] `tailwind`                            | ❌                                                       | [eslint-plugin-tailwindcss](https://npmjs.com/eslint-plugin-tailwindcss) (`tailwindcss`)                                                                      | Only supports v3                                                                                                                   |
| ![NestJS](./assets/devicon-nestjs.svg) `nestJs`      | ✅ (`@nestjs/core` is installed)                         | [@darraghor/eslint-plugin-nestjs-typed](https://npmjs.com/@darraghor/eslint-plugin-nestjs-typed) (`nestjs`)                                                   | Since v1.0.0                                                                                                                       |

### Runtimes & related

| Un config name                                                                   | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                       | Description/Notes                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![NodeJS](./assets/devicon-nodejs.svg) `node`                                    | ✅                                          | [eslint-plugin-n](https://npmjs.com/eslint-plugin-n) (`node`)                                              | -                                                                                                                                                                                          |
| ![npm] `packageJson`                                                             | ❌                                          | [eslint-plugin-package-json](https://npmjs.com/eslint-plugin-package-json) (`package-json`)                | Since v0.1.5                                                                                                                                                                               |
| ![npm] `nodeDependencies`                                                        | ❌                                          | [eslint-plugin-node-dependencies](https://npmjs.com/eslint-plugin-node-dependencies) (`node-dependencies`) | Since v0.10.0                                                                                                                                                                              |
| ![npm] `depend`                                                                  | ❌                                          | [eslint-plugin-depend](https://npmjs.com/eslint-plugin-depend) (`depend`)                                  | Since v1.0.0                                                                                                                                                                               |
| ![pnpm] `pnpm`                                                                   | ✅ (pnpm is detected as a package manager)  | [eslint-plugin-pnpm](https://npmjs.com/eslint-plugin-pnpm) (`pnpm`)                                        | Since v0.8.0<br>Does nothing, split into sub-configs                                                                                                                                       |
| ![pnpm] `pnpm/packageJson`                                                       | ✅                                          | ^                                                                                                          | Plugin rules related to `package.json` files                                                                                                                                               |
| ![pnpm] `pnpm/pnpmWorkspace`                                                     | ✅                                          | ^                                                                                                          | Plugin rules related to `pnpm-workspace.yaml` file                                                                                                                                         |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions`    | ❌                                          | -                                                                                                          | Since v0.10.0<br>For linting [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) written for JavaScript Runtime v2 |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions/V1` | ❌                                          | -                                                                                                          | Same, but for JavaScript Runtime v1 functions                                                                                                                                              |

### Languages

| Un config name                                        | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                   | Description/Notes                                                                                                          |
| ----------------------------------------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ![Markdown] `markdown`                                | ✅                                          | [@eslint/markdown](https://npmjs.com/@eslint/markdown) (`markdown`)                                                    | Since v0.7.0<br>Configured to also lint fenced code blocks inside .md files                                                |
| ![Markdown] `markdown/formatFencedCodeBlocks`         | ✅ (`prettier` is installed)                | [eslint-plugin-prettier](https://npmjs.com/eslint-plugin-prettier) (`prettier`)                                        | Since v1.0.0<br>Format fenced code blocks inside Markdown files using Prettier                                             |
| ![Markdown] `markdown/sentencesPerLine`               | ❌                                          | [eslint-plugin-sentences-per-line](https://npmjs.com/eslint-plugin-sentences-per-line) (`sentences-per-line`)          | Since v1.0.0                                                                                                               |
| ![Markdown] `markdownPreferences`                     | ✅                                          | [eslint-plugin-markdown-preferences](https://npmjs.com/eslint-plugin-markdown-preferences) (`markdownPreferences`)     | Since v1.0.0                                                                                                               |
| ![Markdown] `markdownLinks`                           | ✅                                          | [eslint-plugin-markdown-links](https://npmjs.com/eslint-plugin-markdown-links) (`markdownLinks`)                       | Since v1.0.0                                                                                                               |
| ![MDX](./assets/vscode-icons-file-type-mdx.svg) `mdx` | ✅                                          | [eslint-plugin-mdx](https://npmjs.com/eslint-plugin-mdx) (`mdx`)                                                       | Since v1.0.0<br>Configured to also lint fenced code blocks inside .mdx files                                               |
| ![CSS] `css`                                          | ✅ (unless `stylelint` is installed)        | [@eslint/css](https://npmjs.com/@eslint/css) (`css`)                                                                   | Since v0.7.0                                                                                                               |
| ![CSS] `cssInJs`                                      | ✅                                          | [eslint-plugin-css](https://npmjs.com/eslint-plugin-css) (`css-in-js`)                                                 | Since v0.2.0<br>Lints inlined CSS                                                                                          |
| `jsxA11y`                                             | ✅                                          | [eslint-plugin-jsx-a11y-x](https://npmjs.com/eslint-plugin-jsx-a11y-x) (`jsx-a11y`)                                    | Since v1.0.0<br>Since v0.8.0 and until v1.0.0, [eslint-plugin-jsx-a11y](https://npmjs.com/eslint-plugin-jsx-a11y) was used |
| ![YAML](./assets/devicon-yaml.svg) `yaml`             | ❌                                          | [eslint-plugin-yaml](https://npmjs.com/eslint-plugin-yaml) (`yaml`)                                                    | Since v0.1.0                                                                                                               |
| ![JSON](./assets/devicon-json.svg) `jsonc`            | ❌                                          | [eslint-plugin-jsonc](https://npmjs.com/eslint-plugin-jsonc) (`jsonc`)                                                 | Since v0.1.4<br>Supports JSON, JSON5, JSONC                                                                                |
| `jsonc/json`                                          | ❌                                          | ^                                                                                                                      | Config exclusively for `.json` files, does nothing by default                                                              |
| `jsonc/jsonc`                                         | ❌                                          | ^                                                                                                                      | Config exclusively for `.jsonc` files, does nothing by default                                                             |
| `jsonc/json5`                                         | ❌                                          | ^                                                                                                                      | Config exclusively for `.json5` files, does nothing by default                                                             |
| `jsonSchemaValidator`                                 | ❌                                          | [eslint-plugin-json-schema-validator](https://npmjs.com/eslint-plugin-json-schema-validator) (`json-schema-validator`) | Since v0.6.0                                                                                                               |
| ![TOML](./assets/tabler-toml.svg) `toml`              | ❌                                          | [eslint-plugin-toml](https://npmjs.com/eslint-plugin-toml) (`toml`)                                                    | Since v0.1.3                                                                                                               |
| ![HTML](./assets/devicon-html5.svg) `html`            | ✅                                          | [@html-eslint/eslint-plugin](https://npmjs.com/@html-eslint/eslint-plugin) (`@html-eslint`)                            | Since v0.10.0                                                                                                              |
| ![GraphQL](./assets/logos-graphql.svg) `graphql`      | ✅ (`graphql` is installed)                 | [@graphql-eslint/eslint-plugin](https://npmjs.com/@graphql-eslint/eslint-plugin) (`graphql`)                           | Since v1.0.0                                                                                                               |

### Js/ts - miscellaneous

| Un config name               | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                            | Description/Notes                                                                                                                                                                                                                                                                                         |
| ---------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `security`                   | ❌                                          | [eslint-plugin-security](https://npmjs.com/eslint-plugin-security) (`security`)                                                 | -                                                                                                                                                                                                                                                                                                         |
| `unusedImports`              | ❌                                          | [eslint-plugin-unused-imports](https://npmjs.com/eslint-plugin-unused-imports) (`unused-imports`)                               | Since v0.7.0                                                                                                                                                                                                                                                                                              |
| `unusedImports/noUnusedVars` | ❌                                          | ^                                                                                                                               | Disables [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and [`sonarjs/no-unused-vars`](https://sonarsource.github.io/rspec/#/rspec/S1481/javascript) rules in favor of `unused-imports/no-unused-vars` |
| `preferArrowFunctions`       | ❌                                          | [eslint-plugin-prefer-arrow-functions](https://npmjs.com/eslint-plugin-prefer-arrow-functions) (`prefer-arrow-functions`)       | Since v0.1.0                                                                                                                                                                                                                                                                                              |
| `perfectionist`              | ❌                                          | [eslint-plugin-perfectionist](https://npmjs.com/eslint-plugin-perfectionist) (`perfectionist`)                                  | Since v0.4.0<br>Supports sub-configs for each rule from the plugin since v1.0.0                                                                                                                                                                                                                           |
| `deMorgan`                   | ❌                                          | [eslint-plugin-de-morgan](https://npmjs.com/eslint-plugin-de-morgan) (`de-morgan`)                                              | Since v0.5.0                                                                                                                                                                                                                                                                                              |
| `es`                         | ❌                                          | [eslint-plugin-es-x](https://npmjs.com/eslint-plugin-es-x) (`es-x`)                                                             | Since v0.10.0                                                                                                                                                                                                                                                                                             |
| `jsInline`                   | ✅                                          | [eslint-plugin-html](https://npmjs.com/eslint-plugin-html) (`html`)                                                             | Since v0.10.0<br>For linting inlined JS in HTML files                                                                                                                                                                                                                                                     |
| `math`                       | ✅                                          | [eslint-plugin-math](https://npmjs.com/eslint-plugin-math) (`math`)                                                             | Since v1.0.0                                                                                                                                                                                                                                                                                              |
| `erasableSyntaxOnly`         | ❌                                          | [eslint-plugin-erasable-syntax-only](https://npmjs.com/eslint-plugin-erasable-syntax-only) (`erasable-syntax-only`)             | Since v1.0.0                                                                                                                                                                                                                                                                                              |
| `noUnnecessaryAbstractions`  | ✅                                          | [eslint-plugin-unnecessary-abstractions](https://npmjs.com/eslint-plugin-unnecessary-abstractions) (`unnecessary-abstractions`) | Since v1.0.0                                                                                                                                                                                                                                                                                              |
| `fastImport`                 | ❌                                          | [eslint-plugin-fast-import](https://npmjs.com/eslint-plugin-fast-import) (`fast-import`)                                        | Since v1.0.0<br>Faster `eslint-plugin-import(-x)` alternative                                                                                                                                                                                                                                             |
| `moduleInterop`              | ✅                                          | [eslint-plugin-module-interop](https://npmjs.com/eslint-plugin-module-interop) (`module-interop`)                               | Since v1.0.0                                                                                                                                                                                                                                                                                              |
| `treeShaking`                | ❌                                          | [eslint-plugin-tree-shaking](https://npmjs.com/eslint-plugin-tree-shaking) (`tree-shaking`)                                     | Since v1.0.0                                                                                                                                                                                                                                                                                              |

### Libraries

| Un config name                                                                      | Enabled by default?<br>(optional condition)            | Primary plugin(s) (`default-prefix`)                                                                                                                 | Description/Notes                                                                                   |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `jest`                                                                              | ✅ (`jest` is installed)                               | [eslint-plugin-jest](https://npmjs.com/eslint-plugin-jest) (`jest`)                                                                                  | Since v0.3.0                                                                                        |
| `jest/extended`                                                                     | ✅ (`jest-extended` is installed)                      | [eslint-plugin-jest-extended](https://npmjs.com/eslint-plugin-jest-extended) (`jest-extended`)                                                       | -                                                                                                   |
| `jest/typescript`                                                                   | ✅ (`ts` config is enabled)                            | [eslint-plugin-jest](https://npmjs.com/eslint-plugin-jest) (`jest`)                                                                                  | Only TypeScript-specific rules from `eslint-plugin-jest`                                            |
| `jest/noOnlyTests`                                                                  | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| `vitest`                                                                            | ✅ (`vitest` is installed)                             | [@vitest/eslint-plugin](https://npmjs.com/@vitest/eslint-plugin) (`vitest`)                                                                          | Since v0.3.0                                                                                        |
| `vitest/noOnlyTests`                                                                | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| `jestDom`                                                                           | ✅ (`@testing-library/jest-dom` is installed)          | [eslint-plugin-jest-dom](https://npmjs.com/eslint-plugin-jest-dom) (`jest-dom`)                                                                      | Since v1.0.0                                                                                        |
| `ava`                                                                               | ✅ (`ava` is installed)                                | [eslint-plugin-ava](https://npmjs.com/eslint-plugin-ava) (`ava`)                                                                                     | Since v1.0.0                                                                                        |
| `ava/noOnlyTests`                                                                   | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| `qunit`                                                                             | ✅ (`qunit` is installed)                              | [eslint-plugin-qunit](https://npmjs.com/eslint-plugin-qunit) (`qunit`)                                                                               | Since v1.0.0                                                                                        |
| `qunit/noOnlyTests`                                                                 | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary`                                                 | ✅ (`@testing-library/dom` is installed)               | [eslint-plugin-testing-library](https://npmjs.com/eslint-plugin-testing-library) (`testing-library`)                                                 | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/angular`                                         | ✅ (`angular` config is enabled)                       | ^                                                                                                                                                    | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/marko`                                           | ✅ (`marko` is installed)                              | ^                                                                                                                                                    | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/react`                                           | ✅ (`react` config is enabled)                         | ^                                                                                                                                                    | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/svelte`                                          | ✅ (`svelte` config is enabled)                        | ^                                                                                                                                                    | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/vue`                                             | ✅ (`vue` config is enabled)                           | ^                                                                                                                                                    | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/*/noOnlyTests`                                   | ✅                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| `noOnlyTests`                                                                       | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| `tanstackQuery`                                                                     | ✅ (`@tanstack/query-core` is installed)               | [@tanstack/eslint-plugin-query](https://npmjs.com/@tanstack/eslint-plugin-query) (`@tanstack/query`)                                                 | Since v1.0.0                                                                                        |
| ![Storybook](./assets/logos-storybook-icon.svg) `storybook`                         | ✅ (`storybook` is installed)                          | [eslint-plugin-storybook](https://npmjs.com/eslint-plugin-storybook) (`storybook`)                                                                   | Since v1.0.0                                                                                        |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress`             | ✅ (`cypress` is installed)                            | [eslint-plugin-cypress](https://npmjs.com/eslint-plugin-cypress) (`cypress`)                                                                         | Since v1.0.0                                                                                        |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress/noOnlyTests` | ✅                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| ![Mocha](./assets/devicon-mocha.svg) `mocha`                                        | ✅ (`mocha` is installed)                              | [eslint-plugin-mocha](https://npmjs.com/eslint-plugin-mocha) (`mocha`)                                                                               | Since v1.0.0                                                                                        |
| ![Mocha](./assets/devicon-mocha.svg) `mocha/noOnlyTests`                            | ✅                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| ![Turborepo](./assets/material-icon-theme-turborepo.svg) `turbo`                    | ✅ (`turbo` is installed)                              | [eslint-plugin-turbo](https://npmjs.com/eslint-plugin-turbo) (`turbo`)                                                                               | Since v1.0.0                                                                                        |
| ![Playwright](./assets/devicon-playwright.svg) `playwright`                         | ✅ (`playwright` is installed)                         | [eslint-plugin-playwright](https://npmjs.com/eslint-plugin-playwright) (`playwright`)                                                                | Since v1.0.0                                                                                        |
| ![Playwright](./assets/devicon-playwright.svg) `playwright/noOnlyTests`             | ❌                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                      | Since v1.0.0                                                                                        |
| ![Lodash](./assets/devicon-plain-lodash.svg) `youDontNeedLodashUnderscore`          | ✅ (`lodash`, `lodash-es` or `lodash.*` is installed)  | [eslint-plugin-you-dont-need-lodash-underscore](https://npmjs.com/eslint-plugin-you-dont-need-lodash-underscore) (`you-dont-need-lodash-underscore`) | Since v1.0.0                                                                                        |
| ![RxJS](./assets/devicon-rxjs.svg) `rxjs`                                           | ✅ (`rxjs` is installed)                               | [@smarttools/eslint-plugin-rxjs](https://npmjs.com/@smarttools/eslint-plugin-rxjs) (`rxjs`)                                                          | Since v1.0.0                                                                                        |
| ![Nx](./assets/vscode-icons-file-type-light-nx.svg) `nx`                            | ✅ (`nx` is installed)                                 | [@nx/eslint-plugin](https://npmjs.com/@nx/eslint-plugin) (`nx`)                                                                                      | Since v1.0.0                                                                                        |
| ![Zod](./assets/logos-zod.svg) `importZod`                                          | ❌                                                     | [eslint-plugin-import-zod](https://npmjs.com/eslint-plugin-import-zod) (`import-zod`)                                                                | Enforces namespace imports for `zod`. You should probably use `zod` config instead.<br>Since v1.0.0 |
| ![UnoCSS](./assets/logos-unocss.svg) `unocss`                                       | ✅ (`unocss` is installed)                             | [@unocss/eslint-plugin](https://npmjs.com/@unocss/eslint-plugin) (`unocss`)                                                                          | Since v1.0.0                                                                                        |
| ![Zod](./assets/logos-zod.svg) `zod`                                                | ✅ (`zod@>=4` is installed)                            | [eslint-plugin-zod-x](https://npmjs.com/eslint-plugin-zod-x) (`zod`)                                                                                 | Since v1.0.0                                                                                        |
| ![FormatJS](./assets/logos-formatjs.svg) `formatJs`                                 | ✅ (`@formatjs/icu-messageformat-parser` is installed) | [eslint-plugin-formatjs](https://npmjs.com/eslint-plugin-formatjs) (`formatjs`)                                                                      | Since v1.0.0                                                                                        |
| ![Docusaurus](./assets/vscode-icons-file-type-docusaurus.svg) `docusaurus`          | ✅ (`@docusaurus/core` is installed)                   | [@docusaurus/eslint-plugin](https://npmjs.com/@docusaurus/eslint-plugin) (`docusaurus`)                                                              | Since v1.0.0                                                                                        |

### Miscellaneous

| Un config name                                                 | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                              | Description/Notes                                                                                                                        |
| -------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `casePolice`                                                   | ❌                                          | [eslint-plugin-case-police](https://npmjs.com/eslint-plugin-case-police) (`case-police`)          | Since v0.9.0                                                                                                                             |
| `noStylisticRules`                                             | ❌                                          | -                                                                                                 | Since v1.0.0<br>Config to disable most of the stylistic rules. Can be useful when integrating eslint-config-un into an existing project. |
| `noUnsanitized`                                                | ✅                                          | [eslint-plugin-no-unsanitized](https://npmjs.com/eslint-plugin-no-unsanitized) (`no-unsanitized`) | Since v1.0.0                                                                                                                             |
| ![CSpell](./assets/vscode-icons-file-type-cspell.svg) `cspell` | ❌                                          | [@cspell/eslint-plugin](https://npmjs.com/@cspell/eslint-plugin) (`@cspell`)                      | Since v1.0.0                                                                                                                             |
| ![ESLint](./assets/devicon-eslint.svg) `eslintPlugin`          | ❌                                          | [eslint-plugin-eslint-plugin](https://npmjs.com/eslint-plugin-eslint-plugin) (`eslint-plugin`)    | Since v1.0.0<br>For linting ESLint plugins                                                                                               |
| `fileProgress`                                                 | ❌                                          | [eslint-plugin-file-progress](https://npmjs.com/eslint-plugin-file-progress) (`file-progress`)    | Since v1.0.0<br>An ESlint plugin to print file progress                                                                                  |
| `compat`                                                       | ❌                                          | [eslint-plugin-compat](https://npmjs.com/eslint-plugin-compat) (`compat`)                         | Since v1.0.0                                                                                                                             |
| `webComponents`                                                | ❌                                          | [eslint-plugin-wc](https://npmjs.com/eslint-plugin-wc) (`wc`)                                     | Since v1.0.0                                                                                                                             |
| `header`                                                       | ❌                                          | [eslint-plugin-header](https://npmjs.com/eslint-plugin-header) (`header`)                         | Since v1.0.0                                                                                                                             |
| `headers`                                                      | ❌                                          | [eslint-plugin-headers](https://npmjs.com/eslint-plugin-headers) (`headers`)                      | Since v1.0.0                                                                                                                             |
| `checkFile`                                                    | ❌                                          | [eslint-plugin-check-file](https://npmjs.com/eslint-plugin-check-file) (`check-file`)             | Since v1.0.0                                                                                                                             |
| `boundaries`                                                   | ❌                                          | [eslint-plugin-boundaries](https://npmjs.com/eslint-plugin-boundaries) (`boundaries`)             | Since v1.0.0                                                                                                                             |
| `noSecrets`                                                    | ✅                                          | [eslint-plugin-no-secrets](https://npmjs.com/eslint-plugin-no-secrets) (`no-secrets`)             | Since v1.0.0                                                                                                                             |
| `noSecrets/json`                                               | ✅                                          | ^                                                                                                 | Applied only to `.json` files by default                                                                                                 |
| `expectType`                                                   | ❌                                          | [eslint-plugin-expect-type](https://npmjs.com/eslint-plugin-expect-type) (`expect-type`)          | Since v1.0.0                                                                                                                             |
| `command`                                                      | ❌                                          | [eslint-plugin-command](https://npmjs.com/eslint-plugin-command) (`command`)                      | Since v1.0.0                                                                                                                             |
| `antfu`                                                        | ❌                                          | [eslint-plugin-antfu](https://npmjs.com/eslint-plugin-antfu) (`antfu`)                            | Since v1.0.0<br>[Anthony Fu](https://antfu.me/)'s personal collection of rules.                                                          |

## How to use

### Rules configuration (`configs` and `extraConfigs` option)

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
});
```

#### Providing user defined flag configs

You can provide your own configs by using `extraConfigs` option. 
The provided configs will be placed after all the eslint-config-un's configs, and before the config which disables Prettier incompatible rules for all files.

Example:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    /* ... */
  },

  extraConfigs: [
    {
      files: ['src/big-list-of-something.ts'],
      rules: {
        'perfectionist/sort-objects': 2,
        'perfectionist/sort-object-types': 2,
      },
    },

    // More flat configs ...
  ],
});
```

### Plugin prefixes (`pluginRenames` option)

ESLint plugins are registered with an arbitrary user-provided prefix, such as `unicorn` or `vue`. 
Then the rule name are formed by combining the prefix with the rule name, for example `unicorn/no-useless-undefined`.

eslint-config-un provides the ability to change any registered plugin prefix. 
Additionally, some plugins are registered with a different prefix than their documentation suggests.
If you would like to rename them back or rename some other plugins, you can use `pluginRenames` option, which is a map from the "canonical" prefixes to the user defined ones.

#### Default renames

| Plugin                                                                                             | Suggested prefix          | Our prefix   | Reason                                                                                                               |
| -------------------------------------------------------------------------------------------------- | ------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| [`typescript-eslint`](https://npmjs.com/typescript-eslint)                                         | `@typescript-eslint`      | `ts`         | More concise and convenient to use                                                                                   |
| [`eslint-plugin-import-x`]                                                                         | `import-x`                | `import`     | This plugin is a fork and is meant to replace the original plugin with `import` prefix                               |
| [`eslint-plugin-n`](https://npmjs.com/eslint-plugin-n)                                             | `n`                       | `node`       | Same ^                                                                                                               |
| [`eslint-plugin-css`](https://npmjs.com/eslint-plugin-css)                                         | `css`                     | `css-in-js`  | Conflicts with [`@eslint/css`](https://npmjs.com/@eslint/css) and our name better captures the essence of the plugin |
| [`eslint-plugin-jsx-a11y-x`](https://npmjs.com/eslint-plugin-jsx-a11y-x)                           | `jsx-a11y-x`              | `jsx-a11y`   | This plugin is a fork and is meant to replace the original plugin with `jsx-a11y` prefix                             |
| [`eslint-plugin-zod-x`](https://npmjs.com/eslint-plugin-zod-x)                                     | `zod-x`                   | `zod`        | Better replacement for an existing `eslint-plugin-zod` plugin                                                        |
| [`@docusaurus/eslint-plugin`](https://npmjs.com/@docusaurus/eslint-plugin)                         | `@docusaurus`             | `docusaurus` | `@` feels unnecessary                                                                                                |
| [`@darraghor/eslint-plugin-nestjs-typed`](https://npmjs.com/@darraghor/eslint-plugin-nestjs-typed) | `@darraghor/nestjs-typed` | `nestjs`     | More concise and convenient to use                                                                                   |

> [!NOTE]
> If you rename a plugin, you still have to use the original prefix within `overrides`, `overridesAny` and `extraConfigs`. eslint-config-un will rename the rules accordingly for you.

> [!WARNING]
> If you rename a plugin, you will have to manually rename the rules within `eslint-disable-*` comments.

### Disabling rule autofix

ESLint [doesn't (yet?) have the ability to disable autofix](https://github.com/eslint/rfcs/pull/125) for a rule by the user on per-rule basis. 
Our config attempts to provide this missing functionality by giving the ability to disable autofix for a rule as a whole ("globally") or per-file and per-rule basis, but in the latter case with a caveat that the rule will have `disable-autofix/` prefix in its name.

#### Globally disabling rule autofix

You can disable autofix for any fixable rule globally using `autofixDisabledGloballyFor` root option:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  autofixDisabledGloballyFor: {
    rules: {
      'ts/array-type': true,
    },
  },
});
```

Note that by default we already globally disable autofix for some rules, the actual list of which can be found in JSDoc of this option.

It's also possible to disable autofixes for all the rules in the plugin at once, and then only enable them for the specific rules:

<!-- eslint-skip -->

```ts
autofixDisabledGloballyFor: {
  plugins: {
    ts: true,
  },
  rules: {
    'ts/array-type': false,
  },
},
```

#### Disabling rule autofix per-file

To disable autofix for a rule only granularly, use an object notation for the rule entry:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    unicorn: {
      overrides: {
        'unicorn/better-regex': {
          severity: 2,
          disableAutofix: true,
        },
      },
    },
  },
});
```

This will technically create a plugin with `disable-autofix` prefix and copy this rule into it. 
The final rule is going to be given a name `disable-autofix/<rule-name>` which would replace `<rule-name>` entry in the resulting config.

## Configs notes

### TypeScript

Rules [requiring type information](https://typescript-eslint.io/rules/?=typeInformation), which are [known to be performance-demanding](https://typescript-eslint.io/getting-started/typed-linting/#performance), are *enabled* by default, and will be applied to the same files as `ts` config is applied to. 
It's just a little heads up; you should make your own decision whether to keep them enabled.
Use `configTypeAware` to control to which files such rules will be applied to, if any.

### Frontend frameworks

We detect the version of the used frontend framework (Angular, Vue, Svelte, etc.) and apply the appropriate rules depending on the version. 
You can always manually specify the version using an appropriate option.
Consult JSDoc of each config for more details.

#### Vue

By default, TypeScript rules will be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to `true` in vue's config options which in turn is *automatically* set to `true` if `ts` config is enabled. 
If you have `.vue` files authored in both TypeScript and JavaScript, use `enforceTypescriptInScriptSection.{files,ignores}` to manually specify TS & JS Vue components respectively. 
It is not currently possible to apply different ESLint rules depending on the value of `lang` attribute of `<script>` SFC section.

#### Angular

We support Angular versions from 13 to 20, all at once. 
You are expected to install `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` packages of the same major version as your Angular version, but installing a greater version would also likely work. 
With the latter, you can use the rules added in newer versions of `@angular-eslint/eslint-plugin*` on older Angular codebases.

#### React

We use rules from several plugins to lint your React code. 
You will be able to choose whether you would like to use only `@eslint-react/eslint-plugin` or `eslint-plugin-react`, or both, which is the default.

### Markdown

If `markdown` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files.
This works because under the hood the plugin [`@eslint/markdown`](https://npmjs.com/@eslint/markdown) that provides that functionality will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports). 
You can find the full list of disabled rules in `src/configs/markdown.ts` file.

### Tailwind CSS

There exists two plugins working with Tailwind:

| Package name                                                                             | Default plugin prefix | Supported Tailwind versions (declared in `peerDependencies`) |
| ---------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) | `better-tailwindcss`  | `^3.3.0 \|\| ^4.1.6`                                         |
| [`eslint-plugin-tailwindcss`](https://npmjs.com/eslint-plugin-tailwindcss)               | `tailwindcss`         | `^3.4.0`                                                     |

We highly recommend using the former because it supports Tailwind v4 and as of time of writing it is better maintained and more actively updated.
In addition, if you don't like the verbosity of the default prefix, you can use [`pluginRenames` option](#pluginrenames) to rename it to simply `tailwindcss` or `tailwind`.

## Root options

### `configs`

### `extraConfigs`

See [Rules configuration](#rules-configuration-configs-and-extraconfigs-option).

### `ignores`

Specifies a list of globally ignored files. 
By default will be merged with our ignore patterns (also exported as [`DEFAULT_GLOBAL_IGNORES`](#default_global_ignores)), unless the object notation is used and the `override` property is set to `true`.

### `extraPlugins`

Allows to provide additional ESLint plugins. 
Their prefixes and possibly rule names will appear in configs' `rules` property type. 
They, like all the built-in plugins, by default will be loaded only if used.

Note that their prefixes must not match the built-it/known ones (like `ts` or `unicorn`) or even prefixes you've set via [`pluginRenames`](#pluginrenames).

### `linterOptions{NoInlineConfig,ReportUnusedDisableDirectives,ReportUnusedInlineConfigs}`

Sets [`linterOptions.{noInlineConfig,reportUnusedDisableDirectives,reportUnusedInlineConfigs}`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=linterOptions) globally or more granularly.

### `defaultConfigsStatus`

Quickly enable multiple configs at once. 
Possible options:

- `all-disabled`: consider all top level configs disabled unless explicitly enabled.
- `misc-enabled`: consider some configs disabled by default (see the list in JSDoc).

### `mode`

Type of your project, either application (`app`, default) or library (`lib`). 
Will affect certain rules, actual list of which is written in JSDoc of this option.

### `forceSeverity`

Globally forces non-zero severity of all the rules configured by eslint-config-un (i.e. not within `overrides`, `overridesAny` or [`extraConfigs`](#extraconfigs)). 
This can also be configured per-config.

### `pluginRenames`

See [Plugin prefixes](#plugin-prefixes-pluginrenames-option).

### `pluginOverrides`

Override implementation of some of the plugins. 
This can be useful when this config is used to lint a repository of one of the built-in plugins to provide development version of that plugin.

### `loadPluginsOnDemand`

This option allows to decide whether whether ESLint plugins will be loaded if they are actually used (`true` by default).

Using object notation, you can also specify concrete plugins that will be loaded. 
This can be useful if you enable certain plugin rules only be using [configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments).

### `autofixDisabledGloballyFor`

See [Globally disabling rule autofix](#globally-disabling-rule-autofix).

### `gitignore`

By default files from `.gitignore` (read from [the current working directory](https://nodejs.org/api/process.html#processcwd)) in the will be automatically added to the global [`ignores`](#ignores) list. 
Set this option to `false` to disable this behavior. 
You may also provide an object which configures [eslint-config-flat-gitignore](https://npmjs.com/eslint-config-flat-gitignore), which actually provides this functionality.

### `offlineMode`

Enables "Offline mode" which can be useful to (temporarily) disable rules performing network requests, such as [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html).

It can also be enabled by setting `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable to non-empty string, but the explicitly passed value takes precedence.

### `cacheConfigs`

Enables flat config caching. 
This option is enabled by default when running in editor (detected by [`is-in-editor`](https://npmjs.com/is-in-editor)). 
It can also be enabled by setting `ESLINT_CONFIG_UN_CACHE_CONFIGS` environment variable to non-empty string, but the explicitly passed value takes precedence.

There are 2 layers of caching:

- In memory: the cache will be stored in a global variable, and if it's preserved between ESLint extension process re-runs (it does at least in VSCode), it will be preferred over FS cache. 
  This is an **extremely fast** caching option.
- In file system: the cache will be stored in `node_modules/.cache/eslint-config-un/config.json`. 
  Note that in this case caching might fail if the config contains unserializable data, such as functions.

The cache, regardless of the storage, is considered fresh for 1 hour, unless one of the following is changed:

- Current git revision (`git rev-parse HEAD`) or root `.gitignore` contents
- `package.json`, lockfile contents or package manager
- ESLint config file contents
- Node.JS version

### `disablePrettierIncompatibleRules`

Disables rules that are potentially conflicting with Prettier. [`eslint-config-prettier`](https://npmjs.com/eslint-config-prettier) is used under the hood, with a few exceptions. 
Defaults to `true` if `prettier` package is installed.

### `useFastImport`

Allows to override certain [`eslint-plugin-import-x`] plugin rules with implementations from [`eslint-plugin-fast-import`](https://npmjs.com/eslint-plugin-fast-import).

## Other exports

### Main entrypoint

#### `globals`

Re-exported default export from [`globals` package](https://npmjs.com/globals), which is a direct dependency of eslint-config-un.

#### `isInCi`

The constant showing if the current process is *likely* running in CI. 
Info provided by [`ci-info` package](https://npmjs.com/ci-info).

Use case: disable or enable certain rules or features in CI. 
Use with caution!

#### `isInEditor`

The constant showing if the current process is *likely* running within editor. 
Info provided by [`is-in-editor` package](https://npmjs.com/is-in-editor).

Use case: disable or enable certain rules or features in editor, likely to improve performance.

> [!WARNING]
> Use this option sparingly as disabling certain rules only in editor might cause false positive reports on unused directives, which are subject to removal with autofix.
> We recommend also setting [`linterOptions.reportUnusedDisableDirectives`](https://eslint.org/docs/latest/use/configure/configuration-files#:~:text=reportUnusedDisableDirectives) to `!isInEditor()` for files affected by this option.

#### `DEFAULT_GLOBAL_IGNORES`

Default list of global `ignores` values set by eslint-config-un. 
See also [`ignores` option](#ignores)

#### `RuleOptions`

All built-in plugins' options type generated by [`eslint-typegen` package](https://npmjs.com/eslint-typegen).

### `snippets` entrypoint

#### Rule options generators

Some useful rule options snippet generators are provided which can be aggravating to write manually:

- `forbidImportingFromUtilityLibraries` for [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)
- `forbid$slotsInsideVueTemplates` for [`vue/no-restricted-syntax`](https://eslint.vuejs.org/rules/no-restricted-syntax.html)

Please refer to JSDoc of exported symbols for proper documentation.

#### `createNoRestricted*Rule`

Utility functions re-exported from [`eslint-no-restricted` package](https://npmjs.com/eslint-no-restricted) which generate `no-restricted-*` rules. 
Please refer to [the package documentation](https://github.com/bradzacher/eslint-no-restricted#readme) for more info.

## FAQ

### How do I add my own flat configs?

Use `extraConfigs` option. 
The configs provided there will be placed after all the eslint-config-un's configs, and before the config which disables Prettier incompatible rules for all files.
These configs have a richer `rules` option, which allows you to apply more settings like `overrides` option does.

Alternatively, you can `await` the `eslintConfig()` function and then add your own flat configs to whatever place you like (we recommend use [flat config composer from `eslint-flat-config-utils` package](https://npmjs.com/eslint-flat-config-utils)) for this purpose.

### Do I have to install any of the used plugins?

Many plugins are direct dependencies on this package, but the rest (the majority) are optional peer dependencies which means you're responsible for making sure they're installed. eslint-config-un will refuse to work if a plugin is used but not installed. 
Please run ESLint with our config once to get the list of dependencies to be installed manually.

### How do I know how eslint-config-un configures rules?

It's too much to document, so please have a look at the source code of our config. 
All the configs are placed inside `src/configs` directory.

### How does exactly eslint-config-un knows if some package is installed?

We use [`import-meta-resolve`](https://npmjs.com/import-meta-resolve) package to detect if the package is installed and resolve the path to its' `package.json`.

### How can I know which configs will be enabled, for which rules autofix will be disabled, etc.?

You can enable the debug mode by setting `DEBUG=eslint-config-un` environment variable when running ESLint command. 
We use [`obug` package](https://npmjs.com/obug) ([`debug`](https://npmjs.com/debug) alternative with compatible API) to print debug messages, so please refer to its documentation for more info.

Alternatively, you can use [`@eslint/config-inspector`](https://npmjs.com/@eslint/config-inspector) to inspect the final config.

## Migrating existing codebase to eslint-config-un

### Prerequisites

Node.JS and ESLint satisfy [minimum required versions](#installation). 
Please don't attempt to migrate to ESLint 9 and eslint-config-un at the same time.

### Migration guide

We recommend that every step and sub-step below is done in a separate commit and on a separate git branch. 
Before committing, please do also run tests, formatter, other linters and tools to ensure that nothing became broken, if you have any.

1. Remove **ALL** ESLint related *dev* dependencies - be it plugins, parsers, whatever else or `eslint` itself. 
   This ensures correct versions of plugins will be resolved by eslint-config-un and saves you from other weird and hard to debug problems.
2. If you're using `.js` config file, we highly recommend that you migrate to `.ts` one, or at least add `@ts-check` TypeScript directive to the former. 
   Please don't forget install [`jiti`](https://npmjs.com/jiti) for ESLint to able be to read your TypeScript config file.
3. Following your intuition or/and configs' options JSDoc documentation, migrate the existing config to the closest eslint-config-un equivalent.
   1. Run ESLint for the first time (without `--fix`!). 
      The list of dependencies to be installed might be shown to you.
      Please review whether those plugins are actually used/needed and act accordingly: install necessary plugins and disable configs which require packages you do not wish to install.
   2. Rename rules on existing [`eslint` configuration comments](https://eslint.org/docs/latest/use/configure/rules#using-configuration-comments) if they have different plugin prefixes (the most common case is that `typescript-eslint` plugin has `ts` prefix in eslint-config-un instead of `@typescript-eslint`) **OR** change prefixes using [`pluginRenames` option](#plugin-prefixes-pluginrenames-option).
4. Perform the following two steps in any order:
   1. Enable stylistic rules only and fix them automatically (if you wish to do so) by running ESLint with `--fix --fix-type problem,suggestion,layout` (the latter flag ensures auto removal of "unused" `eslint-disable` comments will not happen):

      ```ts
      noStylisticRules: {
        enableRules: {
          rules: true,
          disableAllOtherRules: true,
        },
      }
      ```

      **Note:** not every stylistic rule is auto-fixable and not all auto-fixes are safe to apply automatically (although we already maintain a list of rules for which we've disabled autofixes by default for these reasons).

      Please carefully review automatically applied fixes and do not forget about problems requiring manual intervention.
   2. Set `configs.noStylisticRules` to `true` to disable purely stylistic rules and run ESLint for the first time with the new config. 
      Please don't use `--fix` option - this may complicate things as you will have less idea of what's changed (plus some autofixes may be unsafe to automatically apply). 
      Thoroughly go through the report and:
      - Decide which rules need to be disabled, enabled or changed the options of;
      - Decide which `eslint-ignore` comments are no longer relevant and should be removed;
      - Possibly set `ts.allowDefaultProject` to include files which are not part of any TypeScript project (tsconfig file), but for which TypeScript type-aware rules (rules requiring type information) should still work. 
        Conversely, if for some files type-aware linting should be disabled, specify them in `ts.configTypeAware.ignores` option (or set `ts.configTypeAware` to `false` to disable type-aware linting altogether);
      - Add `<!-- eslint-skip -->` comments before fenced code blocks in Markdown files for which code parsing is failing;
      - Fix/resolve any other issues and difficulties.
5. Remove `noStylisticRules` config and probably re-run ESLint as you would do normally to make sure everything is working as intended.

## Troubleshooting & caveats

### Why are there reports from `node` plugin in my frontend code?

All code is assumed to be Node.JS code by default (`eslint-plugin-n` plugin is run on such code). 
Please specify `files`, `ignores` or disable `node` config altogether to avoid false positives.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace

Install `globals` package as a dev dependency.

### Some dependencies are [bundled with `bundleDependencies` feature](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bundledependencies)

If you would like not to wait until the dependencies of `eslint-config-un` are updated or by whatever other reason you need to install a different version of a dependency, you can do that using your package manager's settings for all but the following packages:

| Package name                                                                           | Reason                                                                           |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`eslint-plugin-no-type-assertion`](https://npmjs.com/eslint-plugin-no-type-assertion) | Has outdated requirements of peer dependencies                                   |
| [`eslint-plugin-prettier`](https://npmjs.com/eslint-plugin-prettier)                   | Patched by us to enable formatting of "fenced code blocks" inside Markdown files |

[@eslint-react/eslint-plugin]: https://npmjs.com/@eslint-react/eslint-plugin
[Angular]: ./assets/devicon-angular.svg
[CSS]: ./assets/devicon-css3.svg
[Ember]: ./assets/devicon-ember.svg
[Markdown]: ./assets/mdi-language-markdown.svg
[ReactJS]: ./assets/devicon-react.svg
[TailwindCSS]: ./assets/devicon-tailwindcss.svg
[Testing Library]: ./assets/logos-testing-library.svg
[TypeScript]: ./assets/devicon-typescript.svg
[VueJS]: ./assets/devicon-vuejs.svg
[`eslint-plugin-import-x`]: https://npmjs.com/eslint-plugin-import-x
[eslint-plugin-import-x]: https://npmjs.com/eslint-plugin-import-x
[eslint-plugin-no-only-tests]: https://npmjs.com/eslint-plugin-no-only-tests
[npm]: ./assets/devicon-npm.svg
[pnpm]: ./assets/devicon-pnpm.svg