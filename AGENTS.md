# `eslint-config-un`

Before your first response, you MUST read [the project guidelines](./.agents/guidelines.md) in full.
Follow them in everything you do, even when you are only answering a question.

## About

`eslint-config-un` is an ESLint configuration generator, wrapping 100+ ESLint plugins.
For usage examples, concepts and API documentation, see [`README.md`](./README.md).

## Instructions

Only ever run the full test suite if you've made the core logic changes and it has a high chance of affecting majority of test files.
Running it fully takes a lot of resources (time especially and memory too) to complete.

Don't typecheck with TypeScript 6: it only exists for ESLint to work.
Use TypeScript 7.

Avoid mentioning this package's name in internal comments.

Never statically import at runtime any Config file matching `src/configs/**/*.ts` or the plugin metadata files (`src/plugins/*.ts` except `shared.ts`).

Keep each call chain on a Config builder (`.addRule(...)`, `.markCategory(...)` and so on) under 250 calls: a longer one overflows the parser's call stack when the file is linted on its own (for example, that crashes ESLint).

Keep typechecking fast.

Never reference Sub-configs with the `config` prefix: use `css/scss` or `scss` in docs, never `configScss`.

Wrap type intersections in `Prettify`, but only where it actually flattens in the editor hover (for example, inline as a property or parameter type, it won't if any operand is a union; as the whole body of a type alias, it still does).

If you need a union type of literals and all its values available in runtime, don't use an array as the source of truth: use the type instead.
Declare the corresponding array using `allUnionMembers` helper.

When referencing rule names in the docs, always wrap it in a link to the rule's docs page if it's available.

Check new or changed links with lychee as [CI](./.github/workflows/ci.yml) does (local report: `.lychee.report.md`).

GitHub Actions dependencies are locked with [`gh actions-lock`](https://github.com/github/gh-actions-lock).
After adding or updating any `uses:` in workflows or actions, run it to update the lockfile.

Reference rules by their "full name": `<default un plugin prefix>/<rule-name>`, i.e. `unicorn/prefer-dispose`, not just `prefer-dispose`.

Scope commit messages and changesets by the Configs whose output actually changes.
For example, marking rules as stylistic only changes what `noStylisticRules` disables, so scope it to `noStylisticRules`, not to the Configs of the rules' plugins.

In changesets, describe only what changes in this package, like its output, options or API.
Don't describe behavior changes inside a dependency, like a rule that now reports more cases.

<!-- eslint-disable-next-line markdown-preferences/no-heading-trailing-punctuation -- the heading introduces a list -->
## When you're asked to...

- Add or modify config tests, follow [this skill](./.agents/skills/eslint-config-un-config-tests/SKILL.md).
- Add support for a new plugin or add a new Config, follow [this skill](./.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md).