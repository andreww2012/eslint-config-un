import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
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
  const optionsRaw = context.globalOptions.configs?.casePolice;
  const optionsResolved = assignDefaults(optionsRaw, {
    disableAutofix: true,
  } satisfies CasePoliceEslintConfigOptions);

  const configBuilder = new ConfigEntryBuilder('case-police', optionsResolved, context);

  configBuilder
    .addConfig([
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
    configs: configBuilder.getAllConfigs(),
    optionsResolved,
  };
};
