import {ERROR, GLOB_TS_X, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface AwsCdkEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'awscdk'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'awscdk');

  // Legend:
  // 🔴 - NOT in `recommended`
  // 💭 - requires type information

  configBuilder
    ?.addConfig([
      'aws-cdk',
      {
        filesDefault: [GLOB_TS_X],
      },
    ])
    .addRule('construct-constructor-property', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-construct-in-interface', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-construct-in-public-property-of-construct', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-construct-stack-suffix', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-import-private', OFF) /** @since 4.0.0 */ // 🔴
    .addRule('no-mutable-property-of-props-interface', WARNING) /** @since 4.0.0 */
    .addRule('no-mutable-public-property-of-construct', WARNING) /** @since 4.0.0 */ // 💭
    .addRule('no-parent-name-construct-id-match', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-unused-props', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('no-variable-construct-id', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('pascal-case-construct-id', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('prefer-grants-property', WARNING) /** @since 4.1.0 */ // 💭
    .addRule('prevent-construct-id-collision', OFF) /** @since 4.3.0 */ // 🔴💭
    .addRule('props-name-convention', OFF) /** @since 4.0.0 */ // 🔴💭
    .addRule('require-jsdoc', OFF) /** @since 4.0.0 */ // 🔴💭
    .addRule('require-passing-this', ERROR) /** @since 4.0.0 */ // 💭
    .addRule('require-props-default-doc', OFF) /** @since 4.0.0 */ // 🔴
    .enableConfigTesterForPlugin('awscdk')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'awsCdk'>;
