---
"eslint-config-un": minor
---

tsrx: updated [`@tsrx/eslint-{plugin,parser}` from v0.6.3 to v0.7.1](https://github.com/tsrx-org/tsrx/compare/@tsrx/eslint-plugin@0.6.3...@tsrx/eslint-plugin@0.7.1):

- 🟢 enabled [`tsrx/no-await-in-loop`](https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md), [`tsrx/no-unreachable`](https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md) and [`tsrx/no-unused-vars`](https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md) rules in `.tsrx` and `.ripple` files in place of the core rules of the same names, with their severities and options
- 🔴 not enabled [`tsrx/jsx-curly-brace-presence`](https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md) rule, as the `react` config doesn't apply to these files