---
'eslint-config-un': minor
---

node, unicorn: [`unicorn/prefer-import-meta-properties`](https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/prefer-import-meta-properties.md) rule is now always enabled in the `unicorn` config, and disabled in the `node` config when the supported Node.js version range from `package.json` does not guarantee this feature is fully supported in this range