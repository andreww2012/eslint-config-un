import eslintPluginAngularTemplate13 from 'angular-eslint-plugin-template13';
import eslintPluginAngularTemplate14 from 'angular-eslint-plugin-template14';
import eslintPluginAngularTemplate15 from 'angular-eslint-plugin-template15';
import eslintPluginAngularTemplate16 from 'angular-eslint-plugin-template16';
import eslintPluginAngularTemplate17 from 'angular-eslint-plugin-template17';
import eslintPluginAngularTemplate18 from 'angular-eslint-plugin-template18';
import eslintPluginAngularTemplate19 from 'angular-eslint-plugin-template19';
import * as eslintPluginAngular13Import from 'angular-eslint-plugin13';
import * as eslintPluginAngular14Import from 'angular-eslint-plugin14';
import * as eslintPluginAngular15Import from 'angular-eslint-plugin15';
import eslintPluginAngular16 from 'angular-eslint-plugin16';
import eslintPluginAngular17 from 'angular-eslint-plugin17';
import eslintPluginAngular18 from 'angular-eslint-plugin18';
import eslintPluginAngular19 from 'angular-eslint-plugin19';
import angularTemplateParser13 from 'angular-eslint-template-parser13';
import angularTemplateParser14 from 'angular-eslint-template-parser14';
import angularTemplateParser15 from 'angular-eslint-template-parser15';
import angularTemplateParser16 from 'angular-eslint-template-parser16';
import angularTemplateParser17 from 'angular-eslint-template-parser17';
import angularTemplateParser18 from 'angular-eslint-template-parser18';
import angularTemplateParser19 from 'angular-eslint-template-parser19';
import type Eslint from 'eslint';
import {klona} from 'klona';
import {getPackageInfoSync} from 'local-pkg';
import type {SetRequired} from 'type-fest';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import {getPackageMajorVersion, interopDefault} from '../utils';
import type {InternalConfigOptions} from './index';

// ESLint running in the editor adds `.default` while `tsx` is not
const eslintPluginAngular13 = interopDefault(eslintPluginAngular13Import);
const eslintPluginAngular14 = interopDefault(eslintPluginAngular14Import);
const eslintPluginAngular15 = interopDefault(eslintPluginAngular15Import);

// Please keep ascending order
const SUPPORTED_ANGULAR_VERSIONS = [13, 14, 15, 16, 17, 18, 19] as const;
type SupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[number];

const PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS: Record<
  SupportedAngularVersion,
  {
    plugin: Eslint.ESLint.Plugin;
    pluginTemplate: Eslint.ESLint.Plugin;
    templateParser: Eslint.Linter.Parser;
  }
> = {
  13: {
    plugin: eslintPluginAngular13,
    pluginTemplate: eslintPluginAngularTemplate13,
    templateParser: angularTemplateParser13,
  },
  14: {
    plugin: eslintPluginAngular14,
    pluginTemplate: eslintPluginAngularTemplate14,
    templateParser: angularTemplateParser14,
  },
  15: {
    plugin: eslintPluginAngular15,
    pluginTemplate: eslintPluginAngularTemplate15,
    templateParser: angularTemplateParser15,
  },
  16: {
    // @ts-expect-error types mismatch
    plugin: eslintPluginAngular16,
    // @ts-expect-error types mismatch
    pluginTemplate: eslintPluginAngularTemplate16,
    templateParser: angularTemplateParser16,
  },
  17: {
    // @ts-expect-error types mismatch
    plugin: eslintPluginAngular17,
    // @ts-expect-error types mismatch
    pluginTemplate: eslintPluginAngularTemplate17,
    templateParser: angularTemplateParser17,
  },
  18: {
    // @ts-expect-error types mismatch
    plugin: eslintPluginAngular18,
    // @ts-expect-error types mismatch
    pluginTemplate: eslintPluginAngularTemplate18,
    templateParser: angularTemplateParser18,
  },
  19: {
    // @ts-expect-error types mismatch
    plugin: eslintPluginAngular19,
    // @ts-expect-error types mismatch
    pluginTemplate: eslintPluginAngularTemplate19,
    templateParser: angularTemplateParser19,
  },
};

