import path from 'node:path';

const FIXTURES = {
  tailwindInJsxDuplicateClasses: 'tailwind-in-jsx-duplicate-classes.jsx',
  tailwindInCssDuplicateClasses: 'tailwind-in-css-duplicate-classes.css',
} as const;

beforeEach(() => {
  addInstalledPackages({tailwindcss: '3.4.17'});
});

const TW3_SETTINGS = {
  tailwindConfig: path.resolve(import.meta.dirname, 'fixtures', 'tailwind.config.js'),
};

const TW4_SETTINGS = {
  entryPoint: path.resolve(import.meta.dirname, 'fixtures', 'tailwind-entry.css'),
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
      await expectConfigState({}, 'better-tailwindcss', false);
    });

    it('creates `better-tailwindcss` eslint config if explicitly enabled', async () => {
      await expectConfigState(
        {betterTailwind: {settings: TW3_SETTINGS}},
        'better-tailwindcss',
        true,
      );
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `better-tailwindcss` eslint config by default (tailwindcss is installed) and warns about missing settings', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[betterTailwind] You haven't specified `settings.tailwindConfig`",
      );
    });

    it('creates `better-tailwindcss` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'betterTailwind',
        'better-tailwindcss',
        ['betterTailwind', true],
        'default',
      );
    });

    it('does not create `better-tailwindcss` eslint config if explicitly disabled', async () => {
      await expectConfigState({betterTailwind: false}, 'better-tailwindcss', false, 'default');
    });

    describe('`tailwindcss` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `better-tailwindcss` eslint config', async () => {
        await expectConfigState({}, 'better-tailwindcss', false, 'default');
      });

      it('creates `better-tailwindcss` eslint config if explicitly enabled', async () => {
        await expectConfigState('betterTailwind', 'better-tailwindcss', true, 'default');
      });

      it('does not create `better-tailwindcss` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState(
          {betterTailwind: false},
          'better-tailwindcss',
          ['betterTailwind', false],
          'default',
        );
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `better-tailwindcss` eslint config and warns about missing settings', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[betterTailwind] You haven't specified `settings.tailwindConfig`",
      );
    });

    it('creates `better-tailwindcss` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState(
        'betterTailwind',
        'better-tailwindcss',
        ['betterTailwind', true],
        'misc-enabled',
      );
    });

    it('does not create `better-tailwindcss` eslint config if explicitly disabled', async () => {
      await expectConfigState({betterTailwind: false}, 'better-tailwindcss', false, 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `better-tailwindcss` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('better-tailwindcss')?.files).toBeUndefined();
  });

  it('has default `ignores` in `better-tailwindcss` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('better-tailwindcss')?.ignores?.length,
    ).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig({betterTailwind: {settings: TW3_SETTINGS}});

  it('enables `better-tailwindcss/no-conflicting-classes` and disables `better-tailwindcss/no-unknown-classes` by default', () => {
    expect(configResult.getRuleSeverities('better-tailwindcss')).toMatchObject({
      'better-tailwindcss/no-conflicting-classes': 2,
      'better-tailwindcss/no-unknown-classes': 0,
    });
  });

  it('`better-tailwindcss/no-duplicate-classes` rule reports duplicate classes in JSX', async () => {
    const result = await testEslintConfig(
      {
        betterTailwind: {
          files: ['**'],
          settings: {
            tailwindConfig: path.resolve(import.meta.dirname, 'fixtures', 'tailwind.config.js'),
          },
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

    expect(error?.message).toMatchInlineSnapshot('"Duplicate classname: "flex"."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `better-tailwindcss` eslint config', async () => {
      const FILES = ['**/*.jsx'];

      const configResult = await computeEslintConfig({
        betterTailwind: {files: FILES, settings: TW3_SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')?.files).toStrictEqual(FILES);
    });

    it('disables `better-tailwindcss` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {files: [], settings: TW3_SETTINGS},
      });

      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `better-tailwindcss` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({
        betterTailwind: {ignores: IGNORES, settings: TW3_SETTINGS},
      });

      const ignores = configResult.getConfigByUnPostfix('better-tailwindcss')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `better-tailwindcss` eslint config', async () => {
    const configResult = await computeEslintConfig({
      betterTailwind: {
        overrides: {'better-tailwindcss/no-conflicting-classes': 0},
        overridesAny: {'no-console': 0},
        settings: TW3_SETTINGS,
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'better-tailwindcss',
        'better-tailwindcss/no-conflicting-classes',
      ),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('better-tailwindcss', 'no-console')).toBe(0);
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
        betterTailwind: {settings: TW3_SETTINGS},
      });

      expect(
        configResult.getConfigByUnPostfix('better-tailwindcss')?.settings?.['better-tailwindcss'],
      ).toStrictEqual(TW3_SETTINGS);
    });

    it('warns when enabled without `settings` (Tailwind 3 needs `tailwindConfig`)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      await computeEslintConfig('betterTailwind');

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[betterTailwind] You haven't specified `settings.tailwindConfig`",
      );
    });

    it('warns when enabled without `settings` (Tailwind 4 needs `entryPoint`)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      await computeEslintConfig({betterTailwind: {tailwindVersion: 4}});

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        "[betterTailwind] You haven't specified `settings.entryPoint`",
      );
    });

    it('does not warn when `settings.tailwindConfig` is provided (Tailwind 3)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      await computeEslintConfig({betterTailwind: {settings: TW3_SETTINGS}});

      expect(stderrSpy.mock.calls).toBeEmpty();
    });

    it('does not warn when `settings.entryPoint` is provided (Tailwind 4)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      await computeEslintConfig({betterTailwind: {tailwindVersion: 4, settings: TW4_SETTINGS}});

      expect(stderrSpy.mock.calls).toBeEmpty();
    });
  });

  describe('option: `classOrder`', () => {
    it('enables `better-tailwindcss/enforce-consistent-class-order` rule with "official" order by default', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-class-order',
        ),
      ).toMatchInlineSnapshot('[1, {"order": "official"}]');
    });

    it('enables `better-tailwindcss/enforce-consistent-class-order` rule with custom order when set to string', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {classOrder: 'asc', settings: TW3_SETTINGS},
      });

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-class-order',
        ),
      ).toMatchInlineSnapshot('[1, {"order": "asc"}]');
    });

    it('disables `better-tailwindcss/enforce-consistent-class-order` rule when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {classOrder: false, settings: TW3_SETTINGS},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-class-order',
        ),
      ).toBe(0);
    });
  });

  describe('option: `restrictedClasses`', () => {
    it('disables `better-tailwindcss/no-restricted-classes` rule by default', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/no-restricted-classes',
        ),
      ).toBe(0);
    });

    it('enables `better-tailwindcss/no-restricted-classes` rule with list when set', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {
          restrictedClasses: ['flex', 'block'],
          settings: TW3_SETTINGS,
        },
      });

      expect(
        configResult.getRuleEntry('better-tailwindcss', 'better-tailwindcss/no-restricted-classes'),
      ).toMatchInlineSnapshot('[2, {"restrict": ["flex", "block"]}]');
    });
  });

  describe('option: `breakUpClassesIntoMultipleLines`', () => {
    it('disables `better-tailwindcss/enforce-consistent-line-wrapping` rule by default', async () => {
      const configResult = await computeEslintConfig('betterTailwind');

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-line-wrapping',
        ),
      ).toBe(0);
    });

    it('enables `better-tailwindcss/enforce-consistent-line-wrapping` rule when set', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {
          breakUpClassesIntoMultipleLines: {printWidth: 80},
          settings: TW3_SETTINGS,
        },
      });

      expect(
        configResult.getRuleEntry(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-line-wrapping',
        ),
      ).toMatchInlineSnapshot('[1, {"printWidth": 80}]');
    });
  });

  describe('option: `cssLinting`', () => {
    it('lints CSS files when css config is enabled by default', async () => {
      const result = await testEslintConfig(
        {
          css: true,
          betterTailwind: {
            settings: {
              tailwindConfig: path.resolve(import.meta.dirname, 'fixtures', 'tailwind.config.js'),
            },
          },
        },
        FIXTURES.tailwindInCssDuplicateClasses,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.tailwindInCssDuplicateClasses,
        'better-tailwindcss/no-duplicate-classes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Duplicate classname: "flex"."');
    });

    it('does not lint CSS files when set to `false` even if css config is enabled', async () => {
      const result = await testEslintConfig(
        {
          css: true,
          betterTailwind: {cssLinting: false, settings: TW3_SETTINGS},
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
    it('uses the detected Tailwind version (`tailwindcss@3` is installed) when option is not set', async () => {
      const configResult = await computeEslintConfig({betterTailwind: {settings: TW3_SETTINGS}});

      expect(configResult.getRuleSeverities('better-tailwindcss')).toMatchObject({
        'better-tailwindcss/enforce-shorthand-classes': 2,
        'better-tailwindcss/enforce-canonical-classes': 0,
      });
    });

    it('applies Tailwind v4-specific rules when set to 4', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {tailwindVersion: 4, settings: TW4_SETTINGS},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-canonical-classes',
        ),
      ).toBe(2);
      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-shorthand-classes',
        ),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-important-position',
        ),
      ).toBe(0);
    });

    it('does not apply Tailwind v4-specific rules when set to 3', async () => {
      const configResult = await computeEslintConfig({
        betterTailwind: {tailwindVersion: 3, settings: TW3_SETTINGS},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-canonical-classes',
        ),
      ).toBe(0);
      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-shorthand-classes',
        ),
      ).toBe(2);
      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss',
          'better-tailwindcss/enforce-consistent-important-position',
        ),
      ).toBe(2);
    });

    it('warns when set to 4 but `settings.entryPoint` is not specified', async () => {
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

    it('warns when set to an unsupported version (below 3)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({
        betterTailwind: {tailwindVersion: 2 as 4, settings: TW3_SETTINGS},
      });

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        'not supported by `eslint-plugin-better-tailwindcss`',
      );
    });

    it('warns when set to an unsupported version (above 4)', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig({
        betterTailwind: {tailwindVersion: 5 as 4, settings: TW3_SETTINGS},
      });

      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        'not supported by `eslint-plugin-better-tailwindcss`',
      );
    });
  });
});
