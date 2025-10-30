<!-- cspell:ignore fromasync asyncdisposablestack disposablestack iserror suppressederror sumprecise frombase fromhex setfrombase setfromhex tobase tohex classlist subpaths -->

## 1.0.0

### New configs

- `noStylisticRules` which allows to (temporarily) disable most of the stylistic rules, which can be handy if this config is added to an existing project with big codebase.
- `un` with some unique rules provided by us, enabled by default.
- `graphql` via [`@graphql-eslint/eslint-plugin`](https://npmjs.com/@graphql-eslint/eslint-plugin), enabled automatically if `graphql` package is installed.
- `depend` via [`eslint-plugin-depend`](https://npmjs.com/eslint-plugin-depend), **<u>disabled</u>** by default.
- `math` via [`eslint-plugin-math`](https://npmjs.com/eslint-plugin-math), enabled by default.
- `erasableSyntaxOnly` via [`eslint-plugin-erasable-syntax-only`](https://npmjs.com/eslint-plugin-erasable-syntax-only), **<u>disabled</u>** by default.
- `tanstackQuery` via [`@tanstack/eslint-plugin-query`](https://npmjs.com/@tanstack/eslint-plugin-query), enabled automatically if `@tanstack/query-core` package is installed.
- `storybook` via [`eslint-plugin-storybook`](https://npmjs.com/eslint-plugin-storybook), enabled automatically if `storybook` package is installed.
- `ava` via [`eslint-plugin-ava`](https://npmjs.com/eslint-plugin-ava), enabled automatically if `ava` package is installed.
- `testingLibrary` via [`eslint-plugin-testing-library`](https://npmjs.com/eslint-plugin-testing-library), enabled automatically if `@testing-library/dom` package is installed.
- `ember` via [`eslint-plugin-ember`](https://npmjs.com/eslint-plugin-ember), enabled automatically if `ember-source` package is installed.
- `cypress` via [`eslint-plugin-cypress`](https://npmjs.com/eslint-plugin-cypress), enabled automatically if `cypress` package is installed.
- `turbo` via [`eslint-plugin-turbo`](https://npmjs.com/eslint-plugin-turbo), enabled automatically if `turbo` package is installed.
- `noUnsanitized` via [`eslint-plugin-no-unsanitized`](https://npmjs.com/eslint-plugin-no-unsanitized), enabled by default.
- [**BREAKING**] `betterTailwind` via [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss), enabled automatically if `tailwindcss` package is installed, which replaces the old `tailwind` config (via `eslint-plugin-tailwindcss`), which is now **disabled** by default.
- `cspell` via [`@cspell/eslint-plugin`](https://npmjs.com/package/@cspell/eslint-plugin), **<u>disabled</u>** by default.
- `eslintPlugin` via [`eslint-plugin-eslint-plugin`](https://npmjs.com/eslint-plugin-eslint-plugin), **<u>disabled</u>** by default.
- `mdx` via [`eslint-plugin-mdx`](https://npmjs.com/eslint-plugin-mdx), enabled by default.
- `fileProgress` via [`eslint-plugin-file-progress`](https://npmjs.com/eslint-plugin-file-progress), **<u>disabled</u>** by default.
- `playwright` via [`eslint-plugin-playwright`](https://npmjs.com/eslint-plugin-playwright), enabled automatically if `playwright` package is installed.
- `youDontNeedLodashUnderscore` via [`eslint-plugin-you-dont-need-lodash-underscore`](https://npmjs.com/eslint-plugin-you-dont-need-lodash-underscore), enabled automatically if `lodash`, `lodash-es` or `lodash.*` package is installed.
- `lit` via [`eslint-plugin-lit`](https://npmjs.com/eslint-plugin-lit), enabled automatically if `lit` package is installed. Also, a new sub-config `lit/a11y` via [`eslint-plugin-lit-a11y`](https://npmjs.com/eslint-plugin-lit-a11y) is enabled by default.
- `noOnlyTests` via [`eslint-plugin-no-only-tests`](https://npmjs.com/eslint-plugin-no-only-tests), **<u>disabled</u>** by default. Also, the following sub-configs were added: `{ava,cypress,ember,jest,playwright,testingLibrary/{dom,angular,marko,react,svelte,vue},vitest}/noOnlyTests`.
- `compat` via [`eslint-plugin-compat`](https://npmjs.com/eslint-plugin-compat), **<u>disabled</u>** by default.
- `mocha` via [`eslint-plugin-mocha`](https://npmjs.com/eslint-plugin-mocha), enabled automatically if `mocha` package is installed.
- `qunit` via [`eslint-plugin-qunit`](https://npmjs.com/eslint-plugin-qunit), enabled automatically if `qunit` package is installed.
- `webComponents` via [`eslint-plugin-wc`](https://npmjs.com/eslint-plugin-wc), **<u>disabled</u>** by default.
- `header` via [`eslint-plugin-header`](https://npmjs.com/eslint-plugin-header), **<u>disabled</u>** by default.
- `headers` via [`eslint-plugin-headers`](https://npmjs.com/eslint-plugin-headers), **<u>disabled</u>** by default.
- `rxjs` via [`@smarttools/eslint-plugin-rxjs`](https://npmjs.com/@smarttools/eslint-plugin-rxjs), enabled automatically if `rxjs` package is installed.
- `nx` via [`@nx/eslint-plugin`](https://npmjs.com/@nx/eslint-plugin), enabled automatically if `nx` package is installed.
- `importZod` via [`eslint-plugin-import-zod`](https://npmjs.com/eslint-plugin-import-zod), **<u>disabled</u>** by default.
- `unocss` via [`@unocss/eslint-plugin`](https://npmjs.com/@unocss/eslint-plugin), enabled automatically if `unocss` package is installed.
- `unnecessaryAbstractions` via [`eslint-plugin-unnecessary-abstractions`](https://npmjs.com/eslint-plugin-unnecessary-abstractions), enabled by default.
- `markdownPreferences` via [`eslint-plugin-markdown-preferences`](https://npmjs.com/eslint-plugin-markdown-preferences), enabled by default.
- `markdownLinks` via [`eslint-plugin-markdown-links`](https://npmjs.com/eslint-plugin-markdown-links), enabled by default.
- `zod` via [`eslint-plugin-zod-x`](https://npmjs.com/eslint-plugin-zod-x), enabled automatically if `zod@>=4` package is installed.

### Changes

- [**BREAKING**] eslint-config-un package is now distributed as ESM only.
- [**BREAKING**] Set the minimum supported Node.js version to 20.19, 22.16 and 24 respectively for these major versions.
- [**BREAKING**] Many plugins are now not direct dependencies of this package, but its' optional peer dependencies, for example, `@graphql-eslint/eslint-plugin`, `eslint-plugin-storybook` and `eslint-plugin-tailwindcss` to name a few.
- [**BREAKING**] You can now specify the method of disabling autofix: `prefixed` would create a plugin named `disable-autofix` and copy the rules for which the autofix is disabled. `unprefixed` would copy an entire plugin and replace the origin plugin with the copy. The default method is now `unprefixed`, which leaves full rule names unchanged. You can control the overall or per-plugin autofix disabling method via the `disableAutofixMethod` option.
- [**BREAKING**] Removed the ability to disable rule autofix by enabling `disable-autofix/*` rules. Instead, when configuring a rule, you can now return an object and set `disableAutofix: true` in it.
- [**BREAKING**] Removed the `errorsInsteadOfWarnings` root option in favor of `forceSeverity` that can now be set globally.
- [**BREAKING**] Changed the prefix of [`typescript-eslint` plugin](https://npmjs.com/typescript-eslint) from `@typescript-eslint` to `ts`.
- [**BREAKING**] **unicorn, cli** configs: [`prefer-top-level-await`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-top-level-await.md) rule is now off by default and enabled in `cli` config.
- [**BREAKING**] Start using [`eslint-plugin-jsx-a11y-x`](https://npmjs.com/eslint-plugin-jsx-a11y-x) plugin instead of [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y) for `jsx-a11y` config as it has much less dependencies.
- Added a new root option, `defaultConfigsStatus`, to control what configs are enabled or disabled by default. As a result, shared settings prefix has been changed from `jsx-a11y` to `jsx-a11y-x`.
- Added the ability to override any of the used plugins via `pluginsOverrides` option.
- Exported `isInCi` helper from `ci-info` package.
- Introduced "Offline mode" which can be useful to (temporarily) disable rules performing network requests, such as [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html). It can be enabled via `offlineMode` root option or by setting `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable to non-empty string.
- Added a new root option, `useFastImports`, to override certain [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) plugin rules with implementations from [`eslint-plugin-fast-import`](https://npmjs.com/eslint-plugin-fast-import).
- **ts, vue** configs: for extension rules, base rule options and severity are now smartly inherited from the corresponding base rules. Added an option to disable this behavior.
- **packageJson** config:
  - Sort more package.json collections by default: added `resolutions`, `dependenciesMeta`, `pnpm.allowedDeprecatedVersions`, `pnpm.overrides`, `pnpm.packageExtensions`, `pnpm.patchedDependencies` and `pnpm.peerDependencyRules.allowedVersions`.
  - Added a new option `enforceAbsoluteVersion` to enforce to use or not to use absolute versions for dependencies.
  - Added a new option, `propertiesAllowedToBeEmpty`, passed to [`no-empty-fields`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-empty-fields.md)'s [`ignoreProperties`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-empty-fields.md#ignoreproperties), and set to `['browserslist']` by default.
  - [`require-name`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-name.md) and [`require-version`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-version.md) rules are now enabled by default, while all the other `require-*` rules are disabled, because the ones that are enabled now ignore the corresponding properties in package.json files with `"private": true`.
  - Enabled missed [`valid-package-definition`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-package-definition.md) rule.
- **markdown** config:
  - Added a new sub-config, `formatFencedCodeBlocks`, to use a patched version of [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) to lint fenced code blocks inside Markdown files.
  - [**BREAKING**] `language` is now set to `gfm` (GitHub Flavored Markdown) by default. Also, until [false positives on GFM Alerts are not fixed](https://github.com/eslint/markdown/issues/294), exceptions for them are added via `allowLabels` option of [`no-missing-label-refs`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-label-refs.md) rule.
- **ts** config:
  - Added a new sub-config, `sortTsconfigKeys`, to sort top-level and `compilerOptions` keys in tsconfig files.
  - [**BREAKING**] Enforced `PascalCase` for enum, enum members, interfaces and types.
- **unicorn** config:
  - Disabled [`prefer-json-parse-buffer`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-json-parse-buffer.md) rule as it [suggests bad fixes in TypeScript code](https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2565).
  - Set [`checkArrowFunctionBody: false`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-undefined.md#checkarrowfunctionbody) for [`no-useless-undefined`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-undefined.md) rule.
  - Added `enforceTextEncodingCaseAndNotation` option to control [`text-encoding-identifier-case`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/text-encoding-identifier-case.md) rule.
- **cli** config: included `**/cli.*` files by default and disabled [`no-await-in-loop`](https://eslint.org/docs/latest/rules/no-await-in-loop) rule. Disabled [`node/hashbang`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md) rule.
- **js** config:
  - Added a new option `allowedConsoleMethods` to control which `console` methods are allowed.
  - Enforced spaces around comments via [`@stylistic/spaced-comment`](https://eslint.style/rules/spaced-comment) rule.
  - Set [`no-console`](https://eslint.org/docs/latest/rules/no-console) rule severity to `error`.
- **jsdoc** config:
  - Added a new option `extraMultilineCommentsStartingWithToIgnore` to control which multiline comments should be ignored by [`no-bad-blocks`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/no-bad-blocks.md) rule. Added `__PURE__`, `__NO_SIDE_EFFECTS__` and `vite-ignore` to the default list.
  - Added a new option `customTags` to specify custom tags to be recognized as valid JSDoc tags.
- **casePolice** config: autofix is now disabled by default.
- **react** config:
  - `configTypeAwareRules` now uses `files` and `ignores` from `ts` config by default.
  - Added a new sub-config, `youMightNotNeedAnEffect` via [`eslint-plugin-react-you-might-not-need-an-effect`](https://npmjs.com/eslint-plugin-react-you-might-not-need-an-effect), enabled by default.
  - [**BREAKING**] Some `@eslint-react/eslint-plugin` rules have been renamed and removed. Please refer to [v2 migration guide](https://github.com/Rel1cx/eslint-react/releases/tag/v2.0.0) for more details.
  - [**BREAKING**] `eslint-plugin-react-compiler` have been replaced with [new "Compiler" rules from `eslint-plugin-react-hooks`](https://react.dev/blog/2025/10/01/react-19-2#eslint-plugin-react-hooks).
- **yaml** config:
  - Added a new config to target GitHub Actions workflow files, currently only disabling [`no-empty-mapping-value`](https://ota-meshi.github.io/eslint-plugin-yml/rules/no-empty-mapping-value.html) rule.
  - Added an option to not enforce the file extension.
- **vue** config:
  - Support Nuxt 4 new directory structure.
  - Added a new sub-config, `scopedCss` with the rules related to scoped CSS, via [`eslint-plugin-vue-scoped-css`](https://npmjs.com/eslint-plugin-vue-scoped-css) and enabled by default.
  - **a11y** config: enabled [`no-aria-hidden-on-focusable`](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-aria-hidden-on-focusable.html) and [`no-role-presentation-on-focusable`](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-role-presentation-on-focusable.html) rules.
- **perfectionist** config: added a bunch of new sub-configs, corresponding to each rule of the plugin. Plugin shared settings are now also configurable via `settings` option.
- **vitest** config:
  - Rule [`prefer-describe-function-title`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-describe-function-title.md) is now disabled by default.
  - Added `paddingAround` option to control whether `padding-around-*` rules will be enabled.
  - Added `typescript` sub-config for the rules designed to work exclusively with TypeScript files.
- **angular** config: you are now expected to install `@angular-eslint/eslint-plugin` and `@angular-eslint/eslint-plugin-template` packages manually and only the rules from the installed packages will be used.
- **import** config:
  - [**BREAKING**] Plugin `settings` are now accepted in camel case and without the `import-x` prefix.
  - Added a new option `allowDevDependencies` to control if [`no-extraneous-dependencies`] should report dev dependencies usage and where.
  - Added a new option `extraneousDependenciesWhitelist` to prevent certain packages from being reported by [`no-extraneous-dependencies`] rule.
- **nodeDependencies** config: added a new option `enforceAbsoluteVersion` to enforce to use or not to use absolute versions for dependencies.
- **html** config:
  - Added a new option `parserOptions` to configure HTML parser options.
  - Enabled missed [`no-invalid-entity`](https://html-eslint.org/docs/rules/no-invalid-entity) rule.
- **ts** config: do not set [`disallowTemplateShorthand: true`](https://eslint.org/docs/latest/rules/no-implicit-coercion#disallowtemplateshorthand) for [`no-implicit-coercion`](https://eslint.org/docs/latest/rules/no-implicit-coercion) rule in TypeScript files.

### Dependencies

- `eslint` (peer dependency): [9.26.0 → 9.37.0](https://github.com/eslint/eslint/compare/v9.26.0...v9.37.0)
  - ❓ (enabled conditionally) [`no-unassigned-vars`](https://eslint.org/docs/latest/rules/no-unassigned-vars)
  - 🔴 (not enabled) [`preserve-caught-error`](https://eslint.org/docs/latest/rules/preserve-caught-error)
- `angular-eslint`: [19.4.0 → 20.5.0](https://github.com/angular-eslint/angular-eslint/compare/v19.4.0...v20.5.0)
  - 🟢 (enabled) [`no-uncalled-signals`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-uncalled-signals.md)
  - 🟢 [`prefer-inject`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-inject.md)
  - 🟢 [`sort-keys-in-type-decorator`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/sort-keys-in-type-decorator.md)
  - 🟢 [`no-nested-tags`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-nested-tags.md)
  - 🟢 [`prefer-at-empty`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-at-empty.md)
  - 🟡 (enabled, warns) [`no-developer-preview`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-developer-preview.md)
  - 🟡 [`no-experimental`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-experimental.md)
  - ❓ [`prefer-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-host-metadata-property.md)
  - 🟢 [`prefer-at-else`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-at-else.md)
  - 🔴 [`prefer-built-in-pipes`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-built-in-pipes.md)
- `@eslint/css`: [0.7.0 → 0.14.0](https://github.com/eslint/css/compare/css-v0.7.0...css-v0.14.0)
  - 🟢 (enabled) [`relative-font-units`](https://github.com/eslint/css/blob/HEAD/docs/rules/relative-font-units.md)
  - 🟢 [`no-invalid-at-rule-placement`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-at-rule-placement.md)
  - 🟢 [`no-invalid-named-grid-areas`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-named-grid-areas.md)
  - 🟡 (enabled, warns) [`no-important`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-important.md)
  - 🟢 [`no-empty-blocks`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-empty-blocks.md)
  - 🟡 [`font-family-fallbacks`](https://github.com/eslint/css/blob/HEAD/docs/rules/font-family-fallbacks.md)
  - 🟢 [`no-duplicate-keyframe-selectors`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-duplicate-keyframe-selectors.md)
  - 🔴 (not enabled) [`selector-complexity`](https://github.com/eslint/css/blob/HEAD/docs/rules/selector-complexity.md)
  - 🟢 [`no-unmatchable-selectors`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-unmatchable-selectors.md)
  - Set `allowUnknownVariables: true` to [`no-invalid-properties`](https://github.com/eslint/css/blob/HEAD/docs/rules/no-invalid-properties.md)
  - Depending on the installed Tailwind version, enabled v3 or v4 Tailwind syntax support.
  - Added `allowedFeatures` option to conveniently set what CSS features will be ignored by [`use-baseline`](https://github.com/eslint/css/blob/HEAD/docs/rules/use-baseline.md) rule.
- `typescript-eslint`: [8.32.0 → 8.46.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.32.0...v8.46.0)
  - Set [`checkUnknown: true`](https://typescript-eslint.io/rules/no-base-to-string/#checkunknown) for [`no-base-to-string`](https://typescript-eslint.io/rules/no-base-to-string) rule.
- `@eslint-react/eslint-plugin`: [1.49.0 → 2.2.4](https://github.com/Rel1cx/eslint-react/compare/v1.49.0...v2.2.4)
  - [**BREAKING**] Some rules have been renamed and removed. Please refer to [v2 migration guide](https://github.com/Rel1cx/eslint-react/releases/tag/v2.0.0) for more details.
  - [**BREAKING**] Debug rules have been moved to a separate [`eslint-plugin-react-debug`](https://npmjs.com/eslint-plugin-react-debug) package.
  - 🔴 (not enabled) [`jsx-no-iife`](https://eslint-react.xyz/docs/rules/jsx-no-iife)
  - 🟢 (enabled) [`no-unnecessary-key`](https://eslint-react.xyz/docs/rules/no-unnecessary-key)
  - 🟡 (enabled, warns) [`no-forbidden-props`](https://eslint-react.xyz/docs/rules/no-forbidden-props)
  - 🟡 [`no-unused-props`](https://eslint-react.xyz/docs/rules/no-unused-props)
  - 🔴 [`dom/no-string-style-prop`](https://eslint-react.xyz/docs/rules/dom-no-string-style-prop)
  - 🔴 [`dom/prefer-namespace-import`](https://eslint-react.xyz/docs/rules/dom-prefer-namespace-import)
- `@eslint/markdown`: [6.4.0 → 7.5.0](https://github.com/eslint/markdown/compare/v6.4.0...v7.5.0)
  - 🟢 (enabled) [`no-duplicate-definitions`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-duplicate-definitions.md)
  - 🟢 [`no-empty-definitions`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-empty-definitions.md)
  - 🟢 [`no-empty-images`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-empty-images.md)
  - 🟢 [`no-missing-atx-heading-space`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-atx-heading-space.md)
  - 🟢 [`no-multiple-h1`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-multiple-h1.md)
  - 🟢 [`require-alt-text`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/require-alt-text.md)
  - 🟢 [`table-column-count`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/table-column-count.md)
  - 🔴 (not enabled) [`no-bare-urls`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-bare-urls.md)
  - 🟢 [`no-missing-link-fragments`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-link-fragments.md)
  - 🟢 [`no-reversed-media-syntax`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-reversed-media-syntax.md)
  - 🟢 [`no-unused-definitions`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-unused-definitions.md)
  - 🟢 [`no-space-in-emphasis`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-space-in-emphasis.md)
  - 🟢 [`no-reference-like-urls`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-reference-like-urls.md)
  - Set `checkMissingCells: true` for [`table-column-count`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/table-column-count.md) rule.
  - Set `checkClosedHeadings: true` for [`no-missing-atx-heading-space`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-atx-heading-space.md) rule.
- `eslint-plugin-import-x`: [4.11.1 → 4.16.1](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.11.1...v4.15.2)
- `eslint-import-resolver-typescript`: [4.3.4 → 4.4.4](https://github.com/import-js/eslint-import-resolver-typescript/compare/v4.3.4...v4.4.4)
- `@html-eslint/eslint-plugin`: [0.40.2 → 0.47.0](https://github.com/yeonjuan/html-eslint/compare/v0.40.2...v0.47.0)
  - 🟢 (enabled) [`no-aria-hidden-on-focusable`](https://html-eslint.org/docs/rules/no-aria-hidden-on-focusable)
  - 🟢 [`no-duplicate-in-head`](https://html-eslint.org/docs/rules/no-duplicate-in-head)
  - 🟢 [`no-empty-headings`](https://html-eslint.org/docs/rules/no-empty-headings)
  - 🟢 [`no-ineffective-attrs`](https://html-eslint.org/docs/rules/no-ineffective-attrs)
  - 🟢 [`no-restricted-tags`](https://html-eslint.org/docs/rules/no-restricted-tags). All deprecated or non-standard HTML tags are disallowed by default.
  - Set `enforceTemplatedAttrValue: true` for [`quotes`](https://html-eslint.org/docs/rules/quotes) rule.
- `@vitest/eslint-plugin`: [1.1.44 → 1.4.0](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.1.44...v1.4.0)
  - 🟢 (enabled) [`consistent-vitest-vi`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/consistent-vitest-vi.md)
  - 🟡 (enabled, warns) [`warn-todo`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/warn-todo.md)
  - ❓ (enabled conditionally) [`no-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-importing-vitest-globals.md)
  - ❓ [`prefer-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-importing-vitest-globals.md)
  - ❓ [`prefer-called-once`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-once.md)
  - ❓ [`prefer-called-times`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-times.md)
  - 🟢 [`hoisted-apis-on-top`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/hoisted-apis-on-top.md)
  - 🟢 [`prefer-import-in-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-import-in-mock.md)
  - ❓ [`prefer-called-exactly-once-with`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-exactly-once-with.md)
- `eslint-plugin-de-morgan`: [1.2.1 → 2.0.0](https://github.com/azat-io/eslint-plugin-de-morgan/compare/v1.2.1...v2.0.0)
- `eslint-plugin-es-x`: [8.6.2 → 9.1.2](https://github.com/eslint-community/eslint-plugin-es-x/compare/v8.6.2...v9.1.2)
  - ❓ (enabled conditionally) [`no-array-fromasync`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-array-fromasync.html)
  - ❓ [`no-asyncdisposablestack`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-asyncdisposablestack.html)
  - ❓ [`no-disposablestack`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-disposablestack.html)
  - ❓ [`no-error-iserror`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-error-iserror.html)
  - ❓ [`no-suppressederror`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-suppressederror.html)
  - ❓ [`no-using-declarations`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-using-declarations.html)
  - ❓ [`no-symbol-asyncdispose`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-symbol-asyncdispose.html)
  - ❓ [`no-symbol-dispose`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-symbol-dispose.html)
  - ❓ [`no-symbol-matchall`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-symbol-matchall.html)
  - 🔴 (not enabled) [`no-nonstandard-asyncdisposablestack-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-asyncdisposablestack-properties.html)
  - 🔴 [`no-nonstandard-asyncdisposablestack-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-asyncdisposablestack-prototype-properties.html)
  - 🔴 [`no-nonstandard-disposablestack-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-disposablestack-properties.html)
  - 🔴 [`no-nonstandard-disposablestack-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-disposablestack-prototype-properties.html)
  - 🔴 [`no-nonstandard-error-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-error-properties.html)
  - ❓ [`no-math-sumprecise`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-math-sumprecise.html)
  - ❓ [`no-uint8array-frombase64`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-frombase64.html)
  - ❓ [`no-uint8array-fromhex`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-fromhex.html)
  - ❓ [`no-uint8array-prototype-setfrombase64`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-prototype-setfrombase64.html)
  - ❓ [`no-uint8array-prototype-setfromhex`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-prototype-setfromhex.html)
  - ❓ [`no-uint8array-prototype-tobase64`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-prototype-tobase64.html)
  - ❓ [`no-uint8array-prototype-tohex`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-uint8array-prototype-tohex.html)
- `eslint-plugin-html`: [8.1.2 → 8.1.3](https://github.com/BenoitZugmeyer/eslint-plugin-html/compare/v8.1.2...v8.1.3)
- `eslint-plugin-jest`: [28.11.0 → 29.0.1](https://github.com/jest-community/eslint-plugin-jest/compare/v28.11.0...v29.0.1)
  - 🟡 (enabled, warns) [`prefer-ending-with-an-expect`](https://github.com/jest-community/eslint-plugin-jest/blob/main/docs/rules/prefer-ending-with-an-expect.md)
- `eslint-plugin-jsdoc`: [50.6.14 → 61.1.11](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.14...v61.1.11)
  - 🟢 (enabled) [`escape-inline-tags`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/escape-inline-tags.md)
  - 🔴 (not enabled) [`prefer-import-tag`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/prefer-import-tag.md)
  - 🔴 [`reject-any-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/reject-any-type.md)
  - 🔴 [`reject-function-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/reject-function-type.md)
  - 🔴 [`require-next-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-next-description.md)
  - 🔴 [`require-tags`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-tags.md)
  - 🔴 [`require-template-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-template-description.md)
  - 🔴 [`require-throws-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-throws-description.md)
  - 🔴 [`require-yields-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields-description.md)
  - 🟡 (enabled, warns) [`require-next-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-next-type.md)
  - 🟡 [`require-throws-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-throws-type.md)
  - 🟡 [`require-yields-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/require-yields-type.md)
  - 🟢 [`type-formatting`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/type-formatting.md)
  - 🟢 [`ts-method-signature-style`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-method-signature-style.md)
  - 🟢 [`ts-no-empty-object-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-no-empty-object-type.md)
  - 🟢 [`ts-no-unnecessary-template-expression`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-no-unnecessary-template-expression.md)
  - 🟢 [`ts-prefer-function-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/ts-prefer-function-type.md)
- `@stylistic/eslint-plugin`: [4.2.0 → 5.5.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v4.2.0...v5.5.0)
- `eslint-plugin-json-schema-validator`: [5.4.0 → 5.4.1](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.4.0...v5.4.1)
- `eslint-plugin-jsonc`: [2.20.0 → 2.21.0](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v2.20.0...v2.21.0)
- `eslint-plugin-n`: [17.18.0 → 17.23.1](https://github.com/eslint-community/eslint-plugin-n/compare/v17.18.0...v17.23.1)
  - 🟢 (enabled) [`no-top-level-await`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md)
- `eslint-plugin-node-dependencies`: [1.0.1 → 1.2.0](https://github.com/ota-meshi/eslint-plugin-node-dependencies/compare/v1.0.1...v1.2.0)
  - 🔴 (not enabled) [`require-provenance-deps`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/require-provenance-deps.html)
- `eslint-plugin-perfectionist`: [4.12.3 → 4.15.1](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v4.12.3...v4.15.1)
- `eslint-plugin-prettier`: [5.4.0 → 5.4.1](https://github.com/prettier/eslint-plugin-prettier/compare/v5.4.0...v5.4.1)
- `eslint-plugin-qwik`: 1.13.0 → 1.17.0
- `eslint-plugin-regexp`: [2.7.0 → 2.10.0](https://github.com/ota-meshi/eslint-plugin-regexp/compare/v2.7.0...v2.10.0)
- `eslint-plugin-svelte`: [3.5.1 → 3.12.4](https://github.com/sveltejs/eslint-plugin-svelte/compare/eslint-plugin-svelte%403.5.1...eslint-plugin-svelte%403.12.4)
  - 🟢 (enabled) [`no-top-level-browser-globals`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-top-level-browser-globals)
  - 🟢 [`no-add-event-listener`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-add-event-listener)
  - 🟢 [`prefer-writable-derived`](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-writable-derived)
  - 🟢 [`prefer-svelte-reactivity`](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-svelte-reactivity)
  - ❓ (enabled conditionally) [`require-event-prefix`](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-prefix)
  - 🟢 [`no-navigation-without-resolve`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-resolve)
- `eslint-plugin-vue`: [10.1.0 → 10.5.0](https://github.com/vuejs/eslint-plugin-vue/compare/v10.1.0...v10.5.0)
  - 🟢 (enabled) [`no-negated-v-if-condition`](https://eslint.vuejs.org/rules/no-negated-v-if-condition.html)
  - 🟢 [`no-negated-condition`](https://eslint.vuejs.org/rules/no-negated-condition.html)
- `eslint-plugin-package-json`: [0.31.0 → 0.59.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.31.0...v0.59.1)
  - 🔴 (not enabled) [`require-type`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-type.md)
  - 🟢 (enabled) [`valid-bin`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-bin.md)
  - 🟢 [`valid-author`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-author.md)
  - 🟢 [`valid-type`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-type.md)
  - 🟢 [`valid-scripts`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-scripts.md)
  - 🟢 [`valid-bundleDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-bundleDependencies.md)
  - 🟢 [`valid-config`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-config.md)
  - 🟢 [`valid-license`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-license.md)
  - 🟢 [`valid-cpu`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-cpu.md)
  - 🟢 [`valid-dependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-dependencies.md)
  - 🟢 [`valid-devDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-devDependencies.md)
  - 🟢 [`valid-optionalDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-optionalDependencies.md)
  - 🟢 [`valid-peerDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-peerDependencies.md)
  - 🔴 [`require-bugs`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-bugs.md)
  - 🔴 [`require-bundleDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-bundleDependencies.md)
  - 🔴 [`require-dependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-dependencies.md)
  - 🔴 [`require-devDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-devDependencies.md)
  - 🔴 [`require-optionalDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-optionalDependencies.md)
  - 🔴 [`require-peerDependencies`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-peerDependencies.md)
  - 🟢 [`valid-description`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-description.md)
  - 🟢 [`valid-exports`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-exports.md)
  - 🟢 [`valid-directories`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-directories.md)
  - 🟢 [`exports-subpaths-style`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/exports-subpaths-style.md)
  - 🔴 [`require-license`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-license.md)
- `eslint-plugin-jest`: [28.13.5 → 28.14.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.5...v28.14.0)
- `eslint-plugin-prettier`: [5.4.1 → 5.5.0](https://github.com/prettier/eslint-plugin-prettier/compare/v5.4.1...v5.5.0)
- `eslint-plugin-pnpm`: [0.3.1 → 1.3.0](https://github.com/antfu/pnpm-workspace-utils/compare/v0.3.1...v1.3.0)
  - 🟢 (enabled) [`yaml-valid-packages`](https://github.com/antfu/pnpm-workspace-utils/blob/HEAD/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-valid-packages.ts#L29)
- `eslint-plugin-tailwindcss`: [3.18.0 → 3.18.2](https://github.com/francoismassart/eslint-plugin-tailwindcss/compare/v3.18.0...v3.18.2)
- `eslint-plugin-unicorn`: [59.0.1 → 62.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v59.0.1...v62.0.0)
  - 🟢 (enabled) [`no-array-reverse`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-reverse.md)
  - 🟢 [`no-useless-error-capture-stack-trace`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-error-capture-stack-trace.md)
  - 🟢 [`prefer-class-fields`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-class-fields.md)
  - 🟢 [`require-module-specifiers`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/require-module-specifiers.md)
  - 🟢 [`prefer-bigint-literals`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-bigint-literals.md)
  - 🟢 [`prefer-classlist-toggle`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-classlist-toggle.md)
  - 🟢 [`require-module-attributes`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/require-module-attributes.md)
  - 🟢 [`no-array-sort`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-array-sort.md)
  - 🟢 [`no-immediate-mutation`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-immediate-mutation.md)
  - 🟢 [`no-useless-collection-argument`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-useless-collection-argument.md)
  - 🟢 [`prefer-response-static-json`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-response-static-json.md)
- `eslint-plugin-sonarjs`: [3.0.2 → 3.0.5](https://github.com/SonarSource/SonarJS/blob/master/packages/jsts/src/rules/CHANGELOG.md)
  - `no-invalid-await` rule got removed.
  - `no-one-iteration-loop` rule got removed.
- `tailwind-csstree`: [0.1.2 → 0.1.4](https://github.com/humanwhocodes/tailwind-csstree/compare/tailwind-csstree-v0.1.2...tailwind-csstree-v0.1.4)
- `svelte-eslint-parser`: [1.3.0 → 1.3.3](https://github.com/sveltejs/svelte-eslint-parser/compare/v1.3.0...v1.3.3)
- `@next/eslint-plugin-next`: [15.3.2 → 16.0.1](https://github.com/vercel/next.js/compare/v15.3.2...v16.0.1)
- `eslint-plugin-unused-imports`: 4.1.4 → 4.3.0
- `eslint-plugin-yml`: [1.18.0 → 1.19.0](https://github.com/ota-meshi/eslint-plugin-yml/compare/v1.18.0...v1.19.0)
- `eslint-plugin-jest-extended`: [3.0.0 → 3.0.1](https://github.com/jest-community/eslint-plugin-jest-extended/compare/v3.0.0...v3.0.1)
- `eslint-plugin-prefer-arrow-functions`: [3.6.2 → 3.9.1](https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/compare/3.6.2...3.9.1)
- `eslint-plugin-react-hooks`: [5.2.0 → 7.0.0](https://github.com/facebook/react/blob/HEAD/packages/eslint-plugin-react-hooks/CHANGELOG.md)
  - 🟢 (enabled) `automatic-effect-dependencies`
  - 🟢 `capitalized-calls`
  - 🟢 `component-hook-factories`
  - 🟢 `config`
  - 🟢 `error-boundaries`
  - 🟢 `fbt`
  - 🟢 `fire`
  - 🟢 `gating`
  - 🟢 `globals`
  - 🟢 `immutability`
  - 🟢 `invariant`
  - 🟢 `memoized-effect-dependencies`
  - 🟢 `no-deriving-state-in-effects`
  - 🟢 `preserve-manual-memoization`
  - 🟢 `purity`
  - 🟢 `refs`
  - 🟢 `rule-suppression`
  - 🟢 `set-state-in-effect`
  - 🟢 `set-state-in-render`
  - 🟢 `static-components`
  - 🟢 `syntax`
  - 🟢 `use-memo`
  - 🟢 `void-use-memo`
  - 🟡 (enabled, warns) `unsupported-syntax`
  - 🟡 `incompatible-library`
  - 🔴 (not enabled) `hooks`
  - 🔴 `todo`
- `eslint-plugin-css`: [0.11.0 → 0.11.1](https://github.com/ota-meshi/eslint-plugin-css/compare/v0.11.0...v0.11.1)
- `eslint-plugin-react-refresh`: [0.4.23 → 0.4.24](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/compare/v0.4.23...v0.4.24)

## 0.10.0

- New config: `svelte` via [`eslint-plugin-svelte`](https://npmjs.com/eslint-plugin-svelte), enabled automatically if `svelte` package is installed.
- New config: `es` via [`eslint-plugin-es-x`](https://npmjs.com/eslint-plugin-es-x), **<u>disabled</u>** by default.
- New config: `cloudfrontFunctions` for [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html), **<u>disabled</u>** by default.
- New config: `solid` via [`eslint-plugin-solid`](https://npmjs.com/eslint-plugin-solid), enabled automatically if `solid-js` package is installed.
- New config: `nodeDependencies` via [`eslint-plugin-node-dependencies`](https://npmjs.com/eslint-plugin-node-dependencies), **<u>disabled</u>** by default.
- New config: `jsInline` via [`eslint-plugin-html`](https://npmjs.com/eslint-plugin-html), enabled by default.
- New config: `html` via [`@html-eslint/eslint-plugin`](https://npmjs.com/@html-eslint/eslint-plugin), enabled by default unless `angular` config is enabled.
- [**BREAKING**] Minimum supported ESLint version is now `^9.15.0` as support for `meta.defaultOptions` is necessary for some rules to work.
- [**BREAKING**] Set the minimum supported Node.js version to 20.
- ESLint plugins are now loaded on demand, i.e. only if they are actually used anywhere in the config. You can opt out of this behavior by setting `loadPluginsOnDemand` option to `false`.
- Added an option to `import` config to specify `eslint-plugin-import-x` plugin settings.
- [**BREAKING**] Passing empty array to `files` will now disable the config.
- Set a new option `allowRethrowing: true` for [`@typescript-eslint/only-throw-error`](https://typescript-eslint.io/rules/only-throw-error) rule.
- Enabled [`vue/no-custom-modifiers-on-v-model`](https://eslint.vuejs.org/rules/no-custom-modifiers-on-v-model.html) and [`vue/no-multiple-template-root`](https://eslint.vuejs.org/rules/no-multiple-template-root.html) rules for Vue 2 codebases.
- Introduced a new root option `mode` with possible values of `app` and `lib`. It currently only controls whether you're allowed to import from `devDependencies` or not.
- [**BREAKING**] Importing from `peerDependencies` is now allowed by default (rule: [`no-extraneous-dependencies`]). Also disabled this rule in `cli` config.
- Added the ability to change plugin prefixes.
- `extraConfigs` now always get a name in the form of `eslint-config-un/extra-config/<provided name or "unnamed<config index>">`.
- Set a new option `reportGlobalThis: true` for [`no-shadow-restricted-names`](https://eslint.org/docs/latest/rules/no-shadow-restricted-names) rule.

### Dependencies

- `typescript-eslint`: [8.31.1 → 8.32.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.31.1...v8.32.0)
  - 🟢 (enabled) [`no-unnecessary-type-conversion`](https://typescript-eslint.io/rules/no-unnecessary-type-conversion).
- `angular-eslint`: [19.3.0 → 19.4.0](https://github.com/angular-eslint/angular-eslint/compare/v19.3.0...v19.4.0)
  - 🟢 (enabled) [`prefer-template-literal`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-template-literal.md)
  - 🟢 [`prefer-output-emitter-ref`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-output-emitter-ref.md)
- `eslint-plugin-vue`: [10.0.1 → 10.1.0](https://github.com/vuejs/eslint-plugin-vue/compare/v10.0.1...v10.1.0)
  - 🟢 (enabled) [`define-props-destructuring`](https://eslint.vuejs.org/rules/define-props-destructuring.html). Enforced **no props destructuring** by default.
- `eslint-plugin-unicorn`: [59.0.0 → 59.0.1](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v59.0.0...v59.0.1)
- `@eslint-react/eslint-plugin`: [1.48.5 → 1.49.0](https://github.com/Rel1cx/eslint-react/compare/v1.48.5...v1.49.0)
  - 🟢 (enabled) [`jsx-key-before-spread`](https://eslint-react.xyz/docs/rules/jsx-key-before-spread)
- `@next/eslint-plugin-next`: [15.3.1 → 15.3.2](https://github.com/vercel/next.js/compare/v15.3.1...v15.3.2)
- `@vitest/eslint-plugin`: [1.1.43 → 1.1.44](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.1.43...v1.1.44)
- `eslint-config-prettier`: [10.1.2 → 10.1.5](https://github.com/prettier/eslint-config-prettier/compare/v10.1.2...v10.1.5)
- `eslint-plugin-import-x`: [4.11.0 → 4.11.1](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.11.0...v4.11.1)
- `eslint-plugin-jsdoc`: [50.6.11 → 50.6.14](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.11...v50.6.14)

## 0.9.0

- New config: `nextJs` via [`@next/eslint-plugin-next`](https://npmjs.com/@next/eslint-plugin-next), enabled automatically if `next` package is installed.
- New config: `casePolice` via [`eslint-plugin-case-police`](https://npmjs.com/eslint-plugin-case-police), **<u>disabled</u>** by default.
- New config: `astro` via [`eslint-plugin-astro`](https://npmjs.com/eslint-plugin-astro), enabled automatically if `astro` package is installed.
- `packageJson` config: added `requireFields` option to require the specified fields to be present in the package.json file.

### Dependencies

- `eslint-plugin-unicorn`: [58.0.0 → 59.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v58.0.0...v59.0.0)
  - 🟢 (enabled) [`prefer-import-meta-properties`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-import-meta-properties.md) enabled in `node` config if detected supported Node.js version is a subset of `>=20.11` version range.
  - 🟢 [`no-unnecessary-array-flat-depth`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-unnecessary-array-flat-depth.md)
  - 🟢 [`no-unnecessary-array-splice-count`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-unnecessary-array-splice-count.md)
  - [**BREAKING**] `no-array-push-push` renamed to [`prefer-single-call`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/prefer-single-call.md)
  - [**BREAKING**] `no-length-as-slice-end` renamed to [`no-unnecessary-slice-end`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-unnecessary-slice-end.md)
- `@eslint-react/eslint-plugin`: [1.48.4 → 1.48.5](https://github.com/Rel1cx/eslint-react/compare/v1.48.4...v1.48.5)
- `typescript-eslint`: [8.31.0 → 8.31.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.31.0...v8.31.1)
  - [**BREAKING**] [`no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition) autofix was previously disabled, but it's now downgraded to a suggestion, as a result it have lost the `disable-autofix` prefix.
- `eslint-plugin-import-x`: [4.10.6 → 4.11.0](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.10.6...v4.11.0)
- `eslint-plugin-jsdoc`: [50.6.9 → 50.6.11](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.9...v50.6.11)
- `eslint-plugin-package-json`: [0.29.1 → 0.31.0](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.29.1...v0.31.0)
  - 🔴 (off) [`restrict-dependency-ranges`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/restrict-dependency-ranges.md)
  - 🔴 [`require-description`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-description.md)
- `eslint-plugin-perfectionist`: [4.10.1 → 4.12.3](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v4.10.1...v4.12.3)
- `eslint-plugin-vue`: [10.0.0 → 10.0.1](https://github.com/vuejs/eslint-plugin-vue/compare/v10.0.0...v10.0.1)
- `eslint-plugin-yml`: [1.17.0 → 1.18.0](https://github.com/ota-meshi/eslint-plugin-yml/compare/v1.17.0...v1.18.0)
- `eslint-plugin-n`: [17.16.1 → 17.18.0](https://github.com/eslint-community/eslint-plugin-n/compare/v17.16.1...v17.18.0)

## 0.8.2

- Prevented a crash when Tailwind v4 is installed by completely disabling `tailwind` config and `eslint-plugin-tailwindcss` plugin, which tries to import `tailwindcss/resolveConfig` which doesn't exist anymore in v4.

## 0.8.1

- Fixed incorrect `@eslint-react/dom` rule name generation.

## 0.8.0

- New config: `react` via [`@eslint-react/eslint-plugin`](https://npmjs.com/@eslint-react/eslint-plugin), [`eslint-plugin-react`](https://npmjs.com/eslint-plugin-react), [`eslint-plugin-react-hooks`](https://npmjs.com/eslint-plugin-react-hooks), [`eslint-plugin-react-refresh`](https://npmjs.com/eslint-plugin-react-refresh) and [`eslint-plugin-react-compiler`](https://npmjs.com/eslint-plugin-react-compiler), enabled automatically if `react` package is installed.
- New config: `jsx-a11y` via [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y), enabled by default.
- New config: `pnpm` via [`eslint-plugin-pnpm`](https://npmjs.com/eslint-plugin-pnpm), enabled automatically if `pnpm` is detected as a used package manager by [`package-manager-detector`](https://npmjs.com/package-manager-detector).
- Set new options `ignoreOverrideMethods: true` and `ignoreClassesWithImplements: 'all'` to the base [`class-methods-use-this` rule](https://eslint.org/docs/latest/rules/class-methods-use-this).
- `overrides` can now accept a function that receives the severity and options possibly set by our config.

### Dependencies

- `typescript-eslint`: [8.26.1 → 8.31.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.26.1...v8.31.0)
  - [**BREAKING**] Re-enabled autofix for [`no-unnecessary-type-assertion`](https://typescript-eslint.io/rules/no-unnecessary-type-assertion) since [literal const assertions are now allowed by default](https://typescript-eslint.io/rules/no-unnecessary-type-assertion/#checkliteralconstassertions).
- `angular-eslint`: [19.2.1 → 19.3.0](https://github.com/angular-eslint/angular-eslint/compare/v19.2.1...v19.3.0)
  - 🟢 (enabled) [`prefer-contextual-for-variables`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-contextual-for-variables.md)
- `@eslint-community/eslint-plugin-eslint-comments`: [4.4.1 → 4.5.0](https://github.com/eslint-community/eslint-plugin-eslint-comments/compare/v4.4.1...v4.5.0)
- `@eslint/css`: [0.5.0 → 0.7.0](https://github.com/eslint/css/compare/css-v0.5.0...css-v0.7.0)
  - [**BREAKING**] Includes the same breaking changes as outlined in release notes for [v0.6.0](https://github.com/eslint/css/releases/tag/css-v0.6.0) and [v0.7.0](https://github.com/eslint/css/releases/tag/css-v0.7.0).
- `@eslint/markdown`: [6.3.0 → 6.4.0](https://github.com/eslint/markdown/compare/v6.3.0...v6.4.0)
  - Enabled parsing of Front Matter in YAML format by default.
- `@vitest/eslint-plugin`: [1.1.37 → 1.1.43](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.1.37...v1.1.43)
  - 🟢 (enabled) [`prefer-describe-function-title`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-describe-function-title.md)
- `eslint-config-prettier`: [10.1.1 → 10.1.2](https://github.com/prettier/eslint-config-prettier/compare/v10.1.1...v10.1.2)
- `eslint-import-resolver-typescript`: [3.9.1 → 4.3.4](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.9.1...v4.3.4)
- `eslint-plugin-import-x`: [4.8.0 → 4.10.6](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.8.0...v4.10.6)
- `eslint-plugin-jsdoc`: [50.6.6 → 50.6.9](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.6...v50.6.9)
- `eslint-plugin-json-schema-validator`: [5.3.1 → 5.4.0](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.3.1...v5.4.0)
- `eslint-plugin-jsonc`: [2.19.1 → 2.20.0](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v2.19.1...v2.20.0)
- `eslint-plugin-n:` [17.16.2 → 17.17.0](https://github.com/eslint-community/eslint-plugin-n/compare/v17.16.2...v17.17.0)
- `eslint-plugin-package-json`: [0.26.3 → 0.29.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.26.3...v0.29.1)
  - 🔴 (off) [`require-engines`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-engines.md)
  - 🔴 [`require-types`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-types.md)
- `eslint-plugin-unicorn`: [57.0.0 → 58.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v57.0.0...v58.0.0)
- `eslint-plugin-qwik`: [1.12.1 → 1.13.0](https://github.com/QwikDev/qwik/compare/eslint-plugin-qwik%401.12.1...eslint-plugin-qwik%401.13.0)
- `eslint-plugin-react-compiler`: 19.0.0-beta-ebf51a3-20250411 → 19.1.0-rc.1
- `eslint-plugin-react-refresh`: [0.4.19 → 0.4.23](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/compare/v0.4.19...v0.4.23)
- `vue-eslint-parser`: [10.1.1 → 10.1.3](https://github.com/vuejs/vue-eslint-parser/compare/v10.1.1...v10.1.3)

## 0.7.0

- New config: `angular` via [`@angular-eslint/eslint-plugin`](https://npmjs.com/@angular-eslint/eslint-plugin) and [`@angular-eslint/eslint-plugin-template`](https://npmjs.com/@angular-eslint/eslint-plugin-template), enabled automatically if `@angular/core` package is installed and is within the supported version range (from 13 to 19).
- New config: `css` via [`@eslint/css`](https://npmjs.com/@eslint/css), enabled by default unless `stylelint` package is installed.
- Set `allowWithDecorator: true` for [`@typescript-eslint/no-extraneous-class`](https://typescript-eslint.io/rules/no-extraneous-class) rule, mostly to avoid unfixable reports in Angular projects.
- If TypeScript config (`ts`) is enabled, [`import/no-deprecated`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-deprecated.md) is now disabled because [the corresponding `@typescript-eslint` rule](https://typescript-eslint.io/rules/no-deprecated) works better (in particular, it accounts for function overloads).
- Override `@typescript-eslint/eslint-plugin` peer dependency of `eslint-plugin-jest` and `eslint-plugin-unused-imports` to avoid loading a wrong version of it.
- "Disable autofix" rules are now generated for all the vanilla ESLint rules.
- [**BREAKING**] "Disable autofix" rules are no longer generated for rules that do not provide fixes.
- Set [`sonarjs/no-clear-text-protocols`](https://sonarsource.github.io/rspec/#/rspec/S5332/javascript) rule severity to `warning` because it might produce many false positives.
- [**BREAKING**] `ts` config: added `configTypeAware` sub-config to replace `filesTypeAware`, `ignoresTypeAware` and `overridesTypeAware` options. Unless explicitly specified, it will use the same `ignores` as the parent config.
- [**BREAKING**] `ts` config: added `configNoTypeAssertion` sub-config to replace `noTypeAssertion` option.
- [**BREAKING**] Enabled [`@typescript-eslint/consistent-return`](https://typescript-eslint.io/rules/consistent-return) rule in `ts` config and disabled the same base rule [`consistent-return`](https://eslint.org/docs/latest/rules/consistent-return).
- [**BREAKING**] Removed `autofixToRemoveUnusedImports` option from `js` config in favor of a separate `unusedImports` config.
- [**BREAKING**] `vue` config: added `configA11y` sub-config to replace `a11y` and `overridesA11y` options.
- [**BREAKING**] `vue` config: added `configPinia` sub-config to replace `pinia` option.
- [**BREAKING**] In pursuit of consistent naming of sub-configs, renamed the following options:
  - `typescript` to `configTypescript` in `jsdoc` config
  - `jsonConfig` to `configJson` in `jsonc` config
  - `jsoncConfig` to `configJsonc` in `jsonc` config
  - `json5Config` to `configJson5` in `jsonc` config
  - `jestExtended` to `configJestExtended` in `jest` config
  - `typescript` to `configTypescript` in `jest` config

### Dependencies

- `typescript-eslint`: [8.26.0 → 8.26.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.26.0...v8.26.1)
- `@angular-eslint/*`: [19.2.0 → 19.2.1](https://github.com/angular-eslint/angular-eslint/compare/v19.2.0...v19.2.1)
- `@vitest/eslint-plugin`: [1.1.36 → 1.1.37](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.1.36...v1.1.37)
- `eslint-plugin-de-morgan`: [1.2.0 → 1.2.1](https://github.com/azat-io/eslint-plugin-de-morgan/compare/v1.2.0...v1.2.1)
- `eslint-plugin-jsdoc`: [50.6.3 → 50.6.6](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.3...v50.6.6)
- `eslint-plugin-perfectionist`: [4.9.0 → 4.10.1](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v4.9.0...v4.10.1)
- `eslint-import-resolver-typescript`: [3.7.0 → 3.9.1](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.7.0...v3.9.1)
- `eslint-plugin-import-x`: [4.6.1 → 4.8.0](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.6.1...v4.8.0)

## 0.6.2

- Revert `eslint-import-resolver-typescript` to v3.7.0 due to [this issue](https://github.com/import-js/eslint-import-resolver-typescript/issues/364).
- Set newly added `ignoreOverloadsWithDifferentJSDoc: true` for [`@typescript-eslint/unified-signatures`](https://typescript-eslint.io/rules/unified-signatures) rule.

### Dependencies

- \[Downgrade] `@stylistic/eslint-plugin`: [3.8.3 → 3.7.0](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.8.3..v3.7.0)
- `typescript-eslint`: [8.25.0 → 8.26.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.25.0...v8.26.0)
- `@eslint/markdown`: [6.2.2 → 6.3.0](https://github.com/eslint/markdown/compare/v6.2.2...v6.3.0)
- `eslint-config-prettier`: [10.0.2 → 10.1.1](https://github.com/prettier/eslint-config-prettier/compare/v10.0.2...v10.1.1)
- `eslint-plugin-n:` [17.16.1 → 17.16.2](https://github.com/eslint-community/eslint-plugin-n/compare/v17.16.1...v17.16.2)
- `eslint-plugin-package-json`: [0.26.1 → 0.26.3](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.26.1...v0.26.3)
- `eslint-plugin-vue`: [9.32.0 → 10.0.0](https://github.com/vuejs/eslint-plugin-vue/compare/v9.32.0...v10.0.0)
  - 🟢 (enabled) [`no-import-compiler-macros`](https://eslint.vuejs.org/rules/no-import-compiler-macros.html)
- `vue-eslint-parser`: [9.4.3 → 10.1.1](https://github.com/vuejs/vue-eslint-parser/compare/v9.4.3...v10.1.1)

## 0.6.1

- Specify `project: '*/tsconfig*.json'` by default in `eslint-import-resolver-typescript` resolver for `import` config to avoid resolution issues in repositories with multiple tsconfigs ([upstream issue](https://github.com/import-js/eslint-import-resolver-typescript/issues/364)). Added an option to override the resolver settings.
- Set `overrides['eslint-processor-vue-blocks']['@vue/compiler-sfc']` to v3 in `package.json` to potentially avoid "Preprocessing error: Cannot read properties of undefined (reading 'styles')" error during Vue files linting, caused by `@vue/compiler-sfc` resolved to a different major version.

### Dependencies

- `@stylistic/eslint-plugin`: [4.1.0 → 4.2.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v4.1.0...v4.2.0)
- `eslint-plugin-package-json`: [0.26.0 → 0.26.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.26.0...v0.26.1)
- `eslint-plugin-n`: [17.15.1 → 17.16.1](https://github.com/eslint-community/eslint-plugin-n/compare/v17.15.1...v17.16.1)

## 0.6.0

- New config: `qwik` via [`eslint-plugin-qwik`](https://npmjs.com/eslint-plugin-qwik), enabled automatically if `@builder.io/qwik` or `@qwik.dev/core` package is installed.
- New config: `jsonSchemaValidator` via [`eslint-plugin-json-schema-validator`](https://npmjs.com/eslint-plugin-json-schema-validator), **<u>disabled</u>** by default.
- [**BREAKING**] Disabled `vitest/prefer-to-be-{falsy,truthy}` rules since their fixes don't result in the equivalent code and therefore cannot be suitable for most projects.
- [**BREAKING**] Set [`enforceForIfStatements: false`](https://eslint.org/docs/latest/rules/logical-assignment-operators#enforceforifstatements) for `logical-assignment-operators` since code enforced by this option might be harder to read and understand.
- Added a fully typed `node` config option to specify `eslint-plugin-n` plugin settings.
- For `jest` and `vitest` configs, an option `testDefinitionKeyword` now accepts a string that is used to set [all the properties of the object](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/consistent-test-it.md#options).
- For Vue files virtual files for `<style>` blocks are now created via [`eslint-processor-vue-blocks`](https://npmjs.com/eslint-processor-vue-blocks). Added an option to disable or customize this behavior.
- `<config>.overrides` type now includes `disable-autofix/*` rules.

### Dependencies

- `typescript-eslint`: 8.24.1 → 8.25.0
- `@stylistic/eslint-plugin`: 4.0.1 → 4.1.0
- `@vitest/eslint-plugin`: 1.1.31 → 1.1.36
- `eslint-config-prettier`: 10.0.1 → 10.0.2
- `eslint-plugin-de-morgan`: 1.1.0 → 1.2.0
- `yaml-eslint-parser`: 1.2.3 → 1.3.0

## 0.5.0

- [**BREAKING**] All used ESLint plugins are now loaded unconditionally, allowing the use of any of their rules without requiring that the corresponding config is enabled.
- Abandon [`eslint-plugin-disable-autofix`](https://npmjs.com/eslint-plugin-disable-autofix) in favor of manually adding the same functionality.
- [**BREAKING**] Disabled autofix for [`no-unnecessary-type-assertion`](https://typescript-eslint.io/rules/no-unnecessary-type-assertion/) due to [this bug](https://github.com/typescript-eslint/typescript-eslint/issues/8721).
- New config: `deMorgan` via [`eslint-plugin-de-morgan`](https://npmjs.com/eslint-plugin-de-morgan), **<u>disabled</u>** by default.

### Dependencies

- `eslint-plugin-unicorn`: 56.0.1 → 57.0.0
  - [**BREAKING**] Claims to support only `eslint`>=9.20.0, but we haven't enforced this version range in `peerDependencies` in case it works fine with the older versions.
  - ESM only now.
  - ❌ (deprecated) `no-instanceof-builtins`
  - 🟡 (warns) [`consistent-assert`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-assert.md)
  - 🟢 (enabled) [`consistent-date-clone`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/consistent-date-clone.md)
  - 🟢 [`no-accessor-recursion`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-accessor-recursion.md)
  - 🟢 [`no-instanceof-builtins`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-instanceof-builtins.md)
  - 🟢 [`no-named-default`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/main/docs/rules/no-named-default.md)
- `@vitest/eslint-plugin`: 1.1.28 → 1.1.31
- `eslint-import-resolver-typescript`: [3.7.0 → 3.8.3](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.7.0...v3.8.3)
- `eslint-plugin-perfectionist`: 4.8.0 → 4.9.0
- `eslint-plugin-sonarjs`: 3.0.1 → 3.0.2
- `eslint-plugin-yml`: 1.16.0 → 1.17.0
- `@stylistic/eslint-plugin`: 3.1.0 → 4.0.1
  - ESM only now.
- `typescript-eslint`: 8.24.0 → 8.24.1
- `eslint-config-flat-gitignore`: [2.0.0 → 2.1.0](https://github.com/antfu/eslint-config-flat-gitignore/compare/v2.0.0...v2.1.0)

## 0.4.2

- New config: `cli` to disable a few rules for files in `bin`, `scripts` and `cli` directories, enabled by default.
- `jest`/`vitest`: by default include nested `__test(s)__` directories and `[-_].spec.*` files.
- `sonar`: change `prefer-single-boolean-return` default severity to `warn`.

### Dependencies

- `typescript-eslint`: 8.20.0 → 8.24.0
  - [`no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition): change `allowConstantLoopConditions` from `true` to [`only-allowed-literals`](https://typescript-eslint.io/rules/no-unnecessary-condition/#only-allowed-literals)
- `@eslint/markdown`: 6.2.1 → 6.2.2
- `@stylistic/eslint-plugin`: 2.13.0 → 3.1.0
- `@vitest/eslint-plugin`: 1.1.25 → 1.1.28
  - 🟡 (warns) [`require-mock-type-parameters`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/require-mock-type-parameters.md)
  - 🔴 (off) [`prefer-strict-boolean-matchers`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-strict-boolean-matchers.md)
- `eslint-config-flat-gitignore`: 1.0.0 → 2.0.0
- `eslint-merge-processors`: 1.0.0 → 2.0.0
- `eslint-plugin-jsdoc`: 50.6.2 → 50.6.3
- `eslint-plugin-jsonc`: 2.18.2 → 2.19.1
- `eslint-plugin-package-json`: 0.20.0 → 0.26.0
  - 🟢 (enabled) [`no-empty-fields`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/no-empty-fields.md)
  - 🟢 [`require-version`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-version.md)
  - 🟢 [`require-name`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-name.md)
  - 🔴 (off) [`require-author`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-author.md)
  - 🔴 (off) [`require-keywords`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-keywords.md)
  - 🔴 (off) [`require-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/require-files.md)
- `eslint-plugin-perfectionist`: 4.6.0 → 4.8.0

## 0.4.1

- In `typescript` config, setting `filesTypeAware: false` now fully disables the config for running type-aware rules. Same if an empty array is provided.
- Added the ability to disable running type-aware rules (or even any TypeScript rules) on the files specified in `enforceTypescriptInScriptSection` option.
- Exposed `isInEditor` utility from `is-in-editor` package that checks if the current process is running within a well known editor.

### Dependencies

- `@stylistic/eslint-plugin`: 2.12.1 → 2.13.0
- `typescript-eslint`: 8.19.1 → 8.20.0
  - Enabled a new [`no-misused-spread`](https://typescript-eslint.io/rules/no-misused-spread) rule.
- `eslint-config-prettier`: 9.1.0 → 10.0.1
  - In v10, `@stylistic/eslint-plugin` is supported, which disables some of `@stylistic/*` rules.
- `eslint-plugin-jest`: 28.10.0 → 28.11.0
- `eslint-plugin-jest-extended`: 2.4.0 → 3.0.0
- `eslint-plugin-jsdoc`: 50.6.1 → 50.6.2
- `eslint-plugin-package-json`: 0.19.0 → 0.20.0
  - Enabled a new [`no-redundant-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/main/docs/rules/no-redundant-files.md) rule.
- `eslint-plugin-prefer-arrow-functions`: 3.6.0 → 3.6.2
- `eslint-plugin-tailwindcss`: 3.17.5 → 3.18.0

## 0.4.0

- New config: `perfectionist` via [`eslint-plugin-perfectionist`](https://npmjs.com/eslint-plugin-perfectionist), **<u>disabled</u>** by default.
- All dependency versions are now pinned (removed `^`).

### Dependencies

- `eslint-plugin-sonarjs`: 1.0.4 → 3.0.1
  - [**BREAKING**] Significantly changed `sonar` config: added a lot of new rules, some were disabled, some were enabled.
- `eslint-plugin-prefer-arrow-functions`: 3.4.1 → 3.6.0
- `@vitest/eslint-plugin`: 1.1.24 → 1.1.25

## 0.3.1

- New config: `jsdoc` via [`eslint-plugin-jsdoc`](https://npmjs.com/eslint-plugin-jsdoc), enabled by default.
- Changed the severity of all the `eslint-plugin-vue`'s recommended rules to `error` (which turned out to be `warn` by default).
- Disabled `import/no-default-export` rule for files starting with a dot and Storybook files (files inside `.storybook` directory and story files).

### Dependencies

- `typescript-eslint`: 8.18.1 → 8.19.1
- `@vitest/eslint-plugin`: 1.1.20 → 1.1.24
- `eslint-plugin-package-json`: 0.18.0 → 0.19.0

## 0.3.0

- [**BREAKING**] [`prefer-inline` option of `import/no-duplicates` rule](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/no-duplicates.md#inline-type-imports) is now set to `true`. Added an new option `noDuplicatesOptions` in `import` config to override this behavior.
- [**BREAKING**] Removed `overridesPinia` option from `vue` config in favor of adding the ability to pass more usual config options in `pinia` option.
- New config: `jest` via [`eslint-plugin-jest`](https://npmjs.com/eslint-plugin-jest), enabled automatically if `jest` package is installed.
- New config: `jest-extended` via [`eslint-plugin-jest-extended`](https://npmjs.com/eslint-plugin-jest-extended), enabled automatically if **both** `jest` and `jest-extended` packages are installed.
- New config: `vitest` via [`@vitest/eslint-plugin`](https://npmjs.com/@vitest/eslint-plugin), enabled automatically if `vitest` package is installed.

### Dependencies

- `eslint-plugin-import-x`: 4.4.2 → 4.6.1 & `eslint-import-resolver-typescript`: 3.6.3 → 3.7.0
  - Start using [new `eslint-plugin-import-x` resolver interface](https://github.com/un-ts/eslint-plugin-import-x/releases/tag/v4.6.0).
- `typescript-eslint`: 8.14.0 → 8.18.1
  - Fixes an ESLint 9.15 compatibility issue.
  - Enabled a new [`related-getter-setter-pairs`](https://typescript-eslint.io/rules/related-getter-setter-pairs) rule.
  - A new [`no-unsafe-type-assertion`](https://typescript-eslint.io/rules/no-unsafe-type-assertion) rule **was not enabled** by default.
- `eslint-plugin-jsonc`: 2.18.1 → 2.18.2
  - Fixes an ESLint 9.15 compatibility issue.
- `eslint-plugin-unicorn`: 56.0.0 → 56.0.1
  - Fixes an ESLint 9.15 compatibility issue.
- `@stylistic/eslint-plugin`: 2.10.1 → 2.12.1
- `eslint-plugin-jest`: 28.9.0 → 28.10.0
- `eslint-plugin-n`: 17.13.2 → 17.15.1
- `eslint-plugin-package-json`: 0.15.6 → 0.18.0
  - `overrides` collection is now sorted by default.
- `eslint-plugin-promise`: 7.1.0 → 7.2.1
  - [**BREAKING**] Replace `allowThen: true` with the new [`allowThenStrict: true`](https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/catch-or-return.md#allowthenstrict) in `catch-or-return` rule.
  - [**BREAKING**] Enabled a new [`prefer-catch`](https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-catch.md) rule.
- `eslint-plugin-toml`: 0.11.1 → 0.12.0
- `eslint-plugin-vue`: 9.31.0 → 9.32.0
  - [**BREAKING**] Enabled a new [`slot-name-casing`](https://eslint.vuejs.org/rules/slot-name-casing.html) rule, which enforces `camelCase` for slot names.
- `eslint-plugin-yml`: 1.15.0 → 1.16.0

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

- New config: `markdown` via [`@eslint/markdown`](https://npmjs.com/@eslint/markdown), enabled by default.
- New config: `cssInJs` via [`eslint-plugin-css`](https://npmjs.com/eslint-plugin-css), enabled by default.
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

- New config: `packageJson` via [`eslint-plugin-package-json`](https://npmjs.com/eslint-plugin-package-json).
- Dependencies:
  - `eslint-plugin-import-x`@4.4.0
    - Enable `checkTypeImports` option for [`import/extensions`](https://github.com/un-ts/eslint-plugin-import-x/blob/master/docs/rules/extensions.md) rule.

## 0.1.4

- New config: `json` (for linting .json, .jsonc, .json5 files) via [`eslint-plugin-jsonc`](https://npmjs.com/eslint-plugin-jsonc).
- Support for merging default files with user-specified files via `doNotMergeFilesWithDefault` option for `yaml`, `toml` and `json` configs.
- Dependencies:
  - `typescript-eslint`@8.10.0
    - Support for TypeScript 5.6.

## 0.1.3

- New config: `eslintComments` via [`@eslint-community/eslint-plugin-eslint-comments`](https://npmjs.com/@eslint-community/eslint-plugin-eslint-comments).
- New config: `toml` via [`eslint-plugin-toml`](https://npmjs.com/eslint-plugin-toml).
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

[`no-extraneous-dependencies`]: https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-extraneous-dependencies.md
