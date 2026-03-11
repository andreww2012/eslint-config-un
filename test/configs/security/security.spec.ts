import {GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML} from '../../../src/constants';

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
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
    });

    it('creates `security` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('security');

      expect(configResult.getConfigByUnPostfix('security')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `security` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
    });

    it('creates `security` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('security', {reset: true});

      expect(configResult.getConfigByUnPostfix('security')).toBeDefined();
    });

    it('does not create `security` eslint config and prints a warning if explicitly disabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig({security: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`security\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `security` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('security')).toBeDefined();
    });

    it('creates `security` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig(
        {security: true},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('security')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`security\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  it('has no explicit `files` restriction in `security` eslint config by default (applies to all files)', () => {
    expect(configResult.getConfigByUnPostfix('security')?.files).toBeUndefined();
  });

  it('has default `ignores` in `security` eslint config (does not ignore HTML files)', () => {
    const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
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

    expect(error?.message).toMatchInlineSnapshot(`"eval with argument of type Identifier"`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `security` eslint config', async () => {
      const FILES = ['src/**/*.js'];
      const configResult = await computeEslintConfig({
        security: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('security')?.files).toStrictEqual(FILES);
    });

    it('disables `security` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        security: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('security')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `security` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        security: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('security')?.ignores;

      expect(ignores).to.include.members(IGNORES);
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

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('security'), (ruleName) =>
          ruleName.startsWith('security/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `security` eslint config', async () => {
      const configResult = await computeEslintConfig({
        security: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('security'), (ruleName) =>
          ruleName.startsWith('security/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});
