const FIXTURES = {
  unlimitedEslintDisableComment: 'unlimited-eslint-disable-comment.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('eslintComments');

  it('loads `eslint-comments` plugin if used', () => {
    expect(configResult.getLoadedPlugin('eslint-comments')).toBeDefined();
  });

  it('creates `eslint-comments` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `eslint-comments` eslint config', async () => {
      await expectConfigState({}, 'eslint-comments', false);
    });

    it('creates `eslint-comments` eslint config if explicitly enabled', async () => {
      await expectConfigState('eslintComments', 'eslint-comments', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `eslint-comments` eslint config by default', async () => {
      await expectConfigState({}, 'eslint-comments', true, 'default');
    });

    it('creates `eslint-comments` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'eslintComments',
        'eslint-comments',
        ['eslintComments', true],
        'default',
      );
    });

    it('does not create `eslint-comments` eslint config if explicitly disabled', async () => {
      await expectConfigState({eslintComments: false}, 'eslint-comments', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `eslint-comments` eslint config', async () => {
      await expectConfigState({}, 'eslint-comments', true, 'misc-enabled');
    });

    it('creates `eslint-comments` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'eslintComments',
        'eslint-comments',
        ['eslintComments', true],
        'misc-enabled',
      );
    });

    it('does not create `eslint-comments` eslint config if explicitly disabled', async () => {
      await expectConfigState({eslintComments: false}, 'eslint-comments', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `eslint-comments` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')?.files).toBeUndefined();
  });

  it('has no `ignores` in `eslint-comments` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('eslint-comments')?.ignores).toBeUndefined();
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('eslintComments');

  it('enables `eslint-comments/disable-enable-pair` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('eslint-comments', 'eslint-comments/disable-enable-pair'),
    ).toBe(2);
  });

  it('disables `eslint-comments/no-use` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('eslint-comments', 'eslint-comments/no-use')).toBe(0);
  });

  it('`eslint-comments/no-unlimited-disable` rule fires on a rule-less `eslint-disable` comment', async () => {
    const results = await testEslintConfig(
      'eslintComments',
      FIXTURES.unlimitedEslintDisableComment,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.unlimitedEslintDisableComment,
      'eslint-comments/no-unlimited-disable',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Unexpected unlimited 'eslint-disable' comment. Specify some rule names to disable."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `eslint-comments` eslint config', async () => {
      const FILES = ['src/**/*.js'];

      const configResult = await computeEslintConfig({eslintComments: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('eslint-comments')?.files).toStrictEqual(FILES);
    });

    it('disables `eslint-comments` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({eslintComments: {files: []}});

      expect(configResult.getConfigByUnPostfix('eslint-comments')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `eslint-comments` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({eslintComments: {ignores: IGNORES}});

      expect(configResult.getConfigByUnPostfix('eslint-comments')?.ignores).toIncludeAllMembers(
        IGNORES,
      );
    });
  });

  it('respects `overrides` and `overridesAny` in `eslint-comments` eslint config', async () => {
    const configResult = await computeEslintConfig({
      eslintComments: {
        overrides: {'eslint-comments/disable-enable-pair': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('eslint-comments', 'eslint-comments/disable-enable-pair'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('eslint-comments', 'no-console')).toBe(0);
  });
});
