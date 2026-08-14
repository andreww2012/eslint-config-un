import {ERROR, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface PromiseEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'promise'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'promise');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'promise',
      {
        // TODO why?
        ignoresInternal: {
          html: false,
        },
      },
    ])
    .addRule('always-return', ERROR, [{ignoreLastCallback: true}]) /** @since 1.0.0 */ // 🟢
    .addRule('avoid-new', OFF) /** @since 3.4.0 */
    .addRule('catch-or-return', ERROR, [
      {allowThenStrict: true, allowFinally: true},
    ]) /** @since 1.1.0 */ // 🟢
    .addRule('no-callback-in-promise', ERROR) /** @since 3.4.0 */ // 🟡
    .addRule('no-multiple-resolved', WARNING) /** @since 6.1.0 */
    .addRule('no-native', OFF) /** @since 1.3.0 */
    .addRule('no-nesting', WARNING) /** @since 3.4.0 */ // 🟡
    .addRule('no-new-statics', ERROR) /** @since 3.7.0 */ // 🟢
    .addRule('no-promise-in-callback', WARNING) /** @since 3.4.0 */ // 🟡
    .addRule('no-return-in-finally', ERROR) /** @since 3.6.0 */ // 🟡
    .addRule('no-return-wrap', ERROR, [{allowReject: true}]) /** @since 3.2.0 */ // 🟢
    .addRule('param-names', ERROR) /** @since 1.0.0 */ // 🟢
    .addRule('prefer-await-to-callbacks', OFF) /** @since 3.3.0 */
    .addRule('prefer-await-to-then', OFF) /** @since 3.3.0 */
    .addRule('prefer-catch', ERROR) /** @since 7.2.0 */
    .addRule('spec-only', ERROR) /** @since 7.1.0 */
    .addRule('valid-params', ERROR) /** @since 3.7.0 */ // 🟡
    .enableConfigTesterForPlugin('promise')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'promise'>;
