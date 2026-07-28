import {ERROR, OFF} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface UnheadEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'unhead'> {}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'unhead');

  // Legend:
  // 🔴 - not in `recommended`

  configBuilder
    ?.addConfig(['unhead', {includeDefaultFilesAndIgnores: true}])
    .addRule('defer-on-module-script', ERROR) /** @since 3.0.5 */
    .addRule('empty-meta-content', ERROR) /** @since 3.0.5 */
    .addRule('no-deprecated-props', ERROR) /** @since 3.0.5 */
    .addRule('no-html-in-title', ERROR) /** @since 3.0.5 */
    .addRule('no-unknown-meta', ERROR) /** @since 3.0.5 */
    .addRule('non-absolute-canonical', ERROR) /** @since 3.0.5 */
    .addRule('numeric-tag-priority', ERROR) /** @since 3.0.5 */
    // Only meant to be enabled during a v2 to v3 migration
    .addRule('prefer-define-helpers', OFF) /** @since 3.0.5 */ // 🔴
    .addRule('preload-font-crossorigin', ERROR) /** @since 3.0.5 */
    .addRule('preload-missing-as', ERROR) /** @since 3.0.5 */
    .addRule('robots-conflict', ERROR) /** @since 3.0.5 */
    .addRule('script-src-with-content', ERROR) /** @since 3.0.5 */
    .addRule('twitter-handle-missing-at', ERROR) /** @since 3.0.5 */
    .addRule('viewport-user-scalable', ERROR) /** @since 3.0.5 */
    .enableConfigTesterForPlugin('unhead')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<'unhead'>;
