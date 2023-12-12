# esling-config-un

[![npm](https://img.shields.io/npm/v/esling-config-un)](https://www.npmjs.com/package/esling-config-un)

Grown out of the personal collection of rules, an ESLint config aspiring to cover as many rules as possible, be reasonably strict and easily configurable. Only supports ESLint 9 and flat config format.

Includes the following rules, configs & plugins:
- [Vanilla ESLint rules](https://eslint.org/docs/latest/rules/)
- [typescript-eslint](https://typescript-eslint.io/rules/)
- [vue](https://eslint.vuejs.org/rules/)
- [unicorn](https://www.npmjs.com/package/eslint-plugin-unicorn)
- [node](https://www.npmjs.com/package/eslint-plugin-n) (`eslint-plugin-n` with `node` prefix)
- [import](https://www.npmjs.com/package/eslint-plugin-import-x) (`eslint-plugin-import-x` with `import` prefix)
- [promise](https://www.npmjs.com/package/eslint-plugin-promise)
- [security](https://www.npmjs.com/package/eslint-plugin-security)
- [sonar](https://www.npmjs.com/package/eslint-plugin-sonarjs)
- [tailwind](https://www.npmjs.com/package/eslint-plugin-tailwindcss)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier) to disable Prettier-incompatible rules.

By default, designed to be used separately from Prettier.

## Usage

In your `eslint.config.[cm]?js`:

```js
// @ts-check
import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  // your configuration (optional)
});
```