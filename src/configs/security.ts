import {ERROR, KEEP_LINTING_INLINE_JS, OFF, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

/**
 * An ESLint plugin that help identify potential security issues, but ⚠️ finds a lot of false
 * positives which need triage by a human.
 *
 * 📁 Default `files`: all files
 */
export interface SecurityEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'security'> {}

export default defineUnConfig<SecurityEslintConfigOptions>('security', {
  enabledBy: {group: 'misc'},
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configBuilder = context.createConfigBuilder(optionsResolved, 'security');

  // Legend:
  // 🟡 - in recommended (warns)

  configBuilder
    ?.addConfig([
      'security',
      {
        ignoresInternal: KEEP_LINTING_INLINE_JS,
      },
    ])
    .addRule('detect-bidi-characters', ERROR) /** @since 1.6.0 */ // 🟡
    .addRule('detect-buffer-noassert', ERROR) /** @since 1.0.0 */ // 🟡
    .addRule('detect-child-process', WARNING) /** @since 1.0.0 */ // 🟡
    .addRule('detect-disable-mustache-escape', ERROR) /** @since 1.0.0 */ // 🟡
    .addRule('detect-eval-with-expression', ERROR) /** @since 1.0.0 */ // 🟡
    .addRule('detect-new-buffer', ERROR) /** @since 1.1.0 */ // 🟡
    .addRule('detect-no-csrf-before-method-override', WARNING) /** @since 1.0.0 */ // 🟡
    .addRule('detect-non-literal-fs-filename', OFF) /** @since 1.0.0 */ // 🟡
    .addRule('detect-non-literal-regexp', OFF) /** @since 1.0.0 */ // 🟡
    .addRule('detect-non-literal-require', OFF) /** @since 1.0.0 */ // 🟡
    .addRule('detect-object-injection', OFF) /** @since 1.0.0 */ // 🟡
    .addRule('detect-possible-timing-attacks', OFF) /** @since 1.0.0 */ // 🟡
    .addRule('detect-pseudoRandomBytes', WARNING) /** @since 1.0.0 */ // 🟡
    .addRule('detect-unsafe-regex', OFF) /** @since 1.0.0 */ // 🟡
    .enableConfigTesterForPlugin('security')
    .addOverrides();
});
