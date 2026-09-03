import {detect as detectPackageManager} from 'package-manager-detector/detect';
import {GLOB_YAML, GLOB_YML, GLOB_YML_YAML} from '../../../src/constants';

vi.mock(import('package-manager-detector/detect'));

const FIXTURES = {
  emptyMappingYaml: 'empty-mapping.yaml',
  emptyMappingYml: 'empty-mapping.yml',
} as const;

describe('basic tests', () => {
  it('creates `yaml` eslint config and loads `yaml` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('yaml');

    const config = configResult.getConfigByUnPostfix('yaml');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.y?(a)ml"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).toIncludeAllMembers(['**/yarn.lock', '**/pnpm-lock.yaml']);
    expect(ignores).not.toIncludeAnyMembers([GLOB_YML_YAML, GLOB_YML, GLOB_YAML]);

    expect(configResult.getLoadedPlugin('yaml')).toBeDefined();
  });

  it('does not create `yaml` eslint config and does not load `yaml` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({yaml: false});

    expect(configResult.getConfigByUnPostfix('yaml')).toBeUndefined();
    expect(configResult.getLoadedPlugin('yaml')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `yaml` eslint config', async () => {
      await expectConfigState({}, 'yaml', false);
    });

    it('creates `yaml` eslint config if explicitly enabled', async () => {
      await expectConfigState('yaml', 'yaml', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `yaml` eslint config', async () => {
      await expectConfigState({}, 'yaml', false, 'default');
    });

    it('creates `yaml` eslint config if explicitly enabled', async () => {
      await expectConfigState('yaml', 'yaml', true, 'default');
    });

    it('does not create `yaml` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({yaml: false}, 'yaml', ['yaml', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `yaml` eslint config', async () => {
      await expectConfigState({}, 'yaml', true, 'misc-enabled');
    });

    it('creates `yaml` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({yaml: true}, 'yaml', ['yaml', true], 'misc-enabled');
    });

    it('does not create `yaml` eslint config if explicitly disabled', async () => {
      await expectConfigState({yaml: false}, 'yaml', false, 'misc-enabled');
    });
  });
});

