---
name: eslint-config-un-new-eslint-plugin
description: Adding support for a new ESLint plugin for eslint-config-un
---

<!-- eslint-disable markdown-preferences/heading-casing -->

## Intro

CRITICAL: when you're uncertain when making a decision, it's always better to ask than make a questionable assumption.

## Guide

### Step 0: installation

When you are asked to support a new ESLint plugin, you need to first check if it is already installed.
If not, you need to decide whether it should be strongly associated with:

- A new Config like most of the existing plugins do.
  Example: `eslint-plugin-jsdoc` is associated with the `jsdoc` Config;
- An existing Config, usually in the form of Sub-Config.
  Example: `@intlify/eslint-plugin-vue-i18n` is associated with the `vue` Config as the `vue-i18n` Sub-Config;
- Something else entirely (rare and should be discussed further).

The plugin likely needs to be added to `peerDependencies`, `peerDependenciesMeta` and `devDependencies` of `package.json` like most of the existing plugins.
The most important criterion of inclusion in regular `dependencies` is popularity: that plugin should be popular enough that it would create friction for most users if they had to install it themselves.
But we believe all the popular plugins are already supported.

### Step 1: Adding plugin loader and choosing prefix

Add a plugin loader [here](../../../src/loaders/plugins.ts), maintaining the alphabetical order.
The plugin prefix should be the one that the plugin developer recommends in the docs.

Make sure to read the plugin docs.
Common documentation locations are:

- Bundled `README.md`;
- Repo likely specified in `repository` field of the plugin's `package.json`;
- Website specified in `homepage` field.

ONLY IF the plugin type does not satisfy the expected plugin type (check TS errors in this file), add `satisfies Promise<EslintPlugin> (as unknown) as Promise<EslintPlugin>` and then put `// @ts-expect-error types mismatch` directive before the line on which the error occurs.

### Step 1*: Adding other loaders

Sometimes the plugin requires parser/processor/etc. for its' rules to work.
If you installed new packages for that, make sure to add them to `src/loaders/{parsers,packages}.ts`, following the same algorithm.

### Step 2: Updating generated artifacts

Run `nr prep`.
It generates two kinds of artifacts:

- The plugin rules' types — its output gives you the exact rules that this plugin provides;
- Final Config types and JSDoc for them and other technical artifacts.

You will run this command again after writing the Config file for the second item.

### Step 3: Config file

#### Step 3.1: Choosing Config name

You need to come up with a name for the new Config.

It should be descriptive and concise, ideally very close to the plugin name.
It should not include generic words like "eslint", "plugin", or contain other irrelevant words (for example, a company name that maintains the plugin and publishes it under their npm scope).
The rule of thumb: just by looking at the Config name, most of the users should be able to unmistakably guess which plugin it is associated with.

#### Step 3.2: Creating Config file

Create a new Config file in `src/configs/` if it should have one.
The general file structure can be inferred from the `eslint-config-un new config` snippet in `.vscode/snippets.code-snippets` or from the existing Config files.

### Step 4: Config file content

#### Step 4.1: Config options

This file should export `<ConfigName>EslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>` interface extending `UnFlatConfigEntryBase<ExtraPlugins, '<configName>'>`.
This type includes all the Config's custom options.
The order of the options is as follows (all are optional):

- `configXxx`: sub-configs.
  Should have the type of `boolean | UnFlatConfigEntryBase<ExtraPlugins, '<configName>'> & { /* optional custom options */}`.
- All the other custom options.

You may only *suggest* implementing some custom options at the end.

If the plugin accepts any, export a `<PluginName>PluginSettings` type from the Config file, register it in `src/config-un/plugin-settings.ts` under the canonical plugin prefix, and read it in the Config body with `context.getPluginSettings('<plugin prefix>')`.
The type should preferably be imported from the plugin itself, but most of the plugins don't export it, so it should be constructed manually from the docs/source code.

DO NOT assign `files` or `ignores` to the options - this is needed in exceptional cases (for example, if the resolved `files` array is used in another config) and ruins `filesDefault` logic!

The interface MUST carry a JSDoc comment, which will become the Config's public documentation.
It should only include:

- Short config description;
- Default Config `files` (must match the `filesDefault` passed to the main `addConfig` call).

#### Step 4.2: Config manifest

The second argument of `defineUnConfig` describes everything the generator needs.
The one most important required property is `enabledBy`, defining the optional conditions under which this Config is enabled by default, or declaring the enablement unconditionally using a boolean literal.
All of its properties are optional except `enabledBy`.
Every package named in `enabledBy` must be listed in `PACKAGES_TO_GET_INFO_FOR` in `src/constants.ts`, otherwise it will not type check.

#### Step 4.3: Rules

