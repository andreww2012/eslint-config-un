import {ERROR, GLOB_HTML, GLOB_JS_TS_X, OFF, type RuleSeverity, WARNING} from '../constants';
import {generatePackageToLoadProperty, pluginsLoaders} from '../loaders';
import type {NonEmptyTuple, Prettify, Subtract} from '../types';
import type {fetchPackageInfo} from '../utils';
import {
  type ExtraPluginsType,
  type GetRuleNamesInPlugin,
  type GetRuleOptions,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type PartialObjectsOnly<T> = T extends readonly unknown[] ? T : Partial<T>;

// Please keep ascending order
const SUPPORTED_ANGULAR_VERSIONS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22] as const;
type SupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[number];
type LatestSupportedAngularVersion = (typeof SUPPORTED_ANGULAR_VERSIONS)[Subtract<
  (typeof SUPPORTED_ANGULAR_VERSIONS)['length'],
  1
>];
const LATEST_SUPPORTED_ANGULAR_VERSION = SUPPORTED_ANGULAR_VERSIONS.at(
  -1,
) as LatestSupportedAngularVersion;

interface ConfigTemplateSubConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'angular-template'> {
  /**
   * Enables all a11y (accessibility) rules (all are prefixed with `angular-template`):
   * - [`angular-template/alt-text`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/alt-text.md)
   *   ([`angular-template/accessibility-alt-text`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-alt-text.md)
   *   before Angular 16)
   * - [`angular-template/click-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/click-events-have-key-events.md)
   * - [`angular-template/elements-content`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/elements-content.md)
   *   ([`angular-template/accessibility-elements-content`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-elements-content.md)
   *   before Angular 16)
   * - [`angular-template/interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/interactive-supports-focus.md)
   *   ([`angular-template/accessibility-interactive-supports-focus`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-interactive-supports-focus.md)
   *   before Angular 16)
   * - [`angular-template/label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/label-has-associated-control.md)
   *   ([`angular-template/accessibility-label-has-associated-control`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-label-has-associated-control.md)
   *   before Angular 16)
   * - [`angular-template/mouse-events-have-key-events`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/mouse-events-have-key-events.md)
   * - [`angular-template/no-autofocus`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-autofocus.md)
   * - [`angular-template/no-distracting-elements`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/no-distracting-elements.md)
   * - [`angular-template/role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/role-has-required-aria.md)
   *   ([`angular-template/accessibility-role-has-required-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-role-has-required-aria.md)
   *   before Angular 16)
   * - [`angular-template/table-scope`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/table-scope.md)
   *   ([`angular-template/accessibility-table-scope`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-table-scope.md)
   *   before Angular 16)
   * - [`angular-template/valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/valid-aria.md)
   *   ([`angular-template/accessibility-valid-aria`](https://github.com/angular-eslint/angular-eslint/blob/v15.2.1/packages/eslint-plugin-template/docs/rules/accessibility-valid-aria.md)
   *   before Angular 16)
   * @default true
   */
  a11yRules?: boolean | 'warn';

  /**
   * Affected rule:
   * - [`angular-template/prefer-control-flow`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-control-flow.md)
   * @default true <=> Angular version >=19
   * @see https://angular.dev/guide/templates/control-flow
   */
  preferControlFlow?: boolean;

  /**
   * Prefer rendering images (`<img>`) with the help of
   * [`NgOptimizedImage`](https://angular.dev/api/common/NgOptimizedImage) directive, i.e. using
   * `ngSrc` attribute instead of `src`.
   *
   * Also see
   * ["Optimizing images"](https://angular.dev/tutorials/learn-angular/11-optimizing-images) lesson.
   *
   * Affected rule:
   * - [`angular-template/prefer-ngsrc`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/prefer-ngsrc.md)
   * @default false
   */
  preferNgSrc?: boolean;

