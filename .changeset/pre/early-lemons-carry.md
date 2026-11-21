---
"eslint-config-un": minor
---

Configs and Sub-configs can now be set to a string, which is a shorthand for their `files` with only this pattern: `{configs: {node: 'backend/**'}}` is the same as `{configs: {node: {files: ['backend/**']}}}`
