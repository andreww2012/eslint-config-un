// cspell:ignore canonicalurl fetchcontent getentrybyslug
import {ERROR, GLOB_ASTRO, OFF, WARNING} from '../constants';
import type {UnFlatConfigEntryFilesAndIgnores} from '../eslint/eslint-types';
import {generatePackageToLoadProperty, pluginsLoaders} from '../loaders';
import type {OmitStrict, PickKeysNotStartingWith, PickKeysStartingWith, Prettify} from '../types';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  type UnRulesConfigPartial,
  assignDefaults,
} from './index';

export interface AstroEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<
  ExtraPlugins,
  PickKeysNotStartingWith<UnRulesConfigPartial<'astro'>, 'astro/jsx-a11y'>
> {
  /**
   * A11Y (accessibility) specific rules for Astro components.
   * By default, uses `files` and `ignores` from the parent config.
   *
   * Since it uses [`eslint-plugin-jsx-a11y`](https://npmx.dev/eslint-plugin-jsx-a11y)
   * under the hood, this config also accepts the same options as `jsxA11y` config.
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

  /**
   * Set ups `.astro` files parser.
   *
   * 📁 Default `files`: <code>**&#47;*.astro</code>
   */
  configSetup?: UnFlatConfigEntryFilesAndIgnores;
}

const DEFAULT_ASTRO_FILES: string[] = [GLOB_ASTRO];

export default (async (context, optionsRaw) => {
  const eslintPluginAstro = await pluginsLoaders.astro(context).then(({module}) => module);

  const optionsResolved = assignDefaults(optionsRaw, {
    files: DEFAULT_ASTRO_FILES, // Must be assigned to options for `ts` config
    configJsxA11y: true,
  });

  const {
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    configSetup: configSetupOptions = {},
    configJsxA11y,
  } = optionsResolved;

  const configBuilderSetup = context.createConfigBuilder(configSetupOptions, null);

  const isTypescriptEnabled = context.configsMeta.ts.enabled;
  configBuilderSetup?.addConfig(
    [
      'astro/setup',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: DEFAULT_ASTRO_FILES,
        parser: 'astro-eslint-parser',
        // TODO why?
        ignoresInternal: {
          md: false,
        },
      },
    ],
    {
      languageOptions: {
        globals: eslintPluginAstro?.environments.astro.globals,
        parserOptions: {
          ...(isTypescriptEnabled &&
            generatePackageToLoadProperty('parser', 'typescriptEslintParser')),
        },
        sourceType: 'module',
      },
      ...(isTypescriptEnabled &&
        generatePackageToLoadProperty('processor', 'astroClientSideTsProcessor')),
    },
  );

  const configBuilder = context.createConfigBuilder(optionsResolved, 'astro');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'astro',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: DEFAULT_ASTRO_FILES,
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
    .addRule('no-exports-from-components', ERROR) /** @since 1.1.0 */
    .addRule('no-prerender-export-outside-pages', ERROR) /** @since 1.7.0 */
    .addRule('no-unused-define-vars-in-style', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('valid-compile', ERROR) /** @since 0.21.0 */ // 🟢
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

  return {
    configs: [
      configBuilder,
      configBuilderSetup,

      ...(configJsxA11y === false
        ? []
        : await (async () => {
            const {default: jsxA11yUnConfig} = await import('./jsx-a11y');
            const result = jsxA11yUnConfig(context, undefined, {
              prefix: 'astro',
              options: {
                files: parentConfigFiles,
                ignores: parentConfigIgnores,
                ...(typeof configJsxA11y === 'object' && configJsxA11y),
              },
            });
            return result.configs;
          })()),
    ],
    optionsResolved,
  };
}) satisfies UnConfigFn<'astro'> as UnConfigFn<'astro'>;
