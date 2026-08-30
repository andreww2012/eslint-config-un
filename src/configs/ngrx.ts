import {ERROR, GLOB_JS_TS_X} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * [NgRx](https://ngrx.io) specific rules.
 *
 * 📁 Default `files`: <code>**&#47;*.?([cm])[jt]s?(x)</code>
 */
export interface NgrxEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'ngrx'> {}

export default defineUnConfig<NgrxEslintConfigOptions>('ngrx', {
  enabledBy: {package: '@ngrx/store'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'ngrx');

  // Legend:
  // 💭 - requires type information

  configBuilder
    ?.addConfig(['ngrx', {filesDefault: [GLOB_JS_TS_X]}])
    .markCategory('Component store')
    .addRule('avoid-combining-component-store-selectors', ERROR) /** @since 16.3.0 */
    .addRule('avoid-mapping-component-store-selectors', ERROR) /** @since 16.3.0 */
    .addRule('require-super-ondestroy', ERROR) /** @since 19.0.0 */
    .addRule('updater-explicit-return-type', ERROR) /** @since 14.0.0 */
    .markCategory('Effects')
    .addRule('avoid-cyclic-effects', ERROR) /** @since 14.0.0 */ // 💭
    .addRule('no-dispatch-in-effects', ERROR) /** @since 14.0.0 */
    .addRule('no-effects-in-providers', ERROR) /** @since 14.0.0 */
    .addRule('no-multiple-actions-in-effects', ERROR) /** @since 14.0.0 */ // 💭
    .addRule('prefer-action-creator-in-of-type', ERROR) /** @since 14.0.0 */
    .addRule('prefer-effect-callback-in-block-statement', ERROR) /** @since 14.0.0 */
    .addRule('use-effects-lifecycle-interface', ERROR) /** @since 14.0.0 */
    .markCategory('Operators')
    .addRule('prefer-concat-latest-from', ERROR) /** @since 14.0.0 */
    .markCategory('Signals')
    .addRule('enforce-type-call', ERROR) /** @since 20.0.0 */
    .addRule('prefer-protected-state', ERROR) /** @since 18.1.0 */
    .addRule('signal-state-no-arrays-at-root-level', ERROR) /** @since 18.0.0 */ // 💭
    .addRule('signal-store-feature-should-use-generic-type', ERROR) /** @since 18.0.2 */
    .addRule('with-state-no-arrays-at-root-level', ERROR) /** @since 18.0.0 */ // 💭
    .markCategory('Store')
    .addRule('avoid-combining-selectors', ERROR) /** @since 14.0.0 */
    .addRule('avoid-dispatching-multiple-actions-sequentially', ERROR) /** @since 14.0.0 */
    .addRule('avoid-duplicate-actions-in-reducer', ERROR) /** @since 14.0.0 */
    .addRule('avoid-mapping-selectors', ERROR) /** @since 14.0.0 */
    .addRule('good-action-hygiene', ERROR) /** @since 14.0.0 */
    .addRule('no-multiple-global-stores', ERROR) /** @since 14.0.0 */
    .addRule('no-reducer-in-key-names', ERROR) /** @since 14.0.0 */
    .addRule('no-store-subscription', ERROR) /** @since 14.0.0 */
    .addRule('no-typed-global-store', ERROR) /** @since 14.0.0 */
    .addRule('on-function-explicit-return-type', ERROR) /** @since 14.0.0 */
    .addRule('prefer-action-creator', ERROR) /** @since 14.0.0 */
    .addRule('prefer-action-creator-in-dispatch', ERROR) /** @since 14.0.0 */
    .addRule('prefer-inline-action-props', ERROR) /** @since 14.0.0 */
    .addRule('prefer-one-generic-in-create-for-feature-selector', ERROR) /** @since 14.0.0 */
    .addRule('prefer-selector-in-select', ERROR) /** @since 14.0.0 */
    .addRule('prefix-selectors-with-select', ERROR) /** @since 14.0.0 */
    .addRule('select-style', ERROR) /** @since 14.0.0 */
    .addRule('use-consistent-global-store-name', ERROR) /** @since 14.0.0 */
    .enableConfigTesterForPlugin('ngrx')
    .addOverrides();
});
