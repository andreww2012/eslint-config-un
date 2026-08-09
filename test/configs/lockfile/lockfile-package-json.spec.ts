import {detect as detectPackageManager} from 'package-manager-detector/detect';

const FIXTURES = {
  publishedPackageJson: 'published-package/package.json',
  pnpmPublishedPackageJson: 'pnpm-published-package/package.json',
} as const;

const DETECTED_PACKAGE_MANAGER = {name: 'pnpm', agent: 'pnpm'} as const;

vi.mock(import('package-manager-detector/detect'));

// Set at module load too (not just in `beforeEach`), so the package manager is also detected
// during collection, when the describe-level `computeEslintConfig` calls run.
vi.mocked(detectPackageManager).mockResolvedValue(DETECTED_PACKAGE_MANAGER);

beforeEach(() => {
  vi.mocked(detectPackageManager).mockResolvedValue(DETECTED_PACKAGE_MANAGER);
});

describe('lockfile: sub config `package.json`', () => {
  describe('basic tests', () => {
    it('creates `lockfile/package.json` eslint config by default', async () => {
      const configResult = await computeEslintConfig('lockfile');

      const config = configResult.getConfigByUnPostfix('lockfile/package.json');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/package.json"]');
      expect(config?.ignores?.length).toBeGreaterThan(0);
    });

    it('does not create `lockfile/package.json` eslint config when disabled', async () => {
      const configResult = await computeEslintConfig({lockfile: {configPackageJson: false}});

      expect(configResult.getConfigByUnPostfix('lockfile/package.json')).toBeUndefined();
    });

    it('still creates the main `lockfile` eslint config when sub config is disabled', async () => {
      const configResult = await computeEslintConfig({lockfile: {configPackageJson: false}});

      expect(configResult.getConfigByUnPostfix('lockfile')).toBeDefined();
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('lockfile');

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('lockfile/package.json')).toMatchObject({
        'lockfile/tracked': 2,
        'lockfile/no-weakening-config': 2,
      });
    });

    it('does not add `package.json`-specific rules to the main `lockfile` eslint config', () => {
      expect(configResult.getRuleEntry('lockfile', 'lockfile/tracked')).toBeUndefined();
      expect(configResult.getRuleEntry('lockfile', 'lockfile/no-weakening-config')).toBeUndefined();
    });

    it('`lockfile/tracked` rule fires on a published `package.json` with no lockfile, reporting the detected package manager', async () => {
      const results = await testEslintConfig(
        'lockfile',
        FIXTURES.publishedPackageJson,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.publishedPackageJson,
        'lockfile/tracked',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"No `pnpm` lockfile is present, and `lockfile=false` in `.npmrc` is not set. This looks like a published package, which should not use a lockfile: set `lockfile=false` in `.npmrc`. (Alternatively, to require one for everyone, commit a lockfile.)"',
      );
    });

    it('`lockfile/tracked` rule does not fire when a tracked lockfile for the detected package manager is present', async () => {
      const results = await testEslintConfig(
        'lockfile',
        FIXTURES.pnpmPublishedPackageJson,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.pnpmPublishedPackageJson,
          'lockfile/tracked',
        ),
      ).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `lockfile/package.json` eslint config', async () => {
        const FILES = ['**/foo/package.json'];

        const configResult = await computeEslintConfig({
          lockfile: {configPackageJson: {files: FILES}},
        });

        expect(configResult.getConfigByUnPostfix('lockfile/package.json')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `lockfile/package.json` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({
          lockfile: {configPackageJson: {files: []}},
        });

        expect(configResult.getConfigByUnPostfix('lockfile/package.json')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `lockfile/package.json` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          lockfile: {configPackageJson: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('lockfile/package.json')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `lockfile/package.json` eslint config', async () => {
      const configResult = await computeEslintConfig({
        lockfile: {
          configPackageJson: {overrides: {'lockfile/tracked': 0}, overridesAny: {'no-console': 0}},
        },
      });

      expect(configResult.getRuleSeverities('lockfile/package.json')).toMatchObject({
        'lockfile/tracked': 0,
        'no-console': 0,
      });
    });
  });

  describe('options', () => {
    describe('option: `packageManager`', () => {
      it('uses the detected package manager for `lockfile/tracked` by default', async () => {
        const configResult = await computeEslintConfig('lockfile');

        expect(
          configResult.getRuleEntryOptions('lockfile/package.json', 'lockfile/tracked'),
        ).toStrictEqual([['pnpm']]);
      });

      it('uses the specified package manager for `lockfile/tracked`, overriding the detected one, when set to a string', async () => {
        const PACKAGE_MANAGER = 'npm';

        const configResult = await computeEslintConfig({
          lockfile: {packageManager: PACKAGE_MANAGER},
        });

        expect(
          configResult.getRuleEntryOptions('lockfile/package.json', 'lockfile/tracked'),
        ).toStrictEqual([[PACKAGE_MANAGER]]);
      });

      it('uses the specified package managers for `lockfile/tracked` when set to an array', async () => {
        const PACKAGE_MANAGERS = ['npm', 'yarn'];

        const configResult = await computeEslintConfig({
          lockfile: {packageManager: PACKAGE_MANAGERS},
        });

        expect(
          configResult.getRuleEntryOptions('lockfile/package.json', 'lockfile/tracked'),
        ).toStrictEqual([PACKAGE_MANAGERS]);
      });

      it('disables `lockfile/tracked` when not set and the detected package manager is not supported by the rule', async () => {
        vi.mocked(detectPackageManager).mockResolvedValue({name: 'deno', agent: 'deno'});

        const configResult = await computeEslintConfig('lockfile');

        expect(configResult.getRuleEntrySeverity('lockfile/package.json', 'lockfile/tracked')).toBe(
          0,
        );
      });

      it('disables `lockfile/tracked` when set to an empty array', async () => {
        const configResult = await computeEslintConfig({lockfile: {packageManager: []}});

        expect(configResult.getRuleEntrySeverity('lockfile/package.json', 'lockfile/tracked')).toBe(
          0,
        );
      });
    });
  });
});
