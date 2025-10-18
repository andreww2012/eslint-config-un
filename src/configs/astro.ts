// cspell:ignore canonicalurl fetchcontent getentrybyslug
import {ERROR, GLOB_ASTRO, OFF, WARNING} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {pluginsLoaders} from '../plugins';
import type {PickKeysNotStartingWith, PickKeysStartingWith} from '../types';
import {assignDefaults, interopDefault} from '../utils';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {UnConfigFn} from './index';

export interface AstroEslintConfigOptions
  extends UnConfigOptions<PickKeysNotStartingWith<RulesRecordPartial<'astro'>, 'astro/jsx-a11y'>> {
  /**
   * A11Y (accessibility) specific rules for Astro components.
   * By default, uses `files` and `ignores` from the parent config.
   *
   * Since it uses [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y)
   * under the hood, this config also accepts the same options as `jsxA11y` config.
   * @default true
   */
  configJsxA11y?:
    | boolean
    | UnConfigOptions<
        PickKeysStartingWith<RulesRecordPartial<'astro'>, 'astro/jsx-a11y'>,
        Omit<JsxA11yEslintConfigOptions, 'settings' | keyof UnConfigOptions>
      >;
}

const DEFAULT_ASTRO_FILES: string[] = [GLOB_ASTRO];

export const astroUnConfig: UnConfigFn<'astro'> = async (context) => {
  const [eslintPluginAstro, {parser: typescriptEslintParser}] = await Promise.all([
    pluginsLoaders.astro(context).then(({module}) => module),
    interopDefault(import('typescript-eslint')),
  ]);

  context.usedPlugins.add('astro');
  if (!eslintPluginAstro) {
    return null;
  }

  const optionsRaw = context.rootOptions.configs?.astro;
  const optionsResolved = assignDefaults(optionsRaw, {
    files: DEFAULT_ASTRO_FILES,
    configJsxA11y: true,
  } satisfies AstroEslintConfigOptions);

  const {files: parentConfigFiles, ignores: parentConfigIgnores, configJsxA11y} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'astro');

  const isTypescriptEnabled = context.configsMeta.ts.enabled;
  configBuilder?.addConfig(
    [
      'astro/setup',
      {
        filesFallback: [...DEFAULT_ASTRO_FILES, ...parentConfigFiles],
        doNotIgnoreMarkdown: true,
        parser: 'astro-eslint-parser',
      },
    ],
    {
      languageOptions: {
        globals: eslintPluginAstro.environments.astro.globals,
        parserOptions: {
          parser: isTypescriptEnabled ? typescriptEslintParser : undefined,
        },
        sourceType: 'module',
      },
      ...(isTypescriptEnabled && {
        processor: eslintPluginAstro.processors['client-side-ts'],
      }),
    },
  );

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'astro',
      {
        doNotIgnoreMarkdown: true,
        includeDefaultFilesAndIgnores: true,
        filesFallback: DEFAULT_ASTRO_FILES,
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
    .addRule('no-unused-define-vars-in-style', ERROR) /** @since 0.6.0 */ // 🟢
    .addRule('valid-compile', ERROR) /** @since 0.21.0 */ // 🟢
    .markCategory('Security Vulnerability')
    .addRule('no-set-html-directive', ERROR) /** @since 0.2.0 */
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
      rulesToSkipInConfig: (ruleName) => ruleName.startsWith('jsx-a11y/'),
    })
    .addOverrides();

  return {
    configs: [
      configBuilder,
      ...(configJsxA11y === false
        ? []
        : await (async () => {
            const {jsxA11yUnConfig} = await import('./jsx-a11y');
            const result = await jsxA11yUnConfig(context, {
              prefix: 'astro',
              options: {
                files: parentConfigFiles,
                ignores: parentConfigIgnores,
                ...(typeof configJsxA11y === 'object' && configJsxA11y),
              },
            });
            return result?.configs || [];
          })()),
    ],
    optionsResolved,
  };
};
