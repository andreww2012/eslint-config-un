describe('option: `files`', () => {
  describe('function form', () => {
    it('receives the patterns `files` would be resolved to if the option was not passed', async () => {
      const receivedParams: {readonly filesDefault: readonly string[]}[] = [];

      const configResult = await computeEslintConfig({
        vitest: {
          files: (params) => {
            receivedParams.push(params);
            return [...params.filesDefault];
          },
        },
      });

      expect(receivedParams).toStrictEqual([
        {filesDefault: configResult.getConfigByUnPostfix('vitest')?.files},
      ]);
    });

    it('replaces the resolved patterns with the returned ones', async () => {
      const FILES = ['tests/**/*.vitest.ts'];

      const configResult = await computeEslintConfig({vitest: {files: () => FILES}});

      expect(configResult.getConfigByUnPostfix('vitest')?.files).toStrictEqual(FILES);
    });

    it('keeps the resolved patterns if `undefined` is returned', async () => {
      const configResult = await computeEslintConfig({vitest: {files: () => undefined}});

      expect(configResult.getConfigByUnPostfix('vitest')?.files).toStrictEqual(
        (await computeEslintConfig('vitest')).getConfigByUnPostfix('vitest')?.files,
      );
    });

    it('does not create the eslint config if an empty array is returned, keeping sub-configs intact', async () => {
      const configResult = await computeEslintConfig({
        vitest: {files: () => [], configTypescript: true},
      });

      expect(configResult.getConfigByUnPostfix('vitest')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeDefined();
    });
  });
});

describe('option: `ignores`', () => {
  describe('function form', () => {
    it('receives the default and the implicitly ignored patterns separately', async () => {
      let receivedParams:
        | {readonly ignoresDefault: readonly string[]; readonly ignoresImplicit: readonly string[]}
        | undefined;

      const configResult = await computeEslintConfig({
        import: {
          ignores: (params) => {
            receivedParams = params;
            return [...params.ignoresImplicit, ...params.ignoresDefault];
          },
        },
      });

      expect(receivedParams?.ignoresDefault).toMatchInlineSnapshot('["**/*.md/**/*.*"]');
      expect(receivedParams?.ignoresImplicit).toMatchInlineSnapshot(
        '["**/*.css", "**/*.scss", "**/*.json", "**/*.jsonc", "**/*.json5", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.y?(a)ml"]',
      );
      expect(configResult.getConfigByUnPostfix('import')?.ignores).toStrictEqual(
        (await computeEslintConfig('import')).getConfigByUnPostfix('import')?.ignores,
      );
    });

    it('replaces both of them with the returned patterns', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({import: {ignores: () => IGNORES}});

      expect(configResult.getConfigByUnPostfix('import')?.ignores).toStrictEqual(IGNORES);
    });

    it('keeps the resolved patterns if `undefined` is returned', async () => {
      const configResult = await computeEslintConfig({import: {ignores: () => undefined}});

      expect(configResult.getConfigByUnPostfix('import')?.ignores).toStrictEqual(
        (await computeEslintConfig('import')).getConfigByUnPostfix('import')?.ignores,
      );
    });

    it('results in no `ignores` if an empty array is returned', async () => {
      const configResult = await computeEslintConfig({import: {ignores: () => []}});

      expect(configResult.getConfigByUnPostfix('import')?.ignores).toBeUndefined();
    });
  });
});

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

  it('keeps the original rule enabled and disables its `disable-autofix/*` version if `disableAutofix` is set to `false`', async () => {
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

    expect(configResult.getRuleEntry('vitest', 'vitest/no-focused-tests')).toMatchInlineSnapshot(
      '[1, {"fixable": true}]',
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
        '{"files": [["**/*[.-_]spec.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.test.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/__test?(s)__/**/*.?([cm])[jt]s?(x)", "**/*.test.ts"], ["**/*.{bench,benchmark}.?([cm])[jt]s?(x)", "**/*.test.ts"]], "ignores": ["**/*.css", "**/*.scss", "**/*.json", "**/*.jsonc", "**/*.json5", "**/*.md", "**/*.mdx", "**/*.htm?(l)", "**/*.toml", "**/*.y?(a)ml"], "name": "eslint-config-un/vitest/@rule/vitest/no-focused-tests", "rules": {"vitest/no-focused-tests": [2, {"fixable": true}]}}',
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
