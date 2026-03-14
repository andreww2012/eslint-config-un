import {CHECKED_LODASH_METHODS} from '../../../src/constants';

beforeEach(() => {
  addInstalledPackages({lodash: '4.17.21'});
});

const FIXTURES = {
  lodashMapUsage: 'lodash-map-usage.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('youDontNeedLodashUnderscore');

  it('loads `you-dont-need-lodash-underscore` plugin', () => {
    expect(configResult.getLoadedPlugin('you-dont-need-lodash-underscore')).toBeDefined();
  });

  it('creates `you-dont-need-lodash-underscore` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `you-dont-need-lodash-underscore` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeUndefined();
    });

    it('creates `you-dont-need-lodash-underscore` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({youDontNeedLodashUnderscore: true});

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `you-dont-need-lodash-underscore` eslint config by default (lodash is installed)', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();
    });

    it('creates `you-dont-need-lodash-underscore` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const configResult = await computeEslintConfig(
        {youDontNeedLodashUnderscore: true},
        {reset: true},
      );

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`youDontNeedLodashUnderscore\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `you-dont-need-lodash-underscore` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig(
        {youDontNeedLodashUnderscore: false},
        {reset: true},
      );

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `you-dont-need-lodash-underscore` eslint config (lodash is installed)', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();
    });
  });

  describe('package detection', () => {
    const LODASH_PACKAGES = [
      'lodash',
      'lodash-es',
      ...CHECKED_LODASH_METHODS.map((method) => `lodash.${method}`),
    ];

    it('does not create `you-dont-need-lodash-underscore` eslint config when no lodash package is installed', async () => {
      setInstalledPackages({});

      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeUndefined();
    });

    it.each(LODASH_PACKAGES)(
      'creates `you-dont-need-lodash-underscore` eslint config when `%s` is installed',
      async (pkg) => {
        setInstalledPackages({[pkg]: '4.17.21'});

        const configResult = await computeEslintConfig({}, {reset: true});

        expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeDefined();
      },
    );
  });

  it('has no explicit `files` restriction in `you-dont-need-lodash-underscore` eslint config by default', () => {
    expect(
      configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')?.files,
    ).toBeUndefined();
  });

  it('has default `ignores` in `you-dont-need-lodash-underscore` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('youDontNeedLodashUnderscore');

  it('enables `you-dont-need-lodash-underscore/map` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'you-dont-need-lodash-underscore',
        'you-dont-need-lodash-underscore/map',
      ),
    ).toBe(2);
  });

  it('disables `you-dont-need-lodash-underscore/capitalize` rule by default (default ignored method)', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'you-dont-need-lodash-underscore',
        'you-dont-need-lodash-underscore/capitalize',
      ),
    ).toBe(0);
  });

  it('`you-dont-need-lodash-underscore/map` rule fires on a file using lodash map', async () => {
    const results = await testEslintConfig(
      'youDontNeedLodashUnderscore',
      FIXTURES.lodashMapUsage,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.lodashMapUsage,
      'you-dont-need-lodash-underscore/map',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Import { map } from 'lodash' detected. Consider using the native Array.prototype.map()"`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `you-dont-need-lodash-underscore` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {files: FILES},
      });

      expect(
        configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')?.files,
      ).toStrictEqual(FILES);
    });

    it('disables `you-dont-need-lodash-underscore` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `you-dont-need-lodash-underscore` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `you-dont-need-lodash-underscore` eslint config', async () => {
    const configResult = await computeEslintConfig({
      youDontNeedLodashUnderscore: {
        overrides: {'you-dont-need-lodash-underscore/map': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'you-dont-need-lodash-underscore',
        'you-dont-need-lodash-underscore/map',
      ),
    ).toBe(0);

    expect(configResult.getRuleEntrySeverity('you-dont-need-lodash-underscore', 'no-console')).toBe(
      0,
    );
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `you-dont-need-lodash-underscore` eslint config', async () => {
      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore'),
          (ruleName) => ruleName.startsWith('you-dont-need-lodash-underscore/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `you-dont-need-lodash-underscore` eslint config', async () => {
      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore'),
          (ruleName) => ruleName.startsWith('you-dont-need-lodash-underscore/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `ignoredMethods`', () => {
    const DEFAULT_IGNORED_METHODS = [
      ['capitalize', 'capitalize'],
      ['cloneDeep', 'clone-deep'],
      ['get', 'get'],
      ['omit', 'omit'],
      ['throttle', 'throttle'],
    ] as const;

    it('disables all default-ignored methods by default and does not disable others', async () => {
      const configResult = await computeEslintConfig('youDontNeedLodashUnderscore');

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('you-dont-need-lodash-underscore'),
          (ruleName) =>
            DEFAULT_IGNORED_METHODS.some(
              ([, suffix]) => ruleName === `you-dont-need-lodash-underscore/${suffix}`,
            ),
        ),
      ).toStrictEqual([0]);

      expect(
        configResult.getRuleEntrySeverity(
          'you-dont-need-lodash-underscore',
          'you-dont-need-lodash-underscore/map',
        ),
      ).not.toBe(0);
    });

    it('disables `map` rule when added to `ignoredMethods`', async () => {
      const configResult = await computeEslintConfig({
        youDontNeedLodashUnderscore: {ignoredMethods: {map: true}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'you-dont-need-lodash-underscore',
          'you-dont-need-lodash-underscore/map',
        ),
      ).toBe(0);
    });

    it.each(DEFAULT_IGNORED_METHODS)(
      'enables `%s` rule when removed from `ignoredMethods`',
      async (optionKey, ruleSuffix) => {
        const configResult = await computeEslintConfig({
          youDontNeedLodashUnderscore: {ignoredMethods: {[optionKey]: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'you-dont-need-lodash-underscore',
            `you-dont-need-lodash-underscore/${ruleSuffix}`,
          ),
        ).toBe(2);
      },
    );
  });
});
