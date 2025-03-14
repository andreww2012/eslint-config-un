import {fixupRule} from '@eslint/compat';
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
import {ERROR, GLOB_HTML, GLOB_JS_TS_X, OFF, WARNING} from '../constants';
import {
  type AllRulesWithPrefix,
  ConfigEntryBuilder,
  type ConfigSharedOptions,
  type EslintPlugin,
  type FlatConfigEntry,
  type GetRuleOptions,
} from '../eslint';
import type {PrettifyShallow} from '../types';
import {type MaybeArray, getPackageMajorVersion, interopDefault} from '../utils';
import type {InternalConfigOptions} from './index';

// ESLint running in the editor adds `.default` while `tsx` is not
const eslintPluginAngular13 = interopDefault(eslintPluginAngular13Import);
const eslintPluginAngular14 = interopDefault(eslintPluginAngular14Import);
const eslintPluginAngular15 = interopDefault(eslintPluginAngular15Import);

// Please keep ascending order
const SUPPORTED_ANGULAR_VERSIONS = [13, 14, 15, 16, 17, 18, 19] as const;
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const LATEST_SUPPORTED_ANGULAR_VERSION = SUPPORTED_ANGULAR_VERSIONS.at(-1)!;
type SupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[number];

const PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS: Record<
  SupportedAngularVersion,
  {
    plugin: EslintPlugin;
    pluginTemplate: EslintPlugin;
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

const generateMergedAngularPlugins = (installedVersion: SupportedAngularVersion) => {
  const {
    plugin: pluginGeneral,
    pluginTemplate,
    templateParser,
  } = PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[installedVersion];

  type EslintPluginWithRequiredRules = SetRequired<EslintPlugin, 'rules'>;
  const mergedPluginGeneral: EslintPluginWithRequiredRules = {
    ...pluginGeneral,
    rules: {},
  };
  const mergedPluginTemplate: EslintPluginWithRequiredRules = {
    ...pluginTemplate,
    rules: {},
  };

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
          !(
            ruleName in
            (PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[installedVersion][pluginKey].rules || {})
          );
        if (shouldDisableRule) {
          rule.create = () => ({});
        }

        // Before v18 it's using old ESLint properties (https://github.com/angular-eslint/angular-eslint/commit/7c84ab7baca029e2f1231e634bc07704808822c5)
        mergedPlugin.rules[ruleName] = installedVersion < 18 ? fixupRule(rule) : rule;
        const schemas = [...(ruleSchemas.get(ruleName) || []), rule.meta?.schema].filter(
          (v) => v != null && typeof v === 'object',
        );
        if (schemas.length > 0) {
          ruleSchemas.set(ruleName, schemas);
        }
      });
    });
  });

  [mergedPluginGeneral, mergedPluginTemplate].forEach((plugin) => {
    Object.entries(plugin.rules).forEach(([ruleName, rule]) => {
      const schemas = ruleSchemas.get(ruleName) || [];
      if (schemas.length === 0) {
        return;
      }

      (rule.meta ||= {}).schema = {
        anyOf: schemas.map((schema) => {
          if (Array.isArray(schema)) {
            return {type: 'array', minItems: 0, maxItems: schema.length, items: schema};
          }
          return schema;
        }),
      };
    });
  });

  Object.entries(mergedPluginTemplate.processors || {}).forEach(([processorName, processor]) => {
    if (!processor.meta) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      mergedPluginTemplate.processors![processorName]!.meta = klona(
        PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[LATEST_SUPPORTED_ANGULAR_VERSION].pluginTemplate
          .processors?.[processorName]?.meta,
      );
    }
  });

  if (!templateParser.meta) {
    // Required for serialization, missing in old versions: https://github.com/eslint/eslint/blob/83e24f5be4d5723b5f79512b46ab68bc97a23247/messages/config-serialize-function.js#L17
    templateParser.meta = klona({
      ...PACKAGES_FOR_SUPPORTED_ANGULAR_VERSIONS[LATEST_SUPPORTED_ANGULAR_VERSION].templateParser
        .meta,
      version: String(installedVersion),
    });
  }

  return {
    pluginGeneral: mergedPluginGeneral,
    pluginTemplate: mergedPluginTemplate,
    templateParser,
  };
};

