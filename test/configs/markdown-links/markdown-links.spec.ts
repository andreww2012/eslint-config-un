import {GLOB_MARKDOWN} from '../../../src/constants';

const FIXTURES = {
  missingPath: 'missing-path.md',
  vitepressCustomContainerWithoutSpaceInHeader:
    '../../markdown-preferences/fixtures/vitepress-custom-container-without-space-in-header.md',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('markdownLinks');

  it('loads `markdown-links` plugin if used', () => {
    expect(configResult.getLoadedPlugin('markdown-links')).toBeDefined();
  });

  it('creates `markdown-links` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('markdown-links')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `markdown-links` eslint config', async () => {
      await expectConfigState({}, 'markdown-links', false);
    });

    it('creates `markdown-links` eslint config if explicitly enabled', async () => {
      await expectConfigState('markdownLinks', 'markdown-links', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `markdown-links` eslint config by default', async () => {
      await expectConfigState({}, 'markdown-links', false, 'default');
    });

    it('creates `markdown-links` eslint config if explicitly enabled', async () => {
      await expectConfigState('markdownLinks', 'markdown-links', true, 'default');
    });

    it('does not create `markdown-links` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {markdownLinks: false},
        'markdown-links',
        ['markdownLinks', false],
        'default',
      );
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `markdown-links` eslint config (not in the misc group)', async () => {
      await expectConfigState({}, 'markdown-links', false, 'misc-enabled');
    });

    it('creates `markdown-links` eslint config if explicitly enabled', async () => {
      await expectConfigState('markdownLinks', 'markdown-links', true, 'misc-enabled');
    });

    it('does not create `markdown-links` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState(
        {markdownLinks: false},
        'markdown-links',
        ['markdownLinks', false],
        'misc-enabled',
      );
    });
  });

  it('has default `files` in `markdown-links` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('markdown-links')?.files).toMatchInlineSnapshot(
      '["**/*.md"]',
    );
  });

  it('has default `ignores` in `markdown-links` eslint config (does not ignore markdown files)', () => {
    const ignores = configResult.getConfigByUnPostfix('markdown-links')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_MARKDOWN]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('markdownLinks');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('markdown-links')).toMatchObject({
      'markdown-links/no-missing-path': 2,
      'markdown-links/no-dead-urls': 1,
    });
  });

  it('`markdown-links/no-missing-path` rule fires on a markdown file with a link to a non-existent local path', async () => {
    const results = await testEslintConfig(
      {markdownLinks: true},
      FIXTURES.missingPath,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.missingPath,
      'markdown-links/no-missing-path',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"The file './nonexistent-file.md' does not exist. Please check the path or update it to a valid file."`,
    );
  });

  it('language set by `markdownPreferences` config take precedence of language set by `markdownLinks`', async () => {
    const results = await testEslintConfig(
      {markdownLinks: true, markdownPreferences: {extendedMarkdownSyntax: true}},
      FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
      'markdown-preferences/custom-container-marker-spacing',
    );

    expect(results[0]?.fatalErrorCount).toBe(0);
    // File is parsed with an extended syntax language and therefore the rule is able to report errors
    expect(error?.message).toMatchInlineSnapshot(
      '"Expected a space between opening custom container marker and info."',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `markdown-links` eslint config', async () => {
      const FILES = ['docs/**/*.md'];

      const configResult = await computeEslintConfig({markdownLinks: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('markdown-links')?.files).toStrictEqual(FILES);
    });

    it('disables `markdown-links` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({markdownLinks: {files: []}});

      expect(configResult.getConfigByUnPostfix('markdown-links')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `markdown-links` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({markdownLinks: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('markdown-links')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `markdown-links` eslint config', async () => {
    const configResult = await computeEslintConfig({
      markdownLinks: {
        overrides: {'markdown-links/no-missing-path': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-path'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('markdown-links', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `check.deadUrls`', () => {
    it('sets `markdown-links/no-dead-urls` to warning with `checkAnchor: false` by default', async () => {
      const configResult = await computeEslintConfig('markdownLinks');

      expect(
        configResult.getRuleEntry('markdown-links', 'markdown-links/no-dead-urls'),
      ).toMatchInlineSnapshot('[1, {"checkAnchor": false}]');
    });

    it('disables `markdown-links/no-dead-urls` when `check.deadUrls` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {deadUrls: false}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-dead-urls'),
      ).toBe(0);
    });

    it('sets `markdown-links/no-dead-urls` to error when `check.deadUrls` has `severityWarn: false`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {deadUrls: {severityWarn: false}}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-dead-urls'),
      ).toBe(2);
    });

    it('merges user-provided options into `markdown-links/no-dead-urls` rule options', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {deadUrls: {options: {checkAnchor: true}}}},
      });

      expect(
        configResult.getRuleEntry('markdown-links', 'markdown-links/no-dead-urls'),
      ).toMatchInlineSnapshot('[1, {"checkAnchor": true}]');
    });
  });

  describe('option: `check.missingFragments`', () => {
    it('enables `markdown-links/no-missing-fragments` rule at error by default', async () => {
      const configResult = await computeEslintConfig('markdownLinks');

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-fragments'),
      ).toBe(2);
    });

    it('disables `markdown-links/no-missing-fragments` rule when `check.missingFragments` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {missingFragments: false}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-fragments'),
      ).toBe(0);
    });

    it('sets `markdown-links/no-missing-fragments` rule to warning when `check.missingFragments` is `{severityWarn: true}`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {missingFragments: {severityWarn: true}}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-fragments'),
      ).toBe(1);
    });
  });

  describe('option: `check.missingLocalPath`', () => {
    it('enables `markdown-links/no-missing-path` rule at error by default', async () => {
      const configResult = await computeEslintConfig('markdownLinks');

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-path'),
      ).toBe(2);
    });

    it('disables `markdown-links/no-missing-path` rule when `check.missingLocalPath` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {missingLocalPath: false}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-path'),
      ).toBe(0);
    });

    it('sets `markdown-links/no-missing-path` rule to warning when `check.missingLocalPath` is `{severityWarn: true}`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {missingLocalPath: {severityWarn: true}}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-missing-path'),
      ).toBe(1);
    });
  });

  describe('option: `check.selfDestinationLinks`', () => {
    it('enables `markdown-links/no-self-destination` rule at error by default', async () => {
      const configResult = await computeEslintConfig('markdownLinks');

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-self-destination'),
      ).toBe(2);
    });

    it('disables `markdown-links/no-self-destination` rule when `check.selfDestinationLinks` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {selfDestinationLinks: false}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-self-destination'),
      ).toBe(0);
    });

    it('sets `markdown-links/no-self-destination` rule to warning when `check.selfDestinationLinks` is `{severityWarn: true}`', async () => {
      const configResult = await computeEslintConfig({
        markdownLinks: {check: {selfDestinationLinks: {severityWarn: true}}},
      });

      expect(
        configResult.getRuleEntrySeverity('markdown-links', 'markdown-links/no-self-destination'),
      ).toBe(1);
    });
  });
});
