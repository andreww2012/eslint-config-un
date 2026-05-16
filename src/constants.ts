import ourPackageJson from '../package.json' with {type: 'json'};
import type {GetRuleNamesInPlugin} from './eslint/eslint-types';
import type {PluginPrefix} from './loaders';
// See https://github.com/typescript-eslint/typescript-eslint/issues/8721
import type {Tagged} from './types';
import {omit} from './utils';

export const OPTIONAL_PEER_DEPENDENCIES = omit(ourPackageJson.peerDependencies, ['eslint']);

/* Error levels */

export const ERROR = 2 as Tagged<2, 'error'>;
export const WARNING = 1 as Tagged<1, 'warning'>;
export const OFF = 0 as Tagged<0, 'off'>;

export type RuleSeverity = typeof ERROR | typeof WARNING | typeof OFF;

/* Other */

export const DISABLE_AUTOFIX = 'disable-autofix';
export const DISABLE_AUTOFIX_WITH_SLASH = `${DISABLE_AUTOFIX}/`;
export type DisableAutofixPrefix = typeof DISABLE_AUTOFIX;

/* Globs - Helpers */

export const GLOB_MAYBE_COMMONJS_OR_ESM = '?([cm])' as const;
export const GLOB_MAYBE_X = '?(x)' as const;
export const GLOB_JS_TS_ONLY_EXTENSION = '[jt]s' as const;

/* Globs - JS & TS */

export const GLOB_JS_TS_EXTENSION =
  `${GLOB_MAYBE_COMMONJS_OR_ESM}${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_JS_TS = `**/*.${GLOB_JS_TS_EXTENSION}` as const;

export const GLOB_JS_TS_X_EXTENSION = `${GLOB_JS_TS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_JS_TS_X = `**/*.${GLOB_JS_TS_X_EXTENSION}` as const;

export const GLOB_JSX_TSX_EXTENSION = `${GLOB_JS_TS_EXTENSION}x` as const;
export const GLOB_JSX_TSX = `**/*.${GLOB_JSX_TSX_EXTENSION}` as const;

/* Globs - TS */

export const GLOB_TS_EXTENSION = `${GLOB_MAYBE_COMMONJS_OR_ESM}ts` as const;
export const GLOB_TS = `**/*.${GLOB_TS_EXTENSION}` as const;

export const GLOB_TS_X_EXTENSION = `${GLOB_TS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_TS_X = `${GLOB_TS}${GLOB_MAYBE_X}` as const;

export const GLOB_TSX_EXTENSION = `${GLOB_TS_EXTENSION}x` as const;
export const GLOB_TSX = `${GLOB_TS}x` as const;

/* Globs - JS */

export const GLOB_JS_EXTENSION = `${GLOB_MAYBE_COMMONJS_OR_ESM}js` as const;
export const GLOB_JS = `**/*.${GLOB_JS_EXTENSION}` as const;

export const GLOB_JS_X_EXTENSION = `${GLOB_JS_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_JS_X = `${GLOB_JS}${GLOB_MAYBE_X}` as const;

export const GLOB_JSX_EXTENSION = `${GLOB_JS_EXTENSION}x` as const;
export const GLOB_JSX = `${GLOB_JS}x` as const;

/* Globs - CommonJS/ESM */

export const GLOB_CJS = '**/*.cjs' as const;
export const GLOB_MJS = '**/*.mjs' as const;
export const GLOB_CTS = '**/*.cts' as const;
export const GLOB_MTS = '**/*.mts' as const;
export const GLOB_CJSX = '**/*.cjsx' as const;
export const GLOB_MJSX = '**/*.mjsx' as const;
export const GLOB_CTSX = '**/*.ctsx' as const;
export const GLOB_MTSX = '**/*.mtsx' as const;
export const GLOB_CJS_CTS = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_MJS_MTS = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}` as const;
export const GLOB_CJS_CTS_X = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_MJS_MTS_X = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}${GLOB_MAYBE_X}` as const;
export const GLOB_CJSX_CTSX = `**/*.c${GLOB_JS_TS_ONLY_EXTENSION}x` as const;
export const GLOB_MJSX_MTSX = `**/*.m${GLOB_JS_TS_ONLY_EXTENSION}x` as const;

/* Globs - JSON & extensions */

