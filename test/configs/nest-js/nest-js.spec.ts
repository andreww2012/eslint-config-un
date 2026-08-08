/* eslint-disable case-police/string-check */

const FIXTURES = {
  duplicateDecorators: 'duplicate-decorators.ts',
} as const;

beforeEach(() => {
  addInstalledPackages({'@nestjs/core': '10.0.0'});
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('nestJs');

  it('loads `nestjs` plugin if used', () => {
    expect(configResult.getLoadedPlugin('nestjs')).toBeDefined();
  });

  it('creates `nest-js` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('nest-js')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `nest-js` eslint config', async () => {
      await expectConfigState({}, 'nest-js', false);
    });

    it('creates `nest-js` eslint config if explicitly enabled', async () => {
      await expectConfigState('nestJs', 'nest-js', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `nest-js` eslint config when `@nestjs/core` is installed', async () => {
      await expectConfigState({}, 'nest-js', true, 'default');
    });

    it('creates `nest-js` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('nestJs', 'nest-js', ['nestJs', true], 'default');
    });

    it('does not create `nest-js` eslint config if explicitly disabled', async () => {
      await expectConfigState({nestJs: false}, 'nest-js', false, 'default');
    });

    describe('`@nestjs/core` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `nest-js` eslint config', async () => {
        await expectConfigState({}, 'nest-js', false, 'default');
      });

      it('creates `nest-js` eslint config if explicitly enabled', async () => {
        await expectConfigState('nestJs', 'nest-js', true, 'default');
      });

      it('does not create `nest-js` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({nestJs: false}, 'nest-js', ['nestJs', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `nest-js` eslint config when `@nestjs/core` is installed', async () => {
      await expectConfigState({}, 'nest-js', true, 'misc-enabled');
    });

    it('creates `nest-js` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({nestJs: true}, 'nest-js', ['nestJs', true], 'misc-enabled');
    });

    it('does not create `nest-js` eslint config if explicitly disabled', async () => {
      await expectConfigState({nestJs: false}, 'nest-js', false, 'misc-enabled');
    });
  });

  it('has default `ignores` in `nest-js` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('nest-js')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('nestJs');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('nest-js')).toMatchObject({
      'nestjs/injectable-should-be-provided': 2,
      'nestjs/use-dependency-injection': 0,
    });
  });

  it('triggers `nestjs/no-duplicate-decorators` on a class with duplicate decorators', async () => {
    const result = await testEslintConfig(
      {nestJs: true, ts: {configTypeAware: false}},
      FIXTURES.duplicateDecorators,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.duplicateDecorators,
      'nestjs/no-duplicate-decorators',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"You have listed the same decorator more than once. Was this intentional?"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `nest-js` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({nestJs: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('nest-js')?.files).toStrictEqual(FILES);
    });

    it('disables `nest-js` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({nestJs: {files: []}});

      expect(configResult.getConfigByUnPostfix('nest-js')).toBeUndefined();
    });

    it('has default `files` in `nest-js` eslint config', async () => {
      const configResult = await computeEslintConfig('nestJs');

      expect(configResult.getConfigByUnPostfix('nest-js')?.files).toMatchInlineSnapshot(
        '["**/*.?([cm])ts"]',
      );
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `nest-js` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({nestJs: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('nest-js')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `nest-js` eslint config', async () => {
    const configResult = await computeEslintConfig({
      nestJs: {
        overrides: {'nestjs/injectable-should-be-provided': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('nest-js', 'nestjs/injectable-should-be-provided'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('nest-js', 'no-console')).toBe(0);
  });
});
