import path from 'node:path';

const FIXTURES = {
  contradictingClassnames: 'contradicting-classnames.jsx',
} as const;

const CSS_CONFIG_PATH = path.resolve(import.meta.dirname, 'fixtures', 'tailwind.css');

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

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('tailwind')).toMatchObject({
      'tailwindcss/no-contradicting-classname': 2,
      'tailwindcss/classnames-order': 1,
      'tailwindcss/no-custom-classname': 0,
    });
  });

  it('`tailwindcss/no-contradicting-classname` rule fires on a file with contradicting class names', async () => {
    const results = await testEslintConfig(
      {tailwind: {files: ['**'], settings: {cssConfigPath: CSS_CONFIG_PATH}}},
      FIXTURES.contradictingClassnames,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.contradictingClassnames,
      'tailwindcss/no-contradicting-classname',
    );

    expect(error?.message).toMatchInlineSnapshot(`"'flex' conflicts with 'block'"`);
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
      const SETTINGS = {cssConfigPath: 'src/style.css'};

      const configResult = await computeEslintConfig({
        tailwind: {settings: SETTINGS},
      });

      expect(
        configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
      ).toStrictEqual(SETTINGS);
    });

    describe('`functions` setting', () => {
      it('overwrites default `functions` when provided as array', async () => {
        const FUNCTIONS = ['cn', 'clsx'];

        const configResult = await computeEslintConfig({
          tailwind: {settings: {functions: FUNCTIONS}},
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({functions: FUNCTIONS});
      });

      it('derives `functions` from defaults when provided as a function', async () => {
        let finalFunctions: string[] = [];
        const configResult = await computeEslintConfig({
          tailwind: {
            settings: {
              functions: (defaults) => {
                const result = [...defaults, 'cn'];
                finalFunctions = [...result];
                return result;
              },
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({functions: finalFunctions});
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

    describe('`attributes` setting', () => {
      it('overwrites default `attributes` when provided as array', async () => {
        const ATTRIBUTES = ['class', 'className'];

        const configResult = await computeEslintConfig({
          tailwind: {settings: {attributes: ATTRIBUTES}},
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({attributes: ATTRIBUTES});
      });

      it('derives `attributes` from defaults when provided as a function', async () => {
        let finalAttributes: string[] = [];
        const configResult = await computeEslintConfig({
          tailwind: {
            settings: {
              attributes: (defaults) => {
                const result = [...defaults, 'tw'];
                finalAttributes = [...result];
                return result;
              },
            },
          },
        });

        expect(
          configResult.getConfigByUnPostfix('tailwind')?.settings?.['tailwindcss'],
        ).toStrictEqual({attributes: finalAttributes});
      });
    });
  });
});
