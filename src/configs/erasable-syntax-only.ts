import {ERROR, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

type CheckedSyntax = 'enums' | 'importAliases' | 'namespaces' | 'parameterProperties';

export interface ErasableSyntaxOnlyEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'erasable-syntax-only'> {
  /**
   * By default, all syntaxes are disallowed. You can enable specific syntaxes by setting
   * their keys to `true` in this object.
   * - `enums`: allow using TypeScript's enums.
   * - `importAliases`: allow using TypeScript's import aliases.
   * - `namespaces`: allow using TypeScript's namespaces.
   * - `parameterProperties`: allow using TypeScript's class parameter properties.
   */
  allowedSyntax?: Partial<Record<CheckedSyntax, boolean>>;
}

export default ((context, optionsRaw) => {
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
      {includeDefaultFilesAndIgnores: true, filesDefault: [GLOB_TS_X]},
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
}) satisfies UnConfigFn<'erasableSyntaxOnly'>;
