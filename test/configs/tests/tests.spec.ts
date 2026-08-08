/** Every rule the config turns off in test files. */
const DISABLED_RULES = [
  'no-empty-function',
  'e18e/no-delete-property',
  'e18e/prefer-static-collator',
  'e18e/prefer-static-regex',
  'sonarjs/no-hardcoded-ip',
  'sonarjs/no-hardcoded-passwords',
  'sonarjs/no-hardcoded-secrets',
  'sonarjs/no-clear-text-protocols',
  'ts/no-extraneous-class',
  'ts/no-empty-function',
  'unicorn/template-indent',
  'disable-autofix/unicorn/template-indent',
] as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('tests');

  it('creates `tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tests')).toBeDefined();
  });

  it('does not create `tests` eslint config if set to `false`', async () => {
    const configResult = await computeEslintConfig({tests: false});

    expect(configResult.getConfigByUnPostfix('tests')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tests` eslint config', async () => {
      await expectConfigState({}, 'tests', false);
    });

    it('creates `tests` eslint config if explicitly enabled', async () => {
      await expectConfigState('tests', 'tests', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `tests` eslint config', async () => {
      await expectConfigState({}, 'tests', true, 'default');
    });

    it('creates `tests` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('tests', 'tests', ['tests', true], 'default');
    });

    it('does not create `tests` eslint config if explicitly disabled', async () => {
      await expectConfigState({tests: false}, 'tests', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `tests` eslint config', async () => {
      await expectConfigState({}, 'tests', true, 'misc-enabled');
    });

    it('creates `tests` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('tests', 'tests', ['tests', true], 'misc-enabled');
    });

    it('does not create `tests` eslint config if explicitly disabled', async () => {
      await expectConfigState({tests: false}, 'tests', false, 'misc-enabled');
    });
  });

  it('has default `files` in `tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tests')?.files).toMatchInlineSnapshot(
      '["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.{bench,benchmark}.?([cm])[jt]s?(x)", "**/*.cy.?([cm])[jt]s?(x)", "**/*.{stories,story}.?([cm])[jt]s?(x)"]',
    );
  });

  it('has default `ignores` in `tests` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tests')?.ignores?.length).toBeGreaterThan(0);
  });

  it('is placed before the `js` eslint config so that it can be overridden', async () => {
    const configResult = await computeEslintConfig({}, {reset: true});

    const configNames = configResult.getConfigsByUnPostfix(() => true).map(({name}) => name);

    expect(configNames.indexOf('tests')).toBeLessThan(configNames.indexOf('js'));
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('tests');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('tests')).toMatchObject({
      'sonarjs/no-hardcoded-ip': 0,
      'sonarjs/no-hardcoded-passwords': 0,
    });
  });

  it('disables every rule that is noisy in test files', () => {
    expect(configResult.getRuleSeverities('tests')).toStrictEqual(
      Object.fromEntries(DISABLED_RULES.map((rule) => [rule, 0])),
    );
  });

  it('keeps the disabled rules enabled outside of test files', async () => {
    const configResult = await computeEslintConfig({}, {reset: true});

    expect(configResult.getRuleEntrySeverity('js', 'no-empty-function')).toBe(2);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tests` eslint config', async () => {
      const FILES = ['spec/**/*.ts'];

      const configResult = await computeEslintConfig({tests: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tests')?.files).toStrictEqual(FILES);
    });

    it('disables `tests` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tests: {files: []}});

      expect(configResult.getConfigByUnPostfix('tests')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tests` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tests: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tests')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overridesAny` in `tests` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tests: {overridesAny: {'no-empty-function': 2, 'no-console': 0}},
    });

    expect(configResult.getRuleSeverities('tests')).toMatchObject({
      'no-empty-function': 2,
      'no-console': 0,
    });
  });
});