export interface AngularEslintConfigOptions
  extends ConfigSharedOptions<
    Omit<
      AllRulesWithPrefix<'@angular-eslint', true>,
      keyof AllRulesWithPrefix<'@angular-eslint/template', true>
    >
  > {
  /**
   * Detected automatically, but can also be specified manually here.
   */
  angularVersion?: SupportedAngularVersion;

  /**
   * Enables or specifies the configuration for the [`@angular-eslint/eslint-plugin-template`](https://www.npmjs.com/package/@angular-eslint/eslint-plugin-template) plugin,
   * which includes template-specific rules.
   * @default true
   */
  configTemplate?:
    | boolean
    | (ConfigSharedOptions<'@angular-eslint/template'> & {
        /**
         * Enable all a11y (accessibility) rules (all are prefixed with `@angular-eslint/template`):
         * - [`alt-text`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/alt-text.md) ([`accessibility-alt-text`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-alt-text.md) before Angular 16)
         * - [`click-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/click-events-have-key-events.md)
         * - [`elements-content`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/elements-content.md) ([`accessibility-elements-content`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-elements-content.md) before Angular 16)
         * - [`interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/interactive-supports-focus.md) ([`accessibility-interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-interactive-supports-focus.md) before Angular 16)
         * - [`label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/label-has-associated-control.md) ([`accessibility-label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-label-has-associated-control.md) before Angular 16)
         * - [`mouse-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/mouse-events-have-key-events.md)
         * - [`no-autofocus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-autofocus.md)
         * - [`no-distracting-elements`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-distracting-elements.md)
         * - [`role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/role-has-required-aria.md) ([`accessibility-role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-role-has-required-aria.md) before Angular 16)
         * - [`table-scope`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/table-scope.md) ([`accessibility-table-scope`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-table-scope.md) before Angular 16)
         * - [`valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/valid-aria.md) ([`accessibility-valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-valid-aria.md) before Angular 16)
         * @default true
         */
        a11yRules?: boolean | 'warn';

        /**
         * Uses [`@angular-eslint/template/prefer-control-flow`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-control-flow.md) rule.
         *
         * Note that this rule is enabled in our config if Angular version is at least 19.
         * @default true <=> Angular version >=19
         * @see https://angular.dev/guide/templates/control-flow
         * @since 17.0.0
         */
        preferControlFlow?: boolean;

        /**
         * Prefer rendering images (`<img>`) with the help of [`NgOptimizedImage`](https://angular.dev/api/common/NgOptimizedImage) directive,
         * i.e. using `ngSrc` attribute instead of `src`.
         *
         * Also see ["Optimizing images"](https://angular.dev/tutorials/learn-angular/11-optimizing-images) lesson.
         *
         * Uses [`@angular-eslint/template/prefer-ngsrc`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-ngsrc.md) rule.
         * @default false
         * @since 16.0.0
         */
        preferNgSrc?: boolean;

        /**
         * Requires [`trackBy` function](https://angular.dev/api/core/TrackByFunction) to be used with [`*ngFor` loops](https://angular.dev/api/common/NgFor).
         *
         * Uses [`@angular-eslint/template/use-track-by-function`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/use-track-by-function.md) rule.
         * @default false
         */
        requireLoopIndexes?: boolean;
      });

  /**
   * Process inline templates in order to lint them.
   * @default true
   */
  processInlineTemplates?: boolean;

  /**
   * Valid class name suffixes for classes decorated with `@Component`.
   * Passing empty array disables the check.
   * @default ['Component']
   * @see [`@angular-eslint/component-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-class-suffix.md)
   */
  componentClassSuffixes?: string[];

  /**
   * Enforces component selector style.
   * Options will be merged with the default value `{type: ['element'], style: 'kebab-case'}`.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/component-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-selector.md)
   */
  componentSelector?:
    | boolean
    | PrettifyShallow<
        Omit<GetRuleOptions<'@angular-eslint/component-selector'>[0] & {}, 'type' | 'prefix'> & {
          type?: MaybeArray<'element' | 'attribute'>;
          prefix?: MaybeArray<string>;
        }
      >;

  /**
   * Ensures consistent usage of `styles`/`styleUrls`/`styleUrl` within `Component` metadata.
   * By default, `string` style is enforced.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/consistent-component-styles`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/consistent-component-styles.md)
   * @since 17.0.0
   */
  componentStylesStyle?: boolean | GetRuleOptions<'@angular-eslint/consistent-component-styles'>;

  /**
   * Valid class name suffixes for classes decorated with `@Directive`.
   * Passing empty array disables the check.
   * @default ['Component']
   * @see [`@angular-eslint/directive-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-class-suffix.md)
   */
  directiveClassSuffixes?: string[];

  /**
   * Enforces directive selector style.
   * Options will be merged with the default value `{type: ['attribute'], style: 'camelCase'}`.
   * Pass `false` to disable the check.
   * @default true
   * @see [`@angular-eslint/directive-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-selector.md)
   */
  directiveSelector?:
    | boolean
    | PrettifyShallow<
        Omit<GetRuleOptions<'@angular-eslint/directive-selector'>[0] & {}, 'type' | 'prefix'> & {
          type?: MaybeArray<'element' | 'attribute'>;
          prefix?: MaybeArray<string>;
        }
      >;

  /**
   * Forbids the use of certain metadata properties. Will be merged with the default value.
   *
   * Uses the following rules:
   * - [`@angular-eslint/no-inputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-inputs-metadata-property.md)
   * - [`@angular-eslint/no-outputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-outputs-metadata-property.md)
   * - [`@angular-eslint/no-queries-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-queries-metadata-property.md)
   * - [`@angular-eslint/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-host-metadata-property.md) (available until Angular 18, deprecated in Angular 18)
   * @default {inputs: true, outputs: true, queries: true}
   */
  forbiddenMetadataProperties?: Partial<Record<'host' | 'inputs' | 'outputs' | 'queries', boolean>>;

  /**
   * Disallow the following prefixes for input bindings, including aliases.
   * @default ['on']
   * @see [`@angular-eslint/no-input-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-input-prefix.md)
   */
  disallowedInputPrefixes?: string[];

  /**
   * @default false
   * @see [`@angular-eslint/no-attribute-decorator`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-attribute-decorator.md)
   */
  disallowAttributeDecorator?: boolean;

  /**
   * @default false
   * @see [`@angular-eslint/no-forward-ref`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-forward-ref.md)
   */
  disallowForwardRef?: boolean;

  /**
   * Enforce specified prefixes for pipes.
   * @default []
   * @see [`@angular-eslint/pipe-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/pipe-prefix.md)
   */
  pipePrefixes?: string[];

  /**
   * Uses [`@angular-eslint/prefer-standalone`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-standalone.md) rule since Angular 17 and uses [`@angular-eslint/prefer-standalone-component`](https://github.com/angular-eslint/angular-eslint/blob/v16.3.1/packages/eslint-plugin/docs/rules/prefer-standalone-component.md) rule for Angular 16.
   * @default true <=> Angular version >=19
   * @since 16.0.0
   */
  preferStandaloneComponents?: boolean;
}

