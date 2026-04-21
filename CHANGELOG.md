<!-- cspell:ignore fromasync asyncdisposablestack disposablestack iserror suppressederror sumprecise frombase fromhex setfrombase setfromhex tobase tohex classlist subpaths firstdayofweek getcalendars getcollations gethourcycles getnumberingsystems gettextinfo gettimezones getweekinfo -->

## 1.0.0-beta.8

### Minor Changes

- d4690dc: packageJson: updated [`eslint-plugin-package-json` from v0.88.3 to v0.91.0](https://github.com/michaelfaith/eslint-plugin-package-json/compare/v0.88.3...v0.91.0):
  - 🔴 not enabled [`require-bin`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-bin.md) rule
  - 🔴 not enabled [`require-contributors`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-contributors.md) rule
  - 🔴 not enabled [`require-cpu`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-cpu.md) rule
  - 🔴 not enabled [`require-devEngines`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-devEngines.md) rule
  - 🔴 not enabled [`require-directories`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-directories.md) rule
  - 🔴 not enabled [`require-funding`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-funding.md) rule
  - 🔴 not enabled [`require-main`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-main.md) rule
  - 🔴 not enabled [`require-man`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-man.md) rule
  - 🔴 not enabled [`require-module`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-module.md) rule
  - 🔴 not enabled [`require-os`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-os.md) rule
  - 🔴 not enabled [`require-packageManager`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-packageManager.md) rule
  - 🔴 not enabled [`require-private`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-private.md) rule
  - 🔴 not enabled [`require-publishConfig`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/require-publishConfig.md) rule
  - 🟢 enabled [`valid-bugs`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-bugs.md) rule
  - 🟢 enabled [`valid-devEngines`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-devEngines.md) rule
  - 🟢 enabled [`valid-funding`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-funding.md) rule
  - 🟢 enabled [`valid-packageManager`](https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-packageManager.md) rule

- 5394ed5: html: updated [`@html-eslint/parser` from v0.54.0 to v0.57.1](https://github.com/yeonjuan/html-eslint/compare/v0.54.0...v0.57.1):
  - 🟢 enabled [`head-order`](https://html-eslint.org/docs/rules/head-order) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`no-invalid-attr-value`](https://html-eslint.org/docs/rules/no-invalid-attr-value) rule
  - 🟢 enabled [`no-redundant-role`](https://html-eslint.org/docs/rules/no-redundant-role) rule

- 5d1f779: zod: updated [`eslint-plugin-zod` from v3.5.4 to v3.7.0](https://github.com/marcalexiei/eslint-plugin-zod/compare/v3.5.4...v3.7.0):
  - 🟢 enabled [`no-transform-in-record-key`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/no-transform-in-record-key.md) rule

- eeb0310: html: updated [`@html-eslint/*` from v0.57.1 to v0.58.1](https://github.com/yeonjuan/html-eslint/compare/v0.57.1...v0.58.1):
  - 🟢 enabled [`require-details-summary`](https://html-eslint.org/docs/rules/require-details-summary) rule

- 672ebd2: perfectionist:
  - Updated [`eslint-plugin-perfectionist` from v5.3.1 to v5.4.0](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v5.3.1...v5.4.0)
  - Moved `eslint-plugin-perfectionist` to direct dependencies as the plugin is gaining popularity
  - Explained how to enable all `perfectionist` rules by default in README

- fefa6de: vue: updated [`@nuxt/eslint-plugin` from v1.12.1 to v1.15.1](https://github.com/nuxt/eslint/compare/v1.12.1...v1.15.1):
  - 🟢 enabled [`no-page-meta-runtime-values`](https://github.com/nuxt/eslint/blob/89618070025b4373e90b227eb478b33a13b34c8f/packages/eslint-plugin/src/rules/no-page-meta-runtime-values/no-page-meta-runtime-values.ts#L66) rule in ⚙️ `nuxt` sub-config

- 4644112: [**BREAKING**] react: updated [`@eslint-react/eslint-plugin` and `eslint-plugin-react-debug` from v2.7.1 to v4.2.3](https://github.com/Rel1cx/eslint-react/compare/v2.7.1...v4.2.3):
  - All rules except for the debug ones were consolidated into `@eslint-react` namespace, so `@eslint-react/*` plugins are no longer available. The full rule names from those sub-plugins, though, now have `-` instead of `/` in their name, so `@eslint-react/dom/no-missing-button-type` now becomes `@eslint-react/dom-no-missing-button-type`
  - ⚙️ `hooks` sub-config now does not include the rules from `@eslint-react/eslint-plugin`
  - The following rules were removed (🔤-> was renamed to; 🔄-> has the replacement of):
    - `jsx-dollar`
    - `jsx-no-duplicate-props` 🔄->`react/jsx-no-duplicate-props`
    - `jsx-no-undef` 🔄->`react/jsx-no-undef`
    - `jsx-shorthand-boolean`
    - `jsx-shorthand-fragment`
    - `jsx-uses-react` 🔄->`react/jsx-uses-react`
    - `jsx-uses-vars` 🔄->`react/jsx-uses-vars`
    - `no-direct-set-state-in-use-effect` to [`set-state-in-effect`](https://eslint-react.xyz/docs/rules/set-state-in-effect)
    - `no-unnecessary-key`
    - `no-unnecessary-use-ref`
    - `prefer-read-only-props` 🔄->`react/prefer-read-only-props`
    - `unstable-rules-of-props`
    - `unstable-rules-of-state`
  - 🔄 renamed the following rules:
    - `dom/no-dangerously-set-innerhtml-with-children` to [`dom-no-dangerously-set-innerhtml-with-children`](https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml-with-children)
    - `dom/no-dangerously-set-innerhtml` to [`dom-no-dangerously-set-innerhtml`](https://eslint-react.xyz/docs/rules/dom-no-dangerously-set-innerhtml)
    - `dom/no-find-dom-node` to [`dom-no-find-dom-node`](https://eslint-react.xyz/docs/rules/dom-no-find-dom-node)
    - `dom/no-flush-sync` to [`dom-no-flush-sync`](https://eslint-react.xyz/docs/rules/dom-no-flush-sync)
    - `dom/no-hydrate` to [`dom-no-hydrate`](https://eslint-react.xyz/docs/rules/dom-no-hydrate)
    - `dom/no-missing-button-type` to [`dom-no-missing-button-type`](https://eslint-react.xyz/docs/rules/dom-no-missing-button-type)
    - `dom/no-missing-iframe-sandbox` to [`dom-no-missing-iframe-sandbox`](https://eslint-react.xyz/docs/rules/dom-no-missing-iframe-sandbox)
    - `dom/no-namespace` to [`jsx-no-namespace`](https://eslint-react.xyz/docs/rules/jsx-no-namespace)
    - `dom/no-render-return-value` to [`dom-no-render-return-value`](https://eslint-react.xyz/docs/rules/dom-no-render-return-value)
    - `dom/no-render` to [`dom-no-render`](https://eslint-react.xyz/docs/rules/dom-no-render)
    - `dom/no-script-url` to [`dom-no-script-url`](https://eslint-react.xyz/docs/rules/dom-no-script-url)
    - `dom/no-string-style-prop` to [`dom-no-string-style-prop`](https://eslint-react.xyz/docs/rules/dom-no-string-style-prop)
    - `dom/no-unknown-property` to [`dom-no-unknown-property`](https://eslint-react.xyz/docs/rules/dom-no-unknown-property)
    - `dom/no-unsafe-iframe-sandbox` to [`dom-no-unsafe-iframe-sandbox`](https://eslint-react.xyz/docs/rules/dom-no-unsafe-iframe-sandbox)
    - `dom/no-unsafe-target-blank` to [`dom-no-unsafe-target-blank`](https://eslint-react.xyz/docs/rules/dom-no-unsafe-target-blank)
    - `dom/no-use-form-state` to [`dom-no-use-form-state`](https://eslint-react.xyz/docs/rules/dom-no-use-form-state)
    - `dom/no-void-elements-with-children` to [`dom-no-void-elements-with-children`](https://eslint-react.xyz/docs/rules/dom-no-void-elements-with-children)
    - `dom/prefer-namespace-import` to [`dom-prefer-namespace-import`](https://eslint-react.xyz/docs/rules/dom-prefer-namespace-import)
    - `jsx-key-before-spread` to [`jsx-no-children-prop-with-children`](https://eslint-react.xyz/docs/rules/jsx-no-children-prop-with-children)
    - `naming-convention/context-name` to [`naming-convention-context-name`](https://eslint-react.xyz/docs/rules/naming-convention-context-name)
    - `naming-convention/id-name` to [`naming-convention-id-name`](https://eslint-react.xyz/docs/rules/naming-convention-id-name)
    - `naming-convention/ref-name` to [`naming-convention-ref-name`](https://eslint-react.xyz/docs/rules/naming-convention-ref-name)
    - `no-children-prop` to [`jsx-no-children-prop`](https://eslint-react.xyz/docs/rules/jsx-no-children-prop)
    - `no-useless-forward-ref` to [`no-forward-ref`](https://eslint-react.xyz/docs/rules/no-forward-ref)
    - `no-useless-fragment` to [`jsx-no-useless-fragment`](https://eslint-react.xyz/docs/rules/jsx-no-key-after-spread)
    - `prefer-use-state-lazy-initialization` to [`use-state`](https://eslint-react.xyz/docs/rules/use-state)
    - `web-api/no-leaked-event-listener` to [`web-api-no-leaked-event-listener`](https://eslint-react.xyz/docs/rules/web-api-no-leaked-event-listener)
    - `web-api/no-leaked-interval` to [`web-api-no-leaked-interval`](https://eslint-react.xyz/docs/rules/web-api-no-leaked-interval)
    - `web-api/no-leaked-resize-observer` to [`web-api-no-leaked-resize-observer`](https://eslint-react.xyz/docs/rules/web-api-no-leaked-resize-observer)
    - `web-api/no-leaked-timeout` to [`web-api-no-leaked-timeout`](https://eslint-react.xyz/docs/rules/web-api-no-leaked-timeout)
  - 🟢 enabled the following rules:
    - [`component-hook-factories`](https://eslint-react.xyz/docs/rules/component-hook-factories)
    - [`error-boundaries`](https://eslint-react.xyz/docs/rules/error-boundaries)
    - [`exhaustive-deps`](https://eslint-react.xyz/docs/rules/exhaustive-deps)
    - [`immutability`](https://eslint-react.xyz/docs/rules/immutability)
    - [`jsx-no-key-after-spread`](https://eslint-react.xyz/docs/rules/jsx-no-key-after-spread)
    - [`jsx-no-leaked-dollar`](https://eslint-react.xyz/docs/rules/jsx-no-leaked-dollar)
    - [`jsx-no-leaked-semicolon`](https://eslint-react.xyz/docs/rules/jsx-no-leaked-semicolon)
    - [`no-implicit-children`](https://eslint-react.xyz/docs/rules/no-implicit-children) in ⚙️ `reactXTypeAwareRules` sub-config
    - [`no-implicit-key`](https://eslint-react.xyz/docs/rules/no-implicit-key) in ⚙️ `reactXTypeAwareRules` sub-config
    - [`no-implicit-ref`](https://eslint-react.xyz/docs/rules/no-implicit-ref) in ⚙️ `reactXTypeAwareRules` sub-config
    - [`purity`](https://eslint-react.xyz/docs/rules/purity)
    - [`refs`](https://eslint-react.xyz/docs/rules/refs)
    - [`rsc-function-definition`](https://eslint-react.xyz/docs/rules/rsc-function-definition)
    - [`rules-of-hooks`](https://eslint-react.xyz/docs/rules/rules-of-hooks)
    - [`set-state-in-render`](https://eslint-react.xyz/docs/rules/set-state-in-render)
    - [`unsupported-syntax`](https://eslint-react.xyz/docs/rules/unsupported-syntax)
    - [`use-memo`](https://eslint-react.xyz/docs/rules/use-memo)

- 05910ab: toml: updated [`eslint-plugin-toml` from v1.0.3 to v1.3.1](https://github.com/ota-meshi/eslint-plugin-toml/compare/v1.0.3...v1.3.1):
  - 🟢 enabled [`inline-table-curly-newline`](https://ota-meshi.github.io/eslint-plugin-toml/rules/inline-table-curly-newline.html) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`inline-table-key-value-newline`](https://ota-meshi.github.io/eslint-plugin-toml/rules/inline-table-key-value-newline.html) rule and added it to the `noStylisticRules` config

- 5e3aa32: unicorn: updated [`eslint-plugin-unicorn` from v63.0.0 to v64.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v63.0.0...v64.0.0):
  - 🟢 enabled [`consistent-template-literal-escape`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-template-literal-escape.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`no-useless-iterator-to-array`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-iterator-to-array.md) rule
  - 🟢 enabled [`prefer-simple-condition-first`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-simple-condition-first.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`switch-case-break-position`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/switch-case-break-position.md) rule

- fa584d4: <!-- cspell:ignore totemporalinstant plaindate plaindatetime plainmonthday plaintime plainyearmonth zoneddatetime -->

  es: updated [`eslint-plugin-es-x` from v9.5.0 to v9.6.0](https://github.com/eslint-community/eslint-plugin-es-x/compare/v9.5.0...v9.6.0):
  - ❓ enabled conditionally [`no-date-prototype-totemporalinstant`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-date-prototype-totemporalinstant.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-duration-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-duration-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-duration-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-duration-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-instant-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-instant-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-instant-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-instant-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-now-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-now-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaindate-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaindate-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaindate-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaindate-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaindatetime-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaindatetime-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaindatetime-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaindatetime-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plainmonthday-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plainmonthday-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plainmonthday-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plainmonthday-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaintime-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaintime-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plaintime-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plaintime-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plainyearmonth-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plainyearmonth-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-plainyearmonth-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-plainyearmonth-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-zoneddatetime-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-zoneddatetime-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-zoneddatetime-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-zoneddatetime-prototype-properties.html) rule
  - 🔴 not enabled [`no-nonstandard-temporal-instant-prototype-properties`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-nonstandard-temporal-instant-prototype-properties.html) rule
  - ❓ enabled conditionally [`no-temporal`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-temporal.html) rule

- 5ce60a9: node: updated [`eslint-plugin-n` from v17.23.2 to v17.24.0](https://github.com/eslint-community/eslint-plugin-n/compare/v17.23.2...v17.24.0):
  - 🟢 enabled [`node/prefer-global/crypto`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/crypto.md) rule and added the corresponding `preferGlobal.crypto` setting
  - 🟢 enabled [`node/prefer-global/timers`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/timers.md) rule and added the corresponding `preferGlobal.timers` setting

- 7a7c955: astro: updated [`eslint-plugin-astro` from v1.6.0 to v1.7.0](https://github.com/ota-meshi/eslint-plugin-astro/compare/v1.6.0...v1.7.0):
  - 🟢 enabled [`no-prerender-export-outside-pages`](https://ota-meshi.github.io/eslint-plugin-astro/rules/no-prerender-export-outside-pages) rule

- cade667: [**BREAKING**] css: `customSyntax` option now supports object and function form. Previously, the object form was shallow-merged with the custom syntax implicitly set by us (to support TailwindCSS). Now, it fully take precedence; if one needs to merge it, use the function form which receives "our" syntax as a parameter
- 94d25e2: regexp: added `settings` option to specify `eslint-plugin-regexp` shared settings
- c6a6ff0: sonar: updated [`eslint-plugin-sonarjs` from v3.0.5 to v3.0.6](https://github.com/SonarSource/SonarJS/blob/77e1a2725158e2825b24911a8f36515426214e35/packages/jsts/src/rules/CHANGELOG.md#2026-01-27-version-306):
  - 🟢 enabled [`dynamically-constructed-templates`](https://sonarsource.github.io/rspec/#/rspec/S7790/javascript) rule
  - 🟢 enabled [`hardcoded-secret-signatures`](https://sonarsource.github.io/rspec/#/rspec/S6437/javascript) rule
  - 🟢 enabled [`review-blockchain-mnemonic`](https://sonarsource.github.io/rspec/#/rspec/S7639/javascript) rule

- cc5df77: angular: updated [`@angular-eslint/*` from v21.2.0 to v21.3.1](https://github.com/angular-eslint/angular-eslint/compare/v21.2.0...v21.3.1):
  - 🟢 enabled [`computed-must-return`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/computed-must-return.md) rule
  - 🔴 not enable [`template/no-non-null-assertion`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-non-null-assertion.md) rule

- 29fe191: e18e: updated [`@e18e/eslint-plugin` from v0.1.4 to v0.2.0](https://github.com/e18e/eslint-plugin/compare/0.1.4...0.2.0):
  - 🟢 enabled [`prefer-inline-equality`](https://github.com/e18e/eslint-plugin/blob/9a2eaa871de039b5c2932ab2707a0d01d3fe1519/src/rules/prefer-inline-equality.ts#L198) rule in ⚙️ `performanceImprovementsTypescript` and `performanceImprovements` sub-configs
  - 🟢 enabled [`prefer-static-regex`](https://github.com/e18e/eslint-plugin/blob/9a2eaa871de039b5c2932ab2707a0d01d3fe1519/src/rules/prefer-static-regex.ts#L24) rule in ⚙️ `performanceImprovements` and `performanceImprovements` sub-configs

- a4c2420: Updated [`eslint-plugin-jsonc` from v2.21.0 to v3.1.1](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v2.21.0...v3.1.1) and starting using [plugin languages](https://ota-meshi.github.io/eslint-plugin-jsonc/user-guide/#languages) instead of [`jsonc-eslint-parser`](https://npmjs.com/jsonc-eslint-parser) whenever JSON(5,C) parsing is required
- f30428c: playwright: updated [`eslint-plugin-playwright` from v2.5.0 to v2.10.2](https://github.com/mskelton/eslint-plugin-playwright/compare/v2.5.0...v2.10.2):
  - 🟢 enabled [`no-duplicate-slow`](https://github.com/mskelton/eslint-plugin-playwright/tree/HEAD/docs/rules/no-duplicate-slow.md) rule
  - 🔴 not enabled [`no-restricted-roles`](https://github.com/mskelton/eslint-plugin-playwright/tree/HEAD/docs/rules/no-restricted-roles.md) rule
  - 🔴 not enabled [`require-tags`](https://github.com/mskelton/eslint-plugin-playwright/tree/HEAD/docs/rules/require-tags.md) rule
  - 🔴 not enabled [`require-to-pass-timeout`](https://github.com/mskelton/eslint-plugin-playwright/tree/HEAD/docs/rules/require-to-pass-timeout.md) rule

- 7b601ee: betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v4.0.1 to v4.1.1](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v4.0.1...v4.1.1):
  - The plugin now supports linting CSS files. Following this, we now add `files` and `ignores` from `css` config to the corresponding fields of `betterTailwind` config, unless `cssLinting` option is set to `false`.

- 8706076: cypress: updated [`eslint-plugin-cypress` from v6.2.0 to v6.3.1](https://github.com/cypress-io/eslint-plugin-cypress/compare/v6.2.0...v6.3.1):
  - 🟢 enabled [`no-and`](https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/docs/rules/no-and.md) rule and added it to the `noStylisticRules` config

- 54a3235: formatJs: updated [`eslint-plugin-formatjs` from v6.1.0 to v6.4.5](https://github.com/formatjs/formatjs/compare/eslint-plugin-formatjs@6.1.0...eslint-plugin-formatjs@6.4.5):
  - 🟢 enabled [`prefer-full-sentence`](https://formatjs.github.io/docs/tooling/linter/#prefer-full-sentence) rule

- 23c6674: sonar: updated [`eslint-plugin-sonarjs` from v3.0.6 to v4.0.0](https://github.com/SonarSource/SonarJS/blob/5cb55cfc15548a31ca0061eccb533ce8b409eb1c/packages/jsts/src/rules/CHANGELOG.md#2026-02-18-version-400#2026-02-18-version-400):
  - 🟢 enabled [`no-session-cookies-on-static-assets`](https://sonarsource.github.io/rspec/#/rspec/S8441/javascript) rule
  - ❌ `code-eval` rule was removed
  - ❌ `enforce-trailing-comma` rule was removed

- 024a011: nodeDependencies: updated [`eslint-plugin-node-dependencies` from v1.3.0 to v2.2.0](https://github.com/ota-meshi/eslint-plugin-node-dependencies/compare/v1.3.0...v2.2.0):
  - [`compat-engines`](https://github.com/ota-meshi/eslint-plugin-node-dependencies/blob/HEAD/docs/rules/compat-engines.md) rule: set `devDependencies: true`

- e696acc: angular: updated [`@angular-eslint/*` from v21.1.0 to v21.2.0](https://github.com/angular-eslint/angular-eslint/compare/v21.1.0...v21.2.0):
  - 🟢 enabled [`no-implicit-take-until-destroyed`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-implicit-take-until-destroyed.md) rule
  - 🟢 enabled [`template/prefer-class-binding`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-class-binding.md) rule

- 0bdd66e: ts: introduced `setup` and `typeAware/setup` sub-configs, allowing separately configuring on which files `typescript-eslint` plugin will be operating. These configs do not inherit `files` and `ignores` from their parents, but `typeAware/setup` config do inherit `files` and `ignores` from `setup` sub-config, unless the respective property is specified or `typeAware` config is disabled.
- d7c8d71: vue: updated [`@intlify/eslint-plugin-vue-i18n` from v4.1.1 to v4.3.0](https://github.com/intlify/eslint-plugin-vue-i18n/compare/v4.1.1...v4.3.0):
  - 🟢 enabled [`valid-plural-forms`](https://eslint-plugin-vue-i18n.intlify.dev/rules/valid-plural-forms.html#intlify-vue-i18n-valid-plural-forms) rule

- 62f84c1: ava: updated [`eslint-plugin-ava` from v15.1.0 to v16.0.1](https://github.com/avajs/eslint-plugin-ava/compare/v15.1.0...v16.0.1):
  - 🔴 not enabled [`failing-test-url`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/failing-test-url.md) rule
  - 🔴 not enabled [`no-ava-in-dependencies`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-ava-in-dependencies.md) rule
  - 🟡 enabled [`no-commented-tests`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-commented-tests.md) rule (warning)
  - 🟢 enabled [`no-conditional-assertion`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-conditional-assertion.md) rule
  - 🟢 enabled [`no-duplicate-hooks`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-duplicate-hooks.md) rule
  - ⚠️ [`no-duplicate-modifiers`](https://github.com/avajs/eslint-plugin-ava/blob/v16.0.1/docs/rules/no-duplicate-modifiers.md) rule was disabled because got deprecated
  - 🟢 enabled [`no-invalid-modifier-chain`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-invalid-modifier-chain.md) rule
  - 🟢 enabled [`no-negated-assertion`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-negated-assertion.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`no-nested-assertions`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-nested-assertions.md) rule
  - ⚠️ [`no-unknown-modifiers`](https://github.com/avajs/eslint-plugin-ava/blob/v16.0.1/docs/rules/no-unknown-modifiers.md) rule was disabled because got deprecated
  - 🟢 enabled [`no-useless-t-pass`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/no-useless-t-pass.md) rule
  - 🟢 enabled [`prefer-t-throws`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/prefer-t-throws.md) rule and added it to the `noStylisticRules` config
  - added [`prefer-t-regex`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/prefer-t-regex.md) to the `noStylisticRules` config
  - 🟢 enabled [`require-assertion`](https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/require-assertion.md) rule

- b2e0e49: header: added types for the single `eslint-plugin-header` rule, `header`
- 643d6e3: vitest: updated [`@vitest/eslint-plugin` from v1.6.9 to v1.6.16](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.6.9...v1.6.16):
  - 🟢 enabled [`unbound-method`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/unbound-method.md) rule in ⚙️ `typescript` sub-config

- 9f21ebe: sonar: updated [`eslint-plugin-sonarjs` from v4.0.0 to v4.0.3](https://github.com/SonarSource/SonarJS/blob/02bce2e6b6c75bac9e1bcf6c8641994dcb9df2d4/packages/analysis/src/jsts/rules/CHANGELOG.md):
  - 🟢 enabled [`dompurify-unsafe-config`](https://sonarsource.github.io/rspec/#/rspec/S5850/javascript) rule
  - ⚠️ [\`no-unsafe-unzip\`](https://sonarsource.github.io/rspec/#/rspec/S5042/javascript) rule was disabled because got deprecated

- 1d26b3e: stylistic: updated [`@stylistic/eslint-plugin` from v5.8.0 to v5.9.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v5.8.0...v5.9.0)
  - [`padding-line-between-statements`] rule is now configured by eslint-config-un to allow empty lines between normal and side-effects only imports (`import 'some-module'`).

- 24855cb: qwik: updated [`eslint-plugin-qwik` from v1.18.0 to v1.19.2](https://github.com/QwikDev/qwik/compare/eslint-plugin-qwik@1.18.0...eslint-plugin-qwik@1.19.2):
  - 🟢 enabled [`no-async-prevent-default`](https://qwik.dev/docs/core/events/#preventdefault--stoppropagation) rule

- a855d6f: html: updated [`@html-eslint/*` from v0.58.1 to v0.59.0](https://github.com/yeonjuan/html-eslint/compare/v0.58.1...v0.59.0):
  - 🟢 enabled [`require-content`](https://html-eslint.org/docs/rules/require-content) rule
  - 🟢 enabled [`svg-require-viewbox`](https://html-eslint.org/docs/rules/svg-require-viewbox) rule

- 752ff97: <!-- cspell:ignore subexpression linkto quoteless -->

  ember: updated [`eslint-plugin-ember` from v12.7.5 to v13.0.0](https://github.com/ember-cli/eslint-plugin-ember/compare/v12.7.5-eslint-plugin-ember...v13.0.0):
  - 🟢 enabled [`no-modifier-argument-destructuring`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/no-modifier-argument-destructuring.md) rule
  - 🟢 enabled [`no-tracked-built-ins`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/no-tracked-built-ins.md) rule
  - 🔴 not enabled [`template-attribute-indentation`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-attribute-indentation.md) rule, but added it to the `noStylisticRules` config
  - 🟢 enabled [`template-attribute-order`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-attribute-order.md) rule and added it to the `noStylisticRules` config
  - 🔴 not enabled [`template-block-indentation`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-block-indentation.md) rule, but added it to the `noStylisticRules` config
  - 🟢 enabled [`template-builtin-component-arguments`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-builtin-component-arguments.md) rule
  - 🟢 enabled [`template-deprecated-inline-view-helper`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-deprecated-inline-view-helper.md) rule
  - 🟢 enabled [`template-deprecated-render-helper`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-deprecated-render-helper.md) rule
  - 🔴 not enabled [`template-eol-last`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-eol-last.md) rule, but added it to the `noStylisticRules` config
  - 🔴 not enabled [`template-linebreak-style`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-linebreak-style.md) rule, but added it to the `noStylisticRules` config
  - 🟢 enabled [`template-link-href-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-link-href-attributes.md) rule
  - 🟢 enabled [`template-link-rel-noopener`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-link-rel-noopener.md) rule
  - 🟢 enabled [`template-modifier-name-case`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-modifier-name-case.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-abstract-roles`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-abstract-roles.md) rule
  - 🟢 enabled [`template-no-accesskey-attribute`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-accesskey-attribute.md) rule
  - 🟢 enabled [`template-no-action-modifiers`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-action-modifiers.md) rule
  - 🔴 not enabled [`template-no-action-on-submit-button`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-action-on-submit-button.md) rule
  - 🟢 enabled [`template-no-action`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-action.md) rule
  - 🟢 enabled [`template-no-args-paths`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-args-paths.md) rule
  - 🟢 enabled [`template-no-arguments-for-html-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-arguments-for-html-elements.md) rule
  - 🟢 enabled [`template-no-aria-hidden-body`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-aria-hidden-body.md) rule
  - 🟢 enabled [`template-no-aria-unsupported-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-aria-unsupported-elements.md) rule
  - 🟢 enabled [`template-no-array-prototype-extensions`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-array-prototype-extensions.md) rule
  - 🟢 enabled [`template-no-at-ember-render-modifiers`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-at-ember-render-modifiers.md) rule
  - 🟢 enabled [`template-no-attrs-in-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-attrs-in-components.md) rule
  - 🟢 enabled [`template-no-autofocus-attribute`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-autofocus-attribute.md) rule
  - 🔴 not enabled [`template-no-bare-strings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-bare-strings.md) rule
  - 🟢 enabled [`template-no-bare-yield`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-bare-yield.md) rule
  - 🟢 enabled [`template-no-block-params-for-html-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-block-params-for-html-elements.md) rule
  - 🟢 enabled [`template-no-builtin-form-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-builtin-form-components.md) rule
  - 🟢 enabled [`template-no-capital-arguments`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-capital-arguments.md) rule
  - 🟢 enabled [`template-no-chained-this`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-chained-this.md) rule
  - 🟢 enabled [`template-no-class-bindings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-class-bindings.md) rule
  - 🟢 enabled [`template-no-curly-component-invocation`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-curly-component-invocation.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-debugger`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-debugger.md) rule
  - 🟢 enabled [`template-no-deprecated`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-deprecated.md) rule
  - 🟢 enabled [`template-no-duplicate-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-duplicate-attributes.md) rule
  - 🟢 enabled [`template-no-duplicate-id`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-duplicate-id.md) rule
  - 🟢 enabled [`template-no-duplicate-landmark-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-duplicate-landmark-elements.md) rule
  - 🟢 enabled [`template-no-dynamic-subexpression-invocations`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-dynamic-subexpression-invocations.md) rule
  - 🟢 enabled [`template-no-element-event-actions`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-element-event-actions.md) rule
  - 🟢 enabled [`template-no-empty-headings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-empty-headings.md) rule
  - 🟢 enabled [`template-no-extra-mut-helper-argument`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-extra-mut-helper-argument.md) rule
  - 🟢 enabled [`template-no-forbidden-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-forbidden-elements.md) rule
  - 🟢 enabled [`template-no-heading-inside-button`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-heading-inside-button.md) rule
  - 🔴 not enabled [`template-no-html-comments`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-html-comments.md) rule
  - 🟢 enabled [`template-no-implicit-this`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-implicit-this.md) rule
  - 🟢 enabled [`template-no-index-component-invocation`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-index-component-invocation.md) rule
  - 🟢 enabled [`template-no-inline-event-handlers`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-inline-event-handlers.md) rule
  - 🟢 enabled [`template-no-inline-linkto`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-inline-linkto.md) rule
  - 🟢 enabled [`template-no-inline-styles`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-inline-styles.md) rule
  - 🟢 enabled [`template-no-input-block`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-input-block.md) rule
  - 🟢 enabled [`template-no-input-tagname`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-input-tagname.md) rule
  - 🟢 enabled [`template-no-invalid-aria-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-aria-attributes.md) rule
  - 🟢 enabled [`template-no-invalid-interactive`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-interactive.md) rule
  - 🔴 not enabled [`template-no-invalid-link-text`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-link-text.md) rule
  - 🟢 enabled [`template-no-invalid-link-title`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-link-title.md) rule
  - 🟢 enabled [`template-no-invalid-meta`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-meta.md) rule
  - 🟢 enabled [`template-no-invalid-role`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-invalid-role.md) rule
  - 🟢 enabled [`template-no-jsx-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-jsx-attributes.md) rule
  - 🟢 enabled [`template-no-link-to-positional-params`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-link-to-positional-params.md) rule
  - 🟢 enabled [`template-no-link-to-tagname`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-link-to-tagname.md) rule
  - 🟢 enabled [`template-no-log`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-log.md) rule
  - 🟢 enabled [`template-no-model-argument-in-route-templates`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-model-argument-in-route-templates.md) rule
  - 🟢 enabled [`template-no-multiple-empty-lines`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-multiple-empty-lines.md) rule
  - 🟢 enabled [`template-no-mut-helper`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-mut-helper.md) rule
  - 🟢 enabled [`template-no-negated-condition`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-negated-condition.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-nested-interactive`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-nested-interactive.md) rule
  - 🟢 enabled [`template-no-nested-landmark`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-nested-landmark.md) rule
  - 🟢 enabled [`template-no-nested-splattributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-nested-splattributes.md) rule
  - 🟢 enabled [`template-no-obscure-array-access`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-obscure-array-access.md) rule
  - 🟢 enabled [`template-no-obsolete-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-obsolete-elements.md) rule
  - 🟢 enabled [`template-no-only-default-slot`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-only-default-slot.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-outlet-outside-routes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-outlet-outside-routes.md) rule
  - 🟢 enabled [`template-no-page-title-component`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-page-title-component.md) rule
  - 🟢 enabled [`template-no-passed-in-event-handlers`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-passed-in-event-handlers.md) rule
  - 🟢 enabled [`template-no-pointer-down-event-binding`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-pointer-down-event-binding.md) rule
  - 🟢 enabled [`template-no-positional-data-test-selectors`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-positional-data-test-selectors.md) rule
  - 🟢 enabled [`template-no-positive-tabindex`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-positive-tabindex.md) rule
  - 🟢 enabled [`template-no-potential-path-strings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-potential-path-strings.md) rule
  - 🟢 enabled [`template-no-quoteless-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-quoteless-attributes.md) rule
  - 🟢 enabled [`template-no-redundant-fn`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-redundant-fn.md) rule
  - 🟢 enabled [`template-no-redundant-role`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-redundant-role.md) rule
  - 🔴 not enabled [`template-require-form-method`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-form-method.md) rule
  - 🔴 not enabled [`template-require-splattributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-splattributes.md) rule
  - 🔴 not enabled [`template-require-strict-mode`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-strict-mode.md) rule
  - 🟢 enabled [`template-no-restricted-invocations`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-restricted-invocations.md) rule
  - 🟢 enabled [`template-no-route-action`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-route-action.md) rule
  - 🟢 enabled [`template-no-scope-outside-table-headings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-scope-outside-table-headings.md) rule
  - 🟢 enabled [`template-no-shadowed-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-shadowed-elements.md) rule
  - 🟢 enabled [`template-no-splattributes-with-class`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-splattributes-with-class.md) rule
  - 🟢 enabled [`template-no-this-in-template-only-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-this-in-template-only-components.md) rule
  - 🟢 enabled [`template-no-trailing-spaces`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-trailing-spaces.md) rule
  - 🟢 enabled [`template-no-triple-curlies`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-triple-curlies.md) rule
  - 🟢 enabled [`template-no-unavailable-this`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unavailable-this.md) rule
  - 🟢 enabled [`template-no-unbalanced-curlies`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unbalanced-curlies.md) rule
  - 🟢 enabled [`template-no-unbound`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unbound.md) rule
  - 🟢 enabled [`template-no-unknown-arguments-for-builtin-components`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unknown-arguments-for-builtin-components.md) rule
  - 🟢 enabled [`template-no-unnecessary-component-helper`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unnecessary-component-helper.md) rule
  - 🟢 enabled [`template-no-unnecessary-concat`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unnecessary-concat.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-unnecessary-curly-parens`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unnecessary-curly-parens.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-unnecessary-curly-strings`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unnecessary-curly-strings.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-no-unsupported-role-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unsupported-role-attributes.md) rule
  - 🟢 enabled [`template-no-unused-block-params`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-unused-block-params.md) rule
  - 🟢 enabled [`template-no-valueless-arguments`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-valueless-arguments.md) rule
  - 🟢 enabled [`template-no-whitespace-for-layout`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-whitespace-for-layout.md) rule
  - 🟡 enabled [`template-no-whitespace-within-word`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-whitespace-within-word.md) rule (warning)
  - 🟢 enabled [`template-no-with`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-with.md) rule
  - 🟢 enabled [`template-no-yield-block-params-to-else-inverse`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-yield-block-params-to-else-inverse.md) rule
  - 🟢 enabled [`template-no-yield-only`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-yield-only.md) rule
  - 🟢 enabled [`template-no-yield-to-default`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-no-yield-to-default.md) rule
  - 🟢 enabled [`template-quotes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-quotes.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-require-aria-activedescendant-tabindex`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-aria-activedescendant-tabindex.md) rule
  - 🟢 enabled [`template-require-button-type`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-button-type.md) rule
  - 🟢 enabled [`template-require-context-role`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-context-role.md) rule
  - 🟢 enabled [`template-require-each-key`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-each-key.md) rule
  - 🟢 enabled [`template-require-has-block-helper`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-has-block-helper.md) rule
  - 🟢 enabled [`template-require-iframe-src-attribute`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-iframe-src-attribute.md) rule
  - 🟢 enabled [`template-require-iframe-title`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-iframe-title.md) rule
  - 🟢 enabled [`template-require-input-label`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-input-label.md) rule
  - 🟢 enabled [`template-require-lang-attribute`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-lang-attribute.md) rule
  - 🟢 enabled [`template-require-mandatory-role-attributes`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-mandatory-role-attributes.md) rule
  - 🟢 enabled [`template-require-media-caption`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-media-caption.md) rule
  - 🟢 enabled [`template-require-presentational-children`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-presentational-children.md) rule
  - 🟢 enabled [`template-require-valid-alt-text`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-valid-alt-text.md) rule
  - 🟢 enabled [`template-require-valid-form-groups`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-valid-form-groups.md) rule
  - 🟢 enabled [`template-require-valid-named-block-naming-format`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-require-valid-named-block-naming-format.md) rule
  - 🟢 enabled [`template-self-closing-void-elements`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-self-closing-void-elements.md) rule
  - 🟢 enabled [`template-simple-modifiers`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-simple-modifiers.md) rule
  - 🟢 enabled [`template-simple-unless`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-simple-unless.md) rule
  - 🟢 enabled [`template-sort-invocations`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-sort-invocations.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`template-splat-attributes-only`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-splat-attributes-only.md) rule
  - 🟢 enabled [`template-style-concatenation`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-style-concatenation.md) rule
  - 🟢 enabled [`template-table-groups`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-table-groups.md) rule
  - 🔴 not enabled [`template-template-length`](https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/template-template-length.md) rule, but added it to the `noStylisticRules` config

- 2b21521: zod: updated [`eslint-plugin-zod` from v3.0.2 to v3.5.0](https://github.com/marcalexiei/eslint-plugin-zod/compare/v3.0.2...v3.5.0):
  - 🟢 enabled [`consistent-import`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/consistent-import.md) rule and added it to the `noStylisticRules` config
  - 🟢 enabled [`no-string-schema-with-uuid`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/no-string-schema-with-uuid.md) rule
  - ⚠️ [`prefer-namespace-import`](https://github.com/marcalexiei/eslint-plugin-zod/blob/v3.5.0/docs/rules/prefer-namespace-import.md) rule was disabled because got deprecated
  - - 🔴 not enabled [`prefer-string-schema-with-trim`](https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/prefer-string-schema-with-trim.md) rule

- 024e641: e18e: updated [`@e18e/eslint-plugin` from v0.1.3 to v0.1.4](https://github.com/e18e/eslint-plugin/compare/0.1.3...0.1.4):
  - 🟢 enabled [`prefer-array-some`](https://github.com/e18e/eslint-plugin/blob/1dc399be6eb9dcee207e5cd63ef184bd6c902492/src/rules/prefer-array-some.ts#L115) rule

- 26ae481: [**BREAKING**] Dropped support for Node.js 20. While the config might continue to work in v20, the officially supported Node.js versions range is now `^22.18.0 || >=24`
- d1a8b97: betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v4.3.2 to v4.4.1](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v4.3.2...v4.4.1):
  - ❓ enabled conditionally [`enforce-consistent-variant-order`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-variant-order.md) rule (only for Tailwind 4) and added it to the `noStylisticRules` config
  - 🔴 not enabled [`enforce-logical-properties`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-logical-properties.md) rule

- edf78aa: css: `customSyntax` in the function form now receives `defaultSyntax` property in its first argument, containing the default CSS syntax used in `@eslint/css`. It is coming from `@eslint/css-tree` package so if it cannot be resolved, you will be prompted to install it if you use this function form.
- 2d40b0e: lockfile: updated [`eslint-plugin-lockfile` from v1.0.0 to v1.1.0](https://github.com/ljharb/lockfile-tools/compare/eslint-plugin-lockfile@1.0.0...eslint-plugin-lockfile@1.1.0):
  - 🟢 enabled [`shrinkwrap`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/shrinkwrap.md) rule

- 6e033cc: react: updated [`eslint-plugin-react-hooks` from v7.0.1 to v7.1.1](https://github.com/facebook/react/blob/1ddff43c41147b880c22eb363e07aade5a71c5d9/packages/eslint-plugin-react-hooks/CHANGELOG.md):
  - ❓ enabled conditionally `exhaustive-effect-dependencies` and `memo-dependencies` rules in ⚙️ `hooks` sub-config
  - ❌ `automatic-effect-dependencies` and `fire` rule were removed
  - ⚠️ `component-hook-factories` rule was disabled because got deprecated

### Patch Changes

- 693db19: jsonSchemaValidator: updated [`eslint-plugin-json-schema-validator` from v6.0.0 to v6.0.3](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v6.0.0...v6.0.3)
- d43ac61: html: updated [`@html-eslint/*` from v0.53.0 to v0.54.2](https://github.com/yeonjuan/html-eslint/compare/v0.53.0...v0.54.0)
- 87c3972: deMorgan: updated [`eslint-plugin-de-morgan` from v2.0.0 to v2.1.1](https://github.com/azat-io/eslint-plugin-de-morgan/compare/v2.0.0...v2.1.1)
- 78a2737: markdown: updated [`eslint-plugin-sentences-per-line` from v0.1.0 to v0.1.2](https://github.com/JoshuaKGoldberg/sentences-per-line/compare/eslint-plugin-sentences-per-line@v0.1.0...eslint-plugin-sentences-per-line@v0.1.2)
- 3d6b7a7: clsx: updated [`eslint-plugin-clsx` from v0.0.12 to v0.1.0](https://github.com/temoncher/eslint-plugin-clsx/compare/v0.0.12...v0.1.0)
- bc56d23: yaml: updated [`eslint-plugin-yml` from v3.0.0 to v3.3.1](https://github.com/ota-meshi/eslint-plugin-yml/compare/v3.0.0...v3.3.1)
- e8a23bc: Set [`ignoreVBindObject: true`](https://eslint.vuejs.org/rules/attributes-order.html#ignorevbindobject-true) for [`attributes-order`](https://eslint.vuejs.org/rules/attributes-order.html) rule
- 2a2d101: regexp: updated [`eslint-plugin-regexp` from v2.10.0 to v3.0.0](https://github.com/ota-meshi/eslint-plugin-regexp/compare/v2.10.0...v3.0.0)
- ad3a182: format: updated [`eslint-plugin-format` from v1.3.1 to v2.0.1](https://github.com/antfu/eslint-plugin-format/compare/v1.3.1...v2.0.1):
  - ❓ enabled conditionally [`oxfmt`](https://github.com/antfu/eslint-plugin-format/tree/main#formatoxfmt) rule based on what formatter is specified in `formatter` config option

- 857dd61: perfectionist: updated [`eslint-plugin-perfectionist` from v5.4.0 to v5.6.0](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v5.4.0...v5.6.0)
- 139d417: mdx: updated [`eslint-plugin-mdx` from v3.6.2 to v3.7.0](https://github.com/mdx-js/eslint-mdx/compare/eslint-plugin-mdx@3.6.2...eslint-plugin-mdx@3.7.0)
- de984e7: ts: updated [`typescript-eslint` from v8.56.1 to v8.59.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.56.1...v8.59.0)
- 36715e6: [**BREAKING**] markdownPreferences: option `extendedMarkdownSyntax` is now set to `false` by default because
  - It was causing all Markdown files parsed with `extended-syntax` language, likely overriding the language set in `markdown` config;
  - The extension supported by the plugin are not widely used.

  Now, if this option is enabled, ESLint config(s) produced by `markdownPreferences` plugin will be put after config(s) produced by `markdown` config, essentially overriding matching files' language. If this option is disabled, it will be put before `markdown` and therefore `markdown` config(s) will take precedence.

- e13a4f7: markdownPreferences: updated [`eslint-plugin-markdown-preferences` from v0.40.3 to v0.41.1](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/compare/v0.40.3...v0.41.1)
- 0dc3d30: fastImport: updated [`eslint-plugin-fast-import` from v2.0.0 to v2.2.1](https://github.com/nebrius/eslint-plugin-fast-import/compare/2.0.0...2.2.1)
- 89256ff: cspell: updated [`@cspell/eslint-plugin` from v9.6.0 to v9.7.0](https://github.com/streetsidesoftware/cspell/compare/v9.6.0...v9.7.0)
- 36d2ade: yaml, githubActions: move special GitHub Action files handling from `yaml` to `githubActions` config
- b8c49f8: vue: fixed an issue resulting in `enforceTypescriptInScriptSection` sub config ended up not being used
- af0b00f: <!-- cspell:ignore getorinsert getorinsertcomputed weakmap -->

  es: updated [`eslint-plugin-es-x` from v9.3.0 to v9.5.0](https://github.com/eslint-community/eslint-plugin-es-x/compare/v9.3.0...v9.5.0):
  - ❓ enabled conditionally [`no-map-prototype-getorinsert`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-map-prototype-getorinsert.html) rule
  - ❓ enabled conditionally [`no-map-prototype-getorinsertcomputed`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-map-prototype-getorinsertcomputed.html) rule
  - ❓ enabled conditionally [`no-weakmap-prototype-getorinsert`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-weakmap-prototype-getorinsert.html) rule
  - ❓ enabled conditionally [`no-weakmap-prototype-getorinsertcomputed`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-weakmap-prototype-getorinsertcomputed.html) rule

- 613b8e2: jsdoc: updated [`eslint-plugin-jsdoc` from v62.8.0 to v62.9.0](https://github.com/gajus/eslint-plugin-jsdoc/compare/v62.8.0...v62.9.0)
- f323cc5: svelte: added a separate `setup` sub-config which configures parser for `.svelte` and `.svelte.{js,ts}` files and is completely independent from the main `svelte` config
- 934dac6: vitest: updated [`@vitest/eslint-plugin` from v1.6.6 to v1.6.9](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.6.6...v1.6.9)
- 7db9d81: packageJson: updated [`eslint-plugin-package-json` from v0.88.1 to v0.88.3](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.88.1...v0.88.3)
- 17fefd4: json: updated [`eslint-plugin-jsonc` from v3.1.1 to v3.1.2](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v3.1.1...v3.1.2)
- e5ae5a1: qunit: updated [`eslint-plugin-qunit` from v8.2.5 to v8.2.6](https://github.com/platinumazure/eslint-plugin-qunit/compare/v8.2.5...v8.2.6)
- a3b7ec6: eslintComments: updated [`@eslint-community/eslint-plugin-eslint-comments` from v4.6.0 to v4.7.1](https://github.com/eslint-community/eslint-plugin-eslint-comments/compare/v4.6.0...v4.7.1)
- df175e9: noUnsanitized: updated [`eslint-plugin-no-unsanitized` from v4.1.4 to v4.1.5](https://github.com/mozilla/eslint-plugin-no-unsanitized/compare/v4.1.4...v4.1.5)
- 1935a7a: unicorn: updated [`eslint-plugin-unicorn` from v62.0.0 to v63.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v62.0.0...v63.0.0):
  - 🔴 not enabled [`isolated-functions`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/isolated-functions.md) rule

- bc3e063: ts: updated [`typescript-eslint` from v8.53.0 to v8.54.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.53.0...v8.54.0)
- f8cc84b: boundaries: updated [`eslint-plugin-boundaries` from v5.3.1 to v6.0.2](https://github.com/javierbrea/eslint-plugin-boundaries/compare/v5.3.1...v6.0.2)
- 7ae8f6b: [**BREAKING**] toml: removed `doNotMergeFilesWithDefault` option
- 0fbb6db: vue: updated [`vue-eslint-parser` from v10.2.0 to v10.4.0](https://github.com/vuejs/vue-eslint-parser/compare/v10.2.0...v10.4.0)
- c6b307e: markdownLinks: updated [`eslint-plugin-markdown-links` from v0.7.1 to v0.9.0](https://github.com/ota-meshi/eslint-plugin-markdown-links/compare/v0.7.1...v0.9.0)
- dc13298: fastImport: updated [`eslint-plugin-fast-import` from v1.8.0 to v2.0.0](https://github.com/nebrius/eslint-plugin-fast-import/compare/1.8.0...2.0.0):
  - 🔴 not enabled [`no-node-builtins`](https://github.com/nebrius/eslint-plugin-fast-import/blob/HEAD/src/rules/no-node-builtins/README.md) rule
  - 🔴 not enabled [`prefer-alias-imports`](https://github.com/nebrius/eslint-plugin-fast-import/blob/HEAD/src/rules/prefer-alias-imports/README.md) rule and added it to the `noStylisticRules` config

- 5510e35: githubActions: updated [`eslint-plugin-github-action` from v0.1.0 to v0.2.0](https://github.com/ntnyq/eslint-plugin-github-action/compare/v0.1.0...v0.2.0)
- 7c44c70: testingLibrary: updated [`eslint-plugin-testing-library` from v7.15.4 to v7.16.2](https://github.com/testing-library/eslint-plugin-testing-library/compare/v7.15.4...v7.16.2)
- 483f54f: svelte: updated [`eslint-plugin-svelte` from v3.14.0 to v3.17.0](https://github.com/sveltejs/eslint-plugin-svelte/compare/eslint-plugin-svelte@3.14.0...eslint-plugin-svelte@3.17.0):
  - 🔴 not enabled [`max-lines-per-block`](https://sveltejs.github.io/eslint-plugin-svelte/rules/max-lines-per-block) rule

- 966adac: antfu: updated [`eslint-plugin-antfu` from v3.1.3 to v3.2.2](https://github.com/antfu/eslint-plugin-antfu/compare/v3.1.3...v3.2.2)
- b0300bc: webComponents: updated [`eslint-plugin-wc` from v3.0.2 to v3.1.0](https://github.com/43081j/eslint-plugin-wc/compare/3.0.2...3.1.0)
- 69c8acb: vue: applying config with default parameters on .vue files no longer crashes if Vue version cannot be determined. Additionally, now a console warning is printed if this happens
- 4bd61d8: vitest: set `fixable: false` for [`no-focused-tests`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-focused-tests.md) rule, which disables the autofix
- e539a2d: astro: updated [`astro-eslint-parser` from v1.2.2 to v1.3.0](https://github.com/ota-meshi/astro-eslint-parser/compare/v1.2.2...v1.3.0)
- c2ace14: fastImport: plugin settings are now correctly assigned to `fast-import`, not `fastImport` property
- 8cd3211: stylistic: updated [`@stylistic/eslint-plugin` from v5.9.0 to v5.10.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v5.9.0...v5.10.0)
- 87e5ad8: stylistic: updated [`@stylistic/eslint-plugin` from v5.7.0 to v5.8.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v5.7.0...v5.8.0):
  - 🔴 not enabled [`exp-jsx-props-style`](https://github.com/eslint-stylistic/eslint-stylistic/blob/HEAD/packages/eslint-plugin/rules/jsx-props-style/README.md) rule

- 3872780: eslintPlugin: updated [`eslint-plugin-eslint-plugin` from v7.3.0 to v7.3.2](https://github.com/eslint-community/eslint-plugin-eslint-plugin/compare/v7.3.0...v7.3.2)
- 189a67a: storybook: updated [`eslint-plugin-storybook` from v10.1.11 to v10.3.5](https://github.com/storybookjs/storybook/compare/v10.1.11...v10.3.5)
- 56a653f: unusedImports: updated [`eslint-plugin-unused-imports` from v4.3.0 to v4.4.1](https://github.com/sweepline/eslint-plugin-unused-imports/compare/v4.3.0...v4.4.1)
- ba06fb3: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v7.1.14 to v7.1.18](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v7.1.14...v7.1.18)
- afca3eb: nx: updated [`@nx/eslint-plugin` from v22.3.3 to v22.6.5](https://github.com/nrwl/nx/compare/22.3.3...22.6.5)
- cec647d: depend: updated [`eslint-plugin-depend` from v1.4.0 to v1.5.0](https://github.com/es-tooling/eslint-plugin-depend/compare/1.4.0...1.5.0)
- 0ffa044: betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v4.1.1 to v4.3.2](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v4.1.1...v4.3.2)
- e2422ff: regexp: updated [`eslint-plugin-regexp` from v3.0.0 to v3.1.0](https://github.com/ota-meshi/eslint-plugin-regexp/compare/v3.0.0...v3.1.0)
- c690ce5: noSecrets: updated [`eslint-plugin-no-secrets` from v2.2.1 to v2.3.3](https://github.com/nickdeis/eslint-plugin-no-secrets/compare/46a916ac4970582bd1cd1ed334896368bc232514..fe95b10ac26be814327bb58ab97935c392adc4a1)
- e8ded39: jest: updated [`eslint-plugin-jest` from v29.12.1 to v29.15.2](https://github.com/jest-community/eslint-plugin-jest/compare/v29.12.1...v29.15.2)
- 7682215: jsInline: updated [`eslint-plugin-html` from v8.1.3 to v8.1.4](https://github.com/BenoitZugmeyer/eslint-plugin-html/compare/v8.1.3...v8.1.4)
- a42d1e3: e18e: updated [`@e18e/eslint-plugin` from v0.2.0 to v0.3.0](https://github.com/e18e/eslint-plugin/compare/0.2.0...0.3.0)
- 8bb885d: css: updated [`@eslint/css` from v0.14.1 to v1.0.0](https://github.com/eslint/css/compare/css-v0.14.1...css-v1.0.0)
- 446a14d: vue: updated [`@nuxt/eslint-plugin` from v1.15.1 to v1.15.2](https://github.com/nuxt/eslint/compare/v1.15.1...v1.15.2)
- e549518: import: updated [`eslint-plugin-import-x` from v4.16.1 to v4.16.2](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.16.1...v4.16.2)
- 85e9d1d: security: updated [`eslint-plugin-security` from v3.0.1 to v4.0.0](https://github.com/eslint-community/eslint-plugin-security/compare/v3.0.1...eslint-plugin-security-v4.0.0)
- ad310f8: jsdoc: updated [`eslint-plugin-jsdoc` from v62.7.1 to v62.8.0](https://github.com/gajus/eslint-plugin-jsdoc/compare/v62.7.1...v62.8.0)
- 5be848d: css: updated [`@eslint/css` from v1.0.0 to v1.1.0](https://github.com/eslint/css/compare/css-v1.0.0...css-v1.1.0)
- 16b66ea: fileProgress: updated [`eslint-plugin-file-progress` from v3.0.2 to v4.0.0](https://github.com/sibiraj-s/eslint-plugin-file-progress/compare/v3.0.2...v4.0.0)
- 9ba9875: ts: updated [`typescript-eslint` from v8.54.0 to v8.56.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.54.0...v8.56.1)
- 23d9b1c: svelte: updated [`svelte-eslint-parser` from v1.4.1 to v1.6.0](https://github.com/sveltejs/svelte-eslint-parser/compare/v1.4.1...v1.6.0)
- 9714f19: astro: updated [`eslint-plugin-astro` from v1.5.0 to v1.6.0](https://github.com/ota-meshi/eslint-plugin-astro/compare/v1.5.0...v1.6.0)
- 31ccf61: packageJson: updated [`eslint-plugin-package-json` from v0.91.0 to v0.91.1](https://github.com/michaelfaith/eslint-plugin-package-json/compare/v0.91.0...v0.91.1)
- c91b8ca: tanstackQuery: updated [`@tanstack/eslint-plugin-query` from v5.91.2 to v5.99.2](https://github.com/TanStack/query/compare/%40tanstack/eslint-plugin-query%405.91.2...release-2026-04-19-1059):
  - 🔴 not enabled [`prefer-query-options`](https://tanstack.com/query/latest/docs/eslint/prefer-query-options) rule

- e7f0493: lit: updated [`eslint-plugin-lit` from v2.1.1 to v2.2.1](https://github.com/43081j/eslint-plugin-lit/compare/2.1.1...2.2.1)
- 248fdef: tailwind: updated [`eslint-plugin-tailwindcss` from v3.18.2 to v3.18.3](https://github.com/francoismassart/eslint-plugin-tailwindcss/compare/v3.18.2...v3.18.3)
- 4924ffb: cssInJs: made sure that plugin settings are assigned to `css.target`, not just `css` property
- 8e5506f: cspell: updated [`@cspell/eslint-plugin` from v9.7.0 to v10.0.0](https://github.com/streetsidesoftware/cspell/compare/v9.7.0...v10.0.0)
- e4956ea: [**BREAKING**] yaml: removed `doNotMergeFilesWithDefault` option
- 8e0f4b3: perfectionist: updated [`eslint-plugin-perfectionist` from v5.6.0 to v5.9.0](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v5.6.0...v5.9.0):
  - 🔴 not enabled [`sort-arrays`](https://perfectionist.dev/rules/sort-arrays) rule, added corresponding `configSortArrays` sub-config

- 550ffc3: jsonSchemaValidator: updated [`eslint-plugin-json-schema-validator` from v6.0.3 to v6.2.0](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v6.0.3...v6.2.0)
- bfda3af: command: updated [`eslint-plugin-command` from v3.4.0 to v3.5.2](https://github.com/antfu/eslint-plugin-command/compare/v3.4.0...v3.5.2)
- 473ef30: cssInJs: updated [`eslint-plugin-css` from v0.11.1 to v0.12.0](https://github.com/ota-meshi/eslint-plugin-css/compare/v0.11.1...v0.12.0)
- a126159: markdownPreferences: updated [`eslint-plugin-markdown-preferences` from v0.40.2 to v0.40.3](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/compare/v0.40.2...v0.40.3)
- d838874: astro: updated [`astro-eslint-parser` from v1.3.0 to v1.4.0](https://github.com/ota-meshi/astro-eslint-parser/compare/v1.3.0...v1.4.0)
- 5903d3e: tanstackRouter: updated [`@tanstack/eslint-plugin-router` from v1.141.0 to v1.161.6](https://github.com/TanStack/router/compare/7593e30a1d49f4f11f7833ca7c9a0d93d2da7f4a...release-2026-03-15-2243):
  - 🟢 enabled [`route-param-names`](https://github.com/TanStack/router/blob/0166fe8ba0f3492f26d32eeb50548beae6641a07/packages/eslint-plugin-router/src/rules/route-param-names/route-param-names.rule.ts) rule

- c103cb4: pnpm: updated [`eslint-plugin-pnpm` from v1.5.0 to v1.6.0](https://github.com/antfu/pnpm-workspace-utils/compare/v1.5.0...v1.6.0)
- 3562674: zod: updated [`eslint-plugin-zod` from v3.5.0 to v3.5.4](https://github.com/marcalexiei/eslint-plugin-zod/compare/v3.5.0...v3.5.4)
- 6515548: [**BREAKING**] rxjs: if array is passed to `banOperators`, it will now override default values (previously merged with the default values)
- 9da5c91: [**BREAKING**] json: removed `doNotMergeFilesWithDefault` option
- fd5e263: react: updated [`eslint-plugin-react-you-might-not-need-an-effect` from v0.8.5 to v0.9.3](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect/compare/v0.8.5...v0.9.3):
  - ❌ `no-pass-ref-to-parent` rule was removed

- 3178d97: react: updated [`eslint-plugin-react-refresh` from v0.4.26 to v0.5.0](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/compare/v0.4.26...v0.5.0)
- 9238649: astro: added a separate `setup` sub-config which configures parser for `.astro` files and is completely independent from the main `astro` config
- 7856a72: unocss: updated [`@unocss/eslint-plugin` from v66.6.0 to v66.6.8](https://github.com/unocss/unocss/compare/v66.6.0...v66.6.8)
- 42a6e26: nextJs: updated [`@next/eslint-plugin-next` from v16.1.3 to v16.2.4](https://github.com/vercel/next.js/compare/v16.1.3...v16.2.4)
- 91141fe: cypress: updated [`eslint-plugin-cypress` from v5.2.1 to v6.2.0](https://github.com/cypress-io/eslint-plugin-cypress/compare/v5.2.1...v6.2.0)
- 42a222e: react: updated [`eslint-plugin-react-refresh` from v0.5.0 to v0.5.2](https://github.com/ArnaudBarre/eslint-plugin-react-refresh/compare/v0.5.0...v0.5.2)
- 8297f1d: markdown: updated [`@eslint/markdown` from v7.5.1 to v8.0.1](https://github.com/eslint/markdown/compare/v7.5.1...v8.0.1):
  - 🔴 not enabled [`fenced-code-meta`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/fenced-code-meta.md) rule

- 64d4fef: headers: updated [`eslint-plugin-headers` from v1.3.3 to v1.3.4](https://github.com/robmisasi/eslint-plugin-headers/compare/v1.3.3...v1.3.4)
- 1721e57: turbo: updated [`eslint-plugin-turbo` from v2.7.4 to v2.9.6](https://github.com/vercel/turborepo/compare/v2.7.4...v2.9.6)
- 37e6b99: jsdoc: updated [`eslint-plugin-jsdoc` from v62.3.0 to v62.7.1](https://github.com/gajus/eslint-plugin-jsdoc/compare/v62.3.0...v62.7.1)
- 38c9ec1: docusaurus: updated [`@docusaurus/eslint-plugin` from v3.9.2 to v3.10.0](https://github.com/facebook/docusaurus/compare/v3.9.2...v3.10.0)
- f97d4c9: vue: updated [`eslint-plugin-vuejs-accessibility` from v2.4.1 to v2.5.0](https://github.com/vue-a11y/eslint-plugin-vuejs-accessibility/compare/v2.4.1...v2.5.0)
- 0aee777: compat: updated [`eslint-plugin-compat` from v6.1.0 to v7.0.1](https://github.com/amilajack/eslint-plugin-compat/compare/v6.1.0...v7.0.1)
- 9d3f564: casePolice: updated [`eslint-plugin-case-police` from v2.1.1 to v2.2.1](https://github.com/antfu/case-police/compare/v2.1.1...v2.2.1)
- d78add9: compat: updated [`eslint-plugin-compat` from v6.0.2 to v6.1.0](https://github.com/amilajack/eslint-plugin-compat/compare/v6.0.2...v6.1.0)
- d762d27: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v7.1.18 to v7.1.30](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v7.1.18...v7.1.30)
- ce7ad17: ember: updated [`ember-eslint-parser` from v0.5.13 to v0.10.0](https://github.com/ember-tooling/ember-eslint-parser/compare/v0.5.13-ember-eslint-parser...v0.10.0)
- 5c57bd8: vue: updated [`eslint-plugin-vue-scoped-css` from v2.12.0 to v3.0.0](https://github.com/future-architect/eslint-plugin-vue-scoped-css/compare/v2.12.0...v3.0.0)

## 1.0.0-beta.7

### Minor Changes

- b97c2cc: cli: added `disabledRules` option to re-enable disabled rules
- be48e27: ts: updated [`typescript-eslint` from v8.52.0 to v8.53.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.52.0...v8.53.0):
  - 🟢 enabled [`strict-void-return`](https://typescript-eslint.io/rules/strict-void-return) rule
  - Added a new option, `extraVariableTypesToRemove`, to control which special variable types should be subject to removal by [`no-unused-vars`](https://typescript-eslint.io/rules/no-unused-vars).
    The default value is `{imports: true}`.
    The passed value gets merged with the default value.

- 7a3c4d5: html: updated [`@html-eslint/parser` from v0.52.0 to v0.53.0](https://github.com/yeonjuan/html-eslint/compare/v0.52.0...v0.53.0):
  - 🟢 enabled [`css-no-empty-blocks`](https://html-eslint.org/docs/rules/css-no-empty-blocks) rule

- 78354ad: vue: updated [`eslint-plugin-vue` from v10.6.2 to v10.7.0](https://github.com/vuejs/eslint-plugin-vue/compare/v10.6.2...v10.7.0):
  - 🟢 enabled [`no-undef-directives`](https://eslint.vuejs.org/rules/no-undef-directives.html) rule
  - 🔴 not enabled [`no-literals-in-template`](https://eslint.vuejs.org/rules/no-literals-in-template.html) rule

- c6ed572: lit: enabled the following previously missing entirely from the config rules:
  - [`accessible-name`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/accessible-name.md)
  - [`definition-list`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/definition-list.md)
  - [`heading-hidden`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/heading-hidden.md)
  - [`no-aria-slot`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/no-aria-slot.md)
  - [`obj-alt`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/obj-alt.md)

- e0b0148: zod: `eslint-plugin-zod-x` was renamed to `eslint-plugin-zod` and updated [from v2.0.1 to v3.0.2](https://github.com/marcalexiei/eslint-plugin-zod/compare/v2.0.1...v3.0.2)
  - 🟢 enabled [`prefer-enum-over-literal-union`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/prefer-enum-over-literal-union.md) rule

- ce2d79c: [**BREAKING**] betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v3.8.0 to v4.0.1](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v3.8.0...v4.0.1):
  - ❓ enabled [`enforce-canonical-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-canonical-classes.md) if resolved Tailwind version is >=4 and added it to the `noStylisticRules` config
    - disabled [`enforce-consistent-important-position`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-important-position.md), [`enforce-consistent-variable-syntax`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-consistent-variable-syntax.md) and [`enforce-shorthand-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/enforce-shorthand-classes.md) for Tailwind >=4
  - 🔄 `no-unregistered-classes` was renamed to [`no-unknown-classes`](https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/no-unknown-classes.md)

- 1fb5533: Added `markdownCodeBlocksRules.{additionalDisabledRules,doNotDisable}` root options to control which rules are disabled/enabled in Markdown/MDX embedded ("fenced") code blocks
- 646c21f: noStylisticRules: added `additionalRules` option allowing to specify additional rules that should be considered stylistic
- 9ef4e48: playwright: updated [`eslint-plugin-playwright` from v2.4.1 to v2.5.0](https://github.com/mskelton/eslint-plugin-playwright/compare/v2.4.1...v2.5.0):
  - 🟢 enabled [`consistent-spacing-between-blocks`](https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/docs/rules/consistent-spacing-between-blocks.md) rule and added it to `noStylisticRules` config
  - 🔴 not enabled [`no-restricted-locators`](https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/docs/rules/no-restricted-locators.md) rule

### Patch Changes

- 8a187a6: [**BREAKING**] yaml: updated [`eslint-plugin-yml` from v1.19.1 to v3.0.0](https://github.com/ota-meshi/eslint-plugin-yml/compare/v1.19.1...v3.0.0):
  - The plugin now provides `yaml` ESLint language are therefore does not require specifying `parser` (but instead you should now specify `language: '<plugin prefix (defaults to yaml)>/yaml'`). Thus, `yaml-eslint-parser` dependency has been removed.

- 075f173: react: updated [`@eslint-react/eslint-plugin` and `eslint-plugin-react-debug` from v2.5.5 to v2.7.1](https://github.com/Rel1cx/eslint-react/compare/v2.5.5...v2.7.1):
  - 🟢 enabled _experimental_ [`no-unnecessary-use-ref`](https://www.eslint-react.xyz/docs/rules/no-unnecessary-use-ref) rule

- 9583f59: cspell: updated [`@cspell/eslint-plugin` from v9.4.0 to v9.6.0](https://github.com/streetsidesoftware/cspell/compare/v9.4.0...v9.6.0)
- 1ea84b0: vue: updated [`@intlify/eslint-plugin-vue-i18n` from v4.1.0 to v4.1.1](https://github.com/intlify/eslint-plugin-vue-i18n/compare/v4.1.0...v4.1.1)
- 57ea13c: sql: updated [`eslint-plugin-sql` from v3.2.2 to v3.4.1](https://github.com/gajus/eslint-plugin-sql/compare/v3.2.2...v3.4.1)
- 10bca28: pnpm: updated [`eslint-plugin-pnpm` from v1.4.3 to v1.5.0](https://github.com/antfu/pnpm-workspace-utils/compare/v1.4.3...v1.5.0):
- 405370a: ts: disabled [`switch-exhaustiveness-check` rule](https://typescript-eslint.io/rules/switch-exhaustiveness-check) because oftentimes it's not possible to declare all union members, so the rule gets suppressed. To substitute the rule, put `<expression in switch statement> satisfies never` in the `default` clause.
- 18d9e49: noStylisticRules, yaml: added `sort-*` rules to `noStylisticRules` config
- 90c27dd: formatJs: updated [`eslint-plugin-formatjs` from v6.0.10 to v6.1.0](https://github.com/formatjs/formatjs/compare/v6.0.10...v6.1.0)
- 03f4f85: zod: updated [`eslint-plugin-zod-x` from v2.0.0 to v2.0.1](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v2.0.0...v2.0.1)
- 3b04d1b: mdx: fixed an issue resulting in some rules were not disabled in MDX code blocks
- c63a978: format: updated [`eslint-plugin-format` from v1.2.0 to v1.3.1](https://github.com/antfu/eslint-plugin-format/compare/v1.2.0...v1.3.1)
- 1fd1f65: toml: updated [`eslint-plugin-toml` from v1.0.0 to v1.0.3](https://github.com/ota-meshi/eslint-plugin-toml/compare/v1.0.0...v1.0.3)
- 9cc0267: Fixed an issue resulting in `pluginRenames` root option not respected in `language` flat config option
- ac5233a: eslintComments: updated [`@eslint-community/eslint-plugin-eslint-comments` from v4.5.0 to v4.6.0](https://github.com/eslint-community/eslint-plugin-eslint-comments/compare/v4.5.0...v4.6.0)
- b7813fa: turbo: updated [`eslint-plugin-turbo` from v2.7.3 to v2.7.4](https://github.com/vercel/turborepo/compare/v2.7.3...v2.7.4)
- 6b7c89d: [**BREAKING**] unusedParams: make this config disabled by default and move `eslint-plugin-unused-imports` to optional peer dependencies
- 8cf7e6c: [**BREAKING**] toml: updated [`eslint-plugin-toml` from v0.13.1 to v1.0.0](https://github.com/ota-meshi/eslint-plugin-toml/compare/v0.13.1...v1.0.0):
  - The plugin now provides `toml` ESLint language are therefore does not require specifying `parser` (but instead you should now specify `language: '<plugin prefix (defaults to toml)>/toml'`).
    Thus, `toml-eslint-parser` dependency has been removed.

- 756369f: unocss: updated [`@unocss/eslint-plugin` from v66.5.12 to v66.6.0](https://github.com/unocss/unocss/compare/v66.5.12...v66.6.0)
- 5e5692b: node: updated [`eslint-plugin-n` from v17.23.1 to v17.23.2](https://github.com/eslint-community/eslint-plugin-n/compare/v17.23.1...v17.23.2)
- f7f90a4: fastImport, import: updated [`eslint-plugin-fast-import` from v1.7.1 to v1.8.0](https://github.com/nebrius/eslint-plugin-fast-import/compare/v1.7.1...v1.8.0)
- 32f568c: jsonSchemaValidator: updated [`eslint-plugin-json-schema-validator` from v5.5.1 to v6.0.0](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.5.1...v6.0.0)
- d40c22b: [**BREAKING**] react: the following rules moved from `hooks` sub-config to `reactX` sub-config:
  - [`no-unnecessary-use-callback`](https://eslint-react.xyz/docs/rules/no-unnecessary-use-callback)
  - [`no-unnecessary-use-memo`](https://eslint-react.xyz/docs/rules/no-unnecessary-use-memo)
  - [`no-unnecessary-use-prefix`](https://eslint-react.xyz/docs/rules/no-unnecessary-use-prefix)
  - [`prefer-use-state-lazy-initialization`](https://eslint-react.xyz/docs/rules/prefer-use-state-lazy-initialization)

- 17f5f01: unicorn: disabled autofix for [`prefer-string-raw`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-string-raw.md) because changing a string literal to `String.raw` expression may lead to type errors
- 6006988: jsdoc: updated [`eslint-plugin-jsdoc` from v62.0.0 to v62.3.0](https://github.com/gajus/eslint-plugin-jsdoc/compare/v62.0.0...v62.3.0)
- 01030b9: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v7.1.13 to v7.1.14](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v7.1.13...v7.1.14)

## 1.0.0-beta.6

### Minor Changes

- fc2bee9: packageJson: updated [`eslint-plugin-package-json` from v0.87.1 to v0.88.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.87.1...v0.88.1):
  - ❓ enabled [`require-repository`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-repository.md) rule if `publishable` option is set to `true`
  - 🔴 not enabled [`require-scripts`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-scripts.md) rule

- 045ce49: vitest: updated [`@vitest/eslint-plugin` from v1.6.1 to v1.6.6](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.6.1...v1.6.6):
  - Set [`expectAssertions: true`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-conditional-expect.md#expectassertions) for [`no-conditional-expect`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-conditional-expect.md) rule
  - Set [`fixable: false`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/main/docs/rules/prefer-import-in-mock.md#options) for [`prefer-import-in-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-import-in-mock.md) rule and do not disable autofix globally
  - 🟢 enabled [`prefer-mock-return-shorthand`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-mock-return-shorthand.md) rule and added it to `noStylistic` config
  - 🔴 not enabled [`require-test-timeout`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-test-timeout.md) rule

- 4570d43: eslintPlugin: updated [`eslint-plugin-eslint-plugin` from v7.2.0 to v7.3.0](https://github.com/eslint-community/eslint-plugin-eslint-plugin/compare/v7.2.0...v7.3.0):
  - 🟢 enabled [`no-matching-violation-suggest-message-ids`](https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/no-matching-violation-suggest-message-ids.md) rule

- 51901c8: react: updated [`eslint-plugin-react-debug` from v2.3.13 to v2.5.5](https://github.com/Rel1cx/eslint-react/compare/v2.3.13...v2.5.5)
  - Set [`enforceAssignment: true`](https://www.eslint-react.xyz/docs/rules/naming-convention-use-state#enforceassignment) for [`use-state`](https://www.eslint-react.xyz/docs/rules/naming-convention-use-state)
  - 🟢 enabled [`ref-name`](https://www.eslint-react.xyz/docs/rules/naming-convention-ref-name) rule

### Patch Changes

- cc071af: e18e: disabled `performance-improvements/type-aware` config with type-aware rules on Markdown code blocks, otherwise rules might crash
- 643dd82: nx: updated [`@nx/eslint-plugin` from v22.3.1 to v22.3.3](https://github.com/nrwl/nx/compare/22.3.1...22.3.3)
- 57e015e: jest: updated [`eslint-plugin-jest` from v29.11.2 to v29.12.1](https://github.com/jest-community/eslint-plugin-jest/compare/v29.11.2...v29.12.1)
- 1daa60a: ts: updated [`typescript-eslint` from v8.51.0 to v8.52.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.51.0...v8.52.0)
- ee920d6: [**BREAKING**] toml: updated [`toml-eslint-parser` from v0.10.1 to v1.0.0](https://github.com/ota-meshi/toml-eslint-parser/compare/v0.10.1...v1.0.0):
  - Sets the default TOML version to `1.1.0`

- e72ecc6: format: updated [`eslint-plugin-format` from v1.1.0 to v1.2.0](https://github.com/antfu/eslint-plugin-format/compare/v1.1.0...v1.2.0)
- 0ad790d: react: updated [`eslint-plugin-react-you-might-not-need-an-effect` from v0.8.1 to v0.8.5](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect/compare/v0.8.1...v0.8.5)
- c094fa1: perfectionist: updated [`eslint-plugin-perfectionist` from v5.0.0 to v5.3.1](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v5.0.0...v5.3.1):
  - Added [new shared settings](https://perfectionist.dev/guide/getting-started#settings): `newlinesBetween` and `newlinesInside`

- fa7da81: stylistic: updated [`@stylistic/eslint-plugin` from v5.6.1 to v5.7.0](https://github.com/eslint-stylistic/eslint-stylistic/compare/v5.6.1...v5.7.0):
  - ❌ [`jsx-sort-props`](https://github.com/eslint-stylistic/eslint-stylistic/tree/94ba6b3f25d8f92d300fe0eda87181d7115bb708/packages/eslint-plugin/rules/jsx-sort-props) rule was deprecated

- a634627: toml: updated [`eslint-plugin-toml` from v0.12.0 to v0.13.1](https://github.com/ota-meshi/eslint-plugin-toml/compare/v0.12.0...v0.13.1)
- 308528f: fastImport, import: updated [`eslint-plugin-fast-import` from v1.5.3 to v1.7.1](https://github.com/nebrius/eslint-plugin-fast-import/compare/v1.5.3...v1.7.1)
- c7af706: testingLibrary: updated [`eslint-plugin-testing-library` from v7.15.1 to v7.15.4](https://github.com/testing-library/eslint-plugin-testing-library/compare/v7.15.1...v7.15.4)
- 434cd0b: antfu: updated [`eslint-plugin-antfu` from v3.1.1 to v3.1.3](https://github.com/antfu/eslint-plugin-antfu/compare/v3.1.1...v3.1.3)
- 7a26d4e: svelte: updated [`eslint-plugin-svelte` from v3.13.1 to v3.14.0](https://github.com/sveltejs/eslint-plugin-svelte/compare/v3.13.1...v3.14.0)
- 644a916: unocss: updated [`@unocss/eslint-plugin` from v66.5.10 to v66.5.12](https://github.com/unocss/unocss/compare/v66.5.10...v66.5.12)
- 5cb7a29: cypress: updated [`eslint-plugin-cypress` from v5.2.0 to v5.2.1](https://github.com/cypress-io/eslint-plugin-cypress/compare/v5.2.0...v5.2.1)
- c0a8665: jsonSchemaValidator: updated [`eslint-plugin-json-schema-validator` from v5.5.0 to v5.5.1](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.5.0...v5.5.1)
- 5d2f1dd: astro: fixed an issue resulting in `jsx-a11y` rules receiving `jsx-a11y` plugin options, despite them not supported in `astro` plugin
- fb87d6b: dependencies: updated [`globals` from v16.5.0 to v17.0.0](https://github.com/sindresorhus/globals/compare/v16.5.0...v17.0.0)
- 9ae5e40: playwright: updated [`eslint-plugin-playwright` from v2.4.0 to v2.4.1](https://github.com/mskelton/eslint-plugin-playwright/compare/v2.4.0...v2.4.1)
- 6cfd92e: jsdoc: updated [`eslint-plugin-jsdoc` from v61.5.0 to v62.0.0](https://github.com/gajus/eslint-plugin-jsdoc/compare/v61.5.0...v62.0.0):
- af28aca: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v7.1.2 to v7.1.13](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v7.1.2...v7.1.13)
- 98300d6: formatJs: updated [`eslint-plugin-formatjs` from v6.0.2 to v6.0.10](https://github.com/formatjs/formatjs/compare/v6.0.2...v6.0.10)
- 63d52ac: turbo: updated [`eslint-plugin-turbo` from v2.7.1 to v2.7.3](https://github.com/vercel/turborepo/compare/v2.7.1...v2.7.3)

## 1.0.0-beta.5

### Minor Changes

- 1ece5ed: html: updated [`@html-eslint/*` from v0.51.0 to v0.52.1](https://github.com/yeonjuan/html-eslint/compare/v0.51.0...v0.52.1):
  - 🟢 enabled [`class-spacing`](https://github.com/yeonjuan/html-eslint/blob/HEAD/docs/rules/class-spacing.md) rule
  - 🟢 enabled [`no-obsolete-attrs`](https://github.com/yeonjuan/html-eslint/blob/HEAD/docs/rules/no-obsolete-attrs.md) rule

- 227d727: Added a new config `e18e` which uses [`@e18e/eslint-plugin`](https://npmjs.com/@e18e/eslint-plugin), ❓ enabled if `defaultConfigsStatus` is set to `misc-enabled`
- 54e7eed: packageJson: added a new option, `publishable`, to control whether additional rules meant for publishable `package.json`s should be turned on.
  You can also now specify multiple `packageJson` configs
- 7fcd33f: packageJson: updated [`eslint-plugin-package-json` from v0.85.0 to v0.87.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.85.0...v0.87.1):
  - 🟢 enabled [`valid-module`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-module.md) rule
  - 🔴 not enabled [`require-homepage`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-homepage.md) rule

- 7048892: Added a new config `tanstackRouter` which uses [`@tanstack/eslint-plugin-router`](https://npmjs.com/@tanstack/eslint-plugin-router), ❓ enabled automatically if `@tanstack/react-router` or `@tanstack/solid-router` package is installed
- 375da69: Added a new config `githubActions` which uses [`eslint-plugin-github-action`](https://npmjs.com/eslint-plugin-github-action), ❓ enabled if `.github/workflows` directory exists
- 4afcfdf: jest: updated [`eslint-plugin-jest` from v29.5.0 to v29.11.2](https://github.com/jest-community/eslint-plugin-jest/compare/v29.5.0...v29.11.2):
  - 🟢 enabled [`no-error-equal`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-error-equal.md) rule in ⚙️ `typescript` sub-config
  - 🟢 enabled [`no-unnecessary-assertion`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-unnecessary-assertion.md) rule in ⚙️ `typescript` sub-config
  - 🟢 enabled [`prefer-mock-return-shorthand`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-mock-return-shorthand.md)
  - 🟢 enabled [`valid-expect-with-promise`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-expect-with-promise.md) rule in ⚙️ `typescript` sub-config

- 2b6d4ed: Added a new config `sql` which uses [`eslint-plugin-sql`](https://npmjs.com/eslint-plugin-sql), ❌ disabled by default
- 0a1390d: [**BREAKING**] yaml: changed the default prefix of `eslint-plugin-yml` to `yaml` instead of `yml`
- 251afbb: Added a new package entrypoint, `globs`, which exports various globs that can be useful for specifying `files` or `ignores` ESLint config options
- 3411e57: [**BREAKING**] svelte, vue: renamed `enforceTypescriptInScriptSection` option to `configEnforceTypescriptInScriptSection` and made it a proper sub-config
- 4080234: Added a new config `lockfile` which uses [`eslint-plugin-lockfile`](https://npmjs.com/eslint-plugin-lockfile), ❓ enabled if `defaultConfigsStatus` is set to `misc-enabled`
- d8c0709: Added a new config `barrelFiles` which uses [`eslint-plugin-barrel-files`](https://npmjs.com/eslint-plugin-barrel-files), ❌ disabled by default
- 2b2beb4: Added a new config `format` which uses [`eslint-plugin-format`](https://npmjs.com/eslint-plugin-format), ❌ disabled by default, and supporting multiple configs
- 9ec9343: [**BREAKING**] zod: updated [`eslint-plugin-zod-x` from v1.13.2 to v2.0.0](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v1.13.2...v2.0.0):
  - 🔄 `no-any` rule was renamed to [`no-any-schema`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/no-any-schema.md)

- c7da75e: Added a new config `clsx` which uses [`eslint-plugin-clsx`](https://npmjs.com/eslint-plugin-clsx), ❌ disabled by default

### Patch Changes

- ddfde86: `extraPlugins` can now be passed as objects
- 54ade9b: react: updated [`eslint-plugin-react-you-might-not-need-an-effect` from v0.7.0 to v0.8.1](https://github.com/NickvanDyke/eslint-plugin-react-you-might-not-need-an-effect/compare/8ed4285ccd5dfbed4ac4b61afc778e2e5ee90d4d...983312bec60a996f2d8ffb2e7a1bcd4292925880):
  - ❌ `no-manage-parent` rule was removed

- ce3cd08: ts: updated [`typescript-eslint` from v8.50.1 to v8.51.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.50.1...v8.51.0)
- 227d727: depend: removed from `misc-enabled` configs in favor of `e18e` config
- 7782adf: lockfile: added [`binary-conflicts`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/binary-conflicts.md) and [`integrity`](https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/integrity.md) rules to the list of rules that will be disabled in offline mode
- 6e5d55c: [**BREAKING**] eslintComments: change default plugin prefix from `@eslint-community/eslint-comments` to `eslint-comments`
- 6b43d1c: clsx: updated [`eslint-plugin-clsx` from v0.0.11 to v0.0.12](https://github.com/temoncher/eslint-plugin-clsx/compare/v0.0.11...v0.0.12)
- 68838bf: ts: updated [`typescript-eslint` from v8.50.0 to v8.50.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.50.0...v8.50.1)
- 457b79c: barrelFiles: the config is now applied to all files by default
- a270080: turbo: updated [`eslint-plugin-turbo` from v2.6.3 to v2.7.1](https://github.com/vercel/turborepo/compare/v2.6.3...v2.7.1)
- 650c82c: vitest: updated [`@vitest/eslint-plugin` from v1.5.2 to v1.6.1](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.5.2...v1.6.1):
  - 🟢 enabled [`no-unneeded-async-expect-function`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-unneeded-async-expect-function.md) rule
  - 🟢 enabled [`prefer-to-have-been-called-times`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-to-have-been-called-times.md) rule
  - ❌ `require-import-vi-mock` rule was removed

- b461206: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v7.1.1 to v7.1.2](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v7.1.1...v7.1.2)

## 1.0.0-beta.4

### Minor Changes

- e97c231: [**BREAKING**] perfectionist: updated [`eslint-plugin-perfectionist` from v4.15.1 to v5.0.0](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v4.15.1...v5.0.0):
  - 🔴 not enabled [`sort-export-attributes`](https://perfectionist.dev/rules/sort-export-attributes) rule, but added a new sub config `sortExportAttributes` controlling it
  - 🔴 not enabled [`sort-import-attributes`](https://perfectionist.dev/rules/sort-import-attributes) rule, but added a new sub config `sortImportAttributes` controlling it

- 63379e7: ts: updated [`typescript-eslint` from v8.49.0 to v8.50.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.49.0...v8.50.0):
  - 🟢 enabled [`no-useless-default-assignment`](https://typescript-eslint.io/rules/no-useless-default-assignment) rule

### Patch Changes

- c628635: boundaries: updated [`eslint-plugin-boundaries` from v5.3.0 to v5.3.1](https://github.com/javierbrea/eslint-plugin-boundaries/compare/v5.3.0...v5.3.1)
- f86a47f: noStylisticRules: added missing stylistic rules from [`eslint-plugin-regexp`](https://npmjs.com/eslint-plugin-regexp)
- 0314235: react: updated [`eslint-plugin-react-refresh` from v0.4.24 to v0.4.26](https://github.com/rnaudBarre/eslint-plugin-react-refresh/compare/v0.4.24...v0.4.26)
- 01b5db3: testingLibrary: updated [`eslint-plugin-testing-library` from v7.13.5 to v7.15.1](https://github.com/testing-library/eslint-plugin-testing-library/compare/v7.13.5...v7.15.1):
  - 🟢 enabled [`prefer-user-event-setup`](https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/prefer-user-event-setup.md) rule

- b1902ef: qwik: updated [`eslint-plugin-qwik` from v1.17.2 to v1.18.0](https://github.com/QwikDev/qwik/compare/v1.17.2...v1.18.0)
- 2caf282: nestJs: updated [`@darraghor/eslint-plugin-nestjs-typed` from v6.9.17 to v7.1.1](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/compare/v6.9.17...v7.1.1):
  - 🟢 enabled [`use-injectable-provided-token`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/use-injectable-provided-token.md) rule
  - 🟢 enabled [`api-operation-summary-description-capitalized`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/api-operation-summary-description-capitalized.md) rule
  - 🟢 enabled [`api-property-should-have-api-extra-models`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/api-property-should-have-api-extra-models.md) rule
  - 🟢 enabled [`validation-pipe-should-use-forbid-unknown`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/validation-pipe-should-use-forbid-unknown.md) rule
  - 🔴 not enabled [`use-dependency-injection`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/use-dependency-injection.md) rule
  - 🔴 not enabled [`use-correct-endpoint-naming-convention`](https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/use-correct-endpoint-naming-convention.md) rule

- 8b5cbd3: nextJs: updated [`@next/eslint-plugin-next` from v16.0.7 to v16.1.0](https://github.com/vercel/next.js/compare/v16.0.7...v16.1.0)
- 68651e3: nx: updated [`@nx/eslint-plugin` from v22.1.3 to v22.3.1](https://github.com/nrwl/nx/compare/22.1.3...22.3.1)
- 35767d4: formatJs: updated [`eslint-plugin-formatjs` from v5.4.2 to v6.0.2](https://github.com/formatjs/formatjs/compare/v5.4.2...v6.0.2)
- 69658da: noSecrets: `json` sub config: ensure `**/package-lock.json` files are always ignored
- 4aa858b: storybook: updated [`eslint-plugin-storybook` from v10.1.4 to v10.1.10](https://github.com/storybookjs/storybook/compare/v10.1.4...v10.1.10)
- 483aeb0: css: do not assign `customSyntax` property if it is undefined, otherwise it will lead to config validation error
- 222e8ff: noStylisticRules: added missing stylistic rules from [`@html-eslint/eslint-plugin`](https://npmjs.com/@html-eslint/eslint-plugin)
- 87c9992: toml: updated [`toml-eslint-parser` from v0.10.0 to v0.10.1](https://github.com/ota-meshi/toml-eslint-parser/compare/v0.10.0...v0.10.1)
- 1f20326: vitest: updated [`@vitest/eslint-plugin` from v1.5.1 to v1.5.2](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.5.1...v1.5.2):
- 62f2d6d: markdownPreferences: updated [`eslint-plugin-markdown-preferences` from v0.40.1 to v0.40.2](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/compare/v0.40.1...v0.40.2)
- 5614ad9: react: updated [`@eslint-react/eslint-plugin` and `eslint-plugin-react-debug` from v2.3.12 to v2.3.13](https://github.com/Rel1cx/eslint-react/compare/v2.3.12...v2.3.13)
- cdcc8de: pnpm: updated [`eslint-plugin-pnpm` from v1.4.2 to v1.4.3](https://github.com/antfu/pnpm-workspace-utils/compare/v1.4.2...v1.4.3)
- a31c2d7: jest: updated [`eslint-plugin-jest` from v29.2.1 to v29.5.0](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.1...v29.5.0):
  - 🟢 enabled [`no-unneeded-async-expect-function`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/no-unneeded-async-expect-function.md) rule and added it to the `noStylisticRules` config
  - 🔴 not enabled [`prefer-to-have-been-called`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-to-have-been-called.md) rule
  - 🔴 not enabled [`prefer-to-have-been-called-times`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-to-have-been-called-times.md) rule

- 8226e4d: zod: updated [`eslint-plugin-zod-x` from v1.13.0 to v1.13.2](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v1.13.0...v1.13.2)

## 1.0.0-beta.3

### Minor Changes

- d9fec87: User provided `ignores` are now merged with the internal `ignores`, which primarily exist to ignore the files that the current config is not supposed to work with and might crash on
- df38077: [**BREAKING**] un: `allow` option now accepts an object instead of an array, and `undefined` is now allowed by default, and the provided value will be merged with the default
- e468454: regexp: [`letter-case`](https://ota-meshi.github.io/eslint-plugin-regexp/rules/letter-case.html): set `unicodeEscape` and `hexadecimalEscape` to `uppercase` to avoid conflicts with [`unicorn/escape-case`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/escape-case.md) and make such escapes more distinguishable

### Patch Changes

- 9a07d98: packageJson: enabled the config by default (was previously disabled by mistake)
- 6f5e1ea: jsdoc: updated [`eslint-plugin-jsdoc` from v61.4.1 to v61.5.0](https://github.com/gajus/eslint-plugin-jsdoc/compare/v61.4.1...v61.5.0)
- 2933f32: zod: updated [`eslint-plugin-zod-x` from v1.12.0 to v1.13.0](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v1.12.0...v1.13.0)
- d00a68c: Fixed an issue resulting in the config generated from the rule entry with `files` or `ignores` not having the `rules` property
- a5e4d6e: ts: updated [`typescript-eslint` from v8.48.1 to v8.49.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.48.1...v8.49.0)
- 7c2ce77: pnpm: updated [`eslint-plugin-pnpm` from v1.4.1 to v1.4.2](https://github.com/antfu/pnpm-workspace-utils/compare/v1.4.1...v1.4.2)
- 37a4be5: html: updated [`@html-eslint/*` from v0.50.0 to v0.51.0](https://github.com/yeonjuan/html-eslint/compare/v0.50.0...v0.51.0):
  - 🟢 enabled [`no-whitespace-only-children`](https://html-eslint.org/docs/rules/no-whitespace-only-children) rule

- e3cd46f: vue: regexes are no longer used in `no-undef-components` rule options to make the config serializable for caching purposes
- a3f3c4b: betterTailwind: updated [`eslint-plugin-better-tailwindcss` from v3.7.11 to v3.8.0](https://github.com/schoero/eslint-plugin-better-tailwindcss/compare/v3.7.11...v3.8.0)
- 1ac19ce: vue: `enforceTypescriptInScriptSection`: `files` and `ignores` from the parent config are now used if they're not explicitly set
- 9b2cdb5: vue: updated [`@nuxt/eslint-plugin` from v1.11.0 to v1.12.1](https://github.com/nuxt/eslint/compare/v1.11.0...v1.12.1):
  - 🟢 enabled [`no-nuxt-config-test-key`](https://github.com/nuxt/eslint/blob/HEAD/packages/eslint-plugin/src/rules/no-nuxt-config-test-key/index.ts) rule

## 1.0.0-beta.2

### Minor Changes

- e10b808: markdownPreferences: `delimitersStyle` option now accepts `false` value, allowing to disable enforcement of delimiters/strikethrough text style.
- aa2496c: markdown/sentencesPerLine: ignore `LICENSE.md` file in addition to the `ignores` provided by the parent config or explicitly.
  Added `ignoresAdditional` option to control if this `ignores` entry should be added.
- 05bdae2: un: config is now applied to all files by default.
- c063c3c: [**BREAKING**] un: `no-multiple-consecutive-spaces` rule: added a new option `allowSpacesOnly` and set it to `true` by default.
- 3f868c8: Added the ability to specify `files` and `ignores` on a rule level to override the parent's `files` and `ignores` for a specific rule
- 76fc52d: markdownPreferences: updated [`eslint-plugin-markdown-preferences` from v0.38.0 to v0.40.1](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/compare/v0.38.0...v0.40.1):
  - 🔴 not enabled [`max-len`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/max-len.html) rule
  - Added a new option `orderedLists` to conveniently control [`ordered-list-marker-sequence`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-sequence.html), [`ordered-list-marker-start`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-start.html) and [`ordered-list-marker-style`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/ordered-list-marker-style.html) rules

- 7978d95: checkFile: added 2 new options, `fileNamingConventions` and `folderNamingConventions`, to enforce file and folder naming conventions.
- 94af255: angular: updated [`@angular-eslint/template-parser` from v21.0.1 to v21.1.0](https://github.com/angular-eslint/angular-eslint/compare/v21.0.1...v21.1.0):
  - 🟢 enabled [`prefer-signal-model`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-signal-model.md) rule if Angular version is at least 19

- a51ba97: [**BREAKING**] toml, yaml: renamed `doNotIgnoreFilesByDefault` to `ignoresAdditional` and enhanced its type (added the ability to set `false` and require the full pattern string to be specified instead of just the file name).

### Patch Changes

- f51bb3c: noStylisticRules: removed [`vitest/no-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-importing-vitest-globals.md) since removing/adding imports may cause TypeScript errors
- cffc3b2: Improved `pluginOverrides` root option type to support accepting functions and promises
- 8cac922: markdownPreferences: fixed a bug where `enforceCasing` option was not working as expected if `null` is passed.
  Instead you should now use `false`.
- 4fe593e: Document to which files each root config is applied.
  Made config documentation format consistent & more readable.
- 011b3df: vitest: Disabled autofixes for [`prefer-lowercase-title`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-lowercase-title.md) and [`require-import-vi-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-import-vi-mock.md) rules because they are not safe:
  - In the first case, automatic test case rename might be undesirable.
  - In the second case, the rule may remove the import statements and cause runtime/TypeScript errors.

- f4f1562: markdownPreferences: updated [`eslint-plugin-markdown-links` from v0.7.0 to v0.7.1](https://github.com/ota-meshi/eslint-plugin-markdown-links/compare/v0.7.0...v0.7.1)
- 7325ae3: vitest: disabled [`require-import-vi-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-import-vi-mock.md) due to doing [absolutely the same](https://github.com/vitest-dev/eslint-plugin-vitest/issues/829) as [`prefer-import-in-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-import-in-mock.md)

## 1.0.0-beta.1

### Minor Changes

- 9c235e1: Added a new config `command` which uses [`eslint-plugin-command`](https://npmjs.com/eslint-plugin-command), ❌ disabled by default
- 72532ee: Added a new config `expectType` which uses [`eslint-plugin-expect-type`](https://npmjs.com/eslint-plugin-expect-type), ❌ disabled by default
- 0982fe0: Added a new config `treeShaking` which uses [`eslint-plugin-tree-shaking`](https://npmjs.com/eslint-plugin-tree-shaking), ❌ disabled by default
- 6cd4569: Added a new config `antfu` which uses [`eslint-plugin-antfu`](https://npmjs.com/eslint-plugin-antfu), ❌ disabled by default
- fb934f4: Added a new config `moduleInterop` which uses [`eslint-plugin-module-interop`](https://npmjs.com/eslint-plugin-module-interop), ✅ enabled by default
- 92a1901: Added a new config `noSecrets` which uses [`eslint-plugin-no-secrets`](https://npmjs.com/eslint-plugin-no-secrets), ✅ enabled by default
- 177c056: Added a new config `docusaurus` which uses [`@docusaurus/eslint-plugin`](https://npmjs.com/@docusaurus/eslint-plugin), ❓ enabled automatically if `@docusaurus/core` package is installed
- 9d46740: Added a new config `boundaries` which uses [`eslint-plugin-boundaries`](https://npmjs.com/eslint-plugin-boundaries), ❌ disabled by default
- 91b7041: Added a new config `nestJs` which uses [`@darraghor/eslint-plugin-nestjs-typed`](https://npmjs.com/@darraghor/eslint-plugin-nestjs-typed), ❓ enabled automatically if `@nestjs/core` package is installed
- a1e1589: Added a new config `jestDom` which uses [`eslint-plugin-jest-dom`](https://npmjs.com/eslint-plugin-jest-dom), ❓ enabled automatically if `@testing-library/jest-dom` package is installed

### Patch Changes

- 1454e2c: vue: updated [`eslint-plugin-vue` from v10.6.0 to v10.6.2](https://github.com/vuejs/eslint-plugin-vue/compare/v10.6.0...v10.6.2)
- 6b8459a: markdownPreferences: updated [`eslint-plugin-markdown-preferences` from v0.36.3 to v0.38.0](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/compare/v0.36.3...v0.38.0):
  - 🟢 enabled [`no-tabs`](https://github.com/ota-meshi/eslint-plugin-markdown-preferences/blob/HEAD/docs/rules/no-tabs.md) rule with the following default options: `{ignoreCodeBlocks: ['*'], codeBlockTabWidth: 2}`
  - 🟢 enabled [`no-heading-trailing-punctuation`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/no-heading-trailing-punctuation.html) rule

- be0a185: playwright: updated [`eslint-plugin-playwright` from v2.3.0 to v2.4.0](https://github.com/playwright-community/eslint-plugin-playwright/compare/v2.3.0...v2.4.0)
- 13077c9: yaml: updated [`yaml-eslint-parser` from v1.3.0 to v1.3.2](https://github.com/ota-meshi/yaml-eslint-parser/compare/v1.3.0...v1.3.2)
- 5960178: zod: updated [`eslint-plugin-zod-x` from v1.11.2 to v1.12.0](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v1.11.2...v1.12.0):
  - 🔴 not enabled [`no-unknown-schema`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/no-unknown-schema.md) rule

- 70c3f45: cspell: updated [`@cspell/eslint-plugin` from v9.3.2 to v9.4.0](https://github.com/streetsidesoftware/cspell/compare/v9.3.2...v9.4.0)
- 5fdd9f6: es: updated [`eslint-plugin-es-x` from v9.2.0 to v9.3.0](https://github.com/eslint-community/eslint-plugin-es-x/compare/v9.2.0...v9.3.0):
  - ❓ enabled conditionally [`no-json-israwjson`](https://eslint-community.github.io/eslint-plugin-rules/no-json-israwjson.html) rule
  - ❓ enabled conditionally [`no-json-parse-reviver-context-parameter`](https://eslint-communithub.io/eslint-plugin-es-x/rules/no-json-parse-reviver-context-parameter.html) rule
  - ❓ enabled conditionally [`no-json-rawjson`](https://eslint-communithub.io/eslint-plugin-es-x/rules/no-json-rawjson.html) rule

  <!-- cspell:ignore no-json-israwjson rawjson -->

- 4fcf74d: unocss: updated [`@unocss/eslint-plugin` from v66.5.9 to v66.5.10](https://github.com/unocss/unocss/compare/v66.5.9...v66.5.10)
- 27d1eeb: html: updated [`@html-eslint/*` from v0.49.0 to v0.50.0](https://github.com/yeonjuan/html-eslint/compare/v0.49.0...v0.50.0)
- b92d103: react: updated [`@eslint-react/eslint-plugin` and `eslint-plugin-react-debug` from v2.3.7 to v2.3.12](https://github.com/Rel1cx/eslint-react/compare/v2.3.7...v2.3.12)
- 87b9e8b: nx: updated [`@nx/eslint-plugin` from v22.1.0 to v22.1.3](https://github.com/nrwl/nx/compare/22.1.0...22.1.3)
- 0f176da: jest: updated [`eslint-plugin-jest` from v29.2.0 to v29.2.1](https://github.com/jest-community/eslint-plugin-jest/compare/v29.2.0...v29.2.1)
- 2be42ba: pnpm: updated [`eslint-plugin-pnpm` from v1.3.0 to v1.4.1](https://github.com/antfu/pnpm-workspace-utils/compare/v1.3.0...v1.4.1):
  - Added a new option `enforcePnpmWorkspaceSettings` of `pnpmWorkspace` sub-config, which controls if `yaml-enforce-settings` rule should be enabled

- 8edc578: markdownLinks: updated [`eslint-plugin-markdown-links` from v0.6.2 to v0.7.0](https://github.com/ota-meshi/eslint-plugin-markdown-links/compare/v0.6.2...v0.7.0)
- 4b22cc1: turbo: updated [`eslint-plugin-turbo` from v2.6.1 to v2.6.3](https://github.com/vercel/turborepo/compare/v2.6.1...v2.6.3)
- 7be4cb9: noStylisticRules: added `regexp/no-useless-character-class`, `sonarjs/single-character-alternation` and `vitest/padding-around-*` rules
- 5b25d88: nextJs: updated [`@next/eslint-plugin-next` from v16.0.3 to v16.0.7](https://github.com/vercel/next.js/compare/v16.0.3...v16.0.7)
- 32c070e: ts: updated [`typescript-eslint` from v8.47.0 to v8.48.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.47.0...v8.48.1)
- 36aded8: vue: updated [`@nuxt/eslint-plugin` from v1.10.0 to v1.11.0](https://github.com/nuxt/eslint/compare/v1.10.0...v1.11.0)
- ce76947: zod: updated [`eslint-plugin-zod-x` from v1.10.0 to v1.11.2](https://github.com/marcalexiei/eslint-plugin-zod-x/compare/v1.10.0...v1.11.2)
  - 🟢 enabled [`consistent-object-schema-type`](https://github.com/marcalexiei/eslint-plugin-zod-x/blob/HEAD/docs/rules/consistent-object-schema-type.md) rule and added config-level `allowedObjectSchemaTypes` option related to it

- 89a3eda: svelte: updated [`svelte-eslint-parser` from v1.4.0 to v1.4.1](https://github.com/sveltejs/svelte-eslint-parser/compare/v1.4.0...v1.4.1)
- ab1d12d: vitest: updated [`@vitest/eslint-plugin` from v1.4.3 to v1.5.1](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.4.3...v1.5.1):
  - 🟢 enabled [`require-import-vi-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-import-vi-mock.md) rule
  - 🟢 enabled [`consistent-each-for`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/consistent-each-for.md) rule and added config-level `enforceEachOrFor` option related to it

- 2d0fc2e: svelte: updated [`eslint-plugin-svelte` from v3.13.0 to v3.13.1](https://github.com/sveltejs/eslint-plugin-svelte/compare/v3.13.0...v3.13.1)
- 9e7e28a: storybook: updated [`eslint-plugin-storybook` from v10.0.8 to v10.1.4](https://github.com/storybookjs/storybook/compare/v10.0.8...v10.1.4)

## 1.0.0-beta.0

### Major Changes

- 84981c5: Release first beta version

### Patch Changes

- 754ad26: Added 3 new root options, `linterOptions{NoInlineConfig,ReportUnusedDisableDirectives,ReportUnusedInlineConfigs}`, to more conveniently set `linterOptions`
- d694af0: Added the section about renaming rules in eslint configuration comments and made other improvements to the migration guide
- 2c2a388: markdownPreferences: added a new option `casingEnforcementIgnorePatterns` to control `ignorePatterns` option of `{heading,table-header}-casing` rules
- 2f53098: markdownPreferences: added `delimitersStyle` config option to more conveniently configure `emphasis-delimiters-style` and `strikethrough-delimiters-style` rules

## 1.0.0-alpha.46

### Patch Changes

- 1225a7b: vue: Fixed an issue resulting in irrelevant rules not disabled on vue files

## 1.0.0-alpha.45

### Patch Changes

- 0ed26cf: fix(vue): add nuxt rules only if nuxt config is enabled

## 1.0.0-alpha.44

### Patch Changes

- 84429c2: Ensure plugins with missing or bad version always have prefix
- 18807e7: vue: add nuxt rules only if nuxt config is enabled

## 1.0.0-alpha.43

### Patch Changes

- 12a4466: Setup changesets & GH action to publish new versions

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
- `fast-import` via [`eslint-plugin-fast-import`](https://npmjs.com/eslint-plugin-fast-import), **<u>disabled</u>** by default.
- `checkFile` via [`eslint-plugin-check-file`](https://npmjs.com/eslint-plugin-check-file), **<u>disabled</u>** by default.
- `formatJs` via [`eslint-plugin-formatjs`](https://npmjs.com/eslint-plugin-formatjs), enabled automatically if `@formatjs/icu-messageformat-parser` package is installed.

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
- [**BREAKING**] `overrideIgnores` root option removed in favor of `ignores.override`.
- [**BREAKING**] [`@stylistic/eslint-plugin`](https://npmjs.com/@stylistic/eslint-plugin) rules have moved to a separate `stylistic` config.
- Added a new root option, `defaultConfigsStatus`, to control what configs are enabled or disabled by default. As a result, shared settings prefix has been changed from `jsx-a11y` to `jsx-a11y-x`.
- Added the ability to override any of the used plugins via `pluginOverrides` option.
- Exported `isInCi` helper from `ci-info` package.
- Introduced "Offline mode" which can be useful to (temporarily) disable rules performing network requests, such as [`markdown-links/no-dead-urls`](https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/no-dead-urls.html). It can be enabled via `offlineMode` root option or by setting `ESLINT_CONFIG_UN_OFFLINE_MODE` environment variable to non-empty string.
- Added a new root option, `useFastImports`, to override certain [`eslint-plugin-import-x`](https://npmjs.com/eslint-plugin-import-x) plugin rules with implementations from [`eslint-plugin-fast-import`](https://npmjs.com/eslint-plugin-fast-import).
- Added a new root option, `cacheConfigs`, to enable flat config caching, which might improve performance when ESLint is running in editor (for example, from an ESLint extension).
- Added a new root option, `extraPlugins`, which allows to provide additional ESLint plugins.
- Added a new export, `/snippets`, which currently provides utilities to work with `no-restricted-*` rules.
- **ts, vue** configs: for extension rules, base rule options and severity are now smartly inherited from the corresponding base rules. Added an option to disable this behavior.
- **packageJson** config:
  - [**BREAKING**] It is not enabled by default.
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
  - Disabled [`prefer-dom-node-dataset`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-dom-node-dataset.md) because [it might hurt greppability of codebase](https://github.com/sindresorhus/eslint-plugin-unicorn/issues/2451).
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
  - Enhanced the `nuxt` sub-config to support `files` and `ignores`, on which rules from [`@nuxt/eslint-config`](https://npmjs.com/@nuxt/eslint-config) will be applied. Additionally, added a `nuxt`'s sub-config called `nuxtConfig`, which targets specifically Nuxt config files.
  - Set `ignoreIncludesComment: true` and `ignoreStringEscape: true` for [`no-useless-v-bind`](https://eslint.vuejs.org/rules/no-useless-v-bind.html).
  - **a11y** sub-config: enabled [`no-aria-hidden-on-focusable`](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-aria-hidden-on-focusable.html) and [`no-role-presentation-on-focusable`](https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/no-role-presentation-on-focusable.html) rules.
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
- **ts** config:
  - Do not set [`disallowTemplateShorthand: true`](https://eslint.org/docs/latest/rules/no-implicit-coercion#disallowtemplateshorthand) for [`no-implicit-coercion`](https://eslint.org/docs/latest/rules/no-implicit-coercion) rule in TypeScript files.
  - Allow a single leading underscore for type parameters names.

### Dependencies

- `eslint` (peer dependency): [9.26.0 → 9.39.1](https://github.com/eslint/eslint/compare/v9.26.0...v9.39.1)
  - ❓ (enabled conditionally) [`no-unassigned-vars`](https://eslint.org/docs/latest/rules/no-unassigned-vars)
  - 🔴 (not enabled) [`preserve-caught-error`](https://eslint.org/docs/latest/rules/preserve-caught-error)
- `angular-eslint`: [19.4.0 → 21.0.1](https://github.com/angular-eslint/angular-eslint/compare/v19.4.0...v21.0.1)
  - Disabled [`no-conflicting-lifecycle`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-conflicting-lifecycle.md) by default since it was marked as deprecated since v21.
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
- `@eslint/css`: [0.7.0 → 0.14.1](https://github.com/eslint/css/compare/css-v0.7.0...css-v0.14.1)
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
- `typescript-eslint`: [8.32.0 → 8.47.0](https://github.com/typescript-eslint/typescript-eslint/compare/v8.32.0...v8.47.0)
  - Set [`checkUnknown: true`](https://typescript-eslint.io/rules/no-base-to-string/#checkunknown) for [`no-base-to-string`](https://typescript-eslint.io/rules/no-base-to-string) rule.
  - 🟢 (enabled) [`no-unused-private-class-members`](https://typescript-eslint.io/rules/no-unused-private-class-members)
- `@eslint-react/eslint-plugin`: [1.49.0 → 2.3.7](https://github.com/Rel1cx/eslint-react/compare/v1.49.0...v2.3.7)
  - [**BREAKING**] Some rules have been renamed and removed. Please refer to [v2 migration guide](https://github.com/Rel1cx/eslint-react/releases/tag/v2.0.0) for more details.
  - [**BREAKING**] Debug rules have been moved to a separate [`eslint-plugin-react-debug`](https://npmjs.com/eslint-plugin-react-debug) package.
  - 🔴 (not enabled) [`jsx-no-iife`](https://eslint-react.xyz/docs/rules/jsx-no-iife)
  - 🟢 (enabled) [`no-unnecessary-key`](https://eslint-react.xyz/docs/rules/no-unnecessary-key)
  - 🟡 (enabled, warns) [`no-forbidden-props`](https://eslint-react.xyz/docs/rules/no-forbidden-props)
  - 🟡 [`no-unused-props`](https://eslint-react.xyz/docs/rules/no-unused-props)
  - 🔴 [`dom/no-string-style-prop`](https://eslint-react.xyz/docs/rules/dom-no-string-style-prop)
  - 🔴 [`dom/prefer-namespace-import`](https://eslint-react.xyz/docs/rules/dom-prefer-namespace-import)
  - 🟡 [`jsx-dollar`](https://eslint-react.xyz/docs/rules/jsx-dollar)
- `@eslint/markdown`: [6.4.0 → 7.5.1](https://github.com/eslint/markdown/compare/v6.4.0...v7.5.1)
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
- `@html-eslint/eslint-plugin`: [0.40.2 → 0.49.0](https://github.com/yeonjuan/html-eslint/compare/v0.40.2...v0.49.0)
  - 🟢 (enabled) [`no-aria-hidden-on-focusable`](https://html-eslint.org/docs/rules/no-aria-hidden-on-focusable)
  - 🟢 [`no-duplicate-in-head`](https://html-eslint.org/docs/rules/no-duplicate-in-head)
  - 🟢 [`no-empty-headings`](https://html-eslint.org/docs/rules/no-empty-headings)
  - 🟢 [`no-ineffective-attrs`](https://html-eslint.org/docs/rules/no-ineffective-attrs)
  - 🟢 [`no-restricted-tags`](https://html-eslint.org/docs/rules/no-restricted-tags). All deprecated or non-standard HTML tags are disallowed by default.
  - Set `enforceTemplatedAttrValue: true` for [`quotes`](https://html-eslint.org/docs/rules/quotes) rule.
- `@vitest/eslint-plugin`: [1.1.44 → 1.4.3](https://github.com/vitest-dev/eslint-plugin-vitest/compare/v1.1.44...v1.4.3)
  - 🟢 (enabled) [`consistent-vitest-vi`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/consistent-vitest-vi.md)
  - 🟡 (enabled, warns) [`warn-todo`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/warn-todo.md)
  - ❓ (enabled conditionally) [`no-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-importing-vitest-globals.md)
  - ❓ [`prefer-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-importing-vitest-globals.md)
  - ❓ [`prefer-called-once`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-once.md)
  - ❓ [`prefer-called-times`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-times.md)
  - 🟢 [`hoisted-apis-on-top`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/hoisted-apis-on-top.md)
  - 🟢 [`prefer-import-in-mock`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-import-in-mock.md)
  - ❓ [`prefer-called-exactly-once-with`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-called-exactly-once-with.md)
  - 🟢 [`require-awaited-expect-poll`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-awaited-expect-poll.md)
- `eslint-plugin-de-morgan`: [1.2.1 → 2.0.0](https://github.com/azat-io/eslint-plugin-de-morgan/compare/v1.2.1...v2.0.0)
- `eslint-plugin-es-x`: [8.6.2 → 9.2.0](https://github.com/eslint-community/eslint-plugin-es-x/compare/v8.6.2...v9.2.0)
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
  - ❓ [`no-intl-locale-prototype-firstdayofweek`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-firstdayofweek.html)
  - ❓ [`no-intl-locale-prototype-getcalendars`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-getcalendars.html)
  - ❓ [`no-intl-locale-prototype-getcollations`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-getcollations.html)
  - ❓ [`no-intl-locale-prototype-gethourcycles`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-gethourcycles.html)
  - ❓ [`no-intl-locale-prototype-getnumberingsystems`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-getnumberingsystems.html)
  - ❓ [`no-intl-locale-prototype-gettextinfo`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-gettextinfo.html)
  - ❓ [`no-intl-locale-prototype-gettimezones`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-gettimezones.html)
  - ❓ [`no-intl-locale-prototype-getweekinfo`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-intl-locale-prototype-getweekinfo.html)
  - ❓ [`no-iterator-concat`](https://eslint-community.github.io/eslint-plugin-es-x/rules/no-iterator-concat.html)
- `eslint-plugin-html`: [8.1.2 → 8.1.3](https://github.com/BenoitZugmeyer/eslint-plugin-html/compare/v8.1.2...v8.1.3)
- `eslint-plugin-jest`: [28.11.0 → 29.2.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.11.0...v29.2.0)
  - 🟡 (enabled, warns) [`prefer-ending-with-an-expect`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-ending-with-an-expect.md)
  - 🟢 (enabled) [`valid-mock-module-path`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/valid-mock-module-path.md)
- `eslint-plugin-jsdoc`: [50.6.14 → 61.4.1](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.14...v61.4.1)
  - 🟢 (enabled) [`escape-inline-tags`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/escape-inline-tags.md)
  - 🔴 (not enabled) [`prefer-import-tag`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/prefer-import-tag.md)
  - 🔴 [`reject-any-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/reject-any-type.md)
  - 🔴 [`reject-function-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/reject-function-type.md)
  - 🔴 [`require-next-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-next-description.md)
  - 🔴 [`require-tags`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-tags.md)
  - 🔴 [`require-template-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-template-description.md)
  - 🔴 [`require-throws-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-throws-description.md)
  - 🔴 [`require-yields-description`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-yields-description.md)
  - 🟡 (enabled, warns) [`require-next-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-next-type.md)
  - 🟡 [`require-throws-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-throws-type.md)
  - 🟡 [`require-yields-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-yields-type.md)
  - 🟢 [`type-formatting`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/type-formatting.md)
  - 🟢 [`ts-method-signature-style`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/ts-method-signature-style.md)
  - 🟢 [`ts-no-empty-object-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/ts-no-empty-object-type.md)
  - 🟢 [`ts-no-unnecessary-template-expression`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/ts-no-unnecessary-template-expression.md)
  - 🟢 [`ts-prefer-function-type`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/ts-prefer-function-type.md)
  - 🔴 [`require-rejects`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/require-rejects.md)
  - Set [`allowIndentedSections: true`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/check-indentation.md#allowindentedsections) for [`check-indentation`](https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/check-indentation.md).
- `@stylistic/eslint-plugin`: [4.2.0 → 5.6.1](https://github.com/eslint-stylistic/eslint-stylistic/compare/v4.2.0...v5.6.1)
- `eslint-plugin-json-schema-validator`: [5.4.0 → 5.5.0](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.4.0...v5.5.0)
- `eslint-plugin-jsonc`: [2.20.0 → 2.21.0](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v2.20.0...v2.21.0)
- `eslint-plugin-n`: [17.18.0 → 17.23.1](https://github.com/eslint-community/eslint-plugin-n/compare/v17.18.0...v17.23.1)
  - 🟢 (enabled) [`no-top-level-await`](https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md)
- `eslint-plugin-node-dependencies`: [1.0.1 → 1.3.0](https://github.com/ota-meshi/eslint-plugin-node-dependencies/compare/v1.0.1...v1.3.0)
  - 🔴 (not enabled) [`require-provenance-deps`](https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/require-provenance-deps.html)
- `eslint-plugin-perfectionist`: [4.12.3 → 4.15.1](https://github.com/azat-io/eslint-plugin-perfectionist/compare/v4.12.3...v4.15.1)
- `eslint-plugin-prettier`: [5.4.0 → 5.4.1](https://github.com/prettier/eslint-plugin-prettier/compare/v5.4.0...v5.4.1)
- `eslint-plugin-qwik`: 1.13.0 → 1.17.2
- `eslint-plugin-regexp`: [2.7.0 → 2.10.0](https://github.com/ota-meshi/eslint-plugin-regexp/compare/v2.7.0...v2.10.0)
- `eslint-plugin-svelte`: [3.5.1 → 3.13.0](https://github.com/sveltejs/eslint-plugin-svelte/compare/eslint-plugin-svelte%403.5.1...eslint-plugin-svelte%403.13.0)
  - 🟢 (enabled) [`no-top-level-browser-globals`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-top-level-browser-globals)
  - 🟢 [`no-add-event-listener`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-add-event-listener)
  - 🟢 [`prefer-writable-derived`](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-writable-derived)
  - 🟢 [`prefer-svelte-reactivity`](https://sveltejs.github.io/eslint-plugin-svelte/rules/prefer-svelte-reactivity)
  - ❓ (enabled conditionally) [`require-event-prefix`](https://sveltejs.github.io/eslint-plugin-svelte/rules/require-event-prefix)
  - 🟢 [`no-navigation-without-resolve`](https://sveltejs.github.io/eslint-plugin-svelte/rules/no-navigation-without-resolve)
- `eslint-plugin-vue`: [10.1.0 → 10.6.0](https://github.com/vuejs/eslint-plugin-vue/compare/v10.1.0...v10.6.0)
  - 🟢 (enabled) [`no-negated-v-if-condition`](https://eslint.vuejs.org/rules/no-negated-v-if-condition.html)
  - 🟢 [`no-negated-condition`](https://eslint.vuejs.org/rules/no-negated-condition.html)
  - 🟢 [`no-duplicate-class-names`](https://eslint.vuejs.org/rules/no-duplicate-class-names.html)
- `eslint-plugin-package-json`: [0.31.0 → 0.85.0](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.31.0...v0.85.0)
  - Removed [`valid-package-definition`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-package-definition.md) as it has been marked as deprecated.
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
  - 🟢 [`bin-name-casing`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/bin-name-casing.md)
  - 🟢 [`no-redundant-publishConfig`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-redundant-publishConfig.md)
  - 🔴 [`restrict-private-properties`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/restrict-private-properties.md)
  - 🟢 [`scripts-name-casing`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/scripts-name-casing.md)
  - 🟢 [`valid-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-files.md)
  - 🟢 [`valid-homepage`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-homepage.md)
  - 🟢 [`valid-keywords`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-keywords.md)
  - 🟢 [`valid-main`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-main.md)
  - 🟢 [`valid-private`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-private.md)
  - 🟢 [`valid-os`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-os.md)
  - 🟢 [`valid-contributors`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-contributors.md)
  - 🟢 [`valid-man`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-man.md)
  - 🟢 [`valid-publishConfig`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-publishConfig.md)
  - 🟢 [`valid-workspaces`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-workspaces.md)
  - 🟢 [`valid-engines`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-engines.md)
  - 🟢 [`valid-repository`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-repository.md)
  - 🔴 [`require-exports`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-exports.md)
  - 🔴 [`require-attribution`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-attribution.md)
  - 🔴 [`require-sideEffects`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-sideEffects.md)
  - 🟢 [`specify-peers-locally`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/specify-peers-locally.md)
  - 🟢 [`valid-sideEffects`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/valid-sideEffects.md)
- `eslint-plugin-jest`: [28.13.5 → 28.14.0](https://github.com/jest-community/eslint-plugin-jest/compare/v28.13.5...v28.14.0)
- `eslint-plugin-prettier`: [5.4.1 → 5.5.0](https://github.com/prettier/eslint-plugin-prettier/compare/v5.4.1...v5.5.0)
- `eslint-plugin-pnpm`: [0.3.1 → 1.3.0](https://github.com/antfu/pnpm-workspace-utils/compare/v0.3.1...v1.3.0)
  - 🟢 (enabled) [`yaml-valid-packages`](https://github.com/antfu/pnpm-workspace-utils/blob/HEAD/packages/eslint-plugin-pnpm/src/rules/yaml/yaml-valid-packages.ts#L29)
- `eslint-plugin-tailwindcss`: [3.18.0 → 3.18.2](https://github.com/francoismassart/eslint-plugin-tailwindcss/compare/v3.18.0...v3.18.2)
- `eslint-plugin-unicorn`: [59.0.1 → 62.0.0](https://github.com/sindresorhus/eslint-plugin-unicorn/compare/v59.0.1...v62.0.0)
  - 🟢 (enabled) [`no-array-reverse`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-array-reverse.md)
  - 🟢 [`no-useless-error-capture-stack-trace`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-error-capture-stack-trace.md)
  - 🟢 [`prefer-class-fields`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-class-fields.md)
  - 🟢 [`require-module-specifiers`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/require-module-specifiers.md)
  - 🟢 [`prefer-bigint-literals`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-bigint-literals.md)
  - 🟢 [`prefer-classlist-toggle`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-classlist-toggle.md)
  - 🟢 [`require-module-attributes`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/require-module-attributes.md)
  - 🟢 [`no-array-sort`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-array-sort.md)
  - 🟢 [`no-immediate-mutation`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-immediate-mutation.md)
  - 🟢 [`no-useless-collection-argument`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-collection-argument.md)
  - 🟢 [`prefer-response-static-json`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-response-static-json.md)
- `eslint-plugin-sonarjs`: [3.0.2 → 3.0.5](https://github.com/SonarSource/SonarJS/blob/HEAD/packages/jsts/src/rules/CHANGELOG.md)
  - `no-invalid-await` rule got removed.
  - `no-one-iteration-loop` rule got removed.
- `tailwind-csstree`: [0.1.2 → 0.1.4](https://github.com/humanwhocodes/tailwind-csstree/compare/tailwind-csstree-v0.1.2...tailwind-csstree-v0.1.4)
- `svelte-eslint-parser`: [1.3.0 → 1.4.0](https://github.com/sveltejs/svelte-eslint-parser/compare/v1.3.0...v1.4.0)
- `@next/eslint-plugin-next`: [15.3.2 → 16.0.3](https://github.com/vercel/next.js/compare/v15.3.2...v16.0.3)
- `eslint-plugin-unused-imports`: 4.1.4 → 4.3.0
- `eslint-plugin-yml`: [1.18.0 → 1.19.0](https://github.com/ota-meshi/eslint-plugin-yml/compare/v1.18.0...v1.19.0)
- `eslint-plugin-jest-extended`: [3.0.0 → 3.0.1](https://github.com/jest-community/eslint-plugin-jest-extended/compare/v3.0.0...v3.0.1)
- `eslint-plugin-prefer-arrow-functions`: [3.6.2 → 3.9.1](https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/compare/3.6.2...3.9.1)
- `eslint-plugin-react-hooks`: [5.2.0 → 7.0.1](https://github.com/facebook/react/blob/HEAD/packages/eslint-plugin-react-hooks/CHANGELOG.md)
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
- `eslint-plugin-astro`: [1.3.1 → 1.5.0](https://github.com/ota-meshi/eslint-plugin-astro/compare/v1.3.1...v1.5.0)
  - 🟢 (enabled) [`no-unsafe-inline-scripts`](https://ota-meshi.github.io/eslint-plugin-astro/rules/no-unsafe-inline-scripts)
- `eslint-plugin-case-police`: [2.0.0 → 2.1.1](https://github.com/antfu/case-police/compare/v2.1.0...v2.1.1)
- `eslint-plugin-pinia`: [0.4.1 → 0.4.2](https://github.com/lisilinhart/eslint-plugin-pinia/compare/v0.4.1...v0.4.2)

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
  - 🟢 (enabled) [`prefer-import-meta-properties`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-import-meta-properties.md) enabled in `node` config if detected supported Node.js version is a subset of `>=20.11` version range.
  - 🟢 [`no-unnecessary-array-flat-depth`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unnecessary-array-flat-depth.md)
  - 🟢 [`no-unnecessary-array-splice-count`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unnecessary-array-splice-count.md)
  - [**BREAKING**] `no-array-push-push` renamed to [`prefer-single-call`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-single-call.md)
  - [**BREAKING**] `no-length-as-slice-end` renamed to [`no-unnecessary-slice-end`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-unnecessary-slice-end.md)
- `@eslint-react/eslint-plugin`: [1.48.4 → 1.48.5](https://github.com/Rel1cx/eslint-react/compare/v1.48.4...v1.48.5)
- `typescript-eslint`: [8.31.0 → 8.31.1](https://github.com/typescript-eslint/typescript-eslint/compare/v8.31.0...v8.31.1)
  - [**BREAKING**] [`no-unnecessary-condition`](https://typescript-eslint.io/rules/no-unnecessary-condition) autofix was previously disabled, but it's now downgraded to a suggestion, as a result it have lost the `disable-autofix` prefix.
- `eslint-plugin-import-x`: [4.10.6 → 4.11.0](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.10.6...v4.11.0)
- `eslint-plugin-jsdoc`: [50.6.9 → 50.6.11](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.9...v50.6.11)
- `eslint-plugin-package-json`: [0.29.1 → 0.31.0](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.29.1...v0.31.0)
  - 🔴 (off) [`restrict-dependency-ranges`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/restrict-dependency-ranges.md)
  - 🔴 [`require-description`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-description.md)
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
  - 🟢 (enabled) [`prefer-describe-function-title`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-describe-function-title.md)
- `eslint-config-prettier`: [10.1.1 → 10.1.2](https://github.com/prettier/eslint-config-prettier/compare/v10.1.1...v10.1.2)
- `eslint-import-resolver-typescript`: [3.9.1 → 4.3.4](https://github.com/import-js/eslint-import-resolver-typescript/compare/v3.9.1...v4.3.4)
- `eslint-plugin-import-x`: [4.8.0 → 4.10.6](https://github.com/un-ts/eslint-plugin-import-x/compare/v4.8.0...v4.10.6)
- `eslint-plugin-jsdoc`: [50.6.6 → 50.6.9](https://github.com/gajus/eslint-plugin-jsdoc/compare/v50.6.6...v50.6.9)
- `eslint-plugin-json-schema-validator`: [5.3.1 → 5.4.0](https://github.com/ota-meshi/eslint-plugin-json-schema-validator/compare/v5.3.1...v5.4.0)
- `eslint-plugin-jsonc`: [2.19.1 → 2.20.0](https://github.com/ota-meshi/eslint-plugin-jsonc/compare/v2.19.1...v2.20.0)
- `eslint-plugin-n:` [17.16.2 → 17.17.0](https://github.com/eslint-community/eslint-plugin-n/compare/v17.16.2...v17.17.0)
- `eslint-plugin-package-json`: [0.26.3 → 0.29.1](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/compare/v0.26.3...v0.29.1)
  - 🔴 (off) [`require-engines`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-engines.md)
  - 🔴 [`require-types`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-types.md)
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
- [**BREAKING**] Disabled autofix for [`no-unnecessary-type-assertion`](https://typescript-eslint.io/rules/no-unnecessary-type-assertion) due to [this bug](https://github.com/typescript-eslint/typescript-eslint/issues/8721).
- New config: `deMorgan` via [`eslint-plugin-de-morgan`](https://npmjs.com/eslint-plugin-de-morgan), **<u>disabled</u>** by default.

### Dependencies

- `eslint-plugin-unicorn`: 56.0.1 → 57.0.0
  - [**BREAKING**] Claims to support only `eslint`>=9.20.0, but we haven't enforced this version range in `peerDependencies` in case it works fine with the older versions.
  - ESM only now.
  - ❌ (deprecated) `no-instanceof-builtins`
  - 🟡 (warns) [`consistent-assert`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-assert.md)
  - 🟢 (enabled) [`consistent-date-clone`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-date-clone.md)
  - 🟢 [`no-accessor-recursion`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-accessor-recursion.md)
  - 🟢 [`no-instanceof-builtins`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-instanceof-builtins.md)
  - 🟢 [`no-named-default`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-named-default.md)
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
  - 🟡 (warns) [`require-mock-type-parameters`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/require-mock-type-parameters.md)
  - 🔴 (off) [`prefer-strict-boolean-matchers`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-strict-boolean-matchers.md)
- `eslint-config-flat-gitignore`: 1.0.0 → 2.0.0
- `eslint-merge-processors`: 1.0.0 → 2.0.0
- `eslint-plugin-jsdoc`: 50.6.2 → 50.6.3
- `eslint-plugin-jsonc`: 2.18.2 → 2.19.1
- `eslint-plugin-package-json`: 0.20.0 → 0.26.0
  - 🟢 (enabled) [`no-empty-fields`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-empty-fields.md)
  - 🟢 [`require-version`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-version.md)
  - 🟢 [`require-name`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-name.md)
  - 🔴 (off) [`require-author`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-author.md)
  - 🔴 (off) [`require-keywords`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-keywords.md)
  - 🔴 (off) [`require-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/require-files.md)
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
  - Enabled a new [`no-redundant-files`](https://github.com/JoshuaKGoldberg/eslint-plugin-package-json/blob/HEAD/docs/rules/no-redundant-files.md) rule.
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

- [**BREAKING**] [`prefer-inline` option of `import/no-duplicates` rule](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/no-duplicates.md#inline-type-imports) is now set to `true`. Added an new option `noDuplicatesOptions` in `import` config to override this behavior.
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
  - [**BREAKING**] Replace `allowThen: true` with the new [`allowThenStrict: true`](https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/catch-or-return.md#allowthenstrict) in `catch-or-return` rule.
  - [**BREAKING**] Enabled a new [`prefer-catch`](https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/prefer-catch.md) rule.
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
    - Enable `checkTypeImports` option for [`import/extensions`](https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/extensions.md) rule.

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
    - Enable [`unicorn/consistent-existence-index-check`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/consistent-existence-index-check.md) and [`unicorn/prefer-math-min-max`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-math-min-max.md) rules.
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
    - Enabled a new [`@typescript-eslint/no-deprecated`](https://typescript-eslint.io/rules/no-deprecated) rule.
- Internal code refactoring.

## 0.0.7

- Update dependencies. Highlights:
  - Enable new rule: [`promise/spec-only`](https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/spec-only.md).
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