describe('`yaml/pnpm-workspace.yaml` eslint config', () => {
  it('creates `yaml/pnpm-workspace.yaml` eslint config when pnpm is used', async () => {
    // eslint-disable-next-line ts/no-unused-vars
    using _ = vi.mocked(detectPackageManager).mockResolvedValue({name: 'pnpm', agent: 'pnpm'});

    const configResult = await computeEslintConfig('yaml');

    expect(configResult.getConfigByUnPostfix('yaml/pnpm-workspace.yaml')).toBeDefined();
  });

  it('disables `yaml/file-extension` rule in `yaml/pnpm-workspace.yaml` eslint config', async () => {
    // eslint-disable-next-line ts/no-unused-vars
    using _ = vi.mocked(detectPackageManager).mockResolvedValue({name: 'pnpm', agent: 'pnpm'});

    const configResult = await computeEslintConfig('yaml');

    expect(
      configResult.getRuleEntrySeverity('yaml/pnpm-workspace.yaml', 'yaml/file-extension'),
    ).toBe(0);
  });

  it('does not create `yaml/pnpm-workspace.yaml` eslint config when detected package manager is not pnpm', async () => {
    // eslint-disable-next-line ts/no-unused-vars
    using _ = vi.mocked(detectPackageManager).mockResolvedValue(null);

    const configResult = await computeEslintConfig('yaml');

    expect(configResult.getConfigByUnPostfix('yaml/pnpm-workspace.yaml')).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('yaml');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('yaml')).toMatchObject({
      'yaml/block-mapping': 2,
      'yaml/sort-keys': 0,
    });
  });

  it('`yaml/no-empty-mapping-value` rule fires on a .yaml file with an empty mapping value', async () => {
    const results = await testEslintConfig('yaml', FIXTURES.emptyMappingYaml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.emptyMappingYaml,
      'yaml/no-empty-mapping-value',
    );

    expect(error?.message).toMatchInlineSnapshot('"Empty mapping values are forbidden."');
  });

  it('`yaml/no-empty-mapping-value` rule fires on a .yml file with an empty mapping value', async () => {
    const results = await testEslintConfig('yaml', FIXTURES.emptyMappingYml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.emptyMappingYml,
      'yaml/no-empty-mapping-value',
    );

    expect(error?.message).toMatchInlineSnapshot('"Empty mapping values are forbidden."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `yaml` eslint config and merges them with defaults', async () => {
      const FILES = ['.github/**/*.yml'];

      const configResult = await computeEslintConfig({yaml: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('yaml')?.files).toStrictEqual(FILES);
    });

    it('disables `yaml` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({yaml: {files: []}});

      expect(configResult.getConfigByUnPostfix('yaml')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `yaml` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({yaml: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('yaml')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `yaml` eslint config', async () => {
    const configResult = await computeEslintConfig({
      yaml: {overrides: {'yaml/block-mapping': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('yaml', 'yaml/block-mapping')).toBe(0);
    expect(configResult.getRuleEntrySeverity('yaml', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set yaml settings by default', async () => {
      const configResult = await computeEslintConfig('yaml');
      const config = configResult.getConfigByUnPostfix('yaml');

      expect(config?.settings?.['yml']).toBeUndefined();
    });

    it('sets yaml settings when `settings` is provided', async () => {
      const SETTINGS = {indent: 4};

      const configResult = await computeEslintConfig('yaml', {
        un: {plugins: {yaml: {settings: SETTINGS}}},
      });
      const config = configResult.getConfigByUnPostfix('yaml');

      expect(config?.settings?.['yml']).toStrictEqual(SETTINGS);
    });
  });

  describe('option: `enforceExtension`', () => {
    it('enforces `.yml` extension by default', async () => {
      const configResult = await computeEslintConfig('yaml');

      expect(configResult.getRuleEntry('yaml', 'yaml/file-extension')).toMatchInlineSnapshot(
        '[2, {"extension": "yml"}]',
      );
    });

    it('enforces `.yml` extension when set to `"yml"`', async () => {
      const configResult = await computeEslintConfig({yaml: {enforceExtension: 'yml'}});

      expect(configResult.getRuleEntry('yaml', 'yaml/file-extension')).toMatchInlineSnapshot(
        '[2, {"extension": "yml"}]',
      );
    });

    it('enforces `.yaml` extension when set to `"yaml"`', async () => {
      const configResult = await computeEslintConfig({yaml: {enforceExtension: 'yaml'}});

      expect(configResult.getRuleEntry('yaml', 'yaml/file-extension')).toMatchInlineSnapshot(
        '[2, {"extension": "yaml"}]',
      );
    });

    it('disables the `yaml/file-extension` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({yaml: {enforceExtension: false}});

      expect(configResult.getRuleEntrySeverity('yaml', 'yaml/file-extension')).toBe(0);
    });
  });

  describe('option: `quotes`', () => {
    it('enforces single quotes by default', async () => {
      const configResult = await computeEslintConfig('yaml');

      expect(configResult.getRuleEntry('yaml', 'yaml/quotes')).toMatchInlineSnapshot(
        '[2, {"prefer": "single"}]',
      );
    });

    it('enforces single quotes when set to `"single"`', async () => {
      const configResult = await computeEslintConfig({yaml: {quotes: 'single'}});

      expect(configResult.getRuleEntry('yaml', 'yaml/quotes')).toMatchInlineSnapshot(
        '[2, {"prefer": "single"}]',
      );
    });

    it('enforces double quotes when set to `"double"`', async () => {
      const configResult = await computeEslintConfig({yaml: {quotes: 'double'}});

      expect(configResult.getRuleEntry('yaml', 'yaml/quotes')).toMatchInlineSnapshot(
        '[2, {"prefer": "double"}]',
      );
    });

    it('disables the `yaml/quotes` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({yaml: {quotes: false}});

      expect(configResult.getRuleEntrySeverity('yaml', 'yaml/quotes')).toBe(0);
    });
  });

  describe('option: `casing`', () => {
    it('disables `yaml/key-name-casing` rule by default', async () => {
      const configResult = await computeEslintConfig('yaml');

      expect(configResult.getRuleEntrySeverity('yaml', 'yaml/key-name-casing')).toBe(0);
    });

    it('enables `yaml/key-name-casing` rule when set to an empty object', async () => {
      const configResult = await computeEslintConfig({yaml: {casing: {}}});

      expect(configResult.getRuleEntry('yaml', 'yaml/key-name-casing')).toMatchInlineSnapshot(
        '[2, {"ignores": ["<<"]}]',
      );
    });

    it('merges user-provided `ignores` with `<<` in `yaml/key-name-casing` rule options', async () => {
      const configResult = await computeEslintConfig({
        yaml: {casing: {ignores: ['my-key']}},
      });

      expect(configResult.getRuleEntry('yaml', 'yaml/key-name-casing')).toMatchInlineSnapshot(
        '[2, {"ignores": ["<<", "my-key"]}]',
      );
    });
  });

  describe('option: `parserOptions`', () => {
    it('does not set `languageOptions.parserOptions` by default', async () => {
      const configResult = await computeEslintConfig('yaml');

      expect(
        configResult.getConfigByUnPostfix('yaml')?.languageOptions?.['parserOptions'],
      ).toBeUndefined();
    });

    it('sets `languageOptions.parserOptions` when provided', async () => {
      const PARSER_OPTIONS = {defaultYAMLVersion: '1.1' as const};

      const configResult = await computeEslintConfig({yaml: {parserOptions: PARSER_OPTIONS}});

      expect(
        configResult.getConfigByUnPostfix('yaml')?.languageOptions?.['parserOptions'],
      ).toStrictEqual(PARSER_OPTIONS);
    });
  });

  describe('option: `doNotMergeIgnoresWithDefault`', () => {
    it('merges user-provided `ignores` with defaults by default', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({yaml: {ignores: IGNORES}});

      expect(configResult.getConfigByUnPostfix('yaml')?.ignores).toIncludeAllMembers([
        '**/yarn.lock',
        '**/pnpm-lock.yaml',
        ...IGNORES,
      ]);
    });

    it('replaces default `ignores` with user-provided `ignores` when set to `true`', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        yaml: {ignores: IGNORES, doNotMergeIgnoresWithDefault: true},
      });

      const ignores = configResult.getConfigByUnPostfix('yaml')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores).not.toIncludeAnyMembers(['**/yarn.lock', '**/pnpm-lock.yaml']);
    });
  });
});
