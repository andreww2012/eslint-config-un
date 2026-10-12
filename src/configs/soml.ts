import {ERROR, GLOB_SOML, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [SOML](https://github.com/soml-lang/soml) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.soml</code>
 */
export interface SomlEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'soml'> {}

export default defineUnConfig<SomlEslintConfigOptions>('soml', {
  enabledBy: {package: 'soml-lang'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'soml');

  // Legend:
  // 🔴 - NOT in recommended & unopinionated
  // 🟣 - NOT in unopinionated

  configBuilder
    ?.addConfig([
      'soml',
      {
        filesDefault: [GLOB_SOML],
        parseWith: 'soml',
      },
    ])
    .addRule('format', ERROR) /** @since 0.0.1 */ // 🟣
    // Key names are dictated by the programs reading the file
    .addRule('key-name-casing', OFF) /** @since 0.0.1 */ // 🔴
    .addRule('no-block-string-edge-blank-lines', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('no-block-string-trailing-whitespace', ERROR) /** @since 0.0.1 */
    .addRule('no-confusable-keys', ERROR) /** @since 0.0.2 */
    .addRule('no-decimal-file-modes', ERROR) /** @since 0.0.2 */
    .addRule('no-doubled-backslashes-in-literal-strings', ERROR) /** @since 0.0.2 */ // 🟣
    // Command arguments often repeat strings on purpose, like `['-e', 'a', '-e', 'b']`
    .addRule('no-duplicate-array-items', OFF) /** @since 0.0.2 */ // 🔴
    .addRule('no-empty-keys', ERROR) /** @since 0.0.1 */
    .addRule('no-escapes-in-paths', ERROR) /** @since 0.0.2 */
    .addRule('no-float-trailing-zeros', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('no-invisible-characters', ERROR) /** @since 0.0.1 */
    .addRule('no-loss-of-precision', ERROR) /** @since 0.0.1 */
    .addRule('no-misplaced-block-string-delimiters', ERROR) /** @since 0.0.2 */
    .addRule('no-mixed-number-types', ERROR) /** @since 0.0.1 */ // 🟣
    .addRule('no-negative-zero', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('no-placeholder-values', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('no-quoted-keywords', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('no-sizes-as-durations', ERROR) /** @since 0.0.2 */
    .addRule('no-unnormalized-keys', ERROR) /** @since 0.0.1 */
    .addRule('no-zero-duration-parts', ERROR) /** @since 0.0.2 */ // 🟣
    .addRule('numeric-separators-style', ERROR) /** @since 0.0.1 */ // 🟣
    .addRule('prefer-bare-keys', ERROR) /** @since 0.0.1 */ // 🟣
    .addRule('prefer-literal-strings', ERROR) /** @since 0.0.1 */ // 🟣
    // A local offset tells the reader which time zone the value was written for
    .addRule('prefer-utc-instants', OFF) /** @since 0.0.1 */ // 🔴
    .addRule('sort-keys', OFF) /** @since 0.0.1 */ // 🔴
    .addRule('spaced-comment', ERROR) /** @since 0.0.1 */ // 🟣
    .enableConfigTesterForPlugin('soml')
    .addOverrides();
});
