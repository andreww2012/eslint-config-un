import {GLOB_ASTRO, GLOB_MARKDOWN} from '../../../src/constants';

beforeEach(() => {
  addInstalledPackages({astro: '5.0.0'});
});

const FIXTURES = {
  divWithSetHtml: 'div-with-set-html.astro',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('astro');

  it('loads `astro` plugin if used', () => {
    expect(configResult.getLoadedPlugin('astro')).toBeDefined();
  });

  it('creates `astro/setup` and `astro` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('astro/setup')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('astro')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `astro/setup` and `astro` eslint configs', async () => {
      const modeConfigResult = await computeEslintConfig({});

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeUndefined();
      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeUndefined();
    });

    it('creates `astro/setup` and `astro` eslint configs if explicitly enabled', async () => {
      const modeConfigResult = await computeEslintConfig('astro');

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeDefined();
      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `astro/setup` and `astro` eslint configs by default (astro is installed)', async () => {
      const modeConfigResult = await computeEslintConfig({}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeDefined();
      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeDefined();
    });

    it('does not create `astro/setup` and `astro` eslint configs when `astro` package is not installed', async () => {
      setInstalledPackages({});

      const modeConfigResult = await computeEslintConfig({}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeUndefined();

      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeUndefined();
    });

    it('creates `astro/setup` and `astro` eslint configs if explicitly enabled', async () => {
      const modeConfigResult = await computeEslintConfig('astro', {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeDefined();

      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeDefined();
    });

    it('does not create `astro/setup` and `astro` eslint configs and prints a warning if explicitly disabled when `astro` package is not installed', async () => {
      setInstalledPackages({});

      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const modeConfigResult = await computeEslintConfig({astro: false}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeUndefined();

      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeUndefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to disable \`astro\` config because this is the default`,
        ),
      ).toBe(true);
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `astro/setup` and `astro` eslint configs when `astro` package is not installed', async () => {
      setInstalledPackages({});

      const modeConfigResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(modeConfigResult.getConfigByUnPostfix('astro/setup')).toBeUndefined();
      expect(modeConfigResult.getConfigByUnPostfix('astro')).toBeUndefined();
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('astro');

  it('enables `astro/missing-client-only-directive-value` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('astro', 'astro/missing-client-only-directive-value'),
    ).toBe(2);
  });

  it('disables `astro/no-set-text-directive` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('astro', 'astro/no-set-text-directive')).toBe(0);
  });

  it('`astro/no-set-html-directive` rule fires on a file using `set:html`', async () => {
    const results = await testEslintConfig('astro', FIXTURES.divWithSetHtml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.divWithSetHtml,
      'astro/no-set-html-directive',
    );

    expect(error?.message).toMatchInlineSnapshot(`"\`set:html\` can lead to XSS attack."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses implicit default `files` in `astro` eslint config', async () => {
      const configResult = await computeEslintConfig('astro');

      expect(configResult.getConfigByUnPostfix('astro')?.files).toMatchInlineSnapshot(
        `["**/*.astro"]`,
      );
    });

    it('uses user-provided `files` in `astro` eslint config', async () => {
      const FILES = ['src/**/*.astro'];
      const configResult = await computeEslintConfig({astro: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('astro')?.files).toStrictEqual(FILES);
    });

    it('disables `astro`, but not `astro/setup` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({astro: {files: []}});

      expect(configResult.getConfigByUnPostfix('astro')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('astro/setup')).toBeDefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses implicit default `ignores` in `astro` eslint config', async () => {
      const configResult = await computeEslintConfig('astro');

      const ignores = configResult.getConfigByUnPostfix('astro')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.to.include.members([GLOB_MARKDOWN, GLOB_ASTRO]);
    });

    it('uses user-provided `ignores` in `astro` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({astro: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('astro')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `astro` eslint config', async () => {
    const configResult = await computeEslintConfig({
      astro: {
        overrides: {'astro/no-set-html-directive': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('astro', 'astro/no-set-html-directive')).toBe(0);
    expect(configResult.getRuleEntrySeverity('astro', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `astro` eslint config', async () => {
      const configResult = await computeEslintConfig({astro: {forceSeverity: 'error'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('astro'), (ruleName) =>
          ruleName.startsWith('astro/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `astro` eslint config', async () => {
      const configResult = await computeEslintConfig({astro: {forceSeverity: 'warn'}});

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('astro'), (ruleName) =>
          ruleName.startsWith('astro/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('`astro` and `ts` configs relationship', () => {
  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if not explicitly specified', async () => {
    const configResult = await computeEslintConfig({astro: true, ts: true});

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).to.include.members([
      GLOB_ASTRO,
    ]);
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).to.include.members([
      GLOB_ASTRO,
    ]);
  });

  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if explicitly specified', async () => {
    const FILES = ['src/**/*.astro'];
    const configResult = await computeEslintConfig({
      astro: {files: FILES},
      ts: true,
    });

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).to.include.members(
      FILES,
    );
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).to.include.members(
      FILES,
    );
  });

  it('empty `files` do not flow to `ts/{non-type-aware,type-aware}/setup` eslint configs', async () => {
    const configResult = await computeEslintConfig({
      astro: {files: []},
      ts: true,
    });

    expect(
      configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
    ).not.to.include.members([GLOB_ASTRO]);
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).not.to.include.members([
      GLOB_ASTRO,
    ]);
  });
});
