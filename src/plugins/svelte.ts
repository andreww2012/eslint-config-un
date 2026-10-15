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
    'block-lang': {disableInCodeBlocks: 'tooStrict'},
    'button-has-type': {disableInCodeBlocks: 'runtimeOnly'},
    'consistent-selector-style': {stylistic: true},
    'derived-has-same-inputs-outputs': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
      stylistic: true,
    },
    'experimental-require-slot-types': {disableInCodeBlocks: 'typeStrictness'},
    'experimental-require-strict-events': {disableInCodeBlocks: 'typeStrictness'},
    'first-attribute-linebreak': {stylistic: true, prettierIncompatible: true},
    'html-closing-bracket-new-line': {stylistic: true, prettierIncompatible: true},
    'html-closing-bracket-spacing': {stylistic: true, prettierIncompatible: true},
    'html-quotes': {stylistic: true, prettierIncompatible: true},
    'html-self-closing': {stylistic: true, prettierIncompatible: true},
    indent: {stylistic: true, prettierIncompatible: true},
    'max-attributes-per-line': {stylistic: true, prettierIncompatible: true},
    'mustache-spacing': {stylistic: true, prettierIncompatible: true},
    'no-add-event-listener': {disableInCodeBlocks: 'runtimeOnly'},
    'no-at-const-tags': {disableInCodeBlocks: 'runtimeOnly'},
    'no-at-debug-tags': {disableInCodeBlocks: 'runtimeOnly'},
    'no-at-html-tags': {disableInCodeBlocks: 'runtimeOnly'},
    'no-extra-reactive-curlies': {stylistic: true},
    'no-goto-without-base': {disableInCodeBlocks: 'runtimeOnly'},
    'no-inline-styles': {disableInCodeBlocks: 'tooStrict'},
    'no-inspect': {disableInCodeBlocks: 'runtimeOnly'},
    'no-navigation-without-base': {disableInCodeBlocks: 'runtimeOnly'},
    'no-navigation-without-resolve': {
      requiresTypeInfo: 'optional',
      disableInCodeBlocks: 'runtimeOnly',
    },
    'no-restricted-html-elements': {
      disableInCodeBlocks: [
        false,
        'our config uses it to flag obsolete elements like `<marquee>` and `<center>`',
      ],
    },
    'no-spaces-around-equal-signs-in-attribute': {stylistic: true, prettierIncompatible: true},
    'no-store-async': {
      requiresTypeInfo: [
        false,
        'reaches the type-aware module only through the plain ESM reference tracker',
      ],
    },
    'no-target-blank': {disableInCodeBlocks: 'runtimeOnly'},
    'no-top-level-browser-globals': {disableInCodeBlocks: 'runtimeOnly'},
    'no-trailing-spaces': {stylistic: true, prettierIncompatible: true},
    'no-unused-class-name': {disableInCodeBlocks: 'tooStrict'},
    'no-unused-props': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'unused'},
    'no-unused-svelte-ignore': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-attribute-interpolation': {stylistic: true},
    'prefer-class-directive': {stylistic: true},
    'prefer-const': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-destructured-store-props': {disableInCodeBlocks: 'performance'},
    'prefer-style-directive': {stylistic: true},
    'require-each-key': {
      disableInCodeBlocks: [
        false,
        'keyless each blocks with stateful children or transitions update the wrong items',
      ],
    },
    'require-event-dispatcher-types': {disableInCodeBlocks: 'typeStrictness'},
    'require-event-prefix': {requiresTypeInfo: 'optional', stylistic: true},
    'require-optimized-style-attribute': {disableInCodeBlocks: 'performance'},
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
      disableInCodeBlocks: 'runtimeOnly',
    },
    'shorthand-attribute': {stylistic: true, prettierIncompatible: true},
    'shorthand-directive': {stylistic: true, prettierIncompatible: true},
    'sort-attributes': {stylistic: true},
    'spaced-html-comment': {stylistic: true},
    'valid-compile': {disableInCodeBlocks: 'runtimeOnly'},
  },
});
