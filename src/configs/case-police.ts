import {ERROR} from '../constants';
import {type ExtraPluginsType, type UnConfigOptions, assignDefaults, defineUnConfig} from './index';

export interface CasePoliceEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends UnConfigOptions<ExtraPlugins, 'case-police'> {}

export default defineUnConfig('casePolice', (context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies CasePoliceEslintConfigOptions);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'case-police');

  configBuilder
    ?.addConfig([
      'case-police',
      {
        includeDefaultFilesAndIgnores: true,
        doNotIgnoreCss: true,
        doNotIgnoreHtml: true,
        doNotIgnoreMarkdown: true,
        doNotIgnoreMdx: true,
      },
    ])
    .addRule('string-check', ERROR) /** @since 0.6.0 */
    .enableConfigTesterForPlugin('case-police')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