Initially, there will likely be a single config builder instance with a single ESLint config, which should include all the plugin *non-deprecated* rules.

If different rules should be applied to different file types, you likely need to create sub-config(s) generating the respective configs.

After every `addRule` statement, we annotate the rule with:

- `@since` custom JSDoc tag.
  It signifies the first version of the plugin in which this rule first appeared.
  You can find this out by inspecting the results of `nr rules-finder <full plugin package name>` script output.
- Emojis like `🟢`, `🟡`, etc.
  They signify if the rule is included in one of the main rule pre-sets, usually named "recommended", "strict", "stylistic", etc.
  You can find more information on presets in the plugin docs and/or by directly inspecting the plugin object, specifically `configs` property.
  There should be no spaces between consecutive emojis.
  Most often used emojis:
  - 🟢 - in `recommended`
  - 🟡 - in `recommended` (warns)
  - 🎨 - in `stylistic`
  - 💭 - requires type information
  - 💭? - optionally requires type information
  - 🔴 - NOT in `recommended`

  This is not strict and may vary from plugin to plugin.
  See the examples at `src/configs/package-json.ts`, `src/configs/jsdoc.ts`, `src/configs/e18e.ts`, etc, if needed.
  IMPORTANT: `🟢`/`🟡` and `🔴` are **mutually exclusive** — pick one system based on which is the minority.
  Every emoji used in annotations must appear in the legend section.

#### Step 4.4: Stylistic rules

Identify stylistic-only rules and add them to `ALL_STYLISTIC_RULES.<plugin-prefix>` in `src/configs/extra/no-stylistic-rules.ts`.
If there are none, put a `// None` comment between the braces of the empty rules object.
The rule of thumb: after fixing the issue reported by the rule, the logic of the program should not change in any way.
IMPORTANT semi-exception: rules dictating naming patterns should not be considered stylistic, as sometimes identifiers and other names may affect runtime.
See the already added rules for example.

#### Step 4.5: Rules not working in embedded code blocks

Decide what rules don't make sense in Markdown/MDX embedded code blocks.
Add them to `RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS` in `src/configs/shared.ts`.
Rules requiring type information are definite candidates for this because type information is not available there.

### Step 5: Documentation

Document the addition of a new Config and plugin in `README.md`.
Do NOT add a config logo if it doesn't exists.

Document plugin metadata in `PACKAGES_META` in `scripts/shared/packages-meta.ts`.
Don't blindly copy URL patterns from other entries - you need to actually figure them out.
If the Config is served by more than one plugin, mark exactly one of them with `isMainPlugin: true`.

Update `Default renames` section if the chosen plugin prefix differs from what the plugin docs suggests.

### Step 6: Testing

Run `nr prep` first: it validates the manifest and will name the exact problem if there is one.

Then ensure there are no TypeScript/ESLint/prettier/knip/... errors.
Run `nr check`, or run the individual commands separately if one of them prevents the chain from completing: `nr ts6`, `nr eslint <changed files>`, `nr format`, `nr knip`, `nr check:spelling`.
IMPORTANT: ignore errors in files you haven't modified!

Write tests for the new Config following [`eslint-config-un-config-tests`](../eslint-config-un-config-tests/SKILL.md) instructions.
Ensure the coverage of the new Config satisfies the numbers outlined in the aforementioned skill.
IMPORTANT: code without `enableConfigTesterForPlugin` options should be skipped for coverage using `v8 ignore` comments; see `src/configs/svelte.ts` and `src/configs/react.ts` for examples.

Adding a Config changes the resolved cascade order, so `test/config-gen/cascade-order.spec.ts` will fail.
Confirm the new entries appear where you expect, then update the snapshot with `nr t run test/config-gen/cascade-order.spec.ts -u`.

### Step 7: Changelog

Create a new changelog entry in `.changeset` directory.
It should be named following `human-id` naming convention: <https://raw.githubusercontent.com/RienNeVaPlus/human-id/3cd6519a9b0acf35ce8d9ce0d0e7231708381598/index.ts>
Add this to the start of the file:

```md
---
'eslint-config-un': minor
---
```

Then use the following template for the description (put a blank line after the frontmatter and IGNORE ALL THE COMMENTS in the following snippet for the actual description):

```md
Added a new config `<configName>` which uses [`<pluginName>`](<plugin npmx.dev link>),

<!-- Use one of the options below (without actually creating any line breaks! don't forget emojis!): -->

✅ enabled by default
❓ enabled if `<package-name-1>` or `<package-name-2>` package is installed
❓ enabled if `defaultConfigsStatus` is set to `misc-enabled`
❓ enabled if <custom condition>
❌ disabled by default
<enabled/disabled> by default
```