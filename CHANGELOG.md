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
