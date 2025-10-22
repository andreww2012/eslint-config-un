// cspell:ignore attributechangedcallback connectedcallback
import {ERROR, OFF, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface WebComponentsEslintConfigOptions extends UnConfigOptions<'wc'> {
  /**
   * [`eslint-plugin-wc`](https://npmjs.com/eslint-plugin-wc) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `wc` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * Recognize the following classes as custom element base classes.
     * @example ['LitElement']
     */
    elementBaseClasses?: string[];
  };
}

export const webComponentsUnConfig: UnConfigFn<'webComponents'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.webComponents;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies WebComponentsEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, 'wc');

  // Legend:
  // 🟢 - in recommended

  configBuilder
    ?.addConfig(['web-components', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          webComponents: pluginSettings,
        },
      }),
    })
    .markCategory('Possible Errors')
    .addRule('no-constructor-attributes', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-invalid-element-name', ERROR) /** @since 0.1.0 */ // 🟢
    .addRule('no-self-class', ERROR) /** @since 0.1.0 */ // 🟢
    .markCategory('Best Practice')
    .addRule('attach-shadow-constructor', ERROR) /** @since 0.1.0 */
    .addRule('guard-super-call', ERROR) /** @since 0.1.0 */
    .addRule('no-child-traversal-in-attributechangedcallback', ERROR) /** @since 2.0.0-ce.1 */
    .addRule('no-child-traversal-in-connectedcallback', ERROR) /** @since 2.0.0-ce.1 */
    .addRule('no-closed-shadow-root', ERROR) /** @since 0.1.0 */
    .addRule('no-constructor-params', ERROR) /** @since 1.3.1 */
    .addRule('no-customized-built-in-elements', ERROR) /** @since 2.0.0-ce.1 */
    .addRule('no-invalid-extends', ERROR) /** @since 2.0.0-ce.1 */
    .addRule('no-typos', ERROR) /** @since 0.1.0 */
    .addRule('require-listener-teardown', ERROR) /** @since 1.3.1 */
    .markCategory('Preference/convention')
    .addRule('define-tag-after-class-definition', OFF) /** @since 2.0.0-ce.1 */
    .addRule('expose-class-on-global', OFF) /** @since 2.0.0-ce.1 */
    .addRule('file-name-matches-element', OFF) /** @since 2.0.0-ce.1 */
    .addRule('guard-define-call', OFF) /** @since 2.0.0-ce.1 */
    .addRule('max-elements-per-file', OFF) /** @since 2.0.0-ce.1 */
    .addRule('no-constructor', WARNING) /** @since 2.0.0-ce.1 */
    .addRule('no-exports-with-element', OFF) /** @since 2.0.0-ce.1 */
    .addRule('no-method-prefixed-with-on', WARNING) /** @since 2.0.0-ce.1 */
    .addRule('tag-name-matches-class', WARNING) /** @since 2.0.0-ce.1 */
    .enableConfigTesterForPlugin('wc')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
