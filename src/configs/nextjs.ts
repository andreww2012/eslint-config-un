// cspell:ignore polyfillio
import {ERROR, GLOB_JS_TS_X, WARNING} from '../constants';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

export interface NextJsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'nextjs'> {
  /**
   * [`@next/eslint-plugin-next`](https://npmx.dev/@next/eslint-plugin-next) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `next` property
   * and applied to the resolved `files` and `ignores` of this config.
   */
  settings?: {
    /**
     * If you're using the plugin in a project where Next.js isn't installed in your root directory
     * (such as a monorepo), you can tell the plugin where to find your Next.js application.
     * Path can be relative or absolute, or a glob (i.e. packages/*\/).
     */
    rootDir?: string | string[];
  };
}

export default ((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = context.createConfigBuilder(optionsResolved, 'nextjs');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🔵 - in Core Web Vitals (error)

  configBuilder
    ?.addConfig([
      'nextjs',
      {
        includeDefaultFilesAndIgnores: true,
        filesDefault: [GLOB_JS_TS_X],
        settings: {
          next: pluginSettings,
        },
      },
    ])
    .addRule('google-font-display', ERROR) /** @since 10.2.1-canary.4 */ // 🟡
    // "Note: Next.js automatically adds <link rel="preconnect" /> after version 12.0.1."
    .addRule('google-font-preconnect', ERROR) /** @since 10.2.1-canary.4 */ // 🟡
    .addRule('inline-script-id', ERROR) /** @since 11.1.1-canary.14 */ // 🟢
    .addRule('next-script-for-ga', ERROR) /** @since 11.1.1-canary.9 */ // 🟡
    .addRule('no-assign-module-variable', ERROR) /** @since 12.1.6-canary.2 */ // 🟢
    .addRule('no-async-client-component', ERROR) /** @since 13.4.8-canary.6 */ // 🟡
    .addRule('no-before-interactive-script-outside-document', ERROR) /** @since 12.1.6-canary.6 */ // 🟡
    .addRule('no-css-tags', WARNING) /** @since 9.3.7-canary.14 */ // 🟡
    .addRule('no-document-import-in-page', ERROR) /** @since 10.2.1-canary.5 */ // 🟢
    .addRule('no-duplicate-head', ERROR) /** @since 11.0.2-canary.16 */ // 🟢
    .addRule('no-head-element', ERROR) /** @since 12.0.8-canary.14 */ // 🟡
    .addRule('no-head-import-in-document', ERROR) /** @since 10.2.1-canary.5 */ // 🟢
    .addRule('no-html-link-for-pages', WARNING) /** @since 9.4.3-canary.0 */ // 🟡🔵
    .addRule('no-img-element', WARNING) /** @since 10.2.1-canary.10 */ // 🟡
    .addRule('no-page-custom-font', WARNING) /** @since 10.2.1-canary.5 */ // 🟡
    .addRule('no-script-component-in-head', ERROR) /** @since 12.0.11-canary.5 */ // 🟢
    .addRule('no-styled-jsx-in-document', ERROR) /** @since 12.1.7-canary.11 */ // 🟡
    .addRule('no-sync-scripts', ERROR) /** @since 9.3.7-canary.14 */ // 🟡🔵
    .addRule('no-title-in-document-head', ERROR) /** @since 10.2.1-canary.3 */ // 🟡
    .addRule('no-typos', ERROR) /** @since 11.0.2-canary.22 */ // 🟡
    .addRule('no-unwanted-polyfillio', ERROR) /** @since 9.4.5-canary.38 */ // 🟡
    .enableConfigTesterForPlugin('nextjs')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
  // eslint-disable-next-line case-police/string-check
}) satisfies UnConfigFn<'nextJs'>;
