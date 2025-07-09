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
    /* Category: Possible Errors */
    .addRule('no-constructor-attributes', ERROR) // 🟢
    .addRule('no-invalid-element-name', ERROR) // 🟢
    .addRule('no-self-class', ERROR) // 🟢
    /* Category: Best Practice */
    .addRule('attach-shadow-constructor', ERROR)
    .addRule('guard-super-call', ERROR)
    .addRule('no-child-traversal-in-attributechangedcallback', ERROR)
    .addRule('no-child-traversal-in-connectedcallback', ERROR)
    .addRule('no-closed-shadow-root', ERROR)
    .addRule('no-constructor-params', ERROR)
    .addRule('no-customized-built-in-elements', ERROR)
    .addRule('no-invalid-extends', ERROR)
    .addRule('no-typos', ERROR)
    .addRule('require-listener-teardown', ERROR)
    /* Category: Preference/convention */
    .addRule('define-tag-after-class-definition', OFF)
    .addRule('expose-class-on-global', OFF)
    .addRule('file-name-matches-element', OFF)
    .addRule('guard-define-call', OFF)
    .addRule('max-elements-per-file', OFF)
    .addRule('no-constructor', WARNING)
    .addRule('no-exports-with-element', OFF)
    .addRule('no-method-prefixed-with-on', WARNING)
    .addRule('tag-name-matches-class', WARNING)
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
