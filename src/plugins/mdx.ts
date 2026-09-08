import {definePluginMetadata} from './shared';

export default definePluginMetadata('mdx', {
  configs: ['mdx'],
  docsUrl: 'https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md',
  gitTag: (tag) => `eslint-plugin-mdx@${tag}`,
  rules: {},
});
