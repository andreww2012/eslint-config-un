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
