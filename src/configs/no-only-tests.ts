import {ERROR, GLOB_JS_TS_X_EXTENSION} from '../constants';
import {generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface NoOnlyTestsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'no-only-tests'> {}

export default ((context, optionsRaw) => {
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
}) satisfies UnConfigFn<'noOnlyTests'>;
