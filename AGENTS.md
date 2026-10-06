# `eslint-config-un`

Before your first response, you MUST read [the project guidelines](./.agents/guidelines.md) in full.
Follow them in everything you do, even when you are only answering a question.

## About

`eslint-config-un` is an ESLint configuration generator, wrapping 100+ ESLint plugins.
For usage examples, concepts and API documentation, see [`README.md`](./README.md).

## Instructions

Only ever run the full test suite if you've made the core logic changes and it has a high chance of affecting majority of test files.
Running it fully takes a lot of resources (time especially and memory too) to complete.

Avoid mentioning this package's name in internal comments.

Never statically import at runtime any Config file matching `src/configs/**/*.ts` or the plugin metadata files (`src/plugins/*.ts` except `shared.ts`).

Keep each call chain on a Config builder (`.addRule(...)`, `.markCategory(...)` and so on) under 250 calls: a longer one overflows the parser's call stack when the file is linted on its own (for example, that crashes ESLint).

Never reference Sub-configs with the `config` prefix: use `scss` in docs, not `configScss`.

Wrap type intersections in `Prettify`, but only where it actually flattens in the editor hover (for example, it won't if any operand is a union).

If you need a union type of literals and all its values available in runtime, don't use an array as the source of truth: use the type instead.
Declare the corresponding array using `allUnionMembers` helper.

Don't leave a trailing empty line in .md changeset files.

When referencing rule names in the docs, always wrap it in a link to the rule's docs page if it's available.

<!-- eslint-disable-next-line markdown-preferences/no-heading-trailing-punctuation -->
## When you're asked to...

- Add or modify config tests, follow [this skill](.agents/skills/eslint-config-un-config-tests/SKILL.md).
- Add support for a new plugin or add a new Config, follow [this skill](.agents/skills/eslint-config-un-new-eslint-plugin/SKILL.md).