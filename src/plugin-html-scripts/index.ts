import type {EslintPlugin} from '../eslint/eslint-types';
import {PLUGIN_META} from './meta';
import {scopeSharingRule} from './scope-sharing';

export type {HtmlProcessorOptions} from './processor';
export {createProcessor} from './processor';
export {parser} from './scope-sharing';

const eslintPluginHtmlScripts: EslintPlugin = {
  meta: PLUGIN_META,
  rules: {
    'scope-sharing': scopeSharingRule,
  },
};

// eslint-disable-next-line import/no-default-export
export default eslintPluginHtmlScripts;
