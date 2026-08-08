import {GLOB_ASTRO, GLOB_MARKDOWN} from '../../../src/constants';

const FIXTURES = {
  divWithSetHtml: 'div-with-set-html.astro',
} as const;

beforeEach(() => {
  addInstalledPackages({astro: '5.0.0'});
});

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
      await expectConfigState({}, ['astro/setup', 'astro'], false);
    });

    it('creates `astro/setup` and `astro` eslint configs if explicitly enabled', async () => {
      await expectConfigState('astro', ['astro/setup', 'astro'], true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `astro/setup` and `astro` eslint configs by default (astro is installed)', async () => {
      await expectConfigState({}, ['astro/setup', 'astro'], true, 'default');
    });

    it('creates `astro/setup` and `astro` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState('astro', ['astro/setup', 'astro'], ['astro', true], 'default');
    });

    describe('`astro` package is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `astro/setup` and `astro` eslint configs', async () => {
        await expectConfigState({}, ['astro/setup', 'astro'], false, 'default');
      });

      it('creates `astro/setup` and `astro` eslint configs if explicitly enabled', async () => {
        await expectConfigState('astro', ['astro/setup', 'astro'], true, 'default');
      });

      it('does not create `astro/setup` and `astro` eslint configs and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {astro: false},
          ['astro/setup', 'astro'],
          ['astro', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `astro/setup` and `astro` eslint configs when `astro` package is not installed', async () => {
      setInstalledPackages({});

      await expectConfigState({}, ['astro/setup', 'astro'], false, 'misc-enabled');
    });

    it('creates `astro/setup` and `astro` eslint configs (astro is installed)', async () => {
      await expectConfigState({}, ['astro/setup', 'astro'], true, 'misc-enabled');
    });

    it('creates `astro/setup` and `astro` eslint configs and prints a warning if explicitly enabled', async () => {
      await expectConfigState('astro', ['astro/setup', 'astro'], ['astro', true], 'misc-enabled');
    });

    it('does not create `astro/setup` and `astro` eslint configs if explicitly disabled', async () => {
      await expectConfigState({astro: false}, ['astro/setup', 'astro'], false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('astro');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('astro')).toMatchObject({
      'astro/missing-client-only-directive-value': 2,
      'astro/no-unused-css-selector': 1,
      'astro/no-set-text-directive': 0,
    });
  });

  it('`astro/no-set-html-directive` rule fires on a file using `set:html`', async () => {
    const results = await testEslintConfig('astro', FIXTURES.divWithSetHtml, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.divWithSetHtml,
      'astro/no-set-html-directive',
    );

    expect(error?.message).toMatchInlineSnapshot('"`set:html` can lead to XSS attack."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses implicit default `files` in `astro` eslint config', async () => {
      const configResult = await computeEslintConfig('astro');

      expect(configResult.getConfigByUnPostfix('astro')?.files).toMatchInlineSnapshot(
        '["**/*.astro"]',
      );
    });

    it('uses user-provided `files` in `astro` eslint config', async () => {
      const FILES = ['src/**/*.astro'];

      const configResult = await computeEslintConfig({astro: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('astro')?.files).toStrictEqual(FILES);
    });

    it('disables `astro`, but not `astro/setup` eslint config when set to empty array', async () => {
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
      expect(ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN, GLOB_ASTRO]);
    });

    it('uses user-provided `ignores` in `astro` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({astro: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('astro')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('`astro` and `ts` configs relationship', () => {
  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if not explicitly specified', async () => {
    const configResult = await computeEslintConfig({astro: true, ts: true});

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toIncludeAllMembers(
      [GLOB_ASTRO],
    );
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toIncludeAllMembers([
      GLOB_ASTRO,
    ]);
  });

  it('`files` flow to `ts/{non-type-aware,type-aware}/setup` eslint configs if explicitly specified', async () => {
    const FILES = ['src/**/*.astro'];

    const configResult = await computeEslintConfig({astro: {files: FILES}, ts: true});

    expect(configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files).toIncludeAllMembers(
      FILES,
    );
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).toIncludeAllMembers(
      FILES,
    );
  });

  it('empty `files` do not flow to `ts/{non-type-aware,type-aware}/setup` eslint configs', async () => {
    const configResult = await computeEslintConfig({astro: {files: []}, ts: true});

    expect(
      configResult.getConfigByUnPostfix('ts/non-type-aware/setup')?.files,
    ).not.toIncludeAnyMembers([GLOB_ASTRO]);
    expect(configResult.getConfigByUnPostfix('ts/type-aware/setup')?.files).not.toIncludeAnyMembers(
      [GLOB_ASTRO],
    );
  });
});
