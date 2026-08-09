/* eslint-disable case-police/string-check */
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';

const FIXTURES = {
  jsxWithImgTag: 'jsx-with-img-tag/jsx-with-img-tag.tsx',
} as const;

describe('basic tests', () => {
  it('creates `nextjs` eslint config and loads `nextjs` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('nextJs');

    const config = configResult.getConfigByUnPostfix('nextjs');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])[jt]s?(x)"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers(['**/*.jsx']);

    expect(configResult.getLoadedPlugin('nextjs')).toBeDefined();
  });

  it('does not create `nextjs` eslint config and does not load `nextjs` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({nextJs: false});

    expect(configResult.getConfigByUnPostfix('nextjs')).toBeUndefined();
    expect(configResult.getLoadedPlugin('nextjs')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `nextjs` eslint config', async () => {
      await expectConfigState({}, 'nextjs', false);
    });

    it('creates `nextjs` eslint config if explicitly enabled', async () => {
      await expectConfigState('nextJs', 'nextjs', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `nextjs` eslint config (no `next` installed)', async () => {
      await expectConfigState({}, 'nextjs', false, 'default');
    });

    it('creates `nextjs` eslint config if explicitly enabled', async () => {
      await expectConfigState('nextJs', 'nextjs', true, 'default');
    });

    it('does not create `nextjs` eslint config but prints a warning if explicitly disabled (already disabled by default)', async () => {
      await expectConfigState({nextJs: false}, 'nextjs', ['nextJs', false], 'default');
    });

    describe('`next` is installed', () => {
      beforeEach(() => {
        addInstalledPackages({next: '15.0.0'});
      });

      it('creates `nextjs` eslint config', async () => {
        await expectConfigState({}, 'nextjs', true, 'default');
      });

      it('creates `nextjs` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('nextJs', 'nextjs', ['nextJs', true], 'default');
      });

      it('does not create `nextjs` eslint config if explicitly disabled', async () => {
        await expectConfigState({nextJs: false}, 'nextjs', false, 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `nextjs` eslint config (not a misc config)', async () => {
      await expectConfigState({}, 'nextjs', false, 'misc-enabled');
    });

    it('creates `nextjs` eslint config if explicitly enabled', async () => {
      await expectConfigState({nextJs: true}, 'nextjs', true, 'misc-enabled');
    });

    it('does not create `nextjs` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({nextJs: false}, 'nextjs', ['nextJs', false], 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('nextJs');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('nextjs')).toMatchObject({
      'nextjs/inline-script-id': 2,
      'nextjs/no-css-tags': 1,
    });
  });

  it('`nextjs/no-img-element` rule fires on a tsx file with an <img> element', async () => {
    const results = await testEslintConfig(
      {
        nextJs: {
          settings: {
            // To prevent warning printed in the console about `pages` directory not found
            rootDir: pathe.join(import.meta.dirname, 'fixtures/jsx-with-img-tag'),
          },
        },
      },
      FIXTURES.jsxWithImgTag,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.jsxWithImgTag,
      'nextjs/no-img-element',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image` or a custom image loader to automatically optimize images. This may incur additional usage or cost from your provider. See: https://nextjs.org/docs/messages/no-img-element"',
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `nextjs` eslint config', async () => {
      const FILES = ['src/**/*.tsx'];

      const configResult = await computeEslintConfig({nextJs: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('nextjs')?.files).toStrictEqual(FILES);
    });

    it('disables `nextjs` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({nextJs: {files: []}});

      expect(configResult.getConfigByUnPostfix('nextjs')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `nextjs` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({nextJs: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('nextjs')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `nextjs` eslint config', async () => {
    const configResult = await computeEslintConfig({
      nextJs: {
        overrides: {'nextjs/inline-script-id': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('nextjs', 'nextjs/inline-script-id')).toBe(0);
    expect(configResult.getRuleEntrySeverity('nextjs', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set `next` settings by default', async () => {
      const configResult = await computeEslintConfig('nextJs');

      expect(configResult.getConfigByUnPostfix('nextjs')?.settings?.['next']).toBeUndefined();
    });

    it('sets `next` settings with `rootDir` as a string when provided', async () => {
      const SETTINGS = {rootDir: '/path/to/app'};

      const configResult = await computeEslintConfig({nextJs: {settings: SETTINGS}});

      expect(configResult.getConfigByUnPostfix('nextjs')?.settings?.['next']).toStrictEqual(
        SETTINGS,
      );
    });
  });
});
