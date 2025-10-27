import {compare} from 'semver';
import type {EslintPlugin} from '../../src/eslint';
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
    interopDefault(import('angular-eslint-plugin-template17')),
    interopDefault(import('angular-eslint-plugin18')),
  ]);

  const plugin: EslintPlugin = {
    ...angularEslintPlugin,
    // @ts-expect-error types mismatch
    rules: {
      ...angularEslintPlugin18.rules,
      ...angularEslintPlugin.rules,
    },
  };

  const pluginTemplate = {
    ...angularTemplateEslintPlugin,
    rules: {
      ...angularTemplateEslintPlugin15.rules,
      ...angularTemplateEslintPlugin17.rules,
      ...angularTemplateEslintPlugin.rules,
    },
  } as unknown as EslintPlugin;

  return {
    plugin,
    pluginTemplate,
  };
};

export const generateEslintPluginsRulesPresence = (
  loadedPlugins: (({plugin: EslintPlugin} | {error: string}) & {
    version: string;
  })[],
) => {
  const ruleVersions = new Map<string, {version: string; deprecated?: boolean}[]>();

  loadedPlugins.forEach((pluginInfo) => {
    if ('error' in pluginInfo) {
      return;
    }

    const {plugin, version} = pluginInfo;
    if (!plugin.rules || typeof plugin.rules !== 'object') {
      return;
    }

    Object.entries(plugin.rules).forEach(([ruleName, rule]) => {
      const isDeprecated =
        // eslint-disable-next-line ts/no-unnecessary-condition
        rule &&
        typeof rule === 'object' &&
        'meta' in rule &&
        rule.meta &&
        typeof rule.meta === 'object' &&
        'deprecated' in rule.meta &&
        Boolean(rule.meta.deprecated);
      ruleVersions.set(ruleName, [
        ...(ruleVersions.get(ruleName) || []),
        {
          version,
          ...(isDeprecated && {deprecated: true}),
        },
      ]);
    });
  });

  return {
    rules: [...ruleVersions].map(([ruleName, versions]) => {
      const versionsSorted = versions.toSorted((a, b) => compare(a.version, b.version));
      return {
        ruleName,
        minVersion: versionsSorted[0]?.version,
        maxVersion: versionsSorted.at(-1)?.version,
        totalVersions: versions.length,
        versions: versionsSorted.map(({version}) => version),
        deprecatedVersions: versionsSorted
          .filter(({deprecated}) => deprecated)
          .map(({version}) => version),
      };
    }),
    errors: loadedPlugins
      .filter((pluginInfo) => 'error' in pluginInfo)
      .map((pluginInfo) => ({...pluginInfo, error: JSON.parse(pluginInfo.error) as unknown})),
  };
};
