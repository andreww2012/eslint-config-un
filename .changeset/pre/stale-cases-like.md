---
"eslint-config-un": minor
---

Added the following options to built-in `un/no-multiple-consecutive-spaces` rule:

- `allow{Leading,Trailing}Spaces`, which control whether multiple leading/trailing consecutive spaces will be flagged by this rule. Each accepts:
  - `'always'` (default)
  - `'never'`
  - `'stringOnly'` (only at the very start/end of the whole string)
  - `'linesOnly'` (only right after/before a line break). Note that a run of spaces at the start or end of the whole string is governed by the string variant, not the line one.
- `checkTemplateLiterals`, defaulting to `true`, which controls whether template literal strings should also be checked.
- `checkTaggedTemplateLiterals`, defaulting to `false`, which controls whether tagged template literals (like `sql`, `html`, `css`, `String.raw`, etc.) should also be checked.
- `spaceCharacters`, an object controlling which characters count as a space: `space` (U+0020, `true` by default), `tab` and `unicodeSpaces` (every Unicode space separator, like no-break space). The object is merged with the default, so `{tab: true}` keeps regular spaces enabled.
- `reportMixedSpaces`, defaulting to `true`, which reports runs made of different kinds of space characters (like a regular space next to a no-break space) regardless of `spaceCharacters`, `allowSpacesOnly` and `allow{Leading,Trailing}Spaces`, since such runs are almost always accidental.
- `ignorePatterns`, an array of regular expression strings (compiled with the `u` flag); a string literal or template literal whose source text (between the quotes or backticks) matches any of them is skipped entirely.