export const GLOB_JSON = '**/*.json' as const;
export const GLOB_JSONC = `${GLOB_JSON}c` as const;
export const GLOB_JSON5 = `${GLOB_JSON}5` as const;

/* Globs - YAML */

export const GLOB_YML_YAML_EXTENSION = 'y?(a)ml' as const;
export const GLOB_YML_YAML = `**/*.${GLOB_YML_YAML_EXTENSION}` as const;

export const GLOB_YML = '**/*.yml' as const;
export const GLOB_YAML = '**/*.yaml' as const;

/* Globs - HTML */

export const GLOB_HTML = '**/*.html' as const;
export const GLOB_HTM = '**/*.htm' as const;
export const GLOB_HTM_HTML_EXTENSION = 'htm?(l)' as const;
export const GLOB_HTM_HTML = `**/*.${GLOB_HTM_HTML_EXTENSION}` as const;

/* Globs - other extensions */

export const GLOB_TOML = '**/*.toml' as const;

export const GLOB_VUE = '**/*.vue' as const;

export const GLOB_CSS = '**/*.css' as const;

export const GLOB_ASTRO = '**/*.astro' as const;

export const GLOB_SVELTE = '**/*.svelte' as const;

export const GLOB_GRAPHQL = '**/*.{graphql,gql}' as const;

export const GLOB_FLOW = '**/*.flow' as const;

export const GLOB_EMBER_GLIMMER = '**/*.{gjs,gts}' as const;

export const GLOB_TSRX = '**/*.tsrx' as const;

export const GLOB_RIPPLE = '**/*.ripple' as const;

/* Globs - misc */

export const GLOB_PACKAGE_JSON = '**/package.json' as const;

export const GLOB_CONFIG_FILES = [
  `**/*.config.${GLOB_JS_TS_X_EXTENSION}` as const,
  `**/.*rc.${GLOB_JS_TS_X_EXTENSION}` as const,
];

const GLOB_SUPPORTED_EXTENSIONS = [
  GLOB_JS_TS_X_EXTENSION,
  'vue',
  'json',
  'jsonc',
  'json5',
  GLOB_YML_YAML_EXTENSION,
  'toml',
  GLOB_HTM_HTML_EXTENSION,
  'css',
  'astro',
  'svelte',
  'graphql',
  'gql',
  'gjs',
  'gts',
].join(',');

/* Globs - Markdown & extensions */

export const GLOB_MARKDOWN = '**/*.md' as const;
export const GLOB_MARKDOWN_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MARKDOWN}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MARKDOWN_ALL_CODE_BLOCKS = `${GLOB_MARKDOWN}/**/*.*` as const;

export const GLOB_MDX = '**/*.mdx' as const;
export const GLOB_MDX_SUPPORTED_CODE_BLOCKS =
  `${GLOB_MDX}/**/*.{${GLOB_SUPPORTED_EXTENSIONS}}` as const;
export const GLOB_MDX_ALL_CODE_BLOCKS = `${GLOB_MDX}/**/*.*` as const;

export const GLOB_MD_X_CODE_BLOCKS = '**/*.md?(x)/**/*.*' as const;

/* Misc */

export const DEFAULT_GLOBAL_IGNORES = ['**/dist'] as const;

export const CHECKED_LODASH_METHODS = [
  'assign',
  'bind',
  'capitalize',
  'concat',
  'contains',
  'defaults',
  'drop',
  'every',
  'fill',
  'filter',
  'find',
  'first',
  'flatten',
  'get',
  'head',
  'includes',
  'join',
  'keys',
  'last',
  'map',
  'omit',
  'pairs',
  'reduce',
  'repeat',
  'replace',
  'reverse',
  'size',
  'slice',
  'some',
  'split',
  'throttle',
  'trim',
  'uniq',
  'values',
] as const;

