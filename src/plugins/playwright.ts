import {definePluginMetadata} from './shared';

export default definePluginMetadata('playwright', {
  configs: ['playwright'],
  docsUrl: 'https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) =>
    `https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/docs/rules/${ruleName}.md`,
  rules: {
    'consistent-spacing-between-blocks': {stylistic: true},
    'no-identical-title': {
      stylistic: [false, 'Playwright refuses to run a file with duplicate test titles'],
    },
    'no-magic-timeouts': {
      stylistic: [false, 'moving a timeout to the global config changes what it applies to'],
    },
    'no-template-literal-title': {
      stylistic: [false, 'dropping an interpolation makes titles static, possibly duplicate'],
    },
    'no-useless-not': {stylistic: true},
    'prefer-comparison-matcher': {stylistic: true},
    'prefer-equality-matcher': {stylistic: true},
    'prefer-hooks-in-order': {stylistic: true},
    'prefer-hooks-on-top': {stylistic: true},
    'prefer-lowercase-title': {
      stylistic: [false, 'titles name snapshots and are matched by test filters'],
      autofixDisabled: [true, "strings/symbols shouldn't be changed by autofix"],
    },
    'prefer-to-be': {stylistic: true},
    'prefer-to-contain': {stylistic: true},
    'prefer-to-have-count': {stylistic: true},
    'prefer-to-have-length': {stylistic: true},
    'valid-title': {
      stylistic: [false, 'titles name snapshots and are matched by test filters'],
      autofixDisabled: [true, "strings/symbols shouldn't be changed by autofix"],
    },
  },
});
