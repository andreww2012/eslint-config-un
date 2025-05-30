import {ERROR} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface CasePoliceEslintConfigOptions extends UnConfigOptions<'case-police'> {}

export const casePoliceUnConfig: UnConfigFn<'casePolice'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.casePolice;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CasePoliceEslintConfigOptions);

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
    .addRule('string-check', ERROR, [], {disableAutofix: true})
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
