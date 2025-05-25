// cspell:ignore polyfillio
import {ERROR, GLOB_JS_TS_X, WARNING} from '../constants';
import {type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface NextJsEslintConfigOptions extends UnConfigOptions<'@next/next'> {
  /**
   * [`@next/eslint-plugin-next`](https://npmjs.com/@next/eslint-plugin-next) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `next` property and applied to the specified `files` and `ignores`.
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

// eslint-disable-next-line case-police/string-check
export const nextJsUnConfig: UnConfigFn<'nextJs'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.nextJs;
  const optionsResolved = assignDefaults(optionsRaw, {} satisfies NextJsEslintConfigOptions);

  const {settings: pluginSettings} = optionsResolved;

  const configBuilder = createConfigBuilder(context, optionsResolved, '@next/next');

  // Legend:
  // 🟢 - in recommended
  // 🟡 - in recommended (warns)
  // 🔵 - in Core Web Vitals (error)

  configBuilder
    ?.addConfig(
      [
        'nextjs',
        {
          includeDefaultFilesAndIgnores: true,
          filesFallback: [GLOB_JS_TS_X],
        },
      ],
      {
        ...(pluginSettings && {
          settings: {
            next: pluginSettings,
          },
        }),
      },
    )
    .addRule('google-font-display', ERROR) // 🟡
    // "Note: Next.js automatically adds <link rel="preconnect" /> after version 12.0.1."
    .addRule('google-font-preconnect', ERROR) // 🟡
    .addRule('inline-script-id', ERROR) // 🟢
    .addRule('next-script-for-ga', ERROR) // 🟡
    .addRule('no-assign-module-variable', ERROR) // 🟢
    .addRule('no-async-client-component', ERROR) // 🟡
    .addRule('no-before-interactive-script-outside-document', ERROR) // 🟡
    .addRule('no-css-tags', WARNING) // 🟡
    .addRule('no-document-import-in-page', ERROR) // 🟢
    .addRule('no-duplicate-head', ERROR) // 🟢
    .addRule('no-head-element', ERROR) // 🟡
    .addRule('no-head-import-in-document', ERROR) // 🟢
    .addRule('no-html-link-for-pages', WARNING) // 🟡🔵
    .addRule('no-img-element', WARNING) // 🟡
    .addRule('no-page-custom-font', WARNING) // 🟡
    .addRule('no-script-component-in-head', ERROR) // 🟢
    .addRule('no-styled-jsx-in-document', ERROR) // 🟡
    .addRule('no-sync-scripts', ERROR) // 🟡🔵
    .addRule('no-title-in-document-head', ERROR) // 🟡
    .addRule('no-typos', ERROR) // 🟡
    .addRule('no-unwanted-polyfillio', ERROR) // 🟡
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
