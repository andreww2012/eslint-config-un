---
name: eslint-config-un-config-tests
description: Guide on how to write Vitest tests for `eslint-config-un` Configs
---

Tests must live in the `/test` directory and have `.spec.ts` extension.

## Terminology

- **Config** — a logical entity of `eslint-config-un`, configurable via the `configs.<name>` property.
  - Corresponds to a single file in `src/configs/`.
  - Each Config generates one or more ESLint flat configs.
  - The common interface is `UnFlatConfigEntryBase` from `src/eslint/eslint-types.ts`.
  - All Configs are listed in `src/configs/index.ts`.
  - A Config may have custom options and special `configSomeConfig` options, which are ALWAYS related to Sub-configs.
- **Sub-config** — same as Config, but defined *within* a Config file.
  Everything said about Configs applies to Sub-configs.

## General guidance

- Consult `vitest.config.ts` to understand the test setup.
- Prefer `it` over `test`; start test/section names with a lowercase letter.
- Use global helpers from `test/helpers` whenever possible.
- Ensure tests pass.
  Run tests with `nr t` (alias for `npx vitest`), do not use IDE integration.
- Insert a blank line before `describe`, `it`, and the *first* `expect` unless they are the first line in a block.
  Only add a blank line between `expect`s if they are logically separate.
- Prefer `toStrictEqual` over `toEqual` for non-primitives; use `toBe` for primitives.
- Extract repeated values into constants in the **closest possible scope**.
- Always collect fixture file names in a top-level `FIXTURES` object with `as const`, even for a single fixture (of course, omit if none is used).
- Global hooks should go directly before the first `describe`/`it`, i.e. definitely after `FIXTURES`.
- A fixture name should describe the code, not the error or ESLint rule — it should be agnostic of where and how it is used.
- Avoid assigning an expression to a variable if it's only used once - inline it instead, unless the expression has `await` or is too complex.
- If some test(s) time out, don't increase the timeout - just re-run the test suite.

## Creating tests

### For configs

Each Config gets its own file: `test/configs/<name>/<name>.spec.ts` (e.g., `test/configs/vue/vue.spec.ts`).
Each Sub-config goes in a separate file: `test/configs/<name>/<name>-<sub-config>.spec.ts` (e.g., `test/configs/vue/vue-nuxt.spec.ts`).
The main Config test file must **not** test Sub-config rules or options.

You can use, for example, the following test files as a reference for structure and style:

- `ts/*.spec.ts` or `drizzle/drizzle.spec.ts` - the most up-to-date structure (not all specs have been up-to-date with it), **USE AS A PRIMARY REFERENCE**
- `jsdoc/jsdoc.spec.ts` - testing `jsdoc`, a config that is enabled by default and has sub-configs
- `test/angular/*.spec.ts` - for `angular`, config enabled <=> `@angular/core` package is installed and has sub-configs
- `lockfile/lockfile.spec.ts` - for `lockfile`, config from `misc-enabled` group
- `prefer-arrow-functions/prefer-arrow-functions.spec.ts` - for `preferArrowFunctions`, config disabled by default

#### Test file structure

##### `basic test` describe block

