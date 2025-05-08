import {ERROR} from '../constants';
import {type ConfigSharedOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface CasePoliceEslintConfigOptions extends ConfigSharedOptions<'case-police'> {
  /**
   * Autofix of this plugin's single rule may be unsafe to automatically apply.
   * Since it's the single rule in this plugin, we offer disabling autofix functionality
   * without prefixing the rule with `disable-autofix/`.
   * You may opt out of this behavior by setting this option to `false`.
   * @default true
   */
  disableAutofix?: boolean;
}

export const casePoliceUnConfig: UnConfigFn<'casePolice'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.casePolice;
  const optionsResolved = assignDefaults(optionsRaw, {
    disableAutofix: true,
  } satisfies CasePoliceEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'case-police');

  configBuilder
    ?.addConfig([
      'case-police',
      {
        includeDefaultFilesAndIgnores: true,
        doNotIgnoreCss: true,
        doNotIgnoreMarkdown: true,
        doNotIgnoreHtml: true,
      },
    ])
    .addRule('string-check', ERROR)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
