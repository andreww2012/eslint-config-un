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
      includeDefaultFilesAndIgnores: true,
      filesDefault: DEFAULT_RIPPLE_FILES,
      parser: '@tsrx/eslint-parser',
    },
  ]);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ripple');

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig([
      'ripple',
      {includeDefaultFilesAndIgnores: true, filesDefault: [...DEFAULT_RIPPLE_FILES, GLOB_JS_TS]},
    ])
    .addRule('control-flow-jsx', ERROR) /** @since 0.3.25 */
    .addRule('no-lazy-destructuring-in-modules', ERROR) /** @since 0.3.25 */
    .addRule('no-module-scope-track', ERROR) /** @since 0.3.25 */
    .addRule('prefer-oninput', WARNING) /** @since 0.3.25 */
    .addRule('valid-for-of-key', ERROR) /** @since 0.3.25 */
    .addOverrides();

  return {
    configs: [configBuilderSetup, configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'ripple'>;
