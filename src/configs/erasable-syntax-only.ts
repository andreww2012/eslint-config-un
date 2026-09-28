import {ERROR, GLOB_TS_X, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type CheckedSyntax =
  | 'enums'
  | 'exportAliases'
  | 'importAliases'
  | 'namespaces'
  | 'parameterProperties';

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
   *
   * Affected rules:
   * - `enums`:
   *   [`erasable-syntax-only/enums`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/enums.md)
   * - `exportAliases`:
   *   [`erasable-syntax-only/export-aliases`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/export-aliases.md)
   * - `importAliases`:
   *   [`erasable-syntax-only/import-aliases`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/import-aliases.md)
   * - `namespaces`:
   *   [`erasable-syntax-only/namespaces`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/namespaces.md)
   * - `parameterProperties`:
   *   [`erasable-syntax-only/parameter-properties`](https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/parameter-properties.md)
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
    .addRule('export-aliases', allowedSyntax.exportAliases ? OFF : ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('import-aliases', allowedSyntax.importAliases ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('namespaces', allowedSyntax.namespaces ? OFF : ERROR) /** @since 0.1.0 */ // 🟢
    .addRule(
      'parameter-properties',
      allowedSyntax.parameterProperties ? OFF : ERROR,
    ) /** @since 0.1.0 */ // 🟢
    .enableConfigTesterForPlugin('erasable-syntax-only')
    .addOverrides();
});
