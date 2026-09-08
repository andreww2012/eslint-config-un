import {definePluginMetadata} from './shared';

export default definePluginMetadata('remeda', {
  configs: ['remeda'],
  docsUrl: 'https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'prefer-constant': {stylistic: true},
    'prefer-do-nothing': {stylistic: true},
    'prefer-find': {stylistic: true},
    'prefer-flat-map': {stylistic: true},
    // cspell:disable-next-line
    'prefer-has-atleast': {stylistic: true},
    'prefer-is-empty': {stylistic: true},
    'prefer-is-nullish': {stylistic: true},
    'prefer-nullish-coalescing': {stylistic: true},
    'prefer-remeda-typecheck': {stylistic: true},
    'prefer-some': {stylistic: true},
    'prefer-times': {stylistic: true},
  },
});
