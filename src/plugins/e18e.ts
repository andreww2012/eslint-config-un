import {definePluginMetadata, gitTagAsVersion} from './shared';

export default definePluginMetadata('e18e', {
  configs: ['e18e'],
  docsUrl: 'https://github.com/e18e/eslint-plugin/blob/HEAD/README.md',
  gitTag: gitTagAsVersion,
  rules: {
    'ban-dependencies': {disableInCodeBlocks: 'imports'},
    'no-delete-property': {disableInCodeBlocks: 'performance', disableInTestFiles: true},
    'no-indexof-equality': {requiresTypeInfo: true, stylistic: true},
    'no-spread-in-reduce': {disableInCodeBlocks: 'performance'},
    'prefer-array-at': {
      requiresTypeInfo: 'optional',
      stylistic: true,
      autofixDisabled: [
        true,
        // Fixed only with type information: https://github.com/e18e/eslint-plugin/issues/45
        'without type information, it also rewrites array-likes like `NodeList`, which have no `at()` method',
      ],
    },
    'prefer-array-fill': {stylistic: true},
    'prefer-array-from-map': {
      stylistic: [
        false,
        'the mapper runs between iterator pulls instead of after the spread drained it, so one with side effects observes a different source',
      ],
      autofixDisabled: [
        true,
        // Reported: https://github.com/e18e/eslint-plugin/issues/155
        'the mapper runs between iterator pulls instead of after the spread drained them, and a local `Array` binding gets called instead of the global one',
      ],
      disableInCodeBlocks: 'performance',
    },
    'prefer-array-some': {
      stylistic: [
        false,
        'a falsy found element flips the check, the filtered length form calls the predicate for every element, and the receiver is not type checked',
      ],
      autofixDisabled: [
        true,
        // Reported: https://github.com/e18e/eslint-plugin/issues/168
        'a falsy found element flips the check, even with type information',
      ],
    },
    'prefer-array-to-reversed': {
      requiresTypeInfo: 'optional',
      autofixDisabled: [
        true,
        // Fixed only with type information: https://github.com/e18e/eslint-plugin/issues/54
        'without type information, it also rewrites copies of sets and strings, which have no `toReversed()` method',
      ],
    },
    'prefer-array-to-sorted': {
      requiresTypeInfo: 'optional',
      autofixDisabled: [
        true,
        // Fixed only with type information: https://github.com/e18e/eslint-plugin/issues/54
        'without type information, it also rewrites copies of sets and iterators, which have no `toSorted()` method',
      ],
    },
    'prefer-charcode-at-in-loop': {
      requiresTypeInfo: 'optional',
      disableInCodeBlocks: 'performance',
    },
    'prefer-date-now': {stylistic: true},
    'prefer-exponentiation-operator': {stylistic: true},
    'prefer-flatmap-over-map-flat': {stylistic: true},
    'prefer-get-or-insert': {disableInCodeBlocks: 'runtimeOnly'},
    'prefer-includes': {stylistic: true},
    'prefer-includes-over-regex-test': {
      autofixDisabled: [
        true,
        'the string methods throw on a non-string value the regex test would turn into a string, and values typed `any` are rewritten too',
      ],
      disableInCodeBlocks: 'performance',
    },
    'prefer-inline-equality': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'performance'},
    'prefer-nullish-coalescing': {
      stylistic: true,
      autofixDisabled: [
        true,
        // Reported: https://github.com/e18e/eslint-plugin/issues/167
        'the fix drops the semicolon, so a next line starting with `[` or `(` becomes part of the assignment',
      ],
    },
    'prefer-regex-test': {requiresTypeInfo: 'optional', disableInCodeBlocks: 'performance'},
    'prefer-slice-over-split-index': {disableInCodeBlocks: 'performance'},
    'prefer-spread-syntax': {
      requiresTypeInfo: 'optional',
      stylistic: true,
      autofixDisabled: [
        true,
        // Reported: https://github.com/e18e/eslint-plugin/issues/170
        'a `concat()` argument typed as either an element or an array gets nested instead of flattened, and spreading a non-iterable array-like throws',
      ],
    },
    'prefer-static-collator': {disableInCodeBlocks: 'performance', disableInTestFiles: true},
    'prefer-static-regex': {disableInCodeBlocks: 'performance', disableInTestFiles: true},
    'prefer-string-fromcharcode': {disableInCodeBlocks: 'performance'},
    'prefer-throw-if-no-entry': {disableInCodeBlocks: 'performance'},
    'prefer-timer-args': {
      autofixDisabled: [
        true,
        // Reported: https://github.com/e18e/eslint-plugin/issues/169
        'the arguments are read when the timer is set instead of when it fires',
      ],
      disableInCodeBlocks: 'performance',
    },
  },
});
