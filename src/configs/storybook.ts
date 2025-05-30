import {ERROR, GLOB_JS_TS_EXTENSION, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface StorybookEslintConfigOptions extends UnConfigOptions<'storybook'> {}

export const storybookUnConfig: UnConfigFn<'storybook'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.storybook;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies StorybookEslintConfigOptions);

  const configBuilder = createConfigBuilder(context, optionsResolved, 'storybook');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🤝 - in addon-interactions
  // 🩷 - in CSF (Component Story Format) and CSF strict
  // ❤️ - in CSF strict

  configBuilder
    ?.addConfig([
      'storybook',
      {
        includeDefaultFilesAndIgnores: true,
        filesFallback: [`**/*.{stories,story}.${GLOB_JS_TS_X_EXTENSION}`],
      },
    ])
    .addRule('await-interactions', ERROR) // 🟢🤝
    .addRule('context-in-play-function', ERROR) // 🟢🤝
    .addRule('csf-component', ERROR) // 🩷
    .addRule('default-exports', ERROR) // 🟢🩷
    .addRule('hierarchy-separator', ERROR) // 🟡🩷
    .addRule('meta-inline-properties', WARNING)
    .addRule(
      'meta-satisfies-type',
      (context.packagesInfo.typescript?.versions.majorAndMinor || 0) >= 4.9 ? WARNING : OFF,
    )
    .addRule('no-redundant-story-name', ERROR) // 🟡🩷
    .addRule('no-renderer-packages', ERROR) // 🟢
    .addRule('no-stories-of', ERROR) // ❤️
    .addRule('no-title-property-in-meta', ERROR) // ❤️
    .addRule('no-uninstalled-addons', OFF) // 🟢 (for main.* files)
    .addRule('prefer-pascal-case', ERROR) // 🟡
    .addRule('story-exports', ERROR) // 🟢🩷
    .addRule('use-storybook-expect', ERROR) // 🟢🤝
    .addRule('use-storybook-testing-library', ERROR) // 🟢🤝
    .disableAnyRule('import', 'no-default-export')
    .disableAnyRule('import', 'no-anonymous-default-export') // 🟢(off)
    .disableAnyRule('react-hooks', 'rules-of-hooks') // 🟢(off)
    .addOverrides();

  configBuilder
    ?.addConfig('storybook/main', {
      files: [`.storybook/main.${GLOB_JS_TS_EXTENSION}`],
    })
    .addRule('no-uninstalled-addons', ERROR); // 🟢

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
