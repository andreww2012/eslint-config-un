import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {regex} from 'arkregex';
import {destr} from 'destr';
import {exec} from 'tinyexec';
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnConfigs} from '../src/configs';
import {type LoadablePluginPrefix, pluginsLoaders} from '../src/loaders';
import {fetchPackageInfo, objectEntriesUnsafe} from '../src/utils';

const versionAsIs = (version: string) => version;
const versionUnknown = () => '';

type GitTagResult = string | {url: string};

interface PackageMeta {
  configs: (keyof UnConfigs)[];
  ruleDocsUrl: ((ruleName: string) => string) | null;
  gitTag?: string | ((version: string) => GitTagResult);
}

const PACKAGES_META: Record<string, PackageMeta> = {
  ...Object.fromEntries(
    objectEntriesUnsafe({
      '@angular-eslint': {
        configs: ['angular'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
      },
      '@angular-eslint/template': {
        configs: ['angular'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/${ruleName}.md`,
      },
      '@cspell': {
        configs: ['cspell'],
        ruleDocsUrl: null, // Single rule
      },
      '@eslint-react': {
        configs: ['react'],
        ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
      },
      '@html-eslint': {
        configs: ['html'],
        ruleDocsUrl: (ruleName) => `https://html-eslint.org/docs/rules/${ruleName}`,
      },
      '@intlify/vue-i18n': {
        configs: ['vue'],
        ruleDocsUrl: (ruleName) =>
          `https://eslint-plugin-vue-i18n.intlify.dev/rules/${ruleName}.html`,
      },
      '@next/next': {
        configs: [
          'nextJs', // eslint-disable-line case-police/string-check
        ],
        ruleDocsUrl: (ruleName) => `https://nextjs.org/docs/messages/${ruleName}`,
      },
      '@stylistic': {
        configs: ['stylistic'],
        ruleDocsUrl: (ruleName) => `https://eslint.style/rules/${ruleName}`,
      },
      '@tanstack/query': {
        configs: ['tanstackQuery'],
        gitTag: versionUnknown,
        ruleDocsUrl: (ruleName) => `https://tanstack.com/query/latest/docs/eslint/${ruleName}`,
      },
      '@tanstack/router': {
        configs: ['tanstackRouter'],
        gitTag: versionUnknown,
        ruleDocsUrl: (ruleName) => `https://tanstack.com/router/latest/docs/eslint/${ruleName}`,
      },
      '@tanstack/start': {
        configs: ['tanstackStart'],
        gitTag: versionUnknown,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/TanStack/router/blob/HEAD/packages/eslint-plugin-start/${ruleName}.md`,
      },
      '@unocss': {
        configs: ['unocss'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/Gastonite/eslint-plugin-better-unocss/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      antfu: {
        configs: ['antfu'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/antfu/eslint-plugin-antfu/blob/HEAD/src/rules/${ruleName}.md`,
      },
      astro: {
        configs: ['astro'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-astro/rules/${ruleName}/`,
      },
      ava: {
        configs: ['ava'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'barrel-files': {
        configs: ['barrelFiles'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'better-tailwindcss': {
        configs: ['betterTailwind'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      boundaries: {
        configs: ['boundaries'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/javierbrea/eslint-plugin-boundaries/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'case-police': {
        configs: ['casePolice'],
        ruleDocsUrl: null, // Single rule
      },
      'check-file': {
        configs: ['checkFile'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      clsx: {
        configs: ['clsx'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/temoncher/eslint-plugin-clsx/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      command: {
        configs: ['command'],
        ruleDocsUrl: null, // Single rule
      },
      compat: {
        configs: ['compat'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/amilajack/eslint-plugin-compat/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      css: {
        configs: ['css'],
        gitTag: (version) => `css-v${version}`,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint/css/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'css-in-js': {
        configs: ['cssInJs'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-css/rules/${ruleName}.html`,
      },
      cypress: {
        configs: ['cypress'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'de-morgan': {
        configs: ['deMorgan'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/azat-io/eslint-plugin-de-morgan/blob/HEAD/docs/${ruleName}.md`,
      },
      depend: {
        configs: ['depend'],
        gitTag: versionAsIs,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      docusaurus: {
        configs: ['docusaurus'],
        ruleDocsUrl: (ruleName) =>
          `https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin/${ruleName}`,
      },
      e18e: {
        configs: ['e18e'],
        gitTag: versionAsIs,
        ruleDocsUrl: null, // No docs
      },
      ember: {
        configs: ['ember'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'erasable-syntax-only': {
        configs: ['erasableSyntaxOnly'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      es: {
        configs: ['es'],
        ruleDocsUrl: (ruleName) =>
          `https://eslint-community.github.io/eslint-plugin-es-x/rules/${ruleName}.html`,
      },
      'eslint-comments': {
        configs: ['eslintComments'],
        ruleDocsUrl: (ruleName) =>
          `https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/${ruleName}.html`,
      },
      'eslint-plugin': {
        configs: ['eslintPlugin'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'expect-type': {
        configs: ['expectType'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'fast-import': {
        configs: ['fastImport'],
        gitTag: versionAsIs,
        // Has custom URLs: https://github.com/nebrius/eslint-plugin-fast-import/blob/HEAD/src/rules/testInProd/README.md
        ruleDocsUrl: null,
      },
      'file-progress': {
        configs: ['fileProgress'],
        ruleDocsUrl: null, // Single rule
      },
      format: {
        configs: ['format'],
        ruleDocsUrl: null, // All docs on the single page
      },
      formatjs: {
        configs: ['formatJs'],
        gitTag: (tag) => `eslint-plugin-formatjs@${tag}`,
        ruleDocsUrl: (ruleName) => `https://formatjs.github.io/docs/tooling/linter/#${ruleName}`,
      },
      'github-actions': {
        configs: ['githubActions'],
        ruleDocsUrl: null, // No docs
      },
      graphql: {
        configs: ['graphql'],
        ruleDocsUrl: (ruleName) => `https://the-guild.dev/graphql/eslint/rules/${ruleName}`,
      },
      header: {
        configs: ['header'],
        ruleDocsUrl: null, // Single rule
      },
      headers: {
        configs: ['headers'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/robmisasi/eslint-plugin-headers/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      html: {
        configs: ['jsInline'],
        ruleDocsUrl: null, // No rules
      },
      import: {
        configs: ['import'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'import-zod': {
        configs: ['importZod'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/samchungy/eslint-plugin-import-zod/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      jest: {
        configs: ['jest'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'jest-dom': {
        configs: ['jestDom'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/testing-library/eslint-plugin-jest-dom/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'jest-extended': {
        configs: ['jest'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/jest-community/eslint-plugin-jest-extended/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      jsdoc: {
        configs: ['jsdoc'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'json-schema-validator': {
        configs: ['jsonSchemaValidator'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-json-schema-validator/rules/${ruleName}.html`,
      },
      jsonc: {
        configs: ['json'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-jsonc/rules/${ruleName}.html`,
      },
      'jsx-a11y': {
        configs: ['jsxA11y'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/es-tooling/eslint-plugin-jsx-a11y-x/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      lit: {
        configs: ['lit'],
        gitTag: versionAsIs,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/43081j/eslint-plugin-lit/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'lit-a11y': {
        configs: ['lit'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/open-wc/open-wc/blob/HEAD/packages/eslint-plugin-lit-a11y/docs/rules/${ruleName}.md`,
      },
      lockfile: {
        configs: ['lockfile'],
        gitTag: (tag) => `eslint-plugin-lockfile@${tag}`,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
      },
      markdown: {
        configs: ['markdown'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint/markdown/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'markdown-links': {
        configs: ['markdownLinks'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/${ruleName}.html`,
      },
      'markdown-preferences': {
        configs: ['markdownPreferences'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/${ruleName}.html`,
      },
      math: {
        configs: ['math'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-math/rules/${ruleName}.html`,
      },
      mdx: {
        configs: ['mdx'],
        gitTag: (tag) => `eslint-plugin-mdx@${tag}`,
        ruleDocsUrl: null, // Single rule
      },
      mocha: {
        configs: ['mocha'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'module-interop': {
        configs: ['moduleInterop'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-module-interop/rules/${ruleName}.html`,
      },
      nestjs: {
        configs: [
          'nestJs', // eslint-disable-line case-police/string-check
        ],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/${ruleName}.md`,
      },
      'no-only-tests': {
        configs: ['noOnlyTests'],
        ruleDocsUrl: null, // Single rule
      },
      'no-secrets': {
        configs: ['noSecrets'],
        ruleDocsUrl: null, // Single rule
      },
      'no-type-assertion': {
        configs: ['ts'],
        ruleDocsUrl: null, // Single rule
      },
      'no-unsanitized': {
        configs: ['noUnsanitized'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      node: {
        configs: ['node'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'node-dependencies': {
        configs: ['nodeDependencies'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-node-dependencies/rules/${ruleName}.html`,
      },
      nuxt: {
        configs: ['vue'],
        ruleDocsUrl: null, // Poor docs page: https://eslint.nuxt.com/packages/plugin
      },
      nx: {
        configs: ['nx'],
        gitTag: versionAsIs,
        // Some rules aren't documented
        ruleDocsUrl: (ruleName) =>
          `https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/${ruleName}`,
      },
      'package-json': {
        configs: ['packageJson'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      perfectionist: {
        configs: ['perfectionist'],
        ruleDocsUrl: (ruleName) => `https://perfectionist.dev/rules/${ruleName}`,
      },
      pinia: {
        configs: ['vue'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      playwright: {
        configs: ['playwright'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/playwright-community/eslint-plugin-playwright/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      pnpm: {
        configs: ['pnpm'],
        ruleDocsUrl: null, // No docs
      },
      'prefer-arrow-functions': {
        configs: ['preferArrowFunctions'],
        gitTag: versionAsIs,
        ruleDocsUrl: null, // Single rule
      },
      prettier: {
        configs: [],
        ruleDocsUrl: null, // Single rule
      },
      promise: {
        configs: ['promise'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      qunit: {
        configs: ['qunit'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      qwik: {
        configs: ['qwik'],
        gitTag: (version) => `eslint-plugin-qwik@${version}`,
        ruleDocsUrl: (ruleName) => `https://qwik.dev/docs/advanced/eslint/#${ruleName}`,
      },
      react: {
        configs: ['react'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/jsx-eslint/eslint-plugin-react/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'react-debug': {
        configs: ['react'],
        ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
      },
      'react-hooks': {
        configs: ['react'],
        gitTag:
          'https://github.com/facebook/react/blob/HEAD/packages/eslint-plugin-react-hooks/CHANGELOG.md',
        ruleDocsUrl: null, // No docs
      },
      'react-refresh': {
        configs: ['react'],
        ruleDocsUrl: null, // Single rule
      },
      'react-you-might-not-need-an-effect': {
        configs: ['react'],
        ruleDocsUrl: null, // No docs
      },
      regexp: {
        configs: ['regexp'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-regexp/rules/${ruleName}.html`,
      },
      rxjs: {
        configs: ['rxjs'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/${ruleName}.md`,
      },
      security: {
        configs: ['security'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'sentences-per-line': {
        configs: ['markdown'],
        gitTag: (version) => `eslint-plugin-sentences-per-line@v${version}`,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/JoshuaKGoldberg/sentences-per-line/blob/HEAD/packages/eslint-plugin-sentences-per-line/docs/rules/${ruleName}.md`,
      },
      solid: {
        configs: ['solid'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/${ruleName}.md`,
      },
      sonarjs: {
        configs: ['sonar'],
        gitTag: (version) => ({
          url: `https://github.com/SonarSource/SonarJS/blob/___INSERT-REF-HERE___/packages/jsts/src/rules/CHANGELOG.md#___INSERT-DATE-HERE___-version-${version.replaceAll(/\D/g, '')}`,
        }),
        ruleDocsUrl: null, // Custom URLs
      },
      sql: {
        configs: ['sql'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/gajus/eslint-plugin-sql/tree/HEAD?tab=readme-ov-file#${ruleName}`,
      },
      storybook: {
        configs: ['storybook'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/storybookjs/storybook/blob/HEAD/code/lib/eslint-plugin/docs/rules/${ruleName}.md`,
      },
      svelte: {
        configs: ['svelte'],
        gitTag: (version) => `eslint-plugin-svelte@${version}`,
        ruleDocsUrl: (ruleName) =>
          `https://sveltejs.github.io/eslint-plugin-svelte/rules/${ruleName}`,
      },
      tailwindcss: {
        configs: ['tailwind'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'testing-library': {
        configs: ['testingLibrary'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      toml: {
        configs: ['toml'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-toml/rules/${ruleName}.html`,
      },
      'tree-shaking': {
        configs: ['treeShaking'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/lukastaegert/eslint-plugin-tree-shaking/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      ts: {
        configs: ['ts'],
        ruleDocsUrl: (ruleName) => `https://typescript-eslint.io/rules/${ruleName}`,
      },
      turbo: {
        configs: ['turbo'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/${ruleName}.md`,
      },
      un: {
        configs: ['un'],
        ruleDocsUrl: null, // No docs
      },
      unicorn: {
        configs: ['unicorn'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      'unnecessary-abstractions': {
        configs: ['unnecessaryAbstractions'],
        ruleDocsUrl: null, // No docs
      },
      'unused-imports': {
        configs: ['unusedImports'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/sweepline/eslint-plugin-unused-imports/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      vitest: {
        configs: ['vitest'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      vue: {
        configs: ['vue'],
        ruleDocsUrl: (ruleName) => `https://eslint.vuejs.org/rules/${ruleName}.html`,
      },
      'vue-scoped-css': {
        configs: ['vue'],
        ruleDocsUrl: (ruleName) =>
          `https://future-architect.github.io/eslint-plugin-vue-scoped-css/rules/${ruleName}.html`,
      },
      'vuejs-accessibility': {
        configs: ['vue'],
        ruleDocsUrl: (ruleName) =>
          `https://vue-a11y.github.io/eslint-plugin-vuejs-accessibility/rules/${ruleName}.html`,
      },
      wc: {
        configs: ['webComponents'],
        gitTag: versionAsIs,
        ruleDocsUrl: (ruleName) =>
          `https://github.com/43081j/eslint-plugin-wc/blob/HEAD/docs/rules/${ruleName}.md`,
      },
      yaml: {
        configs: ['yaml'],
        ruleDocsUrl: (ruleName) =>
          `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
      },
      'you-dont-need-lodash-underscore': {
        configs: ['youDontNeedLodashUnderscore'],
        ruleDocsUrl: null, // No docs
      },
      zod: {
        configs: ['zod'],
        ruleDocsUrl: (ruleName) =>
          `https://github.com/marcalexiei/eslint-plugin-zod/blob/HEAD/docs/rules/${ruleName}.md`,
      },
    } satisfies Record<LoadablePluginPrefix, PackageMeta>).map(([pluginPrefix, meta]) => {
      const {packageName} = pluginsLoaders[pluginPrefix];
      return [packageName, meta];
    }),
  ),
  // Additional packages that are not eslint plugins but are tracked as dependencies
  '@html-eslint/parser': {
    configs: ['html'],
    ruleDocsUrl: null,
  },
  '@sveltejs/kit': {
    configs: ['svelte'],
    gitTag: (version) => `@sveltejs/kit@${version}`,
    ruleDocsUrl: null,
  },
  'astro-eslint-parser': {
    configs: ['astro'],
    ruleDocsUrl: null,
  },
  'ember-eslint-parser': {
    configs: ['ember'],
    ruleDocsUrl: null,
  },
  'eslint-no-restricted': {
    configs: [],
    gitTag: versionAsIs,
    ruleDocsUrl: null,
  },
  'svelte-eslint-parser': {
    configs: ['svelte'],
    ruleDocsUrl: null,
  },
  'tailwind-csstree': {
    configs: ['tailwind'],
    gitTag: (version) => `tailwind-csstree-v${version}`,
    ruleDocsUrl: null,
  },
  'vue-eslint-parser': {
    configs: ['vue'],
    ruleDocsUrl: null,
  },
};

/* eslint-disable perfectionist/sort-objects */

// =============================================================================

const updatedDependenciesInfo = await main();

const getCompareDiffUrl = (
  dependency: string,
  repoUrl: string,
  oldVersion: string,
  newVersion: string,
): string => {
  const gitTag = PACKAGES_META[dependency]?.gitTag;
  if (!gitTag) {
    return `${repoUrl}/compare/v${oldVersion}...v${newVersion}`;
  }
  if (typeof gitTag === 'string') {
    return gitTag;
  }
  const newTagResult = gitTag(newVersion);
  const oldTagResult = gitTag(oldVersion);
  if (typeof newTagResult === 'object') {
    return newTagResult.url;
  }
  if (typeof oldTagResult === 'object') {
    throw new TypeError(
      'gitTag function for new version returned a string, but for old version returned an object',
    );
  }
  return `${repoUrl}/compare/${oldTagResult}...${newTagResult}`;
};

const EXTENSIONS_TO_SKIP_IN_DIFF = new Set(['map', 'ts', 'cts', 'mts', 'tsbuildinfo']);
const EXTENSIONS_TO_SKIP_IN_DIFF_IF_COUNTERPART_FILE_EXISTS: Record<string, string[]> = {
  // For packages distributed as ESM+CJS (for example: eslint-plugin-zod-x@2.0.0)
  cjs: ['js', 'mjs'],
  cts: ['ts', 'mts'],
};

const FILE_HEADER_IN_DIFF_REGEXP = regex('^diff --git a/(.+) b/(.+)$');
// eslint-disable-next-line unicorn/prefer-string-raw
const FILE_OR_PATH_WITH_EXTENSION_REGEXP = regex('^(?<path>.*)\\.(?<extension>[a-z\\d]+)$');

for (let i = 0; i < updatedDependenciesInfo.length; i++) {
  // eslint-disable-next-line ts/no-non-null-assertion
  const {dependency, repoUrl, oldVersion, newVersion, codeDiffResult} = updatedDependenciesInfo[i]!;
  if (repoUrl == null) {
    continue;
  }

  if (i > 0) {
    console.log();
  }
  console.log(
    styleText('black', styleText('bgCyanBright', dependency)),
    `${styleText('gray', oldVersion)} →  ${styleText('green', newVersion)}`,
  );

  console.log(styleText('underline', 'Source code diff:'));

  const lines = codeDiffResult.stdout.trim().split('\n');
  const filesInDiff = lines
    .map((line) => {
      const match = FILE_HEADER_IN_DIFF_REGEXP.exec(line);
      if (!match) {
        return null;
      }
      const [, oldPath, newPath] = match;
      const oldPathExtensionMatch = FILE_OR_PATH_WITH_EXTENSION_REGEXP.exec(oldPath);
      const newPathExtensionMatch = FILE_OR_PATH_WITH_EXTENSION_REGEXP.exec(newPath);
      return {
        oldPath: {
          full: oldPath,
          extensionLess: oldPathExtensionMatch?.groups.path || oldPath,
          extension: oldPathExtensionMatch?.groups.extension,
        },
        newPath: {
          full: newPath,
          extensionLess: newPathExtensionMatch?.groups.path || newPath,
          extension: newPathExtensionMatch?.groups.extension,
        },
      };
    })
    .filter((v) => v != null);

  let diffForLastFileSkipped = false;
  for (const line of lines) {
    let isDiffHeader = line.startsWith('--- ') || line.startsWith('+++ ');
    const formattedLine = line.startsWith('@')
      ? styleText('cyan', line)
      : isDiffHeader
        ? styleText('magentaBright', line)
        : line.startsWith('+')
          ? styleText('green', line)
          : line.startsWith('-')
            ? styleText('red', line)
            : line.startsWith('\\') // Example: "\ No newline at end of file"
              ? styleText('gray', line)
              : line.startsWith(' ')
                ? line
                : ((isDiffHeader = true), styleText('magentaBright', line));
    const fileHeaderMatch = FILE_HEADER_IN_DIFF_REGEXP.exec(line);
    if (fileHeaderMatch) {
      // eslint-disable-next-line sonarjs/no-redundant-assignments
      isDiffHeader = true;
      const extensionMatch = FILE_OR_PATH_WITH_EXTENSION_REGEXP.exec(fileHeaderMatch[1]);
      if (extensionMatch) {
        const {extension, path: filePathExtensionLess} = extensionMatch.groups;
        const counterpartExtensions =
          EXTENSIONS_TO_SKIP_IN_DIFF_IF_COUNTERPART_FILE_EXISTS[extension];
        if (
          EXTENSIONS_TO_SKIP_IN_DIFF.has(extension) &&
          !fileHeaderMatch[2].endsWith(`.d.${extension}`)
        ) {
          diffForLastFileSkipped = true;
        } else if (counterpartExtensions) {
          diffForLastFileSkipped = filesInDiff.some(
            (fileInDiff) =>
              fileInDiff.newPath.extensionLess === filePathExtensionLess &&
              fileInDiff.newPath.extension &&
              counterpartExtensions.includes(fileInDiff.newPath.extension),
          );
        } else {
          diffForLastFileSkipped = false;
        }
      }
    }
    if (isDiffHeader || !diffForLastFileSkipped) {
      console.log(`  ${formattedLine}`);
    }
    if (line.startsWith('+++ ') && diffForLastFileSkipped) {
      console.log(`  ${styleText('yellow', 'Diff for this file is not shown')}`);
    }
  }

  const packageMeta = PACKAGES_META[dependency];

  const mainUnConfigNames = packageMeta?.configs.join(', ') || 'deps';

  console.log(`${styleText('underline', 'Repo:')} ${styleText('cyan', repoUrl)}`);
  console.log(`${styleText('underline', 'Releases:')} ${styleText('cyan', `${repoUrl}/releases`)}`);

  console.log(styleText('underline', 'For commit message:'));
  console.log(`chore(${mainUnConfigNames}): update ${dependency} to v${newVersion}`);
  console.log(
    `feat(${mainUnConfigNames}): update ${dependency} to v${newVersion} and enable ___INSERT-CHANGES___`,
  );

  console.log(styleText('underline', 'For changelog:'));
  console.log(
    `${mainUnConfigNames}: updated [\`${dependency}\` from v${oldVersion} to v${newVersion}](${getCompareDiffUrl(dependency, repoUrl, oldVersion, newVersion)}):

- 🟢 enabled [\`\`]() rule and added it to the \`noStylisticRules\` config
- 🟡 enabled [\`\`]() rule (warning) with the following default options:
- ❓ enabled conditionally [\`\`]() rule in ⚙️ \`\` sub-config
- 🔴 not enabled [\`\`]() rule
- ❌ \`\` rule was removed
- ⚠️ [\`\`]() rule was disabled because got deprecated
- 🔄 \`\` was renamed to [\`\`]()`,
  );

  if (packageMeta?.ruleDocsUrl) {
    console.log(styleText('underline', 'Rule docs URLs:'));
    console.log(packageMeta.ruleDocsUrl('INSERT-RULE-NAME'));
  }
}

const updatedProdDependencies = updatedDependenciesInfo.filter(
  ({dependency}) => dependency in ourPackageJson.dependencies,
);
const updatedOptionalPeerDependencies = updatedDependenciesInfo.filter(
  ({dependency}) =>
    dependency in ourPackageJson.devDependencies &&
    dependency in ourPackageJson.peerDependenciesMeta,
);
if (updatedProdDependencies.length + updatedOptionalPeerDependencies.length > 0) {
  console.log(
    styleText('underline', styleText('red', '\nPlease do not forget')),
    'to review new rules additions to decide which ones should be considered stylistic',
  );
  if (updatedOptionalPeerDependencies.length > 0) {
    console.log(
      styleText('underline', styleText('red', 'Please do not forget')),
      'to update peer dependency ranges for the following packages:',
    );
    console.log(
      updatedOptionalPeerDependencies
        .map(({dependency, newVersion}) => `"${dependency}": "^${newVersion}",`)
        .join('\n'),
    );
  }
}

// =============================================================================

function parsePackageJson(packageJsonText: string) {
  return PackageJsonZod.safeParse(destr(packageJsonText));
}

async function readRootPackageJson() {
  const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
  return parsePackageJson(await fs.readFile(packageJsonPath, 'utf8'));
}

async function readRootPackageJsonBeforeUncommittedChanges() {
  try {
    return parsePackageJson(
      (await exec('git', ['--no-pager', 'show', 'HEAD:package.json'])).stdout,
    );
  } catch {
    return null;
  }
}

async function getDependencyRepoUrl(dependency: string) {
  const info = await fetchPackageInfo(dependency);
  if (!info?.info) {
    return '';
  }

  const packageJson = structuredClone(info.info);
  const {repository} = packageJson;
  if (typeof repository === 'object') {
    // https://github.com/vercel/next.js/blob/v15.4.6/packages/eslint-plugin-next/package.json
    repository.type ||= 'git';
  }

  const dependencyPackageJsonParseResult = PackageJsonZod.safeParse(packageJson);
  if (!dependencyPackageJsonParseResult.success) {
    console.warn(
      `Failed to parse package.json of ${dependency}:`,
      dependencyPackageJsonParseResult.error,
    );
    return '';
  }

  const repoUrl = typeof repository === 'string' ? repository : repository?.url;
  if (!repoUrl) {
    return '';
  }

  let gitHubRepoPath: string | undefined;

  const repoUrlParsed = URL.parse(repoUrl);
  if (repoUrlParsed != null) {
    if (repoUrlParsed.hostname !== 'github.com') {
      // https://github.com/ArnaudBarre/eslint-plugin-react-refresh/blob/1d436ffd5ebc6127528cadb30057503720d8c9b1/scripts/bundle.ts#L33
      if (repoUrlParsed.protocol === 'github:') {
        gitHubRepoPath = repoUrlParsed.pathname;
      } else {
        console.warn(`Not a GitHub repository specified as repository for ${dependency}`);
        return '';
      }
    }

    // Might not always starts with `/`: https://npmx.dev/package-code/eslint-plugin-react-refresh/v/0.5.0/package.json#L8
    if (repoUrlParsed.pathname.startsWith('/')) {
      gitHubRepoPath = repoUrlParsed.pathname.slice(1);
    }
  }

  if (!gitHubRepoPath) {
    // https://github.com/vercel/next.js/blob/v15.4.6/packages/eslint-plugin-next/package.json
    const isGitHubRepoHostname = /^[\w-]+\/[\w\-.]+$/.test(repoUrl);
    if (isGitHubRepoHostname) {
      gitHubRepoPath = repoUrl;
    }
  }

  if (!gitHubRepoPath) {
    // https://github.com/ember-tooling/ember-eslint-parser/blob/v0.5.11-ember-eslint-parser/package.json
    const sshLikeUrlMatch = repoUrl.match(/^git@github.com:([\w-]+\/[\w\-.]+)\.git?$/);
    if (sshLikeUrlMatch) {
      gitHubRepoPath = sshLikeUrlMatch[1];
    }
  }

  if (!gitHubRepoPath) {
    console.warn(`Failed to parse repository URL of ${dependency}: ${repoUrl}`);
    return '';
  }

  // Ignore second slash onwards: https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/4.1.4/package.json#L42
  gitHubRepoPath = gitHubRepoPath.split('/').slice(0, 2).join('/');

  // Non-https protocol is used: https://github.com/webpack/enhanced-resolve/blob/v5.18.3/package.json
  return `https://github.com/${gitHubRepoPath}`.replace(/^git\+/, '').replace(/\.git$/, '');
}

async function main() {
  const [packageJsonParseResult, packageJsonBeforeChangesParseResult] = await Promise.all([
    readRootPackageJson(),
    readRootPackageJsonBeforeUncommittedChanges(),
  ]);

  if (!packageJsonParseResult.success) {
    console.error('Failed to parse package.json', packageJsonParseResult.error);
    process.exit(1);
  }

  if (!packageJsonBeforeChangesParseResult?.success) {
    console.error(
      'Failed to parse package.json before changes',
      packageJsonBeforeChangesParseResult?.error,
    );
    process.exit(1);
  }

  const packageJson = packageJsonParseResult.data;
  const packageJsonBeforeChanges = packageJsonBeforeChangesParseResult.data;

  const currentDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const dependenciesBeforeChanges = {
    ...packageJsonBeforeChanges.dependencies,
    ...packageJsonBeforeChanges.devDependencies,
  };

  const changedDependencies = Object.entries(currentDependencies).filter(
    ([dependency, version]) =>
      dependency in dependenciesBeforeChanges && version !== dependenciesBeforeChanges[dependency],
  );

  const result = await Promise.all(
    changedDependencies.map(async ([dependency, newVersion]) => {
      const repoUrl = (await getDependencyRepoUrl(dependency)) || null;
      // eslint-disable-next-line ts/no-non-null-assertion
      const oldVersion = dependenciesBeforeChanges[dependency]!;
      const codeDiffResult = await exec('npm', [
        'diff',
        `--diff=${dependency}@${oldVersion}`,
        `--diff=${dependency}@${newVersion}`,
      ]);

      return {
        dependency,
        repoUrl,
        oldVersion,
        newVersion,
        codeDiffResult,
      };
    }),
  );

  return result;
}

/* eslint-enable perfectionist/sort-objects */
