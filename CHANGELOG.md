## Unreleased

- [**BREAKING**] Disabled `vitest/prefer-to-be-{falsy,truthy}` rules since their fixes don't result in the equivalent code and therefore cannot be suitable for most projects.
- [**BREAKING**] Set [`enforceForIfStatements: false`](https://eslint.org/docs/latest/rules/logical-assignment-operators#enforceforifstatements) for `logical-assignment-operators` since code enforced by this option might be harder to read and understand.
- Added a fully typed `node` config option to specify `eslint-plugin-n` plugin settings.
- For `jest` and `vitest` configs, an option `testDefinitionKeyword` now accepts a string that is used to set [all the properties of the object](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/consistent-test-it.md#options).
- For Vue files virtual files for `<style>` blocks are now created via [`eslint-processor-vue-blocks`](https://www.npmjs.com/package/eslint-processor-vue-blocks). Added an option to disable or customize this behavior.

## 0.5.0

- [**BREAKING**] All used ESLint plugins are now loaded unconditionally, allowing the use of any of their rules without requiring that the corresponding config is enabled.
- Abandon [`eslint-plugin-disable-autofix`](https://www.npmjs.com/package/eslint-plugin-disable-autofix) in favor of manually adding the same functionality.
- [**BREAKING**] Disabled autofix for [`no-unnecessary-type-assertion`](https://typescript-eslint.io/rules/no-unnecessary-type-assertion/) due to [this bug](https://github.com/typescript-eslint/typescript-eslint/issues/8721).
- New config: `deMorgan` via [`eslint-plugin-de-morgan`](https://www.npmjs.com/package/eslint-plugin-de-morgan), **<u>disabled</u>** by default.

### Dependencies

- `eslint-plugin-unicorn`: 56.0.1 -> 57.0.0
  - [**BREAKING**] Claims to support only `eslint`>=9.20.0, but we haven't enforced this version range in `peerDependencies` in case it works fine with the older versions.
  - ESM only now.
  - ❌ (deprecated) `no-instanceof-builtins`
  - 🟡 (warns) [`consistent-assert`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-assert.md)
  - 🟢 (enabled) [`consistent-date-clone`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-date-clone.md)
  - 🟢 [`no-accessor-recursion`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-accessor-recursion.md)
  - 🟢 [`no-instanceof-builtins`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-instanceof-builtins.md)
  - 🟢 [`no-named-default`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-named-default.md)
- `@vitest/eslint-plugin`: 1.1.28 -> 1.1.31
- `eslint-import-resolver-typescript`: [3.7.0 -> 3.8.3](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.7.0...v3.8.3)
- `eslint-plugin-perfectionist`: 4.8.0 -> 4.9.0
- `eslint-plugin-sonarjs`: 3.0.1 -> 3.0.2
- `eslint-plugin-yml`: 1.16.0 -> 1.17.0
- `@stylistic/eslint-plugin`: 3.1.0 -> 4.0.1
  - ESM only now.
- `typescript-eslint`: 8.24.0 -> 8.24.1
- `eslint-config-flat-gitignore`: [2.0.0 -> 2.1.0](https://github.com/antfu/eslint-config-flat-gitignore/compare/v2.0.0...v2.1.0)

## 0.4.2

- New config: `cli` to disable a few rules for files in `bin`, `scripts` and `cli` directories, enabled by default.
- `jest`/`vitest`: by default include nested `__test(s)__` directories and `[-_].spec.*` files.
- `sonar`: change `prefer-single-boolean-return` default severity to `warn`.

### Dependencies
- `typescript-eslint`: 8.20.0 -> 8.24.0
  - [`no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition): change `allowConstantLoopConditions` from `true` to [`only-allowed-literals`](https://typescript-eslint.io/rules/no-unnecessary-condition/#only-allowed-literals)
- `@eslint/markdown`: 6.2.1 -> 6.2.2
- `@stylistic/eslint-plugin`: 2.13.0 -> 3.1.0
- `@vitest/eslint-plugin`: 1.1.25 -> 1.1.28
  - 🟡 (warns) [`require-mock-type-parameters`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-mock-type-parameters.md)
  - 🔴 (off) [`prefer-strict-boolean-matchers`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-boolean-matchers.md)
- `eslint-config-flat-gitignore`: 1.0.0 -> 2.0.0
- `eslint-merge-processors`: 1.0.0 -> 2.0.0
- `eslint-plugin-jsdoc`: 50.6.2 -> 50.6.3
- `eslint-plugin-jsonc`: 2.18.2 -> 2.19.1
- `eslint-plugin-package-json`: 0.20.0 -> 0.26.0
  - 🟢 (enabled) [`no-empty-fields`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/no-empty-fields.md)
  - 🟢 [`require-version`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-version.md)
  - 🟢 [`require-name`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-name.md)
  - 🔴 (off) [`require-author`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-author.md)
  - 🔴 (off) [`require-keywords`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-keywords.md)
  - 🔴 (off) [`require-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-files.md)
- `eslint-plugin-perfectionist`: 4.6.0 -> 4.8.0

## 0.4.1

- In `typescript` config, setting `filesTypeAware: false` now fully disables the config for running type-aware rules. Same if an empty array is provided.
- Added the ability to disable running type-aware rules (or even any TypeScript rules) on the files specified in `enforceTypescriptInScriptSection` option.
- Exposed `isInEditor` utility from `is-in-editor` package that checks if the current process is running within a well known editor.

### Dependencies
- `@stylistic/eslint-plugin`: 2.12.1 -> 2.13.0
- `typescript-eslint`: 8.19.1 -> 8.20.0
  - Enabled a new [`no-misused-spread`](https://typescript-eslint.io/rules/no-misused-spread) rule.
- `eslint-config-prettier`: 9.1.0 -> 10.0.1
  - In v10, `@stylistic/eslint-plugin` is supported, which disables some of `@stylistic/*` rules.
- `eslint-plugin-jest`: 28.10.0 -> 28.11.0
- `eslint-plugin-jest-extended`: 2.4.0 -> 3.0.0
- `eslint-plugin-jsdoc`: 50.6.1 -> 50.6.2
- `eslint-plugin-package-json`: 0.19.0 -> 0.20.0
  - Enabled a new [`no-redundant-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/no-redundant-files.md) rule.
- `eslint-plugin-prefer-arrow-functions`: 3.6.0 -> 3.6.2
- `eslint-plugin-tailwindcss`: 3.17.5 -> 3.18.0

## 0.4.0

- New config: `perfectionist` via [`eslint-plugin-perfectionist`](https://www.npmjs.com/package/eslint-plugin-perfectionist), **<u>disabled</u>** by default.
- All dependency versions are now pinned (removed `^`).

### Dependencies
- `eslint-plugin-sonarjs`: 1.0.4 -> 3.0.1
  - [**BREAKING**] Significantly changed `sonar` config: added a lot of new rules, some were disabled, some were enabled.
- `eslint-plugin-prefer-arrow-functions`: 3.4.1 -> 3.6.0
- `@vitest/eslint-plugin`: 1.1.24 -> 1.1.25

## 0.3.1

- New config: `jsdoc` via [`eslint-plugin-jsdoc`](https://www.npmjs.com/package/eslint-plugin-jsdoc), enabled by default.
- Changed the severity of all the `eslint-plugin-vue`'s recommended rules to `error` (which turned out to be `warn` by default).
- Disabled `import/no-default-export` rule for files starting with a dot and Storybook files (files inside `.storybook` directory and story files).

### Dependencies

- `typescript-eslint`: 8.18.1 -> 8.19.1
- `@vitest/eslint-plugin`: 1.1.20 -> 1.1.24
- `eslint-plugin-package-json`: 0.18.0 -> 0.19.0

## 0.3.0

- [**BREAKING**] [`prefer-inline` option of `import/no-duplicates` rule](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-duplicates.md#inline-type-imports) is now set to `true`. Added an new option `noDuplicatesOptions` in `import` config to override this behavior.
- [**BREAKING**] Removed `overridesPinia` option from `vue` config in favor of adding the ability to pass more usual config options in `pinia` option.
- New config: `jest` via [`eslint-plugin-jest`](https://www.npmjs.com/package/eslint-plugin-jest), enabled automatically if `jest` package is installed.
- New config: `jest-extended` via [`eslint-plugin-jest-extended`](https://www.npmjs.com/package/eslint-plugin-jest-extended), enabled automatically if **both** `jest` and `jest-extended` packages are installed.
- New config: `vitest` via [`@vitest/eslint-plugin`](https://www.npmjs.com/package/@vitest/eslint-plugin), enabled automatically if `vitest` package is installed.

### Dependencies

- `eslint-plugin-import-x`: 4.4.2 -> 4.6.1 & `eslint-import-resolver-typescript`: 3.6.3 -> 3.7.0
  - Start using [new `eslint-plugin-import-x` resolver interface](https://github.com/un-ts/eslint-plugin-import-x/releases/tag/v4.6.0).
- `typescript-eslint`: 8.14.0 -> 8.18.1
  - Fixes an ESLint 9.15 compatibility issue.
  - Enabled a new [`related-getter-setter-pairs`](https://typescript-eslint.io/rules/related-getter-setter-pairs) rule.
  - A new [`no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion) rule **was not enabled** by default.
- `eslint-plugin-jsonc`: 2.18.1 -> 2.18.2
  - Fixes an ESLint 9.15 compatibility issue.
- `eslint-plugin-unicorn`: 56.0.0 -> 56.0.1
  - Fixes an ESLint 9.15 compatibility issue.
- `@stylistic/eslint-plugin`: 2.10.1 -> 2.12.1
- `eslint-plugin-jest`: 28.9.0 -> 28.10.0
- `eslint-plugin-n`: 17.13.2 -> 17.15.1
- `eslint-plugin-package-json`: 0.15.6 -> 0.18.0
  - `overrides` collection is now sorted by default.
- `eslint-plugin-promise`: 7.1.0 -> 7.2.1
  - [**BREAKING**] Replace `allowThen: true` with the new [`allowThenStrict: true`](https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/catch-or-return.md#allowthenstrict) in `catch-or-return` rule.
  - [**BREAKING**] Enabled a new [`prefer-catch`](https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-catch.md) rule.
- `eslint-plugin-toml`: 0.11.1 -> 0.12.0
- `eslint-plugin-vue`: 9.31.0 -> 9.32.0
  - [**BREAKING**] Enabled a new [`slot-name-casing`](https://eslint.vuejs.org/rules/slot-name-casing.html) rule, which enforces `camelCase` for slot names.
- `eslint-plugin-yml`: 1.15.0 -> 1.16.0

## 0.2.4

- Fixed a wrong type of `config` `eslint-plugin-tailwindcss` plugin setting.

## 0.2.3

- Added an option to specify `eslint-plugin-tailwindcss` plugin settings.
- Allow default export in Nuxt's `app/router.options.ts` file.

## 0.2.2

- Fixed an issue resulting in files with any extensions being linted in Nuxt custom project directory.

## 0.2.1

- Fixed an issue resulting in `markdown` processor being applied to all files, effectively ignoring other processors like `vue`.

## 0.2.0

- New config: `markdown` via [`@eslint/markdown`](https://www.npmjs.com/package/@eslint/markdown), enabled by default.
- New config: `cssInJs` via [`eslint-plugin-css`](https://www.npmjs.com/package/eslint-plugin-css), enabled by default.
- Added a boolean option `overrideIgnores` to completely override global `ignores` provided by our config.
- Added a `node` config option to configure [`prefer-global`](https://github.com/eslint-community/eslint-plugin-n/tree/master/docs/rules/prefer-global) rule for each feature.
- Fixed an issue in `vue` config where Nuxt's `app.vue` and `error.vue` files in a custom project directory were not recognized.
- Dependencies:
  - `eslint-plugin-vue`@9.31.0
    - Enabled a new [`vue/prefer-use-template-ref`](https://eslint.vuejs.org/rules/prefer-use-template-ref.html) rule if vue>=3.5 is installed.
    
## 0.1.6

- Fixed an issue in `vue` config where recommended rules were not picked up.
- `yaml`: do not enforce casing by default.

## 0.1.5

- New config: `packageJson` via [`eslint-plugin-package-json`](https://www.npmjs.com/package/eslint-plugin-package-json).
- Dependencies:
  - `eslint-plugin-import-x`@4.4.0
    - Enable `checkTypeImports` option for [`import/extensions`](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/extensions.md) rule.

## 0.1.4

- New config: `json` (for linting .json, .jsonc, .json5 files) via [`eslint-plugin-jsonc`](https://www.npmjs.com/package/eslint-plugin-jsonc).
- Support for merging default files with user-specified files via `doNotMergeFilesWithDefault` option for `yaml`, `toml` and `json` configs.
- Dependencies:
  - `typescript-eslint`@8.10.0
    - Support for TypeScript 5.6.

## 0.1.3

- New config: `eslintComments` via [`@eslint-community/eslint-plugin-eslint-comments`](https://www.npmjs.com/package/@eslint-community/eslint-plugin-eslint-comments).
- New config: `toml` via [`eslint-plugin-toml`](https://www.npmjs.com/package/eslint-plugin-toml).
- Dependencies:
  - `eslint-plugin-unicorn`@56.0.0
    - Enable [`unicorn/consistent-existence-index-check`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-existence-index-check.md) and [`unicorn/prefer-math-min-max`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-math-min-max.md) rules.
  - `eslint-plugin-vue`@9.29.0
    - Enable [`vue/no-deprecated-delete-set`](https://eslint.vuejs.org/rules/no-deprecated-delete-set.html) rule for Vue 3.

## 0.1.2

- Dependencies:
  - `typescript-eslint`@8.8.0
    - Set `checkTypePredicates: true` for [`@typescript-eslint/no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition/#checktypepredicates) rule.

## 0.1.1

- Vue: trailing slash in user-supplied paths (for example, in `nuxtOrVueProjectDir`) is now optional.
- Vue: fixed problems related to the rules applied to wrong files.

## 0.1.0

### Breaking changes

- Force no empty lines between import statements by default.

### Other changes

- New configs: `yaml` and `prefer-arrow-functions` (both disabled by default).
- New option to add an auto fix to remove unused imports (enabled by default).
- Ability to set the same severity for all rules of a config.
- Added an option to control `reportUnusedDisableDirectives` param of `vue/comment-directive` rule.
- Dependencies:
  - `eslint-plugin-vue`@9.28.0
    - Enabled a new [`vue/require-default-export`](https://eslint.vuejs.org/rules/require-default-export.html) rule.
    - Added unplugin-vue-router's [`definePage`](https://uvr.esm.is/guide/extending-routes.html#definepage) and nuxt's [`definePageMeta`](https://nuxt.com/docs/api/utils/define-page-meta) and [`defineRouteRules`](https://nuxt.com/docs/api/utils/define-route-rules) macros to `vue/define-macros-order`.
  - `typescript-eslint`@8.7.0
    - Enabled a new [`@typescript-eslint/no-deprecated`](https://typescript-eslint.io/rules/no-deprecated/) rule.
- Internal code refactoring.

## 0.0.7

- Update dependencies. Highlights:
  - Enable new rule: [`promise/spec-only`](https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/spec-only.md).
- Ensure type safety of `overrides` option.
- Set `allowChildren: true` for `vuejs-accessibility/label-has-for`.

## 0.0.6

- Update dependencies. Highlights:
  - Update `typescript-eslint` to v8.0.0.
- Disable `unicorn/no-magic-array-flat-depth` rule. Disallow `Infinity` literal.

## 0.0.5

- Update dependencies. Highlights:
  - Update `eslint-plugin-unicorn` to v55.0.0 and enable the new `unicorn/no-length-as-slice-end` rule. 
  - `eslint-plugin-promise` to v7.0.0 and change the minimum node version to 18.18.0.
- Add an option to disable all the TypeScript type-aware `no-unsafe-*` rules.
- Make `FlatConfigEntry` type work with ESLint types for v8.

## 0.0.4

- Add types to all the rules via `eslint-typegen`.
- Update dependencies.

## 0.0.3

- Automatically add files from `.gitignore` to the list of ignored files.
- Allow to specify `.vue` files authored in TypeScript and JavaScript to apply different rules.
- Allow to specify pinia stores suffix.
- Added `router-link`, `router-view` and Nuxt-specific components to the list of known Vue components.
- Disabled `vue/no-boolean-default` rule.
- Make sure `prefer-const` rule does not report if any of the destructured variables is reassigned.
- Update dependencies.

## 0.0.2

Initial release.
