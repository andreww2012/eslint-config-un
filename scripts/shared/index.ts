import {arrayPartition, compareSemver, jsonParse, mapGetOrInsertComputed} from 'utilery';
import type {EslintPlugin} from '../../src/eslint/eslint-types';
import {castTsEslintTypedPlugin} from '../../src/loaders/plugins';
import {interopDefault} from '../../src/utils';

export const generateAngularPluginsWithOldRules = async () => {
  const [
    angularEslintPlugin,
    angularTemplateEslintPlugin,
    angularTemplateEslintPlugin15,
    angularTemplateEslintPlugin17,
    angularEslintPlugin18,
  ] = await Promise.all([
    interopDefault(import('@angular-eslint/eslint-plugin')),
    interopDefault(import('@angular-eslint/eslint-plugin-template')),
    interopDefault(import('angular-eslint-plugin-template15')),
    // `angular-eslint-plugin-template17` bundles `@typescript-eslint/utils` which extends
    // `LegacyESLint` from `eslint/use-at-your-own-risk`, which ESLint 10 removed
    interopDefault(import('angular-eslint-plugin-template17')).catch(() => null),
    interopDefault(import('angular-eslint-plugin18')),
  ]);

  const plugin = castTsEslintTypedPlugin({
    ...angularEslintPlugin,
    rules: {
      ...angularEslintPlugin18.rules,
      ...angularEslintPlugin.rules,
    },
  });

  const pluginTemplate = castTsEslintTypedPlugin({
    ...angularTemplateEslintPlugin,
    rules: {
      ...angularTemplateEslintPlugin15.rules,
      ...angularTemplateEslintPlugin17?.rules,
      ...angularTemplateEslintPlugin.rules,
    },
  });

  return {
    plugin,
    pluginTemplate,
  };
};

export const generateEslintPluginsRulesPresence = (
  loadedPlugins: readonly (({plugin: EslintPlugin} | {error: string}) & {
    version: string;
  })[],
) => {
  const ruleVersions = new Map<string, {version: string; deprecated?: boolean}[]>();
  const [failedPlugins, plugins] = arrayPartition(
    loadedPlugins,
    (pluginInfo) => 'error' in pluginInfo,
  );

  plugins.forEach(({plugin, version}) => {
    if (plugin.rules && typeof plugin.rules === 'object') {
      Object.entries(plugin.rules).forEach(([ruleName, rule]) => {
        const isDeprecated =
          // eslint-disable-next-line ts/no-unnecessary-condition -- Third-party plugins can have missing rule definitions at runtime
          rule &&
          typeof rule === 'object' &&
          'meta' in rule &&
          rule.meta &&
          typeof rule.meta === 'object' &&
          'deprecated' in rule.meta &&
          Boolean(rule.meta.deprecated);
        mapGetOrInsertComputed(ruleVersions, ruleName, () => []).push({
          version,
          ...(isDeprecated && {deprecated: true}),
        });
      });
    }
  });

  return {
    rules: Array.from(ruleVersions, ([ruleName, versions]) => {
      versions.sort((a, b) => compareSemver(a.version, b.version));
      return {
        ruleName,
        minVersion: versions[0]?.version,
        maxVersion: versions.at(-1)?.version,
        totalVersions: versions.length,
        versions: versions.map(({version}) => version),
        deprecatedVersions: versions
          .filter(({deprecated}) => deprecated)
          .map(({version}) => version),
      };
    }),
    errors: failedPlugins.map((pluginInfo) => ({
      ...pluginInfo,
      error: jsonParse(pluginInfo.error),
    })),
  };
};
