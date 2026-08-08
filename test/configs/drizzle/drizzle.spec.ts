const FIXTURES = {
  deleteWithoutWhereClause: 'delete-without-where-clause.js',
  updateWithoutWhereClause: 'update-without-where-clause.js',
} as const;

beforeEach(() => {
  addInstalledPackages({'drizzle-orm': '0.38.0'});
});

describe('basic tests', () => {
  it('creates `drizzle` eslint config and loads `drizzle` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('drizzle');

    const config = configResult.getConfigByUnPostfix('drizzle');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores?.length).toBeGreaterThan(0);

    expect(configResult.getLoadedPlugin('drizzle')).toBeDefined();
  });

  it('does not create `drizzle` eslint config and does not load `drizzle` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({drizzle: false});

    expect(configResult.getConfigByUnPostfix('drizzle')).toBeUndefined();
    expect(configResult.getLoadedPlugin('drizzle')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `drizzle` eslint config', async () => {
      await expectConfigState({}, 'drizzle', false);
    });

    it('creates `drizzle` eslint config if explicitly enabled', async () => {
      await expectConfigState('drizzle', 'drizzle', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`drizzle-orm` is installed', () => {
      it('creates `drizzle` eslint config by default', async () => {
        await expectConfigState({}, 'drizzle', true, 'default');
      });

      it('creates `drizzle` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('drizzle', 'drizzle', ['drizzle', true], 'default');
      });

      it('does not create `drizzle` eslint config if explicitly disabled', async () => {
        await expectConfigState({drizzle: false}, 'drizzle', false, 'default');
      });
    });

    describe('`drizzle-orm` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `drizzle` eslint config', async () => {
        await expectConfigState({}, 'drizzle', false, 'default');
      });

      it('creates `drizzle` eslint config if explicitly enabled', async () => {
        await expectConfigState('drizzle', 'drizzle', true, 'default');
      });

      it('does not create `drizzle` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({drizzle: false}, 'drizzle', ['drizzle', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `drizzle` eslint config when `drizzle-orm` is installed', async () => {
      await expectConfigState({}, 'drizzle', true, 'misc-enabled');
    });

    it('creates `drizzle` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({drizzle: true}, 'drizzle', ['drizzle', true], 'misc-enabled');
    });

    it('does not create `drizzle` eslint config if explicitly disabled', async () => {
      await expectConfigState({drizzle: false}, 'drizzle', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('drizzle');

    expect(configResult.getRuleSeverities('drizzle')).toMatchObject({
      'drizzle/enforce-delete-with-where': 2,
      'drizzle/enforce-update-with-where': 2,
    });
  });

  it('`drizzle/enforce-delete-with-where` rule fires on a `delete` call without `.where()`', async () => {
    const results = await testEslintConfig(
      'drizzle',
      FIXTURES.deleteWithoutWhereClause,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.deleteWithoutWhereClause,
      'drizzle/enforce-delete-with-where',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Without \`.where(...)\` you will delete all the rows in a table. If you didn't want to do it, please use \`db.delete(...).where(...)\` instead. Otherwise you can ignore this rule here"`,
    );
  });

  it('`drizzle/enforce-update-with-where` rule fires on an `update` call without `.where()`', async () => {
    const results = await testEslintConfig(
      'drizzle',
      FIXTURES.updateWithoutWhereClause,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.updateWithoutWhereClause,
      'drizzle/enforce-update-with-where',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Without \`.where(...)\` you will update all the rows in a table. If you didn't want to do it, please use \`db.update(...).set(...).where(...)\` instead. Otherwise you can ignore this rule here"`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `drizzle` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({drizzle: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('drizzle')?.files).toStrictEqual(FILES);
    });

    it('disables `drizzle` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({drizzle: {files: []}});

      expect(configResult.getConfigByUnPostfix('drizzle')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `drizzle` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({drizzle: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('drizzle')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `drizzle` eslint config', async () => {
    const configResult = await computeEslintConfig({
      drizzle: {
        overrides: {'drizzle/enforce-delete-with-where': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('drizzle')).toMatchObject({
      'drizzle/enforce-delete-with-where': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  describe('option: `drizzleObjectName`', () => {
    it('does not set `drizzleObjectName` options by default', async () => {
      const configResult = await computeEslintConfig('drizzle');

      expect(
        configResult.getRuleEntryOptions('drizzle', 'drizzle/enforce-delete-with-where'),
      ).toStrictEqual([]);
    });

    it('passes the set string to both delete and update rules', async () => {
      const DRIZZLE_OBJECT_NAME = 'db';

      const configResult = await computeEslintConfig({
        drizzle: {drizzleObjectName: DRIZZLE_OBJECT_NAME},
      });

      expect(
        configResult.getRuleEntryOptions('drizzle', 'drizzle/enforce-delete-with-where'),
      ).toStrictEqual([{drizzleObjectName: DRIZZLE_OBJECT_NAME}]);

      expect(
        configResult.getRuleEntryOptions('drizzle', 'drizzle/enforce-update-with-where'),
      ).toStrictEqual([{drizzleObjectName: DRIZZLE_OBJECT_NAME}]);
    });

    it('passes the set array to both delete and update rules', async () => {
      const DRIZZLE_OBJECT_NAME = ['db', 'db2'];

      const configResult = await computeEslintConfig({
        drizzle: {drizzleObjectName: DRIZZLE_OBJECT_NAME},
      });

      expect(
        configResult.getRuleEntryOptions('drizzle', 'drizzle/enforce-delete-with-where'),
      ).toStrictEqual([{drizzleObjectName: DRIZZLE_OBJECT_NAME}]);

      expect(
        configResult.getRuleEntryOptions('drizzle', 'drizzle/enforce-update-with-where'),
      ).toStrictEqual([{drizzleObjectName: DRIZZLE_OBJECT_NAME}]);
    });
  });
});
