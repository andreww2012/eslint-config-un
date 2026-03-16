import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  fileNamingConvention: 'filename-naming-convention/MyBadFile.js',
  folderNamingConvention: 'folder-naming-convention/MyBadFolder/index.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('checkFile');

  it('does not load `check-file` plugin by default', () => {
    expect(configResult.getLoadedPlugin('check-file')).toBeUndefined();
  });

  it('loads `check-file` plugin if used', async () => {
    const configResultWithRules = await computeEslintConfig({
      checkFile: {fileNamingConventions: {'**/*': 'KEBAB_CASE'}},
    });

    expect(configResultWithRules.getLoadedPlugin('check-file')).toBeDefined();
  });

  it('creates `check-file` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('check-file')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `check-file` eslint config', async () => {
      await expectConfigState({}, 'check-file', false);
    });

    it('creates `check-file` eslint config if explicitly enabled', async () => {
      await expectConfigState('checkFile', 'check-file', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `check-file` eslint config', async () => {
      await expectConfigState({}, 'check-file', false, 'default');
    });

    it('creates `check-file` eslint config if explicitly enabled', async () => {
      await expectConfigState('checkFile', 'check-file', true, 'default');
    });

    it('does not create `check-file` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({checkFile: false}, 'check-file', ['checkFile', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `check-file` eslint config (not in misc group)', async () => {
      await expectConfigState({}, 'check-file', false, 'misc-enabled');
    });

    it('creates `check-file` eslint config if explicitly enabled', async () => {
      await expectConfigState({checkFile: true}, 'check-file', true, 'misc-enabled');
    });

    it('does not create `check-file` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {checkFile: false},
        'check-file',
        ['checkFile', false],
        'misc-enabled',
      );
    });
  });

  it('has no explicit `files` restriction in `check-file` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('check-file')?.files).toBeUndefined();
  });

  it('has default `ignores` in `check-file` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('check-file')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('checkFile');

  it('disables `filename-blocklist` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('check-file', 'check-file/filename-blocklist')).toBe(
      0,
    );
  });

  it('disables `no-index` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('check-file', 'check-file/no-index')).toBe(0);
  });

  it('`filename-naming-convention` rule fires on a file that violates naming convention', async () => {
    const results = await testEslintConfig(
      {checkFile: {fileNamingConventions: {'**/*': 'KEBAB_CASE'}}},
      FIXTURES.fileNamingConvention,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.fileNamingConvention,
      'check-file/filename-naming-convention',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"The filename "MyBadFile.js" does not match the "KEBAB_CASE" pattern"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `check-file` eslint config', async () => {
      const FILES = ['src/**/*.{js,ts}'];
      const configResult = await computeEslintConfig({
        checkFile: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('check-file')?.files).toStrictEqual(FILES);
    });

    it('disables `check-file` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('check-file')).toBeUndefined();
    });

    it('does not disable `check-file/processor` sub-config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {files: [], configEnableCheckFileProcessor: {}},
      });

      expect(configResult.getConfigByUnPostfix('check-file')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('check-file/processor')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `check-file` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        checkFile: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('check-file')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `check-file` eslint config', async () => {
    const configResult = await computeEslintConfig({
      checkFile: {overrides: {'check-file/no-index': 2}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('check-file', 'check-file/no-index')).toBe(2);
    expect(configResult.getRuleEntrySeverity('check-file', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `check-file` eslint config', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('check-file'), (ruleName) =>
          ruleName.startsWith('check-file/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `check-file` eslint config', async () => {
      const configResult = await computeEslintConfig({
        checkFile: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('check-file'), (ruleName) =>
          ruleName.startsWith('check-file/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `fileNamingConventions`', () => {
    it('disables `filename-naming-convention` rule when `fileNamingConventions` is not set (default)', async () => {
      const configResult = await computeEslintConfig('checkFile');

      expect(
        configResult.getRuleEntrySeverity('check-file', 'check-file/filename-naming-convention'),
      ).toBe(0);
    });

    it('enables `filename-naming-convention` rule when `fileNamingConventions` is provided as object', async () => {
      const CONVENTIONS = {'**/*': 'KEBAB_CASE'};

      const configResult = await computeEslintConfig({
        checkFile: {fileNamingConventions: CONVENTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('check-file', 'check-file/filename-naming-convention'),
      ).toStrictEqual([CONVENTIONS]);
    });

    it('enables `filename-naming-convention` rule when `fileNamingConventions` is provided as array', async () => {
      const CONVENTIONS = [
        {'**/*': 'KEBAB_CASE' as const},
        {ignoreMiddleExtensions: true},
      ] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({
        checkFile: {fileNamingConventions: CONVENTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('check-file', 'check-file/filename-naming-convention'),
      ).toStrictEqual(CONVENTIONS);
    });
  });

  describe('option: `folderNamingConventions`', () => {
    it('disables `folder-naming-convention` rule when `folderNamingConventions` is not set (default)', async () => {
      const configResult = await computeEslintConfig('checkFile');

      expect(
        configResult.getRuleEntrySeverity('check-file', 'check-file/folder-naming-convention'),
      ).toBe(0);
    });

    it('enables `folder-naming-convention` rule when `folderNamingConventions` is provided as object', async () => {
      const CONVENTIONS = {'**/*': 'KEBAB_CASE'};

      const configResult = await computeEslintConfig({
        checkFile: {folderNamingConventions: CONVENTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('check-file', 'check-file/folder-naming-convention'),
      ).toStrictEqual([CONVENTIONS]);
    });

    it('enables `folder-naming-convention` rule when `folderNamingConventions` is provided as array', async () => {
      const CONVENTIONS = [
        {'**/*': 'KEBAB_CASE' as const},
        {errorMessage: 'use kebab-case folders'},
      ] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({
        checkFile: {folderNamingConventions: CONVENTIONS},
      });

      expect(
        configResult.getRuleEntryOptions('check-file', 'check-file/folder-naming-convention'),
      ).toStrictEqual(CONVENTIONS);
    });
  });
});
