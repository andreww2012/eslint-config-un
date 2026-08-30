// cspell:ignore canonicalurl fetchcontent getentrybyslug
import {ERROR, GLOB_ASTRO, OFF, WARNING} from '../constants';
import {generatePackageToLoadProperty, pluginsLoaders} from '../loaders';
import type {OmitStrict, PickKeysNotStartingWith, PickKeysStartingWith, Prettify} from '../types';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import {resolveFilesOption} from './shared';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [Astro](https://astro.build) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.astro</code>
 */
export interface AstroEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  PickKeysNotStartingWith<UnRulesConfigPartial<'astro'>, 'astro/jsx-a11y'>
> {
  /**
   * A11Y (accessibility) specific rules for Astro components.
   *
   * Since it uses [`eslint-plugin-jsx-a11y`](https://npmx.dev/eslint-plugin-jsx-a11y) under the
   * hood, this config also accepts the same options as `jsxA11y` config.
   *
   * 📁 Default `files` and `ignores`: inherited from the parent config
   * @default true
   */
  configJsxA11y?:
    | boolean
    | Prettify<
        UnFlatConfigEntryBase<
          ExtraPlugins,
          PickKeysStartingWith<UnRulesConfigPartial<'astro'>, 'astro/jsx-a11y'>
        > &
          OmitStrict<JsxA11yEslintConfigOptions, keyof UnFlatConfigEntryBase>
      >;
}

const DEFAULT_ASTRO_FILES: string[] = [GLOB_ASTRO];

export interface AstroConfigResult {
  optionsResolved: AstroEslintConfigOptions;
}

export default defineUnConfig<AstroEslintConfigOptions, [], AstroConfigResult>('astro', {
  enabledBy: {package: 'astro'},
  phase: 'late',
  after: ['ts'],
})(async (context, optionsRaw) => {
  const eslintPluginAstro = await pluginsLoaders.astro(context).then(({module}) => module);

  const optionsResolved = assignDefaults(optionsRaw, {
    configJsxA11y: true,
  });
  // Must be assigned to options for `ts` config
  optionsResolved.files = resolveFilesOption(optionsResolved.files, DEFAULT_ASTRO_FILES);

  const {files: parentConfigFiles, ignores: parentConfigIgnores, configJsxA11y} = optionsResolved;

  const isTypescriptEnabled = context.configsMeta.ts.enabled;

  context.requestParsing('astro', {
    kind: 'setUpOnly',
    languageOptions: {
      globals: eslintPluginAstro?.environments.astro.globals,
      parserOptions: {
        ...(isTypescriptEnabled &&
          generatePackageToLoadProperty('parser', 'typescriptEslintParser')),
      },
      sourceType: 'module',
    },
    ...(isTypescriptEnabled && {
      entryProperties: generatePackageToLoadProperty('processor', 'astroClientSideTsProcessor'),
    }),
  });

  const configBuilder = context.createConfigBuilder(optionsResolved, 'astro');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'astro',
      {
        filesDefault: DEFAULT_ASTRO_FILES,
        parseWith: 'astro',
        // TODO why?
        ignoresInternal: {
          md: false,
        },
      },
    ])
    .markCategory('Possible Errors')
    .addRule('missing-client-only-directive-value', ERROR) /** @since 0.33.0 */ // 🟢
    .addRule('no-conflict-set-directives', ERROR) /** @since 0.7.0 */ // 🟢
    .addRule('no-deprecated-astro-canonicalurl', ERROR) /** @since 0.16.0 */ // 🟢
    .addRule('no-deprecated-astro-fetchcontent', ERROR) /** @since 0.12.0 */ // 🟢
    .addRule('no-deprecated-astro-resolve', ERROR) /** @since 0.12.0 */ // 🟢
    .addRule('no-deprecated-getentrybyslug', ERROR) /** @since 0.28.0 */ // 🟢
    .addRule('no-exports-from-components', ERROR) /** @since 1.1.0 */ // 🟢
    .addRule('no-prerender-export-outside-pages', ERROR) /** @since 1.7.0 */ // 🟢
    .addRule('no-unused-define-vars-in-style', ERROR) /** @since 0.6.0 */ // 🟢
    .markCategory('Security Vulnerability')
    .addRule('no-set-html-directive', ERROR) /** @since 0.2.0 */
    .addRule('no-unsafe-inline-scripts', ERROR) /** @since 1.4.0 */
    .markCategory('Best Practices')
    .addRule('no-set-text-directive', OFF) /** @since 0.2.0 */
    .addRule('no-unused-css-selector', WARNING) /** @since 0.10.0 */
    .markCategory('Stylistic Issues')
    .addRule('prefer-class-list-directive', ERROR) /** @since 0.4.0 */
    .addRule('prefer-object-class-list', ERROR) /** @since 0.4.0 */
    .addRule('prefer-split-class-list', ERROR) /** @since 0.4.0 */
    .addRule('sort-attributes', ERROR) /** @since 1.3.0 */
    .markCategory('Extension Rules')
    .addRule('semi', OFF) /** @since 0.19.0 */
    .enableConfigTesterForPlugin('astro', {
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => ruleName.startsWith('jsx-a11y/'),
    })
    .addOverrides();

  if (configJsxA11y !== false) {
    const {buildJsxA11yConfigs} = await import('./jsx-a11y');
    buildJsxA11yConfigs(context, undefined, {
      prefix: 'astro',
      options: {
        files: parentConfigFiles,
        ignores: parentConfigIgnores,
        ...(typeof configJsxA11y === 'object' && configJsxA11y),
      },
    });
  }

  return {
    optionsResolved,
  };
});
