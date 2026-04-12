import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  evalWithExpression: 'eval-with-expression.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('security');

  it('loads `security` plugin if used', () => {
    expect(configResult.getLoadedPlugin('security')).toBeDefined();
  });

  it('creates `security` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('security')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `security` eslint config', async () => {
      await expectConfigState({}, 'security', false);
    });

    it('creates `security` eslint config if explicitly enabled', async () => {
      await expectConfigState('security', 'security', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `security` eslint config', async () => {
      await expectConfigState({}, 'security', false, 'default');
    });

    it('creates `security` eslint config if explicitly enabled', async () => {
      await expectConfigState('security', 'security', true, 'default');
    });

    it('does not create `security` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({security: false}, 'security', ['security', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `security` eslint config', async () => {
      await expectConfigState({}, 'security', true, 'misc-enabled');
    });

    it('creates `security` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({security: true}, 'security', ['security', true], 'misc-enabled');
    });

    it('does not create `security` eslint config if explicitly disabled', async () => {
      await expectConfigState({security: false}, 'security', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `security` eslint config by default (applies to all files)', () => {
    expect(configResult.getConfigByUnPostfix('security')?.files).toBeUndefined();
  });

  it('has default `ignores` in `security` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('security');

  it('enables `security/detect-bidi-characters` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('security', 'security/detect-bidi-characters')).toBe(
      2,
    );
  });

  it('disables `security/detect-non-literal-fs-filename` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('security', 'security/detect-non-literal-fs-filename'),
    ).toBe(0);
  });

  it('`security/detect-eval-with-expression` rule fires on a file using eval with a variable', async () => {
    const results = await testEslintConfig(
      'security',
      FIXTURES.evalWithExpression,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.evalWithExpression,
      'security/detect-eval-with-expression',
    );

    expect(error?.message).toMatchInlineSnapshot('"eval with argument of type Identifier"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `security` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({security: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('security')?.files).toStrictEqual(FILES);
    });

    it('disables `security` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({security: {files: []}});

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `security` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({security: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `security` eslint config', async () => {
    const configResult = await computeEslintConfig({
      security: {
        overrides: {'security/detect-child-process': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('security', 'security/detect-child-process')).toBe(0);
    expect(configResult.getRuleEntrySeverity('security', 'no-console')).toBe(0);
  });
});
