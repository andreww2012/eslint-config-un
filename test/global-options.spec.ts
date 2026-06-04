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

describe('option: `noWarnings`', () => {
  describe('runtime: warning severities are coerced to `error`', () => {
    it('coerces built-in warning-severity rules to `error`', async () => {
      const normal = await computeEslintConfig('js');
      const withNoWarnings = await computeEslintConfig('js', {un: {noWarnings: true}});

      const normalSeverities = getAllRulesSeverities(normal.getConfigByUnPostfix('js'));
      const noWarningsSeverities = getAllRulesSeverities(withNoWarnings.getConfigByUnPostfix('js'));

      // Sanity: the `js` config emits warning-severity rules by default.
      expect(normalSeverities).toContain(1);
      expect(noWarningsSeverities).not.toContain(1);
      // The warnings became errors, nothing got disabled in the process.
      expect(noWarningsSeverities).toStrictEqual(
        normalSeverities.filter((severity) => severity !== 1),
      );
    });

    it('keeps warnings as-is when `noWarnings` is not enabled', async () => {
      const withoutFlag = await computeEslintConfig('js');
      const withFalseFlag = await computeEslintConfig('js', {un: {noWarnings: false}});

      expect(getAllRulesSeverities(withoutFlag.getConfigByUnPostfix('js'))).toContain(1);
      expect(getAllRulesSeverities(withFalseFlag.getConfigByUnPostfix('js'))).toContain(1);
    });

    it("coerces per-config `forceSeverity: 'warn'` (string) to `error`", async () => {
      const withForce = await computeEslintConfig(
        {js: {forceSeverity: 'warn'}},
        {un: {noWarnings: true}},
      );

      const severities = getAllRulesSeverities(withForce.getConfigByUnPostfix('js'));

      expect(severities).not.toContain(1);
      expect(severities).toContain(2);
    });

    it('coerces per-config `forceSeverity: 1` (number) to `error`', async () => {
      const withForce = await computeEslintConfig(
        {js: {forceSeverity: 1}},
        {un: {noWarnings: true}},
      );

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(1);
    });

    it("coerces root-level `forceSeverity: 'warn'` to `error`", async () => {
      const withForce = await computeEslintConfig('js', {
        un: {noWarnings: true, forceSeverity: 'warn'},
      });

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(1);
    });

    it("keeps per-config `forceSeverity: 'warn'` as warning when `noWarnings` is disabled", async () => {
      const withForce = await computeEslintConfig({js: {forceSeverity: 'warn'}});

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).toContain(1);
      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(2);
    });
  });

  describe('runtime: `linterOptionsReportUnusedDisableDirectives`', () => {
    const POSTFIX = 'global-setup/linter-options/reportUnusedDisableDirectives';

    it("sets `2` severity by default to override ESLint's default of `warn`", async () => {
      const configResult = await computeEslintConfig({}, {un: {noWarnings: true}});

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 2},
      });
    });

    it('does not emit a config by default when `noWarnings` is disabled', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toBeUndefined();
    });

    it('coerces an explicit `warn` value to `error`', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 'warn'}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 'error'},
      });
    });

    it('coerces an explicit `1` value to `2`', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 1}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 2},
      });
    });

    it('leaves non-warning values untouched', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 'off'}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 'off'},
      });
    });
  });
});
