import {ERROR, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type CheckedSyntax = 'enums' | 'importAliases' | 'namespaces' | 'parameterProperties';

/**
 * ESLint plugin to granularly enforce TypeScript's
 * [`erasableSyntaxOnly`](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8-rc/#the---erasablesyntaxonly-option)
 * flag.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])ts?(x)</code>
 */
export interface ErasableSyntaxOnlyEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'erasable-syntax-only'> {
  /**
   * By default, all syntaxes are disallowed.
   * You can enable specific syntaxes by setting their keys to `true` in this object.
   * - `enums`: allow using TypeScript's enums.
   * - `importAliases`: allow using TypeScript's import aliases.
   * - `namespaces`: allow using TypeScript's namespaces.
   * - `parameterProperties`: allow using TypeScript's class parameter properties.
   */
  allowedSyntax?: Partial<Record<CheckedSyntax, boolean>>;
}

export default defineUnConfig<ErasableSyntaxOnlyEslintConfigOptions>(
  'erasableSyntaxOnly',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {allowedSyntax = {}} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'erasable-syntax-only');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['erasable-syntax-only', {filesDefault: [GLOB_TS_X]}])
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