export const PACKAGES_TO_GET_INFO_FOR = [
  'prettier',
  'typescript',
  'graphql',
  '@tanstack/query-core',
  '@tanstack/react-router',
  '@tanstack/solid-router',
  '@tanstack/react-start',
  '@tanstack/solid-start',
  'storybook',
  'tailwindcss',
  'stylelint',
  'jest',
  'vitest',
  'ava',
  '@testing-library/dom',
  'cypress',
  'mocha',
  'turbo',
  'playwright',
  'qunit',
  'lodash',
  'lodash-es',
  ...CHECKED_LODASH_METHODS.map((method) => `lodash.${method}` as const),
  'rxjs',
  'nx',
  'zod',
  'unocss',
  '@formatjs/icu-messageformat-parser',
  '@docusaurus/core',
  'drizzle-orm',
  '@testing-library/jest-dom',
  'clsx',
  'mobx',
  'aws-cdk-lib',
  'remeda',

  'astro',
  'vue',
  'react',
  'next',
  'svelte',
  'solid-js',
  '@angular/core',
  '@ngrx/store',
  // We don't need to check for the presence of `@builder.io/qwik-city` because
  // it requires `@builder.io/qwik` to be installed anyway
  '@builder.io/qwik',
  '@qwik.dev/core',
  'ember-source',
  'lit',
  '@nestjs/core',
  'ripple',
] as const;

export const TS_PLUGIN_TYPE_AWARE_RULES = [
  'await-thenable',
  'consistent-return',
  'consistent-type-exports',
  'dot-notation',
  'naming-convention',
  'no-array-delete',
  'no-base-to-string',
  'no-confusing-void-expression',
  'no-deprecated',
  'no-duplicate-type-constituents',
  'no-floating-promises',
  'no-for-in-array',
  'no-implied-eval',
  'no-meaningless-void-operator',
  'no-misused-promises',
  'no-misused-spread',
  'no-mixed-enums',
  'no-redundant-type-constituents',
  'no-unnecessary-boolean-literal-compare',
  'no-unnecessary-condition',
  'no-unnecessary-qualifier',
  'no-unnecessary-template-expression',
  'no-unnecessary-type-arguments',
  'no-unnecessary-type-assertion',
  'no-unnecessary-type-conversion',
  'no-unnecessary-type-parameters',
  'no-unsafe-argument',
  'no-unsafe-assignment',
  'no-unsafe-call',
  'no-unsafe-enum-comparison',
  'no-unsafe-member-access',
  'no-unsafe-return',
  'no-unsafe-type-assertion',
  'no-unsafe-unary-minus',
  'no-useless-default-assignment',
  'non-nullable-type-assertion-style',
  'only-throw-error',
  'prefer-destructuring',
  'prefer-find',
  'prefer-includes',
  'prefer-nullish-coalescing',
  'prefer-optional-chain',
  'prefer-promise-reject-errors',
  'prefer-readonly',
  'prefer-readonly-parameter-types',
  'prefer-reduce-type-parameter',
  'prefer-regexp-exec',
  'prefer-return-this-type',
  'prefer-string-starts-ends-with',
  'promise-function-async',
  'related-getter-setter-pairs',
  'require-array-sort-compare',
  'require-await',
  'restrict-plus-operands',
  'restrict-template-expressions',
  'return-await',
  'strict-boolean-expressions',
  'strict-void-return',
  'switch-exhaustiveness-check',
  'unbound-method',
  'use-unknown-in-catch-callback-variable',
] satisfies GetRuleNamesInPlugin<'ts'>[];

export const RULES_REQUIRING_TYPE_INFORMATION: Partial<
  Record<
    PluginPrefix,
    {
      rules: Partial<Record<string, true | 'optional'>>;
      extraPatterns?: string[];
      extraFileExtensions?: `.${string}`[];
    }
  >
