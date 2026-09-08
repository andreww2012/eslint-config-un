import {definePluginMetadata} from './shared';

export default definePluginMetadata('tailwindcss', {
  configs: ['tailwind'],
  docsUrl: 'https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'classnames-order': {stylistic: true},
    'enforces-shorthand': {stylistic: true},
  },
});
