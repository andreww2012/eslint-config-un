---
"eslint-config-un": patch
---

un: `un/vue-no-trailing-element-whitespace` now treats the whitespace around HTML comments like Vue does in production builds, where comments are removed: it no longer reports the whitespace between a comment and an element that may not render, and now reports the whitespace after a comment at the end of an element
