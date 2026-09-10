import path from 'node:path';
import {GLOB_CSS} from '../../../src/constants';

const FIXTURES = {
  tailwindInCssDuplicateClasses: 'tailwind-in-css-duplicate-classes.css',
} as const;

beforeEach(() => {
  addInstalledPackages({tailwindcss: '3.4.17'});
});

const OPTIONS = {
  un: {
    plugins: {
      'better-tailwindcss': {
        settings: {
          tailwindConfig: path.resolve(import.meta.dirname, 'fixtures', 'tailwind.config.js'),
        },
      },
    },
  },
};

describe('betterTailwind: sub config `css`', () => {
  describe('basic tests', () => {
    it('creates `better-tailwindcss/css` eslint config by default when `css` config is enabled', async () => {
      const configResult = await computeEslintConfig({css: true, betterTailwind: true}, OPTIONS);

      const config = configResult.getConfigByUnPostfix('better-tailwindcss/css');

      expect(config).toBeDefined();
      expect(config?.files).toMatchInlineSnapshot('["**/*.css"]');
      expect(config?.ignores).not.toIncludeAnyMembers([GLOB_CSS]);
    });

    it('does not create `better-tailwindcss/css` eslint config when set to `false`', async () => {
      const configResult = await computeEslintConfig(
        {css: true, betterTailwind: {configCss: false}},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
    });

    it('does not create `better-tailwindcss/css` eslint config when `css` config is disabled', async () => {
      const configResult = await computeEslintConfig('betterTailwind', OPTIONS);

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
    });

    it('does not create `better-tailwindcss/css` eslint config when `css` config lints no files', async () => {
      const configResult = await computeEslintConfig(
        {css: {files: []}, betterTailwind: true},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
    });

    it('does not create `better-tailwindcss/css` eslint config when set to `true` but `css` config lints no files', async () => {
      const configResult = await computeEslintConfig(
        {css: {files: []}, betterTailwind: {configCss: true}},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
    });

    it('does not create `better-tailwindcss/css` eslint config when the parent config is disabled', async () => {
      const configResult = await computeEslintConfig({css: true, betterTailwind: false}, OPTIONS);

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
    });
  });

  describe('interaction with the parent `files` option', () => {
    const FILES = ['**/*.jsx'];

    it('does not create `better-tailwindcss/css` eslint config and warns when parent `files` is specified', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig(
        {css: true, betterTailwind: {files: FILES}},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
      expect(String(stderrSpy.mock.calls[0]?.[0])).toContain(
        '[betterTailwind] CSS files are not linted because you have specified the `files` option',
      );
    });

    it('creates `better-tailwindcss/css` eslint config when parent `files` is specified and set to `true`', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

      const configResult = await computeEslintConfig(
        {css: true, betterTailwind: {configCss: true, files: FILES}},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')?.files).toStrictEqual([
        GLOB_CSS,
      ]);
      expect(stderrSpy.mock.calls).toBeEmpty();
    });

    it('lints only its own `files` when parent `files` is specified', async () => {
      const CSS_FILES = ['packages/app/**/*.css'];

      const configResult = await computeEslintConfig(
        {css: true, betterTailwind: {configCss: {files: CSS_FILES}, files: FILES}},
        OPTIONS,
      );

      expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')?.files).toStrictEqual(
        CSS_FILES,
      );
      expect(configResult.getConfigByUnPostfix('better-tailwindcss')?.files).toStrictEqual(FILES);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig({css: true, betterTailwind: true}, OPTIONS);

    it('correctly sets severities by default', () => {
      expect(configResult.getRuleSeverities('better-tailwindcss/css')).toMatchObject({
        'better-tailwindcss/no-conflicting-classes': 2,
        'better-tailwindcss/enforce-consistent-class-order': 1,
        'better-tailwindcss/no-unknown-classes': 0,
      });
    });

    it('`better-tailwindcss/no-duplicate-classes` rule reports duplicate classes in CSS', async () => {
      const result = await testEslintConfig(
        {css: true, betterTailwind: true},
        FIXTURES.tailwindInCssDuplicateClasses,
        {searchFixturesRelativeToPath: import.meta.dirname, ...OPTIONS},
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.tailwindInCssDuplicateClasses,
        'better-tailwindcss/no-duplicate-classes',
      );

      expect(error?.message).toMatchInlineSnapshot('"Duplicate classname: "flex"."');
    });

    it('does not lint CSS files outside of the user-provided `files`', async () => {
      const result = await testEslintConfig(
        {css: true, betterTailwind: {configCss: {files: ['**/packages/app/**/*.css']}}},
        FIXTURES.tailwindInCssDuplicateClasses,
        {searchFixturesRelativeToPath: import.meta.dirname, ...OPTIONS},
      );

      expect(
        findLintMessageFromLintResults(
          result,
          FIXTURES.tailwindInCssDuplicateClasses,
          'better-tailwindcss/no-duplicate-classes',
        ),
      ).toBeUndefined();
    });

    it('does not lint CSS files when set to `false`', async () => {
      const result = await testEslintConfig(
        {css: true, betterTailwind: {configCss: false}},
        FIXTURES.tailwindInCssDuplicateClasses,
        {searchFixturesRelativeToPath: import.meta.dirname, ...OPTIONS},
      );

      expect(
        findLintMessageFromLintResults(
          result,
          FIXTURES.tailwindInCssDuplicateClasses,
          'better-tailwindcss/no-duplicate-classes',
        ),
      ).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses `files` of the `css` config when option is not set', async () => {
        const CSS_FILES = ['src/**/*.css'];

        const configResult = await computeEslintConfig(
          {css: {files: CSS_FILES}, betterTailwind: true},
          OPTIONS,
        );

        expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')?.files).toStrictEqual(
          CSS_FILES,
        );
      });

      it('uses user-provided `files` in `better-tailwindcss/css` eslint config', async () => {
        const FILES = ['src/**/*.css'];

        const configResult = await computeEslintConfig(
          {css: true, betterTailwind: {configCss: {files: FILES}}},
          OPTIONS,
        );

        expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')?.files).toStrictEqual(
          FILES,
        );
      });

      it('disables `better-tailwindcss/css` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig(
          {css: true, betterTailwind: {configCss: {files: []}}},
          OPTIONS,
        );

        expect(configResult.getConfigByUnPostfix('better-tailwindcss/css')).toBeUndefined();
        expect(configResult.getConfigByUnPostfix('better-tailwindcss')).toBeDefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses `ignores` of the `css` config when option is not set', async () => {
        const CSS_IGNORES = ['**/vendor/**'];

        const configResult = await computeEslintConfig(
          {css: {ignores: CSS_IGNORES}, betterTailwind: true},
          OPTIONS,
        );

        expect(
          configResult.getConfigByUnPostfix('better-tailwindcss/css')?.ignores,
        ).toIncludeAllMembers(CSS_IGNORES);
      });

      it('uses user-provided `ignores` in `better-tailwindcss/css` eslint config and merges them with defaults', async () => {
        const CSS_IGNORES = ['**/vendor/**'];
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig(
          {css: {ignores: CSS_IGNORES}, betterTailwind: {configCss: {ignores: IGNORES}}},
          OPTIONS,
        );

        expect(
          configResult.getConfigByUnPostfix('better-tailwindcss/css')?.ignores,
        ).toIncludeAllMembers([...CSS_IGNORES, ...IGNORES]);
      });
    });

    it('respects `overrides` and `overridesAny` in `better-tailwindcss/css` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {
          css: true,
          betterTailwind: {
            configCss: {
              overrides: {'better-tailwindcss/no-conflicting-classes': 0},
              overridesAny: {'no-console': 0},
            },
          },
        },
        OPTIONS,
      );

      expect(
        configResult.getRuleEntrySeverity(
          'better-tailwindcss/css',
          'better-tailwindcss/no-conflicting-classes',
        ),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('better-tailwindcss/css', 'no-console')).toBe(0);
    });
  });
});
