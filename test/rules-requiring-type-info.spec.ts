import {GLOB_SVELTE, GLOB_TS_X} from '../src/constants';
import {computeEslintConfig} from './helpers/test-eslint-config';

describe('rules requiring type information', () => {
  describe('`ts/setupTypeAware` config is disabled', () => {
    it('moves rules requiring type info to a separate config and enables a parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {internalOptions: {}});

      const baseConfig = configResult.getConfigByUnPostfix('eslint-plugin');

      expect(baseConfig?.rules).toBeObject();
      expect(baseConfig?.rules).not.toHaveProperty('eslint-plugin/no-property-in-node');

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
      expect(configForTypedRules?.rules).toStrictEqual({
        'eslint-plugin/no-property-in-node': [2],
      });
      expect(configForTypedRules?.languageOptions).toMatchObject({
        parserOptions: {projectService: true},
        parser: {
          meta: {name: 'typescript-eslint/parser'},
          parseForESLint: expect.any(Function) as unknown,
        },
      });
    });

    it("intersects `files` with the original config's `files`", async () => {
      const FILES = ['*.ts'];

      const configResult = await computeEslintConfig(
        {awsCdk: {files: FILES}},
        {internalOptions: {}},
      );

      const configForTypedRules = configResult.getConfigByUnPostfix('aws-cdk/@type-information');

      expect(configForTypedRules?.files).toStrictEqual([[FILES[0], GLOB_TS_X]]);
    });

    it('does not create a separate config if the original config does not have rules requiring type information', async () => {
      const configResult = await computeEslintConfig('js', {internalOptions: {}});

      expect(configResult.getConfigByUnPostfix('js')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('js/@type-information')).toBeUndefined();
    });

    it('creates a separate config for a single rule override', async () => {
      const BASE_FILES = ['**/*.ts'];
      const RULE_OVERRIDE_FILES = ['special/**/*.ts'];

      const configResult = await computeEslintConfig(
        {
          awsCdk: {
            files: BASE_FILES,
            overrides: {'awscdk/no-unused-props': {severity: 2, files: RULE_OVERRIDE_FILES}},
          },
        },
        {internalOptions: {}},
      );

      const ruleOverrideConfig = configResult.getConfigByUnPostfix(
        'aws-cdk/@rule/awscdk/no-unused-props',
      );

      expect(ruleOverrideConfig?.files).toStrictEqual([[BASE_FILES[0], RULE_OVERRIDE_FILES[0]]]);
      expect(ruleOverrideConfig?.rules).toStrictEqual({});

      const ruleOverrideConfigForTypedRules = configResult.getConfigByUnPostfix(
        'aws-cdk/@rule/awscdk/no-unused-props/@type-information',
      );

      expect(ruleOverrideConfigForTypedRules?.files).toStrictEqual([
        [BASE_FILES[0], RULE_OVERRIDE_FILES[0], GLOB_TS_X],
      ]);
      expect(ruleOverrideConfigForTypedRules?.rules).toStrictEqual({'awscdk/no-unused-props': 2});
    });

    it('moves "typed" rules from `overrides` to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {ember: {overrides: {'ember/template-no-deprecated': 1}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ember/@type-information')?.rules).toStrictEqual({
        'ember/template-no-deprecated': 1,
      });
    });

    it('moves "typed" rules from `overridesAny` to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {js: {overridesAny: {'ember/template-no-deprecated': 1}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('js/@type-information')?.rules).toStrictEqual({
        'ember/template-no-deprecated': 1,
      });
    });

    it('does not create a separate config if all rules requiring type information were disabled', async () => {
      const configResult = await computeEslintConfig(
        {ember: {overrides: {'ember/template-no-deprecated': 0}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ember/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `ts/type-aware/rules` config', async () => {
      const configResult = await computeEslintConfig('ts', {internalOptions: {}});

      expect(configResult.getConfigByUnPostfix('ts/type-aware/rules')).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('ts/type-aware/rules/@type-information'),
      ).toBeUndefined();
    });

    it('does not create a separate config for `ts/non-type-aware/rules` config (with `overrides` including "typed" rules)', async () => {
      const configResult = await computeEslintConfig(
        {ts: {overridesAny: {'ts/no-floating-promises': 2}}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('ts/non-type-aware/rules')).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('ts/non-type-aware/rules/@type-information'),
      ).toBeUndefined();
    });

    it('does not create a separate config for `vitest/ts` config', async () => {
      const configResult = await computeEslintConfig(
        {vitest: {configTypescript: true}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('vitest/ts')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('vitest/ts/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `jest/ts` config', async () => {
      const configResult = await computeEslintConfig(
        {jest: {configTypescript: true}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('jest/ts')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('jest/ts/@type-information')).toBeUndefined();
    });

    it('does not create a separate config for `jest/ts` rule override', async () => {
      const configResult = await computeEslintConfig(
        {
          jest: {
            configTypescript: {
              overrides: {
                'jest/no-unnecessary-assertion': {severity: 2, files: ['test/foo/*.spec.ts']},
              },
            },
          },
        },
        {internalOptions: {}},
      );

      expect(
        configResult.getConfigByUnPostfix('jest/ts/@rule/jest/no-unnecessary-assertion'),
      ).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix(
          'jest/ts/@rule/jest/no-unnecessary-assertion/@type-information',
        ),
      ).toBeUndefined();
    });

    it('adds .svelte to `extraFileExtensions` in the extra config if there is a "typed" rule coming from `svelte` plugin and intersects original `files` with ts and svelte files', async () => {
      const FILES = ['foo/**/*.svelte'];

      const configResult = await computeEslintConfig(
        {svelte: {files: FILES}},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('svelte')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix('svelte/@type-information');

      expect(configForTypedRules?.files).toStrictEqual([
        [FILES[0], GLOB_TS_X],
        [FILES[0], GLOB_SVELTE],
      ]);
      expect(configForTypedRules?.languageOptions).toMatchObject({
        parserOptions: {extraFileExtensions: ['.svelte']},
      });
    });

    it('moves `disable-autofix` version of the rule and its base version to a separate config', async () => {
      const configResult = await computeEslintConfig(
        {
          functional: {
            overrides: {'functional/prefer-immutable-types': {severity: 2, disableAutofix: true}},
          },
        },
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('functional')?.rules).not.toHaveProperty(
        'functional/prefer-immutable-types',
      );
      expect(configResult.getConfigByUnPostfix('functional')?.rules).not.toHaveProperty(
        'disable-autofix/functional/prefer-immutable-types',
      );

      expect(
        configResult.getConfigByUnPostfix('functional/@type-information')?.rules,
      ).toMatchObject({
        'functional/prefer-immutable-types': 0,
        'disable-autofix/functional/prefer-immutable-types': 2,
      });
    });
  });

  describe('`ts/setupTypeAware` config is enabled', () => {
    it('creates a separate config with "typed" rules w/o parser', async () => {
      const configResult = await computeEslintConfig(
        {eslintPlugin: true, ts: true},
        {internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules).toBeDefined();
      expect(configForTypedRules?.languageOptions?.['parser']).toBeUndefined();
      expect(configForTypedRules?.languageOptions?.['parserOptions']).toStrictEqual({});
    });
  });

  describe('`ts/setupTypeAware` config is disabled, but `preventCreationOfConfigForRulesWithTypeInformation` is set to `true`', () => {
    it('creates a separate config with "typed" rules w/o parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {preventCreationOfConfigForRulesWithTypeInformation: true},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();

      const configForTypedRules = configResult.getConfigByUnPostfix(
        'eslint-plugin/@type-information',
      );

      expect(configForTypedRules).toBeDefined();
      expect(configForTypedRules?.languageOptions?.['parser']).toBeUndefined();
      expect(configForTypedRules?.languageOptions?.['parserOptions']).toStrictEqual({});
    });
  });

  describe('`ts/setupTypeAware` config is disabled, but `preventCreationOfConfigForRulesWithTypeInformation` is set to `full`', () => {
    it('does not create a separate config with "typed" rules w/o parser', async () => {
      const configResult = await computeEslintConfig('eslintPlugin', {
        un: {preventCreationOfConfigForRulesWithTypeInformation: 'full'},
        internalOptions: {},
      });

      expect(configResult.getConfigByUnPostfix('eslint-plugin')).toBeDefined();

      expect(configResult.getConfigByUnPostfix('eslint-plugin/@type-information')).toBeUndefined();
    });
  });

  describe('`ts/setupTypeAware` config is enabled, but `preventCreationOfConfigForRulesWithTypeInformation` is set to `false`', () => {
    it('creates a separate config with "typed" rules when overall `ts` config is enabled', async () => {
      const configResult = await computeEslintConfig(
        {eslintPlugin: true, ts: true},
        {un: {preventCreationOfConfigForRulesWithTypeInformation: false}, internalOptions: {}},
      );

      expect(configResult.getConfigByUnPostfix('eslint-plugin/@type-information')).toBeDefined();
    });
  });
});
