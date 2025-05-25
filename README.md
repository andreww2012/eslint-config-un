# eslint-config-un [![npm](https://img.shields.io/npm/v/eslint-config-un)](https://npmjs.com/eslint-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable.

## Features

- **Every major plugin** is included (50+ in total): 
[![JavaScript](./assets/devicon-javascript.svg) Vanilla JS rules](https://eslint.org/docs/latest/rules),
[![TypeScript](./assets/devicon-typescript.svg) typescript-eslint](https://typescript-eslint.io/rules),
[🦄unicorn](https://npmjs.com/eslint-plugin-unicorn),
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
- **Works great with Prettier**: conflicting rules are disabled if you use Prettier.
- **Rename plugin prefixes** easily if you would like to.

## Installation

Minimum supported versions:
- NodeJS: 20.10 or 21.1
- ESLint: 9.15.0 (peer dependency)

```shell
npm i -D eslint-config-un eslint@latest
pnpm i -D eslint-config-un eslint@latest
yarn add -D eslint-config-un eslint@latest
```

All the used plugins are direct dependencies of this package, you don't need to install them separately. We aim to update the dependencies within 1 month after their release.

### Usage

In your `eslint.config.ts`:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // ... optional configuration ...
});
```

<!-- eslint-disable-next-line markdown/no-missing-label-refs -->
> [!NOTE]
> We highly recommend using TypeScript config file, which is supported since eslint v9.18.0, or [`@ts-check` directive](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html#ts-check) at the start of the file otherwise.

## List of configs

eslint-config-un has a concept of Configs and Sub-configs. They are similar to ESLint flat config objects, but not the quite the same.

You can enable any Config by setting it to `true` or an object with the Config's options. Passing `false` disables the Config.

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

      [customOptions: string]: unknown; // Custom config options, individual for each config
    };

type Severity = 0 | 1 | 2 | 'off' | 'warn' | 'error';
```

- The Config is usually tied to a one or more ESLint plugins and produces one or more ESLint flat config objects.
- Sub-configs are the same as Configs, but configured within Config options. All Sub-configs use `configXXX` naming convention.
- After evaluating all the flat configs, eslint-config-un will **load only those plugins that were actually used**, unless `loadPluginsOnDemand` option is set to `false`.
- `files` is an array of file globs to which this Config will be applied. If you specify an empty array `[]`, the Config **will be disabled**, but not its Sub-configs.
- `ignores` is exactly the same as ESLint's `ignores`.
- `overrides`/`overridesAny` is similar to ESLint's `rules`, but with a very important advantage: you can provide a function that will be called with the rule severity and options set by eslint-config-un, which allows you to **granularly override the options** or change the severity of each rule.
- The only difference between `overrides` and `overridesAny` is that `overridesAny` will allow any rule to be overridden (from TypeScript's stand point; technically you can pass any rule to `overrides` too), while `overrides` will only allow those rules which are tied to the config.
- `overridesAny` will be applied **after** `overrides`.
- `forceSeverity` allows to bulk override the severity of all the rules not overridden via `overrides` or `overridesAny`.
</details>

<br>

Sub-config is a Config located within Config's options. If the parent config is disabled, all its Sub-configs are disabled too. In the following table, Sub-configs have `/` in their names.

### Most popular and well known

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| ![JavaScript](./assets/devicon-javascript.svg) `js`                 | ✅ | [Vanilla ESLint rules](https://eslint.org/docs/latest/rules) | - |
| ![TypeScript](./assets/devicon-typescript.svg) `ts`                 | ✅ | [typescript-eslint](https://npmjs.com/typescript-eslint) (`ts`) | Only rules **not** requiring type information. |
| ![TypeScript](./assets/devicon-typescript.svg) `ts/typeAware`       | ✅ | ^ | Only rules requiring type information. |
| ![TypeScript](./assets/devicon-typescript.svg) `ts/noTypeAssertion` | ✅ | [eslint-plugin-no-type-assertion](https://npmjs.com/eslint-plugin-no-type-assertion) (`no-type-assertion`) | - |
| 🦄 `unicorn`                                                       | ✅ | [eslint-plugin-unicorn](https://npmjs.com/eslint-plugin-unicorn) (`unicorn`) | - |
| ⭐ `regexp`                                                         | ✅ | [eslint-plugin-regexp](https://npmjs.com/eslint-plugin-regexp) (`regexp`) | - |
| `promise`                                                           | ✅ | [eslint-plugin-promise](https://npmjs.com/eslint-plugin-promise) (`promise`) | - |
| `import`                                                            | ✅ | [eslint-plugin-import-x](https://npmjs.com/eslint-plugin-import-x) (`import`) | - |
| `sonarjs`                                                           | ✅ | [eslint-plugin-sonarjs](https://npmjs.com/eslint-plugin-sonarjs) (`sonarjs`) | - |
| `eslintComments`                                                    | ✅ | [@eslint-community/eslint-plugin-eslint-comments](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments) (`@eslint-community/eslint-comments`) | Since v0.1.3 |
| `jsdoc`                                                             | ✅ | [eslint-plugin-jsdoc](https://npmjs.com/eslint-plugin-jsdoc) (`jsdoc`) | Since v0.3.1 |
| `jsdoc/typescript`                                                  | ✅ (`ts` config is enabled) | - | Config for disabling or disabling certain rules for TypeScript files |

### Web frameworks & related

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| ![VueJS](./assets/devicon-vuejs.svg) `vue`                  | ✅ (`vue` is installed) | [eslint-plugin-vue](https://npmjs.com/eslint-plugin-vue) (`vue`) | - |
| ![VueJS](./assets/devicon-vuejs.svg) `vue/a11y`             | ✅ | [eslint-plugin-vuejs-accessibility](https://npmjs.com/eslint-plugin-vuejs-accessibility) (`vuejs-accessibility`) | - |
| ![Pinia](./assets/logos-pinia.svg) `vue/pinia`              | ✅ | [eslint-plugin-pinia](https://npmjs.com/eslint-plugin-pinia) (`pinia`) | - |
| ![Angular](./assets/devicon-angular.svg) `angular`          | ✅ (`@angular/core` is installed) | [@angular-eslint/eslint-plugin](https://npmjs.com/@angular-eslint/eslint-plugin) (`@angular-eslint`) | Since v0.78.0 |
| ![Angular](./assets/devicon-angular.svg) `angular/template` | ✅ | [@angular-eslint/eslint-plugin/template](https://npmjs.com/@angular-eslint/eslint-plugin/template) (`@angular-eslint/template`) | - |
| ![ReactJS](./assets/devicon-react.svg) `react`              | ✅ (`react` is installed) | [eslint-plugin-react](https://npmjs.com/eslint-plugin-react) (`react`) | Since v0.8.0 |
| ![ReactJS](./assets/devicon-react.svg) `react/reactX`       | ✅ | [@eslint-react/eslint-plugin](https://npmjs.com/@eslint-react/eslint-plugin) (`@eslint-react`) | - |
| ![ReactJS](./assets/devicon-react.svg) `react/hooks`        | ✅ | [eslint-plugin-react-hooks](https://npmjs.com/eslint-plugin-react-hooks) (`react-hooks`)<br>[@eslint-react/eslint-plugin](https://npmjs.com/@eslint-react/eslint-plugin) (`@eslint-react`) | Includes rules with `@eslint-react/hooks-extra` prefix from `@eslint-react/eslint-plugin` |
| ![ReactJS](./assets/devicon-react.svg) `react/dom`          | ✅ (`react-dom` is installed) | [@eslint-react/eslint-plugin](https://npmjs.com/@eslint-react/eslint-plugin) (`@eslint-react`)<br>[eslint-plugin-react](https://npmjs.com/eslint-plugin-react) | Includes rules with `@eslint-react/dom` prefix from `@eslint-react/eslint-plugin` and DOM related rules from `eslint-plugin-react` |
| ![ReactJS](./assets/devicon-react.svg) `react/refresh`      | ✅ | [eslint-plugin-react-refresh](https://npmjs.com/eslint-plugin-react-refresh) (`react-refresh`) | - |
| ![ReactJS](./assets/devicon-react.svg) `react/compiler`     | ✅ (if React version is at least 19) | [eslint-plugin-react-compiler](https://npmjs.com/eslint-plugin-react-compiler) (`react-compiler`) | - |
| ![ReactJS](./assets/devicon-react.svg) `react/allowDefaultExportsInJsxFiles`     | ✅ | - | Config that allows default exports in all JSX files |
| ![NextJS](./assets/devicon-nextjs.svg) `nextJs`             | ✅ (`next` is installed) | [@next/eslint-plugin-next](https://npmjs.com/@next/eslint-plugin-next) (`@next/next`) | Since v0.9.0 |
| ![SolidJS](./assets/devicon-solidjs.svg) `solid`            | ✅ (`solid-js` is installed) | [eslint-plugin-solid](https://npmjs.com/eslint-plugin-solid) (`solid`) | Since v0.10.0 |
| ![SolidJS](./assets/devicon-qwik.svg) `qwik`                | ✅ (`@builder.io/qwik` or `@qwik.dev/core` is installed) | [eslint-plugin-qwik](https://npmjs.com/eslint-plugin-qwik) (`qwik`) | Since v0.6.0 |
| ![Astro](./assets/devicon-astro.svg) `astro`                | ✅ (`astro` is installed) | [eslint-plugin-astro](https://npmjs.com/eslint-plugin-astro) (`astro`) | Since v0.9.0<br>Without A11Y rules |
| ![Astro](./assets/devicon-astro.svg) `astro/jsxA11y`        | ✅ | ^ | Only A11Y rules from `eslint-plugin-astro` |
| ![Svelte](./assets/devicon-svelte.svg) `svelte`             | ✅ (`svelte` is installed) | [eslint-plugin-svelte](https://npmjs.com/eslint-plugin-svelte) (`svelte`) | Since v0.10.0 |
| ![TailwindCSS](./assets/devicon-tailwindcss.svg) `tailwind` | ✅ (`tailwindcss` is installed) | [eslint-plugin-tailwindcss](https://npmjs.com/eslint-plugin-tailwindcss) (`tailwindcss`) | - |

### Runtimes & related

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| ![NodeJS](./assets/devicon-nodejs.svg) `node`                                    | ✅ | [eslint-plugin-n](https://npmjs.com/eslint-plugin-n) (`node`) | - |
| ![npm](./assets/devicon-npm.svg) `packageJson`                                   | ❌ | [eslint-plugin-package-json](https://npmjs.com/eslint-plugin-package-json) (`package-json`) | Since v0.1.5 |
| ![npm](./assets/devicon-npm.svg) `nodeDependencies`                              | ❌ | [eslint-plugin-node-dependencies](https://npmjs.com/eslint-plugin-node-dependencies) (`node-dependencies`) | Since v0.10.0 |
| ![npm](./assets/devicon-npm.svg) `depend`                                        | ❌ | [eslint-plugin-depend](https://npmjs.com/eslint-plugin-depend) (`depend`) | Since v1.0.0 |
| ![pnpm](./assets/devicon-pnpm.svg) `pnpm`                                        | ✅ (pnpm is detected as a package manager) | [eslint-plugin-pnpm](https://npmjs.com/eslint-plugin-pnpm) (`pnpm`) | Since v0.8.0<br>Does nothing, split into sub-configs |
| ![pnpm](./assets/devicon-pnpm.svg) `pnpm/packageJson`                            | ✅ | ^ | Plugin rules related to `package.json` files |
| ![pnpm](./assets/devicon-pnpm.svg) `pnpm/pnpmWorkspace`                          | ✅ | ^ | Plugin rules related to `pnpm-workspace.yaml` file |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions`    | ❌ | - | Since v0.10.0<br>For linting [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html) written for JavaScript Runtime v2 |
| ![AWS](./assets/devicon-amazonwebservices-wordmark.svg) `cloudfrontFunctions/V1` | ❌ | - | Same, but for JavaScript Runtime v1 functions |

### Languages

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| ![Markdown](./assets/mdi-language-markdown.svg) `markdown`                        | ✅ | [@eslint/markdown](https://npmjs.com/@eslint/markdown) (`markdown`) | Since v0.7.0<br>Configured to also lint fenced code blocks |
| ![Markdown](./assets/mdi-language-markdown.svg) `markdown/formatFencedCodeBlocks` | ✅ (`prettier` is installed) | [eslint-plugin-prettier](https://npmjs.com/eslint-plugin-prettier) (`prettier`) | Since v1.0.0<br>Format fenced code blocks inside Markdown files using Prettier |
| ![CSS](./assets/devicon-css3.svg) `css`                                           | ✅ (unless `stylelint` is installed) | [@eslint/css](https://npmjs.com/@eslint/css) (`css`) | Since v0.7.0 |
| ![CSS](./assets/devicon-css3.svg) `cssInJs`                                       | ✅ | [eslint-plugin-css](https://npmjs.com/eslint-plugin-css) (`css-in-js`) | Since v0.2.0<br>Lints inlined CSS |
| `jsxA11y`                                                                         | ✅ | [eslint-plugin-jsx-a11y](https://npmjs.com/eslint-plugin-jsx-a11y) (`jsx-a11y`) | Since v0.8.0 |
| ![YAML](./assets/devicon-yaml.svg) `yaml`                                         | ❌ | [eslint-plugin-yaml](https://npmjs.com/eslint-plugin-yaml) (`yaml`) | Since v0.1.0 |
| ![JSON](./assets/devicon-json.svg) `jsonc`                                        | ❌ | [eslint-plugin-jsonc](https://npmjs.com/eslint-plugin-jsonc) (`jsonc`) | Since v0.1.4<br>Supports JSON, JSON5, JSONC |
| `jsonc/json`                                                                      | ❌ | ^ | Config exclusively for `.json` files, does nothing by default |
| `jsonc/jsonc`                                                                     | ❌ | ^ | Config exclusively for `.jsonc` files, does nothing by default |
| `jsonc/json5`                                                                     | ❌ | ^ | Config exclusively for `.json5` files, does nothing by default |
| `jsonSchemaValidator`                                                             | ❌ | [eslint-plugin-json-schema-validator](https://npmjs.com/eslint-plugin-json-schema-validator) (`json-schema-validator`) | Since v0.6.0 |
| ![TOML](./assets/tabler-toml.svg) `toml`                                          | ❌ | [eslint-plugin-toml](https://npmjs.com/eslint-plugin-toml) (`toml`) | Since v0.1.3 |
| ![HTML](./assets/devicon-html5.svg) `html`                                        | ✅ | [@html-eslint/eslint-plugin](https://npmjs.com/@html-eslint/eslint-plugin) (`@html-eslint`) | Since v0.10.0 |
| ![GraphQL](./assets/logos-graphql.svg) `graphql`                                  | ✅ (`graphql` is installed) | [@graphql-eslint/eslint-plugin](https://npmjs.com/@graphql-eslint/eslint-plugin) (`graphql`) | Since v1.0.0 |

### JS/TS - Miscellaneous

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| `security`                   | ❌ | [eslint-plugin-security](https://npmjs.com/eslint-plugin-security) (`security`) | - |
| `unusedImports`              | ❌ | [eslint-plugin-unused-imports](https://npmjs.com/eslint-plugin-unused-imports) (`unused-imports`) | Since v0.7.0 |
| `unusedImports/noUnusedVars` | ❌ | ^ | Disables [`no-unused-vars`](https://eslint.org/docs/latest/rules/no-unused-vars), [`ts/no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars) and [`sonarjs/no-unused-vars`](https://sonarsource.github.io/rspec/#/rspec/S1481/javascript) rules in favor of `unused-imports/no-unused-vars` |
| `prefer-arrow-functions`     | ❌ | [eslint-plugin-prefer-arrow-functions](https://npmjs.com/eslint-plugin-prefer-arrow-functions) (`prefer-arrow-functions`) | Since v0.1.0 |
| `perfectionist`              | ❌ | [eslint-plugin-perfectionist](https://npmjs.com/eslint-plugin-perfectionist) (`perfectionist`) | Since v0.4.0 |
| `de-morgan`                  | ❌ | [eslint-plugin-de-morgan](https://npmjs.com/eslint-plugin-de-morgan) (`de-morgan`) | Since v0.5.0 |
| `es`                         | ❌ | [eslint-plugin-es-x](https://npmjs.com/eslint-plugin-es-x) (`es-x`) | Since v0.10.0 |
| `jsInline`                   | ✅ | [eslint-plugin-html](https://npmjs.com/eslint-plugin-html) (`html`) | Since v0.10.0<br>For linting inlined JS in HTML files |
| `math`                       | ✅ | [eslint-plugin-math](https://npmjs.com/eslint-plugin-math) (`math`) | Since v1.0.0 |
| `erasableSyntaxOnly`         | ❌ | [eslint-plugin-erasable-syntax-only](https://npmjs.com/eslint-plugin-erasable-syntax-only) (`erasable-syntax-only`) | Since v1.0.0 |

### Libraries

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| `jest`            | ✅ (`jest` is installed) | [eslint-plugin-jest](https://npmjs.com/eslint-plugin-jest) (`jest`) | Since v0.3.0 |
| `jest/extended`   | ✅ (`jest-extended` is installed) | [eslint-plugin-jest-extended](https://npmjs.com/eslint-plugin-jest-extended) (`jest-extended`) | - |
| `jest/typescript` | ✅ (`ts` config is enabled) | [eslint-plugin-jest](https://npmjs.com/eslint-plugin-jest) (`jest`) | Only TypeScript-specific rules from `eslint-plugin-jest` |
| `vitest`          | ✅ (`vitest` is installed) | [@vitest/eslint-plugin](https://npmjs.com/@vitest/eslint-plugin) (`vitest`) | Since v0.3.0 |

### Miscellaneous

| Un config name | Enabled by default?<br>(optional condition) | Primary plugin(s) (`default-prefix`) | Description/Notes |
| -------------- | ------------------------------------------- | ------------------------------------ | ----------------- |
| `casePolice`   | ❌ | [eslint-plugin-case-police](https://npmjs.com/eslint-plugin-case-police) (`case-police`) | Since v0.9.0 |

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

You can provide your own configs by using `extraConfigs` option. The provided configs will be placed after all the eslint-config-un's configs, and before the config which disables Prettier incompatible rules for all files.

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

ESLint plugins are registered with an arbitrary user-provided prefix, such as `unicorn` or `vue`. Then the rule name are formed by combining the prefix with the rule name, for example `unicorn/no-useless-undefined`.

eslint-config-un provides the ability to change any registered plugin prefix. Additionally, some plugins are registered with a different prefix than their documentation suggests. If you would like to rename them back or rename some other plugins, you can use `pluginRenames` option, which is a map from the "canonical" prefixes to the user defined ones.

#### Default renames

| Plugin                                                               | Suggested prefix     | Our prefix  | Reason                                                                                                               |
| -------------------------------------------------------------------- | -------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| [`typescript-eslint`](https://npmjs.com/typescript-eslint)           | `@typescript-eslint` | `ts`        | More concise and convenient to use                                                                                   |
| [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) | `import-x`           | `import`    | This plugin is a fork and is meant to replace the original plugin with `import` prefix                               |
| [`eslint-plugin-n`](https://npmjs.com/eslint-plugin-n)               | `n`                  | `node`      | Same ^                                                                                                               |
| [`eslint-plugin-css`](https://npmjs.com/eslint-plugin-css)           | `css`                | `css-in-js` | Conflicts with [`@eslint/css`](https://npmjs.com/@eslint/css) and our name better captures the essence of the plugin |

<!-- eslint-disable-next-line markdown/no-missing-label-refs -->
> [!NOTE]
> If you rename a plugin, you still have to use the original prefix within `overrides`, `overridesAny` and `extraConfigs`. eslint-config-un will rename the rules accordingly for you.

<!-- eslint-disable-next-line markdown/no-missing-label-refs -->
> [!WARNING] Renaming plugins and `eslint-disable` directives
> If you rename a plugin, you will have to manually rename the rules within `eslint-disable-*` directives.

### Disabling rule autofix

ESLint [doesn't (yet?) have the ability to disable autofix](https://github.com/eslint/rfcs/pull/125) for a rule by the user on per-rule basis. Our config attempts to provide this missing functionality by providing the limited ability to disable autofix for a rule as a whole or per-file and per-rule basis, but with a caveat that the rule will have `disable-autofix` prefix in its name. Additionally, we disable autofix for some rules by default, the list of which is available below.

To disable autofix for a rule, use an object notation for the rule entry:

```ts
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    unicorn: {
      overrides: {
        'unicorn/better-regex': {
          severity: 2,
          disableAutofix: 'prefixed', // or `unprefixed` or `true`/`false`
        },
      },
    },
  },
});
```

* `unprefixed`: will disable autofix without changing the name of the rule, but it will be disabled for **all** files.
* `prefixed`: will create a plugin with `disable-autofix` prefix and copy this rule into it. The final rule is going to be `disable-autofix/<rule-name>` and `<rule-name>` will be disabled in the resulting flat config.
* `true`: use the default autofix disabling method, determined in `disableAutofixMethod.default` root option, which defaults to `unprefixed`.
* `false`: re-enable autofix for the rule (does nothing if autofix for this rule is disabled anywhere else with `unprefixed` method).

## Configs notes

### TypeScript

Rules [requiring type information](https://typescript-eslint.io/rules/?=typeInformation), which are [known to be performance-demanding](https://typescript-eslint.io/getting-started/typed-linting/#performance), are *enabled* by default, and will be applied to the same files as `ts` config is applied to. It's just a little heads up; you should make your own decision whether to keep them enabled. Use `configTypeAware` to control to which files such rules will be applied to, if any.

### Frontend frameworks

We detect the version of the used frontend framework (Angular, Vue, Svelte, etc.) and apply the appropriate rules depending on the version. You can always manually specify the version using an appropriate option. Consult JSDoc of each config for more details.

#### Vue

By default, TypeScript rules will be enabled in `.vue` files if `enforceTypescriptInScriptSection` is set to true in vue's config options which in turn is *automatically* set to true if `ts` config is enabled. If you have `.vue` files authored in both TypeScript and JavaScript, use `enforceTypescriptInScriptSection.{files,ignores}` to manually specify TS & JS Vue components respectively. It is not currently possible to apply different ESLint rules depending on the value of `lang` attribute of `<script>` SFC section.

#### Angular

We support Angular versions from 13 to 19, all at once. This is achieved by generating an ESLint plugin specifically for the detected Angular version. Internally, `@angular-eslint/eslint-plugin` of versions 19 and 18, and `@angular-eslint/eslint-plugin-template` of versions 17 and 19 are used. We smartly enable the appropriate rules for each Angular version.

With this approach, we offer a unique ability to port the rules added in newer versions of `@angular-eslint/eslint-plugin*` and use them with older rules on older Angular codebases. Use `portRules` option to control which rules will be ported.

#### React

We use rules from several plugins to lint your React code. You will be able to choose whether you would like to use only `eslint-plugin-react` or `@eslint-react/eslint-plugin`, or both, which is the default.

### Markdown

If `markdown` config is enabled (which is the default), the same rules provided by other configs will be applied to code blocks (\```lang ... \```) inside Markdown files. This works because under the hood the plugin [`@eslint/markdown`](https://npmjs.com/@eslint/markdown) that provides that functionality will create virtual files for each code block with the same extension as specified after ```.

But applying certain rules for code blocks might not be desirable because some of them are too strict for the code that won't be executed anyway or even unfixable (like missing imports). You can find the full list of disabled rules in `src/configs/markdown.ts` file.

## Other root options

### `ignores`

Specifies a list of globally ignored files. By default will be merged with our ignore patterns, unless `overrideIgnores` is set to `true`.

### `overrideIgnores`

Set to `true` if you don't want `ignores` to be merged with our ignore patterns, which are `['**/dist']`.

### `gitignore`

By default `.gitignore`d files will be added to `ignores` list. Set to `false` to disable this behavior. You may also provide an object which configures [eslint-config-flat-gitignore](https://npmjs.com/eslint-config-flat-gitignore), which provides this functionality in the first place. 

### `mode`

Type of your project, either application (`app`, default) or library (`lib`). Will affect certain rules, actual list of which is written in JSDoc of this option.

### `disablePrettierIncompatibleRules`

Disables rules that are potentially conflicting with Prettier. [`eslint-config-prettier`](https://npmjs.com/eslint-config-prettier) is used under the hood, with a few exceptions. Defaults to `true` if `prettier` package is installed.

### `forceSeverity`

Globally forces non-zero severity of all the rules configured by eslint-config-un (i.e. not within `overrides`, `overridesAny` or `extraConfigs`). This can also be configured per-config.

## FAQ

### How do I add my own flat configs?

Use `extraConfigs` option. The configs provided there will be placed after all the eslint-config-un's configs, and before the config which disables Prettier incompatible rules for all files. These configs have a richer `rules` option, which allows you to apply more settings like `overrides` option does.

Alternatively, you can `await` the `eslintConfig()` function and then add your own flat configs to whatever place you like (we recommend use [flat config composer from `eslint-flat-config-utils` package](https://npmjs.com/eslint-flat-config-utils)) for this purpose.

### Do I have to install any of the used plugins?

No! All the used plugins are direct dependencies of this package, you don't need to install them separately. We aim to update the dependencies within 1 month after their release. If anything, you can always override the dependency version using your package manager settings. Although, this might not be safe because we generate types for specific versions of the plugins, so the actual options of the rules might be different.

### How do I know how eslint-config-un configures rules?

It's too much to document, so please have a look at the source code of our config. All the configs are placed inside `src/configs` directory.

### How does exactly eslint-config-un knows if some package is installed?

We use [`local-pkg`](https://npmjs.com/local-pkg) package to detect if a package is installed.

## Troubleshooting

### TypeError: Key `languageOptions`: Key `globals`: Global `AudioWorkletGlobalScope ` has leading or trailing whitespace.

Install `globals` package as a dev dependency.