  /**
   * Requires [`trackBy` function](https://angular.dev/api/core/TrackByFunction) to be used with
   * [`*ngFor` loops](https://angular.dev/api/common/NgFor).
   *
   * Affected rule:
   * - [`angular-template/use-track-by-function`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/use-track-by-function.md)
   * @default false
   */
  requireLoopIndexes?: boolean;
}

/**
 * [Angular](https://angular.dev) specific rules.
 * Supported versions: 13 to 20 (inclusive).
 *
 * You are expected to install `@angular-eslint/eslint-plugin` and
 * `@angular-eslint/eslint-plugin-template` packages of the same major version as your Angular
 * version, but installing a greater version would also likely work.
 *
 * The list of available rules will depend on the installed version of the packages.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface AngularEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'angular'> {
  /**
   * Config with template-specific rules.
   *
   * 📁 Default `files`: <code>**&#47;*.html</code>
   *
   * 🧩 Main plugin: [`@angular-eslint/eslint-plugin-template`](https://npmx.dev/@angular-eslint/eslint-plugin-template)
   * ([docs](https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin-template#readme))
   * @default true
   */
  configTemplate?: boolean | ConfigTemplateSubConfigOptions<ExtraPlugins>;

  /**
   * Detected automatically from a major version of the installed version of `@angular/core`
   * package, but can also be specified manually here.
   *
   * Used to determine which rules will be available based on its availability in the same major
   * version of [`@angular-eslint/eslint-plugin`](https://npmx.dev/@angular-eslint/eslint-plugin)
   * and
   * [`@angular-eslint/eslint-plugin-template`](https://npmx.dev/@angular-eslint/eslint-plugin-template)
   * packages.
   *
   * Unavailable rules can be ported by specifying them in `portRules` option.
   */
  angularVersion?: SupportedAngularVersion;

  /**
   * Process inline templates in order to lint them.
   * @default true
   */
  processInlineTemplates?: boolean;

  /**
   * Valid class name suffixes for classes decorated with `@Component`.
   * Passing empty array disables the check.
   *
   * Affected rule:
   * - [`angular/component-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-class-suffix.md)
   * @default ['Component']
   */
  componentClassSuffixes?: string[];

  /**
   * Enforces component selector style.
   * Options will be merged with the default value `{type: ['element'], style: 'kebab-case'}`.
   * Pass `false` to disable the check.
   *
   * Affected rule:
   * - [`angular/component-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/component-selector.md)
   * @default true
   */
  componentSelector?:
    boolean | Prettify<PartialObjectsOnly<GetRuleOptions<'angular', 'component-selector'>>>;

  /**
   * Ensures consistent usage of `styles`/`styleUrls`/`styleUrl` within `Component` metadata.
   * By default, `string` style is enforced.
   * Pass `false` to disable the check.
   *
   * Affected rule:
   * - [`angular/consistent-component-styles`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/consistent-component-styles.md)
   * @default true
   */
  componentStylesStyle?: boolean | GetRuleOptions<'angular', 'consistent-component-styles'>;

  /**
   * Valid class name suffixes for classes decorated with `@Directive`.
   * Passing empty array disables the check.
   *
   * Affected rule:
   * - [`angular/directive-class-suffix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-class-suffix.md)
   * @default ['Component']
   */
  directiveClassSuffixes?: string[];

  /**
   * Enforces directive selector style.
   * Options will be merged with the default value `{type: ['attribute'], style: 'camelCase'}`.
   * Pass `false` to disable the check.
   *
   * Affected rule:
   * - [`angular/directive-selector`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/directive-selector.md)
   * @default true
   */
  directiveSelector?:
    boolean | Prettify<PartialObjectsOnly<GetRuleOptions<'angular', 'directive-selector'>>>;

  /**
   * Forbids the use of certain metadata properties.
   * Will be merged with the default value.
   *
   * Affected rules:
   * - [`angular/no-host-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/v18.4.3/packages/eslint-plugin/docs/rules/no-host-metadata-property.md)
   * - [`angular/no-inputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-inputs-metadata-property.md)
   * - [`angular/no-outputs-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-outputs-metadata-property.md)
   * - [`angular/no-queries-metadata-property`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-queries-metadata-property.md)
   *   (available until Angular 18, deprecated in Angular 18)
   * @default {inputs: true, outputs: true, queries: true}
   */
  forbiddenMetadataProperties?: Partial<Record<'host' | 'inputs' | 'outputs' | 'queries', boolean>>;

  /**
   * Disallow the following prefixes for input bindings, including aliases.
   *
   * Affected rule:
   * - [`angular/no-input-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-input-prefix.md)
   * @default ['on']
   */
  disallowedInputPrefixes?: string[];

  /**
   * Affected rule:
   * - [`angular/no-attribute-decorator`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-attribute-decorator.md)
   * @default false
   */
  disallowAttributeDecorator?: boolean;

  /**
   * Affected rule:
   * - [`angular/no-forward-ref`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/no-forward-ref.md)
   * @default false
   */
  disallowForwardRef?: boolean;

  /**
   * Enforce specified prefixes for pipes.
   *
   * Affected rule:
   * - [`angular/pipe-prefix`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/pipe-prefix.md)
   * @default []
   */
  pipePrefixes?: string[];

  /**
   * Affected rules:
   * - Since Angular 17:
   *   [`angular/prefer-standalone`](https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/prefer-standalone.md)
   * - For Angular 16:
   *   [`angular/prefer-standalone-component`](https://github.com/angular-eslint/angular-eslint/blob/v16.3.1/packages/eslint-plugin/docs/rules/prefer-standalone-component.md)
   * @default true <=> Angular version >=19
   */
  preferStandaloneComponents?: boolean;
}

