import {objectFromEntriesUnsafe} from '@andreww2012/unutils';
import type {UnConfigs} from '../../src/configs';
import {type LoadablePluginPrefix, pluginsLoaders} from '../../src/loaders';
import {readPluginMetadata} from './plugin-metadata';

const versionAsIs = (version: string) => version;

type GitTagResult = string | {url: string};

interface PackageMeta {
  configs: (keyof UnConfigs)[];
  ruleDocsUrl: ((ruleName: string) => string) | null;
  gitTag?: string | ((version: string) => GitTagResult);

  /**
   * Only meaningful for a plugin serving a Config several plugins serve: says which of them the
   * generated `🧩 Main plugin` line of that Config names
   */
  isMainPlugin?: true;

  pluginDocsUrl?: string | {label: string; url: string};

  /**
   * Why the package stays a direct dependency although every Config it serves is disabled by
   * default
   */
  directDependencyReason?: string;
}

interface PluginPackageMeta extends PackageMeta {
  pluginPrefix: LoadablePluginPrefix;
}

export const PLUGIN_PACKAGES_META: Record<string, PluginPackageMeta> = Object.fromEntries(
  (await readPluginMetadata()).flatMap(({metadata, prefix}) => {
    if (prefix === '') {
      return [];
    }
    const pluginPrefix = prefix as LoadablePluginPrefix;
    const {packageName} = pluginsLoaders[pluginPrefix];
    return [
      [
        packageName,
        {
          configs: metadata.configs || [],
          pluginPrefix,
          ruleDocsUrl: metadata.ruleDocsUrl || null,
          ...(metadata.gitTag != null && {gitTag: metadata.gitTag}),
          ...(metadata.isMainPlugin && {isMainPlugin: metadata.isMainPlugin}),
          ...(metadata.docsUrl != null && {pluginDocsUrl: metadata.docsUrl}),
          ...(metadata.directDependencyReason != null && {
            directDependencyReason: metadata.directDependencyReason,
          }),
        } satisfies PluginPackageMeta,
      ],
    ];
  }),
);

export const PACKAGES_META: Record<string, PackageMeta> = {
  ...PLUGIN_PACKAGES_META,
  '@angular-eslint/template-parser': {
    configs: ['angular'],
    ruleDocsUrl: null,
  },
  '@eslint/css-tree': {
    configs: ['css'],
    gitTag: (version) => `css-tree-v${version}`,
    ruleDocsUrl: null,
  },
  // Additional packages that are not eslint plugins but are tracked as dependencies
  '@html-eslint/parser': {
    configs: ['html'],
    ruleDocsUrl: null,
  },
  '@humanwhocodes/scsstree': {
    configs: ['css'],
    gitTag: (version) => `scsstree-v${version}`,
    ruleDocsUrl: null,
  },
  '@jest/environment': {
    configs: ['jest'],
    ruleDocsUrl: null,
  },
  '@jest/expect': {
    configs: ['jest'],
    ruleDocsUrl: null,
  },
  '@sveltejs/kit': {
    configs: ['svelte'],
    gitTag: (version) => `@sveltejs/kit@${version}`,
    ruleDocsUrl: null,
  },
  '@tsrx/eslint-parser': {
    configs: ['tsrx'],
    gitTag: (version) => `@tsrx/eslint-parser@${version}`,
    ruleDocsUrl: null,
  },
  '@typescript-eslint/eslint-plugin': {
    configs: ['ts'],
    ruleDocsUrl: null,
  },
  '@typescript-eslint/parser': {
    configs: ['ts'],
    ruleDocsUrl: null,
  },
  'astro-eslint-parser': {
    configs: ['astro'],
    ruleDocsUrl: null,
  },
  browserslist: {
    configs: ['compat'],
    gitTag: versionAsIs,
    ruleDocsUrl: null,
  },
  'ember-eslint-parser': {
    configs: ['ember'],
    ruleDocsUrl: null,
  },
  'eslint-import-resolver-typescript': {
    configs: ['import'],
    ruleDocsUrl: null,
  },
  'eslint-mdx': {
    configs: ['mdx'],
    gitTag: (tag) => `eslint-mdx@${tag}`,
    ruleDocsUrl: null,
  },
  'eslint-no-restricted': {
    configs: [],
    gitTag: versionAsIs,
    ruleDocsUrl: null,
  },
  'svelte-eslint-parser': {
    configs: ['svelte'],
    ruleDocsUrl: null,
  },
  'tailwind-csstree': {
    configs: ['css'],
    gitTag: (version) => `tailwind-csstree-v${version}`,
    ruleDocsUrl: null,
  },
  'vue-eslint-parser': {
    configs: ['vue'],
    ruleDocsUrl: null,
  },
};

export const CONFIGS_META = objectFromEntriesUnsafe(
  Array.from(
    Map.groupBy(
      Object.entries(PACKAGES_META).flatMap(([packageName, packageMeta]) =>
        packageMeta.configs.map((config) => ({config, packageName})),
      ),
      (v) => v.config,
    ),
    ([config, entries]) => [config, {packages: entries.map((v) => v.packageName)}],
  ),
);
