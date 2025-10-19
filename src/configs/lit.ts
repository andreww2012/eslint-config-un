// cspell:ignore classfield
import {ERROR, OFF} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {UnConfigFn} from './index';

export interface LitEslintConfigOptions extends UnConfigOptions<'lit'> {
  /**
   * [`eslint-plugin-lit`](https://npmjs.com/eslint-plugin-lit) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `lit` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Instructs rules to recognize the following classes as sub-classes of `LitElement`
     */
    elementBaseClasses?: string[];
  };

  /**
   * A11Y (accessibility) specific rules for Lit components.
   * By default, uses `files` and `ignores` from the parent config.
   *
   * Since most of the rules are ported from
   * [`eslint-plugin-jsx-a11y`](https://npmjs.com/eslint-plugin-jsx-a11y),
   * this config also accepts the same options as `jsxA11y` config.
   * @default true
   */
  configA11y?:
    | boolean
    | UnConfigOptions<
        RulesRecordPartial<'lit-a11y'>,
        {
          /**
           * [`eslint-plugin-lit-a11y`](https://npmjs.com/eslint-plugin-lit-a11y) plugin
           * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
           * that will be assigned to `settings` object as-is and applied to the specified `files` and `ignores`.
           */
          settings?: {
            /**
             * Set to `true` to make sure only [`lit-html`](https://npmjs.com/lit-html)
             * tagged template literals are linted.
             *
             * If you're importing `lit-html` from a package that re-exports `lit-html`,
             * like for example `@apollo-elements/lit-apollo`, you can specify
             * `@apollo-elements/lit-apollo` here.
             */
            litHtmlSources?: boolean | string[];
          };
        } & Omit<
          JsxA11yEslintConfigOptions,
          | 'settings'
          | keyof UnConfigOptions
          | 'ambiguousWordsForAnchorText'
          | 'customComponents'
          | 'labelAttributes'
          | 'tabbableRoles'
        > & {
            customComponents?: Pick<
              JsxA11yEslintConfigOptions['customComponents'] & {},
              | 'areaElements'
              | 'headings'
              | 'imgElements'
              | 'inputTypeImageElements'
              | 'inputs'
              | 'links'
              | 'objectElements'
            >;
          }
      >;
}

export const litUnConfig: UnConfigFn<'lit'> = async (context) => {
  const optionsRaw = context.rootOptions.configs?.lit;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies LitEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'lit');

  const {
    settings: pluginSettings,
    files: parentConfigFiles,
    ignores: parentConfigIgnores,
    configA11y,
  } = optionsResolved;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['lit', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          lit: pluginSettings,
        },
      }),
    })
    .addRule('attribute-names', ERROR, [{convention: 'kebab'}])
    .addRule('attribute-value-entities', ERROR)
    .addRule('ban-attributes', OFF)
    .addRule('binding-positions', ERROR)
    .addRule('lifecycle-super', ERROR)
    .addRule('no-classfield-shadowing', ERROR)
    .addRule('no-duplicate-template-bindings', ERROR)
    .addRule('no-invalid-escape-sequences', ERROR)
    .addRule('no-invalid-html', ERROR)
    .addRule('no-legacy-imports', ERROR)
    .addRule('no-legacy-template-syntax', ERROR)
    .addRule('no-native-attributes', ERROR)
    .addRule('no-private-properties', ERROR)
    .addRule('no-property-change-update', ERROR)
    .addRule('no-template-arrow', ERROR)
    .addRule('no-template-bind', ERROR)
    .addRule('no-template-map', OFF)
    .addRule('no-this-assign-in-render', ERROR)
    .addRule('no-useless-template-literals', ERROR)
    .addRule('no-value-attribute', ERROR)
    .addRule('prefer-nothing', ERROR)
    .addRule('prefer-static-styles', ERROR)
    .addRule('quoted-expressions', ERROR, ['never'])
    .addRule('value-after-constraints', ERROR)
    .enableConfigTesterForPlugin('lit')
    .addOverrides();

  return {
    configs: [
      configBuilder,
      ...(configA11y === false
        ? []
        : await (async () => {
            const {jsxA11yUnConfig} = await import('./jsx-a11y');
            const options = typeof configA11y === 'object' ? configA11y : {};
            const result = await jsxA11yUnConfig(context, {
              prefix: 'lit',
              options: {
                files: parentConfigFiles,
                ignores: parentConfigIgnores,
                ...options,
                // `settings` type is different, but doesn't matter here
                settings: options.settings as JsxA11yEslintConfigOptions['settings'],
              },
            });
            return result?.configs || [];
          })()),
    ],
    optionsResolved,
  };
};
