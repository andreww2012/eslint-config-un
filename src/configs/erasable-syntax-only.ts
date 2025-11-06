import {ERROR, GLOB_TSX, OFF} from '../constants';
import type {PrettifyShallow} from '../types';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

type CheckedSyntax = 'enums' | 'importAliases' | 'namespaces' | 'parameterProperties';

export interface ErasableSyntaxOnlyEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnConfigOptions<ExtraPlugins, 'erasable-syntax-only'> {
  /**
   * By default, all syntaxes are disallowed. You can enable specific syntaxes by setting
   * their keys to `true` in this object.
   * - `enums`: allow using TypeScript's enums.
   * - `importAliases`: allow using TypeScript's import aliases.
   * - `namespaces`: allow using TypeScript's namespaces.
   * - `parameterProperties`: allow using TypeScript's class parameter properties.
   */
  allowedSyntax?: PrettifyShallow<Partial<Record<CheckedSyntax, boolean>>>;
}

export default defineUnConfig('erasableSyntaxOnly', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies ErasableSyntaxOnlyEslintConfigOptions,
  );

  const {allowedSyntax = {}} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'erasable-syntax-only');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'erasable-syntax-only',
      {includeDefaultFilesAndIgnores: true, filesFallback: [GLOB_TSX]},
    ])
    .addRule('enums', allowedSyntax.enums ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('import-aliases', allowedSyntax.importAliases ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('namespaces', allowedSyntax.namespaces ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
    .addRule(
      'parameter-properties',
      allowedSyntax.parameterProperties ? OFF : ERROR,
    ) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('erasable-syntax-only')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
