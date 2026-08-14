import {ERROR, GLOB_JS_TS_EXTENSION, GLOB_JS_TS_X_EXTENSION, OFF, WARNING} from '../constants';
import {generateDefaultTestFiles} from './shared';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface StorybookEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'storybook'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const typescriptVersion = context.packagesInfo.typescript?.versions.majorAndMinor || 0;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'storybook');

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
        filesDefault: generateDefaultTestFiles(GLOB_JS_TS_X_EXTENSION, {
          includeRegularSpecFiles: false,
          includeStorybookStories: true,
        }),
      },
    ])
    .addRule('await-interactions', ERROR) /** @since 0.0.1-alpha.1 */ // 🟢🤝
    .addRule('context-in-play-function', ERROR) /** @since 0.5.0 */ // 🟢🤝
    .addRule('csf-component', ERROR) /** @since 0.0.1-alpha.0 */ // 🩷
    .addRule('default-exports', ERROR) /** @since 0.0.1-alpha.0 */ // 🟢🩷
    .addRule('hierarchy-separator', ERROR) /** @since 0.0.1-alpha.0 */ // 🟡🩷
    .addRule('meta-inline-properties', WARNING) /** @since 0.0.1-alpha.0 */
    .addRule('meta-satisfies-type', typescriptVersion >= 4.9 ? WARNING : OFF) /** @since 0.12.0 */
    .addRule('no-redundant-story-name', ERROR) /** @since 0.0.1-alpha.0 */ // 🟡🩷
    .addRule('no-renderer-packages', ERROR) /** @since 0.13.0--canary.f263fb3.0 */ // 🟢
    .addRule('no-stories-of', ERROR) /** @since 0.0.1-alpha.0 */ // ❤️
    .addRule('no-title-property-in-meta', ERROR) /** @since 0.0.1-alpha.0 */ // ❤️
    .addRule('no-uninstalled-addons', OFF) /** @since 0.6.0 */ // 🟢 (for main.* files)
    .addRule('prefer-pascal-case', ERROR) /** @since 0.0.1-alpha.0 */ // 🟡
    .addRule('story-exports', ERROR) /** @since 0.4.0 */ // 🟢🩷
    .addRule('use-storybook-expect', ERROR) /** @since 0.0.1-alpha.0 */ // 🟢🤝
    .addRule('use-storybook-testing-library', ERROR) /** @since 0.0.1-alpha.0 */ // 🟢🤝
    .disableAnyRule('import', 'no-default-export')
    .disableAnyRule('import', 'no-anonymous-default-export') // 🟢(off)
    .disableAnyRule('react-hooks', 'rules-of-hooks') // 🟢(off)
    .enableConfigTesterForPlugin('storybook')
    .addOverrides();

  configBuilder
    ?.addConfig(['storybook/main', {applyUserFilesAndIgnores: false}], {
      files: [`.storybook/main.${GLOB_JS_TS_EXTENSION}`],
    })
    .addRule('no-uninstalled-addons', ERROR); // 🟢

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'storybook'>;
