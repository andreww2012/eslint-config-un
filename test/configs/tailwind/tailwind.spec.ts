const FIXTURES = {
  contradictingClassnames: 'contradicting-classnames.jsx',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('tailwind');

  it('loads `tailwindcss` plugin if used', () => {
    expect(configResult.getLoadedPlugin('tailwindcss')).toBeDefined();
  });

  it('creates `tailwind` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tailwind')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `tailwind` eslint config', async () => {
      await expectConfigState({}, 'tailwind', false);
    });

    it('creates `tailwind` eslint config if explicitly enabled', async () => {
      await expectConfigState('tailwind', 'tailwind', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `tailwind` eslint config (disabled by default, superseded by `betterTailwind`)', async () => {
      await expectConfigState({}, 'tailwind', false, 'default');
    });

    it('creates `tailwind` eslint config if explicitly enabled', async () => {
      await expectConfigState('tailwind', 'tailwind', true, 'default');
    });

    it('does not create `tailwind` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({tailwind: false}, 'tailwind', ['tailwind', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `tailwind` eslint config (not a misc config)', async () => {
      await expectConfigState({}, 'tailwind', false, 'misc-enabled');
    });

    it('creates `tailwind` eslint config if explicitly enabled', async () => {
      await expectConfigState({tailwind: true}, 'tailwind', true, 'misc-enabled');
    });

    it('does not create `tailwind` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({tailwind: false}, 'tailwind', ['tailwind', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `tailwind` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tailwind')?.files).toBeUndefined();
  });

  it('has default `ignores` in `tailwind` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('tailwind')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('tailwind');

  it('enables `tailwindcss/no-contradicting-classname` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity('tailwind', 'tailwindcss/no-contradicting-classname'),
    ).toBe(2);
  });

  it('disables `tailwindcss/no-custom-classname` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('tailwind', 'tailwindcss/no-custom-classname')).toBe(
      0,
    );
  });

  it('`tailwindcss/no-contradicting-classname` rule fires on a file with contradicting class names', async () => {
    const results = await testEslintConfig(
      {tailwind: {files: ['**']}},
      FIXTURES.contradictingClassnames,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.contradictingClassnames,
      'tailwindcss/no-contradicting-classname',
    );

    expect(error?.message).toMatchInlineSnapshot('"Classnames flex, block are conflicting!"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `tailwind` eslint config', async () => {
      const FILES = ['src/**/*.jsx'];

      const configResult = await computeEslintConfig({tailwind: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('tailwind')?.files).toStrictEqual(FILES);
    });

    it('disables `tailwind` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({tailwind: {files: []}});

      expect(configResult.getConfigByUnPostfix('tailwind')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `tailwind` eslint config and merges with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({tailwind: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('tailwind')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `tailwind` eslint config', async () => {
    const configResult = await computeEslintConfig({
      tailwind: {
        overrides: {'tailwindcss/no-contradicting-classname': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity('tailwind', 'tailwindcss/no-contradicting-classname'),
    ).toBe(0);
    expect(configResult.getRuleEntrySeverity('tailwind', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `tailwindcss` settings when tailwind is enabled without options', async () => {
      const configResult = await computeEslintConfig('tailwind');

      expect(
        configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
      ).toBeUndefined();
    });

    it('passes plain settings directly to `tailwindcss` settings property', async () => {
      const SETTINGS = {config: 'tailwind.config.js'};

      const configResult = await computeEslintConfig({
        tailwind: {settings: SETTINGS},
      });

      expect(
        configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
      ).toStrictEqual(SETTINGS);
    });

    describe('`callees` setting', () => {
      it('overwrites default `callees` when provided as array', async () => {
        const CALLEES = ['cn', 'clsx'];

        const configResult = await computeEslintConfig({
          tailwind: {settings: {callees: CALLEES}},
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({callees: CALLEES});
      });

      it('derives `callees` from defaults when provided as a function', async () => {
        let finalCallees: string[] = [];
        const configResult = await computeEslintConfig({
          tailwind: {
            settings: {
              callees: (defaults) => {
                const result = [...defaults, 'cn'];
                finalCallees = [...result];
                return result;
              },
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({callees: finalCallees});
      });
    });

    describe('`ignoredKeys` setting', () => {
      it('overwrites default `ignoredKeys` when provided as array', async () => {
        const IGNORED_KEYS = ['customVariants'];

        const configResult = await computeEslintConfig({
          tailwind: {settings: {ignoredKeys: IGNORED_KEYS}},
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({ignoredKeys: IGNORED_KEYS});
      });

      it('derives `ignoredKeys` from defaults when provided as a function', async () => {
        let finalIgnoredKeys: string[] = [];
        const configResult = await computeEslintConfig({
          tailwind: {
            settings: {
              ignoredKeys: (defaults) => {
                const result = [...defaults, 'customVariants'];
                finalIgnoredKeys = [...result];
                return result;
              },
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({ignoredKeys: finalIgnoredKeys});
      });
    });

    describe('`cssFiles` setting', () => {
      it('overwrites default `cssFiles` when provided as array', async () => {
        const CSS_FILES = ['src/**/*.css'];

        const configResult = await computeEslintConfig({
          tailwind: {settings: {cssFiles: CSS_FILES}},
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({cssFiles: CSS_FILES});
      });

      it('derives `cssFiles` from defaults when provided as a function', async () => {
        let finalCssFiles: string[] = [];
        const configResult = await computeEslintConfig({
          tailwind: {
            settings: {
              cssFiles: (defaults) => {
                const result = [...defaults, '!**/temp'];
                finalCssFiles = [...result];
                return result;
              },
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({cssFiles: finalCssFiles});
      });
    });
  });
});
