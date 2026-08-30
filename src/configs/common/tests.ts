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
 * - `sonarjs/no-hardcoded-ip`
 * - `sonarjs/no-hardcoded-passwords`
 * - `sonarjs/no-hardcoded-secrets`
 * - `sonarjs/no-clear-text-protocols`
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
});
