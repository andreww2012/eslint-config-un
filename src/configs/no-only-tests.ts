import {ERROR, GLOB_JS_TS_X_EXTENSION} from '../constants';
import {generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin to prevent focused (`.only`) tests.
 * Also included in testing framework's configs as a sub-config.
 *
 * 📁 Default `files`:
 * - <code>**&#47;*{[._-]spec,.test}.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47;_\_test?(s)__/*\*&#47;\*.?([cm])[jt]s?(x)</code>
 */
export interface NoOnlyTestsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-only-tests'> {}

export default defineUnConfig<NoOnlyTestsEslintConfigOptions>(
  'noOnlyTests',
  false,
)((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'no-only-tests');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'no-only-tests',
      {
        filesDefault: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION),
      },
    ])
    .addRule('no-only-tests', ERROR) /** @since 1.0.0 */
    .enableConfigTesterForPlugin('no-only-tests')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
