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
  gitTag?: (version: string) => GitTagResult;
}

const PACKAGES_META: Record<string, PackageMeta> = {
  ...Object.fromEntries(
    objectEntriesUnsafe({
      '@angular-eslint': {configs: ['angular']},
      '@angular-eslint/template': {configs: ['angular']},
      '@cspell': {configs: ['cspell']},
      '@eslint-react': {configs: ['react']},
      '@eslint-react/debug': {configs: ['react']},
      '@eslint-react/dom': {configs: ['react']},
      '@eslint-react/hooks-extra': {configs: ['react']},
      '@eslint-react/naming-convention': {configs: ['react']},
      '@eslint-react/web-api': {configs: ['react']},
      '@html-eslint': {configs: ['html']},
      '@intlify/vue-i18n': {configs: ['vue']},
      '@next/next': {configs: ['nextJs']}, // eslint-disable-line case-police/string-check
      '@stylistic': {configs: ['stylistic']},
      '@tanstack/query': {configs: ['tanstackQuery'], gitTag: versionUnknown},
      '@tanstack/router': {configs: ['tanstackRouter'], gitTag: versionUnknown},
      '@unocss': {configs: ['unocss']},
      antfu: {configs: ['antfu']},
      astro: {configs: ['astro']},
      ava: {configs: ['ava']},
      'barrel-files': {configs: ['barrelFiles']},
      'better-tailwindcss': {configs: ['betterTailwind']},
      boundaries: {configs: ['boundaries']},
      'case-police': {configs: ['casePolice']},
      'check-file': {configs: ['checkFile']},
      clsx: {configs: ['clsx']},
      command: {configs: ['command']},
      compat: {configs: ['compat']},
      css: {configs: ['css'], gitTag: (version) => `css-v${version}`},
      'css-in-js': {configs: ['cssInJs']},
      cypress: {configs: ['cypress']},
      'de-morgan': {configs: ['deMorgan']},
      depend: {configs: ['depend'], gitTag: versionAsIs},
      docusaurus: {configs: ['docusaurus']},
      e18e: {configs: ['e18e'], gitTag: versionAsIs},
      ember: {configs: ['ember']},
      'erasable-syntax-only': {configs: ['erasableSyntaxOnly']},
      es: {configs: ['es']},
      'eslint-comments': {configs: ['eslintComments']},
      'eslint-plugin': {configs: ['eslintPlugin']},
      'expect-type': {configs: ['expectType']},
      'fast-import': {configs: ['fastImport'], gitTag: versionAsIs},
      'file-progress': {configs: ['fileProgress']},
      format: {configs: ['format']},
      formatjs: {configs: ['formatJs']},
      'github-actions': {configs: ['githubActions']},
      graphql: {configs: ['graphql']},
      header: {configs: ['header']},
      headers: {configs: ['headers']},
      html: {configs: ['jsInline']},
      import: {configs: ['import']},
      'import-zod': {configs: ['importZod']},
      jest: {configs: ['jest']},
      'jest-dom': {configs: ['jestDom']},
      'jest-extended': {configs: ['jest']},
      jsdoc: {configs: ['jsdoc']},
      'json-schema-validator': {configs: ['jsonSchemaValidator']},
      jsonc: {configs: ['json']},
      'jsx-a11y': {configs: ['jsxA11y']},
      lit: {configs: ['lit']},
      'lit-a11y': {configs: ['lit']},
      lockfile: {configs: ['lockfile']},
      markdown: {configs: ['markdown']},
      'markdown-links': {configs: ['markdownLinks']},
      'markdown-preferences': {configs: ['markdownPreferences']},
      math: {configs: ['math']},
      mdx: {configs: ['mdx'], gitTag: (tag) => `eslint-plugin-mdx@${tag}`},
      mocha: {configs: ['mocha']},
      'module-interop': {configs: ['moduleInterop']},
      nestjs: {configs: ['nestJs']}, // eslint-disable-line case-police/string-check
      'no-only-tests': {configs: ['noOnlyTests']},
      'no-secrets': {configs: ['noSecrets']},
      'no-type-assertion': {configs: ['ts']},
      'no-unsanitized': {configs: ['noUnsanitized']},
      node: {configs: ['node']},
      'node-dependencies': {configs: ['nodeDependencies']},
      nuxt: {configs: ['vue']},
      nx: {configs: ['nx'], gitTag: versionAsIs},
      'package-json': {configs: ['packageJson']},
      perfectionist: {configs: ['perfectionist']},
      pinia: {configs: ['vue']},
      playwright: {configs: ['playwright']},
      pnpm: {configs: ['pnpm']},
      'prefer-arrow-functions': {configs: ['preferArrowFunctions'], gitTag: versionAsIs},
      prettier: {configs: []},
      promise: {configs: ['promise']},
      qunit: {configs: ['qunit']},
      qwik: {configs: ['qwik']},
      react: {configs: ['react']},
      'react-hooks': {configs: ['react']},
      'react-refresh': {configs: ['react']},
      'react-you-might-not-need-an-effect': {configs: ['react']},
      regexp: {configs: ['regexp']},
      rxjs: {configs: ['rxjs']},
      security: {configs: ['security']},
      'sentences-per-line': {configs: ['markdown']},
      solid: {configs: ['solid']},
      sonarjs: {
        configs: ['sonar'],
        gitTag: (version) => ({
          url: `https://github.com/SonarSource/SonarJS/blob/___INSERT-REF-HERE___/packages/jsts/src/rules/CHANGELOG.md#___INSERT-DATE-HERE___-version-${version.replaceAll(/\D/g, '')}`,
        }),
      },
      sql: {configs: ['sql']},
      storybook: {configs: ['storybook']},
      svelte: {configs: ['svelte']},
      tailwindcss: {configs: ['tailwind']},
      'testing-library': {configs: ['testingLibrary']},
      toml: {configs: ['toml']},
      'tree-shaking': {configs: ['treeShaking']},
      ts: {configs: ['ts']},
      turbo: {configs: ['turbo']},
      un: {configs: ['un']},
      unicorn: {configs: ['unicorn']},
      'unnecessary-abstractions': {configs: ['unnecessaryAbstractions']},
      'unused-imports': {configs: ['unusedImports']},
      vitest: {configs: ['vitest']},
      vue: {configs: ['vue']},
      'vue-scoped-css': {configs: ['vue']},
      'vuejs-accessibility': {configs: ['vue']},
      wc: {configs: ['webComponents'], gitTag: versionAsIs},
      yaml: {configs: ['yaml']},
      'you-dont-need-lodash-underscore': {configs: ['youDontNeedLodashUnderscore']},
      zod: {configs: ['zod']},
    } satisfies Record<LoadablePluginPrefix, PackageMeta>).map(([pluginPrefix, meta]) => {
      const {packageName} = pluginsLoaders[pluginPrefix];
      return [packageName, meta];
    }),
  ),
  // Additional packages that are not eslint plugins but are tracked as dependencies
  '@html-eslint/parser': {configs: ['html']},
  '@sveltejs/kit': {configs: ['svelte'], gitTag: (version) => `@sveltejs/kit@${version}`},
  'ember-eslint-parser': {
    configs: ['ember'],
    gitTag: (version) => `v${version}-ember-eslint-parser`,
  },
  'tailwind-csstree': {configs: ['tailwind'], gitTag: (version) => `tailwind-csstree-v${version}`},
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

  const mainUnConfigs = PACKAGES_META[dependency]?.configs;
  const mainUnConfigNames = mainUnConfigs?.join(', ') || '';

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
