import {objectFromEntriesUnsafe} from '@andreww2012/unutils';
import type {UnConfigs} from '../../src/configs';
import {type LoadablePluginPrefix, pluginsLoaders} from '../../src/loaders';
import {objectEntriesUnsafe} from '../../src/utils';

const versionAsIs = (version: string) => version;
const versionUnknown = () => '';

type GitTagResult = string | {url: string};

interface PackageMeta {
  configs: (keyof UnConfigs)[];
  ruleDocsUrl: ((ruleName: string) => string) | null;
  gitTag?: string | ((version: string) => GitTagResult);

  /**
   * Only meaningful for a plugin serving a Config several plugins serve: says which of them the
   * generated `🧩 Main plugin` line of that Config names
   */
  isMainPlugin?: true;

  pluginDocsUrl?:
    | string
    | {
        url: string;
        /** @default 'docs' */
        label: string;
      };
}

interface PluginPackageMeta extends PackageMeta {
  pluginPrefix: LoadablePluginPrefix;
}

export const PLUGIN_PACKAGES_META: Record<string, PluginPackageMeta> = Object.fromEntries(
  objectEntriesUnsafe({
    angular: {
      configs: ['angular'],
      isMainPlugin: true,
      pluginDocsUrl:
        'https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
    },
    'angular-template': {
      configs: ['angular'],
      ruleDocsUrl: (ruleName) =>
        `https://github.com/angular-eslint/angular-eslint/blob/HEAD/packages/eslint-plugin-template/docs/rules/${ruleName}.md`,
    },
    antfu: {
      configs: ['antfu'],
      pluginDocsUrl: 'https://github.com/antfu/eslint-plugin-antfu/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/antfu/eslint-plugin-antfu/blob/HEAD/src/rules/${ruleName}.md`,
    },
    'arrow-return-style': {
      configs: ['arrowReturnStyle'],
      pluginDocsUrl:
        'https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/christopher-buss/eslint-plugin-arrow-return-style-x/blob/HEAD/src/rules/${ruleName}/documentation.md`,
    },
    astro: {
      configs: ['astro'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-astro',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-astro/rules/${ruleName}`,
    },
    ava: {
      configs: ['ava'],
      pluginDocsUrl: 'https://github.com/avajs/eslint-plugin-ava/blob/HEAD/readme.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/avajs/eslint-plugin-ava/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    awscdk: {
      configs: ['awsCdk'],
      gitTag: (version) => `eslint-plugin-awscdk@${version}`,
      pluginDocsUrl: 'https://awscdk-lint.dev',
      ruleDocsUrl: (ruleName) => `https://awscdk-lint.dev/rules/${ruleName}.html`,
    },
    'barrel-files': {
      configs: ['barrelFiles'],
      pluginDocsUrl: 'https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/thepassle/eslint-plugin-barrel-files/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'better-tailwindcss': {
      configs: ['betterTailwind'],
      pluginDocsUrl:
        'https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    boundaries: {
      configs: ['boundaries'],
      pluginDocsUrl: 'https://www.jsboundaries.dev',
      ruleDocsUrl: (ruleName) => `https://jsboundaries.dev/docs/rules/${ruleName}`,
    },
    'case-police': {
      configs: ['casePolice'],
      pluginDocsUrl: 'https://github.com/antfu/case-police/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    'check-file': {
      configs: ['checkFile'],
      pluginDocsUrl: 'https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/dukeluo/eslint-plugin-check-file/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    clsx: {
      configs: ['clsx'],
      pluginDocsUrl: 'https://github.com/temoncher/eslint-plugin-clsx/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/temoncher/eslint-plugin-clsx/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    command: {
      configs: ['command'],
      pluginDocsUrl: 'https://eslint-plugin-command.antfu.me',
      ruleDocsUrl: null, // Single rule
    },
    compat: {
      configs: ['compat'],
      pluginDocsUrl: 'https://github.com/amilajack/eslint-plugin-compat/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/amilajack/eslint-plugin-compat/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    cspell: {
      configs: ['cspell'],
      pluginDocsUrl:
        'https://github.com/streetsidesoftware/cspell/blob/HEAD/packages/cspell-eslint-plugin/README.md',
      ruleDocsUrl: null, // Single rule
    },
    css: {
      configs: ['css'],
      gitTag: (version) => `css-v${version}`,
      pluginDocsUrl: 'https://github.com/eslint/css/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint/css/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'css-in-js': {
      configs: ['cssInJs'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-css',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-css/rules/${ruleName}.html`,
    },
    cypress: {
      configs: ['cypress'],
      pluginDocsUrl: 'https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/cypress-io/eslint-plugin-cypress/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'de-morgan': {
      configs: ['deMorgan'],
      pluginDocsUrl: 'https://github.com/azat-io/eslint-plugin-de-morgan/blob/HEAD/readme.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/azat-io/eslint-plugin-de-morgan/blob/HEAD/docs/${ruleName}.md`,
    },
    depend: {
      configs: ['depend'],
      gitTag: versionAsIs,
      pluginDocsUrl: 'https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/es-tooling/eslint-plugin-depend/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    docusaurus: {
      configs: ['docusaurus'],
      pluginDocsUrl: 'https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin',
      ruleDocsUrl: (ruleName) =>
        `https://docusaurus.io/docs/api/misc/@docusaurus/eslint-plugin/${ruleName}`,
    },
    drizzle: {
      configs: ['drizzle'],
      pluginDocsUrl:
        'https://github.com/drizzle-team/drizzle-orm/blob/HEAD/eslint-plugin-drizzle/readme.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/drizzle-team/drizzle-orm/blob/main/eslint-plugin-drizzle/readme.md#:~:text=${ruleName}:`,
    },
    e18e: {
      configs: ['e18e'],
      gitTag: versionAsIs,
      pluginDocsUrl: 'https://github.com/e18e/eslint-plugin/blob/HEAD/README.md',
      ruleDocsUrl: null, // No docs
    },
    ember: {
      configs: ['ember'],
      pluginDocsUrl: 'https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/ember-cli/eslint-plugin-ember/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'erasable-syntax-only': {
      configs: ['erasableSyntaxOnly'],
      gitTag: versionAsIs,
      pluginDocsUrl:
        'https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/JoshuaKGoldberg/eslint-plugin-erasable-syntax-only/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    es: {
      configs: ['es'],
      pluginDocsUrl: 'https://eslint-community.github.io/eslint-plugin-es-x',
      ruleDocsUrl: (ruleName) =>
        `https://eslint-community.github.io/eslint-plugin-es-x/rules/${ruleName}.html`,
    },
    'eslint-comments': {
      configs: ['eslintComments'],
      pluginDocsUrl: 'https://eslint-community.github.io/eslint-plugin-eslint-comments',
      ruleDocsUrl: (ruleName) =>
        `https://eslint-community.github.io/eslint-plugin-eslint-comments/rules/${ruleName}.html`,
    },
    'eslint-plugin': {
      configs: ['eslintPlugin'],
      pluginDocsUrl:
        'https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint-community/eslint-plugin-eslint-plugin/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'eslint-react': {
      configs: ['react'],
      ruleDocsUrl: (ruleName) => `https://eslint-react.xyz/docs/rules/${ruleName}`,
    },
    'expect-type': {
      configs: ['expectType'],
      pluginDocsUrl:
        'https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/JoshuaKGoldberg/eslint-plugin-expect-type/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    expo: {
      configs: ['expo'],
      gitTag: 'https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/CHANGELOG.md',
      pluginDocsUrl: 'https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/expo/expo/blob/HEAD/packages/eslint-plugin-expo/docs/rules/${ruleName}.md`,
    },
    'file-progress': {
      configs: ['fileProgress'],
      pluginDocsUrl: 'https://github.com/sibiraj-s/eslint-plugin-file-progress/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    format: {
      configs: ['format'],
      pluginDocsUrl: 'https://github.com/antfu/eslint-plugin-format/blob/HEAD/README.md',
      ruleDocsUrl: null, // All docs on the single page
    },
    formatjs: {
      configs: ['formatJs'],
      gitTag: (tag) => `eslint-plugin-formatjs@${tag}`,
      pluginDocsUrl: 'https://formatjs.github.io/docs/tooling/linter',
      ruleDocsUrl: (ruleName) => `https://formatjs.github.io/docs/tooling/linter/#${ruleName}`,
    },
    functional: {
      configs: ['functional'],
      pluginDocsUrl:
        'https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint-functional/eslint-plugin-functional/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'github-actions': {
      configs: ['githubActions'],
      pluginDocsUrl: 'https://eslint-plugin-github-action.ntnyq.com',
      ruleDocsUrl: (ruleName) => `https://eslint-plugin-github-action.ntnyq.com/rules/${ruleName}`,
    },
    graphql: {
      configs: ['graphql'],
      gitTag: (tag) => `@graphql-eslint/eslint-plugin@${tag}`,
      pluginDocsUrl: 'https://the-guild.dev/graphql/eslint/docs',
      ruleDocsUrl: (ruleName) => `https://the-guild.dev/graphql/eslint/rules/${ruleName}`,
    },
    header: {
      configs: ['header'],
      pluginDocsUrl: 'https://github.com/Stuk/eslint-plugin-header/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    headers: {
      configs: ['headers'],
      pluginDocsUrl: 'https://github.com/robmisasi/eslint-plugin-headers/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/robmisasi/eslint-plugin-headers/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    html: {
      configs: ['html'],
      pluginDocsUrl: 'https://html-eslint.org/docs/getting-started',
      ruleDocsUrl: (ruleName) => `https://html-eslint.org/docs/rules/${ruleName}`,
    },
    'html-processor': {
      configs: ['jsInline'],
      pluginDocsUrl: 'https://github.com/BenoitZugmeyer/eslint-plugin-html/blob/HEAD/README.md',
      ruleDocsUrl: null, // No rules
    },
    import: {
      configs: ['import'],
      pluginDocsUrl: 'https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/un-ts/eslint-plugin-import-x/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'import-integrity': {
      configs: ['importIntegrity'],
      pluginDocsUrl: 'https://github.com/nebrius/import-integrity-lint/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://nebrius.github.io/import-integrity-lint/rules/${ruleName}`,
    },
    'import-zod': {
      configs: ['importZod'],
      pluginDocsUrl: 'https://github.com/samchungy/eslint-plugin-import-zod/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/samchungy/eslint-plugin-import-zod/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    jest: {
      configs: ['jest'],
      isMainPlugin: true,
      pluginDocsUrl: 'https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/jest-community/eslint-plugin-jest/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'jest-dom': {
      configs: ['jestDom'],
      pluginDocsUrl:
        'https://github.com/testing-library/eslint-plugin-jest-dom/blob/HEAD/README.md',
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
      pluginDocsUrl: 'https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/gajus/eslint-plugin-jsdoc/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    json: {
      configs: ['json'],
      gitTag: (version) => `json-v${version}`,
      pluginDocsUrl: 'https://github.com/eslint/json/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint/json/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'json-schema-validator': {
      configs: ['jsonSchemaValidator'],
      pluginDocsUrl: {
        label: 'the single rule docs',
        url: 'https://github.com/ota-meshi/eslint-plugin-json-schema-validator/blob/HEAD/docs/rules/no-invalid.md',
      },
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-json-schema-validator/rules/${ruleName}.html`,
    },
    jsonc: {
      configs: ['jsonc'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-jsonc',
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
      isMainPlugin: true,
      pluginDocsUrl: 'https://github.com/43081j/eslint-plugin-lit/blob/HEAD/README.md',
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
      pluginDocsUrl:
        'https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/ljharb/lockfile-tools/blob/HEAD/packages/eslint-plugin/docs/rules/${ruleName}.md`,
    },
    markdown: {
      configs: ['markdown'],
      isMainPlugin: true,
      pluginDocsUrl: 'https://github.com/eslint/markdown/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint/markdown/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'markdown-links': {
      configs: ['markdownLinks'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-markdown-links',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-markdown-links/rules/${ruleName}.html`,
    },
    'markdown-preferences': {
      configs: ['markdownPreferences'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-markdown-preferences',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-markdown-preferences/rules/${ruleName}.html`,
    },
    math: {
      configs: ['math'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-math',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-math/rules/${ruleName}.html`,
    },
    mdx: {
      configs: ['mdx'],
      gitTag: (tag) => `eslint-plugin-mdx@${tag}`,
      pluginDocsUrl: 'https://github.com/mdx-js/eslint-mdx/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    mobx: {
      configs: ['mobx'],
      gitTag: (tag) => `eslint-plugin-mobx@${tag}`,
      pluginDocsUrl:
        'https://github.com/mobxjs/mobx/blob/main/packages/eslint-plugin-mobx/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/mobxjs/mobx/blob/HEAD/packages/eslint-plugin-mobx/README.md#mobx${ruleName}`,
    },
    mocha: {
      configs: ['mocha'],
      gitTag: (tag) => `eslint-plugin-mocha@${tag}`,
      pluginDocsUrl: 'https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/lo1tuma/eslint-plugin-mocha/blob/HEAD/documentation/rules/${ruleName}.md`,
    },
    'module-interop': {
      configs: ['moduleInterop'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-module-interop',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-module-interop/rules/${ruleName}.html`,
    },
    nestjs: {
      configs: [
        'nestJs', // eslint-disable-line case-police/string-check
      ],
      pluginDocsUrl:
        'https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/darraghoriordan/eslint-plugin-nestjs-typed/blob/HEAD/src/docs/rules/${ruleName}.md`,
    },
    nextjs: {
      configs: [
        'nextJs', // eslint-disable-line case-police/string-check
      ],
      pluginDocsUrl: 'https://nextjs.org/docs/app/api-reference/config/eslint',
      ruleDocsUrl: (ruleName) => `https://nextjs.org/docs/messages/${ruleName}`,
    },
    ngrx: {
      configs: ['ngrx'],
      gitTag: versionAsIs,
      pluginDocsUrl: 'https://ngrx.io/guide/eslint-plugin',
      ruleDocsUrl: (ruleName) => `https://ngrx.io/guide/eslint-plugin/rules/${ruleName}`,
    },
    'no-only-tests': {
      configs: ['noOnlyTests'],
      pluginDocsUrl:
        'https://github.com/levibuzolic/eslint-plugin-no-only-tests/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    'no-relative-import-paths': {
      configs: ['noRelativeImportPaths'],
      pluginDocsUrl:
        'https://github.com/MelvinVermeer/eslint-plugin-no-relative-import-paths/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    'no-secrets': {
      configs: ['noSecrets'],
      pluginDocsUrl: 'https://github.com/nickdeis/eslint-plugin-no-secrets/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    'no-type-assertion': {
      configs: ['ts'],
      ruleDocsUrl: null, // Single rule
    },
    'no-unsanitized': {
      configs: ['noUnsanitized'],
      pluginDocsUrl: 'https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/mozilla/eslint-plugin-no-unsanitized/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    node: {
      configs: ['node'],
      pluginDocsUrl: 'https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'node-dependencies': {
      configs: ['nodeDependencies'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-node-dependencies',
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
      pluginDocsUrl: 'https://nx.dev/docs/technologies/eslint/eslint-plugin',
      ruleDocsUrl: (ruleName) =>
        `https://nx.dev/docs/technologies/eslint/eslint-plugin/guides/${ruleName}`,
    },
    'package-json': {
      configs: ['packageJson'],
      pluginDocsUrl:
        'https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) => `https://eslint-plugin-package-json.dev/rules/${ruleName}`,
    },
    perfectionist: {
      configs: ['perfectionist'],
      pluginDocsUrl: 'https://perfectionist.dev',
      ruleDocsUrl: (ruleName) => `https://perfectionist.dev/rules/${ruleName}`,
    },
    pinia: {
      configs: ['vue'],
      ruleDocsUrl: (ruleName) =>
        `https://github.com/lisilinhart/eslint-plugin-pinia/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    playwright: {
      configs: ['playwright'],
      pluginDocsUrl: 'https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/mskelton/eslint-plugin-playwright/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    pnpm: {
      configs: ['pnpm'],
      ruleDocsUrl: null, // No docs
    },
    'prefer-arrow-functions': {
      configs: ['preferArrowFunctions'],
      gitTag: versionAsIs,
      pluginDocsUrl:
        'https://github.com/JamieMason/eslint-plugin-prefer-arrow-functions/blob/HEAD/README.md',
      ruleDocsUrl: null, // Single rule
    },
    prettier: {
      configs: [],
      ruleDocsUrl: null, // Single rule
    },
    promise: {
      configs: ['promise'],
      pluginDocsUrl:
        'https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/eslint-community/eslint-plugin-promise/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    qunit: {
      configs: ['qunit'],
      pluginDocsUrl: 'https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/qunitjs/eslint-plugin-qunit/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    qwik: {
      configs: ['qwik'],
      gitTag: (version) => `eslint-plugin-qwik@${version}`,
      pluginDocsUrl: 'https://qwik.dev/docs/advanced/eslint',
      ruleDocsUrl: (ruleName) => `https://qwik.dev/docs/advanced/eslint/#${ruleName}`,
    },
    react: {
      configs: ['react'],
      isMainPlugin: true,
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
        'https://github.com/react/react/blob/HEAD/packages/eslint-plugin-react-hooks/CHANGELOG.md',
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
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-regexp',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-regexp/rules/${ruleName}.html`,
    },
    remeda: {
      configs: ['remeda'],
      pluginDocsUrl:
        'https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/AndreaPontrandolfo/eslint-plugin-remeda/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    ripple: {
      configs: ['ripple'],
      gitTag: (version) => `@tsrx/eslint-plugin@${version}`,
      pluginDocsUrl: 'https://github.com/tsrx-org/tsrx/blob/HEAD/packages/eslint-plugin/README.md',
      ruleDocsUrl: null, // No docs
    },
    rxjs: {
      configs: ['rxjs'],
      pluginDocsUrl: 'https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/DaveMBush/eslint-plugin-rxjs/blob/HEAD/packages/eslint-plugin-rxjs/docs/rules/${ruleName}.md`,
    },
    security: {
      configs: ['security'],
      gitTag: (version) => `eslint-plugin-security-v${version}`,
      pluginDocsUrl:
        'https://github.com/eslint-community/eslint-plugin-security/blob/HEAD/README.md',
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
      pluginDocsUrl: 'https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/solidjs-community/eslint-plugin-solid/blob/HEAD/packages/eslint-plugin-solid/docs/${ruleName}.md`,
    },
    sonarjs: {
      configs: ['sonar'],
      gitTag: (version) => ({
        url: `https://github.com/SonarSource/SonarJS/blob/___INSERT-REF-HERE___/packages/analysis/src/jsts/rules/CHANGELOG.md#___INSERT-DATE-HERE___-version-${version.replaceAll(/\D/g, '')}`,
      }),
      pluginDocsUrl:
        'https://github.com/SonarSource/SonarJS/blob/HEAD/packages/analysis/src/jsts/rules/README.md',
      ruleDocsUrl: null, // Custom URLs
    },
    sql: {
      configs: ['sql'],
      pluginDocsUrl: 'https://github.com/gajus/eslint-plugin-sql/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/gajus/eslint-plugin-sql/tree/HEAD?tab=readme-ov-file#${ruleName}`,
    },
    storybook: {
      configs: ['storybook'],
      pluginDocsUrl: 'https://storybook.js.org/docs/configure/integration/eslint-plugin',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/storybookjs/storybook/blob/HEAD/code/lib/eslint-plugin/docs/rules/${ruleName}.md`,
    },
    stylistic: {
      configs: ['stylistic'],
      pluginDocsUrl: 'https://eslint.style',
      ruleDocsUrl: (ruleName) => `https://eslint.style/rules/${ruleName}`,
    },
    svelte: {
      configs: ['svelte'],
      gitTag: (version) => `eslint-plugin-svelte@${version}`,
      pluginDocsUrl: 'https://sveltejs.github.io/eslint-plugin-svelte',
      ruleDocsUrl: (ruleName) =>
        `https://sveltejs.github.io/eslint-plugin-svelte/rules/${ruleName}`,
    },
    tailwindcss: {
      configs: ['tailwind'],
      pluginDocsUrl:
        'https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/francoismassart/eslint-plugin-tailwindcss/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'tanstack-query': {
      configs: ['tanstackQuery'],
      gitTag: (version) => `@tanstack/eslint-plugin-query@${version}`,
      pluginDocsUrl: 'https://tanstack.com/query/latest/docs/eslint/eslint-plugin-query',
      ruleDocsUrl: (ruleName) => `https://tanstack.com/query/latest/docs/eslint/${ruleName}`,
    },
    'tanstack-router': {
      configs: ['tanstackRouter'],
      gitTag: versionUnknown,
      pluginDocsUrl: 'https://tanstack.com/router/latest/docs/eslint/eslint-plugin-router',
      ruleDocsUrl: (ruleName) => `https://tanstack.com/router/latest/docs/eslint/${ruleName}`,
    },
    'tanstack-start': {
      configs: ['tanstackStart'],
      gitTag: versionUnknown,
      pluginDocsUrl: {
        label: 'docs (not plugin-specific)',
        url: 'https://tanstack.com/start/latest',
      },
      ruleDocsUrl: (ruleName) =>
        `https://github.com/TanStack/router/blob/HEAD/packages/eslint-plugin-start/${ruleName}.md`,
    },
    'testing-library': {
      configs: ['testingLibrary'],
      pluginDocsUrl:
        'https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/testing-library/eslint-plugin-testing-library/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    toml: {
      configs: ['toml'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-toml',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-toml/rules/${ruleName}.html`,
    },
    'tree-shaking': {
      configs: ['treeShaking'],
      pluginDocsUrl:
        'https://github.com/lukastaegert/eslint-plugin-tree-shaking/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/lukastaegert/eslint-plugin-tree-shaking/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    ts: {
      configs: ['ts'],
      isMainPlugin: true,
      pluginDocsUrl: 'https://typescript-eslint.io',
      ruleDocsUrl: (ruleName) => `https://typescript-eslint.io/rules/${ruleName}`,
    },
    tsdoc: {
      configs: ['tsdoc'],
      gitTag: (version) => `eslint-plugin-tsdoc_v${version}`,
      pluginDocsUrl: 'https://tsdoc.org/pages/packages/eslint-plugin-tsdoc',
      ruleDocsUrl: null, // Single rule
    },
    turbo: {
      configs: ['turbo'],
      pluginDocsUrl: 'https://turborepo.dev/docs/reference/eslint-plugin-turbo',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/vercel/turborepo/blob/HEAD/packages/eslint-plugin-turbo/docs/rules/${ruleName}.md`,
    },
    un: {
      configs: ['un'],
      ruleDocsUrl: null, // No docs
    },
    unhead: {
      configs: ['unhead'],
      pluginDocsUrl: 'https://github.com/unjs/unhead/blob/HEAD/packages/eslint-plugin/README.md',
      ruleDocsUrl: null, // No docs
    },
    unicorn: {
      configs: ['unicorn'],
      pluginDocsUrl: 'https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/readme.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/sindresorhus/eslint-plugin-unicorn/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'unnecessary-abstractions': {
      configs: ['unnecessaryAbstractions'],
      pluginDocsUrl:
        'https://github.com/personalyisus/eslint-plugin-unnecessary-abstractions/blob/HEAD/README.md',
      ruleDocsUrl: null, // No docs
    },
    unocss: {
      configs: ['unocss'],
      pluginDocsUrl: 'https://unocss.dev/integrations/eslint',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/Gastonite/eslint-plugin-better-unocss/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    'unused-imports': {
      configs: ['unusedImports'],
      ruleDocsUrl: (ruleName) =>
        `https://github.com/sweepline/eslint-plugin-unused-imports/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    vitest: {
      configs: ['vitest'],
      pluginDocsUrl: 'https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/vitest-dev/eslint-plugin-vitest/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    vue: {
      configs: ['vue'],
      isMainPlugin: true,
      pluginDocsUrl: 'https://eslint.vuejs.org',
      ruleDocsUrl: (ruleName) => `https://eslint.vuejs.org/rules/${ruleName}.html`,
    },
    'vue-i18n': {
      configs: ['vue'],
      ruleDocsUrl: (ruleName) =>
        `https://eslint-plugin-vue-i18n.intlify.dev/rules/${ruleName}.html`,
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
      pluginDocsUrl: 'https://github.com/43081j/eslint-plugin-wc/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/43081j/eslint-plugin-wc/blob/HEAD/docs/rules/${ruleName}.md`,
    },
    yaml: {
      configs: ['yaml'],
      pluginDocsUrl: 'https://ota-meshi.github.io/eslint-plugin-yml',
      ruleDocsUrl: (ruleName) =>
        `https://ota-meshi.github.io/eslint-plugin-yml/rules/${ruleName}.html`,
    },
    'you-dont-need-lodash-underscore': {
      configs: ['youDontNeedLodashUnderscore'],
      pluginDocsUrl:
        'https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/blob/HEAD/README.md',
      ruleDocsUrl: null, // No docs
    },
    zod: {
      configs: ['zod'],
      gitTag: (version) => `eslint-plugin-zod@${version}`,
      isMainPlugin: true,
      pluginDocsUrl:
        'https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod/docs/rules/${ruleName}.md`,
    },
    'zod-core': {
      configs: ['zod'],
      gitTag: (version) => `eslint-plugin-zod-core@${version}`,
      ruleDocsUrl: (ruleName) =>
        `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-core/docs/rules/${ruleName}.md`,
    },
    'zod-mini': {
      configs: ['zod'],
      gitTag: (version) => `eslint-plugin-zod-mini@${version}`,
      ruleDocsUrl: (ruleName) =>
        `https://github.com/marcalexiei/eslint-zod/blob/HEAD/plugins/eslint-plugin-zod-mini/docs/rules/${ruleName}.md`,
    },
    'zod-openapi': {
      configs: ['zodOpenapi'],
      pluginDocsUrl: 'https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/README.md',
      ruleDocsUrl: (ruleName) =>
        `https://github.com/samchungy/eslint-plugin-zod-openapi/blob/HEAD/docs/rules/${ruleName}.md`,
    },
  } satisfies Record<LoadablePluginPrefix, PackageMeta>).map(([pluginPrefix, meta]) => {
    const {packageName} = pluginsLoaders[pluginPrefix];
    return [packageName, {...meta, pluginPrefix}];
  }),
);

export const PACKAGES_META: Record<string, PackageMeta> = {
  ...PLUGIN_PACKAGES_META,
  '@angular-eslint/template-parser': {
    configs: ['angular'],
    ruleDocsUrl: null,
  },
  '@eslint/css-tree': {
    configs: ['css'],
    gitTag: (version) => `css-tree-v${version}`,
    ruleDocsUrl: null,
  },
  // Additional packages that are not eslint plugins but are tracked as dependencies
  '@html-eslint/parser': {
    configs: ['html'],
    ruleDocsUrl: null,
  },
  '@humanwhocodes/scsstree': {
    configs: ['css'],
    gitTag: (version) => `scsstree-v${version}`,
    ruleDocsUrl: null,
  },
  '@sveltejs/kit': {
    configs: ['svelte'],
    gitTag: (version) => `@sveltejs/kit@${version}`,
    ruleDocsUrl: null,
  },
  '@tsrx/eslint-parser': {
    configs: ['ripple'],
    gitTag: (version) => `@tsrx/eslint-parser@${version}`,
    ruleDocsUrl: null,
  },
  '@typescript-eslint/eslint-plugin': {
    configs: ['ts'],
    ruleDocsUrl: null,
  },
  '@typescript-eslint/parser': {
    configs: ['ts'],
    ruleDocsUrl: null,
  },
  'astro-eslint-parser': {
    configs: ['astro'],
    ruleDocsUrl: null,
  },
  browserslist: {
    configs: ['compat'],
    gitTag: versionAsIs,
    ruleDocsUrl: null,
  },
  'ember-eslint-parser': {
    configs: ['ember'],
    ruleDocsUrl: null,
  },
  'eslint-import-resolver-typescript': {
    configs: ['import'],
    ruleDocsUrl: null,
  },
  'eslint-mdx': {
    configs: ['mdx'],
    gitTag: (tag) => `eslint-mdx@${tag}`,
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
    configs: ['css'],
    gitTag: (version) => `tailwind-csstree-v${version}`,
    ruleDocsUrl: null,
  },
  'vue-eslint-parser': {
    configs: ['vue'],
    ruleDocsUrl: null,
  },
};

export const CONFIGS_META = objectFromEntriesUnsafe(
  Array.from(
    Map.groupBy(
      Object.entries(PACKAGES_META).flatMap(([packageName, packageMeta]) =>
        packageMeta.configs.map((config) => ({config, packageName})),
      ),
      (v) => v.config,
    ),
    ([config, entries]) => [config, {packages: entries.map((v) => v.packageName)}],
  ),
);
