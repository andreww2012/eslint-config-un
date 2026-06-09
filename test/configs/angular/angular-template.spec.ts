import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  twoWayBindingWrong: 'angular-2way-binding-wrong.html',
  twoWayBindingCorrect: 'angular-2way-binding-correct.html',
} as const;

beforeEach(() => {
  addInstalledPackages({'@angular/core': '19.0.0'});
});

describe('angular: sub config `template`', () => {
  describe('basic tests', async () => {
    const configResult = await computeEslintConfig('angular');

    it('creates `angular/template` eslint config by default', () => {
      expect(configResult.getConfigByUnPostfix('angular/template')).toBeDefined();
    });

    it('does not create `angular/template` eslint config when set to `false`', async () => {
      const noTemplateConfigResult = await computeEslintConfig({angular: {configTemplate: false}});

      expect(noTemplateConfigResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
    });

    it('creates `angular/template` eslint config when set to `true`', async () => {
      const explicitConfigResult = await computeEslintConfig({angular: {configTemplate: true}});

      expect(explicitConfigResult.getConfigByUnPostfix('angular/template')).toBeDefined();
    });

    it('has default `files` in `angular/template` eslint config', () => {
      expect(configResult.getConfigByUnPostfix('angular/template')?.files).toMatchInlineSnapshot(
        '["**/*.html"]',
      );
    });

    it('has default `ignores` in `angular/template` eslint config', () => {
      const ignores = configResult.getConfigByUnPostfix('angular/template')?.ignores;

      expect(ignores?.length).toBeGreaterThan(0);
      expect(ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
    });
  });

  describe('rules', async () => {
    const configResult = await computeEslintConfig('angular');

    it('enables `angular-template/banana-in-box` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity('angular/template', 'angular-template/banana-in-box'),
      ).toBe(2);
    });

    it('disables `angular-template/no-call-expression` rule by default', () => {
      expect(
        configResult.getRuleEntrySeverity(
          'angular/template',
          'angular-template/no-call-expression',
        ),
      ).toBe(0);
    });

    it('triggers `angular-template/banana-in-box` on wrong two-way binding syntax', async () => {
      const result = await testEslintConfig(
        'angular',
        FIXTURES.twoWayBindingWrong,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.twoWayBindingWrong,
        'angular-template/banana-in-box',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Invalid binding syntax. Use [(expr)] instead"',
      );
    });

    it('does not trigger `angular-template/banana-in-box` on correct two-way binding syntax', async () => {
      const result = await testEslintConfig(
        'angular',
        FIXTURES.twoWayBindingCorrect,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        result,
        FIXTURES.twoWayBindingCorrect,
        'angular-template/banana-in-box',
      );

      expect(error).toBeUndefined();
    });
  });

  describe('un options', () => {
    describe('option: `files`', () => {
      it('uses user-provided `files` in `angular/template` eslint config', async () => {
        const FILES = ['src/**/*.html'];

        const configResult = await computeEslintConfig({angular: {configTemplate: {files: FILES}}});

        expect(configResult.getConfigByUnPostfix('angular/template')?.files).toStrictEqual(FILES);
      });

      it('disables `angular/template` eslint config when set to empty array', async () => {
        const configResult = await computeEslintConfig({angular: {configTemplate: {files: []}}});

        expect(configResult.getConfigByUnPostfix('angular/template')).toBeUndefined();
      });
    });

    describe('option: `ignores`', () => {
      it('uses user-provided `ignores` in `angular/template` eslint config and merges them with defaults', async () => {
        const IGNORES = ['**/fixtures/**'];

        const configResult = await computeEslintConfig({
          angular: {configTemplate: {ignores: IGNORES}},
        });

        const ignores = configResult.getConfigByUnPostfix('angular/template')?.ignores;

        expect(ignores).toIncludeAllMembers(IGNORES);
        expect(ignores?.length).toBeGreaterThan(IGNORES.length);
      });
    });

    it('respects `overrides` and `overridesAny` in `angular/template` eslint config', async () => {
      const configResult = await computeEslintConfig({
        angular: {
          configTemplate: {
            overrides: {'angular-template/banana-in-box': 0},
            overridesAny: {'no-console': 0},
          },
        },
      });

      expect(
        configResult.getRuleEntrySeverity('angular/template', 'angular-template/banana-in-box'),
      ).toBe(0);
      expect(configResult.getRuleEntrySeverity('angular/template', 'no-console')).toBe(0);
    });
  });

  describe('options', () => {
    describe('option: `a11yRules`', () => {
      it('enables a11y rules at error severity by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/alt-text'),
        ).toBe(2);
      });

      it('enables a11y rules at error severity when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {a11yRules: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/alt-text'),
        ).toBe(2);
      });

      it('enables a11y rules at warning severity when set to `"warn"`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {a11yRules: 'warn'}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/alt-text'),
        ).toBe(1);
      });

      it('disables a11y rules when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {a11yRules: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/alt-text'),
        ).toBe(0);
      });
    });

    describe('option: `preferControlFlow`', () => {
      it('enables `angular-template/prefer-control-flow` rule by default (Angular 19, default `true`)', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/prefer-control-flow',
          ),
        ).toBe(2);
      });

      it('enables `angular-template/prefer-control-flow` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {preferControlFlow: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/prefer-control-flow',
          ),
        ).toBe(2);
      });

      it('disables `angular-template/prefer-control-flow` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {preferControlFlow: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/prefer-control-flow',
          ),
        ).toBe(0);
      });
    });

    describe('option: `preferNgSrc`', () => {
      it('disables `angular-template/prefer-ngsrc` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/prefer-ngsrc'),
        ).toBe(0);
      });

      it('enables `angular-template/prefer-ngsrc` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {preferNgSrc: true}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/prefer-ngsrc'),
        ).toBe(2);
      });

      it('disables `angular-template/prefer-ngsrc` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {preferNgSrc: false}},
        });

        expect(
          configResult.getRuleEntrySeverity('angular/template', 'angular-template/prefer-ngsrc'),
        ).toBe(0);
      });
    });

    describe('option: `requireLoopIndexes`', () => {
      it('disables `angular-template/use-track-by-function` rule by default', async () => {
        const configResult = await computeEslintConfig('angular');

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/use-track-by-function',
          ),
        ).toBe(0);
      });

      it('enables `angular-template/use-track-by-function` rule when set to `true`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {requireLoopIndexes: true}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/use-track-by-function',
          ),
        ).toBe(2);
      });

      it('disables `angular-template/use-track-by-function` rule when set to `false`', async () => {
        const configResult = await computeEslintConfig({
          angular: {configTemplate: {requireLoopIndexes: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'angular/template',
            'angular-template/use-track-by-function',
          ),
        ).toBe(0);
      });
    });
  });
});