const generateMergedAngularPlugins = (installedVersion: SupportedAngularVersion | null) => {
  type EslintPluginWithRequiredRules = SetRequired<Eslint.ESLint.Plugin, 'rules'>;
  const mergedPluginGeneral: EslintPluginWithRequiredRules = {rules: {}};
  const mergedPluginTemplate: EslintPluginWithRequiredRules = {rules: {}};

  const ruleSchemas = new Map<string, object[]>();

  SUPPORTED_ANGULAR_VERSIONS.forEach((angularVersion) => {
    (
      [
        ['plugin', mergedPluginGeneral],
        ['pluginTemplate', mergedPluginTemplate],
      ] as const
    ).forEach(([pluginKey, mergedPlugin]) => {
      const originalPlugin = PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[angularVersion][pluginKey];

      Object.entries(klona(originalPlugin.rules || {})).forEach(([ruleName, rule]) => {
        const shouldDisableRule =
          angularVersion !== installedVersion &&
          // eslint-disable-next-line de-morgan/no-negated-conjunction
          !(
            installedVersion != null &&
            ruleName in
              (PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[installedVersion][pluginKey].rules || {})
          );
        if (shouldDisableRule) {
          rule.create = () => ({});
        }

        mergedPlugin.rules[ruleName] = rule;
        const schemas = [...(ruleSchemas.get(ruleName) || []), rule.meta?.schema].filter(
          (v) => v != null && typeof v === 'object',
        );
        if (schemas.length > 0) {
          ruleSchemas.set(ruleName, schemas);
          (rule.meta ||= {}).schema = {oneOf: schemas};
        }
      });
    });
  });

  return {
    pluginGeneral: mergedPluginGeneral,
    pluginTemplate: mergedPluginTemplate,
    templateParser:
      installedVersion == null
        ? null
        : PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[installedVersion].templateParser,
  };
};

export interface AngularEslintConfigOptions extends ConfigSharedOptions<'angular'> {
  /**
   * Detected automatically, but can also be specified manually here.
   */
  angularVersion?: SupportedAngularVersion;
}

export const angularEslintConfig = (
  options: AngularEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): FlatConfigEntry[] => {
  const isAngularManuallyEnabled = internalOptions.globalOptions?.configs?.angular === true;
  const {angularVersion: angularVersionFromOptions} = options;

  const angularVersion: SupportedAngularVersion | null =
    angularVersionFromOptions ??
    (() => {
      const packageInfo = getPackageInfoSync('@angular/core');
      const majorVersion = getPackageMajorVersion(packageInfo);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const lastSupportedVersion = SUPPORTED_ANGULAR_VERSIONS.at(-1)!;
      if (
        majorVersion != null &&
        majorVersion >= SUPPORTED_ANGULAR_VERSIONS[0] &&
        majorVersion <= lastSupportedVersion
      ) {
        return majorVersion as SupportedAngularVersion;
      }
      return isAngularManuallyEnabled ? lastSupportedVersion : null;
    })();

  const {
    pluginGeneral: eslintPluginAngular,
    pluginTemplate: eslintPluginAngularTemplate,
    templateParser: angularTemplateParser,
  } = generateMergedAngularPlugins(angularVersion);

  const builderSetup = new ConfigEntryBuilder('@angular-eslint', options, internalOptions);

  builderSetup.addConfig('angular/setup', {
    plugins: {
      '@angular-eslint': eslintPluginAngular,
      '@angular-eslint/template': eslintPluginAngularTemplate,
    },
  });

  if (angularVersion == null) {
    return builderSetup.getAllConfigs();
  }

  const builderGeneral = new ConfigEntryBuilder('@angular-eslint', options, internalOptions);

  builderGeneral
    .addConfig(['angular/general', {includeDefaultFilesAndIgnores: true}], {})
    // .addRule('', ERROR)
    .addOverrides();

  const builderTemplate = new ConfigEntryBuilder(
    '@angular-eslint/template',
    options,
    internalOptions,
  );

  builderTemplate
    .addConfig(['angular/template', {includeDefaultFilesAndIgnores: true}], {
      languageOptions: {
        // @ts-expect-error types mismatch
        parser: angularTemplateParser,
      },
    })
    // .addRule('', ERROR)
    .addOverrides();

  return [
    ...builderSetup.getAllConfigs(),
    ...builderGeneral.getAllConfigs(),
    ...builderTemplate.getAllConfigs(),
  ];
};
