---
"eslint-config-un": patch
---

fileProgress: the progress is now also hidden by default when the standard output is not a terminal, [`TERM`](https://man7.org/linux/man-pages/man7/term.7.html) is `dumb` or a `CI` variable is set, where it printed a line per linted file
