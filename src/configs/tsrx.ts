import {ERROR, GLOB_JS_TS, GLOB_RIPPLE, GLOB_TSRX} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [TSRX](https://tsrx.dev) specific rules.
 * TSRX is a target-neutral syntax, and [Ripple](https://github.com/Ripple-TS/ripple) is one of its targets.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*.tsrx</code>
 * - <code>**&#47;*.ripple</code>
 * - <code>**&#47;*.?([cm])[jt]s</code>
 */
export interface TsrxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'tsrx'> {}

const DEFAULT_TSRX_FILES: string[] = [GLOB_TSRX, GLOB_RIPPLE];

export default defineUnConfig<TsrxEslintConfigOptions>('tsrx', {
  enabledBy: {packages: ['@tsrx/core', 'ripple']},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  // The rules also run on plain `.js`/`.ts`, which this parser cannot read
  context.requestParsing('tsrx', {kind: 'setUpOnly'});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'tsrx');

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig([
      'tsrx',
      {
        filesDefault: [...DEFAULT_TSRX_FILES, GLOB_JS_TS],
        parsingIgnoresInheritedFrom: ['tsrx'],
      },
    ])
    .addRule('control-flow-jsx', ERROR) /** @since 0.3.25 */
    .addRule('no-lazy-destructuring-in-modules', ERROR) /** @since 0.3.25 */
    // TODO note: only applied to .tsrx files in the recommended config, should we do the same?: https://github.com/tsrx-org/tsrx/blob/52aa4cf20a66a03878da89ad2c761c554a9e8c70/packages/eslint-plugin/src/index.ts#L51-L53
    .addRule('require-statement-container-body', ERROR) /** @since 0.3.76 */
    .addRule('valid-for-of-key', ERROR) /** @since 0.3.25 */
    .enableConfigTesterForPlugin('tsrx')
    .addOverrides();
});
