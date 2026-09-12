import {GLOB_SVELTE} from '../constants';
import {definePluginMetadata} from './shared';

export default definePluginMetadata('svelte', {
  configs: ['svelte'],
  isMainPlugin: true,
  docsUrl: 'https://sveltejs.github.io/eslint-plugin-svelte',
  ruleDocsUrl: (ruleName) => `https://sveltejs.github.io/eslint-plugin-svelte/rules/${ruleName}`,
  gitTag: (version) => `eslint-plugin-svelte@${version}`,
  prettierLanguage: 'svelte',
  typeInfo: {extraPatterns: [GLOB_SVELTE], extraFileExtensions: ['.svelte']},
  rules: {
    'consistent-selector-style': {stylistic: true},
    'derived-has-same-inputs-outputs': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
      stylistic: true,
    },
    'first-attribute-linebreak': {stylistic: true, prettierIncompatible: true},
    'html-closing-bracket-new-line': {stylistic: true, prettierIncompatible: true},
    'html-closing-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    'html-quotes': {stylistic: true, prettierIncompatible: true},
    'html-self-closing': {stylistic: true, prettierIncompatible: true},
    indent: {stylistic: true, prettierIncompatible: true},
    'max-attributes-per-line': {stylistic: true, prettierIncompatible: true},
    'mustache-spacing': {stylistic: true, prettierIncompatible: true},
    'no-extra-reactive-curlies': {stylistic: true},
    'no-navigation-without-resolve': {requiresTypeInfo: 'optional'},
    'no-spaces-around-equal-signs-in-attribute': {stylistic: true, prettierIncompatible: true},
    'no-store-async': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
    },
    'no-trailing-spaces': {stylistic: true, prettierIncompatible: true},
    'no-unused-props': {requiresTypeInfo: 'optional'},
    'prefer-attribute-interpolation': {stylistic: true},
    'prefer-class-directive': {stylistic: true},
    'prefer-style-directive': {stylistic: true},
    'require-event-prefix': {requiresTypeInfo: 'optional', stylistic: true},
    'require-store-callbacks-use-set-param': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
    },
    'require-store-reactive-access': {requiresTypeInfo: 'optional'},
    'require-stores-init': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
    },
    'shorthand-attribute': {stylistic: true, prettierIncompatible: true},
    'shorthand-directive': {stylistic: true, prettierIncompatible: true},
    'sort-attributes': {stylistic: true},
    'spaced-html-comment': {stylistic: true},
  },
});
