---
"eslint-config-un": patch
---

lit: updated [`eslint-plugin-lit-a11y` from v5.1.1 to v5.1.3](https://github.com/open-wc/open-wc/compare/eslint-plugin-lit-a11y@5.1.1...eslint-plugin-lit-a11y@5.1.3):

- ⚙️ `a11y` sub-config: fixed the invalid options errors of [`lit-a11y/anchor-is-valid`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/anchor-is-valid.md), [`lit-a11y/img-redundant-alt`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/img-redundant-alt.md) and [`lit-a11y/mouse-events-have-key-events`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/mouse-events-have-key-events.md) rules with `eslint-plugin-lit-a11y` v5.1.3 and above, caused by passing them the options of the `jsx-a11y` rules of the same name
- ⚙️ `a11y` sub-config: `imageWords` option now actually applies to [`lit-a11y/img-redundant-alt`](https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/img-redundant-alt.md) rule