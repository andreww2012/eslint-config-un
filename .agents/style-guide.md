<!-- eslint-disable markdown-preferences/heading-casing, markdown-preferences/padding-line-between-blocks -->
<!-- prettier-ignore -->
<!-- cspell:disable -->

# Style Guide

Source: <https://github.com/andreww2012/agents/blob/13966c09b9782f9f0ae1a95b2df17f4a16818be4/.agents/style-guide.md>

## Code

- Use `const` instead of `let` whenever possible.
- Prefer arrow functions whenever possible.
- Avoid common shorthands like `str`, `arr`, `cls`, `brk`, `err`, `val`, `pkg`, etc. Use full words.
  Exceptions: `dict`, `ctx`, `acc`.
- Avoid adding comments as much as possible.
  Exception: they explain the actual non-obvious "why" behind the code.
  In other words, they must add *real* value.
  When composing them, avoid verbosity as much as possible but not sacrifice clarity.
- Never put a full stop at the very end of a comment.
- Never omit curly braces around blocks (like `if`, `else`, etc.)
- Let the type system infer types whenever possible (always prefer implicit/inferred return types).
  Some important cases:
  - Specifying explicit return types for functions if it's the same as the return type;
  - Having both explicit return type and the unsafe case of the return value in the same function.
- Do not `export` symbols not used outside the current file and not provided publicly.
- Hoist symbols and literals (like regexes, functions, constants) as high as possible.
- Sort symbols in `export {...}` expressions alphabetically, unless is makes sense to do something else (likely group exports, but they must be exported within each group too).
  Always sort symbols in `import {...}` expressions and sort import statements themselves in [`sort-imports`](https://eslint.org/docs/latest/rules/sort-imports) and [`import/order`](https://raw.githubusercontent.com/un-ts/eslint-plugin-import-x/refs/tags/v4.17.1/docs/rules/order.md) orders respectively.
  Assume default options for `import/order` are `{groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'], alphabetize: {order: 'asc'}}`, but them might be overridden in ESLint config file.
- In general, in *large* lists prefer keeping things alphabetical, if makes sense and not instructed otherwise.
- If you encounter an ESLint error that has multiple ways of fixing, always weigh all options INCLUDING disabling the rule for this line (or, much more rarely, for the entire file) before fixing.
- Do your best to avoid `any` and type casting (`as ...`) in favor of `unknown` or other clever workarounds.
  Safe type casting exceptions: `as unknown`, `as const`, `satisfies T as T`.
- Prefer non-strict equality for `null` and `undefined` comparisons (`== null`, `!= null`) unless it would actually change the existing logic.
- Prefer "direct" conditions over negated:
  - Good: `a ? b : c`, `if (a) { ... } else { ... }`
  - Bad: `!a ? c : b`, `if (!a) { ... } else { ... }`
- If you need a map that is initially empty and will be mutated, use `Map` instead of a plain object whenever possible.
- Prefer `||` over `??` unless the latter actually changes the logic in a positive way.
- For constants, use CONSTANT_CASE <=> value is statically constructed:
  - Good: `const FOO = 'bar'`;
  - Good: `const FOO = ['bar', 1 + 2])`;
  - Bad: `const FOO = ['bar', Math.random()]`.
- When a symbol is only used once, prefer to inline it unless it is non-trivial.
- Keep each sentence in Markdown or JSDoc on a separate line, exactly like in this document.
  Exception: don't do that in `.changeset/*.md` files as they would be rendered differently in the changelog file that [changesets](https://github.com/changesets/changesets) are rendering.

## General

Don't (un)stage or commit changes unless explicitly asked to.
Prefer not to use a stash to find a root cause, test hypotheses and similar - it's better to use something like a git worktree, or completely avoid that.

Use `kebab-case` for files and directory names, unless they are called differently by convention (like `README.md`, `AGENTS.md`, etc).

Don't invoke other package managers except for the used one - i.e. strongly prefer say `pnpm run` instead of `npm run` if pnpm is clearly used.
If [`@antfu/ni` commands](https://raw.githubusercontent.com/antfu-collective/ni/refs/heads/main/README.md) are available, prefer them instead of package manager native ones (i.e. `ni` instead of say `pnpm i(nstall)`).

Avoid British variants of words like *behaviour* or *organisation*.

Always challenge your implementation for performance, ergonomics and code length issues (remember DRY, KISS principles) and find ways to improve it.
Don't over-engineer or over-optimize things though - this is not required in majority of cases.

Never commit or stage changes unless explicitly asked to.

If you're asked to implement X, always consult the `.{agents,claude}/skills` directory of the repo that might contain the relevant implementation info/instructions.

## Testing tools, linters and checkers

Always run them on the *all* changed files (not only source files!) unless not possible or instructed otherwise and if the corresponding tools are available *only when the task is done*.
Ignore the pre-existing issues.
If there are specific package.json scripts to invoke them, prefer them instead over calling directly:

- TypeScript as type checker (usually `tsc --noEmit` or `vue-tsc --notEmit` for Vue projects)
- ESLint (`eslint list.ext1 of.ext2 changed.ext3 files.ext4`)
- Prettier (`prettier --write --log-level warn changed.ts files.js`)
- Vitest (usually `vitest run changed.spec.ts files.spec.js`)
- Knip (`knip`)
- CSpell (`cspell --no-progress --no-summary changed.ext1 files.ext2`)
- Dependency vulnerability checker (if the lockfile was modified), for example `pnpm audit --audit-level high` (usually high+ vulnerabilities are only important to fix)

### CSpell

If a word to ignore only encountered in a single file:

- Use top-level comment `cspell:ignore words to disable` if the word only occurs once in a file, or it's not possible to use the inline comment `cspell:disable-line`
- Otherwise, use that inline comment.
  Warning: it does not accept the list of words to ignore on the line, so please minimize the line length that is going to be disabled by CSpell.

## Meta

Don't say (unless asked explicitly) you have been following this style guide; just follow it.