There should be a test verifying what is produced by default.
This includes ESLint configs, ESLint plugins, and, if the config is enabled, important defaults (eslint configs' `files` and more rarely used options like `parser` or `languageOptions`).
If the config is disabled, the test should confirm that it produces none of this.
There should always be at least one positive and one negative test: if config is enabled by default, the other test should explicitly disable it, and vice versa.

Determine the default-enable condition from `src/configs/index.ts` and/or `src/config-un/config.ts`.
If it has one, make sure this condition is true by default for the *whole test suite* (the most common example: treating package(s) as installed)
Then create sub-describe blocks:

- `mode: all configs are disabled` — corresponds to `defaultConfigStatus: 'all-disabled'`:
  - config is not explicitly enabled
  - config is explicitly enabled
- `mode: all configs are not explicitly enabled or disabled` — the actual default (`defaultConfigStatus: undefined`):
  - config is not explicitly enabled/disabled
  - config explicitly {enabled,disabled} (2 tests)
  - (if has condition) condition is explicitly {enabled,disabled} and that condition is {true,false} (4 tests)
- `mode: misc configs are enabled` — corresponds to `defaultConfigStatus: 'misc-enabled'`:
  - config is not explicitly enabled/disabled
  - config explicitly {enabled,disabled}

Note: sub-config tests shouldn't have "mode" blocks because they are not applicable to them, but you still need to have basic tests.

##### `un options` block

Test Config behavior when common options are set to non-default values.

##### `rules` block

Verify that a single "main" rule is enabled by default and a different rule is disabled by default (if applicable) like this:

```ts
expect(configResult.getRuleSeverities('<config name>')).toMatchObject({
  'plugin/rule1': 2,
  rule2: 0,
});
```

Then pick a "popular" rule and confirm it actually works: create a minimal fixture that triggers an error, lint it with `testEslintConfig`, use `findLintMessageFromLintResults` to locate the error, and assert with `expect(error?.message).toMatchInlineSnapshot()`.

##### `option: \`files\`` — check how provided files affect ESLint config(s) files

Include an extra test for `files: []`, which prevents ESLint config(s) from being created (disables the Config without disabling Sub-configs).

##### `option: \`ignores\`` — same as `files`, but an empty array has no special meaning

<!-- eslint-disable-next-line markdown-preferences/heading-casing -->
##### (single test outside describe blocks) `respects \`overrides\` and \`overridesAny\` in \`<eslint config name(s)>\` eslint config(s)`

##### `options` block

Test each custom option of the Config (excluding Sub-config-related options).
Create a describe block per option.
It should be named `option: \`<option name>\``.

Unless the value set is big or infinite, test **every possible value** (including the default) both positively and negatively.
For example, for a boolean option you should test `true`, `false` and unset values.
The test name for an unset value should end with `when option is not set`.
The test name for primitive values should end with `when option is \`value\`\`.
BUT: if the tested value is the default value, the test name should end with `by default` instead of `when option is <...>`.

---

IMPORTANT: This list is mandatory to cover (unless some options don't exist), but not exhaustive.
Test as many features as possible.

It is necessary, but not sufficient, that the overall Vitest coverage for config file `src/configs/<config name>.ts`:

- 100% statements;
- \>=98% branches/functions/lines.

IMPORTANT: check the coverage by adding `--coverage.reporter=text` command line option when running `vitest`.
Ignore coverage issues in `enableConfigTesterForPlugin` block, since it's only supposed to be run in dev mode.

#### Assertion guidelines

- Implicit `files` or `ignores`: `toMatchInlineSnapshot`
- Rule entry (resolved severity + options): `toMatchInlineSnapshot`
- If asserting that rule options (partially) equal a non-trivial user-provided value, assert, if possible, `configResult.getRuleEntryOptions(...).toStrictEqual([...])`
- User-provided files: `toStrictEqual` or `.toIncludeAllMembers`
- User-provided ignores: `.toIncludeAllMembers` + assert that the ignores array length exceeds the user-provided count (implicit ignores usually exist)
- Absence of user-provided files/ignores: `.not.toIncludeAnyMembers`
- Other cases: use the reference or your judgement

When using `toMatchInlineSnapshot`, **never** guess the expected output.
Run tests with empty `.toMatchInlineSnapshot()` and let Vitest fill them via `npx vitest run --update`.
Never re-run without `--update` if inline snapshots are already filled — Vitest will append a duplicate instead of replacing.
If a filled snapshot is `undefined`, switch to a different assertion type.

#### Other guidelines

- Always use full rule name `<plugin>/<rule-name>` in test name, and enclose them in backticks.
  Use "our" default config prefixes, e.g. `ts` instead of `@typescript-eslint`.

### Implementation plan

Implement tests in this order:

1. Determine which Config tests are needed; create `describe`/`it` blocks with `.todo`.
2. Present the plan, then implement each `describe` block step-by-step.
   Each step should be done in a sub-agent.
3. Once all Config tests are done, repeat for every Sub-config (options starting with `config`).

Just before finishing, ensure there are no TypeScript, Prettier and ESLint errors in the created test files.
When fixing TypeScript errors, do your best to avoid type casts (`as`) and suggest more clever workarounds (for example, you can use `toMatchObject` instead of `toStrictEqual`)