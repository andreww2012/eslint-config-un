import {ERROR} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface CspellEslintConfigOptions extends UnConfigOptions<'@cspell'> {
  /**
   * The single rule (`spellchecker`) options.
   */
  options?: GetRuleOptions<'@cspell', 'spellchecker'>[0];
}

export const cspellUnConfig: UnConfigFn<'cspell'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.cspell;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CspellEslintConfigOptions);

  const {options} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, '@cspell');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'cspell',
      {
        includeDefaultFilesAndIgnores: true,
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
      },
    ])
    .addRule('spellchecker', ERROR, options ? [options] : []) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
