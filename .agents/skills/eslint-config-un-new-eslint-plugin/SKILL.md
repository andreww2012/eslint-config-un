---
name: eslint-config-un-new-eslint-plugin
description: Adding support for a new ESLint plugin for eslint-config-un
---

<!-- eslint-disable markdown-preferences/heading-casing -->

## Intro

`eslint-config-un` is an ESLint configuration generator, wrapping 100+ ESLint plugins.

For the terminology, refer to `README.md`.

CRITICAL: when you're uncertain when making a decision, it's always better to ask than make a questionable assumption.

## Guide

### Step 0: installation

When you are asked to support a new ESLint plugin, you need to first check if it is already installed.
If not, you need to decide whether it should be strongly associated with:

- A new Config like most of the existing plugins do.
  Example: `eslint-plugin-jsdoc` is associated with `jsdoc` Config;
- An existing Config, usually in the form of Sub-Config.
  Example: `@intlify/eslint-plugin-vue-i18n` is associated with `vue` Config as `vue-i18n` Sub-Config;
- Something else entirely (rare and should be discussed further).

The plugin likely needs to be added to `peerDependencies`, `peerDependenciesMeta` and `devDependencies` like most of the existing plugins.
The most important criterion of inclusion in regular `dependencies` is popularity: that plugin should be popular enough that it would create friction for most users if they had to install it themselves.
But all the popular plugins are already supported.

### Step 1: Adding plugin loader and choosing prefix

Add a plugin loader to `src/loaders/plugins.ts`, maintaining the alphabetical order.
The plugin prefix should be the one that the plugin developer recommends in the docs.

Make sure to read the plugin docs.
Common documentation locations are:

- Bundled `README.md`;
- Repo likely specified in `repository` field of the plugin's `package.json`;
- Website specified in `homepage` field.

ONLY IF the plugin type does not satisfy the expected plugin type (check TS errors in this file), add `satisfies Promise<EslintPlugin> as unknown as Promise<EslintPlugin>` after the `interopDefault(...)` expression, and add `// @ts-expect-error types mismatch` directive before the line on which the error occurs.

ONLY IF this type cast was not required, run `nr build:code:test` script.
This command verifies that our package still compiles with the new plugin.
If you get a *new* error like

```
RolldownError: src/loaders/plugins.ts(41,14): error TS4023: Exported variable 'pluginsLoaders' has or is using name 'PluginGitHubAction' from external module "<...>/eslint-config-un/node_modules/eslint-plugin-github-action/dist/index" but cannot be named.
```

add `as Promise<EslintPlugin>` to the same position.

### Step 1*: Adding other loaders

Sometimes the plugin requires parser/processor/etc. for its' rules to work.
If you installed new packages for that, make sure to add them to `src/loaders/{parsers,packages}.ts`, following the same algorithm.

### Step 2: Updating plugins rules' type

Update the generated plugin rules' types by running `nr typegen`.
The output of this command gives you the exact rules that this plugin provides.

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

- `settings`: plugin settings type.
  Should preferably be imported from the plugin itself, but most of the plugins don't export it, so it should be constructed manually from the docs/source code.
- `configXxx`: sub-configs.
  Should have the type of `boolean | UnFlatConfigEntryBase<ExtraPlugins, '<configName>'> & { /* optional custom options */}`.
- All the other custom options.

You may only *suggest* implementing some custom options at the end.

DO NOT assign `files` or `ignores` to the options - this is needed in exceptional cases (for example, if the resolved `files` array is used in another config) and ruins `filesDefault` logic!

#### Step 4.2: Rules

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

#### Step 4.3: Stylistic rules

Identify stylistic-only rules and add them to `ALL_STYLISTIC_RULES.<plugin-prefix>` in `src/configs/extra/no-stylistic-rules.ts`.
If there are none, put a `// None` comment between the braces of the empty rules object.
The rule of thumb: after fixing the issue reported by the rule, the logic of the program should not change in any way.
IMPORTANT semi-exception: rules dictating naming patterns should not be considered stylistic, as sometimes identifiers and other names may affect runtime.
See the already added rules for example.

#### Step 4.4: Rules not working in embedded code blocks

Decide what rules don't make sense in Markdown/MDX embedded code blocks.
Add them to `RULES_TO_DISABLE_IN_EMBEDDED_CODE_BLOCKS` in `src/configs/shared.ts`.
Rules requiring type information are definite candidates for this because type information is not available there.

### Step 5: Activating the Config

Define a new Config in `src/configs/index.ts`, maintaining the alphabetical order.
The JSdoc comment for the Config should include the following sections:

- Short config description;
- Default Config `files` (must match the `filesDefault` passed to `addConfig` in the config file);
- Main plugin(s) with *plugin* docs URL;
- Sub-config names without the `config` prefix;
- `@default` condition.
  Most optional peer dependency plugins are either disabled by default or enabled conditionally, usually based on the other packages' presence.
  The package names from the condition should be added to `PACKAGES_TO_GET_INFO_FOR` in `src/constants.ts`.

Then make sure the config is actually loaded by adding it to `src/config-un/config.ts`.

### Step 6: Documentation

Document the addition of a new Config and plugin in `README.md`.
Do NOT add a config logo if it doesn't exists.

Document plugin metadata in `PACKAGES_META` in `scripts/shared/packages-meta.ts`.
Don't blindly copy URL patterns from other entries - you need to actually figure them out.

Update `Default renames` section if the chosen plugin prefix differs from what the plugin docs suggests.

### Step 7: Testing

Ensure there are no TypeScript/ESLint/prettier/knip/... errors by running `nr test:quick`.
IMPORTANT: ignore errors in files you haven't modified!
If any errors are preventing for the chain of commands to complete, just run them separately.

Write tests for the new Config following [`eslint-config-un-config-tests`](../eslint-config-un-config-tests/SKILL.md) instructions.
Ensure the coverage of the new Config satisfies the numbers outlined in the aforementioned skill.
IMPORTANT: code without `enableConfigTesterForPlugin` options should be skipped for coverage using `v8 ignore` comments; see `src/configs/svelte.ts` and `src/configs/react.ts` for examples.

### Step 8: Changelog

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
<!-- eslint-disable-next-line markdown-links/no-missing-path -->
Added a new config `<configName>` which uses [`<pluginName>`](<plugin npmx.dev link>),

<!-- Use one of the options below (without actually creating any line breaks! don't forget emojis!): -->

✅ enabled by default
❓ enabled if `<package-name-1>` or `<package-name-2>` package is installed
❓ enabled if `defaultConfigsStatus` is set to `misc-enabled`
❓ enabled if <custom condition>
❌ disabled by default
<enabled/disabled> by default
```