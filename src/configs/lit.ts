// cspell:ignore classfield
import {ERROR, OFF} from '../constants';
import {type RulesRecordPartial, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {JsxA11yEslintConfigOptions} from './jsx-a11y';
import type {UnConfigFn} from './index';

export interface LitEslintConfigOptions extends UnConfigOptions<'lit'> {
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
        Omit<
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

  const {files: parentConfigFiles, ignores: parentConfigIgnores, configA11y} = optionsResolved;

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['lit', {includeDefaultFilesAndIgnores: true}])
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
    .addOverrides();

  return {
    configs: [
      configBuilder,
      ...(configA11y === false
        ? []
        : await (async () => {
            const {jsxA11yUnConfig} = await import('./jsx-a11y');
            const result = await jsxA11yUnConfig(context, {
              prefix: 'lit',
              options: {
                files: parentConfigFiles,
                ignores: parentConfigIgnores,
                ...(typeof configA11y === 'object' && configA11y),
              },
            });
            return result?.configs || [];
          })()),
    ],
    optionsResolved,
  };
};
