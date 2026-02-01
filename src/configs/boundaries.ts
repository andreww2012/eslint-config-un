import type {Settings as EslintPluginBoundariesSettingsWithPrefixes} from 'eslint-plugin-boundaries';
import {ERROR, OFF} from '../constants';
import type {CamelCase, SetRequired} from '../types';
import {kebabCase, objectEntriesUnsafe} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface BoundariesEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'boundaries'> {
  /**
   * [`eslint-plugin-boundaries`](https://npmjs.com/eslint-plugin-boundaries) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object with keys transformed to
   * `boundaries/<original property name in kebab case>`
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings: SetRequired<
    {
      [K in keyof EslintPluginBoundariesSettingsWithPrefixes as K extends `boundaries/${infer Name}`
        ? CamelCase<Name>
        : never]?: EslintPluginBoundariesSettingsWithPrefixes[K];
    },
    'elements'
  >;
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<BoundariesEslintConfigOptions>,
  );

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'boundaries');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig([
      'boundaries',
      {
        includeDefaultFilesAndIgnores: true,
        settings: {
          '': Object.fromEntries(
            // eslint-disable-next-line ts/no-unnecessary-condition -- settings not provided in config tester
            objectEntriesUnsafe(pluginSettings || {}).map(([settingName, settingValue]) => [
              `boundaries/${kebabCase(settingName)}`,
              settingValue,
            ]),
          ),
        },
      },
    ])
    .addRule('element-types', ERROR) /** @since 2.0.0-beta.1 */ // 🟢
    .addRule('entry-point', ERROR) /** @since 1.0.0-beta.1 */ // 🟢
    .addRule('external', ERROR) /** @since 2.0.0-beta.1 */ // 🟢
    .addRule('no-ignored', OFF) /** @since 2.0.0-beta.1 */
    .addRule('no-private', ERROR) /** @since 1.0.0-beta.1 */ // 🟢
    .addRule('no-unknown', OFF) /** @since 2.0.0-beta.1 */
    .addRule('no-unknown-files', OFF) /** @since 2.0.0-beta.1 */
    .enableConfigTesterForPlugin('boundaries')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'boundaries'>;
