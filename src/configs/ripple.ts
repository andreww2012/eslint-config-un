import {ERROR, GLOB_JS_TS, GLOB_RIPPLE, GLOB_TSRX, WARNING} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface RippleEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'ripple'> {
  /**
   * Set ups `.tsrx` and `.ripple` files parser.
   *
   * 📁 Default `files`:
   * - <code>**&#47;*.tsrx</code>
   * - <code>**&#47;*.ripple</code>
   */
  configSetup?: UnFlatConfigEntryFilesAndIgnores;
}

const DEFAULT_RIPPLE_FILES: string[] = [GLOB_TSRX, GLOB_RIPPLE];

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {configSetup: configSetupOptions = {}} = optionsResolved;

  const configBuilderSetup = context.createConfigBuilder(configSetupOptions, null);
  configBuilderSetup?.addConfig([
    'ripple/setup',
    {
      filesDefault: DEFAULT_RIPPLE_FILES,
      parser: '@tsrx/eslint-parser',
    },
  ]);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ripple');

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig(['ripple', {filesDefault: [...DEFAULT_RIPPLE_FILES, GLOB_JS_TS]}])
    .addRule('control-flow-jsx', ERROR) /** @since 0.3.25 */
    .addRule('no-lazy-destructuring-in-modules', ERROR) /** @since 0.3.25 */
    .addRule('no-module-scope-track', ERROR) /** @since 0.3.25 */
    .addRule('prefer-oninput', WARNING) /** @since 0.3.25 */
    // TODO note: only applied to .tsrx files in the recommended config, should we do the same?: https://github.com/Ripple-TS/ripple/blob/35ac70052d79efae41bb1df2440fee3f052ca115/packages/eslint-plugin/src/index.ts#L57
    .addRule('require-statement-container-body', ERROR) /** @since 0.3.76 */
    .addRule('valid-for-of-key', ERROR) /** @since 0.3.25 */
    .enableConfigTesterForPlugin('ripple')
    .addOverrides();

  return {
    configs: [configBuilderSetup, configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'ripple'>;
