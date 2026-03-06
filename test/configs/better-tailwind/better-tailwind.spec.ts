import path from 'node:path';

const FIXTURES = {
  tailwindInJsxDuplicateClasses: 'tailwind-in-jsx-duplicate-classes.jsx',
  tailwindInCssDuplicateClasses: 'tailwind-in-css-duplicate-classes.css',
} as const;

const DEFAULT_SETTINGS = {
  entryPoint: path.posix.resolve(import.meta.dirname, 'fixtures', 'tailwind-entry.css'),
};

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('betterTailwind');

  it('loads `better-tailwindcss` plugin', () => {
    expect(configResult.getLoadedPlugin('better-tailwindcss')).toBeDefined();
  });

  it('creates `better-tailwindcss` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `better-tailwindcss` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeUndefined();
    });

    it('creates `better-tailwindcss` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig({betterTailwind: true});

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `better-tailwindcss` eslint config by default (tailwindcss is installed)', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
    });

    it('creates `better-tailwindcss` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({betterTailwind: true}, {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`betterTailwind\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `better-tailwindcss` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({betterTailwind: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `better-tailwindcss` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
    });
  });

  it('has default `files` in `better-tailwindcss` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('better-tailwindcss')?.files).toBeUndefined();
  });

  it('has default `ignores` in `better-tailwindcss` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('better-tailwindcss')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('betterTailwind');

  it('enables `better-tailwindcss/no-conflicting-classes` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/no-conflicting-classes',
        ),
      ),
    ).toBe(2);
  });

  it('disables `better-tailwindcss/no-unknown-classes` rule by default', () => {
    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('better-tailwindcss', 'better-tailwindcss/no-unknown-classes'),
      ),
    ).toBe(0);
  });

  it('`better-tailwindcss/no-duplicate-classes` rule reports duplicate classes in JSX', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          files: ['**'],
          settings: DEFAULT_SETTINGS,
        },
      },
      FIXTURES.tailwindInJsxDuplicateClasses,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      result,
      FIXTURES.tailwindInJsxDuplicateClasses,
      'better-tailwindcss/no-duplicate-classes',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `better-tailwindcss` eslint config', async () => {
      const FILES = ['**/*.jsx'];
      const configResult = await computeEslintConfig({
        betterTailwind: {files: FILES, settings: DEFAULT_SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')?.files).toStrictEqual(FILES);
    });

    it('disables `better-tailwindcss` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {files: [], settings: DEFAULT_SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `better-tailwindcss` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        betterTailwind: {ignores: IGNORES, settings: DEFAULT_SETTINGS},
      });

      const ignores = configResult.getConfigByUnPostfix('better-tailwindcss')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `better-tailwindcss` eslint config', async () => {
    const configResult = await computeEslintConfig({
      betterTailwind: {
        overrides: {'better-tailwindcss/no-conflicting-classes': 0},
        overridesAny: {'no-console': 0},
        settings: DEFAULT_SETTINGS,
      },
    });

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/no-conflicting-classes',
        ),
      ),
    ).toBe(0);

    expect(
      getRuleSeverityFromEslintRuleEntry(
        configResult.getRuleEntry('better-tailwindcss', 'no-console'),
      ),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `better-tailwindcss` eslint config', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {forceSeverity: 'error', settings: DEFAULT_SETTINGS},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('better-tailwindcss'), (ruleName) =>
          ruleName.startsWith('better-tailwindcss/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `better-tailwindcss` eslint config', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {forceSeverity: 'warn', settings: DEFAULT_SETTINGS},
      });

      expect(
        getAllRulesSeverities(configResult.getConfigByUnPostfix('better-tailwindcss'), (ruleName) =>
          ruleName.startsWith('better-tailwindcss/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set plugin settings when betterTailwind is enabled without options', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        configResult.getConfigByUnPostfix('better-tailwindcss')?.settings?.['better-tailwindcss'],
      ).toBeUndefined();
    });

    it('assigns settings to `better-tailwindcss` settings property', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {settings: DEFAULT_SETTINGS},
      });

      expect(
        configResult.getConfigByUnPostfix('better-tailwindcss')?.settings?.['better-tailwindcss'],
      ).toStrictEqual(DEFAULT_SETTINGS);
    });
  });

  describe('option: `classOrder`', () => {
    it('enables `enforce-consistent-class-order` rule with "official" order by default', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-class-order',
        ),
      ).toMatchInlineSnapshot(`[1, {"order": "official"}]`);
    });

    it('enables `enforce-consistent-class-order` rule with custom order when `classOrder` is a string', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {classOrder: 'asc', settings: DEFAULT_SETTINGS},
      });

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-class-order',
        ),
      ).toMatchInlineSnapshot(`[1, {"order": "asc"}]`);
    });

    it('disables `enforce-consistent-class-order` rule when `classOrder` is `false`', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {classOrder: false, settings: DEFAULT_SETTINGS},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-consistent-class-order',
          ),
        ),
      ).toBe(0);
    });
  });

  describe('option: `restrictedClasses`', () => {
    it('disables `no-restricted-classes` rule when `restrictedClasses` is not set (default)', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/no-restricted-classes',
          ),
        ),
      ).toBe(0);
    });

    it('enables `no-restricted-classes` rule with list when `restrictedClasses` is set', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {
          restrictedClasses: ['flex', 'block'],
          settings: DEFAULT_SETTINGS,
        },
      });

      expect(
        configResult.getRuleEntry('better-tailwindcss', 'better-tailwindcss/no-restricted-classes'),
      ).toMatchInlineSnapshot(`[2, {"restrict": ["flex", "block"]}]`);
    });
  });

  describe('option: `breakUpClassesIntoMultipleLines`', () => {
    it('disables `enforce-consistent-line-wrapping` rule when not set (default)', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-consistent-line-wrapping',
          ),
        ),
      ).toBe(0);
    });

    it('enables `enforce-consistent-line-wrapping` rule when `breakUpClassesIntoMultipleLines` is set', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {
          breakUpClassesIntoMultipleLines: {printWidth: 80},
          settings: DEFAULT_SETTINGS,
        },
      });

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-line-wrapping',
        ),
      ).toMatchInlineSnapshot(`[1, {"printWidth": 80}]`);
    });
  });

  describe('option: `cssLinting`', () => {
    it('lints CSS files when css config is enabled (default behavior)', async () => {
      const result = await testEslintConfig(
        {
          css: true,
          betterTailwind: {settings: DEFAULT_SETTINGS},
        },
        FIXTURES.tailwindInCssDuplicateClasses,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.tailwindInCssDuplicateClasses,
        'better-tailwindcss/no-duplicate-classes',
      );

      expect(error?.message).toMatchInlineSnapshot(`"Duplicate classname: "flex"."`);
    });

    it('does not lint CSS files when `cssLinting` is `false` even if css config is enabled', async () => {
      const result = await testEslintConfig(
        {
          css: true,
          betterTailwind: {cssLinting: false, settings: DEFAULT_SETTINGS},
        },
        FIXTURES.tailwindInCssDuplicateClasses,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.tailwindInCssDuplicateClasses,
        'better-tailwindcss/no-duplicate-classes',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('option: `tailwindVersion`', () => {
    it('applies Tailwind v4-specific rules when `tailwindVersion` is 4', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {tailwindVersion: 4, settings: DEFAULT_SETTINGS},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-canonical-classes',
          ),
        ),
      ).toBe(2);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-shorthand-classes',
          ),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-consistent-important-position',
          ),
        ),
      ).toBe(0);
    });

    it('does not apply Tailwind v4-specific rules when `tailwindVersion` is 3', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {tailwindVersion: 3, settings: DEFAULT_SETTINGS},
      });

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-canonical-classes',
          ),
        ),
      ).toBe(0);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-shorthand-classes',
          ),
        ),
      ).toBe(2);

      expect(
        getRuleSeverityFromEslintRuleEntry(
          configResult.getRuleEntry(
            'better-tailwindcss',
            'better-tailwindcss/enforce-consistent-important-position',
          ),
        ),
      ).toBe(2);
    });

    it('warns when `tailwindVersion` is 4 but `settings.entryPoint` is not specified', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({
        betterTailwind: {
          tailwindVersion: 4,
          settings: {tailwindConfig: '/path/to/tailwind.config.js'},
        },
      });

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[betterTailwind] You haven't specified `settings.entryPoint`",
      );
    });

    it('warns when `tailwindVersion` is an unsupported version (below 3)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({
        betterTailwind: {tailwindVersion: 2 as 4, settings: DEFAULT_SETTINGS},
      });

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        'not supported by `eslint-plugin-better-tailwindcss`',
      );
    });

    it('warns when `tailwindVersion` is an unsupported version (above 4)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({
        betterTailwind: {tailwindVersion: 5 as 4, settings: DEFAULT_SETTINGS},
      });

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        'not supported by `eslint-plugin-better-tailwindcss`',
      );
    });
  });
});
