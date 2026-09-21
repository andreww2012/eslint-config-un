---
"eslint-config-un": patch
---

cloudfrontFunctions: stopped reporting `cloudfront` imports and documented runtime features like `**` and `globalThis`, and disabled rules suggesting syntax CloudFront doesn't support. Node.js globals missing in CloudFront are now reported by [`no-undef`](https://eslint.org/docs/latest/rules/no-undef)