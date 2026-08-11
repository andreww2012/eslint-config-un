describe('option: `overrides` and `overridesAny`', () => {
  it('if the config supports these options, they should actually work', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {'vitest/prefer-to-be': 1},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-to-be')).toBe(1);
    expect(configResult.getRuleEntrySeverity('vitest', 'no-console')).toBe(0);
  });

  it('puts `overridesAny` after `overrides`', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {'vitest/prefer-to-be': 1},
        overridesAny: {'vitest/prefer-to-be': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-to-be')).toBe(0);
  });

  it('object override works', async () => {
    const SEVERITY = 1;
    const OPTIONS = [{fixable: true}] as const;

    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {
          'vitest/no-focused-tests': {severity: SEVERITY, options: OPTIONS},
        },
      },
    });

    expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
      '[1, {"fixable": true}]',
    );
  });

  describe('function override', () => {
    it('function override works', async () => {
      const SEVERITY = 1;
      const OPTIONS = [{fixable: true}] as const;

      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': () => ({severity: SEVERITY, options: OPTIONS}),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
        '[1, {"fixable": true}]',
      );
    });

    it('passes the default severity and options as parameters', async () => {
      let expectedSeverity: number | undefined;
      let expectedOptions: unknown;

      await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity, options) => {
              expectedSeverity = severity;
              expectedOptions = options;
              return {
                severity,
                options,
              };
            },
          },
        },
      });

      expect(expectedSeverity).toMatchInlineSnapshot('2');
      expect(expectedOptions).toMatchInlineSnapshot('[{"fixable": false}]');
    });
  });

  it('enables `disable-autofix/*` version of the rule if `disabledAutofix` is set to `true` and disables the original rule', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {
          'vitest/no-focused-tests': {
            severity: 1,
            options: [{fixable: true}],
            disableAutofix: true,
          },
        },
      },
    });

    expect(configResult.getRuleEntrySeverity('vitest', 'vitest/no-focused-tests')).toBe(0);
    expect(
      configResult.getRuleEntry('vitest', 'disable-autofix/vitest/no-focused-tests'),
    ).toMatchInlineSnapshot('[1, {"fixable": true}]');
  });

  // TODO the override severity and options are currently dropped, which is likely unintended
  it('only disables the `disable-autofix/*` version of the rule if `disableAutofix` is set to `false`', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {
          'vitest/no-focused-tests': {
            severity: 1,
            options: [{fixable: true}],
            disableAutofix: false,
          },
        },
      },
    });

    expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toStrictEqual(
      (await computeEslintConfig('vitest')).getRuleEntry('vitest', 'vitest/no-focused-tests'),
    );
    expect(configResult.getRuleEntry('vitest', 'disable-autofix/vitest/no-focused-tests')).toBe(0);
  });

  it('ignores a rule whose override is set to `undefined`', async () => {
    const configResult = await computeEslintConfig({
      vitest: {
        overrides: {'vitest/prefer-to-be': undefined},
      },
    });

    expect(configResult.getRuleEntrySeverity('vitest', 'vitest/prefer-to-be')).toBe(
      (await computeEslintConfig('vitest')).getRuleEntrySeverity('vitest', 'vitest/prefer-to-be'),
    );
  });

  describe('`files` and `ignores` options', () => {
    it('moves the rule to its own eslint config if `files` option is specified in override', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              files: ['**/*.test.ts'],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toMatchInlineSnapshot(
        '{"files": [["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.test.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.{bench,benchmark}.?([cm])[jt]s?(x)", "**/*.test.ts"]], "ignores": ["**/*.css", "**/*.json", "**/*.jsonc", "**/*.json5", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.y?(a)ml"], "name": "eslint-config-un/vitest/@rule/vitest/no-focused-tests", "rules": {"vitest/no-focused-tests": [2, {"fixable": true}]}}',
      );
    });

    it('moves the rule to its own eslint config if `ignores` option is specified in override', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              ignores: ['**/*.todo.test.ts'],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toMatchInlineSnapshot(
        '{"files": ["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.?([cm])[jt]s?(x)", "**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.{bench,benchmark}.?([cm])[jt]s?(x)"], "ignores": ["**/*.todo.test.ts"], "name": "eslint-config-un/vitest/@rule/vitest/no-focused-tests", "rules": {"vitest/no-focused-tests": [2, {"fixable": true}]}}',
      );
    });

    it('moves the rule to its own eslint config if both `files` and `ignores` options are specified in override', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              files: ['**/*.test.ts'],
              ignores: ['**/*.todo.test.ts'],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toMatchInlineSnapshot(
        '{"files": [["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.test.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.{bench,benchmark}.?([cm])[jt]s?(x)", "**/*.test.ts"]], "ignores": ["**/*.todo.test.ts"], "name": "eslint-config-un/vitest/@rule/vitest/no-focused-tests", "rules": {"vitest/no-focused-tests": [2, {"fixable": true}]}}',
      );
    });

    it('does not create a separate eslint config if `files` is set to empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              files: [],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
        '[2, {"fixable": true}]',
      );
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toBeUndefined();
    });

    it('does not create a separate eslint config if `ignores` is set to empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              ignores: [],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
        '[2, {"fixable": true}]',
      );
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toBeUndefined();
    });

    it('does not create a separate eslint config if both `files` and `ignores` are set to empty array', async () => {
      const configResult = await computeEslintConfig({
        vitest: {
          overrides: {
            'vitest/no-focused-tests': (severity) => ({
              severity,
              options: [{fixable: true}],
              files: [],
              ignores: [],
            }),
          },
        },
      });

      expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
        '[2, {"fixable": true}]',
      );
      expect(
        configResult.getConfigByUnPostfix('vitest/@rule/vitest/no-focused-tests'),
      ).toBeUndefined();
    });
  });
});

describe('option: `forceSeverity`', () => {
  it('respects `forceSeverity` set to `error`', async () => {
    const configResult = await computeEslintConfig({sonar: {forceSeverity: 'error'}});

    expect(
      getAllRulesSeverities(configResult.getConfigByUnPostfix('sonar'), (ruleName) =>
        ruleName.startsWith('sonarjs/'),
      ),
    ).toStrictEqual([2]);
  });

  it('respects `forceSeverity` set to `warn`', async () => {
    const configResult = await computeEslintConfig({sonar: {forceSeverity: 'warn'}});

    expect(
      getAllRulesSeverities(configResult.getConfigByUnPostfix('sonar'), (ruleName) =>
        ruleName.startsWith('sonarjs/'),
      ),
    ).toStrictEqual([1]);
  });
});
