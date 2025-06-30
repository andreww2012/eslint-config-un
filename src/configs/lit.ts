// cspell:ignore classfield
import {ERROR, OFF} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface LitEslintConfigOptions extends UnConfigOptions<'lit'> {}

export const litUnConfig: UnConfigFn<'lit'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.lit;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies LitEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'lit');

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
    configs: [configBuilder],
    optionsResolved,
  };
};
