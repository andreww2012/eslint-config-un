---
"eslint-config-un": minor
---

un: added `un/no-array-sort`, `un/no-array-reverse` and `un/no-array-splice` rules, off by default. Unlike the `unicorn` rules of the same names, they don't ask to copy new arrays that nothing else uses, like the result of `.filter()`, and report such copies instead