export default defineUnConfig<AngularEslintConfigOptions>('angular', {
  enabledBy: {package: '@angular/core'},
  phase: 'late',
  after: ['ts'],
})(async (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {
    configTemplate: true,
    processInlineTemplates: true,
    componentClassSuffixes: ['Component'],
    componentSelector: true,
    componentStylesStyle: true,
    directiveClassSuffixes: ['Directive'],
    directiveSelector: true,
    disallowedInputPrefixes: ['on'],
    disallowAttributeDecorator: false,
    disallowForwardRef: false,
  });

  const angularVersion: SupportedAngularVersion =
    optionsResolved.angularVersion ??
    (() => {
      const majorVersion = context.packagesInfo['@angular/core']?.versions.major;
      if (
        majorVersion != null &&
        majorVersion >= SUPPORTED_ANGULAR_VERSIONS[0] &&
        majorVersion <= LATEST_SUPPORTED_ANGULAR_VERSION
      ) {
        return majorVersion as SupportedAngularVersion;
      }
      return LATEST_SUPPORTED_ANGULAR_VERSION;
    })();

  const {
    configTemplate,
    processInlineTemplates,
    componentClassSuffixes,
    componentSelector,
    componentStylesStyle,
    directiveClassSuffixes,
    directiveSelector,
    disallowedInputPrefixes,
    disallowAttributeDecorator,
    disallowForwardRef,
    pipePrefixes,
  } = optionsResolved;
  optionsResolved.preferStandaloneComponents ??= angularVersion >= 19;
  const {preferStandaloneComponents} = optionsResolved;

  const forbiddenMetadataProperties: typeof optionsResolved.forbiddenMetadataProperties = {
    inputs: true,
    outputs: true,
    queries: true,
    ...optionsResolved.forbiddenMetadataProperties,
  };

  const configBuilderGeneral = context.createConfigBuilder(optionsResolved, 'angular');

  // Legend:
  // 🟢 - in recommended (latest version)
  // ♿ - in accessibility (latest version)
  // 🌐 - i18n related rules
  // 🔴 - deprecated
  // eslint-disable-next-line no-secrets/no-secrets
  // Check rule usage: https://github.com/search?q=%22%40angular-eslint%2Fno-input-prefix%22+path%3A%2F.*eslint%5B%5E%5C%2F%5D*%24%2F&type=code&p=1

  const [angularEslintPlugin, angularTemplateEslintPlugin] = await Promise.all([
    pluginsLoaders.angular(context).then(({module}) => module),
    pluginsLoaders['angular-template'](context).then(({module}) => module),
  ]);

  (
    [
      [context.packagesInfo['@angular-eslint/eslint-plugin'], '@angular-eslint/eslint-plugin'],
      [
        context.packagesInfo['@angular-eslint/eslint-plugin-template'],
        '@angular-eslint/eslint-plugin-template',
      ],
      [context.packagesInfo['@angular-eslint/template-parser'], '@angular-eslint/template-parser'],
    ] satisfies [Awaited<ReturnType<typeof fetchPackageInfo>>, string][]
  ).forEach(([packageInfo, packageName]) => {
    if (packageInfo?.versions.major != null && packageInfo.versions.major !== angularVersion) {
      context.logger.warn(
        `Your \`${packageName}\` major version (${packageInfo.versions.major}) might not be compatible with the configured (or detected) Angular major version (${angularVersion}).`,
      );
    }
  });

  // `|| {}` is unreachable (plugin always loads); start/stop needed to suppress inline branches
  const angularEslintPluginRules = Object.keys(
    /* v8 ignore start */ angularEslintPlugin?.rules || {} /* v8 ignore stop */,
  );

  const getPluginRuleSeverity = <
    RuleName extends GetRuleNamesInPlugin<'angular'>, // prettier-ignore
  >(
    ruleName: RuleName,
    severity: RuleSeverity,
  ) =>
    [
      ruleName satisfies RuleName,
      angularEslintPlugin && !angularEslintPluginRules.includes(ruleName) ? OFF : severity,
    ] satisfies NonEmptyTuple;

  configBuilderGeneral
    ?.addConfig(
      [
        'angular/general',
        {
          filesDefault: [GLOB_JS_TS_X],
        },
      ],
      // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'.
      {
        ...(processInlineTemplates &&
          generatePackageToLoadProperty('processor', 'angularExtractInlineHtmlProcessor')),
      },
    )
    .addRule(
      ...getPluginRuleSeverity(
        'component-class-suffix',
        componentClassSuffixes.length === 0 ? OFF : ERROR,
      ),
      [
        {
          ...(componentClassSuffixes.length > 0 && {suffixes: componentClassSuffixes}),
        },
      ],
    ) /** @since 0.0.1-alpha.12 */
    .addRule(
      ...getPluginRuleSeverity('component-max-inline-declarations', OFF),
    ) /** @since 0.0.1-alpha.19 */
    .addRule(
      ...getPluginRuleSeverity('component-selector', componentSelector === false ? OFF : ERROR),
      [
        Array.isArray(componentSelector)
          ? componentSelector
          : {
              type: ['element'],
              style: 'kebab-case',
              ...(typeof componentSelector === 'object' && componentSelector),
            },
      ],
    ) /** @since 0.0.1-alpha.18 */
    .addRule(...getPluginRuleSeverity('computed-must-return', ERROR)) /** @since 21.3.0 */
    .addRule(
      ...getPluginRuleSeverity(
        'consistent-component-styles',
        componentStylesStyle === false ? OFF : ERROR,
      ),
      [typeof componentStylesStyle === 'string' ? componentStylesStyle : 'string'],
    ) /** @since 17.3.0 */
    .addRule(...getPluginRuleSeverity('contextual-decorator', ERROR)) /** @since 0.8.0-beta.7 */
    .addRule(...getPluginRuleSeverity('contextual-lifecycle', ERROR)) /** @since 0.0.1-alpha.18 */ // 🟢
    .addRule(
      ...getPluginRuleSeverity(
        'directive-class-suffix',
        directiveClassSuffixes.length === 0 ? OFF : ERROR,
      ),
      [
        {
          ...(directiveClassSuffixes.length > 0 && {suffixes: directiveClassSuffixes}),
        },
      ],
    ) /** @since 0.0.1-alpha.23 */
    .addRule(
      ...getPluginRuleSeverity('directive-selector', directiveSelector === false ? OFF : ERROR),
      [
        Array.isArray(directiveSelector)
          ? directiveSelector
          : {
              type: ['attribute'],
              style: 'camelCase',
              ...(typeof directiveSelector === 'object' && directiveSelector),
            },
      ],
    ) /** @since 0.0.1-alpha.18 */
    .addRule(...getPluginRuleSeverity('inject-at-top', ERROR)) /** @since 22.1.0 */
    .addRule(...getPluginRuleSeverity('no-async-lifecycle-method', ERROR)) /** @since 17.2.0 */
    .addRule(
      ...getPluginRuleSeverity('no-attribute-decorator', disallowAttributeDecorator ? ERROR : OFF),
    ) /** @since 0.0.1-alpha.30 */
    .addRule(...getPluginRuleSeverity('no-conflicting-lifecycle', OFF)) /** @since 0.0.1-alpha.19 */ // 🔴(21)
    .addRule(...getPluginRuleSeverity('no-developer-preview', WARNING)) /** @since 20.1.0 */
    .addRule(
      ...getPluginRuleSeverity('no-duplicates-in-metadata-arrays', ERROR),
    ) /** @since 17.4.0 */
    .addRule(
      ...getPluginRuleSeverity('no-empty-lifecycle-method', ERROR),
    ) /** @since 0.1.0-beta.1 */ // 🟢
    .addRule(...getPluginRuleSeverity('no-experimental', WARNING)) /** @since 20.1.0 */
    .addRule(
      ...getPluginRuleSeverity('no-forward-ref', disallowForwardRef ? ERROR : OFF),
    ) /** @since 0.0.1-alpha.23 */
    // See https://github.com/angular/angular/pull/54084, https://angular.dev/guide/components/host-elements
    .addRule(
      ...getPluginRuleSeverity(
        'no-host-metadata-property',
        forbiddenMetadataProperties.host ? ERROR : OFF,
      ),
    ) /** @since 0.0.1-alpha.12 */ /** @until 18 */ // 🔴(18)
    .addRule(
      ...getPluginRuleSeverity('no-implicit-take-until-destroyed', ERROR),
    ) /** @since 21.2.0 */
    .addRule(...getPluginRuleSeverity('no-input-prefix', ERROR), [
      {prefixes: disallowedInputPrefixes},
    ]) /** @since 0.0.1-alpha.23 */
    .addRule(...getPluginRuleSeverity('no-input-rename', ERROR)) /** @since 0.0.1-alpha.23 */ // 🟢
    .addRule(
      ...getPluginRuleSeverity(
        'no-inputs-metadata-property',
        forbiddenMetadataProperties.inputs ? ERROR : OFF,
      ),
    ) /** @since 0.0.1-alpha.12 */ // 🟢
    .addRule(...getPluginRuleSeverity('no-lifecycle-call', ERROR)) /** @since 0.0.1-alpha.18 */
    .addRule(...getPluginRuleSeverity('no-output-native', ERROR)) /** @since 0.0.1-alpha.18 */ // 🟢
    .addRule(...getPluginRuleSeverity('no-output-on-prefix', ERROR)) /** @since 0.0.1-alpha.12 */ // 🟢
    .addRule(...getPluginRuleSeverity('no-output-rename', ERROR)) /** @since 0.0.1-alpha.18 */ // 🟢
    .addRule(
      ...getPluginRuleSeverity(
        'no-outputs-metadata-property',
        forbiddenMetadataProperties.outputs ? ERROR : OFF,
      ),
    ) /** @since 0.0.1-alpha.12 */ // 🟢
    .addRule(...getPluginRuleSeverity('no-pipe-impure', ERROR)) /** @since 0.0.1-alpha.17 */
    // https://github.com/angular/angular/blob/12.1.1/packages/core/src/metadata/directives.ts#L221-L258
    .addRule(
      ...getPluginRuleSeverity(
        'no-queries-metadata-property',
        forbiddenMetadataProperties.queries ? ERROR : OFF,
      ),
    ) /** @since 0.0.1-alpha.12 */
    .addRule(...getPluginRuleSeverity('no-uncalled-signals', ERROR)) /** @since 19.7.0 */
    .addRule(
      ...getPluginRuleSeverity('pipe-prefix', ERROR),
      pipePrefixes?.length ? [{prefixes: pipePrefixes}] : [],
    ) /** @since 0.0.1-alpha.33 */
    .addRule(
      ...getPluginRuleSeverity(
        'prefer-host-metadata-property',
        forbiddenMetadataProperties.host ? OFF : ERROR,
      ),
    ) /** @since 20.5.0 */
    .addRule(...getPluginRuleSeverity('prefer-inject', ERROR)) /** @since 19.6.0 */ // 🟢
    .addRule(
      ...getPluginRuleSeverity('prefer-on-push-component-change-detection', OFF),
    ) /** @since 0.0.1-alpha.17 */
    .addRule(...getPluginRuleSeverity('prefer-output-emitter-ref', ERROR)) /** @since 19.4.0 */
    .addRule(...getPluginRuleSeverity('prefer-output-readonly', ERROR)) /** @since 0.0.1-alpha.19 */
    .addRule(
      ...getPluginRuleSeverity('prefer-service-decorator', angularVersion >= 22 ? ERROR : OFF),
    ) /** @since 22.1.0 */
    .addRule(
      ...getPluginRuleSeverity('prefer-signal-model', angularVersion >= 19 ? ERROR : OFF),
    ) /** @since 21.1.0 */
    .addRule(...getPluginRuleSeverity('prefer-signals', OFF)) /** @since 19.0.0 */
    .addRule(
      ...getPluginRuleSeverity(
        'prefer-standalone',
        preferStandaloneComponents && angularVersion >= 17 ? ERROR : OFF,
      ),
    ) /** @since 17.3.0 */ // 🟢(>=19)
    .addRule(
      ...getPluginRuleSeverity(
        'prefer-standalone-component',
        preferStandaloneComponents && angularVersion < 17 ? ERROR : OFF,
      ),
    ) /** @since 16.1.0 */ /** @until 18 */ // 🔴(>=17)
    .addRule(...getPluginRuleSeverity('relative-url-prefix', ERROR)) /** @since 0.0.1-alpha.23 */
    .addRule(...getPluginRuleSeverity('require-lifecycle-on-prototype', ERROR)) /** @since 19.2.0 */
    .addRule(...getPluginRuleSeverity('require-localize-metadata', ERROR)) /** @since 13.2.0 */ // 🌐
    .addRule(...getPluginRuleSeverity('runtime-localize', ERROR)) /** @since 18.3.0 */
    .addRule(...getPluginRuleSeverity('sort-keys-in-type-decorator', ERROR)) /** @since 19.5.0 */
    .addRule(...getPluginRuleSeverity('sort-lifecycle-methods', ERROR)) /** @since 16.2.0 */
    .addRule(
      ...getPluginRuleSeverity('sort-ngmodule-metadata-arrays', OFF),
    ) /** @since 2.1.0 */ /** @until 18 */ // 🔴(>=17)
    .addRule(...getPluginRuleSeverity('use-component-selector', ERROR)) /** @since 0.0.1-alpha.12 */
    .addRule(
      ...getPluginRuleSeverity('use-component-view-encapsulation', ERROR),
    ) /** @since 0.0.1-alpha.12 */
    .addRule(
      ...getPluginRuleSeverity('use-injectable-provided-in', ERROR),
    ) /** @since 0.0.1-alpha.23 */
    .addRule(
      ...getPluginRuleSeverity('use-lifecycle-interface', ERROR),
    ) /** @since 0.0.1-alpha.12 */ // 🟢(warns)
    .addRule(
      ...getPluginRuleSeverity('use-pipe-transform-interface', ERROR),
    ) /** @since 0.0.1-alpha.12 */ // 🟢
    .enableConfigTesterForPlugin('angular', {includeDeprecated: true})
    .addOverrides();

  // TEMPLATE CONFIG

  // same rationale for ignore comments as above
  const angularTemplateEslintPluginRules = Object.keys(
    /* v8 ignore start */ angularTemplateEslintPlugin?.rules || {} /* v8 ignore stop */,
  );

  const getTemplatePluginRuleSeverity = <RuleName extends GetRuleNamesInPlugin<'angular-template'>>(
    ruleName: RuleName,
    severity: RuleSeverity,
  ) =>
    [
      ruleName satisfies RuleName,
      angularTemplateEslintPlugin && !angularTemplateEslintPluginRules.includes(ruleName)
        ? OFF
        : severity,
    ] satisfies NonEmptyTuple;

  const configTemplateOptions = assignDefaults(configTemplate, {
    a11yRules: true,
    preferControlFlow: angularVersion >= 19,
    preferNgSrc: false,
    requireLoopIndexes: false,
  });
  const {a11yRules, preferControlFlow, preferNgSrc, requireLoopIndexes} = configTemplateOptions;

  const a11yRulesSeverity = a11yRules === true ? ERROR : a11yRules === 'warn' ? WARNING : OFF;

  const configBuilderTemplate = context.createConfigBuilder(configTemplate, 'angular-template');

  configBuilderTemplate
    ?.addConfig([
      'angular/template',
      {
        filesDefault: [GLOB_HTML],
        parseWith: 'angularTemplate',
      },
    ])
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-alt-text', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.7 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-elements-content', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.6 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity(
        'accessibility-interactive-supports-focus',
        a11yRulesSeverity,
      ),
    ) /** @since 14.2.0 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-label-for', a11yRulesSeverity),
    ) /** @since 1.1.0 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity(
        'accessibility-label-has-associated-control',
        a11yRulesSeverity,
      ),
    ) /** @since 4.3.0 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-role-has-required-aria', a11yRulesSeverity),
    ) /** @since 14.2.0 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-table-scope', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.6 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('accessibility-valid-aria', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.6 */ /** @until 15 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('alt-text', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-alt-text */ // ♿
    .addRule(...getTemplatePluginRuleSeverity('attributes-order', ERROR)) /** @since 14.2.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('banana-in-box', ERROR),
    ) /** @since 0.0.1-alpha.12 */ /** @aka banana-in-a-box */ // 🟢
    .addRule(...getTemplatePluginRuleSeverity('button-has-type', ERROR)) /** @since 13.5.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('click-events-have-key-events', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.7 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('conditional-complexity', OFF),
    ) /** @since 0.8.0-beta.6 */
    .addRule(
      ...getTemplatePluginRuleSeverity('cyclomatic-complexity', OFF),
    ) /** @since 0.0.1-alpha.28 */
    .addRule(
      ...getTemplatePluginRuleSeverity('elements-content', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-elements-content */ // ♿
    .addRule(...getTemplatePluginRuleSeverity('eqeqeq', ERROR), [
      {allowNullOrUndefined: true},
    ]) /** @since 12.0.0 */ // 🟢
    .addRule(...getTemplatePluginRuleSeverity('i18n', OFF)) /** @since 0.8.0-beta.6 */
    .addRule(
      ...getTemplatePluginRuleSeverity('interactive-supports-focus', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-interactive-supports-focus */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('label-has-associated-control', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-label-has-associated-control */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('mouse-events-have-key-events', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.6 */ // ♿
    .addRule(...getTemplatePluginRuleSeverity('no-any', WARNING)) /** @since 0.8.0-beta.6 */
    .addRule(
      ...getTemplatePluginRuleSeverity('no-autofocus', a11yRulesSeverity),
    ) /** @since 0.5.0-beta.4 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('no-call-expression', OFF),
    ) /** @since 0.0.1-alpha.30 */
    .addRule(
      ...getTemplatePluginRuleSeverity('no-distracting-elements', a11yRulesSeverity),
    ) /** @since 0.8.0-beta.6 */ // ♿
    .addRule(...getTemplatePluginRuleSeverity('no-duplicate-attributes', ERROR)) /** @since 1.2.0 */
    .addRule(...getTemplatePluginRuleSeverity('no-empty-control-flow', ERROR)) /** @since 20.2.0 */
    .addRule(...getTemplatePluginRuleSeverity('no-inline-styles', OFF)) /** @since 14.3.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('no-interpolation-in-attributes', ERROR),
    ) /** @since 15.2.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('no-negated-async', ERROR),
    ) /** @since 0.0.1-alpha.20 */ // 🟢
    .addRule(...getTemplatePluginRuleSeverity('no-nested-tags', ERROR)) /** @since 19.5.0 */
    .addRule(...getTemplatePluginRuleSeverity('no-non-null-assertion', OFF)) /** @since 21.3.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity(
        'no-outerhtml', // cspell:disable-line
        ERROR,
      ),
    ) /** @since 22.1.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('no-positive-tabindex', ERROR),
    ) /** @since 0.4.0-beta.1 */
    .addRule(...getTemplatePluginRuleSeverity('prefer-at-else', ERROR)) /** @since 20.4.0 */
    .addRule(...getTemplatePluginRuleSeverity('prefer-at-empty', ERROR)) /** @since 19.5.0 */
    .addRule(...getTemplatePluginRuleSeverity('prefer-built-in-pipes', OFF)) /** @since 20.5.0 */
    .addRule(...getTemplatePluginRuleSeverity('prefer-class-binding', ERROR)) /** @since 21.2.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('prefer-contextual-for-variables', ERROR),
    ) /** @since 19.3.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('prefer-control-flow', preferControlFlow ? ERROR : OFF),
    ) /** @since 17.1.0 */ // 🟢
    .addRule(
      ...getTemplatePluginRuleSeverity('prefer-ngsrc', preferNgSrc ? ERROR : OFF),
    ) /** @since 16.2.0 */
    .addRule(...getTemplatePluginRuleSeverity('prefer-self-closing-tags', OFF)) /** @since 16.1.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('prefer-static-string-properties', ERROR),
    ) /** @since 19.1.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('prefer-template-literal', ERROR),
    ) /** @since 19.4.0 */
    .addRule(...getTemplatePluginRuleSeverity('require-switch-default', ERROR)) /** @since 22.1.0 */
    .addRule(
      ...getTemplatePluginRuleSeverity('role-has-required-aria', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-role-has-required-aria */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('table-scope', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-table-scope */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('use-track-by-function', requireLoopIndexes ? ERROR : OFF),
    ) /** @since 0.8.0-beta.5 */ // ♿
    .addRule(
      ...getTemplatePluginRuleSeverity('valid-aria', a11yRulesSeverity),
    ) /** @since 16.0.0-alpha.0 */ /** @aka accessibility-valid-aria */ // ♿
    .enableConfigTesterForPlugin('angular-template', {includeDeprecated: true})
    .addOverrides();

  return {
    configs: [configBuilderGeneral, configBuilderTemplate],
    optionsResolved,
  };
});
