import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface ZodOpenapiEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'zod-openapi'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'zod-openapi');

  // Legend:
  // 💭 - requires type information

  configBuilder
    ?.addConfig(['zod-openapi', {includeDefaultFilesAndIgnores: true}])
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
}) satisfies UnConfigFn<'zodOpenapi'>;
