import {GLOB_JS_TS_X_EXTENSION} from '../../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from '../index';
import {generateDefaultTestFiles} from '../shared';

export interface TestsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig(
      [
        'tests',
        {
          includeDefaultFilesAndIgnores: true,
          filesDefault: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
            includeCypressTests: true,
            includeStorybookStories: true,
            includeVitestBenchmarkFiles: true,
          }),
        },
      ],
      {},
    )
    // ⚠️ DO NOT FORGET to sync the rules list with the jsdoc description of `tests` config
    .disableAnyRule('', 'no-empty-function')
    .disableAnyRule('e18e', 'no-delete-property')
    .disableAnyRule('e18e', 'prefer-static-collator')
    .disableAnyRule('e18e', 'prefer-static-regex')
    .disableAnyRule('sonarjs', 'no-hardcoded-ip')
    .disableAnyRule('sonarjs', 'no-hardcoded-passwords')
    .disableAnyRule('sonarjs', 'no-hardcoded-secrets')
    .disableAnyRule('sonarjs', 'no-clear-text-protocols')
    .disableAnyRule('ts', 'no-extraneous-class')
    .disableAnyRule('ts', 'no-empty-function')
    // Triggered on inline snapshots
    .disableAnyRule('unicorn', 'template-indent')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'tests'>;
