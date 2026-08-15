import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin for [`zod-openapi`](https://github.com/samchungy/zod-openapi).
 *
 * Note that the plugin assumes that all Zod schemas in the matched files are
 * meant to be used with `zod-openapi`, so prefer scoping this config to your
 * API schema files via `files`/`ignores`.
 *
 * 📁 Default `files`: all files
 */
export interface ZodOpenapiEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'zod-openapi'> {}

export default defineUnConfig<ZodOpenapiEslintConfigOptions>('zodOpenapi', {
  enabledBy: {package: 'zod-openapi'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'zod-openapi');

  // Legend:
  // 💭 - requires type information

  configBuilder
    ?.addConfig('zod-openapi')
    .addRule('prefer-meta-last', ERROR) /** @since 2.0.0-beta.0 */ // 💭
    .addRule('prefer-zod-default', ERROR) /** @since 0.0.1 */ // 💭
    .addRule('require-comment', OFF) /** @since 0.0.1 */ // 💭
    .addRule('require-example', OFF) /** @since 0.0.1 */ // 💭
    .addRule('require-meta', OFF) /** @since 2.0.0-beta.0 */ // 💭
    .enableConfigTesterForPlugin('zod-openapi')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
});