export const angularEslintConfig = (
  options: AngularEslintConfigOptions = {},
  internalOptions: InternalConfigOptions = {},
): {
  configs: FlatConfigEntry[];
  plugins: Record<string, EslintPlugin>;
} => {
  const isAngularManuallyEnabled = internalOptions.globalOptions?.configs?.angular === true;
  const angularVersion: SupportedAngularVersion | null =
    options.angularVersion ??
    (() => {
      const packageInfo = getPackageInfoSync('@angular/core');
      const majorVersion = getPackageMajorVersion(packageInfo);
      if (
        majorVersion != null &&
        majorVersion >= SUPPORTED_ANGULAR_VERSIONS[0] &&
        majorVersion <= LATEST_SUPPORTED_ANGULAR_VERSION
      ) {
        return majorVersion as SupportedAngularVersion;
      }
      return isAngularManuallyEnabled ? LATEST_SUPPORTED_ANGULAR_VERSION : null;
    })();

  if (angularVersion == null) {
    return {
      configs: [],
      plugins: {},
    };
  }

  const {
    pluginGeneral: eslintPluginAngular,
    pluginTemplate: eslintPluginAngularTemplate,
    templateParser: angularTemplateParser,
  } = generateMergedAngularPlugins(angularVersion);

  const {
    configTemplate = true,
    processInlineTemplates = true,
    componentClassSuffixes = ['Component'],
    componentSelector = true,
    componentStylesStyle = true,
    directiveClassSuffixes = ['Directive'],
    directiveSelector = true,
    disallowedInputPrefixes = ['on'],
    disallowAttributeDecorator = false,
    disallowForwardRef = false,
    pipePrefixes,
    preferStandaloneComponents = angularVersion >= 19,
  } = options;

  const forbiddenMetadataProperties: typeof options.forbiddenMetadataProperties = {
    inputs: true,
    outputs: true,
    queries: true,
    ...options.forbiddenMetadataProperties,
  };

  const builderGeneral = new ConfigEntryBuilder('@angular-eslint', options, internalOptions);

  // TODO backport rules?

  // Legend:
  // 🟢 - in Recommended (latest version)
  // ♿ - in Accessibility (latest version)
  // 🌐 - i18n related rules
  // 🔴 - deprecated
  // Check rule usage: https://github.com/search?q=%22%40angular-eslint%2Fno-input-prefix%22+path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F&type=code&p=1

  builderGeneral
    .addConfig(
      [
        'angular/general',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JS_TS_X],
        },
      ],
      {
        // TODO
        // ConfigError: Config "eslint-config-un/angular/general": Key "processor": Expected an object or a string.
        ...(processInlineTemplates && {
          processor: eslintPluginAngularTemplate.processors?.['extract-inline-html'],
        }),
      },
    )
    .addRule('component-class-suffix', componentClassSuffixes.length === 0 ? OFF : ERROR, [
      {
        ...(componentClassSuffixes.length > 0 && {suffixes: componentClassSuffixes}),
      },
    ]) // [all] 🟢
    // .addRule('component-max-inline-declarations', OFF) // [all]
    .addRule('component-selector', componentSelector === false ? OFF : ERROR, [
      {
        type: ['element'],
        style: 'kebab-case',
        ...(typeof componentSelector === 'object' && componentSelector),
      },
    ]) // [all]
    .addRule('consistent-component-styles', componentStylesStyle === false ? OFF : ERROR, [
      typeof componentStylesStyle === 'string' ? componentStylesStyle : 'string',
    ]) // [>=17]
    .addRule('contextual-decorator', ERROR) // [all]
    .addRule('contextual-lifecycle', ERROR) // [all] 🟢
    .addRule('directive-class-suffix', directiveClassSuffixes.length === 0 ? OFF : ERROR, [
      {
        ...(directiveClassSuffixes.length > 0 && {suffixes: directiveClassSuffixes}),
      },
    ]) // [all] 🟢
    .addRule('directive-selector', directiveSelector === false ? OFF : ERROR, [
      {
        type: ['attribute'],
        style: 'camelCase',
        ...(typeof directiveSelector === 'object' && directiveSelector),
      },
    ]) // [all]
    .addRule('no-async-lifecycle-method', ERROR) // [>=17]
    .addRule('no-attribute-decorator', disallowAttributeDecorator ? ERROR : OFF) // [all]
    .addRule('no-conflicting-lifecycle', ERROR) // [all]
    .addRule('no-duplicates-in-metadata-arrays', ERROR) // [>=17]
    .addRule('no-empty-lifecycle-method', ERROR) // [all] 🟢
    .addRule('no-forward-ref', disallowForwardRef ? ERROR : OFF) // [all]
    // See https://github.com/angular/angular/pull/54084, https://angular.dev/guide/components/host-elements
    .addRule('no-host-metadata-property', forbiddenMetadataProperties.host ? ERROR : OFF) // [<=18] 🔴(18)
    .addRule('no-input-prefix', ERROR, [{prefixes: disallowedInputPrefixes}]) // [all]
    .addRule('no-input-rename', ERROR) // [all] 🟢
    .addRule('no-inputs-metadata-property', forbiddenMetadataProperties.inputs ? ERROR : OFF) // [all] 🟢
    .addRule('no-lifecycle-call', ERROR) // [all]
    .addRule('no-output-native', ERROR) // [all] 🟢
    .addRule('no-output-on-prefix', ERROR) // [all] 🟢
    .addRule('no-output-rename', ERROR) // [all] 🟢
    .addRule('no-outputs-metadata-property', forbiddenMetadataProperties.outputs ? ERROR : OFF) // [all] 🟢
    .addRule('no-pipe-impure', ERROR) // [all]
    // https://github.com/angular/angular/blob/12.1.1/packages/core/src/metadata/directives.ts#L221-L258
    .addRule('no-queries-metadata-property', forbiddenMetadataProperties.queries ? ERROR : OFF) // [all]
    .addRule('pipe-prefix', ERROR, [{prefixes: pipePrefixes}]) // [all]
    .addRule('prefer-on-push-component-change-detection', OFF) // [all]
    .addRule('prefer-output-readonly', ERROR) // [all]
    .addRule('prefer-signals', OFF) // [>=19]
    .addRule('prefer-standalone', preferStandaloneComponents && angularVersion >= 17 ? ERROR : OFF) // [>=17] 🟢(>=19)
    .addRule(
      'prefer-standalone-component',
      preferStandaloneComponents && angularVersion < 17 ? ERROR : OFF,
    ) // [>=16<=18] 🔴(>=17)
    .addRule('relative-url-prefix', ERROR) // [all]
    .addRule('require-lifecycle-on-prototype', ERROR) // [>=19]
    .addRule('require-localize-metadata', ERROR) // [>=16] 🌐
    .addRule('runtime-localize', ERROR) // [>=18] 🌐
    .addRule('sort-lifecycle-methods', ERROR) // [>=16]
    .addRule('sort-ngmodule-metadata-arrays', OFF) // [<=18] 🔴(>=17)
    .addRule('use-component-selector', ERROR) // [all]
    .addRule('use-component-view-encapsulation', ERROR) // [all]
    .addRule('use-injectable-provided-in', ERROR) // [all]
    .addRule('use-lifecycle-interface', ERROR) // [all] 🟢(warns)
    .addRule('use-pipe-transform-interface', ERROR) // [all] 🟢
    .addOverrides();

  // TEMPLATE CONFIG

  const configTemplateOptions = typeof configTemplate === 'object' ? configTemplate : {};
  const {
    a11yRules = true,
    preferControlFlow = angularVersion >= 19,
    preferNgSrc = false,
    requireLoopIndexes = false,
  } = configTemplateOptions;

  const a11yRulesSeverity = a11yRules === true ? ERROR : a11yRules === 'warn' ? WARNING : OFF;

  const builderTemplate = new ConfigEntryBuilder(
    '@angular-eslint/template',
    configTemplateOptions,
    internalOptions,
  );

  builderTemplate
    .addConfig(
      [
        'angular/template',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_HTML],
          doNotIgnoreHtml: true,
        },
      ],
      {
        languageOptions: {
          parser: angularTemplateParser,
        },
      },
    )
    .addRule('accessibility-alt-text', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-elements-content', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-interactive-supports-focus', a11yRulesSeverity) // [>=14<=15] ♿
    .addRule('accessibility-label-for', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-label-has-associated-control', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-role-has-required-aria', a11yRulesSeverity) // [>=14<=15] ♿
    .addRule('accessibility-table-scope', a11yRulesSeverity) // [<=15] ♿
    .addRule('accessibility-valid-aria', a11yRulesSeverity) // [<=15] ♿
    .addRule('alt-text', a11yRulesSeverity) // [>=16] ♿
    .addRule('attributes-order', ERROR) /// [>=14]
    .addRule('banana-in-box', ERROR) // [all] 🟢
    .addRule('button-has-type', ERROR) // [all]
    .addRule('click-events-have-key-events', a11yRulesSeverity) // [all] ♿
    .addRule('conditional-complexity', OFF) // [all]
    .addRule('cyclomatic-complexity', OFF) // [all]
    .addRule('elements-content', a11yRulesSeverity) // [>=16] ♿
    .addRule('eqeqeq', ERROR, [{allowNullOrUndefined: true}]) // [all] 🟢
    .addRule('i18n', OFF) // [all]
    .addRule('interactive-supports-focus', a11yRulesSeverity) // [>=16] ♿
    .addRule('label-has-associated-control', a11yRulesSeverity) // [>=16] ♿
    .addRule('mouse-events-have-key-events', a11yRulesSeverity) // [all] ♿
    .addRule('no-any', WARNING) // [all]
    .addRule('no-autofocus', a11yRulesSeverity) // [all] ♿
    .addRule('no-call-expression', OFF) // [all]
    .addRule('no-distracting-elements', a11yRulesSeverity) // [all] ♿
    .addRule('no-duplicate-attributes', ERROR) // [all]
    .addRule('no-inline-styles', OFF) // [>=14]
    .addRule('no-interpolation-in-attributes', ERROR) // [>=15]
    .addRule('no-negated-async', ERROR) // [all] 🟢
    .addRule('no-positive-tabindex', ERROR) // [all]
    .addRule('prefer-control-flow', preferControlFlow ? ERROR : OFF) // [>=17]
    .addRule('prefer-ngsrc', preferNgSrc ? ERROR : OFF) // [>=16]
    .addRule('prefer-self-closing-tags', OFF) // [>=16]
    .addRule('prefer-static-string-properties', ERROR) // [>=19]
    .addRule('role-has-required-aria', a11yRulesSeverity) // [>=16] ♿
    .addRule('table-scope', a11yRulesSeverity) // [>=16] ♿
    .addRule('use-track-by-function', requireLoopIndexes ? ERROR : OFF) // [all]
    .addRule('valid-aria', a11yRulesSeverity) // [>=16] ♿
    .addOverrides();

  return {
    configs: [
      ...builderGeneral.getAllConfigs(),
      ...(configTemplate === false ? [] : builderTemplate.getAllConfigs()),
    ],
    plugins: {
      '@angular-eslint': eslintPluginAngular,
      '@angular-eslint/template': eslintPluginAngularTemplate,
    },
  };
};
