<p align="center">
  <img src="./assets/eslint-config-un.svg" width="110px" alt="eslint-config-un logo" />
</p>

# eslint-config-un [![npm](https://img.shields.io/npm/v/eslint-config-un)](https://npmx.dev/eslint-config-un)

An ESLint config that supports 100+ plugins.
Every rule of every supported plugin already has a severity, and many of them have options set too.
You can change any of that without rewriting the defaults by hand.

## Features

- **100+ plugins supported**:
  [![JavaScript](./assets/devicon-javascript.svg) Vanilla JS rules](https://eslint.org/docs/latest/rules),
  [![TypeScript] typescript-eslint](https://typescript-eslint.io/rules/),
  [🦄unicorn](https://npmx.dev/eslint-plugin-unicorn),
  [⭐regexp](https://github.com/ota-meshi/eslint-plugin-regexp),
  [![NodeJS](./assets/devicon-nodejs.svg) node](https://github.com/eslint-community/eslint-plugin-n),
  [![VueJS] vue](https://eslint.vuejs.org),
  [![Angular] angular](https://github.com/angular-eslint/angular-eslint),
  [![ReactJS] react](https://github.com/jsx-eslint/eslint-plugin-react) and 5 sister plugins,
  [![SolidJS](./assets/devicon-solidjs.svg) solid](https://github.com/solidjs-community/eslint-plugin-solid),
  [![tailwindcss][TailwindCSS] tailwind](https://github.com/schoero/eslint-plugin-better-tailwindcss),
  [![CSS] css](https://github.com/eslint/css),
  [![YAML](./assets/devicon-yaml.svg) yaml](https://github.com/ota-meshi/eslint-plugin-yml)
  and many more.
  The most commonly used ones are direct dependencies of this package, while the rest are optional peer dependencies;
- **Zero configuration by default**: exporting `eslintConfig()` from your `eslint.config.ts` is enough to get started.
  Configs for the frameworks and tools you use are enabled automatically; you only need to install the respective plugins;
- **Strictly typed**: every option and every rule name is covered by TypeScript types;
- **Well documented**: every config and all of its options are documented with JSDoc, available right in your editor;
- **Respects your `.gitignore`**: files listed in `.gitignore`, including nested ones, are excluded from linting by default;
- **Works great with Prettier**: conflicting rules are automatically disabled if you use Prettier;
- **Rename plugin prefixes** if you want to; many of them are shortened by default;
- **Bring your own plugins** and their rules will also be typed as much as possible.

## Problems it solves

- **Changing one option of a rule usually means repeating all the others.**
  Here you get the severity and the options this config has already set, so you only write what you want to change:

  <!-- eslint-skip -->

  ```ts
  overrides: {
    'import/order': (severity, options) => [severity, {...options?.[0], 'newlines-between': 'always'}],
  },
  ```

- **Rule options are not always convenient to write.**
  Configs come with [options of their own](#custom-options) which are often simpler and can cover several rules at once: one `jest` option sets up all the `jest/padding-around-*` rules.
- **A rule whose autofix you don't trust has to be turned off entirely.**
  ESLint has [no way to turn off the autofix of a single rule](https://github.com/eslint/rfcs/pull/125), so this config [does it for you](#disabling-rule-autofix), either for a rule as a whole or per file.
  A few autofixes are [already disabled](#autofixdisabledgloballyfor) by default, and you can turn them back on.
- **Limiting a rule to certain files means writing another config block.**
  Every [rule entry](#rule-entry-unruleentry-interface) accepts its own `files` and `ignores`.
- **Rules requiring type information need a config and a parser of their own.**
  Every such rule is [moved into a separate config](#typeinforules) for TypeScript files, with the parser set up.

## Installation

Minimum supported versions:

- Node.js: `^22.23.1 || ^24.18.0 || >=26.4.0`
- ESLint (peer dependency): `^10`

```sh
npm i -D eslint-config-un eslint@latest
pnpm i -D eslint-config-un eslint@latest
yarn add -D eslint-config-un eslint@latest
```

Commonly used plugins are direct dependencies of this package, so you don't need to install them separately.
We aim to update these dependencies within a month of their release.

Many plugins (usually the framework or library specific ones) are optional peer dependencies, which means you have to install them yourself once a config that needs them is enabled.
Run ESLint with this config to see which plugins are missing, and repeat until it gets past the loading stage and starts linting.

You can always replace a plugin's implementation with the [`plugins.<pluginName>.plugin` option][plugins option] or with your package manager's overrides.

### Usage

In your `eslint.config.ts`:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // ... optional configuration ...
});
```

> [!NOTE]
> We strongly recommend a TypeScript config file.
> If you stay with JavaScript, add the [`@ts-check` directive](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#ts-check) at the start of the file instead.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
## Configs and Sub-configs

eslint-config-un is built around Configs and Sub-configs (both are called Configs in this section).
They are similar to ESLint flat config objects, but with a few useful extensions.
Every Config is *usually* tied to one or more ESLint plugins, and produces one or more ESLint flat config items.

You can enable any Config by setting it to `true` or an object with the Config's options.
Passing `false` disables the Config.
Passing an empty array to `files` disables the Config, but not its Sub-configs.

A Sub-config is a Config located within another Config's options.
If the parent Config is disabled by passing `false`, all its Sub-configs are disabled too.

Once every flat config is built, eslint-config-un **loads only the plugins that are actually used**, unless the [`loadPluginsOnDemand`](#loadpluginsondemand) option is set to `false`.

### Config (`UnConfig`) interface

A Config has the following interface (the real types are simplified here for readability):

```ts
type Severity = 0 | 1 | 2 | 'off' | 'warn' | 'error';

type RuleOptions = {
  /* ... pre-generated options of all rules, each being an array */
};

type UnRuleEntry<RuleName extends string> =
  | Severity
  | [Severity, ...RuleOptions[RuleName]]
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
      files?: string[] | ((params: {filesDefault: string[]}) => string[] | undefined);
      ignores?:
        | string[]
        | ((params: {ignoresDefault: string[]; ignoresImplicit: string[]}) => string[] | undefined);

      [OverridesType in ('overrides' | 'overridesAny')]?: {
        [RuleName in string]:
          | UnRuleEntry<RuleName>
          | ((
              // The severity and options eslint-config-un has set for this rule.
              // The severity is 0 if the rule is not configured by this config at all
              unRuleSeverity: 0 | 1 | 2,
              unRuleOptions?: RuleOptions[RuleName],
            ) => UnRuleEntry<RuleName>);
      };

      forceSeverity?: 2 | 'error' | 1 | 'warn';
      [`config${string}`]: UnConfig; // These are Sub-configs
      [customOptions: string]: unknown; // Custom options, individual for each Config
    };
```

#### `files` and `ignores`

They mean exactly the same as the matching ESLint flat config item properties, except for how an empty array `[]` is treated:

- An empty array for `files` **disables the Config**, but leaves its Sub-configs alone.
- An empty array for `ignores` drops the default ignore list.

Both options also accept a **function**.
It is called with the patterns the option would have resolved to if it were not passed, and the patterns it returns **completely replace** them, unless it returns `undefined`.
This is handy for configs like `import/allowDefaultExport`, where you usually want to add your own patterns to the list of files `export default` is allowed in, rather than replace it.

#### `overrides` and `overridesAny`

These are similar to ESLint's `rules`, with one important addition: instead of a rule entry you can pass a function, which is called with the severity and options eslint-config-un has set for that rule.
This lets you **change a single option** or the severity without repeating the rest.

- `overridesAny` accepts *any* rule name, while `overrides` only accepts the rules tied to this config.
  The difference is purely a TypeScript one: at runtime both accept any rule.
- `overridesAny` is applied **after** `overrides`.

#### Sub-configs

Sub-configs are the same as Configs, but live in another Config's options.
Every Sub-config is an option whose name starts with `config`, such as `configPinia` in the `vue` config.

#### `forceSeverity`

Sets the severity of every rule this Config configures, including the rules it turns off.
Rules set through `overrides` or `overridesAny` keep the severity you gave them.

#### Custom options

Custom options differ from Config to Config and are documented with JSDoc.

### Rule entry (`UnRuleEntry`) interface

#### `severity` and `options`

Normal ESLint severity and rule options.

#### `disableAutofix`

Applies a copy of the rule with the `disable-autofix/` prefix and all autofixes disabled.

#### `files` and `ignores`

Limit the files this one rule applies to.
They only work if:

- at least one of `files` or `ignores` is provided and is not empty;
- `files` of the current Config is not an empty array.

When both conditions hold, a separate flat config item is created with:

- `name`: the current Config's name plus a `/@rule/<rule name with its prefix>` suffix;
- `files`: the ones given here, [intersected with the Config's `files`](https://eslint.org/docs/latest/use/configure/configuration-files#specify-files-with-an-and-operation) if the Config has any;
- `ignores`: the ones given here, or the Config's ones if you don't pass any.

## List of configs

In the following tables, Sub-configs have `/` in their names.
Configs mentioning `misc-enabled` in the second column are disabled by default and can all be enabled at once by setting the [`defaultConfigsStatus`](#defaultconfigsstatus) option to that value.

> [!WARNING]
> Many configs are enabled automatically when a certain package is installed.
> That check is done by the [`import-meta-resolve` package](https://npmx.dev/import-meta-resolve) and can produce false positives.
> [Read more about this below](#how-exactly-does-eslint-config-un-know-if-some-package-is-installed).

### Most popular and well known

| Un config name                                      | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                      | Description/Notes                                                                                  |
| --------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| ![JavaScript](./assets/devicon-javascript.svg) `js` | ✅                                          | [Vanilla ESLint rules](https://eslint.org/docs/latest/rules)                                              | -                                                                                                  |
| ![TypeScript] `ts`                                  | ✅ (`typescript` is installed)              | [typescript-eslint](https://npmx.dev/typescript-eslint) (`ts`)                                            | Only rules **not** requiring type information                                                      |
| ![TypeScript] `ts/typeAware`                        | ✅                                          | ^                                                                                                         | Only rules requiring type information                                                              |
| ![TypeScript] `ts/disableNoUnsafe`                  | ❌                                          | ^                                                                                                         | Disables all the `no-unsafe-*` rules                                                               |
| ![TypeScript] `ts/noTypeAssertion`                  | ❌                                          | [eslint-plugin-no-type-assertion](https://npmx.dev/eslint-plugin-no-type-assertion) (`no-type-assertion`) | -                                                                                                  |
| ![TypeScript] `ts/sortTsconfigKeys`                 | ❌                                          | -                                                                                                         | Sorts top-level and `compilerOptions` keys in tsconfig files                                       |
| 🦄 `unicorn`                                        | ✅                                          | [eslint-plugin-unicorn](https://npmx.dev/eslint-plugin-unicorn) (`unicorn`)                               | -                                                                                                  |
| 🦄 `unicorn/anyLanguage`                            | ✅                                          | ^                                                                                                         | Rules the plugin declares as supporting any file type; applied to all files                        |
| 🦄 `unicorn/css`                                    | ✅ (`css` config is enabled)                | ^                                                                                                         | Applies the CSS-supporting rules to `.css` files                                                   |
| 🦄 `unicorn/html`                                   | ✅ (`html` config is enabled)               | ^                                                                                                         | Applies the HTML-supporting rules to `.htm(l)` files                                               |
| 🦄 `unicorn/json`                                   | ✅ (`json` or `jsonc` config is enabled)    | ^                                                                                                         | Applies the JSON-supporting rules to `.json`, `.jsonc` and `.json5` files                          |
| 🦄 `unicorn/markdown`                               | ✅ (any of `markdown*` configs are enabled) | ^                                                                                                         | Applies the Markdown-supporting rules to `.md` and `.mdx` files                                    |
| ⭐ `regexp`                                         | ✅                                          | [eslint-plugin-regexp](https://npmx.dev/eslint-plugin-regexp) (`regexp`)                                  | -                                                                                                  |
| `promise`                                           | ✅                                          | [eslint-plugin-promise](https://npmx.dev/eslint-plugin-promise) (`promise`)                               | -                                                                                                  |
| `import`                                            | ✅                                          | [eslint-plugin-import-x] (`import`)                                                                       | -                                                                                                  |
| `import/allowDefaultExport`                         | ✅                                          | -                                                                                                         | Since v1.0.0<br>Config that allows default exports in config files, dotfiles and Storybook stories |
| `sonar`                                             | ✅ (if `misc-enabled`)                      | [eslint-plugin-sonarjs](https://npmx.dev/eslint-plugin-sonarjs) (`sonar`)                                 | -                                                                                                  |
| `eslintComments`                                    | ✅                                          | [@eslint-community/eslint-plugin-eslint-comments] (`eslint-comments`)                                     | Since v0.1.3                                                                                       |
| `jsdoc`                                             | ✅                                          | [eslint-plugin-jsdoc](https://npmx.dev/eslint-plugin-jsdoc) (`jsdoc`)                                     | Since v0.3.1                                                                                       |
| `jsdoc/typescript`                                  | ✅ (`ts` config is enabled)                 | -                                                                                                         | Config for enabling and disabling certain rules for TypeScript files                               |
| `tsdoc`                                             | ❌                                          | [eslint-plugin-tsdoc](https://npmx.dev/eslint-plugin-tsdoc) (`tsdoc`)                                     | -                                                                                                  |
| `stylistic`                                         | ✅                                          | [@stylistic/eslint-plugin](https://npmx.dev/@stylistic/eslint-plugin) (`stylistic`)                       | Since v1.0.0<br>Only a small number of rules are enabled by default                                |

### Web frameworks & related

| Un config name                                           | Enabled by default?<br>(optional condition)              | Primary plugin(s) (`default-prefix`)                                                                                                                         | Description/Notes                                                                                                                                     |
| -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| ![VueJS] `vue`                                           | ✅ (`vue` is installed)                                  | [eslint-plugin-vue](https://npmx.dev/eslint-plugin-vue) (`vue`)                                                                                              | -                                                                                                                                                     |
| ![VueJS] `vue/a11y`                                      | ✅                                                       | [eslint-plugin-vuejs-accessibility](https://npmx.dev/eslint-plugin-vuejs-accessibility) (`vuejs-accessibility`)                                              | -                                                                                                                                                     |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt`            | ✅ (`nuxt` is installed)                                 | [@nuxt/eslint-plugin](https://npmx.dev/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Since v1.0.0                                                                                                                                          |
| ![Nuxt](./assets/devicon-nuxt.svg) `vue/nuxt/nuxtConfig` | ✅                                                       | [@nuxt/eslint-plugin](https://npmx.dev/@nuxt/eslint-plugin) (`nuxt`)                                                                                         | Rules related to Nuxt config file<br>Since v1.0.0                                                                                                     |
| ![Pinia](./assets/logos-pinia.svg) `vue/pinia`           | ✅ (`pinia` is installed)                                | [eslint-plugin-pinia](https://npmx.dev/eslint-plugin-pinia) (`pinia`)                                                                                        | -                                                                                                                                                     |
| ![VueJS] `vue/i18n`                                      | ✅ (`vue-i18n` is installed)                             | [@intlify/eslint-plugin-vue-i18n](https://npmx.dev/@intlify/eslint-plugin-vue-i18n) (`vue-i18n`)                                                             | Since v1.0.0<br>`vue-i18n` specific rules                                                                                                             |
| ![VueJS] `vue/scopedCss`                                 | ✅                                                       | [eslint-plugin-vue-scoped-css](https://npmx.dev/eslint-plugin-vue-scoped-css) (`vue-scoped-css`)                                                             | Since v1.0.0                                                                                                                                          |
| ![VueJS] `vue/enforceTypescriptInScriptSection`          | ✅ (`ts` config is enabled)                              | [eslint-plugin-vue](https://npmx.dev/eslint-plugin-vue) (`vue`)                                                                                              | Since v1.0.0<br>Enforces `lang="ts"` in `<script>` sections via [`vue/block-lang`](https://eslint.vuejs.org/rules/block-lang.html)                    |
| ![Angular] `angular`                                     | ✅ (`@angular/core` is installed)                        | [@angular-eslint/eslint-plugin](https://npmx.dev/@angular-eslint/eslint-plugin) (`angular`)                                                                  | Since v0.7.0                                                                                                                                          |
| ![Angular] `angular/template`                            | ✅                                                       | [@angular-eslint/eslint-plugin-template](https://npmx.dev/@angular-eslint/eslint-plugin-template) (`angular-template`)                                       | -                                                                                                                                                     |
| ![Angular] `angular/template/html`                       | ✅ (Angular version >=18)                                | [@html-eslint/eslint-plugin-angular-template](https://npmx.dev/@html-eslint/eslint-plugin-angular-template) (`html-angular`)                                 | Since v1.0.0                                                                                                                                          |
| `ngrx`                                                   | ✅ (`@ngrx/store` is installed)                          | [@ngrx/eslint-plugin](https://npmx.dev/@ngrx/eslint-plugin) (`ngrx`)                                                                                         | Since v1.0.0                                                                                                                                          |
| ![ReactJS] `react`                                       | ✅ (`react` is installed)                                | [eslint-plugin-react](https://npmx.dev/eslint-plugin-react) (`react`)                                                                                        | Since v0.8.0                                                                                                                                          |
| ![ReactJS] `react/reactX`                                | ✅                                                       | [@eslint-react/eslint-plugin] (`eslint-react`)                                                                                                               | -                                                                                                                                                     |
| ![ReactJS] `react/reactX/typeAwareRules`                 | ✅ (`ts` config is enabled)                              | [@eslint-react/eslint-plugin] (`eslint-react`)                                                                                                               | Since v1.0.0<br>Type-aware rules from `@eslint-react/eslint-plugin`                                                                                   |
| ![ReactJS] `react/hooks`                                 | ✅                                                       | [eslint-plugin-react-hooks](https://npmx.dev/eslint-plugin-react-hooks) (`react-hooks`)<br>[@eslint-react/eslint-plugin] (`eslint-react`)                    | Includes rules with `@eslint-react/hooks-extra` prefix from `@eslint-react/eslint-plugin`                                                             |
| ![ReactJS] `react/dom`                                   | ✅ (`react-dom` is installed)                            | [@eslint-react/eslint-plugin] (`eslint-react`)<br>[eslint-plugin-react](https://npmx.dev/eslint-plugin-react)                                                | Includes rules with `@eslint-react/dom` prefix from `@eslint-react/eslint-plugin` and DOM related rules from `eslint-plugin-react`                    |
| ![ReactJS] `react/refresh`                               | ✅                                                       | [eslint-plugin-react-refresh](https://npmx.dev/eslint-plugin-react-refresh) (`react-refresh`)                                                                | -                                                                                                                                                     |
| ![ReactJS] `react/youMightNotNeedAnEffect`               | ✅                                                       | [eslint-plugin-react-you-might-not-need-an-effect](https://npmx.dev/eslint-plugin-react-you-might-not-need-an-effect) (`react-you-might-not-need-an-effect`) | Since v1.0.0                                                                                                                                          |
| ![ReactJS] `react/html`                                  | ✅                                                       | [@html-eslint/eslint-plugin-react](https://npmx.dev/@html-eslint/eslint-plugin-react) (`html-react`)                                                         | Since v1.0.0                                                                                                                                          |
| ![ReactJS] `react/allowDefaultExportsInJsxFiles`         | ✅                                                       | -                                                                                                                                                            | Config that allows default exports in all JSX files                                                                                                   |
| ![NextJS](./assets/devicon-nextjs.svg) `nextJs`          | ✅ (`next` is installed)                                 | [@next/eslint-plugin-next](https://npmx.dev/@next/eslint-plugin-next) (`nextjs`)                                                                             | Since v0.9.0                                                                                                                                          |
| `expo`                                                   | ✅ (`expo` is installed)                                 | [eslint-plugin-expo](https://npmx.dev/eslint-plugin-expo) (`expo`)                                                                                           | Since v1.0.0                                                                                                                                          |
| ![SolidJS](./assets/devicon-solidjs.svg) `solid`         | ✅ (`solid-js` is installed)                             | [eslint-plugin-solid](https://npmx.dev/eslint-plugin-solid) (`solid`)                                                                                        | Since v0.10.0                                                                                                                                         |
| ![Qwik](./assets/devicon-qwik.svg) `qwik`                | ✅ (`@builder.io/qwik` or `@qwik.dev/core` is installed) | [eslint-plugin-qwik](https://npmx.dev/eslint-plugin-qwik) (`qwik`)                                                                                           | Since v0.6.0                                                                                                                                          |
| `tsrx`                                                   | ✅ (`@tsrx/core` or `ripple` is installed)               | [@tsrx/eslint-plugin](https://npmx.dev/@tsrx/eslint-plugin) (`tsrx`)                                                                                         | Since v1.0.0                                                                                                                                          |
| ![Astro] `astro`                                         | ✅ (`astro` is installed)                                | [eslint-plugin-astro](https://npmx.dev/eslint-plugin-astro) (`astro`)                                                                                        | Since v0.9.0<br>Without A11Y rules                                                                                                                    |
| ![Astro] `astro/jsxA11y`                                 | ✅ (`eslint-plugin-jsx-a11y(-x)` can be loaded)          | ^                                                                                                                                                            | Only A11Y rules from `eslint-plugin-astro`                                                                                                            |
| ![Svelte] `svelte`                                       | ✅ (`svelte` is installed)                               | [eslint-plugin-svelte](https://npmx.dev/eslint-plugin-svelte) (`svelte`)                                                                                     | Since v0.10.0                                                                                                                                         |
| ![Svelte] `svelte/enforceTypescriptInScriptSection`      | ✅ (`ts` config is enabled)                              | ^                                                                                                                                                            | Since v1.0.0<br>Enforces `lang="ts"` in `<script>` blocks via [`svelte/block-lang`](https://sveltejs.github.io/eslint-plugin-svelte/rules/block-lang) |
| ![Svelte] `svelte/html`                                  | ✅                                                       | [@html-eslint/eslint-plugin-svelte](https://npmx.dev/@html-eslint/eslint-plugin-svelte) (`html-svelte`)                                                      | Since v1.0.0                                                                                                                                          |
| ![Ember] `ember`                                         | ✅ (`ember-source` is installed)                         | [eslint-plugin-ember](https://npmx.dev/eslint-plugin-ember) (`ember`)                                                                                        | Since v1.0.0                                                                                                                                          |
| ![Ember] `ember/testFiles`                               | ✅                                                       | ^                                                                                                                                                            | Since v1.0.0                                                                                                                                          |
| ![Ember] `ember/testFiles/noOnlyTests`                   | ✅                                                       | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                              | Since v1.0.0                                                                                                                                          |
| ![Lit](./assets/logos-lit-icon.svg) `lit`                | ✅ (`lit` is installed)                                  | [eslint-plugin-lit](https://npmx.dev/eslint-plugin-lit) (`lit`)                                                                                              | Since v1.0.0                                                                                                                                          |
| ![Lit](./assets/logos-lit-icon.svg) `lit/a11y`           | ✅                                                       | [eslint-plugin-lit-a11y](https://npmx.dev/eslint-plugin-lit-a11y) (`lit-a11y`)                                                                               | Since v1.0.0                                                                                                                                          |
| ![TailwindCSS] `betterTailwind`                          | ✅ (`tailwindcss` is installed)                          | [eslint-plugin-better-tailwindcss](https://npmx.dev/eslint-plugin-better-tailwindcss) (`better-tailwindcss`)                                                 | Since v1.0.0<br>Supports Tailwind v4 and v3                                                                                                           |
| ![TailwindCSS] `betterTailwind/css`                      | ✅ (parent config's `files` is not set)                  | ^                                                                                                                                                            | Since v1.0.0<br>Lints Tailwind classes in CSS files                                                                                                   |
| ![TailwindCSS] `tailwind`                                | ❌                                                       | [eslint-plugin-tailwindcss](https://npmx.dev/eslint-plugin-tailwindcss) (`tailwindcss`)                                                                      | Only supports Tailwind v4                                                                                                                             |
| ![NestJS](./assets/devicon-nestjs.svg) `nestJs`          | ✅ (`@nestjs/core` is installed)                         | [@darraghor/eslint-plugin-nestjs-typed](https://npmx.dev/@darraghor/eslint-plugin-nestjs-typed) (`nestjs`)                                                   | Since v1.0.0                                                                                                                                          |

### Runtimes & related

| Un config name                                                                   | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                      | Description/Notes                                                                                                                                                                          |
| -------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ![NodeJS](./assets/devicon-nodejs.svg) `node`                                    | ✅                                          | [eslint-plugin-n](https://npmx.dev/eslint-plugin-n) (`node`)                                              | Applies to all files, [see the notes](#nodejs)                                                                                                                                             |
| ![npm] `packageJson`                                                             | ✅                                          | [eslint-plugin-package-json](https://npmx.dev/eslint-plugin-package-json) (`package-json`)                | Since v0.1.5<br>📚 Supports multiple configs                                                                                                                                               |
| ![npm] `nodeDependencies`                                                        | ✅ (if `misc-enabled`)                      | [eslint-plugin-node-dependencies](https://npmx.dev/eslint-plugin-node-dependencies) (`node-dependencies`) | Since v0.10.0                                                                                                                                                                              |
| ![npm] `depend`                                                                  | ❌                                          | [eslint-plugin-depend](https://npmx.dev/eslint-plugin-depend) (`depend`)                                  | Since v1.0.0                                                                                                                                                                               |
| ![pnpm] `pnpm`                                                                   | ✅ (pnpm is detected as a package manager)  | [eslint-plugin-pnpm](https://npmx.dev/eslint-plugin-pnpm) (`pnpm`)                                        | Since v0.8.0<br>Does nothing itself, split into Sub-configs                                                                                                                                |
| ![pnpm] `pnpm/packageJson`                                                       | ✅                                          | ^                                                                                                         | Plugin rules related to `package.json` files                                                                                                                                               |
| ![pnpm] `pnpm/pnpmWorkspace`                                                     | ✅                                          | ^                                                                                                         | Plugin rules related to `pnpm-workspace.yaml` file                                                                                                                                         |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions`    | ❌                                          | -                                                                                                         | Since v0.10.0<br>For linting [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) written for JavaScript Runtime v2 |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions/V1` | ❌                                          | -                                                                                                         | Same, but for JavaScript Runtime v1 functions                                                                                                                                              |

### Languages

| Un config name                                               | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                  | Description/Notes                                                                                                          |
| ------------------------------------------------------------ | ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| ![Markdown] `markdown`                                       | ✅                                          | [@eslint/markdown](https://npmx.dev/@eslint/markdown) (`markdown`)                                                    | Since v0.2.0<br>Configured to also lint fenced code blocks inside .md files                                                |
| ![Markdown] `markdown/codeBlocks`                            | ✅                                          | ^                                                                                                                     | Since v1.0.0<br>Lints fenced code blocks inside Markdown files                                                             |
| ![Markdown] `markdown/formatFencedCodeBlocks`                | ✅ (`prettier` is installed)                | [eslint-plugin-prettier] (`prettier`)                                                                                 | Since v1.0.0<br>Formats fenced code blocks inside Markdown files using Prettier                                            |
| ![Markdown] `markdown/sentencesPerLine`                      | ❌                                          | [eslint-plugin-sentences-per-line](https://npmx.dev/eslint-plugin-sentences-per-line) (`sentences-per-line`)          | Since v1.0.0                                                                                                               |
| ![Markdown] `markdownPreferences`                            | ✅                                          | [eslint-plugin-markdown-preferences](https://npmx.dev/eslint-plugin-markdown-preferences) (`markdown-preferences`)    | Since v1.0.0                                                                                                               |
| ![Markdown] `markdownLinks`                                  | ❌                                          | [eslint-plugin-markdown-links](https://npmx.dev/eslint-plugin-markdown-links) (`markdown-links`)                      | Since v1.0.0                                                                                                               |
| ![MDX] `mdx`                                                 | ✅                                          | [eslint-plugin-mdx](https://npmx.dev/eslint-plugin-mdx) (`mdx`)                                                       | Since v1.0.0<br>Configured to also lint fenced code blocks inside .mdx files                                               |
| ![MDX] `mdx/codeBlocks`                                      | ✅                                          | ^                                                                                                                     | Since v1.0.0<br>Lints fenced code blocks inside MDX files                                                                  |
| ![MDX] `mdx/formatFencedCodeBlocks`                          | ✅ (`prettier` is installed)                | [eslint-plugin-prettier] (`prettier`)                                                                                 | Since v1.0.0<br>Formats fenced code blocks inside MDX files using Prettier                                                 |
| ![CSS] `css`                                                 | ✅ (unless `stylelint` is installed)        | [@eslint/css](https://npmx.dev/@eslint/css) (`css`)                                                                   | Since v0.7.0                                                                                                               |
| ![CSS] `css/scss`                                            | ✅ (a Sass compiler is installed)           | ^                                                                                                                     | Lints `.scss` files using [@humanwhocodes/scsstree](https://npmx.dev/@humanwhocodes/scsstree), an optional peer dependency |
| ![CSS] `cssInJs`                                             | ✅                                          | [eslint-plugin-css](https://npmx.dev/eslint-plugin-css) (`css-in-js`)                                                 | Since v0.2.0<br>Lints inlined CSS                                                                                          |
| `jsxA11y`                                                    | ✅                                          | [eslint-plugin-jsx-a11y-x](https://npmx.dev/eslint-plugin-jsx-a11y-x) (`jsx-a11y`)                                    | Since v1.0.0<br>Since v0.8.0 and until v1.0.0, [eslint-plugin-jsx-a11y](https://npmx.dev/eslint-plugin-jsx-a11y) was used  |
| ![YAML](./assets/devicon-yaml.svg) `yaml`                    | ✅ (if `misc-enabled`)                      | [eslint-plugin-yml](https://npmx.dev/eslint-plugin-yml) (`yaml`)                                                      | Since v0.1.0                                                                                                               |
| ![JSON](./assets/devicon-json.svg) `json`                    | ❌                                          | [@eslint/json](https://npmx.dev/@eslint/json) (`json`)                                                                | Since v1.0.0<br>Lints JSON, JSONC and JSON5 via the official plugin                                                        |
| `json/jsonc`                                                 | ✅                                          | ^                                                                                                                     | Lints `.jsonc` files; enabled by default when `json` is enabled                                                            |
| `json/json5`                                                 | ✅                                          | ^                                                                                                                     | Lints `.json5` files; enabled by default when `json` is enabled                                                            |
| ![JSON](./assets/devicon-json.svg) `jsonc`                   | ✅ (if `misc-enabled`)                      | [eslint-plugin-jsonc](https://npmx.dev/eslint-plugin-jsonc) (`jsonc`)                                                 | Since v0.1.4<br>Supports JSON, JSON5, JSONC                                                                                |
| `jsonc/json`                                                 | ❌                                          | ^                                                                                                                     | Config exclusively for `.json` files, does nothing by default                                                              |
| `jsonc/jsonc`                                                | ❌                                          | ^                                                                                                                     | Config exclusively for `.jsonc` files, does nothing by default                                                             |
| `jsonc/json5`                                                | ❌                                          | ^                                                                                                                     | Config exclusively for `.json5` files, does nothing by default                                                             |
| `jsonSchemaValidator`                                        | ✅ (if `misc-enabled`)                      | [eslint-plugin-json-schema-validator](https://npmx.dev/eslint-plugin-json-schema-validator) (`json-schema-validator`) | Since v0.6.0                                                                                                               |
| `jsonSchemaValidator/{json,yaml,toml}`                       | ✅                                          | ^                                                                                                                     | Since v1.0.0                                                                                                               |
| ![TOML](./assets/tabler-toml.svg) `toml`                     | ✅ (if `misc-enabled`)                      | [eslint-plugin-toml](https://npmx.dev/eslint-plugin-toml) (`toml`)                                                    | Since v0.1.3                                                                                                               |
| ![HTML](./assets/devicon-html5.svg) `html`                   | ✅ (unless `angular` config is enabled)     | [@html-eslint/eslint-plugin](https://npmx.dev/@html-eslint/eslint-plugin) (`html`)                                    | Since v0.10.0                                                                                                              |
| ![GraphQL](./assets/logos-graphql.svg) `graphql`             | ✅ (`graphql` is installed)                 | [@graphql-eslint/eslint-plugin](https://npmx.dev/@graphql-eslint/eslint-plugin) (`graphql`)                           | Since v1.0.0                                                                                                               |
| ![GraphQL](./assets/logos-graphql.svg) `graphql/jsProcessor` | ✅                                          | ^                                                                                                                     | Since v1.0.0<br>Runs the GraphQL processor on JS/TS files                                                                  |
| `civet`                                                      | ✅ (`@danielx/civet` is installed)          | [eslint-plugin-civet](https://npmx.dev/eslint-plugin-civet) (`civet`)                                                 | Since v1.0.0<br>Lints `.civet` files by compiling them to TypeScript/JavaScript first                                      |

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### JS/TS - miscellaneous

| Un config name                 | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                           | Description/Notes                                                                                                                                                                                                                       |
| ------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `security`                     | ✅ (if `misc-enabled`)                      | [eslint-plugin-security](https://npmx.dev/eslint-plugin-security) (`security`)                                                 | -                                                                                                                                                                                                                                       |
| `unusedImports`                | ❌                                          | [eslint-plugin-unused-imports](https://npmx.dev/eslint-plugin-unused-imports) (`unused-imports`)                               | Since v0.7.0                                                                                                                                                                                                                            |
| `unusedImports/noUnusedVars`   | ❌                                          | ^                                                                                                                              | Disables [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and `sonar/no-unused-vars` rules in favor of `unused-imports/no-unused-vars` |
| `preferArrowFunctions`         | ❌                                          | [eslint-plugin-prefer-arrow-functions](https://npmx.dev/eslint-plugin-prefer-arrow-functions) (`prefer-arrow-functions`)       | Since v0.1.0                                                                                                                                                                                                                            |
| `perfectionist`                | ❌                                          | [eslint-plugin-perfectionist](https://npmx.dev/eslint-plugin-perfectionist) (`perfectionist`)                                  | Since v0.4.0<br>Supports sub-configs for each rule from the plugin since v1.0.0                                                                                                                                                         |
| `perfectionist/sort*`          | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>One sub-config per `sort-*` rule (e.g. `sortObjects`), all off by default. See [Perfectionist](#perfectionist)                                                                                                          |
| `deMorgan`                     | ❌                                          | [eslint-plugin-de-morgan](https://npmx.dev/eslint-plugin-de-morgan) (`de-morgan`)                                              | Since v0.5.0                                                                                                                                                                                                                            |
| `es`                           | ❌                                          | [eslint-plugin-es-x](https://npmx.dev/eslint-plugin-es-x) (`es`)                                                               | Since v0.10.0                                                                                                                                                                                                                           |
| `jsInline`                     | ✅                                          | [eslint-plugin-html](https://npmx.dev/eslint-plugin-html) (`html-processor`)                                                   | Since v0.10.0<br>For linting inlined JS in HTML files                                                                                                                                                                                   |
| `math`                         | ✅                                          | [eslint-plugin-math](https://npmx.dev/eslint-plugin-math) (`math`)                                                             | Since v1.0.0                                                                                                                                                                                                                            |
| `erasableSyntaxOnly`           | ❌                                          | [eslint-plugin-erasable-syntax-only](https://npmx.dev/eslint-plugin-erasable-syntax-only) (`erasable-syntax-only`)             | Since v1.0.0                                                                                                                                                                                                                            |
| `unnecessaryAbstractions`      | ✅                                          | [eslint-plugin-unnecessary-abstractions](https://npmx.dev/eslint-plugin-unnecessary-abstractions) (`unnecessary-abstractions`) | Since v1.0.0                                                                                                                                                                                                                            |
| `importIntegrity`              | ❌                                          | [import-integrity-lint](https://npmx.dev/import-integrity-lint) (`import-integrity`)                                           | Since v1.0.0<br>Faster `eslint-plugin-import(-x)` semi-alternative                                                                                                                                                                      |
| `moduleInterop`                | ✅                                          | [eslint-plugin-module-interop](https://npmx.dev/eslint-plugin-module-interop) (`module-interop`)                               | Since v1.0.0                                                                                                                                                                                                                            |
| `treeShaking`                  | ❌                                          | [eslint-plugin-tree-shaking](https://npmx.dev/eslint-plugin-tree-shaking) (`tree-shaking`)                                     | Since v1.0.0                                                                                                                                                                                                                            |
| `e18e`                         | ✅ (if `misc-enabled`)                      | [@e18e/eslint-plugin](https://npmx.dev/@e18e/eslint-plugin) (`e18e`)                                                           | Since v1.0.0                                                                                                                                                                                                                            |
| `e18e/modernization`           | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                         |
| `e18e/moduleReplacements`      | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                         |
| `e18e/performanceImprovements` | ✅                                          | ^                                                                                                                              |                                                                                                                                                                                                                                         |
| `barrelFiles`                  | ❌                                          | [eslint-plugin-barrel-files](https://npmx.dev/eslint-plugin-barrel-files) (`barrel-files`)                                     | Since v1.0.0                                                                                                                                                                                                                            |
| `arrowReturnStyle`             | ✅                                          | [eslint-plugin-arrow-return-style-x] (`arrow-return-style`)                                                                    | Since v1.0.0                                                                                                                                                                                                                            |

### Libraries

| Un config name                                                                      | Enabled by default?<br>(optional condition)                            | Primary plugin(s) (`default-prefix`)                                                                                                                | Description/Notes                                                                                       |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `jest`                                                                              | ✅ (`jest` is installed)                                               | [eslint-plugin-jest](https://npmx.dev/eslint-plugin-jest) (`jest`)                                                                                  | Since v0.3.0                                                                                            |
| `jest/jestExtended`                                                                 | ✅ (`jest-extended` is installed)                                      | [eslint-plugin-jest-extended](https://npmx.dev/eslint-plugin-jest-extended) (`jest-extended`)                                                       | -                                                                                                       |
| `jest/typescript`                                                                   | ✅ (`ts` config is enabled)                                            | [eslint-plugin-jest](https://npmx.dev/eslint-plugin-jest) (`jest`)                                                                                  | Only TypeScript-specific rules from `eslint-plugin-jest`                                                |
| `jest/noOnlyTests`                                                                  | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| `vitest`                                                                            | ✅ (`vitest` is installed)                                             | [@vitest/eslint-plugin](https://npmx.dev/@vitest/eslint-plugin) (`vitest`)                                                                          | Since v0.3.0                                                                                            |
| `vitest/noOnlyTests`                                                                | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| `jestDom`                                                                           | ✅ (`@testing-library/jest-dom` is installed)                          | [eslint-plugin-jest-dom](https://npmx.dev/eslint-plugin-jest-dom) (`jest-dom`)                                                                      | Since v1.0.0                                                                                            |
| `ava`                                                                               | ✅ (`ava` is installed)                                                | [eslint-plugin-ava](https://npmx.dev/eslint-plugin-ava) (`ava`)                                                                                     | Since v1.0.0                                                                                            |
| `ava/packageJson`                                                                   | ✅                                                                     | ^                                                                                                                                                   | Since v1.0.0<br>Rules for `package.json` files                                                          |
| `ava/noOnlyTests`                                                                   | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| `awsCdk`                                                                            | ✅ (`aws-cdk-lib` is installed)                                        | [eslint-plugin-awscdk](https://npmx.dev/eslint-plugin-awscdk) (`awscdk`)                                                                            | Since v1.0.0                                                                                            |
| `qunit`                                                                             | ✅ (`qunit` is installed)                                              | [eslint-plugin-qunit](https://npmx.dev/eslint-plugin-qunit) (`qunit`)                                                                               | Since v1.0.0                                                                                            |
| `qunit/noOnlyTests`                                                                 | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary`                                                 | ✅ (`@testing-library/dom` is installed)                               | [eslint-plugin-testing-library](https://npmx.dev/eslint-plugin-testing-library) (`testing-library`)                                                 | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/angular`                                         | ✅ (`angular` config is enabled)                                       | ^                                                                                                                                                   | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/marko`                                           | ✅ (`marko` is installed)                                              | ^                                                                                                                                                   | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/react`                                           | ✅ (`react` config is enabled)                                         | ^                                                                                                                                                   | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/svelte`                                          | ✅ (`svelte` config is enabled)                                        | ^                                                                                                                                                   | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/vue`                                             | ✅ (`vue` config is enabled)                                           | ^                                                                                                                                                   | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/noOnlyTests`                                     | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![Testing Library] `testingLibrary/*/noOnlyTests`                                   | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| `noOnlyTests`                                                                       | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![TanStack] `tanstackQuery`                                                         | ✅ (`@tanstack/query-core` is installed)                               | [@tanstack/eslint-plugin-query](https://npmx.dev/@tanstack/eslint-plugin-query) (`tanstack-query`)                                                  | Since v1.0.0                                                                                            |
| ![TanStack] `tanstackRouter`                                                        | ✅ (`@tanstack/react-router` or `@tanstack/solid-router` is installed) | [@tanstack/eslint-plugin-router](https://npmx.dev/@tanstack/eslint-plugin-router) (`tanstack-router`)                                               | Since v1.0.0                                                                                            |
| ![TanStack] `tanstackStart`                                                         | ✅ (`@tanstack/react-start` or `@tanstack/solid-start` is installed)   | [@tanstack/eslint-plugin-start](https://npmx.dev/@tanstack/eslint-plugin-start) (`tanstack-start`)                                                  | Since v1.0.0                                                                                            |
| ![Storybook](./assets/logos-storybook-icon.svg) `storybook`                         | ✅ (`storybook` is installed)                                          | [eslint-plugin-storybook](https://npmx.dev/eslint-plugin-storybook) (`storybook`)                                                                   | Since v1.0.0                                                                                            |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress`             | ✅ (`cypress` is installed)                                            | [eslint-plugin-cypress](https://npmx.dev/eslint-plugin-cypress) (`cypress`)                                                                         | Since v1.0.0                                                                                            |
| ![Cypress](./assets/vscode-icons-file-type-light-cypress.svg) `cypress/noOnlyTests` | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![Mocha](./assets/devicon-mocha.svg) `mocha`                                        | ✅ (`mocha` is installed)                                              | [eslint-plugin-mocha](https://npmx.dev/eslint-plugin-mocha) (`mocha`)                                                                               | Since v1.0.0                                                                                            |
| ![Mocha](./assets/devicon-mocha.svg) `mocha/noOnlyTests`                            | ✅                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![Turborepo](./assets/material-icon-theme-turborepo.svg) `turbo`                    | ✅ (`turbo` is installed)                                              | [eslint-plugin-turbo](https://npmx.dev/eslint-plugin-turbo) (`turbo`)                                                                               | Since v1.0.0                                                                                            |
| ![Playwright](./assets/devicon-playwright.svg) `playwright`                         | ✅ (`playwright` is installed)                                         | [eslint-plugin-playwright](https://npmx.dev/eslint-plugin-playwright) (`playwright`)                                                                | Since v1.0.0                                                                                            |
| ![Playwright](./assets/devicon-playwright.svg) `playwright/noOnlyTests`             | ❌                                                                     | [eslint-plugin-no-only-tests] (`no-only-tests`)                                                                                                     | Since v1.0.0                                                                                            |
| ![Lodash](./assets/devicon-plain-lodash.svg) `youDontNeedLodashUnderscore`          | ✅ (`lodash`, `lodash-es` or `lodash.*` is installed)                  | [eslint-plugin-you-dont-need-lodash-underscore](https://npmx.dev/eslint-plugin-you-dont-need-lodash-underscore) (`you-dont-need-lodash-underscore`) | Since v1.0.0                                                                                            |
| ![RxJS](./assets/devicon-rxjs.svg) `rxjs`                                           | ✅ (`rxjs` is installed)                                               | [@smarttools/eslint-plugin-rxjs](https://npmx.dev/@smarttools/eslint-plugin-rxjs) (`rxjs`)                                                          | Since v1.0.0                                                                                            |
| ![Nx](./assets/vscode-icons-file-type-light-nx.svg) `nx`                            | ✅ (`nx` is installed)                                                 | [@nx/eslint-plugin](https://npmx.dev/@nx/eslint-plugin) (`nx`)                                                                                      | Since v1.0.0                                                                                            |
| ![Zod] `importZod`                                                                  | ❌                                                                     | [eslint-plugin-import-zod](https://npmx.dev/eslint-plugin-import-zod) (`import-zod`)                                                                | Enforces namespace imports for `zod`. You should probably use the `zod` config instead.<br>Since v1.0.0 |
| ![UnoCSS](./assets/logos-unocss.svg) `unocss`                                       | ✅ (`unocss` is installed)                                             | [@unocss/eslint-plugin](https://npmx.dev/@unocss/eslint-plugin) (`unocss`)                                                                          | Since v1.0.0                                                                                            |
| ![Zod] `zod`                                                                        | ✅ (`zod@^3\|\|^4` is installed)                                       | [eslint-plugin-zod](https://npmx.dev/eslint-plugin-zod) (`zod`)                                                                                     | Since v1.0.0                                                                                            |
| ![Zod] `zod/mini`                                                                   | ✅                                                                     | [eslint-plugin-zod-mini](https://npmx.dev/eslint-plugin-zod-mini) (`zod-mini`)                                                                      | Since v1.0.0<br>Rules for [`zod/mini`](https://zod.dev/packages/mini)                                   |
| ![Zod] `zod/core`                                                                   | ✅                                                                     | [eslint-plugin-zod-core](https://npmx.dev/eslint-plugin-zod-core) (`zod-core`)                                                                      | Since v1.0.0<br>Rules for [`zod/v4/core`](https://zod.dev/packages/core)                                |
| ![Zod] `zodOpenapi`                                                                 | ✅ (`zod-openapi` is installed)                                        | [eslint-plugin-zod-openapi](https://npmx.dev/eslint-plugin-zod-openapi) (`zod-openapi`)                                                             | Since v1.0.0<br>Rules for [`zod-openapi`](https://github.com/samchungy/zod-openapi)                     |
| ![FormatJS](./assets/logos-formatjs.svg) `formatJs`                                 | ✅ (`@formatjs/icu-messageformat-parser` is installed)                 | [eslint-plugin-formatjs](https://npmx.dev/eslint-plugin-formatjs) (`formatjs`)                                                                      | Since v1.0.0                                                                                            |
| ![Docusaurus](./assets/vscode-icons-file-type-docusaurus.svg) `docusaurus`          | ✅ (`@docusaurus/core` is installed)                                   | [@docusaurus/eslint-plugin](https://npmx.dev/@docusaurus/eslint-plugin) (`docusaurus`)                                                              | Since v1.0.0                                                                                            |
| `drizzle`                                                                           | ✅ (`drizzle-orm` is installed)                                        | [eslint-plugin-drizzle](https://npmx.dev/eslint-plugin-drizzle) (`drizzle`)                                                                         | Since v1.0.0                                                                                            |
| `mobx`                                                                              | ✅ (`mobx` is installed)                                               | [eslint-plugin-mobx](https://npmx.dev/eslint-plugin-mobx) (`mobx`)                                                                                  | Since v1.0.0                                                                                            |
| `remeda`                                                                            | ✅ (`remeda` is installed)                                             | [eslint-plugin-remeda](https://npmx.dev/eslint-plugin-remeda) (`remeda`)                                                                            | Since v1.0.0                                                                                            |
| `clsx`                                                                              | ✅ (`clsx` is installed)                                               | [eslint-plugin-clsx](https://npmx.dev/eslint-plugin-clsx) (`clsx`)                                                                                  | Since v1.0.0                                                                                            |
| `unhead`                                                                            | ✅ (`unhead` is installed)                                             | [@unhead/eslint-plugin](https://npmx.dev/@unhead/eslint-plugin) (`unhead`)                                                                          | Since v1.0.0                                                                                            |

### Miscellaneous

| Un config name                                                  | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`)                                                                                           | Description/Notes                                                                                                    |
| --------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `casePolice`                                                    | ❌                                          | [eslint-plugin-case-police](https://npmx.dev/eslint-plugin-case-police) (`case-police`)                                        | Since v0.9.0                                                                                                         |
| `noPrettierIncompatibleRules`                                   | ✅ (`prettier` package is installed)        | -                                                                                                                              | Since v1.0.0<br>Disables rules that are unnecessary or conflict with Prettier<br>Replaces `eslint-config-prettier`   |
| `noStylisticRules`                                              | ❌                                          | -                                                                                                                              | Since v1.0.0<br>Disables most of the stylistic rules<br>Useful when adopting eslint-config-un in an existing project |
| `noRelativeImportPaths`                                         | ❌                                          | [eslint-plugin-no-relative-import-paths](https://npmx.dev/eslint-plugin-no-relative-import-paths) (`no-relative-import-paths`) | Since v1.0.0                                                                                                         |
| `noUnsanitized`                                                 | ✅                                          | [eslint-plugin-no-unsanitized](https://npmx.dev/eslint-plugin-no-unsanitized) (`no-unsanitized`)                               | Since v1.0.0                                                                                                         |
| ![CSpell](./assets/vscode-icons-file-type-cspell.svg) `cspell`  | ❌                                          | [@cspell/eslint-plugin](https://npmx.dev/@cspell/eslint-plugin) (`cspell`)                                                     | Since v1.0.0                                                                                                         |
| ![ESLint](./assets/devicon-eslint.svg) `eslintPlugin`           | ❌                                          | [eslint-plugin-eslint-plugin](https://npmx.dev/eslint-plugin-eslint-plugin) (`eslint-plugin`)                                  | Since v1.0.0<br>For linting ESLint plugins                                                                           |
| ![ESLint](./assets/devicon-eslint.svg) `eslintPlugin/ruleTests` | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>Rules for ESLint rule test files                                                                     |
| `fileProgress`                                                  | ❌                                          | [eslint-plugin-file-progress](https://npmx.dev/eslint-plugin-file-progress) (`file-progress`)                                  | Since v1.0.0<br>An ESLint plugin that prints file progress                                                           |
| `compat`                                                        | ❌                                          | [eslint-plugin-compat](https://npmx.dev/eslint-plugin-compat) (`compat`)                                                       | Since v1.0.0                                                                                                         |
| `webComponents`                                                 | ❌                                          | [eslint-plugin-wc](https://npmx.dev/eslint-plugin-wc) (`wc`)                                                                   | Since v1.0.0                                                                                                         |
| `header`                                                        | ❌                                          | [eslint-plugin-header](https://npmx.dev/eslint-plugin-header) (`header`)                                                       | Since v1.0.0                                                                                                         |
| `headers`                                                       | ❌                                          | [eslint-plugin-headers](https://npmx.dev/eslint-plugin-headers) (`headers`)                                                    | Since v1.0.0                                                                                                         |
| `checkFile`                                                     | ❌                                          | [eslint-plugin-check-file](https://npmx.dev/eslint-plugin-check-file) (`check-file`)                                           | Since v1.0.0                                                                                                         |
| `checkFile/enableCheckFileProcessor`                            | ❌                                          | ^                                                                                                                              | Since v1.0.0<br>Applies the `check-file` processor to the specified files                                            |
| `boundaries`                                                    | ❌                                          | [eslint-plugin-boundaries](https://npmx.dev/eslint-plugin-boundaries) (`boundaries`)                                           | Since v1.0.0                                                                                                         |
| `noSecrets`                                                     | ✅                                          | [eslint-plugin-no-secrets](https://npmx.dev/eslint-plugin-no-secrets) (`no-secrets`)                                           | Since v1.0.0                                                                                                         |
| `noSecrets/json`                                                | ✅                                          | ^                                                                                                                              | Applied only to `.json` files by default                                                                             |
| `expectType`                                                    | ❌                                          | [eslint-plugin-expect-type](https://npmx.dev/eslint-plugin-expect-type) (`expect-type`)                                        | Since v1.0.0                                                                                                         |
| `command`                                                       | ❌                                          | [eslint-plugin-command](https://npmx.dev/eslint-plugin-command) (`command`)                                                    | Since v1.0.0                                                                                                         |
| `antfu`                                                         | ❌                                          | [eslint-plugin-antfu](https://npmx.dev/eslint-plugin-antfu) (`antfu`)                                                          | Since v1.0.0<br>[Anthony Fu](https://antfu.me)'s personal collection of rules                                        |
| `sql`                                                           | ❌                                          | [eslint-plugin-sql](https://npmx.dev/eslint-plugin-sql) (`sql`)                                                                | Since v1.0.0                                                                                                         |
| `safeql`                                                        | ✅ (`@ts-safeql/sql-tag` is installed)      | [@ts-safeql/eslint-plugin](https://npmx.dev/@ts-safeql/eslint-plugin) (`safeql`)                                               | Since v1.0.0<br>Validates raw PostgreSQL queries and infers the TypeScript types of their results                    |
| `format`                                                        | ❌                                          | [eslint-plugin-format](https://npmx.dev/eslint-plugin-format) (`format`)                                                       | Since v1.0.0<br>📚 Supports multiple configs                                                                         |
| `lockfile`                                                      | ✅ (if `misc-enabled`)                      | [eslint-plugin-lockfile](https://npmx.dev/eslint-plugin-lockfile) (`lockfile`)                                                 | Since v1.0.0                                                                                                         |
| `lockfile/packageJson`                                          | ✅                                          | ^                                                                                                                              | Since v1.0.0<br>Rules for `package.json` files                                                                       |
| ![GitHub](./assets/devicon-github.svg) `githubActions`          | ✅ (`.github/workflows` directory exists)   | [eslint-plugin-github-action](https://npmx.dev/eslint-plugin-github-action) (`github-actions`)                                 | Since v1.0.0                                                                                                         |
| `functional`                                                    | ❌                                          | [eslint-plugin-functional](https://npmx.dev/eslint-plugin-functional) (`functional`)                                           | Since v1.0.0<br>Rules enforcing functional programming patterns                                                      |
| `un`                                                            | ✅                                          | Built-in `eslint-plugin-un` (`un`)                                                                                             | Since v1.0.0<br>Rules of our own, not present in any other plugin                                                    |
| `cli`                                                           | ✅                                          | -                                                                                                                              | Since v0.4.2<br>Allows `process.exit()` and `console` methods in `bin`, `scripts` and `cli` directories              |
| `tests`                                                         | ✅                                          | -                                                                                                                              | Since v1.0.0<br>Disables mostly performance rules for the well-known test file patterns                              |

## How to use

### Rules configuration (`configs` and `extraConfigs` option)

An example:

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
      // We're not ready to lint *.vue files yet, but the Sub-config below stays on
      files: [],
      // This is a Sub-config
      configPinia: {
        ignores: ['./path/to/pinia/store/with-many-errors.ts'],
      },
    },
    // This config is disabled by default, but passing an options object enables it
    perfectionist: {
      files: ['src/big-list-of-something.ts'],
      overrides: {
        'perfectionist/sort-objects': 2,
      },
    },
    // This config is enabled by default, but we don't write JSDoc, so we don't need it
    jsdoc: false,
    // This one is the opposite: disabled by default, but we want it
    security: true,
  },
});
```

#### Providing user-defined flat configs

Pass your own flat configs in the `extraConfigs` option.
They are placed after all of eslint-config-un's configs, except the last two: the one that disables the rules incompatible with Prettier, and the one that disables the stylistic rules.
This way you always have the final say, and those two can still do their job.

An example:

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

### Plugin prefixes (`plugins.<pluginName>.prefix` option)

ESLint plugins are registered under a prefix of your choosing, such as `unicorn` or `vue`.
A rule name is then the prefix plus the rule's own name, for example `unicorn/no-useless-undefined`.

eslint-config-un lets you change the prefix of any registered plugin.
Some plugins are also registered under a different prefix than their own documentation suggests.
To rename those back, or to rename any other plugin, set `plugins.<canonical prefix>.prefix` to the prefix you want.

#### Default renames

<!-- DEFAULT-RENAMES-TABLE:START - generated, do not edit manually -->

| Plugin                                                                                                        | Suggested prefix                    | Our prefix           | Reason                                                                                                     |
| ------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------------------- | ---------------------------------------------------------------------------------------------------------- |
| [`@angular-eslint/eslint-plugin`](https://npmx.dev/@angular-eslint/eslint-plugin)                             | `@angular-eslint`                   | `angular`            | More concise and convenient to use; `@` feels redundant                                                    |
| [`@angular-eslint/eslint-plugin-template`](https://npmx.dev/@angular-eslint/eslint-plugin-template)           | `@angular-eslint/template`          | `angular-template`   | Similar reason ^                                                                                           |
| [`@cspell/eslint-plugin`](https://npmx.dev/@cspell/eslint-plugin)                                             | `@cspell`                           | `cspell`             | Similar reason ^                                                                                           |
| [`@darraghor/eslint-plugin-nestjs-typed`](https://npmx.dev/@darraghor/eslint-plugin-nestjs-typed)             | `@darraghor/nestjs-typed`           | `nestjs`             | Similar reason ^                                                                                           |
| [`@docusaurus/eslint-plugin`](https://npmx.dev/@docusaurus/eslint-plugin)                                     | `@docusaurus`                       | `docusaurus`         | Similar reason ^                                                                                           |
| [`@eslint-community/eslint-plugin-eslint-comments`][@eslint-community/eslint-plugin-eslint-comments]          | `@eslint-community/eslint-comments` | `eslint-comments`    | Similar reason ^                                                                                           |
| [`@graphql-eslint/eslint-plugin`](https://npmx.dev/@graphql-eslint/eslint-plugin)                             | `@graphql-eslint`                   | `graphql`            | Similar reason ^                                                                                           |
| [`@html-eslint/eslint-plugin`](https://npmx.dev/@html-eslint/eslint-plugin)                                   | `@html-eslint`                      | `html`               | Similar reason ^                                                                                           |
| [`@html-eslint/eslint-plugin-angular-template`](https://npmx.dev/@html-eslint/eslint-plugin-angular-template) | `@html-eslint/angular-template`     | `html-angular`       | Similar reason ^                                                                                           |
| [`@html-eslint/eslint-plugin-react`](https://npmx.dev/@html-eslint/eslint-plugin-react)                       | `@html-eslint/react`                | `html-react`         | Similar reason ^                                                                                           |
| [`@html-eslint/eslint-plugin-svelte`](https://npmx.dev/@html-eslint/eslint-plugin-svelte)                     | `@html-eslint/svelte`               | `html-svelte`        | Similar reason ^                                                                                           |
| [`@intlify/eslint-plugin-vue-i18n`](https://npmx.dev/@intlify/eslint-plugin-vue-i18n)                         | `@intlify/vue-i18n`                 | `vue-i18n`           | Similar reason ^                                                                                           |
| [`@ngrx/eslint-plugin`](https://npmx.dev/@ngrx/eslint-plugin)                                                 | `@ngrx`                             | `ngrx`               | Similar reason ^                                                                                           |
| [`@nx/eslint-plugin`](https://npmx.dev/@nx/eslint-plugin)                                                     | `@nx`                               | `nx`                 | Similar reason ^                                                                                           |
| [`@smarttools/eslint-plugin-rxjs`](https://npmx.dev/@smarttools/eslint-plugin-rxjs)                           | `@smarttools/rxjs`                  | `rxjs`               | Similar reason ^                                                                                           |
| [`@stylistic/eslint-plugin`](https://npmx.dev/@stylistic/eslint-plugin)                                       | `@stylistic`                        | `stylistic`          | Similar reason ^                                                                                           |
| [`@tanstack/eslint-plugin-query`](https://npmx.dev/@tanstack/eslint-plugin-query)                             | `@tanstack/query`                   | `tanstack-query`     | Similar reason ^                                                                                           |
| [`@tanstack/eslint-plugin-router`](https://npmx.dev/@tanstack/eslint-plugin-router)                           | `@tanstack/router`                  | `tanstack-router`    | Similar reason ^                                                                                           |
| [`@tanstack/eslint-plugin-start`](https://npmx.dev/@tanstack/eslint-plugin-start)                             | `@tanstack/start`                   | `tanstack-start`     | Similar reason ^                                                                                           |
| [`@ts-safeql/eslint-plugin`](https://npmx.dev/@ts-safeql/eslint-plugin)                                       | `@ts-safeql`                        | `safeql`             | Similar reason ^                                                                                           |
| [`@unhead/eslint-plugin`](https://npmx.dev/@unhead/eslint-plugin)                                             | `@unhead`                           | `unhead`             | Similar reason ^                                                                                           |
| [`@unocss/eslint-plugin`](https://npmx.dev/@unocss/eslint-plugin)                                             | `@unocss`                           | `unocss`             | Similar reason ^                                                                                           |
| [`typescript-eslint`](https://npmx.dev/typescript-eslint)                                                     | `@typescript-eslint`                | `ts`                 | Similar reason ^                                                                                           |
| [`eslint-plugin-arrow-return-style-x`][eslint-plugin-arrow-return-style-x]                                    | `arrow-return-style-x`              | `arrow-return-style` | A fork meant to replace the original plugin, so it keeps the original prefix                               |
| [`eslint-plugin-es-x`](https://npmx.dev/eslint-plugin-es-x)                                                   | `es-x`                              | `es`                 | Similar reason ^                                                                                           |
| [`eslint-plugin-import-x`][eslint-plugin-import-x]                                                            | `import-x`                          | `import`             | Similar reason ^                                                                                           |
| [`eslint-plugin-jsx-a11y-x`](https://npmx.dev/eslint-plugin-jsx-a11y-x)                                       | `jsx-a11y-x`                        | `jsx-a11y`           | Similar reason ^                                                                                           |
| [`eslint-plugin-n`](https://npmx.dev/eslint-plugin-n)                                                         | `n`                                 | `node`               | Similar reason ^                                                                                           |
| [`@next/eslint-plugin-next`](https://npmx.dev/@next/eslint-plugin-next)                                       | `@next/next`                        | `nextjs`             | `@next/next` is redundant; consistent with the framework name                                              |
| [`eslint-plugin-css`](https://npmx.dev/eslint-plugin-css)                                                     | `css`                               | `css-in-js`          | Conflicts with [`@eslint/css`](https://npmx.dev/@eslint/css), and our prefix describes the plugin better   |
| [`eslint-plugin-yml`](https://npmx.dev/eslint-plugin-yml)                                                     | `yml`                               | `yaml`               | Consistent with the official language name (and `eslint-plugin-yaml` is far less popular)                  |
| [`eslint-plugin-github-action`](https://npmx.dev/eslint-plugin-github-action)                                 | `github-action`                     | `github-actions`     | Consistent with the platform name (and `eslint-plugin-github-actions` looks unmaintained)                  |
| [`eslint-plugin-html`](https://npmx.dev/eslint-plugin-html)                                                   | `html`                              | `html-processor`     | Frees up `html` for `@html-eslint`; this plugin only provides a processor (it has no rules)                |
| [`eslint-plugin-sonarjs`](https://npmx.dev/eslint-plugin-sonarjs)                                             | `sonarjs`                           | `sonar`              | More concise and convenient to use                                                                         |
| [`@eslint-react/eslint-plugin`][@eslint-react/eslint-plugin]                                                  | `@eslint-react`                     | `eslint-react`       | More concise and convenient to use; `@` feels redundant; `react` is already taken by `eslint-plugin-react` |

<!-- DEFAULT-RENAMES-TABLE:END -->

> [!NOTE]
> Inside `overrides`, `overridesAny` and `extraConfigs` you still write rules with the original prefix, even after a rename.
> eslint-config-un renames them for you.

> [!WARNING]
> Rules inside `eslint-disable-*` comments are not renamed for you: after a rename you have to update those comments yourself.

### Disabling rule autofix

ESLint still [has no way to disable autofix for a single rule](https://github.com/eslint/rfcs/pull/125).
This config fills that gap: you can turn a rule's autofix off globally, or only for some files.
In the second case the rule is renamed to `disable-autofix/<rule name>`, which is the price of doing it per file.

#### Globally disabling rule autofix

You can disable autofix for any fixable rule globally using the `autofixDisabledGloballyFor` root option:

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

Some rules already have their autofix disabled globally by default.
The full list is in the JSDoc of this option.

You can also disable the autofixes of every rule of a plugin at once, and then bring some of them back:

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

To disable the autofix only for certain files, use the object notation of the rule entry:

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

Under the hood this creates a plugin with the `disable-autofix` prefix and copies the rule into it.
The copy is named `disable-autofix/<rule name>` and replaces the `<rule name>` entry in the resulting config.

## Configs notes

### TypeScript

Rules [requiring type information](https://typescript-eslint.io/rules/?=typeInformation) are *enabled* by default, and typed linting [is not free](https://typescript-eslint.io/getting-started/typed-linting/#performance), so decide for yourself whether to keep them.
Such rules come not only from `typescript-eslint` but from many other plugins too, and they are all controlled by one root option, [`typeInfoRules`](#typeinforules).
Set it to `disabled` to opt out of typed linting, or use its `ignores`/`allowDefaultProject` for TypeScript files that are not part of any `tsconfig.json` and would otherwise make [the project service](https://typescript-eslint.io/packages/parser/#projectservice) throw.

Two things that are easy to miss:

- turning these rules off does not make linting faster on its own: as long as the `ts` config is enabled, the project service is still set up, and that is what takes the time (`ts: {parserOptions: {projectService: false}}` turns it off);
- the `ts` config's `typeAware` sub-config only covers *its own* type-aware rules; the rules from the other plugins follow `typeInfoRules`.

### Node.js

The `node` config applies to *all* files, so all your code is treated as Node.js code.
In frontend code, or any other code that does not run in Node.js, this produces false positives, so narrow the config down with `files`/`ignores`, or turn it off:

<!-- eslint-skip -->

```ts
node: {files: ['server/**', 'scripts/**']},
```

#### Specifying the supported Node.js version

Several rules of the `node` config report based on the range of Node.js versions your code has to support: [`no-deprecated-api`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-deprecated-api.md), [`no-unsupported-features/*`](https://github.com/eslint-community/eslint-plugin-n/tree/HEAD/docs/rules/no-unsupported-features) and [`prefer-node-protocol`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md).
If that range is not set anywhere, the plugin falls back to `>=16.0.0`, so everything added to Node.js after v16 is reported as unsupported.

The recommended way to specify it is the `engines.node` field of your `package.json`:

```json
{
  "engines": {
    "node": "^22.12.0 || >=24"
  }
}
```

Other rules read this field too, for example [`node-dependencies/compat-engines`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/compat-engines.html).
It is also the *only* place we look at when deciding whether to enable rules that need a certain Node.js version, such as [`unicorn/prefer-dispose`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-dispose.md) (`>=24`) and [`unicorn/prefer-import-meta-properties`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-import-meta-properties.md) (`>=20.11`).
For those we read the `package.json` closest to [the current working directory], not the one closest to each linted file, as the plugin does.

If adding that field is not an option, set the version through the [`plugins.node.settings`][plugins option] root option, which the version-gated rules above do **not** read:

<!-- eslint-skip -->

```ts
plugins: {
  node: {
    settings: {version: '^22.12.0 || >=24'},
  },
},
```

The plugin itself looks for the version in this order: the rule's own `version` option → `settings.n` → `settings.node` → `engines.node` → `devEngines.runtime` (the entry with `name: "node"`) → `>=16.0.0`.

### Import

#### Checking the declared dependencies in a monorepo

[`import/no-extraneous-dependencies`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md), configured by the `extraneousDependenciesCheck` option, only reads the `package.json` closest to the linted file.
In a monorepo this means the dev tooling installed at the root is reported as undeclared inside workspace packages.

The `packageDir` sub-option lists the directories to read `package.json` from instead.
Relative paths are resolved against [the current working directory], so prefer absolute ones:

```ts
import path from 'node:path';
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    import: {
      extraneousDependenciesCheck: {
        packageDir: [
          import.meta.dirname,
          ...['api', 'ui'].map((name) => path.join(import.meta.dirname, 'packages', name)),
        ],
      },
    },
  },
});
```

The dependencies of all the listed `package.json` files are merged into a single list, so one package importing another's dependency won't be reported.
To avoid that, set the rule per package with [`extraConfigs`][extraConfigs option] instead, each entry scoped by `files` and listing only the root and that package in `packageDir`.

### Frontend frameworks

We detect the version of the frontend framework you use (Angular, Vue, Svelte and so on) and enable the rules that fit that version.
You can always set the version yourself through the config's own option.
See the JSDoc of each config for the details.

#### Vue

TypeScript rules are enabled in `.vue` files when the `vue` config's `enforceTypescriptInScriptSection` sub-config is on, which happens *automatically* when the `ts` config is enabled.
If some of your `.vue` files are written in TypeScript and others in JavaScript, use that sub-config's `files` and `ignores` to say which are which.
It is not currently possible to pick rules based on the `lang` attribute of the `<script>` block itself.

#### Angular

We support Angular versions 13 to 22, all at once.
Install `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` of the same major version as your Angular.
A higher version will most likely work too, which lets you run rules from newer `@angular-eslint/eslint-plugin*` releases on an older Angular codebase.

#### React

We lint React code with rules from several plugins.
Two of them, `@eslint-react/eslint-plugin` and `eslint-plugin-react`, implement a number of the same rules, and the `react` config's `pluginX` option decides which implementation wins.
`prefer`, the default, takes the `@eslint-react` one; `avoid` takes the `eslint-plugin-react` one; `only` and `never` drop one of the two plugins entirely.
The JSDoc of that option lists every rule the two plugins both implement.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### Markdown/MDX

When the `markdown`/`mdx` config is enabled (the default), the rules from the other configs are also applied to the code blocks (\```lang ... \```) inside Markdown files.
This works because [`@eslint/markdown`](https://npmx.dev/@eslint/markdown) and [`eslint-mdx`](https://npmx.dev/eslint-mdx) create a virtual file for every code block, with the extension taken from the language after the ``` fence.

Not every rule makes sense there: some are too strict for code that is never executed, and some report problems you cannot fix in a snippet at all, like a missing import.
That is why a number of rules are disabled in code blocks by default; the full list shows up as autocompletion for the [`markdownCodeBlocksRules.doNotDisable`](#markdowncodeblocksrulesdonotdisable) option.
Use the [`markdownCodeBlocksRules`](#markdowncodeblocksrules) option to decide which rules are disabled and which are not.

Linting of code blocks lives in a sub-config of the `markdown`/`mdx` configs, `codeBlocks`.
Set it to `false` to stop linting code blocks entirely, narrow its `files`/`ignores` to pick which *Markdown*/*MDX* files have their blocks linted, or use its `overrides`/`overridesAny` to change the rules for code blocks only.

#### Disabling a rule in a code block

A code block is not linted as a part of the Markdown file: the processor cuts it out and gives it to ESLint as a separate *virtual* file, named `<Markdown file>/<number>_<name>`, where the name defaults to `<number>.<extension>` (`README.md/0_0.js`, `docs.mdx/1_0.js`).
The extension comes from the language of the block (`javascript` becomes `js`, and so on), and blocks without a language, as well as skipped ones, are not counted.
This is why an `eslint-disable` comment placed in the Markdown text does not reach the code inside a block.

What works instead:

- **An HTML comment right before the block** (in MDX, `{/* eslint-disable eqeqeq */}`, because HTML comments are not valid there).
  It is not rendered, and the processor moves it inside the virtual file:

  ````text
  <!-- eslint-disable eqeqeq -->

  ```js
  if (a == b) {}
  ```
  ````

  Only comments starting with `eslint` or `global ` are picked up, and they apply to the next block only.
  Anything between such a comment and the block cancels it, except blank lines and other comments of the same kind.
  `eslint-disable-next-line` points at the first line of the block, because the comment is inserted above the code.
- **An ordinary comment inside the block**: works as in any other file, but your readers see it too.
- **`<!-- eslint-skip -->` right before the block** (`{/* eslint-skip */}` in MDX): the whole next block is not linted at all.
- **The config file**, if the rule should be off in many blocks: [`markdownCodeBlocksRules.additionalDisabledRules`](#markdowncodeblocksrulesadditionaldisabledrules) for every block of every file, `overrides` of the `codeBlocks` sub-config for every block of the files that config is applied to, or an [`extraConfigs`][extraConfigs option] entry with `files` matching the virtual paths, like `['**/*.md/**/*.ts']` or `['docs/**/*.md/**']`.

Block numbers change as soon as you add or remove a block, so avoid matching them.
Name the block instead: both `@eslint/markdown` and `eslint-mdx` read the name from the opening fence.

````text
```ts filename="example.ts"
const example = 1;
```
````

Such a block becomes `README.md/3_example.ts`, so `['**/*.md/**/*_example.ts']` matches it.

Reports you may see:

- *Parsing error* in a block whose language needs its own parser, like Vue, Svelte or GraphQL.
  Blocks are ordinary files for ESLint, so such a language needs a parser set up for its extension, and the `files` patterns do not have to mention Markdown: `**/*.vue` covers `README.md/0_0.vue` as well.
  If the Config of that language is enabled, it is already done; if not, set the parser up with the [`parsing`](#parsing) root option (`parsing: {graphql: true}`), or leave such blocks out of linting with the [`ignores`][ignores option] root option (`ignores: ['**/*.md/**/*.graphql']`).
- *Unused eslint-disable directive*: the comment before a block also counts as a directive for the Markdown file itself, where it is almost always unused.
  You also see this report when the rule is already disabled in code blocks by default.
  Turn the report off for documentation files: `linterOptionsReportUnusedDisableDirectives: {ignores: ['**/*.md', '**/*.mdx']}`.
- [`eslint-comments/disable-enable-pair`](https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/disable-enable-pair.html) in MDX files, because they are parsed as code: add `{/* eslint-enable eqeqeq */}` after the block.

### Tailwind CSS

Two plugins work with Tailwind:

| Package name                                                                            | Default plugin prefix | Supported Tailwind versions (declared in `peerDependencies`) |
| --------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ |
| [`eslint-plugin-better-tailwindcss`](https://npmx.dev/eslint-plugin-better-tailwindcss) | `better-tailwindcss`  | `^3.3.0 \|\| ^4.1.17`                                        |
| [`eslint-plugin-tailwindcss`](https://npmx.dev/eslint-plugin-tailwindcss)               | `tailwindcss`         | `^4.0.0`                                                     |

We recommend the first one: it covers both Tailwind v3 and v4, has more rules, and at the time of writing it is maintained more actively.
Its prefix is long, so if it bothers you, rename it to `tailwindcss` or `tailwind` with the [`plugins.<pluginName>.prefix` option][plugins option].

### Perfectionist

Even when the `perfectionist` config is enabled, all of its rules and Sub-configs (there is one Sub-config per rule) are *off* by default.
To turn them all on, either set every Sub-config to `true`, or use this shorthand in the `perfectionist` config:

<!-- eslint-skip -->

```ts
perfectionist: {
  forceSeverity: 'error',
},
```

### Disabling rules incompatible with Prettier

The `noPrettierIncompatibleRules` config (enabled by default when `prettier` is installed) disables rules that are unnecessary or might conflict with [Prettier](https://prettier.io).
It replaces [`eslint-config-prettier`](https://npmx.dev/eslint-config-prettier), which we used before: the rule list is kept in this package, checked against what Prettier does today, and it respects [plugin prefix renames].

Rules are grouped by the language Prettier formats.
Groups for the languages Prettier can only format through an extra plugin are applied **only if that plugin is installed**:

| Group    | Applied when                          |
| -------- | ------------------------------------- |
| `svelte` | `prettier-plugin-svelte` is installed |
| `astro`  | `prettier-plugin-astro` is installed  |
| `toml`   | `prettier-plugin-toml` is installed   |

All other groups (`js`, `vue`, `json`, `yaml`, `markdown`, `html`) are always applied.
The `languages` option forces any group on or off.

<!-- eslint-skip -->

```ts
noPrettierIncompatibleRules: {
  languages: {toml: true, markdown: false},
  overrides: {
    'stylistic/indent': 'error', // keep this rule on despite Prettier
    curly: 'off', // turn off one of the Prettier-related rules we leave enabled
  },
  overridesAny: {'some-plugin/some-rule': 'off'},
},
```

## Root options

### `configs`

**Type**: `Record<string, boolean | object | [object, ...object[]]>`

Enables, disables and configures the individual Configs.
See [Rules configuration](#rules-configuration-configs-and-extraconfigs-option).

### `extraConfigs`

**Type**: `object[]`

Your own flat configs, with a richer `rules` option than ESLint's.
See [Providing user-defined flat configs][extraConfigs option].

### `files`

**Type**: `(string | string[])[]`

A list of global `files` patterns.
When it is not empty, a dedicated flat config entry is created with only these `files` (no rules and no other keys except `name`), which tells ESLint that the matched files are meant to be linted.
Use it to avoid the `File ignored because no matching configuration was supplied` error for files whose extension none of the enabled configs target.

### `parsing`

**Type**: `Record<string, boolean | object | object[]>`

The single place where every non-JS language is taught how to be parsed.

Every key produces one flat config entry per language dialect the enabled Configs asked for, so `markdown` may emit both a `gfm` and a `commonmark` entry.
The array form merges into those same entries, unless one of its elements specifies `files`; then each element gets an entry of its own.

Each key accepts:

- `false`: never parse anything as this language.
  The Configs whose rules target it stop matching any file;
- `true`: set the language up even when no enabled Config targets it, using the language's own default `files`;
- an entry object, or an array of them.

For the object and array forms:

- `files` defaults to the union of the `files` of every enabled Config whose rules are written for this language.
  For a Config that asks for the language but does not lint only its files, the language's own defaults are used instead: `parsing.tsrx` stays on `.tsrx` and `.ripple`, even though the `tsrx` Config also lints `.js` and `.ts`;
- `ignores` are added to the `ignores` of every Config that lints files of this language;
- `dialect` collapses every dialect the enabled Configs asked for into the one you name;
- `languageOptions` is merged with what the Configs contributed for this option, `parser` included: passing your own replaces the parser the dialect would have picked, and that parser is then neither loaded nor assigned.
  Both win over the defaults of the language itself, such as the Tailwind CSS syntax used for `.css` files when `tailwindcss` is installed.

### `ignores`

**Type**: `string[] | {files: string[]; override?: boolean}`

A list of globally ignored files.
It is merged with our own ignore patterns (also exported as [`DEFAULT_GLOBAL_IGNORES`](#default_global_ignores)), unless you use the object notation and set `override` to `true`.

### `extraPlugins`

**Type**: `Record<string, MaybeFn<MaybePromise<EslintPlugin>>>`

Additional ESLint plugins of your own.
Their prefixes, and where possible their rule names, show up in the `rules` types of the configs.
Like the built-in plugins, they are loaded only if they are used.

Their prefixes must not clash with the built-in ones (like `ts` or `unicorn`), nor with the prefixes you set through [`plugins.<pluginName>.prefix`][plugins option].

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

Sets [`linterOptions.{noInlineConfig,reportUnusedDisableDirectives,reportUnusedInlineConfigs}`](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects:~:text=linterOptions) globally or for certain files only.

An entry with `ignores` and no `value` reads as "turn this option off for these paths", so `{ignores: ['**/*.md']}` is enough to silence the option in Markdown files.

`reportUnusedDisableDirectives` is also inherited by the rules doing the same job where ESLint does not see the directives itself: [`vue/comment-directive`](https://eslint.vuejs.org/rules/comment-directive.html) and [`svelte/comment-directive`](https://sveltejs.github.io/eslint-plugin-svelte/rules/comment-directive).
They can only take a single severity, so only the entries applying to every file are taken into account; `off` makes them stop reporting unused directives without turning the rules themselves off, as they are what makes the directives work in the first place.
The `vue` and `svelte` configs each have a `reportUnusedDisableDirectives` option taking the same severities, which wins over the inherited one.

### `defaultConfigsStatus`

**Type**: `'all-disabled' | 'misc-enabled'`

Enables or disables many configs at once:

- `all-disabled`: treat every top-level config as disabled unless you enable it explicitly;
- `misc-enabled`: enable the configs marked `misc-enabled` in the tables above, all of which are otherwise off by default.

### `mode`

**Type**: `'app' | 'lib'`

The kind of project you are linting: an application (`app`, the default) or a library (`lib`).
It affects a handful of rules, listed in the JSDoc of this option.

### `forceSeverity`

**Type**: `Exclude<EslintSeverity, 0 | 'off'>`

Sets the severity of every rule eslint-config-un configures, including the rules it turns off.
Rules you set yourself through `overrides`, `overridesAny` or [`extraConfigs`](#extraconfigs) keep the severity you gave them.
The same option is available per config.

### `noWarnings`

**Type**: `boolean`

"Zero warnings tolerance" mode.
Disabled by default.
When enabled:

- the `warning` severity (`1`/`'warn'`) is **removed from the types** of every option that takes a severity: [`forceSeverity`](#forceseverity) (both root and per-config), the `vue` and `svelte` configs' `reportUnusedDisableDirectives`, `overrides`/`overridesAny`, `extraConfigs` rules and the `linterOptions*` options.
  Using it there is a type error;
- every `warning` severity eslint-config-un would otherwise set by default is **rewritten to `error` at runtime**, including the implicit [`linterOptions.reportUnusedDisableDirectives`](#linteroptionsnoinlineconfigreportunuseddisabledirectivesreportunusedinlineconfigs) default (which ESLint sets to `'warn'`).

### `plugins`

**Type**: `Partial<Record<Exclude<PluginPrefix, ''>, {prefix?: string; plugin?: EslintPlugin; settings?: object}>>`

Per-plugin options, keyed by the "canonical" plugin prefix.

`prefix` changes the prefix the plugin is registered under, see [Plugin prefixes][plugin prefix renames].

`plugin` replaces the plugin implementation.
This is useful when you lint the repository of one of the built-in plugins with this config and want to use its development version.

`settings` are the plugin's [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configure-shared-settings).
They are available only for the plugins that accept settings, and are typed per plugin.
They are applied only when at least one Config using that plugin is enabled, and each Config decides which `settings` property they end up under (the `eslint-plugin-clsx` settings, for instance, go to `settings.clsxOptions`), so check the option's JSDoc.
Some Configs also merge their own values in: `react`, for example, adds the detected React version.

For example: `{plugins: {'eslint-react': {prefix: 'react-x'}, regexp: {settings: {allowedCharacterRanges: 'all'}}}}`.

### `loadPluginsOnDemand`

**Type**: `boolean | {alwaysLoad: LoadablePluginPrefix[]}`

Controls whether ESLint plugins are loaded only when they are actually used (`true` by default).

The object notation lets you name the plugins that must always be loaded.
That is useful when you enable some of a plugin's rules only through [configuration comments](https://eslint.org/docs/latest/use/configure/rules#use-configuration-comments).

### `autofixDisabledGloballyFor`

**Type**: `boolean | {plugins?: Partial<Record<PluginPrefix, boolean>>; rules?: Partial<Record<FixableRuleNames, boolean>>}`

See [Globally disabling rule autofix](#globally-disabling-rule-autofix).

### `markdownCodeBlocksRules`

**Type**: `object` (see properties below)

eslint-config-un disables a number of rules in all embedded code blocks (also called "fenced code blocks") inside Markdown and MDX files.
This option lets you change which rules those are.

#### `markdownCodeBlocksRules.additionalDisabledRules`

**Type**: `Partial<Record<Exclude<UnExtraPluginsRules<ExtraPlugins> | UnAllRuleNames, RulesDisabledInEmbeddedCodeBlocksByDefault>, boolean>>`

More rules to disable in embedded code blocks.

#### `markdownCodeBlocksRules.doNotDisable`

**Type**: `Partial<Record<RulesDisabledInEmbeddedCodeBlocksByDefault, boolean>>`

Rules that should stay enabled in embedded code blocks even though we disable them by default.

### `useImportIntegrity`

**Type**: `boolean | {replaceRules?: Partial<Record<ImportPluginReplaceableRules, boolean>>}`

Replaces the implementation of a few [`eslint-plugin-import-x`] rules with the faster ones from [`import-integrity-lint`](https://npmx.dev/import-integrity-lint).
Disabled by default.
The rule names stay the same, the JSDoc lists which rules can be replaced, and the options of the replaced rules are silently ignored, because the new implementations do not support them.

The plugin's settings are set through [`plugins.import-integrity.settings`][plugins option].

### `typeInfoRules`

**Type**: `'standalone' | 'splitOnly' | 'asIs' | 'disabled' | { mode?, ignores?: string[] } & ({ allowDefaultProject?: string[] } | { parserOptions? })`

Controls how the rules that we know require type information are handled.
By default, every such rule is *automatically **moved*** into a separate ESLint config restricted to TypeScript files, where the `typescript-eslint` parser is set up for typed linting.

The mode (the string value, or the `mode` property) chooses the strategy:

- `standalone`: the split happens, and the parser, including [`projectService`](https://typescript-eslint.io/packages/parser/#projectservice), is configured in the generated config.
  This is the default when the `ts` config is **disabled**.
- `splitOnly`: the split happens, but no parser is configured: the project service is expected to come from the `parsing` root option, which the `ts` config sets up.
  This is the default when that config is **enabled**, which is the most common case.
- `asIs`: no split happens, and the rules stay in their original configs.
  Making type information available to them is up to you.
- `disabled`: no split happens, and every rule that *throws* without type information is turned off everywhere.
  Rules that only work partially without type information stay enabled.

> [!NOTE]
> The following configs are never split, so for them every mode except `disabled` behaves like `asIs`:
>
> - `ts/type-aware/*`, `vitest/ts` and `jest/ts`, because they set up type-aware linting themselves;
> - `unicorn/css`, because the split would restrict it to `**/*.ts` files, which are not the files it exists for.

The object notation additionally accepts:

- `ignores`: glob patterns excluded from type-aware linting, added to the `ignores` of every generated config and of the never-split configs above.
  Useful for TypeScript files that are not part of any `tsconfig.json`.
- `allowDefaultProject` or `parserOptions` (you cannot pass both): the default parser options for the type-aware linting we set up, which means the `standalone` split configs and, as a default, the `ts` type-aware config.
  `allowDefaultProject` is a shortcut for [`parserOptions.projectService.allowDefaultProject`](https://typescript-eslint.io/packages/parser/#allowdefaultproject).
  The `ts` config has options with the same names, and those win for the `ts` type-aware config (`allowDefaultProject` > `parserOptions` > global).

  > [!NOTE]
  > These two only take effect where a type-aware parser is actually set up: the `standalone` split configs (so only when the resolved `mode` is `standalone`), and the parser of the `ts` type-aware config whenever that config is enabled, no matter the `mode`.
  > In `asIs` and `disabled` modes they therefore matter only if the `ts` type-aware config is enabled, and in `disabled` that pairing contradicts itself, since it both turns off the throwing rules and sets up type information for them.

See the JSDoc of this option for more details.

### `baselineAvailability`

**Type**: `'widely' | 'newly' | number`

The level of [Baseline](https://web.dev/baseline) availability every `use-baseline` rule allows the features to have: `widely` (the default), `newly` or a year in which the features became newly available at the latest.
It is passed as the `available` option to [`css/use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md), [`html/use-baseline`](https://html-eslint.org/docs/rules/use-baseline), [`html-angular/use-baseline`](https://html-eslint.org/docs/angular-template/rules/use-baseline), [`html-react/use-baseline`](https://html-eslint.org/docs/react/rules/use-baseline) and [`html-svelte/use-baseline`](https://html-eslint.org/docs/svelte/rules/use-baseline).

### `packageAliases`

**Type**: `Partial<Record<(typeof PACKAGES_TO_GET_INFO_FOR)[number], string>>`

eslint-config-un checks whether certain packages are installed, and which version they are, to decide which configs, sub-configs and rules are enabled by default.
The full list of those packages is the `PACKAGES_TO_GET_INFO_FOR` constant in `src/constants.ts`, and it includes `vue`, `typescript` and `prettier`, among others.

They are looked up by their canonical npm names.
If you install one of them under a different name with an [npm alias](https://docs.npmjs.com/cli/v11/using-npm/package-spec#aliases), for example `"vue3": "npm:vue@^3.5.0"`, use this option to say which name to look for instead.
Keys are the canonical package names, values are the names the packages are installed under.

> [!NOTE]
> This option is not applicable to ESLint plugins: they are loaded by their canonical names.
> Use [`plugins.<pluginName>.plugin`][plugins option] to provide a plugin installed under an alias.

### `gitignore`

**Type**: `boolean | EslintConfigFlatGitignoreOptions`

By default, the patterns from `.gitignore` (read starting at [the current working directory]) are added to the global [`ignores`][ignores option] list.
Nested `.gitignore` files are picked up too (`recursive` defaults to `true`).
Set this option to `false` to turn that off.
You can also pass an object, which is handed to [eslint-config-flat-gitignore](https://npmx.dev/eslint-config-flat-gitignore), the package that does the actual work.

### `environment`

**Type**: `'ci' | 'editor' | 'default' | ((detected: 'ci' | 'editor' | 'default') => 'ci' | 'editor' | 'default' | null | undefined)`

Says where ESLint is being run: in CI, inside an editor, or in neither of those (`default`).

By default, the environment is detected by the [`ci-info`](https://npmx.dev/ci-info) and [`is-in-editor`](https://npmx.dev/is-in-editor) packages.
The function form receives the environment resolved so far (the value of the environment variable below if it is valid, the detected one otherwise) and can return a nullish value to keep it.

The environment can also be set through the [`ESLINT_CONFIG_UN_ENVIRONMENT`](#eslint_config_un_environment) environment variable, but the value passed to this option wins.

> [!WARNING]
> Use with care and keep the [differences between runs][] as small as you can.

### `offlineMode`

**Type**: `boolean`

Turns on "offline mode", which is handy for switching off, temporarily or not, the rules that make network requests, such as [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html).

It can also be enabled by setting the [`ESLINT_CONFIG_UN_OFFLINE_MODE`](#eslint_config_un_offline_mode) environment variable to a non-empty string, but the value passed to this option wins.

> [!WARNING]
> Use with care and keep the [differences between runs][] as small as you can.

### `cacheConfigs`

**Type**: `boolean`

Enables flat config caching.
It is on by default when the resolved [`environment`][environment option] is `editor`.
It can also be enabled by setting the [`ESLINT_CONFIG_UN_CACHE_CONFIGS`](#eslint_config_un_cache_configs) environment variable to a non-empty string, but the value passed to this option wins.

There are two layers of caching:

- In memory: the cache is kept in a global variable.
  When that variable survives between runs of the editor's ESLint process, as it does at least in VS Code, it is used instead of the file system cache.
  This layer is **very fast**.
- In the file system: the cache is written to `node_modules/.cache/eslint-config-un/config.json`.
  Here caching can fail if the config contains values that cannot be serialized, such as functions.

Either way, the cache is considered fresh for one hour, unless one of these changes:

- the current git revision (`git rev-parse HEAD`), or the ignore patterns coming from your `.gitignore` files;
- the contents of `package.json` or of the lockfile, or the package manager itself;
- the contents of the ESLint config file;
- the Node.js version;
- the resolved [`environment`][environment option] or [`offlineMode`];
- the Nuxt auto-imports data, if your project has any.

## Environment variables

All environment variables that affect eslint-config-un start with `ESLINT_CONFIG_UN_`.
Boolean ones are read through the `Boolean` constructor, so any non-empty value counts as `true`, `'0'` included.

### `ESLINT_CONFIG_UN_CACHE_CONFIGS`

See the [`cacheConfigs` option](#cacheconfigs).

### `ESLINT_CONFIG_UN_DISABLE_WARNINGS`

Do not print any warnings to the console.

### `ESLINT_CONFIG_UN_ENVIRONMENT`

See the [`environment` option][environment option].
Unlike the boolean environment variables, this one only accepts the exact values that option accepts; any other non-empty value is ignored, with a warning.

### `ESLINT_CONFIG_UN_OFFLINE_MODE`

See the [`offlineMode`] option.

## Other exports

### Main entrypoint

#### `eslintConfig`

The function that builds the config.
See [Usage](#usage).

#### `globals`

The default export of the [`globals` package](https://npmx.dev/globals), re-exported.
That package is a direct dependency of eslint-config-un, so you don't have to install it yourself.

#### `isInCi`

A boolean constant telling whether the current process is *likely* running in CI.
The answer comes from the [`ci-info` package](https://npmx.dev/ci-info).

Use it to turn rules or features on and off in CI.

> [!WARNING]
> Use with care and keep the [differences between runs][] as small as you can.

#### `isInEditor`

A function telling whether the current process is *likely* running inside an editor.
The answer comes from the [`is-in-editor` package](https://npmx.dev/is-in-editor).

Use it to turn rules or features on and off in an editor, usually to make linting faster there.

> [!WARNING]
> Use with care and keep the [differences between runs][] as small as you can.

#### `DEFAULT_GLOBAL_IGNORES`

The default list of global `ignores` patterns set by eslint-config-un.
See also the [`ignores` option][ignores option].

#### `RuleOptions`

The options type for the rules of all built-in plugins, generated by the [`eslint-typegen` package](https://npmx.dev/eslint-typegen).

### `snippets` entrypoint

#### Rule options generators

Generators for a few rule options that are tedious to write by hand:

- `forbidImportingFromUtilityLibraries` for [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports);
- `forbid$slotsInsideVueTemplates` for [`vue/no-restricted-syntax`](https://eslint.vuejs.org/rules/no-restricted-syntax.html).

See the JSDoc of each of them for the details.

#### `createNoRestricted*Rule`

Three helpers re-exported from the [`eslint-no-restricted` package](https://npmx.dev/eslint-no-restricted), which build the options of the `no-restricted-*` rules.
See [the package documentation](https://github.com/bradzacher/eslint-no-restricted/blob/HEAD/README.md) for more.

### `globs` entrypoint

Various globs you may find useful when writing the `files` or `ignores` options.

## FAQ

### How do I add my own flat configs?

Use the `extraConfigs` option.
Your configs are placed after all of eslint-config-un's configs, except the last two: the one that disables the rules incompatible with Prettier, and the one that disables the stylistic rules.
Their `rules` option is richer than ESLint's: it accepts everything `overrides` does.

You can also `await` the `eslintConfig()` call and then put your own flat configs wherever you like.
The [flat config composer from the `eslint-flat-config-utils` package](https://npmx.dev/eslint-flat-config-utils) is a good tool for that.

### Do I have to install any of the used plugins?

Some plugins are direct dependencies of this package, but most are optional peer dependencies that you install yourself.
eslint-config-un refuses to run when a config needs a plugin that is not installed.
Run ESLint with this config once to get the list of the packages you need to add.

### How do I know how eslint-config-un configures rules?

There is too much of it to write down, so have a look at the source code instead.
Every config lives in the `src/configs` directory.

### How exactly does eslint-config-un know if some package is installed?

We use the [`import-meta-resolve`](https://npmx.dev/import-meta-resolve) package to check whether a package is installed and to resolve the path to its `package.json`.

> [!WARNING]
> That package repeats the Node.js resolution algorithm, so detection can produce false positives
> whenever your setup lets you resolve packages you did not install yourself.
> With a flat `node_modules` layout, the dependencies of your own dependencies are the usual source
> of those.
>
> None of the packages we check for is reachable through eslint-config-un's own dependencies, so we
> never enable a config because of something *we* pulled in.

### How do I see which configs are enabled, which rules have their autofix disabled, and so on?

Run ESLint with the `DEBUG=eslint-config-un` environment variable set to turn on debug output.
The messages are printed by the [`obug` package](https://npmx.dev/obug), an alternative to [`debug`](https://npmx.dev/debug) with a compatible API, so see its documentation for what else you can pass there.

You can also inspect the final config with [`@eslint/config-inspector`](https://npmx.dev/@eslint/config-inspector).

## Migrating existing codebase to eslint-config-un

### Prerequisites

Make sure your Node.js and ESLint versions meet the [minimum requirements](#installation).
Don't migrate to ESLint 10 and to eslint-config-un at the same time: do the ESLint upgrade first.

### Migration guide

We recommend doing every step and sub-step below in a separate commit, on a separate git branch.
Split a step into several commits where that helps.
Before each commit, run your tests, your formatter and any other linters and tools you have, to make sure nothing is broken.

1. Dependencies:
   1. Remove **every** ESLint-related *dev* dependency: plugins, parsers, `eslint` itself, anything else.
      This makes sure eslint-config-un resolves the plugin versions it expects, and saves you from other problems that are hard to debug.
   2. Install `eslint-config-un` following [the installation instructions](#installation).
2. If your config file is a `.js` one, we strongly recommend moving to `.ts`, or at least adding the `@ts-check` directive to the JavaScript file.
   For a TypeScript config file, install [`jiti`](https://npmx.dev/jiti) so that ESLint can read it.
3. Port your existing config to the closest eslint-config-un equivalent, guided by the JSDoc of the configs and their options.
   1. Run ESLint for the first time, without `--fix`.
      It may print a list of packages to install.
      Check whether you actually need those plugins: install the ones you need, and disable the configs that ask for packages you don't want.
   2. Rules in existing [ESLint configuration comments](https://eslint.org/docs/latest/use/configure/rules#use-configuration-comments) may now have a different plugin prefix, most often `ts` instead of `@typescript-eslint`.
      Either rename them in the comments, or change the prefixes back with the [`plugins.<pluginName>.prefix` option][plugin prefix renames].
      Look for `Definition for rule '<rule name>' was not found` errors.
4. Do the following two steps in any order:
   1. Enable the stylistic rules only, and fix them automatically if you want to, by running ESLint with `--fix --fix-type problem,suggestion,layout`.
      The second flag leaves out the `directive` fix type, which is what stops ESLint from deleting `eslint-disable` comments it considers unused:

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

      **Note:** not every stylistic rule is fixable, and not every autofix is safe to apply blindly, which is why we already disable the autofix of a number of rules by default.

      Review the applied fixes carefully, and don't forget the reports that need a manual fix.
      It may help to do this in two passes: the automatic fixes first, the manual ones after.
   2. Set `configs.noStylisticRules` to `true` to turn the purely stylistic rules off, and run ESLint with the new config.
      Don't use `--fix` here: it makes it harder to see what changed, and some autofixes are not safe to apply blindly.
      Go through the whole report and:
      - decide which rules to disable, enable or reconfigure;
      - decide which `eslint-disable` comments are no longer needed and can go;
      - if some files are not part of any tsconfig but should still be covered by type-aware rules, list them in `ts.allowDefaultProject`.
        The other way around, list the files that should be left out of type-aware linting in `ts.configTypeAware.ignores`, or set `ts.configTypeAware` to `false` to turn type-aware linting off entirely;
      - add `<!-- eslint-skip -->` before the fenced code blocks in Markdown files that fail to parse;
      - deal with anything else that comes up.
5. Remove the `noStylisticRules` config and run ESLint once more, the way you normally would, to confirm everything works as intended.

## Troubleshooting & caveats

### The set of enabled rules can differ between runs

The config is built every time ESLint starts, and some of the things it is built from are outside of your config file:

- The [`environment`][environment option] (CI, an editor or neither): you can switch rules on and off depending on it, and we use it for a few defaults of our own.
- The [`offlineMode`] option: the rules that make network requests are turned off.
- The installed packages: a config needs its packages installed, and the detected framework version decides which of its rules are on.
  An install without dev dependencies changes the result, and so does the `node_modules` layout: depending on the package manager and its settings, the dependencies of your dependencies may end up next to your own, and are then [detected as installed](#how-exactly-does-eslint-config-un-know-if-some-package-is-installed) too.
- The [`cacheConfigs`](#cacheconfigs) option, on by default in editors: an earlier config is reused for up to an hour, and not every input is part of the cache key.

`eslint-disable` comments suffer from this the most.
A comment for a rule that is off in the current run is reported as *Unused eslint-disable directive*, and `--fix` deletes it.
Many editors run `--fix` on save, so the report the comment was written for comes back in the next run where the rule is on.
If the plugin is not loaded at all (see [`loadPluginsOnDemand`](#loadpluginsondemand)), you get an error instead: *Definition for rule ... was not found*.

Keep these differences as small as you can.
Where you do want them, turn the report off in the runs with fewer rules, and add `--fix-type problem,suggestion,layout` to your `--fix` commands so they don't delete such comments (editors rarely let you choose the fix types):

```ts
import {eslintConfig, isInEditor} from 'eslint-config-un';

export default eslintConfig({
  linterOptionsReportUnusedDisableDirectives: isInEditor() ? 0 : 2,
});
```

### I'm getting `The inferred type of 'default' cannot be named without a reference to './node_modules/eslint-config-un/dist/eslint.mjs'. This is likely not portable. A type annotation is necessary` kind of error when exporting the value returned by `eslintConfig()` in ESLint config file

It means TypeScript compiles that file with the [`declaration: true` flag](https://www.typescriptlang.org/tsconfig/#declaration), but cannot reach a file it needs to infer the type of the returned value.

Here are the possible fixes.

#### Do not set `declaration: true` for ESLint config file

Your ESLint config file may be included in the TypeScript project by mistake.
It may also be included in a [`composite`](https://www.typescriptlang.org/tsconfig/#composite) project, which implies `declaration: true`.
In that case, exclude the config file from the composite project if you can, and use one of the other fixes if you can't.

#### Wrap the returned value in `defineConfig` from `eslint/config`

Example:

```ts
import {defineConfig} from 'eslint/config';
import {eslintConfig} from 'eslint-config-un';

export default defineConfig(await eslintConfig(/* ... */));
```

#### Mark the export with `@internal` JSDoc annotation and set `stripInternal: true` in tsconfig

The heading describes the whole fix.
See [the TypeScript docs](https://www.typescriptlang.org/tsconfig/#stripInternal) for the details.

### I'm getting an error or a warning from pnpm about the ignored `unrs-resolver` build script

Depending on your pnpm settings, installing eslint-config-un may print a banner or an error asking you to do something about the build script of the `unrs-resolver` package.
That package is a transitive dependency of ours, and at the time of writing [its build script only installs `optionalDependencies` for old npm versions](https://github.com/unrs/unrs-resolver/issues/193), so under pnpm it can, and should, stay ignored.

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace

Install the `globals` package as a dev dependency.

### Some dependencies are inlined into the package code

If you don't want to wait for us to update a dependency, or need a different version of one for any other reason, your package manager's overrides will do the job for every dependency except these three, whose code is inlined into the published package:

| Package name                                                                                         | Reason                                                                                                                   |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [`eslint-plugin-prettier`][eslint-plugin-prettier]                                                   | Patched by us so that it can format fenced code blocks inside Markdown files                                             |
| [`eslint-plugin-arrow-return-style-x`][eslint-plugin-arrow-return-style-x]                           | Its `@typescript-eslint/utils` dependency is overridden to a version that works with ESLint 10                           |
| [`@eslint-community/eslint-plugin-eslint-comments`][@eslint-community/eslint-plugin-eslint-comments] | [Crashes](https://github.com/eslint-community/eslint-plugin-eslint-comments/issues/322) under Yarn Plug'n'Play otherwise |

## Versioning policy

`eslint-config-un` wraps 100+ ESLint plugins and updates them continuously.
To keep major bumps meaningful and rare, we follow standard SemVer with the clarifications below.

**Breaking changes (major bump):**

- Incompatible changes to the options object accepted by `eslintConfig()`: removing or renaming an option, narrowing its type, changing its default value, or adding a required option
- Removing or renaming a named export or an entry point (`.`, `./snippets`, `./globs`)
- Changing the default prefix of any built-in plugin (for example, `yml` to `yaml`)
- Raising the minimum ESLint or Node.js version
- A config that was enabled by default becoming disabled by default
- A plugin moving from a direct dependency to an optional peer dependency
- Removing or renaming a rule of the built-in `eslint-plugin-un`, or changing its default options or schema in an incompatible way

**Not breaking:**

- Changes in lint output, meaning more or fewer errors and warnings, because this package continuously updates 100+ plugins, many of them optional peer dependencies whose installed version you control
- Third-party plugin updates absorbed in the same release: added rules, removed rules, schema changes and so on
- Changes to the shape of the generated ESLint flat config, such as entry names or the order of rules and configs, which are internal details
- Additive API changes: a widened type, a new optional option, a new named export, a new `eslint-plugin-un` rule
- Changes to the exported `RuleOptions` type, which is best-effort and informational rather than a stable contract

There is no fixed release cadence for major versions: one goes out when enough breaking changes have accumulated.
Non-breaking improvements ship continuously as minor and patch releases of the current stable major.

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

[@eslint-community/eslint-plugin-eslint-comments]: https://npmx.dev/@eslint-community/eslint-plugin-eslint-comments

[`offlineMode`]: #offlinemode

[the current working directory]: https://nodejs.org/api/process.html#processcwd

[eslint-plugin-arrow-return-style-x]: https://npmx.dev/eslint-plugin-arrow-return-style-x

[plugin prefix renames]: #plugin-prefixes-pluginspluginnameprefix-option
[plugins option]: #plugins

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
[MDX]: ./assets/vscode-icons-file-type-mdx.svg
[ReactJS]: ./assets/devicon-react.svg
[Svelte]: ./assets/devicon-svelte.svg
[TailwindCSS]: ./assets/devicon-tailwindcss.svg
[Testing Library]: ./assets/logos-testing-library.svg
[TypeScript]: ./assets/devicon-typescript.svg
[VueJS]: ./assets/devicon-vuejs.svg
[`eslint-plugin-import-x`]: https://npmx.dev/eslint-plugin-import-x
[eslint-plugin-import-x]: https://npmx.dev/eslint-plugin-import-x
[eslint-plugin-no-only-tests]: https://npmx.dev/eslint-plugin-no-only-tests
[differences between runs]: #the-set-of-enabled-rules-can-differ-between-runs
[environment option]: #environment
[extraConfigs option]: #providing-user-defined-flat-configs
[ignores option]: #ignores
[eslint-plugin-prettier]: https://npmx.dev/eslint-plugin-prettier
[npm]: ./assets/devicon-npm.svg
[pnpm]: ./assets/devicon-pnpm.svg
[Zod]: ./assets/logos-zod.svg
