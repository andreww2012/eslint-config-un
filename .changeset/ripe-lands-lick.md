---
"eslint-config-un": patch
---

Autofix is now disabled by default for 28 more rules whose fixes can change how code works or renders (for some, only without type information). They can be turned back on with `autofixDisabledGloballyFor`

<details>
<summary>Rules with autofix newly disabled (28)</summary>

- [`e18e/prefer-array-at`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-array-from-map`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-array-some`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-array-to-reversed`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-array-to-sorted`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-includes-over-regex-test`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-nullish-coalescing`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-spread-syntax`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`e18e/prefer-timer-args`](https://github.com/e18e/eslint-plugin/blob/HEAD/README.md)
- [`html/head-order`](https://html-eslint.org/docs/rules/head-order)
- [`jest/prefer-mock-promise-shorthand`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-mock-promise-shorthand.md)
- [`jest/prefer-mock-return-shorthand`](https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/prefer-mock-return-shorthand.md)
- [`markdown/no-missing-atx-heading-space`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-missing-atx-heading-space.md)
- [`markdown/no-space-in-emphasis`](https://github.com/eslint/markdown/blob/HEAD/docs/rules/no-space-in-emphasis.md)
- [`markdown-preferences/thematic-break-character-style`](https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/thematic-break-character-style.html)
- [`math/prefer-exponentiation-operator`](https://ota-meshi.github.io/eslint-plugin-math/rules/prefer-exponentiation-operator.html)
- [`promise/prefer-catch`](https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/prefer-catch.md)
- [`react/function-component-definition`](https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/function-component-definition.md)
- [`unicorn/no-useless-spread`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/no-useless-spread.md)
- [`unicorn/prefer-at`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-at.md)
- [`unicorn/prefer-math-min-max`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-math-min-max.md)
- [`unicorn/prefer-modern-dom-apis`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-modern-dom-apis.md)
- [`unicorn/prefer-modern-math-apis`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-modern-math-apis.md)
- [`unicorn/prefer-string-starts-ends-with`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-string-starts-ends-with.md)
- [`vitest/no-importing-vitest-globals`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/no-importing-vitest-globals.md)
- [`vitest/prefer-mock-promise-shorthand`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-mock-promise-shorthand.md)
- [`vitest/prefer-mock-return-shorthand`](https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/prefer-mock-return-shorthand.md)
- [`yaml/plain-scalar`](https://ota-meshi.github.io/eslint-plugin-yml/rules/plain-scalar.html)

</details>
