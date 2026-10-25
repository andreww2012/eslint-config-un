---
"eslint-config-un": patch
---

import: `import/*` rules no longer report "Parse errors in imported module" for TS modules in strict `node_modules` layouts, like the ones of Yarn PnP and upm
