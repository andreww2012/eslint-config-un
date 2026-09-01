import type {EslintPlugin} from '../../src/eslint/eslint-types';

const SETTINGS_CONFIG_NAME = 'global-setup/import-integrity';

const REPLACED_RULE_NAMES = ['no-cycle', 'no-named-as-default', 'no-unresolved'];

type ConfigResult = Awaited<ReturnType<typeof computeEslintConfig>>;

// The replacing rules keep the names of the rules they replace, so the only way to tell the two
// implementations apart is the documentation link
const getReplacedRuleNames = (configResult: ConfigResult) =>
  REPLACED_RULE_NAMES.filter((ruleName) =>
    configResult
      .getLoadedPlugin('import')
      ?.rules?.[ruleName]?.meta?.docs?.url?.includes('import-integrity-lint'),
  );

const computeImportConfig = (
  useImportIntegrity: ((Parameters<
    typeof computeEslintConfig
  >[1] & {})['un'] & {})['useImportIntegrity'],
) => computeEslintConfig('import', {un: {useImportIntegrity}});

describe('option: `useImportIntegrity`', () => {
  it('does not create the settings config nor replace any rule by default', async () => {
    const configResult = await computeImportConfig(undefined);

    expect(configResult.getConfigByUnPostfix(SETTINGS_CONFIG_NAME)).toBeUndefined();
    expect(getReplacedRuleNames(configResult)).toStrictEqual([]);
  });

  it('replaces the affected rule implementations when enabled', async () => {
    const configResult = await computeImportConfig(true);

    expect(getReplacedRuleNames(configResult)).toStrictEqual(REPLACED_RULE_NAMES);
  });

  it('allows any options to be passed to a replacing rule without a schema of its own', async () => {
    const configResult = await computeImportConfig(true);

    expect(configResult.getLoadedPlugin('import')?.rules?.['no-cycle']?.meta?.schema).toStrictEqual(
      [{type: 'object'}],
    );
  });

  it('keeps the schema of a replacing rule that declares one', async () => {
    const SCHEMA = [{type: 'object', properties: {maxDepth: {type: 'number'}}}];
    const PLUGIN_WITH_SCHEMA = {
      rules: {'no-cycle': {meta: {type: 'problem', schema: SCHEMA}, create: () => ({})}},
    } satisfies EslintPlugin;

    const configResult = await computeEslintConfig('import', {
      un: {useImportIntegrity: true, plugins: {'import-integrity': {plugin: PLUGIN_WITH_SCHEMA}}},
    });

    expect(configResult.getLoadedPlugin('import')?.rules?.['no-cycle']?.meta?.schema).toStrictEqual(
      SCHEMA,
    );
  });

  it('keeps the original implementations when the plugin provides none of the rules', async () => {
    const EMPTY_PLUGIN = {rules: {}} satisfies EslintPlugin;

    const configResult = await computeEslintConfig('import', {
      un: {useImportIntegrity: true, plugins: {'import-integrity': {plugin: EMPTY_PLUGIN}}},
    });

    expect(getReplacedRuleNames(configResult)).toStrictEqual([]);
  });

  it('keeps the original implementation of a rule opted out in `replaceRules`', async () => {
    const configResult = await computeImportConfig({replaceRules: {'no-cycle': false}});

    expect(getReplacedRuleNames(configResult)).toStrictEqual([
      'no-named-as-default',
      'no-unresolved',
    ]);
  });

  it('creates a settings config pointing the plugin at the package root directory', async () => {
    const configResult = await computeImportConfig(true);

    expect(
      configResult.getConfigByUnPostfix(SETTINGS_CONFIG_NAME)?.settings?.['import-integrity'],
    ).toStrictEqual({packageRootDir: expect.any(String) as unknown});
  });

  it('merges `pluginSettings` into the settings config', async () => {
    const MONOREPO_ROOT_DIR = '/monorepo';

    const configResult = await computeImportConfig({
      pluginSettings: {monorepoRootDir: MONOREPO_ROOT_DIR},
    });

    expect(
      configResult.getConfigByUnPostfix(SETTINGS_CONFIG_NAME)?.settings?.['import-integrity'],
    ).toStrictEqual({
      packageRootDir: expect.any(String) as unknown,
      monorepoRootDir: MONOREPO_ROOT_DIR,
    });
  });

  it('still creates the settings config when the `import` config is disabled', async () => {
    const configResult = await computeEslintConfig({}, {un: {useImportIntegrity: true}});

    expect(configResult.getConfigByUnPostfix(SETTINGS_CONFIG_NAME)).toBeDefined();
    expect(configResult.getLoadedPlugin('import')).toBeUndefined();
  });
});
