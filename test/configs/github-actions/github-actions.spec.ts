import {dir as findUpDirectory} from 'empathic/find';

const FIXTURES = {
  githubWorkflowEmptyMapping: 'github-workflow-empty-mapping.yml',
  workflowMissingName: 'workflow-missing-name.yml',
} as const;

vi.mock(import('empathic/find'), async (importOriginal) => ({
  ...(await importOriginal()),
  dir: vi.fn<typeof findUpDirectory>(),
}));

beforeEach(() => {
  vi.mocked(findUpDirectory).mockReturnValue('.github/workflows');
});

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
      await expectConfigState({}, 'github-actions', false);
    });

    it('creates `github-actions` eslint config if explicitly enabled', async () => {
      await expectConfigState('githubActions', 'github-actions', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `github-actions` eslint config (`.github/workflows` directory exists)', async () => {
      await expectConfigState({}, 'github-actions', true, 'default');
    });

    it('creates `github-actions` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'githubActions',
        'github-actions',
        ['githubActions', true],
        'default',
      );
    });

    it('does not create `github-actions` eslint config if explicitly disabled', async () => {
      await expectConfigState({githubActions: false}, 'github-actions', false, 'default');
    });

    describe('`.github/workflows` directory does not exist', () => {
      beforeEach(() => {
        vi.mocked(findUpDirectory).mockReturnValue(undefined);
      });

      it('does not create `github-actions` eslint config', async () => {
        await expectConfigState({}, 'github-actions', false, 'default');
      });

      it('creates `github-actions` eslint config if explicitly enabled', async () => {
        await expectConfigState('githubActions', 'github-actions', true, 'default');
      });

      it('does not create `github-actions` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {githubActions: false},
          'github-actions',
          ['githubActions', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `github-actions` eslint config (`.github/workflows` directory exists)', async () => {
      await expectConfigState({}, 'github-actions', true, 'misc-enabled');
    });

    it('creates `github-actions` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'githubActions',
        'github-actions',
        ['githubActions', true],
        'misc-enabled',
      );
    });

    it('does not create `github-actions` eslint config if explicitly disabled', async () => {
      await expectConfigState({githubActions: false}, 'github-actions', false, 'misc-enabled');
    });
  });

  it('has default `files` in `github-actions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('github-actions')?.files).toMatchInlineSnapshot(
      '[".github/workflows/*.y?(a)ml"]',
    );
  });

  it('has default `ignores` in `github-actions` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('github-actions')?.ignores?.length).toBeGreaterThan(0);
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

    expect(error?.message).toMatchInlineSnapshot('"Require action name to be set."');
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

      const configResult = await computeEslintConfig({githubActions: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('github-actions')?.files).toStrictEqual(FILES);
    });

    it('disables `github-actions` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({githubActions: {files: []}});

      expect(configResult.getConfigByUnPostfix('github-actions')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `github-actions` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({githubActions: {ignores: IGNORES}});
      const ignores = configResult.getConfigByUnPostfix('github-actions')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
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
});

describe('options', async () => {
  const configResult = await computeEslintConfig('githubActions');

  describe('option: `maxJobsPerAction`', () => {
    it('disables `github-actions/max-jobs-per-action` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('github-actions', 'github-actions/max-jobs-per-action'),
      ).toBe(0);
    });

    it('enables `github-actions/max-jobs-per-action` rule with the specified limit when `maxJobsPerAction` is set', async () => {
      const customConfigResult = await computeEslintConfig({githubActions: {maxJobsPerAction: 5}});

      expect(
        customConfigResult.getRuleEntry('github-actions', 'github-actions/max-jobs-per-action'),
      ).toMatchInlineSnapshot('[2, 5]');
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
    it('enables `github-actions/prefer-step-uses-style` rule with default options by default', () => {
      expect(
        configResult.getRuleEntry('github-actions', 'github-actions/prefer-step-uses-style'),
      ).toMatchInlineSnapshot('[2, {"allowRepository": true, "commit": true}]');
    });

    it('disables `github-actions/prefer-step-uses-style` rule when set to `false`', async () => {
      const customConfigResult = await computeEslintConfig({githubActions: {usesStyle: false}});

      expect(
        customConfigResult.getRuleEntrySeverity(
          'github-actions',
          'github-actions/prefer-step-uses-style',
        ),
      ).toBe(0);
    });

    it('enables `github-actions/prefer-step-uses-style` rule with custom options when set to object', async () => {
      const customConfigResult = await computeEslintConfig({
        githubActions: {usesStyle: {release: false}},
      });

      expect(
        customConfigResult.getRuleEntry('github-actions', 'github-actions/prefer-step-uses-style'),
      ).toMatchInlineSnapshot('[2, {"release": false}]');
    });
  });
});
