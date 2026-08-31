import {ERROR, GLOB_JS_TS, GLOB_RIPPLE, GLOB_TSRX} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Ripple](https://github.com/Ripple-TS/ripple) specific rules.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*.tsrx</code>
 * - <code>**&#47;*.ripple</code>
 * - <code>**&#47;*.?([cm])[jt]s</code>
 */
export interface RippleEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'ripple'> {}

const DEFAULT_RIPPLE_FILES: string[] = [GLOB_TSRX, GLOB_RIPPLE];

export default defineUnConfig<RippleEslintConfigOptions>('ripple', {
  enabledBy: {package: 'ripple'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  // The rules also run on plain `.js`/`.ts`, which this parser cannot read
  context.requestParsing('ripple', {kind: 'setUpOnly'});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ripple');

  // Legend:
  // 🔴 - NOT in recommended

  configBuilder
    ?.addConfig([
      'ripple',
      {
        filesDefault: [...DEFAULT_RIPPLE_FILES, GLOB_JS_TS],
        parsingIgnoresInheritedFrom: ['ripple'],
      },
    ])
    .addRule('control-flow-jsx', ERROR) /** @since 0.3.25 */
    .addRule('no-lazy-destructuring-in-modules', ERROR) /** @since 0.3.25 */
    // TODO note: only applied to .tsrx files in the recommended config, should we do the same?: https://github.com/Ripple-TS/ripple/blob/35ac70052d79efae41bb1df2440fee3f052ca115/packages/eslint-plugin/src/index.ts#L57
    .addRule('require-statement-container-body', ERROR) /** @since 0.3.76 */
    .addRule('valid-for-of-key', ERROR) /** @since 0.3.25 */
    .enableConfigTesterForPlugin('ripple')
    .addOverrides();
});