> = {
  awscdk: {
    rules: {
      'construct-constructor-property': true,
      'no-construct-in-interface': true,
      'no-construct-in-public-property-of-construct': true,
      'no-construct-stack-suffix': true,
      'no-mutable-public-property-of-construct': true,
      'no-parent-name-construct-id-match': true,
      'no-unused-props': true,
      'no-variable-construct-id': true,
      'pascal-case-construct-id': true,
      'prefer-grants-property': true,
      'prevent-construct-id-collision': true,
      'props-name-convention': true,
      'require-jsdoc': true,
      'require-passing-this': true,
    },
  },
  e18e: {
    rules: {
      'prefer-array-to-reversed': 'optional',
      'prefer-array-to-sorted': 'optional',
      'no-indexof-equality': true,
      'prefer-inline-equality': 'optional',
      'prefer-regex-test': 'optional',
    },
  },
  ember: {
    rules: {
      'template-no-deprecated': 'optional',
    },
  },
  'eslint-plugin': {
    rules: {
      'no-property-in-node': true,
    },
  },
  'expect-type': {
    rules: {
      expect: true,
    },
  },
  functional: {
    rules: {
      'functional-parameters': 'optional',
      'immutable-data': true,
      'no-conditional-statements': true,
      'no-expression-statements': 'optional',
      'no-mixed-types': true,
      'no-return-void': true,
      'no-throw-statements': 'optional',
      'prefer-immutable-types': true,
      'prefer-property-signatures': true,
      'prefer-tacit': true,
      'readonly-type': true,
      'type-declaration-immutability': true,
    },
  },
  jest: {
    rules: {
      'no-error-equal': true,
      'no-unnecessary-assertion': true,
      'unbound-method': true,
      'valid-expect-with-promise': true,
    },
  },
  nestjs: {
    rules: {
      'api-enum-property-best-practices': true,
      'all-properties-have-explicit-defined': true,
      'validated-non-primitive-property-needs-type-decorator': true,
    },
  },
  '@ngrx': {
    rules: {
      'avoid-cyclic-effects': true,
      'no-multiple-actions-in-effects': true,
      'signal-state-no-arrays-at-root-level': true,
      'with-state-no-arrays-at-root-level': true,
    },
  },
  '@eslint-react': {
    rules: {
      'no-implicit-children': true,
      'no-implicit-key': true,
      'no-implicit-ref': true,
      'no-leaked-conditional-rendering': true,
      'no-unused-props': true,
    },
  },
  sonarjs: {
    rules: {
      'anchor-precedence': true,
      'argument-type': true,
      'arguments-order': true,
      'array-callback-without-return': true,
      'class-prototype': true,
      'concise-regex': true,
      deprecation: true,
      'different-types-comparison': true,
      'disabled-auto-escaping': true,
      'disabled-resource-integrity': true,
      'dompurify-unsafe-config': 'optional',
      'duplicates-in-character-class': true,
      'empty-string-repetition': true,
      'existing-groups': true,
      'function-return-type': true,
      'in-operator-type-error': true,
      'index-of-compare-to-positive-number': true,
      'jsx-no-leaked-render': true,
      'new-operator-misuse': true,
      'no-alphabetical-sort': true,
      'no-array-delete': true,
      'no-associative-arrays': true,
      'no-collection-size-mischeck': true,
      'no-control-regex': true,
      'no-empty-after-reluctant': true,
      'no-empty-alternatives': true,
      'no-empty-character-class': true,
      'no-empty-group': true,
      'no-for-in-iterable': true,
      'no-ignored-return': true,
      'no-in-misuse': true,
      'no-incorrect-string-concat': true,
      'no-invalid-regexp': true,
      'no-misleading-array-reverse': true,
      'no-misleading-character-class': true,
      'no-redundant-optional': true,
      'no-regex-spaces': true,
      'no-require-or-define': true,
      'no-return-type-any': true,
      'no-selector-parameter': true,
      'no-try-promise': true,
      'no-undefined-argument': true,
      'no-useless-intersection': true,
      'non-number-in-arithmetic-expression': true,
      'null-dereference': true,
      'operation-returning-nan': true,
      'post-message': true,
      'prefer-read-only-props': true,
      'prefer-regexp-exec': true,
      'reduce-initial-value': true,
      'regex-complexity': true,
      'single-char-in-character-classes': true,
      'single-character-alternation': true,
      'slow-regex': true,
      'strings-comparison': true,
      'unicode-aware-regex': true,
      'unused-import': true,
      'unused-named-groups': true,
      'values-not-convertible-to-numbers': true,
      'void-use': true,
    },
  },
  svelte: {
    rules: {
      'no-unused-props': 'optional',
    },
    extraPatterns: [GLOB_SVELTE],
    extraFileExtensions: ['.svelte'],
  },
  ts: {
    rules: Object.fromEntries(TS_PLUGIN_TYPE_AWARE_RULES.map((ruleName) => [ruleName, true])),
  },
  vitest: {
    rules: {
      'prefer-vi-mocked': true,
      'unbound-method': true,
    },
  },
} satisfies {
  [Plugin in PluginPrefix]?: {
    rules: Partial<Record<GetRuleNamesInPlugin<Plugin>, true | 'optional'>>;
    extraPatterns?: string[];
    extraFileExtensions?: `.${string}`[];
  };
};
