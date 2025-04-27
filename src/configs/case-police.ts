import {ERROR} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions, type FlatConfigEntry} from '../eslint';
import type {InternalConfigOptions} from './index';

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

export const casePoliceEslintConfig = (
  options: CasePoliceEslintConfigOptions,
  internalOptions: InternalConfigOptions,
): FlatConfigEntry[] => {
  const builder = new ConfigEntryBuilder('case-police', options, internalOptions);

  builder
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

  return builder.getAllConfigs();
};
