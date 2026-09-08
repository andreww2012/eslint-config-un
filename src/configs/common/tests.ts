import {RULES_TO_DISABLE_IN_TEST_FILES} from '../../plugins.gen';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';
import {TESTS_CONFIG_DEFAULT_FILES} from '../shared';

/**
 * Disables mostly performance rules for most of the well known test file patterns.
 *
 * It is put after every Config enabling the rules it disables, but before `extraConfigs`, so that
 * the user still has the final say.
 *
 * 📁 Default `files`:
 * - <code>**&#47*[.-_]spec.?([cm])[jt]s?(x)</code>
 * - <code>**&#47*.test.?([cm])[jt]s?(x)</code>
 * - <code>\*\*&#47__test?(s)__&#47**&#47*.?([cm])[jt]s?(x)</code>
 * - <code>**&#47*.{bench,benchmark}.?([cm])[jt]s?(x)</code>
 * - <code>**&#47*.cy.?([cm])[jt]s?(x)</code>
 * - <code>**&#47*.{stories,story}.?([cm])[jt]s?(x)</code>
 *
 * Disabled rules:
 * - `no-empty-function`
 * - `e18e/no-delete-property`
 * - `e18e/prefer-static-collator`
 * - `e18e/prefer-static-regex`
 * - `sonar/no-hardcoded-ip`
 * - `sonar/no-hardcoded-passwords`
 * - `sonar/no-hardcoded-secrets`
 * - `sonar/no-clear-text-protocols`
 * - `ts/no-extraneous-class`
 * - `ts/no-empty-function`
 * - `unicorn/template-indent`
 */
export interface TestsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {}

export default defineUnConfig<TestsEslintConfigOptions>('tests', {phase: 'extra'})((
  context,
  optionsRaw,
) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, null);

  configBuilder
    ?.addConfig(
      [
        'tests',
        {
          filesDefault: TESTS_CONFIG_DEFAULT_FILES,
        },
      ],
      {},
    )
    .disableBulkRules([...RULES_TO_DISABLE_IN_TEST_FILES])
    .addOverrides();
});
