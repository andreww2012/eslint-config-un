# eslint-config-un [![npm](https://img.shields.io/npm/v/eslint-config-un)](https://npmx.dev/eslint-config-un)

Grown out of a personal collection of rules, this ESLint config aspires to cover as many rules as possible, be reasonably strict, and be easily configurable.

## Features

- **Every major plugin** is included (100+ in total):
  [![JavaScript](./assets/devicon-javascript.svg) Vanilla JS rules](https://eslint.org/docs/latest/rules),
  [![TypeScript] typescript-eslint](https://typescript-eslint.io/rules/),
  [🦄unicorn](https://npmx.dev/eslint-plugin-unicorn),
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
- **Respects your root `.gitignore`**: files listed in `.gitignore` are excluded from linting by default;
- Provides the ability **to disable autofix** on a per-rule basis;
- **Works great with Prettier**: conflicting rules are disabled if you use Prettier;
- **Rename plugin prefixes** easily if you would like to;
- **Bring your own plugins** and their rules will also be typed as much as possible.

## Installation

Minimum supported versions:

- NodeJS: ^22.23.1 or >=24
- ESLint: ^10 (peer dependency)

```sh
npm i -D eslint-config-un eslint@latest
pnpm i -D eslint-config-un eslint@latest
yarn add -D eslint-config-un eslint@latest # Yarn Berry only (v2+)
```

Commonly used plugins are direct dependencies of this package; you don't need to install them separately.
We aim to update the dependencies within 1 month after their release.
You can always override plugins' implementation with [`pluginOverrides` option](#pluginoverrides) or using your package manager's overrides functionality.

Certain plugins (usually framework/library specific ones) are optional peer dependencies, which means that you need to install them manually if they end up being used.
You need to run ESLint with our config once to find out which plugins should be installed manually.

<details>
<summary>List of optional peer dependencies</summary>

| Package name                                       | Default plugin prefix                |
| -------------------------------------------------- | ------------------------------------ |
| `@angular-eslint/eslint-plugin`                    | `@angular-eslint`                    |
| `@angular-eslint/eslint-plugin-template`           | `@angular-eslint/template`           |
| `@cspell/eslint-plugin`                            | `@cspell`                            |
| `@darraghor/eslint-plugin-nestjs-typed`            | `nestjs`                             |
| `@docusaurus/eslint-plugin`                        | `docusaurus`                         |
| `@eslint-react/eslint-plugin`                      | `@eslint-react`                      |
| `@eslint/json`                                     | `json`                               |
| `@graphql-eslint/eslint-plugin`                    | `graphql`                            |
| `@intlify/eslint-plugin-vue-i18n`                  | `@intlify/vue-i18n`                  |
| `@next/eslint-plugin-next`                         | `@next/next`                         |
| `@ngrx/eslint-plugin`                              | `@ngrx`                              |
| `@nuxt/eslint-plugin`                              | `nuxt`                               |
| `@nx/eslint-plugin`                                | `nx`                                 |
| `@smarttools/eslint-plugin-rxjs`                   | `rxjs`                               |
| `@tanstack/eslint-plugin-query`                    | `@tanstack/query`                    |
| `@tanstack/eslint-plugin-router`                   | `@tanstack/router`                   |
| `@tanstack/eslint-plugin-start`                    | `@tanstack/start`                    |
| `@unhead/eslint-plugin`                            | `@unhead`                            |
| `@unocss/eslint-plugin`                            | `@unocss`                            |
| `@vitest/eslint-plugin`                            | `vitest`                             |
| `eslint-plugin-antfu`                              | `antfu`                              |
| `eslint-plugin-arrow-return-style-x`               | `arrow-return-style`                 |
| `eslint-plugin-astro`                              | `astro`                              |
| `eslint-plugin-ava`                                | `ava`                                |
| `eslint-plugin-awscdk`                             | `awscdk`                             |
| `eslint-plugin-barrel-files`                       | `barrel-files`                       |
| `eslint-plugin-better-tailwindcss`                 | `better-tailwindcss`                 |
| `eslint-plugin-boundaries`                         | `boundaries`                         |
| `eslint-plugin-case-police`                        | `case-police`                        |
| `eslint-plugin-check-file`                         | `check-file`                         |
| `eslint-plugin-clsx`                               | `clsx`                               |
| `eslint-plugin-command`                            | `command`                            |
| `eslint-plugin-compat`                             | `compat`                             |
| `eslint-plugin-cypress`                            | `cypress`                            |
| `eslint-plugin-de-morgan`                          | `de-morgan`                          |
| `eslint-plugin-drizzle`                            | `drizzle`                            |
| `eslint-plugin-ember`                              | `ember`                              |
| `eslint-plugin-erasable-syntax-only`               | `erasable-syntax-only`               |
| `eslint-plugin-es-x`                               | `es`                                 |
| `eslint-plugin-eslint-plugin`                      | `eslint-plugin`                      |
| `eslint-plugin-expect-type`                        | `expect-type`                        |
| `eslint-plugin-expo`                               | `expo`                               |
| `eslint-plugin-format`                             | `format`                             |
| `eslint-plugin-formatjs`                           | `formatjs`                           |
| `eslint-plugin-functional`                         | `functional`                         |
| `eslint-plugin-github-action`                      | `github-actions`                     |
| `eslint-plugin-header`                             | `header`                             |
| `eslint-plugin-headers`                            | `headers`                            |
| `eslint-plugin-import-zod`                         | `import-zod`                         |
| `eslint-plugin-jest`                               | `jest`                               |
| `eslint-plugin-jest-dom`                           | `jest-dom`                           |
| `eslint-plugin-jest-extended`                      | `jest-extended`                      |
| `eslint-plugin-lit`                                | `lit`                                |
| `eslint-plugin-lit-a11y`                           | `lit-a11y`                           |
| `eslint-plugin-mobx`                               | `mobx`                               |
| `eslint-plugin-mocha`                              | `mocha`                              |
| `eslint-plugin-no-relative-import-paths`           | `no-relative-import-paths`           |
| `eslint-plugin-pinia`                              | `pinia`                              |
| `eslint-plugin-playwright`                         | `playwright`                         |
| `eslint-plugin-prefer-arrow-functions`             | `prefer-arrow-functions`             |
| `eslint-plugin-qunit`                              | `qunit`                              |
| `eslint-plugin-qwik`                               | `qwik`                               |
| `@tsrx/eslint-plugin`                              | `ripple`                             |
| `eslint-plugin-react`                              | `react`                              |
| `eslint-plugin-react-debug`                        | `@eslint-react`                      |
| `eslint-plugin-react-hooks`                        | `react-hooks`                        |
| `eslint-plugin-react-refresh`                      | `react-refresh`                      |
| `eslint-plugin-react-you-might-not-need-an-effect` | `react-you-might-not-need-an-effect` |
| `eslint-plugin-remeda`                             | `remeda`                             |
| `eslint-plugin-sentences-per-line`                 | `sentences-per-line`                 |
| `eslint-plugin-solid`                              | `solid`                              |
| `eslint-plugin-sql`                                | `sql`                                |
| `eslint-plugin-storybook`                          | `storybook`                          |
| `eslint-plugin-svelte`                             | `svelte`                             |
| `eslint-plugin-tailwindcss`                        | `tailwindcss`                        |
| `eslint-plugin-testing-library`                    | `testing-library`                    |
| `eslint-plugin-tree-shaking`                       | `tree-shaking`                       |
| `eslint-plugin-tsdoc`                              | `tsdoc`                              |
| `eslint-plugin-turbo`                              | `turbo`                              |
| `eslint-plugin-unused-imports`                     | `unused-imports`                     |
| `eslint-plugin-vue`                                | `vue`                                |
| `eslint-plugin-vue-scoped-css`                     | `vue-scoped-css`                     |
| `eslint-plugin-vuejs-accessibility`                | `vuejs-accessibility`                |
| `eslint-plugin-wc`                                 | `wc`                                 |
| `eslint-plugin-you-dont-need-lodash-underscore`    | `you-dont-need-lodash-underscore`    |
| `eslint-plugin-zod`                                | `zod`                                |
| `eslint-plugin-zod-core`                           | `zod-core`                           |
| `eslint-plugin-zod-mini`                           | `zod-mini`                           |
| `eslint-plugin-zod-openapi`                        | `zod-openapi`                        |
| `import-integrity-lint`                            | `import-integrity`                   |

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
> We highly recommend using TypeScript config file, or [`@ts-check` directive](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#ts-check) at the start of the file otherwise.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
## Configs and Sub-configs

eslint-config-un has a concept of Configs and Sub-configs (collectively referred to as Configs in this section).
They are similar to ESLint flat config objects, but with some useful extensions.
Every Config is *usually* tied to one or more ESLint plugins and produces one or more ESLint flat config items.

You can enable any Config by setting it to `true` or an object with the Config's options.
Passing `false` disables the Config.
Passing an empty array to `files` disables the Config, but not its Sub-configs.

Sub-config is a Config located within Config's options.
If the parent config is disabled by passing `false`, all its Sub-configs are disabled too.

After evaluating all the flat configs, eslint-config-un will **load only those plugins that were actually used**, unless `loadPluginsOnDemand` option is set to `false`.

### Config (`UnConfig`) interface

The Config has the following interface (exact types are simplified for docs):

```ts
type Severity = 0 | 1 | 2 | 'off' | 'warn' | 'error';

type RuleOptions = {/* ... pre-generated all rules' options */};

type UnRuleEntry<RuleName extends string> =
  | Severity
  | [Severity, RuleOptions[RuleName]]
  | {
      severity: Severity;
      options?: RuleOptions[RuleName];
      disableAutofix?: boolean;
      files?: string[];
      ignores?: string[];
    };

type UnConfig =
  | boolean
  | {
      files?: string[];
      ignores?: string[];

      [RuleName in ('overrides' | 'overridesAny')]?: {
        [RuleName in string]:
          | UnRuleEntry<RuleName>
          | ((
              // These are severity and options *maybe* set by eslint-config-un
              unRuleSeverity: Severity,
              unRuleOptions?: RuleOptions[RuleName],
            ) => UnRuleEntry<RuleName>);
      };

      forceSeverity?: '2' | 'error' | '1' | 'warn';
      [`config${string}`]: UnConfig; // These are Sub-configs
      [customOptions: string]: unknown; // Custom options, individual for each Config
    };
```

#### `files` and `ignores`

They have exactly the same meaning as the corresponding ESLint flat config item properties, with the only difference being an empty array `[]` handling:

- If you specify an empty array for `files`, the Config **will be disabled**, but its Sub-configs remain unaffected.
- If you specify an empty array for `ignores`, the default ignore list won't be used.

#### `overrides` and `overridesAny`

These are similar to ESLint's `rules`, but with a very important advantage: you can provide a function that will be called with the rule severity and options set by eslint-config-un, which allows you to **granularly override the options** or change the severity of each rule.

- The difference between `overrides` and `overridesAny` is that `overridesAny` will allow *any* rule to be overridden (from TypeScript's stand point; technically you can pass any rule to `overrides` too), while `overrides` will only allow those rules which are tied to the config.
- `overridesAny` will be applied **after** `overrides`.

#### Sub-configs

Sub-configs are the same as Configs, but configured within Config options.
All Sub-configs use `configXXX` naming convention.

#### `forceSeverity`

Allows to bulk override the severity of all the rules not overridden via `overrides` or `overridesAny`.

#### Custom options

Custom options are individual for each Config and are documented in JSDoc format.

### Rule entry (`UnRuleEntry`) interface

#### `severity` and `options`

Normal ESLint severity and rule options.

#### `disableAutofix`

Apply a copy of the rule with `disable-autofix/` prefix and all autofixes disabled.

#### `files` and `ignores`

Allows to limit to which files only the current rule will be applied.
Only works if:

- At least one of `files` or `ignores` is provided and non-empty;
- `files` or the current Config is not an empty array.

If these conditions are met, a separate Config will be created with:

- `name` being the current Config's name with `/@rule/<rule name with prefix>` postfix;
- `files` [intersected with the parent's `files`](https://eslint.org/docs/latest/use/configure/configuration-files#specify-files-with-an-and-operation);
- `ignores` merged with the parent's `ignores`.

## List of configs

In the following table, Sub-configs have `/` in their names.

> [!WARNING]
> You will notice that oftentimes the configs are automatically enabled if certain dependency(-ies) are installed.
> This check is done by [`import-meta-resolve` package](https://npmx.dev/import-meta-resolve) and might produce false positives.
> Please [read more about this here](#how-does-exactly-eslint-config-un-knows-if-some-package-is-installed).

### Most popular and well known

| Un config name                                      | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                                    | Description/Notes                                                            |
| --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| ![JavaScript](./assets/devicon-javascript.svg) `js` | ✅                                          | [Vanilla ESLint rules](https://eslint.org/docs/latest/rules)                                                                            | -                                                                            |
| ![TypeScript] `ts`                                  | ✅                                          | [typescript-eslint](https://npmx.dev/typescript-eslint) (`ts`)                                                                          | Only rules **not** requiring type information.                               |
| ![TypeScript] `ts/setup`                            | ✅                                          | ^                                                                                                                                       | Set ups the plugin for all files requiring TS plugin w/o type checking.      |
| ![TypeScript] `ts/typeAware`                        | ✅                                          | ^                                                                                                                                       | Only rules requiring type information.                                       |
| ![TypeScript] `ts/typeAware/setup`                  | ✅                                          | ^                                                                                                                                       | Set ups the plugin for all files requiring type checking.                    |
| ![TypeScript] `ts/disableNoUnsafe`                  | ❌                                          | ^                                                                                                                                       | Config that disables all the `no-unsafe-*` rules.                            |
| ![TypeScript] `ts/noTypeAssertion`                  | ✅                                          | [eslint-plugin-no-type-assertion](https://npmx.dev/eslint-plugin-no-type-assertion) (`no-type-assertion`)                               | -                                                                            |
| ![TypeScript] `ts/sortTsconfigKeys`                 | ❌                                          | -                                                                                                                                       | Sort type-level and `compilerOptions` keys in tsconfig files.                |
| 🦄 `unicorn`                                        | ✅                                          | [eslint-plugin-unicorn](https://npmx.dev/eslint-plugin-unicorn) (`unicorn`)                                                             | -                                                                            |
| 🦄 `unicorn/anyLanguage`                            | ✅                                          | ^                                                                                                                                       | Rules the plugin declares as supporting any file type; not restricted to any |
| 🦄 `unicorn/css`                                    | ✅ (`css` config is enabled)                | ^                                                                                                                                       | Applies the CSS-supporting rules to `.css` files                             |
| 🦄 `unicorn/html`                                   | ✅ (`html` config is enabled)               | ^                                                                                                                                       | Applies the HTML-supporting rules to `.htm(l)` files                         |
| 🦄 `unicorn/json`                                   | ✅ (`json` or `jsonc` config is enabled)    | ^                                                                                                                                       | Applies the JSON-supporting rules to `.json`, `.jsonc` and `.json5` files    |
| 🦄 `unicorn/markdown`                               | ✅ (any of `markdown*` configs are enabled) | ^                                                                                                                                       | Applies the Markdown-supporting rules to `.md` and `.mdx` files              |
| ⭐ `regexp`                                         | ✅                                          | [eslint-plugin-regexp](https://npmx.dev/eslint-plugin-regexp) (`regexp`)                                                                | -                                                                            |
| `promise`                                           | ✅                                          | [eslint-plugin-promise](https://npmx.dev/eslint-plugin-promise) (`promise`)                                                             | -                                                                            |
| `import`                                            | ✅                                          | [eslint-plugin-import-x] (`import`)                                                                                                     | -                                                                            |
| `sonarjs`                                           | ✅                                          | [eslint-plugin-sonarjs](https://npmx.dev/eslint-plugin-sonarjs) (`sonarjs`)                                                             | -                                                                            |
| `eslintComments`                                    | ✅                                          | [@eslint-community/eslint-plugin-eslint-comments](https://npmx.dev/@eslint-community/eslint-plugin-eslint-comments) (`eslint-comments`) | Since v0.1.3                                                                 |
| `jsdoc`                                             | ✅                                          | [eslint-plugin-jsdoc](https://npmx.dev/eslint-plugin-jsdoc) (`jsdoc`)                                                                   | Since v0.3.1                                                                 |
| `jsdoc/typescript`                                  | ✅ (`ts` config is enabled)                 | -                                                                                                                                       | Config for disabling or disabling certain rules for TypeScript files         |
| `tsdoc`                                             | ❌                                          | [eslint-plugin-tsdoc](https://npmx.dev/eslint-plugin-tsdoc) (`tsdoc`)                                                                   | -                                                                            |

### Web frameworks & related

| Un config name                                                                   | Enabled by default?<br>(optional condition)              | Primary plugin(s) (`default-prefix`)                                                                                                                         | Description/Notes                                                                                                                                     |
| -------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![VueJS] `vue`                                                                   | ✅ (`vue` is installed)                                  | [eslint-plugin-vue](https://npmx.dev/eslint-plugin-vue) (`vue`)                                                                                              | -                                                                                                                                                     |
| ![VueJS] `vue/a11y`                                                              | ✅                                                       | [eslint-plugin-vuejs-accessibility](https://npmx.dev/eslint-plugin-vuejs-accessibility) (`vuejs-accessibility`)                                              | -                                                                                                                                                     |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt`                                    | ✅ (`nuxt` is installed)                                 | [@nuxt/eslint-plugin](https://npmx.dev/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Since v1.0.0                                                                                                                                          |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt/nuxtConfig`                         | ✅                                                       | [@nuxt/eslint-plugin](https://npmx.dev/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Rules related to Nuxt config file<br>Since v1.0.0                                                                                                     |
| ![Pinia](./assets/logos-pinia.svg) `vue/pinia`                                   | ✅ (`pinia` is installed)                                | [eslint-plugin-pinia](https://npmx.dev/eslint-plugin-pinia) (`pinia`)                                                                                        | -                                                                                                                                                     |
| ![VueJS] `vue/i18n`                                                              | ✅ (`vue-i18n` is installed)                             | [@intlify/eslint-plugin-vue-i18n](https://npmx.dev/@intlify/eslint-plugin-vue-i18n) (`@intlify/vue-i18n`)                                                    | Since v1.0.0<br>`vue-i18n` specific rules                                                                                                             |
| ![VueJS] `vue/scopedCss`                                                         | ✅                                                       | [eslint-plugin-vue-scoped-css](https://npmx.dev/eslint-plugin-vue-scoped-css) (`vue-scoped-css`)                                                             | Since v1.0.0                                                                                                                                          |
| ![VueJS] `vue/enforceTypescriptInScriptSection`                                  | ✅ (`ts` config is enabled)                              | [eslint-plugin-vue](https://npmx.dev/eslint-plugin-vue) (`vue`)                                                                                              | Since v1.0.0<br>Enforces `lang="ts"` in `<script>` sections via [`vue/block-lang`](https://eslint.vuejs.org/rules/block-lang.html)                    |
| ![Angular] `angular`                                                             | ✅ (`@angular/core` is installed)                        | [@angular-eslint/eslint-plugin](https://npmx.dev/@angular-eslint/eslint-plugin) (`@angular-eslint`)                                                          | Since v0.78.0                                                                                                                                         |
| ![Angular] `angular/template`                                                    | ✅                                                       | [@angular-eslint/eslint-plugin/template](https://npmx.dev/@angular-eslint/eslint-plugin-template) (`@angular-eslint/template`)                               | -                                                                                                                                                     |
| `ngrx`                                                                           | ✅ (`@ngrx/store` is installed)                          | [@ngrx/eslint-plugin](https://npmx.dev/@ngrx/eslint-plugin) (`@ngrx`)                                                                                        | Since v1.0.0                                                                                                                                          |
| ![ReactJS] `react`                                                               | ✅ (`react` is installed)                                | [eslint-plugin-react](https://npmx.dev/eslint-plugin-react) (`react`)                                                                                        | Since v0.8.0                                                                                                                                          |
| ![ReactJS] `react/reactX`                                                        | ✅                                                       | [@eslint-react/eslint-plugin] (`@eslint-react`)                                                                                                              | -                                                                                                                                                     |
| ![ReactJS] `react/reactX/typeAwareRules`                                         | ✅ (`ts` config is enabled)                              | [@eslint-react/eslint-plugin] (`@eslint-react`)                                                                                                              | Since v1.0.0<br>Type-aware rules from `@eslint-react/eslint-plugin`                                                                                   |
| ![ReactJS] `react/hooks`                                                         | ✅                                                       | [eslint-plugin-react-hooks](https://npmx.dev/eslint-plugin-react-hooks) (`react-hooks`)<br>[@eslint-react/eslint-plugin] (`@eslint-react`)                   | Includes rules with `@eslint-react/hooks-extra` prefix from `@eslint-react/eslint-plugin`                                                             |
| ![ReactJS] `react/dom`                                                           | ✅ (`react-dom` is installed)                            | [@eslint-react/eslint-plugin] (`@eslint-react`)<br>[eslint-plugin-react](https://npmx.dev/eslint-plugin-react)                                               | Includes rules with `@eslint-react/dom` prefix from `@eslint-react/eslint-plugin` and DOM related rules from `eslint-plugin-react`                    |
| ![ReactJS] `react/refresh`                                                       | ✅                                                       | [eslint-plugin-react-refresh](https://npmx.dev/eslint-plugin-react-refresh) (`react-refresh`)                                                                | -                                                                                                                                                     |
| ![ReactJS] `react/youMightNotNeedAnEffect`                                       | ✅                                                       | [eslint-plugin-react-you-might-not-need-an-effect](https://npmx.dev/eslint-plugin-react-you-might-not-need-an-effect) (`react-you-might-not-need-an-effect`) | Since v1.0.0                                                                                                                                          |
| ![ReactJS] `react/allowDefaultExportsInJsxFiles`                                 | ✅                                                       | -                                                                                                                                                            | Config that allows default exports in all JSX files                                                                                                   |
| ![NextJS](./assets/devicon-nextjs.svg) `nextJs`                                  | ✅ (`next` is installed)                                 | [@next/eslint-plugin-next](https://npmx.dev/@next/eslint-plugin-next) (`@next/next`)                                                                         | Since v0.9.0                                                                                                                                          |
| `expo`                                                                           | ✅ (`expo` is installed)                                 | [eslint-plugin-expo](https://npmx.dev/eslint-plugin-expo) (`expo`)                                                                                           | Since v1.0.0                                                                                                                                          |
| ![SolidJS](./assets/devicon-solidjs.svg) `solid`                                 | ✅ (`solid-js` is installed)                             | [eslint-plugin-solid](https://npmx.dev/eslint-plugin-solid) (`solid`)                                                                                        | Since v0.10.0                                                                                                                                         |
| ![SolidJS](./assets/devicon-qwik.svg) `qwik`                                     | ✅ (`@builder.io/qwik` or `@qwik.dev/core` is installed) | [eslint-plugin-qwik](https://npmx.dev/eslint-plugin-qwik) (`qwik`)                                                                                           | Since v0.6.0                                                                                                                                          |
| `ripple`                                                                         | ✅ (`ripple` is installed)                               | [@tsrx/eslint-plugin](https://npmx.dev/@tsrx/eslint-plugin) (`ripple`)                                                                                       | Since v1.0.0                                                                                                                                          |
| `ripple/setup`                                                                   | ✅                                                       | ^                                                                                                                                                            | Since v1.0.0<br>Sets up `.tsrx` and `.ripple` files parser.                                                                                           |
| `ripple/ts`                                                                      | ✅                                                       | ^                                                                                                                                                            | Since v1.0.0<br>Module-scope Ripple rules for TypeScript files.                                                                                       |
| ![Astro] `astro`                                                                 | ✅ (`astro` is installed)                                | [eslint-plugin-astro](https://npmx.dev/eslint-plugin-astro) (`astro`)                                                                                        | Since v0.9.0<br>Without A11Y rules                                                                                                                    |
| ![Astro] `astro/setup`                                                           | ✅                                                       | ^                                                                                                                                                            | Since v1.0.0<br>Set ups Astro files parser.                                                                                                           |
| ![Astro] `astro/jsxA11y`                                                         | ✅                                                       | ^                                                                                                                                                            | Only A11Y rules from `eslint-plugin-astro`                                                                                                            |
| ![Svelte](./assets/devicon-svelte.svg) `svelte`                                  | ✅ (`svelte` is installed)                               | [eslint-plugin-svelte](https://npmx.dev/eslint-plugin-svelte) (`svelte`)                                                                                     | Since v0.10.0                                                                                                                                         |
| ![Svelte](./assets/devicon-svelte.svg) `svelte/enforceTypescriptInScriptSection` | ✅ (`ts` config is enabled)                              | ^                                                                                                                                                            | Since v1.0.0<br>Enforces `lang="ts"` in `<script>` blocks via [`svelte/block-lang`](https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang) |
| ![Ember] `ember`                                                                 | ✅ (`ember-source` is installed)                         | [eslint-plugin-ember](https://npmx.dev/eslint-plugin-ember) (`ember`)                                                                                        | Since v1.0.0                                                                                                                                          |
| ![Ember] `ember/testFiles`                                                       | ✅                                                       | ^                                                                                                                                                            | Since v1.0.0                                                                                                                                          |
| ![Ember] `ember/testFiles/noOnlyTests`                                           | ✅                                                       | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                              | Since v1.0.0                                                                                                                                          |
| ![Lit](./assets/logos-lit-icon.svg) `lit`                                        | ✅ (`lit` is installed)                                  | [eslint-plugin-lit](https://npmx.dev/eslint-plugin-lit) (`lit`)                                                                                              | Since v1.0.0                                                                                                                                          |
| ![Lit](./assets/logos-lit-icon.svg) `lit/a11y`                                   | ✅                                                       | [eslint-plugin-lit-a11y](https://npmx.dev/eslint-plugin-lit-a11y) (`lit-a11y`)                                                                               | Since v1.0.0                                                                                                                                          |
| ![TailwindCSS] `betterTailwind`                                                  | ✅ (`tailwindcss` is installed)                          | [eslint-plugin-better-tailwindcss](https://npmx.dev/eslint-plugin-better-tailwindcss) (`better-tailwindcss`)                                                 | Since v1.0.0<br>Supports v4 and v3                                                                                                                    |
| ![TailwindCSS] `tailwind`                                                        | ❌                                                       | [eslint-plugin-tailwindcss](https://npmx.dev/eslint-plugin-tailwindcss) (`tailwindcss`)                                                                      | Only supports v3                                                                                                                                      |
| ![NestJS](./assets/devicon-nestjs.svg) `nestJs`                                  | ✅ (`@nestjs/core` is installed)                         | [@darraghor/eslint-plugin-nestjs-typed](https://npmx.dev/@darraghor/eslint-plugin-nestjs-typed) (`nestjs`)                                                   | Since v1.0.0                                                                                                                                          |

### Runtimes & related

| Un config name                                                                   | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                      | Description/Notes                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![NodeJS](./assets/devicon-nodejs.svg) `node`                                    | ✅                                          | [eslint-plugin-n](https://npmx.dev/eslint-plugin-n) (`node`)                                              | -                                                                                                                                                                                          |
| ![npm] `packageJson`                                                             | ❌                                          | [eslint-plugin-package-json](https://npmx.dev/eslint-plugin-package-json) (`package-json`)                | Since v0.1.5                                                                                                                                                                               |
| ![npm] `nodeDependencies`                                                        | ❌                                          | [eslint-plugin-node-dependencies](https://npmx.dev/eslint-plugin-node-dependencies) (`node-dependencies`) | Since v0.10.0                                                                                                                                                                              |
| ![npm] `depend`                                                                  | ❌                                          | [eslint-plugin-depend](https://npmx.dev/eslint-plugin-depend) (`depend`)                                  | Since v1.0.0                                                                                                                                                                               |
| ![pnpm] `pnpm`                                                                   | ✅ (pnpm is detected as a package manager)  | [eslint-plugin-pnpm](https://npmx.dev/eslint-plugin-pnpm) (`pnpm`)                                        | Since v0.8.0<br>Does nothing, split into sub-configs                                                                                                                                       |
| ![pnpm] `pnpm/packageJson`                                                       | ✅                                          | ^                                                                                                         | Plugin rules related to `package.json` files                                                                                                                                               |
| ![pnpm] `pnpm/pnpmWorkspace`                                                     | ✅                                          | ^                                                                                                         | Plugin rules related to `pnpm-workspace.yaml` file                                                                                                                                         |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions`    | ❌                                          | -                                                                                                         | Since v0.10.0<br>For linting [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) written for JavaScript Runtime v2 |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions/V1` | ❌                                          | -                                                                                                         | Same, but for JavaScript Runtime v1 functions                                                                                                                                              |

### Languages

| Un config name                                               | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                  | Description/Notes                                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| ![Markdown] `markdown`                                       | ✅                                          | [@eslint/markdown](https://npmx.dev/@eslint/markdown) (`markdown`)                                                    | Since v0.7.0<br>Configured to also lint fenced code blocks inside .md files                                               |
| ![Markdown] `markdown/formatFencedCodeBlocks`                | ✅ (`prettier` is installed)                | [eslint-plugin-prettier](https://npmx.dev/eslint-plugin-prettier) (`prettier`)                                        | Since v1.0.0<br>Format fenced code blocks inside Markdown files using Prettier                                            |
| ![Markdown] `markdown/sentencesPerLine`                      | ❌                                          | [eslint-plugin-sentences-per-line](https://npmx.dev/eslint-plugin-sentences-per-line) (`sentences-per-line`)          | Since v1.0.0                                                                                                              |
| ![Markdown] `markdownPreferences`                            | ✅                                          | [eslint-plugin-markdown-preferences](https://npmx.dev/eslint-plugin-markdown-preferences) (`markdownPreferences`)     | Since v1.0.0                                                                                                              |
| ![Markdown] `markdownLinks`                                  | ❌                                          | [eslint-plugin-markdown-links](https://npmx.dev/eslint-plugin-markdown-links) (`markdownLinks`)                       | Since v1.0.0                                                                                                              |
| ![MDX](./assets/vscode-icons-file-type-mdx.svg) `mdx`        | ✅                                          | [eslint-plugin-mdx](https://npmx.dev/eslint-plugin-mdx) (`mdx`)                                                       | Since v1.0.0<br>Configured to also lint fenced code blocks inside .mdx files                                              |
| ![CSS] `css`                                                 | ✅ (unless `stylelint` is installed)        | [@eslint/css](https://npmx.dev/@eslint/css) (`css`)                                                                   | Since v0.7.0                                                                                                              |
| ![CSS] `cssInJs`                                             | ✅                                          | [eslint-plugin-css](https://npmx.dev/eslint-plugin-css) (`css-in-js`)                                                 | Since v0.2.0<br>Lints inlined CSS                                                                                         |
| `jsxA11y`                                                    | ✅                                          | [eslint-plugin-jsx-a11y-x](https://npmx.dev/eslint-plugin-jsx-a11y-x) (`jsx-a11y`)                                    | Since v1.0.0<br>Since v0.8.0 and until v1.0.0, [eslint-plugin-jsx-a11y](https://npmx.dev/eslint-plugin-jsx-a11y) was used |
| ![YAML](./assets/devicon-yaml.svg) `yaml`                    | ❌                                          | [eslint-plugin-yaml](https://npmx.dev/eslint-plugin-yaml) (`yaml`)                                                    | Since v0.1.0                                                                                                              |
| ![JSON](./assets/devicon-json.svg) `json`                    | ❌                                          | [@eslint/json](https://npmx.dev/@eslint/json) (`json`)                                                                | Since v1.0.0<br>Lints JSON, JSONC and JSON5 via the official plugin                                                       |
| `json/jsonc`                                                 | ✅                                          | ^                                                                                                                     | Lints `.jsonc` files; enabled by default when `json` is enabled                                                           |
| `json/json5`                                                 | ✅                                          | ^                                                                                                                     | Lints `.json5` files; enabled by default when `json` is enabled                                                           |
| ![JSON](./assets/devicon-json.svg) `jsonc`                   | ❌                                          | [eslint-plugin-jsonc](https://npmx.dev/eslint-plugin-jsonc) (`jsonc`)                                                 | Since v0.1.4<br>Supports JSON, JSON5, JSONC                                                                               |
| `jsonc/json`                                                 | ❌                                          | ^                                                                                                                     | Config exclusively for `.json` files, does nothing by default                                                             |
| `jsonc/jsonc`                                                | ❌                                          | ^                                                                                                                     | Config exclusively for `.jsonc` files, does nothing by default                                                            |
| `jsonc/json5`                                                | ❌                                          | ^                                                                                                                     | Config exclusively for `.json5` files, does nothing by default                                                            |
| `jsonSchemaValidator`                                        | ❌                                          | [eslint-plugin-json-schema-validator](https://npmx.dev/eslint-plugin-json-schema-validator) (`json-schema-validator`) | Since v0.6.0                                                                                                              |
| `jsonSchemaValidator/{json,yaml,toml}`                       | ✅                                          | ^                                                                                                                     | Since v1.0.0                                                                                                              |
| ![TOML](./assets/tabler-toml.svg) `toml`                     | ❌                                          | [eslint-plugin-toml](https://npmx.dev/eslint-plugin-toml) (`toml`)                                                    | Since v0.1.3                                                                                                              |
| ![HTML](./assets/devicon-html5.svg) `html`                   | ✅                                          | [@html-eslint/eslint-plugin](https://npmx.dev/@html-eslint/eslint-plugin) (`@html-eslint`)                            | Since v0.10.0                                                                                                             |
| ![GraphQL](./assets/logos-graphql.svg) `graphql`             | ✅ (`graphql` is installed)                 | [@graphql-eslint/eslint-plugin](https://npmx.dev/@graphql-eslint/eslint-plugin) (`graphql`)                           | Since v1.0.0                                                                                                              |
| ![GraphQL](./assets/logos-graphql.svg) `graphql/jsProcessor` | ✅                                          | ^                                                                                                                     | Since v1.0.0<br>Runs the GraphQL processor on JS/TS files                                                                 |

### Js/ts - miscellaneous

| Un config name                 | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                           | Description/Notes                                                                                                                                                                                                                         |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `security`                     | ❌                                          | [eslint-plugin-security](https://npmx.dev/eslint-plugin-security) (`security`)                                                 | -                                                                                                                                                                                                                                         |
| `unusedImports`                | ❌                                          | [eslint-plugin-unused-imports](https://npmx.dev/eslint-plugin-unused-imports) (`unused-imports`)                               | Since v0.7.0                                                                                                                                                                                                                              |
| `unusedImports/noUnusedVars`   | ❌                                          | ^                                                                                                                              | Disables [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and `sonarjs/no-unused-vars` rules in favor of `unused-imports/no-unused-vars` |
| `preferArrowFunctions`         | ❌                                          | [eslint-plugin-prefer-arrow-functions](https://npmx.dev/eslint-plugin-prefer-arrow-functions) (`prefer-arrow-functions`)       | Since v0.1.0                                                                                                                                                                                                                              |
| `perfectionist`                | ❌                                          | [eslint-plugin-perfectionist](https://npmx.dev/eslint-plugin-perfectionist) (`perfectionist`)                                  | Since v0.4.0<br>Supports sub-configs for each rule from the plugin since v1.0.0                                                                                                                                                           |
| `perfectionist/sort*`          | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>One sub-config per `sort-*` rule (e.g. `sortObjects`), all off by default. See [Perfectionist](#perfectionist)                                                                                                            |
| `deMorgan`                     | ❌                                          | [eslint-plugin-de-morgan](https://npmx.dev/eslint-plugin-de-morgan) (`de-morgan`)                                              | Since v0.5.0                                                                                                                                                                                                                              |
| `es`                           | ❌                                          | [eslint-plugin-es-x](https://npmx.dev/eslint-plugin-es-x) (`es-x`)                                                             | Since v0.10.0                                                                                                                                                                                                                             |
| `jsInline`                     | ✅                                          | [eslint-plugin-html](https://npmx.dev/eslint-plugin-html) (`html`)                                                             | Since v0.10.0<br>For linting inlined JS in HTML files                                                                                                                                                                                     |
| `math`                         | ✅                                          | [eslint-plugin-math](https://npmx.dev/eslint-plugin-math) (`math`)                                                             | Since v1.0.0                                                                                                                                                                                                                              |
| `erasableSyntaxOnly`           | ❌                                          | [eslint-plugin-erasable-syntax-only](https://npmx.dev/eslint-plugin-erasable-syntax-only) (`erasable-syntax-only`)             | Since v1.0.0                                                                                                                                                                                                                              |
| `noUnnecessaryAbstractions`    | ✅                                          | [eslint-plugin-unnecessary-abstractions](https://npmx.dev/eslint-plugin-unnecessary-abstractions) (`unnecessary-abstractions`) | Since v1.0.0                                                                                                                                                                                                                              |
| `importIntegrity`              | ❌                                          | [import-integrity-lint](https://npmx.dev/import-integrity-lint) (`import-integrity`)                                           | Since v1.0.0<br>Faster `eslint-plugin-import(-x)` semi-alternative                                                                                                                                                                        |
| `moduleInterop`                | ✅                                          | [eslint-plugin-module-interop](https://npmx.dev/eslint-plugin-module-interop) (`module-interop`)                               | Since v1.0.0                                                                                                                                                                                                                              |
| `treeShaking`                  | ❌                                          | [eslint-plugin-tree-shaking](https://npmx.dev/eslint-plugin-tree-shaking) (`tree-shaking`)                                     | Since v1.0.0                                                                                                                                                                                                                              |
| `e18e`                         | ❌                                          | [@e18e/eslint-plugin](https://npmx.dev/@e18e/eslint-plugin)                                                                    | Since v1.0.0                                                                                                                                                                                                                              |
| `e18e/modernization`           | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                           |
| `e18e/moduleReplacements`      | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                           |
| `e18e/performanceImprovements` | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                           |
| `barrelFiles`                  | ❌                                          | [eslint-plugin-barrel-files](https://npmx.dev/eslint-plugin-barrel-files) (`barrel-files`)                                     | Since v1.0.0                                                                                                                                                                                                                              |
| `arrowReturnStyle`             | ✅                                          | [eslint-plugin-arrow-return-style-x](https://npmx.dev/eslint-plugin-arrow-return-style-x) (`arrow-return-style`)               | Since v1.0.0                                                                                                                                                                                                                              |

### Libraries

| Un config name                                                                      | Enabled by default?<br>(optional condition)                            | Primary plugin(s) (`default-prefix`)                                                                                                                | Description/Notes                                                                                   |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `jest`                                                                              | ✅ (`jest` is installed)                                               | [eslint-plugin-jest](https://npmx.dev/eslint-plugin-jest) (`jest`)                                                                                  | Since v0.3.0                                                                                        |
| `jest/jestExtended`                                                                 | ✅ (`jest-extended` is installed)                                      | [eslint-plugin-jest-extended](https://npmx.dev/eslint-plugin-jest-extended) (`jest-extended`)                                                       | -                                                                                                   |
| `jest/typescript`                                                                   | ✅ (`ts` config is enabled)                                            | [eslint-plugin-jest](https://npmx.dev/eslint-plugin-jest) (`jest`)                                                                                  | Only TypeScript-specific rules from `eslint-plugin-jest`                                            |
| `jest/noOnlyTests`                                                                  | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| `vitest`                                                                            | ✅ (`vitest` is installed)                                             | [@vitest/eslint-plugin](https://npmx.dev/@vitest/eslint-plugin) (`vitest`)                                                                          | Since v0.3.0                                                                                        |
| `vitest/noOnlyTests`                                                                | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| `jestDom`                                                                           | ✅ (`@testing-library/jest-dom` is installed)                          | [eslint-plugin-jest-dom](https://npmx.dev/eslint-plugin-jest-dom) (`jest-dom`)                                                                      | Since v1.0.0                                                                                        |
| `ava`                                                                               | ✅ (`ava` is installed)                                                | [eslint-plugin-ava](https://npmx.dev/eslint-plugin-ava) (`ava`)                                                                                     | Since v1.0.0                                                                                        |
| `ava/noOnlyTests`                                                                   | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| `awsCdk`                                                                            | ✅ (`aws-cdk-lib` is installed)                                        | [eslint-plugin-awscdk](https://npmx.dev/eslint-plugin-awscdk) (`awscdk`)                                                                            | Since v1.0.0                                                                                        |
| `qunit`                                                                             | ✅ (`qunit` is installed)                                              | [eslint-plugin-qunit](https://npmx.dev/eslint-plugin-qunit) (`qunit`)                                                                               | Since v1.0.0                                                                                        |
| `qunit/noOnlyTests`                                                                 | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary`                                                 | ✅ (`@testing-library/dom` is installed)                               | [eslint-plugin-testing-library](https://npmx.dev/eslint-plugin-testing-library) (`testing-library`)                                                 | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/angular`                                         | ✅ (`angular` config is enabled)                                       | ^                                                                                                                                                   | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/marko`                                           | ✅ (`marko` is installed)                                              | ^                                                                                                                                                   | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/react`                                           | ✅ (`react` config is enabled)                                         | ^                                                                                                                                                   | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/svelte`                                          | ✅ (`svelte` config is enabled)                                        | ^                                                                                                                                                   | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/vue`                                             | ✅ (`vue` config is enabled)                                           | ^                                                                                                                                                   | Since v1.0.0                                                                                        |
| ![Testing Library] `testingLibrary/*/noOnlyTests`                                   | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| `noOnlyTests`                                                                       | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| ![TanStack] `tanstackQuery`                                                         | ✅ (`@tanstack/query-core` is installed)                               | [@tanstack/eslint-plugin-query](https://npmx.dev/@tanstack/eslint-plugin-query) (`@tanstack/query`)                                                 | Since v1.0.0                                                                                        |
| ![TanStack] `tanstackRouter`                                                        | ✅ (`@tanstack/react-router` or `@tanstack/solid-router` is installed) | [@tanstack/eslint-plugin-router](https://npmx.dev/@tanstack/eslint-plugin-router) (`@tanstack/router`)                                              | Since v1.0.0                                                                                        |
| ![TanStack] `tanstackStart`                                                         | ✅ (`@tanstack/react-start` or `@tanstack/solid-start` is installed)   | [@tanstack/eslint-plugin-start](https://npmx.dev/@tanstack/eslint-plugin-start) (`@tanstack/start`)                                                 | Since v1.0.0                                                                                        |
| ![Storybook](./assets/logos-storybook-icon.svg) `storybook`                         | ✅ (`storybook` is installed)                                          | [eslint-plugin-storybook](https://npmx.dev/eslint-plugin-storybook) (`storybook`)                                                                   | Since v1.0.0                                                                                        |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress`             | ✅ (`cypress` is installed)                                            | [eslint-plugin-cypress](https://npmx.dev/eslint-plugin-cypress) (`cypress`)                                                                         | Since v1.0.0                                                                                        |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress/noOnlyTests` | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| ![Mocha](./assets/devicon-mocha.svg) `mocha`                                        | ✅ (`mocha` is installed)                                              | [eslint-plugin-mocha](https://npmx.dev/eslint-plugin-mocha) (`mocha`)                                                                               | Since v1.0.0                                                                                        |
| ![Mocha](./assets/devicon-mocha.svg) `mocha/noOnlyTests`                            | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| ![Turborepo](./assets/material-icon-theme-turborepo.svg) `turbo`                    | ✅ (`turbo` is installed)                                              | [eslint-plugin-turbo](https://npmx.dev/eslint-plugin-turbo) (`turbo`)                                                                               | Since v1.0.0                                                                                        |
| ![Playwright](./assets/devicon-playwright.svg) `playwright`                         | ✅ (`playwright` is installed)                                         | [eslint-plugin-playwright](https://npmx.dev/eslint-plugin-playwright) (`playwright`)                                                                | Since v1.0.0                                                                                        |
| ![Playwright](./assets/devicon-playwright.svg) `playwright/noOnlyTests`             | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                        |
| ![Lodash](./assets/devicon-plain-lodash.svg) `youDontNeedLodashUnderscore`          | ✅ (`lodash`, `lodash-es` or `lodash.*` is installed)                  | [eslint-plugin-you-dont-need-lodash-underscore](https://npmx.dev/eslint-plugin-you-dont-need-lodash-underscore) (`you-dont-need-lodash-underscore`) | Since v1.0.0                                                                                        |
| ![RxJS](./assets/devicon-rxjs.svg) `rxjs`                                           | ✅ (`rxjs` is installed)                                               | [@smarttools/eslint-plugin-rxjs](https://npmx.dev/@smarttools/eslint-plugin-rxjs) (`rxjs`)                                                          | Since v1.0.0                                                                                        |
| ![Nx](./assets/vscode-icons-file-type-light-nx.svg) `nx`                            | ✅ (`nx` is installed)                                                 | [@nx/eslint-plugin](https://npmx.dev/@nx/eslint-plugin) (`nx`)                                                                                      | Since v1.0.0                                                                                        |
| ![Zod] `importZod`                                                                  | ❌                                                                     | [eslint-plugin-import-zod](https://npmx.dev/eslint-plugin-import-zod) (`import-zod`)                                                                | Enforces namespace imports for `zod`. You should probably use `zod` config instead.<br>Since v1.0.0 |
| ![UnoCSS](./assets/logos-unocss.svg) `unocss`                                       | ✅ (`unocss` is installed)                                             | [@unocss/eslint-plugin](https://npmx.dev/@unocss/eslint-plugin) (`unocss`)                                                                          | Since v1.0.0                                                                                        |
| ![Zod] `zod`                                                                        | ✅ (`zod@^3\|\|^4` is installed)                                       | [eslint-plugin-zod](https://npmx.dev/eslint-plugin-zod) (`zod`)                                                                                     | Since v1.0.0                                                                                        |
| ![Zod] `zod/mini`                                                                   | ✅                                                                     | [eslint-plugin-zod-mini](https://npmx.dev/eslint-plugin-zod-mini) (`zod-mini`)                                                                      | Since v1.0.0<br>Rules for [`zod/mini`](https://zod.dev/packages/mini)                               |
| ![Zod] `zod/core`                                                                   | ✅                                                                     | [eslint-plugin-zod-core](https://npmx.dev/eslint-plugin-zod-core) (`zod-core`)                                                                      | Since v1.0.0<br>Rules for [`zod/v4/core`](https://zod.dev/packages/core)                            |
| ![Zod] `zodOpenapi`                                                                 | ✅ (`zod-openapi` is installed)                                        | [eslint-plugin-zod-openapi](https://npmx.dev/eslint-plugin-zod-openapi) (`zod-openapi`)                                                             | Rules for [`zod-openapi`](https://github.com/samchungy/zod-openapi)                                 |
| ![FormatJS](./assets/logos-formatjs.svg) `formatJs`                                 | ✅ (`@formatjs/icu-messageformat-parser` is installed)                 | [eslint-plugin-formatjs](https://npmx.dev/eslint-plugin-formatjs) (`formatjs`)                                                                      | Since v1.0.0                                                                                        |
| ![Docusaurus](./assets/vscode-icons-file-type-docusaurus.svg) `docusaurus`          | ✅ (`@docusaurus/core` is installed)                                   | [@docusaurus/eslint-plugin](https://npmx.dev/@docusaurus/eslint-plugin) (`docusaurus`)                                                              | Since v1.0.0                                                                                        |
| `drizzle`                                                                           | ✅ (`drizzle-orm` is installed)                                        | [eslint-plugin-drizzle](https://npmx.dev/eslint-plugin-drizzle) (`drizzle`)                                                                         | Since v1.0.0                                                                                        |
| `mobx`                                                                              | ✅ (`mobx` is installed)                                               | [eslint-plugin-mobx](https://npmx.dev/eslint-plugin-mobx) (`mobx`)                                                                                  | Since v1.0.0                                                                                        |
| `remeda`                                                                            | ✅ (`remeda` is installed)                                             | [eslint-plugin-remeda](https://npmx.dev/eslint-plugin-remeda) (`remeda`)                                                                            | Since v1.1.0                                                                                        |
| `clsx`                                                                              | ✅ (`clsx` is installed)                                               | [eslint-plugin-clsx](https://npmx.dev/eslint-plugin-clsx) (`clsx`)                                                                                  | Since v1.0.0                                                                                        |
| `unhead`                                                                            | ✅ (`unhead` is installed)                                             | [@unhead/eslint-plugin](https://npmx.dev/@unhead/eslint-plugin) (`unhead`)                                                                          | Since v1.0.0                                                                                        |

### Miscellaneous

| Un config name                                                  | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                           | Description/Notes                                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `casePolice`                                                    | ❌                                          | [eslint-plugin-case-police](https://npmx.dev/eslint-plugin-case-police) (`case-police`)                                        | Since v0.9.0                                                                                                                             |
| `noPrettierIncompatibleRules`                                   | ✅ (`prettier` package is installed)         | -                                                                                                                              | Since v1.0.0<br>Disables rules unnecessary or conflicting with Prettier. Replaces `eslint-config-prettier`.                      |
| `noStylisticRules`                                              | ❌                                          | -                                                                                                                              | Since v1.0.0<br>Config to disable most of the stylistic rules. Can be useful when integrating eslint-config-un into an existing project. |
| `noRelativeImportPaths`                                         | ❌                                          | [eslint-plugin-no-relative-import-paths](https://npmx.dev/eslint-plugin-no-relative-import-paths) (`no-relative-import-paths`) | Since v1.0.0                                                                                                                      |
| `noUnsanitized`                                                 | ✅                                          | [eslint-plugin-no-unsanitized](https://npmx.dev/eslint-plugin-no-unsanitized) (`no-unsanitized`)                               | Since v1.0.0                                                                                                                             |
| ![CSpell](./assets/vscode-icons-file-type-cspell.svg) `cspell`  | ❌                                          | [@cspell/eslint-plugin](https://npmx.dev/@cspell/eslint-plugin) (`@cspell`)                                                    | Since v1.0.0                                                                                                                             |
| ![ESLint](./assets/devicon-eslint.svg) `eslintPlugin`           | ❌                                          | [eslint-plugin-eslint-plugin](https://npmx.dev/eslint-plugin-eslint-plugin) (`eslint-plugin`)                                  | Since v1.0.0<br>For linting ESLint plugins                                                                                               |
| ![ESLint](./assets/devicon-eslint.svg) `eslintPlugin/ruleTests` | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>Rules for ESLint rule test files                                                                                         |
| `fileProgress`                                                  | ❌                                          | [eslint-plugin-file-progress](https://npmx.dev/eslint-plugin-file-progress) (`file-progress`)                                  | Since v1.0.0<br>An ESlint plugin to print file progress                                                                                  |
| `compat`                                                        | ❌                                          | [eslint-plugin-compat](https://npmx.dev/eslint-plugin-compat) (`compat`)                                                       | Since v1.0.0                                                                                                                             |
| `webComponents`                                                 | ❌                                          | [eslint-plugin-wc](https://npmx.dev/eslint-plugin-wc) (`wc`)                                                                   | Since v1.0.0                                                                                                                             |
| `header`                                                        | ❌                                          | [eslint-plugin-header](https://npmx.dev/eslint-plugin-header) (`header`)                                                       | Since v1.0.0                                                                                                                             |
| `headers`                                                       | ❌                                          | [eslint-plugin-headers](https://npmx.dev/eslint-plugin-headers) (`headers`)                                                    | Since v1.0.0                                                                                                                             |
| `checkFile`                                                     | ❌                                          | [eslint-plugin-check-file](https://npmx.dev/eslint-plugin-check-file) (`check-file`)                                           | Since v1.0.0                                                                                                                             |
| `checkFile/enableCheckFileProcessor`                            | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>Applies the `check-file` processor to the specified files                                                                |
| `boundaries`                                                    | ❌                                          | [eslint-plugin-boundaries](https://npmx.dev/eslint-plugin-boundaries) (`boundaries`)                                           | Since v1.0.0                                                                                                                             |
| `noSecrets`                                                     | ✅                                          | [eslint-plugin-no-secrets](https://npmx.dev/eslint-plugin-no-secrets) (`no-secrets`)                                           | Since v1.0.0                                                                                                                             |
| `noSecrets/json`                                                | ✅                                          | ^                                                                                                                              | Applied only to `.json` files by default                                                                                                 |
| `expectType`                                                    | ❌                                          | [eslint-plugin-expect-type](https://npmx.dev/eslint-plugin-expect-type) (`expect-type`)                                        | Since v1.0.0                                                                                                                             |
| `command`                                                       | ❌                                          | [eslint-plugin-command](https://npmx.dev/eslint-plugin-command) (`command`)                                                    | Since v1.0.0                                                                                                                             |
| `antfu`                                                         | ❌                                          | [eslint-plugin-antfu](https://npmx.dev/eslint-plugin-antfu) (`antfu`)                                                          | Since v1.0.0<br>[Anthony Fu](https://antfu.me)'s personal collection of rules.                                                           |
| `sql`                                                           | ❌                                          | [eslint-plugin-sql](https://npmx.dev/eslint-plugin-sql) (`sql`)                                                                | Since v1.0.0                                                                                                                             |
| `format`                                                        | ❌                                          | [eslint-plugin-format](https://npmx.dev/eslint-plugin-format) (`format`)                                                       | Since v1.0.0<br>📚 Supports multiple configs                                                                                             |
| `lockfile`                                                      | ❌                                          | [eslint-plugin-lockfile](https://npmx.dev/eslint-plugin-lockfile) (`lockfile`)                                                 | Since v1.0.0                                                                                                                             |
| ![GitHub](./assets/devicon-github.svg) `githubActions`          | ✅ (`.github/workflows` directory exists)   | [eslint-plugin-github-action](https://npmx.dev/eslint-plugin-github-action) (`github-actions`)                                 | Since v1.0.0                                                                                                                             |
| `functional`                                                    | ❌                                          | [eslint-plugin-functional](https://npmx.dev/eslint-plugin-functional) (`functional`)                                           | Since v1.0.0<br>Rules enforcing functional programming patterns                                                                          |

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
  configs: {/* ... */},

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

| Plugin                                                                                                                | Suggested prefix                    | Our prefix           | Reason                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| [`typescript-eslint`](https://npmx.dev/typescript-eslint)                                                             | `@typescript-eslint`                | `ts`                 | More concise and convenient to use; `@` feels redundant                                                             |
| [`@eslint-community/eslint-plugin-eslint-comments`](https://npmx.dev/@eslint-community/eslint-plugin-eslint-comments) | `@eslint-community/eslint-comments` | `eslint-comments`    | Similar reason ^                                                                                                    |
| [`@docusaurus/eslint-plugin`](https://npmx.dev/@docusaurus/eslint-plugin)                                             | `@docusaurus`                       | `docusaurus`         | Similar reason ^                                                                                                    |
| [`@angular-eslint/eslint-plugin`](https://npmx.dev/@angular-eslint/eslint-plugin)                                     | `@angular-eslint`                   | `angular`            | Similar reason ^                                                                                                    |
| [`@angular-eslint/eslint-plugin-template`](https://npmx.dev/@angular-eslint/eslint-plugin-template)                   | `@angular-eslint/template`          | `angular-template`   | Similar reason ^                                                                                                    |
| [`@cspell/eslint-plugin`](https://npmx.dev/@cspell/eslint-plugin)                                                     | `@cspell`                           | `cspell`             | Similar reason ^                                                                                                    |
| [`@eslint-react/eslint-plugin`][@eslint-react/eslint-plugin]                                                          | `@eslint-react`                     | `eslint-react`       | Similar reason ^; can't be `react` — already taken by `eslint-plugin-react`                                         |
| [`@html-eslint/eslint-plugin`](https://npmx.dev/@html-eslint/eslint-plugin)                                           | `@html-eslint`                      | `html`               | Similar reason ^                                                                                                    |
| [`@ngrx/eslint-plugin`](https://npmx.dev/@ngrx/eslint-plugin)                                                         | `@ngrx`                             | `ngrx`               | Similar reason ^                                                                                                    |
| [`@stylistic/eslint-plugin`](https://npmx.dev/@stylistic/eslint-plugin)                                               | `@stylistic`                        | `stylistic`          | Similar reason ^                                                                                                    |
| [`@tanstack/eslint-plugin-query`](https://npmx.dev/@tanstack/eslint-plugin-query)                                     | `@tanstack/query`                   | `tanstack-query`     | Similar reason ^                                                                                                    |
| [`@tanstack/eslint-plugin-router`](https://npmx.dev/@tanstack/eslint-plugin-router)                                   | `@tanstack/router`                  | `tanstack-router`    | Similar reason ^                                                                                                    |
| [`@tanstack/eslint-plugin-start`](https://npmx.dev/@tanstack/eslint-plugin-start)                                     | `@tanstack/start`                   | `tanstack-start`     | Similar reason ^                                                                                                    |
| [`@unhead/eslint-plugin`](https://npmx.dev/@unhead/eslint-plugin)                                                     | `@unhead`                           | `unhead`             | Similar reason ^                                                                                                    |
| [`@unocss/eslint-plugin`](https://npmx.dev/@unocss/eslint-plugin)                                                     | `@unocss`                           | `unocss`             | Similar reason ^                                                                                                    |
| [`@intlify/eslint-plugin-vue-i18n`](https://npmx.dev/@intlify/eslint-plugin-vue-i18n)                                 | `@intlify/vue-i18n`                 | `vue-i18n`           | Similar reason ^                                                                                                    |
| [`eslint-plugin-import-x`]                                                                                            | `import-x`                          | `import`             | This plugin is a fork and is meant to replace the original plugin with `import` prefix                              |
| [`eslint-plugin-arrow-return-style-x`](https://npmx.dev/eslint-plugin-arrow-return-style-x)                           | `arrow-return-style-x`              | `arrow-return-style` | Similar reason ^                                                                                                    |
| [`eslint-plugin-jsx-a11y-x`](https://npmx.dev/eslint-plugin-jsx-a11y-x)                                               | `jsx-a11y-x`                        | `jsx-a11y`           | Similar reason ^                                                                                                    |
| [`eslint-plugin-n`](https://npmx.dev/eslint-plugin-n)                                                                 | `n`                                 | `node`               | Similar reason ^                                                                                                    |
| [`@next/eslint-plugin-next`](https://npmx.dev/@next/eslint-plugin-next)                                               | `@next/next`                        | `nextjs`             | `@next/next` is redundant; consistent with the framework name                                                       |
| [`@darraghor/eslint-plugin-nestjs-typed`](https://npmx.dev/@darraghor/eslint-plugin-nestjs-typed)                     | `@darraghor/nestjs-typed`           | `nestjs`             | Similar reason ^                                                                                                    |
| [`eslint-plugin-css`](https://npmx.dev/eslint-plugin-css)                                                             | `css`                               | `css-in-js`          | Conflicts with [`@eslint/css`](https://npmx.dev/@eslint/css) and our name better captures the essence of the plugin |
| [`eslint-plugin-github-action`](https://npmx.dev/eslint-plugin-github-action)                                         | `github-action`                     | `github-actions`     | Consistent with the platform name (also `-github-actions` plugin seems to not be maintained)                        |
| [`eslint-plugin-yml`](https://npmx.dev/eslint-plugin-yml)                                                             | `yml`                               | `yaml`               | Consistent with the official language name (also `-yaml` plugin is much less popular)                               |
| [`eslint-plugin-html`](https://npmx.dev/eslint-plugin-html)                                                           | `html`                              | `html-processor`     | Frees up `html` for `@html-eslint`; this plugin only provides a processor (it has no rules)                         |

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
This is just a heads-up; you should make your own decision whether to keep them enabled.
Use `configTypeAware` to control to which files such rules will be applied to, if any.

### Frontend frameworks

We detect the version of the used frontend framework (Angular, Vue, Svelte, etc.) and apply the appropriate rules depending on the version.
You can always manually specify the version using an appropriate option.
Consult JSDoc of each config for more details.

#### Vue

By default, TypeScript rules will be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to `true` in vue's config options, which in turn is *automatically* set to `true` if `ts` config is enabled.
If you have `.vue` files authored in both TypeScript and JavaScript, use `enforceTypescriptInScriptSection.{files,ignores}` to manually specify TS & JS Vue components respectively.
It is not currently possible to apply different ESLint rules depending on the value of `lang` attribute of `<script>` SFC section.

#### Angular

We support Angular versions from 13 to 20, all at once.
You are expected to install `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` packages of the same major version as your Angular version, but installing a higher version would also likely work, letting you use rules introduced in newer versions of `@angular-eslint/eslint-plugin*` on older Angular codebases.

#### React

We use rules from several plugins to lint your React code.
You will be able to choose whether you would like to use only `@eslint-react/eslint-plugin` or `eslint-plugin-react`, or both, which is the default.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### Markdown/MDX

If `markdown`/`mdx` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files.
This works because under the hood [`@eslint/markdown`](https://npmx.dev/@eslint/markdown)/[`eslint-mdx`](https://npmx.dev/eslint-mdx) will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports).
You can find the full list of disabled rules in `src/configs/markdown.ts` file.
You have the full control over which rules are disabled/enabled via [`markdownCodeBlocksRules`](#markdowncodeblocksrules) option.

### Tailwind CSS

There exists two plugins working with Tailwind:

| Package name                                                                            | Default plugin prefix | Supported Tailwind versions (declared in `peerDependencies`) |
| --------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| [`eslint-plugin-better-tailwindcss`](https://npmx.dev/eslint-plugin-better-tailwindcss) | `better-tailwindcss`  | `^3.3.0 \|\| ^4.1.6`                                         |
| [`eslint-plugin-tailwindcss`](https://npmx.dev/eslint-plugin-tailwindcss)               | `tailwindcss`         | `^3.4.0`                                                     |

We highly recommend using the former because it supports Tailwind v4 and as of time of writing it is better maintained and more actively updated.
In addition, if you don't like the verbosity of the default prefix, you can use [`pluginRenames` option](#pluginrenames) to rename it to simply `tailwindcss` or `tailwind`.

### Perfectionist

In the `perfectionist` config, even if it's enabled, all rules and Sub-Configs (there is a Sub-Config corresponding to each rule) are turned *off* by default.
If you want all rules to be on by default, you can manually set every single Sub-Config to `true`, or use the following shorthand — just set this in the `perfectionist` config:

<!-- eslint-skip -->

```ts
perfectionist: {
  forceSeverity: 'error',
},
```

### Disabling rules incompatible with Prettier

The `noPrettierIncompatibleRules` config (enabled by default when `prettier` is installed) disables rules that are unnecessary or might conflict with [Prettier](https://prettier.io).
It replaces the previously used [`eslint-config-prettier`](https://npmx.dev/eslint-config-prettier): the rule list is inlined, audited against the current state of Prettier, and [plugin prefix renames] are respected.

Rules are grouped by the language Prettier formats. 
Groups for languages Prettier can only format via an extra plugin are applied **only if that plugin is installed**:

| Group    | Applied when                          |
| -------- | ------------------------------------- |
| `svelte` | `prettier-plugin-svelte` is installed |
| `astro`  | `prettier-plugin-astro` is installed  |
| `toml`   | `prettier-plugin-toml` is installed   |

All other groups (`js`, `vue`, `json`, `yaml`, `markdown`, `html`) are always applied.
You can force any group on or off via the `languages` option.

<!-- eslint-skip -->

```ts
noPrettierIncompatibleRules: {
  languages: {toml: true, markdown: false},
  overrides: {
    'stylistic/indent': 'error', // keep this rule enabled despite Prettier
    curly: 'off', // disable one of the rules kept enabled by default
  },
  overridesAny: {'some-plugin/some-rule': 'off'},
},
```

## Root options

### `configs`

### `extraConfigs`

**Type**: `Record<string, boolean | object | [object, ...object][]>`

See [Rules configuration](#rules-configuration-configs-and-extraconfigs-option).

### `files`

**Type**: `(string | string[])[]`

Specifies a list of global `files` patterns.
When non-empty, a dedicated flat config entry is created with only these `files` (no rules or other keys except for `name`), which tells ESLint that the matched files are meant to be linted.
This is useful to prevent the `File ignored because no matching configuration was supplied` error for files with extensions that none of the enabled configs target.

### `ignores`

**Type**: `string[] | {files: string[]; override?: boolean}`

Specifies a list of globally ignored files.
By default will be merged with our ignore patterns (also exported as [`DEFAULT_GLOBAL_IGNORES`](#default_global_ignores)), unless the object notation is used and the `override` property is set to `true`.

### `extraPlugins`

**Type**: `Record<string, MaybeFn<MaybePromise<EslintPlugin>>>`

Allows to provide additional ESLint plugins.
Their prefixes and possibly rule names will appear in configs' `rules` property type.
They, like all the built-in plugins, by default will be loaded only if used.

Note that their prefixes must not match the built-it/known ones (like `ts` or `unicorn`) or even prefixes you've set via [`pluginRenames`](#pluginrenames).

### `linterOptions{NoInlineConfig,ReportUnusedDisableDirectives,ReportUnusedInlineConfigs}`

**Type**:

```ts
interface RootOptions {
  linterOptionsNoInlineConfig?: ValueOrEslintConfigWithValue<boolean>;
  linterOptionsReportUnusedDisableDirectives?: ValueOrEslintConfigWithValue<EslintSeverity>;
  linterOptionsReportUnusedInlineConfigs?: ValueOrEslintConfigWithValue<EslintSeverity>;
}

type ValueOrEslintConfigWithValue<T> =
  | T
  | MaybeArray<{
      ignores?: string[] | undefined;
      files?: string[] | undefined;
      value?: T | undefined;
    }>;
```

Sets [`linterOptions.{noInlineConfig,reportUnusedDisableDirectives,reportUnusedInlineConfigs}`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=linterOptions) globally or more granularly.

### `defaultConfigsStatus`

**Type**: `'all-disabled' | 'misc-enabled'`

Quickly enable/disable multiple configs at once.
Possible options:

- `all-disabled`: consider all top level configs disabled unless explicitly enabled.
- `misc-enabled`: consider some configs disabled by default (see the list in JSDoc).

### `mode`

**Type**: `'app' | 'lib'`

Type of your project, either application (`app`, default) or library (`lib`).
Will affect certain rules, actual list of which is written in JSDoc of this option.

### `forceSeverity`

**Type**: `Exclude<EslintSeverity, 0 | 'off'>`

Globally forces non-zero severity of all the rules configured by eslint-config-un (i.e. not within `overrides`, `overridesAny` or [`extraConfigs`](#extraconfigs)).
This can also be configured per-config.

### `noWarnings`

**Type**: `boolean`

"Zero warnings tolerance" mode.
Disabled by default.
When enabled:

- the `warning` (`1`/`'warn'`) severity becomes **unexpressible at the type level** across all severity-typed options: [`forceSeverity`](#forceseverity) (both root and per-config), `overrides`/`overridesAny`, `extraConfigs` rules and the `linterOptions*` options.
  Trying to use it results in a type error;
- every `warning` severity eslint-config-un would otherwise set by default is **rewritten to `error` at runtime**, including the implicit [`linterOptions.reportUnusedDisableDirectives`](#linteroptionsnoinlineconfigreportunuseddisabledirectivesreportunusedinlineconfigs) default (which ESLint sets to `'warn'`).

### `pluginRenames`

**Type**: `Partial<Record<Exclude<PluginPrefix, ''>, string>>`

See [Plugin prefixes][plugin prefix renames].

### `pluginOverrides`

**Type**: `Partial<Record<Exclude<PluginPrefix, ''>, EslintPlugin>>`

Override implementation of some of the plugins.
This can be useful when this config is used to lint a repository of one of the built-in plugins to provide development version of that plugin.

### `loadPluginsOnDemand`

**Type**: `boolean | {alwaysLoad: LoadablePluginPrefix[]}`

This option controls whether ESLint plugins will be loaded if they are actually used (`true` by default).

Using object notation, you can also specify concrete plugins that will be loaded.
This can be useful if you enable certain plugin rules only be using [configuration comments](https://eslint.org/docs/latest/use/configure/rules#use-configuration-comments).

### `autofixDisabledGloballyFor`

**Type**: `boolean | {plugins?: Partial<Record<PluginPrefix, boolean>>; rules?: Partial<Record<FixableRuleNames, boolean>>}`

See [Globally disabling rule autofix](#globally-disabling-rule-autofix).

### `markdownCodeBlocksRules`

**Type**: `object` (see properties below)

eslint-config-un disables a number of rules in all embedded code blocks (AKA "fenced code blocks") inside Markdown and MDX files.
This option gives you more control over which rules are disabled/enabled.

#### `markdownCodeBlocksRules.additionalDisabledRules`

**Type**: `Partial<Record<Exclude<UnExtraPluginsRules<ExtraPlugins> | UnAllRuleNames, RulesDisabledInEmbeddedCodeBlocksByDefault>, boolean>>`

Allows to specify more rules to disable in embedded code blocks.

#### `markdownCodeBlocksRules.doNotDisable`

**Type**: `Partial<Record<RulesDisabledInEmbeddedCodeBlocksByDefault, boolean>>`

Allows to specify which rules should not be disabled by default in embedded code blocks.

### `useImportIntegrity`

**Type**: `boolean | {pluginSettings?: Partial<ImportIntegrityPluginSettings>; replaceRules?: Partial<Record<ImportPluginReplaceableRules, boolean>>}`

Allows to override certain [`eslint-plugin-import-x`] plugin rules with implementations from [`import-integrity-lint`](https://npmx.dev/import-integrity-lint).

### `typeInfoRules`

**Type**: `'standalone' | 'splitOnly' | 'asIs' | 'disabled' | { mode?, ignores?: string[] } & ({ allowDefaultProject?: string[] } | { parserOptions? })`

Controls how rules that are known *to us* to require type information are handled.
By default, every such rule is *automatically **moved*** into a separate ESLint config restricted to TypeScript files, where the `typescript-eslint` parser is set up for typed linting.

The mode (string value or the `mode` property) chooses the strategy:

- `standalone`: the split happens and the parser, including [`projectService`](https://typescript-eslint.io/packages/parser/#projectservice), is configured in the generated config.
  The default when the `ts/setupTypeAware` config is **disabled**.
- `splitOnly`: the split happens, but no parser is configured — the project service is expected to be set up by the `ts/setupTypeAware` config.
  The default when that config is **enabled** (the most common case).
- `asIs`: no split happens; rules are left untouched in their original configs.
  You are responsible for making type information available to them.
- `disabled`: no split happens, and every rule that *throws* without type information is turned off everywhere.
  Rules that merely degrade without type information stay enabled.

> [!NOTE]
> The following configs are never split, so for them every mode except `disabled` behaves like `asIs`:
>
> - `ts/type-aware/*`, `vitest/ts` and `jest/ts` — they set up type-aware linting themselves;
> - `unicorn/css` — the split would restrict it to `**/*.ts` files, which are not the files it exists for.

The object notation additionally accepts:

- `ignores`: glob patterns excluded from type-aware linting, appended to the `ignores` of every generated config and of the never-split configs above.
  Useful for TypeScript files that are not part of any `tsconfig.json`.
- `allowDefaultProject` / `parserOptions` (cannot have both at the same time): the default parser options for the type-aware linting we set up — the `standalone` split configs and, as a default, the `ts` type-aware config.
  `allowDefaultProject` is a shortcut for `parserOptions.projectService.allowDefaultProject`.
  These mirror the same-named `ts` config options, which take precedence over them for the `ts` type-aware config (`allowDefaultProject` > `parserOptions` > global).

  > [!NOTE]
  > These options only take effect where a type-aware parser is actually set up: the `standalone` split configs (so only when the resolved `mode` is `standalone`), and the `ts` type-aware config's parser whenever that config is enabled (independently of `mode`).
  > So in `asIs`/`disabled` modes they only matter if the `ts` type-aware config is enabled — and in `disabled` that combination is contradictory (it both turns off throwing rules and configures type information).

For more details, read the corresponding JSDoc.

### `packageAliases`

**Type**: `Partial<Record<(typeof PACKAGES_TO_GET_INFO_FOR)[number], string>>`

eslint-config-un checks the presence and versions of certain packages (like `vue`, `typescript` or `prettier`; the full list is in the `PACKAGES_TO_GET_INFO_FOR` constant in `src/constants.ts`) to decide whether certain configs, sub-configs or rules should be enabled by default.

By default, the packages are looked up by their canonical npm names.
If you install some of them under a different name using [npm aliases](https://docs.npmjs.com/cli/v11/using-npm/package-spec#aliases), for example `"vue3": "npm:vue@^3.5.0"`, use this option to specify the names to look for instead of the canonical ones.
Keys are the canonical package names, values are the names the packages are actually installed under.

> [!NOTE]
> This option is not applicable to ESLint plugins: they are loaded by their canonical names.
> Use [`pluginOverrides`](#pluginoverrides) to provide a plugin installed under an alias.

### `gitignore`

**Type**: `boolean | EslintConfigFlatGitignoreOptions`

By default, files from `.gitignore` (read from [the current working directory](https://nodejs.org/api/process.html#processcwd)) will be automatically added to the global [`ignores`](#ignores) list.
Set this option to `false` to disable this behavior.
You may also provide an object which configures [eslint-config-flat-gitignore](https://npmx.dev/eslint-config-flat-gitignore), which actually provides this functionality.

### `offlineMode`

**Type**: `boolean`

Enables "Offline mode" which can be useful to (temporarily) disable rules performing network requests, such as [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html).

It can also be enabled by setting `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable to non-empty string, but the explicitly passed value takes precedence.

### `cacheConfigs`

**Type**: `boolean`

Enables flat config caching.
This option is enabled by default when running in editor (detected by [`is-in-editor`](https://npmx.dev/is-in-editor)).
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

## Environment variables

All environment variables affecting eslint-config-un behavior start with `ESLINT_CONFIG_UN_`.
Boolean values are transformed via `Boolean` constructor, meaning that if the value is `'0'`, it will be treated as `true`.

### `ESLINT_CONFIG_UN_CACHE_CONFIGS`

See [`cacheConfigs` option](#cacheconfigs).

### `ESLINT_CONFIG_UN_DISABLE_WARNINGS`

Do not print any warnings to the console.

### `ESLINT_CONFIG_UN_OFFLINE_MODE`

See [`offlineMode` option](#offlinemode).

## Other exports

### Main entrypoint

#### `globals`

Re-exported default export from [`globals` package](https://npmx.dev/globals), which is a direct dependency of eslint-config-un.

#### `isInCi`

The constant showing if the current process is *likely* running in CI.
Info provided by [`ci-info` package](https://npmx.dev/ci-info).

Use case: disable or enable certain rules or features in CI.
Use with caution!

#### `isInEditor`

The constant showing if the current process is *likely* running within editor.
Info provided by [`is-in-editor` package](https://npmx.dev/is-in-editor).

Use case: disable or enable certain rules or features in editor, likely to improve performance.

> [!WARNING]
> Use this sparingly, as disabling certain rules only in the editor might cause false positive reports on unused directives, which are subject to removal with autofix.
> We recommend also setting [`linterOptions.reportUnusedDisableDirectives`](https://eslint.org/docs/latest/use/configure/configuration-files#:~:text=reportUnusedDisableDirectives) to `!isInEditor()` for files affected by this option.

#### `DEFAULT_GLOBAL_IGNORES`

Default list of global `ignores` values set by eslint-config-un.
See also [`ignores` option](#ignores)

#### `RuleOptions`

All built-in plugins' options type generated by [`eslint-typegen` package](https://npmx.dev/eslint-typegen).

### `snippets` entrypoint

#### Rule options generators

Some useful rule options snippet generators are provided which can be tedious to write manually:

- `forbidImportingFromUtilityLibraries` for [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports)
- `forbid$slotsInsideVueTemplates` for [`vue/no-restricted-syntax`](https://eslint.vuejs.org/rules/no-restricted-syntax.html)

Please refer to JSDoc of exported symbols for proper documentation.

#### `createNoRestricted*Rule`

Utility functions re-exported from [`eslint-no-restricted` package](https://npmx.dev/eslint-no-restricted) which generate `no-restricted-*` rules.
Please refer to [the package documentation](https://github.com/bradzacher/eslint-no-restricted/blob/HEAD/README.md) for more info.

### `globs` entrypoint

Exports various globs that can be useful for specifying `files` or `ignores` ESLint config options.

## FAQ

### How do I add my own flat configs?

Use `extraConfigs` option.
The configs provided there will be placed after all the eslint-config-un's configs, and before the config which disables Prettier incompatible rules for all files.
These configs have a richer `rules` option, which allows you to apply more settings like `overrides` option does.

Alternatively, you can `await` the `eslintConfig()` function and then add your own flat configs to whatever place you like (we recommend use [flat config composer from `eslint-flat-config-utils` package](https://npmx.dev/eslint-flat-config-utils)) for this purpose.

### Do I have to install any of the used plugins?

Many plugins are direct dependencies of this package, but the rest (the majority) are optional peer dependencies which means you're responsible for making sure they're installed. eslint-config-un will refuse to work if a plugin is used but not installed.
Please run ESLint with our config once to get the list of dependencies to be installed manually.

### How do I know how eslint-config-un configures rules?

It's too much to document, so please have a look at the source code of our config.
All the configs are placed inside `src/configs` directory.

### How does exactly eslint-config-un knows if some package is installed?

We use [`import-meta-resolve`](https://npmx.dev/import-meta-resolve) package to detect if the package is installed and resolve the path to its' `package.json`.

> [!WARNING]
> This tool replicates the Node.JS resolution algorithm, so there might be false positives
> on package detection if your dependencies are installed in such a way that non-direct dependencies
> can be resolved.
>
> If this is the case, at least 2 additional packages will be considered detected as installed
> regardless of whether they are actually installed in the root of your project, because they are
> sub-dependencies of eslint-config-un's direct dependencies:
>
> - `typescript` (enables `ts` config and friends);
> - `prettier` (causes Prettier-incompatible rules to be disabled).

### How can I know which configs will be enabled, for which rules autofix will be disabled, etc.?

You can enable the debug mode by setting `DEBUG=eslint-config-un` environment variable when running ESLint command.
We use [`obug` package](https://npmx.dev/obug) ([`debug`](https://npmx.dev/debug) alternative with compatible API) to print debug messages, so please refer to its documentation for more info.

Alternatively, you can use [`@eslint/config-inspector`](https://npmx.dev/@eslint/config-inspector) to inspect the final config.

## Migrating existing codebase to eslint-config-un

### Prerequisites

Node.JS and ESLint satisfy [minimum required versions](#installation).
Please don't attempt to migrate to ESLint 10 and eslint-config-un at the same time.

### Migration guide

We recommend that every step and sub-step below is done in a separate commit and on a separate git branch.
If necessary, any step should be additionally split into multiple commits.
Before committing, please do also run tests, formatter, other linters and tools to ensure that nothing became broken, if you have any.

1. Dependencies:
   1. Remove **ALL** ESLint related *dev* dependencies - be it plugins, parsers, whatever else or `eslint` itself.
      This ensures correct versions of plugins will be resolved by eslint-config-un and saves you from other weird and hard to debug problems.
   2. Install `eslint-config-un` following [the installation instructions](#installation).
2. If you're using `.js` config file, we highly recommend that you migrate to `.ts` one, or at least add `@ts-check` TypeScript directive to the former.
   Please don't forget to install [`jiti`](https://npmx.dev/jiti) for ESLint to be able to read your TypeScript config file.
3. Following your intuition and/or configs' options JSDoc documentation, migrate the existing config to the closest eslint-config-un equivalent.
   1. Run ESLint for the first time (without `--fix`!).
      The list of dependencies to be installed might be shown to you.
      Please review whether those plugins are actually used/needed and act accordingly: install necessary plugins and disable configs which require packages you do not wish to install.
   2. Rename rules on existing [`eslint` configuration comments](https://eslint.org/docs/latest/use/configure/rules#use-configuration-comments) if they have different plugin prefixes (the most common case is that `typescript-eslint` plugin has `ts` prefix in eslint-config-un instead of `@typescript-eslint`) **OR** change prefixes using [`pluginRenames` option][plugin prefix renames].
      Look for `Definition for rule '<rule name>' was not found` comments
4. Perform the following two steps in any order:
   1. Enable stylistic rules only and fix them automatically (if you wish to do so) by running ESLint with `--fix --fix-type problem,suggestion,layout` (the latter flag ensures auto removal of "unused" `eslint-disable` comments will not happen):

      <!-- eslint-skip -->

      ```ts
      // ...
      configs: {
        // ...
        noStylisticRules: {
          enableRules: {
            rules: true,
            disableAllOtherRules: true,
          },
        },
        // ...
      },
      // ...
      ```

      **Note:** not every stylistic rule is auto-fixable and not all auto-fixes are safe to apply automatically (although we already maintain a list of rules for which we've disabled autofixes by default for these reasons).

      Please carefully review automatically applied fixes and do not forget about problems requiring manual intervention.
      It might be worth to fix stylistic issues in two stages: auto and manually fixable problems.
   2. Now set `configs.noStylisticRules` to `true` to disable purely stylistic rules and run ESLint for the first time with the new config.
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

### I'm getting `The inferred type of 'default' cannot be named without a reference to './node_modules/eslint-config-un/dist/eslint.mjs'. This is likely not portable. A type annotation is necessary` kind of error when exporting the value returned by `eslintConfig()` in ESLint config file

This error means this file is compiled by TypeScript with [`declaration: true` flag](https://www.typescriptlang.org/tsconfig/#declaration), but some file required to infer the type of the returned value cannot be accessed by the compiler.

Possible fixes are:

#### Do not set `declaration: true` for ESLint config file

ESLint config file might be included in the TypeScript project by mistake.
But it could also be included in a [`composite`](https://www.typescriptlang.org/tsconfig/#composite) config file, which implies `declaration: true`.
In that case, you need a different fix, unless it's possible to exclude the config file from the composite config.

#### Wrap the returned value in `defineConfig` from `eslint/config`

Example:

```ts
import {defineConfig} from 'eslint/config';
import {eslintConfig} from 'eslint-config-un';

export default defineConfig(await eslintConfig(/* ... */));
```

#### Mark the export with `@internal` JSDoc annotation and set `stripInternal: true` in tsconfig

This is mostly self-explanatory.
For more info, [refer to the TypeScript docs](https://www.typescriptlang.org/tsconfig/#stripInternal).

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace

Install `globals` package as a dev dependency.

### Some dependencies are [bundled with `bundleDependencies` feature](https://docs.npmjs.com/cli/v11/configuring-npm/package-json#bundledependencies)

If you would like not to wait until the dependencies of `eslint-config-un` are updated or by whatever other reason you need to install a different version of a dependency, you can do that using your package manager's settings for all but the following packages:

| Package name                                                                          | Reason                                                                           |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| [`eslint-plugin-no-type-assertion`](https://npmx.dev/eslint-plugin-no-type-assertion) | Has outdated requirements of peer dependencies                                   |
| [`eslint-plugin-prettier`](https://npmx.dev/eslint-plugin-prettier)                   | Patched by us to enable formatting of "fenced code blocks" inside Markdown files |

## Versioning policy

`eslint-config-un` wraps 100+ ESLint plugins and updates them continuously.
To keep major version bumps meaningful and rare, we follow standard SemVer with the following clarifications specific to this package.

**Breaking changes (major bump):**

- Incompatible changes to `EslintConfigUnOptions` — removing/renaming an option, narrowing its type, changing its default value, or adding a required option
- Removing or renaming a named export or entry point (`.`, `./snippets`, `./globs`)
- Changing the default prefix of any built-in plugin (e.g. `yml` → `yaml`)
- Raising the minimum ESLint or Node.js version
- A config that was enabled by default becoming disabled by default
- A plugin moving from a direct dependency to an optional peer dependency
- Removing/renaming a `plugin-un` rule, or incompatibly changing its default options or schema

**Not breaking:**

- Changes in lint output (more or fewer errors/warnings) — because `eslint-config-un` continuously updates 100+ plugins and many are optional peer dependencies whose installed version is controlled by the user, lint output is not a stable contract
- Third-party plugin updates (rule additions, removals, schema changes, etc.) absorbed in the same release
- Changes to the generated ESLint flat config shape (entry names, rule/config order) — these are internal details
- Additive API changes: widening a type, new optional options, new named exports, new `plugin-un` rules
- Changes to the `RuleOptions` exported type — it is best-effort/informational and not a stable contract

Major versions are released as accumulated breaking changes warrant — there is no fixed cadence.
Non-breaking improvements ship continuously as minor and patch releases on the current stable major.

## Contributors

<!-- eslint-disable markdown-preferences/padding-line-between-blocks, markdown/require-alt-text -->
<!-- cspell:disable -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/andreww2012"><img src="https://avatars.githubusercontent.com/u/6554045?v=4?s=70" width="70px;" alt="Andrew Kazakov"/><br /><sub><b>Andrew Kazakov</b></sub></a><br /><a href="https://github.com/andreww2012/eslint-config-un/commits?author=andreww2012" title="Code">💻</a> <a href="https://github.com/andreww2012/eslint-config-un/commits?author=andreww2012" title="Documentation">📖</a> <a href="#example-andreww2012" title="Examples">💡</a> <a href="#ideas-andreww2012" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/andreww2012/eslint-config-un/issues?q=author%3Aandreww2012" title="Bug reports">🐛</a> <a href="#infra-andreww2012" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-andreww2012" title="Maintenance">🚧</a> <a href="#tool-andreww2012" title="Tools">🔧</a> <a href="https://github.com/andreww2012/eslint-config-un/commits?author=andreww2012" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td align="center" size="13px" colspan="7">
        <img src="https://raw.githubusercontent.com/all-contributors/all-contributors-cli/1b8533af435da9854653492b1327a23a4dbd0a10/assets/logo-small.svg">
          <a href="https://all-contributors.js.org/docs/en/bot/usage">Add your contributions</a>
        </img>
      </td>
    </tr>
  </tfoot>
</table>

[plugin prefix renames]: #plugin-prefixes-pluginrenames-option

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- eslint-enable markdown-preferences/padding-line-between-blocks, markdown/require-alt-text -->

<!-- cspell:enable -->

[TanStack]: ./assets/tanstack.png
[Astro]: ./assets/devicon-astro.svg
[@eslint-react/eslint-plugin]: https://npmx.dev/@eslint-react/eslint-plugin
[Angular]: ./assets/devicon-angular.svg
[CSS]: ./assets/devicon-css3.svg
[Ember]: ./assets/devicon-ember.svg
[Markdown]: ./assets/mdi-language-markdown.svg
[ReactJS]: ./assets/devicon-react.svg
[TailwindCSS]: ./assets/devicon-tailwindcss.svg
[Testing Library]: ./assets/logos-testing-library.svg
[TypeScript]: ./assets/devicon-typescript.svg
[VueJS]: ./assets/devicon-vuejs.svg
[`eslint-plugin-import-x`]: https://npmx.dev/eslint-plugin-import-x
[eslint-plugin-import-x]: https://npmx.dev/eslint-plugin-import-x
[eslint-plugin-no-only-tests]: https://npmx.dev/eslint-plugin-no-only-tests
[npm]: ./assets/devicon-npm.svg
[pnpm]: ./assets/devicon-pnpm.svg
[Zod]: ./assets/logos-zod.svg
