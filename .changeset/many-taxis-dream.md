---
"eslint-config-un": minor
---

un: added `un/no-array-sort`, `un/no-array-reverse` and `un/no-array-splice` rules, off by default. Unlike the rules of the same names in `eslint-plugin-unicorn`, they don't ask to copy new arrays that nothing else uses, like the result of `.filter()`, and report such copies instead
