const FIXTURES = {
  githubWorkflowEmptyMapping: 'github-workflow-empty-mapping.yml',
  workflowMissingName: 'workflow-missing-name.yml',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('githubActions');

  it('loads `github-actions` plugin if used', () => {
    expect(configResult.getLoadedPlugin('github-actions')).toBeDefined();
  });

  it('creates `github-actions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('github-actions')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `github-actions` eslint config', async () => {
      const modeConfigResult = await computeEslintConfig({});

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeUndefined();
    });

    it('creates `github-actions` eslint config if explicitly enabled', async () => {
      const modeConfigResult = await computeEslintConfig('githubActions');

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `github-actions` eslint config (`.github/workflows` directory exists)', async () => {
      const modeConfigResult = await computeEslintConfig({}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeDefined();
    });

    it('creates `github-actions` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      const modeConfigResult = await computeEslintConfig('githubActions', {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeDefined();

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`githubActions\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `github-actions` eslint config if explicitly disabled', async () => {
      const modeConfigResult = await computeEslintConfig({githubActions: false}, {reset: true});

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `github-actions` eslint config (`.github/workflows` directory exists)', async () => {
      const modeConfigResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(modeConfigResult.getConfigByUnPostfix('github-actions')).toBeDefined();
    });
  });

  it('has default `files` in `github-actions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('github-actions')?.files).toMatchInlineSnapshot(
      `[".github/workflows/*.y?(a)ml"]`,
    );
  });

  it('has default `ignores` in `github-actions` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('github-actions')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('githubActions');

  it('enables `github-actions/job-id-casing` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('github-actions', 'github-actions/job-id-casing'),
    ).toBe(2);
  });

  it('disables `github-actions/action-name-casing` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('github-actions', 'github-actions/action-name-casing'),
    ).toBe(0);
  });

  it('`github-actions/require-action-name` rule fires on a workflow file without a top-level name', async () => {
    const results = await testEslintConfig(
      {githubActions: {files: ['**/*.yml']}},
      FIXTURES.workflowMissingName,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.workflowMissingName,
      'github-actions/require-action-name',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Require action name to be set."`);
  });

  it('does not trigger `yaml/no-empty-mapping-value` for empty trigger events', async () => {
    const results = await testEslintConfig(
      {yaml: true, githubActions: {files: ['**/*.yml']}},
      FIXTURES.githubWorkflowEmptyMapping,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.githubWorkflowEmptyMapping,
      'yaml/no-empty-mapping-value',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `github-actions` eslint config', async () => {
      const FILES = ['.github/**/*.yml'];
      const configResult = await computeEslintConfig({
        githubActions: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('github-actions')?.files).toStrictEqual(FILES);
    });

    it('disables `github-actions` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        githubActions: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('github-actions')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `github-actions` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        githubActions: {ignores: IGNORES},
      });
      const ignores = configResult.getConfigByUnPostfix('github-actions')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `github-actions` eslint config', async () => {
    const configResult = await computeEslintConfig({
      githubActions: {
        overrides: {'github-actions/job-id-casing': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('github-actions', 'github-actions/job-id-casing'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('github-actions', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `github-actions` eslint config', async () => {
      const configResult = await computeEslintConfig({
        githubActions: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('github-actions'), (ruleName) =>
          ruleName.startsWith('github-actions/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `github-actions` eslint config', async () => {
      const configResult = await computeEslintConfig({
        githubActions: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('github-actions'), (ruleName) =>
          ruleName.startsWith('github-actions/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', async () => {
  const configResult = await computeEslintConfig('githubActions');

  describe('option: `maxJobsPerAction`', () => {
    it('disables `github-actions/max-jobs-per-action` rule when `maxJobsPerAction` is not set (default)', () => {
      expect(
        configResult.getRuleEntrySeverity('github-actions', 'github-actions/max-jobs-per-action'),
      ).toBe(0);
    });

    it('enables `github-actions/max-jobs-per-action` rule with the specified limit when `maxJobsPerAction` is set', async () => {
      const customConfigResult = await computeEslintConfig({githubActions: {maxJobsPerAction: 5}});

      expect(
        customConfigResult.getRuleEntry('github-actions', 'github-actions/max-jobs-per-action'),
      ).toMatchInlineSnapshot(`[2, 5]`);
    });
  });

  describe('option: `require`', () => {
    it('enables `github-actions/require-action-name` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('github-actions', 'github-actions/require-action-name'),
      ).toBe(2);
    });

    it('disables `github-actions/require-action-name` rule when `require.actionName` is `false`', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {require: {actionName: false}},
      });

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/require-action-name',
        ),
      ).toBe(0);
    });

    it('enables `github-actions/require-job-name` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('github-actions', 'github-actions/require-job-name'),
      ).toBe(2);
    });

    it('disables `github-actions/require-job-name` rule when `require.jobName` is `false`', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {require: {jobName: false}},
      });

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/require-job-name',
        ),
      ).toBe(0);
    });

    it('disables `github-actions/require-action-run-name` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/require-action-run-name',
        ),
      ).toBe(0);
    });

    it('enables `github-actions/require-action-run-name` rule when `require.actionRunName` is `true`', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {require: {actionRunName: true}},
      });

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/require-action-run-name',
        ),
      ).toBe(2);
    });

    it('disables `github-actions/require-job-step-name` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('github-actions', 'github-actions/require-job-step-name'),
      ).toBe(0);
    });

    it('enables `github-actions/require-job-step-name` rule when `require.jobStepName` is `true`', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {require: {jobStepName: true}},
      });

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/require-job-step-name',
        ),
      ).toBe(2);
    });
  });

  describe('option: `usesStyle`', () => {
    it('enables `github-actions/prefer-step-uses-style` rule with default options when `usesStyle` is not explicitly set', () => {
      expect(
        configResult.getRuleEntry('github-actions', 'github-actions/prefer-step-uses-style'),
      ).toMatchInlineSnapshot(`[2, {"allowRepository": true, "release": true}]`);
    });

    it('disables `github-actions/prefer-step-uses-style` rule when `usesStyle` is `false`', async () => {
      const customConfigResult = await computeEslintConfig({githubActions: {usesStyle: false}});

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/prefer-step-uses-style',
        ),
      ).toBe(0);
    });

    it('enables `github-actions/prefer-step-uses-style` rule with custom options when `usesStyle` is an object', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {usesStyle: {release: false}},
      });

      expect(
        customConfigResult.getRuleEntry('github-actions', 'github-actions/prefer-step-uses-style'),
      ).toMatchInlineSnapshot(`[2, {"allowRepository": true, "release": false}]`);
    });
  });
});
