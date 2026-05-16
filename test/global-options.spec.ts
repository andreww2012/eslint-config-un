describe('option: `linterOptionsNoInlineConfig`', () => {
  it('does not create a respective config by default', async () => {
    const configResult = await computeEslintConfig({});

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toBeUndefined();
  });

  it('creates a respective config when set to `true`', async () => {
    const configResult = await computeEslintConfig({}, {un: {linterOptionsNoInlineConfig: true}});

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({linterOptions: {noInlineConfig: true}});
  });

  it('creates a respective config when set to `false`', async () => {
    const configResult = await computeEslintConfig({}, {un: {linterOptionsNoInlineConfig: false}});

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({linterOptions: {noInlineConfig: false}});
  });

  it('creates a respective config with only `files` and `value`', async () => {
    const FILES = ['**/*.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {linterOptionsNoInlineConfig: {value: true, files: FILES}}},
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({files: FILES, linterOptions: {noInlineConfig: true}});
  });

  it('creates a respective config with only `ignores` and no `value` which implicitly sets it to `false`', async () => {
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {linterOptionsNoInlineConfig: {ignores: IGNOGES}}},
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({ignores: IGNOGES, linterOptions: {noInlineConfig: false}});
  });

  it('creates a respective config with `ignores`, empty `files` and no `value` which implicitly sets it to `false`', async () => {
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {linterOptionsNoInlineConfig: {files: [], ignores: IGNOGES}}},
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({ignores: IGNOGES, linterOptions: {noInlineConfig: false}});
  });

  it('creates a respective config with `files`, `ignores` and no `value`', async () => {
    const FILES = ['**/*.ts'];
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {linterOptionsNoInlineConfig: {files: FILES, ignores: IGNOGES}}},
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({files: FILES, ignores: IGNOGES, linterOptions: {}});
  });

  it('creates a respective config with `files`, `ignores` and `value` specified', async () => {
    const FILES = ['**/*.ts'];
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {linterOptionsNoInlineConfig: {files: FILES, ignores: IGNOGES, value: false}}},
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toMatchObject({files: FILES, ignores: IGNOGES, linterOptions: {noInlineConfig: false}});
  });

  it('creates multiple respective configs when array form is used', async () => {
    const FILES_1 = ['**/*.ts'];
    const FILES_2 = ['**/*.js'];

    const configResult = await computeEslintConfig(
      {},
      {
        un: {
          linterOptionsNoInlineConfig: [
            {value: true, files: FILES_1},
            {value: false, files: FILES_2},
          ],
        },
      },
    );

    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig'),
    ).toBeUndefined();
    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig/0'),
    ).toMatchObject({files: FILES_1, linterOptions: {noInlineConfig: true}});
    expect(
      configResult.getConfigByUnPostfix('global-setup/linter-options/noInlineConfig/1'),
    ).toMatchObject({files: FILES_2, linterOptions: {noInlineConfig: false}});
  });
});

describe.each([
  ['linterOptionsReportUnusedDisableDirectives', 'reportUnusedDisableDirectives'],
] as const)('option: `%s`', (unOptionName, eslintOptionName) => {
  it('does not create a respective config by default', async () => {
    const configResult = await computeEslintConfig({});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toBeUndefined();
  });

  it('creates a respective config when set to `error`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 'error'}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 'error'}});
  });

  it('creates a respective config when set to `warn`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 'warn'}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 'warn'}});
  });

  it('creates a respective config when set to `off`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 'off'}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 'off'}});
  });

  it('creates a respective config when set to `2`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 2}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 2}});
  });

  it('creates a respective config when set to `1`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 1}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 1}});
  });

  it('creates a respective config when set to `0`', async () => {
    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: 0}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({linterOptions: {reportUnusedDisableDirectives: 0}});
  });

  it('creates a respective config with only `files` and `value`', async () => {
    const FILES = ['**/*.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {[unOptionName]: {value: 0, files: FILES}}},
    );

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({files: FILES, linterOptions: {reportUnusedDisableDirectives: 0}});
  });

  it('creates a respective config with only `ignores` and no `value` which implicitly sets it to `off`', async () => {
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig({}, {un: {[unOptionName]: {ignores: IGNOGES}}});

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({ignores: IGNOGES, linterOptions: {reportUnusedDisableDirectives: 'off'}});
  });

  it('creates a respective config with `ignores`, empty `files` and no `value` which implicitly sets it to `off`', async () => {
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {[unOptionName]: {files: [], ignores: IGNOGES}}},
    );

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({ignores: IGNOGES, linterOptions: {reportUnusedDisableDirectives: 'off'}});
  });

  it('creates a respective config with `files`, `ignores` and no `value`', async () => {
    const FILES = ['**/*.ts'];
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {un: {[unOptionName]: {files: FILES, ignores: IGNOGES}}},
    );

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({files: FILES, ignores: IGNOGES, linterOptions: {}});
  });

  it('creates a respective config with `files`, `ignores` and `value` specified', async () => {
    const FILES = ['**/*.ts'];
    const IGNOGES = ['**/*.test.ts'];

    const configResult = await computeEslintConfig(
      {},
      {
        un: {
          [unOptionName]: {
            files: FILES,
            ignores: IGNOGES,
            value: 'warn',
          },
        },
      },
    );

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toMatchObject({
      files: FILES,
      ignores: IGNOGES,
      linterOptions: {reportUnusedDisableDirectives: 'warn'},
    });
  });

  it('creates multiple respective configs when array form is used', async () => {
    const FILES_1 = ['**/*.ts'];
    const FILES_2 = ['**/*.js'];

    const configResult = await computeEslintConfig(
      {},
      {
        un: {
          [unOptionName]: [
            {value: 2, files: FILES_1},
            {value: 'error', files: FILES_2},
          ],
        },
      },
    );

    expect(
      configResult.getConfigByUnPostfix(`global-setup/linter-options/${eslintOptionName}`),
    ).toBeUndefined();
    expect(
      configResult.getConfigByUnPostfix(
        'global-setup/linter-options/reportUnusedDisableDirectives/0',
      ),
    ).toMatchObject({files: FILES_1, linterOptions: {reportUnusedDisableDirectives: 2}});
    expect(
      configResult.getConfigByUnPostfix(
        'global-setup/linter-options/reportUnusedDisableDirectives/1',
      ),
    ).toMatchObject({files: FILES_2, linterOptions: {reportUnusedDisableDirectives: 'error'}});
  });
});
