import type {Settings as EslintPluginBoundariesSettingsWithPrefixes} from 'eslint-plugin-boundaries';
import {ERROR, OFF} from '../constants';
import type {CamelCase} from '../types';
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
   * [`eslint-plugin-boundaries`](https://npmx.dev/eslint-plugin-boundaries) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `settings` object with keys transformed to
   * `boundaries/<original property name in kebab case>`
   * and applied to the resolved `files` and `ignores` of this config.
   *
   * Strongly recommended: specify at least `elements` — `eslint-plugin-boundaries` needs it
   * to work properly, and its absence is reported at runtime.
   */
  settings?: {
    [K in keyof EslintPluginBoundariesSettingsWithPrefixes as K extends `boundaries/${infer Name}`
      ? CamelCase<Name>
      : never]?: EslintPluginBoundariesSettingsWithPrefixes[K];
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings} = optionsResolved;

  if (pluginSettings?.elements == null) {
    context.logger.warn(
      "[boundaries] You haven't specified `settings.elements` option which is required for `eslint-plugin-boundaries` to work properly",
    );
  }

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
            objectEntriesUnsafe(pluginSettings || {}).map(([settingName, settingValue]) => [
              `boundaries/${kebabCase(settingName)}`,
              settingValue,
            ]),
          ),
        },
      },
    ])
    .addRule('dependencies', ERROR) /** @since 2.0.0-beta.1 */ /** @aka element-types */ // 🟢
    .addRule('entry-point', ERROR) /** @since 1.0.0-beta.1 */ // 🟢
    .addRule('external', ERROR) /** @since 2.0.0-beta.1 */ // 🟢
    .addRule('no-ignored', OFF) /** @since 2.0.0-beta.1 */
    .addRule('no-private', ERROR) /** @since 1.0.0-beta.1 */ // 🟢
    .addRule('no-unknown', OFF) /** @since 2.0.0-beta.1 */
    .addRule('no-unknown-files', OFF) /** @since 2.0.0-beta.1 */
    .enableConfigTesterForPlugin('boundaries', {
      // `element-types` was not properly marked as deprecated: https://www.jsboundaries.dev/docs/releases/migration-guides/v5-to-v6/#rule-element-types-renamed-to-dependencies
      /* v8 ignore next */
      rulesToSkipInConfig: (ruleName) => ruleName === 'element-types',
    })
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'boundaries'>;
