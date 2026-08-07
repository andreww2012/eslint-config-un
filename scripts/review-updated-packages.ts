import fs from 'node:fs/promises';
import path from 'node:path';
import matter from '@11ty/gray-matter';
import {jsonParseSafe, regexTyped} from '@andreww2012/unutils';
import {styleText} from '@andreww2012/unutils/server';
import writeChangeset from '@changesets/write';
import {cli} from 'cleye';
import {exec} from 'tinyexec';
import * as z from 'zod';
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import ourPackageJson from '../package.json' with {type: 'json'};
import {fetchPackageInfo, readAndParseJson} from '../src/utils';
import {PACKAGES_META, PLUGIN_PACKAGES_META} from './shared/packages-meta';

// =============================================================================

const REPO_ROOT_PATH = path.resolve(import.meta.dirname, '..');
const CHANGESETS_DIR_PATH = path.join(REPO_ROOT_PATH, '.changeset');
const SAMPLE_RULE_NAME = 'SAMPLE-RULE-NAME';

const parsePackageJson = (packageJsonText: string) =>
  PackageJsonZod.safeParse(jsonParseSafe(packageJsonText));

const readRootPackageJson = async () =>
  parsePackageJson(await fs.readFile(path.join(REPO_ROOT_PATH, 'package.json'), 'utf8'));

const readRootPackageJsonBeforeUncommittedChanges = async () => {
  try {
    return parsePackageJson(
      (await exec('git', ['--no-pager', 'show', 'HEAD:package.json'])).stdout,
    );
  } catch {
    return null;
  }
};

const GITHUB_REPO_SHORTHAND_REGEXP = /^[\w-]+\/[\w\-.]+$/;
const SSH_LIKE_REPO_URL_REGEXP = /^git@github.com:([\w-]+\/[\w\-.]+)\.git?$/;
const GIT_URL_PROTOCOL_PREFIX_REGEXP = /^git\+/;
const GIT_URL_SUFFIX_REGEXP = /\.git$/;

const getDependencyRepoUrl = async (dependency: string) => {
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
    const isGitHubRepoHostname = GITHUB_REPO_SHORTHAND_REGEXP.test(repoUrl);
    if (isGitHubRepoHostname) {
      gitHubRepoPath = repoUrl;
    }
  }

  if (!gitHubRepoPath) {
    // https://github.com/ember-tooling/ember-eslint-parser/blob/v0.5.11-ember-eslint-parser/package.json
    const sshLikeUrlMatch = repoUrl.match(SSH_LIKE_REPO_URL_REGEXP);
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
  return `https://github.com/${gitHubRepoPath}`
    .replace(GIT_URL_PROTOCOL_PREFIX_REGEXP, '')
    .replace(GIT_URL_SUFFIX_REGEXP, '');
};

const main = async () => {
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
        '--force',
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
};

const PreStateZod = z.object({mode: z.literal('pre'), changesets: z.string().array()});
const ChangesetFrontmatterZod = z
  .record(z.string(), z.enum(['major', 'minor', 'patch', 'none']))
  .refine((releases) => Object.keys(releases).length > 0, 'At least one package must be listed');

// In pre mode changesets are not removed on `changeset version`, so already released ones are only
// distinguishable by being listed in `pre.json`. Anywhere else every changeset file on disk is
// unreleased: outside of pre mode `changeset version` removes the consumed ones, and in `exit` mode
// everything left, including what `pre.json` lists, goes into the upcoming stable release
const readUnreleasedChangesets = async () => {
  const preState = PreStateZod.safeParse(
    await readAndParseJson(path.join(CHANGESETS_DIR_PATH, 'pre.json')),
  );
  const releasedChangesetIds = new Set(preState.data?.changesets);

  const candidateIds = (await fs.readdir(CHANGESETS_DIR_PATH))
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => path.basename(fileName, '.md'))
    .filter((id) => !releasedChangesetIds.has(id));

  const changesets = await Promise.all(
    candidateIds.map(async (id) => {
      const {data, content} = matter(
        await fs.readFile(path.join(CHANGESETS_DIR_PATH, `${id}.md`), 'utf8'),
      );
      return ChangesetFrontmatterZod.safeParse(data).success ? {id, summary: content.trim()} : null;
    }),
  );

  return changesets.filter((changeset) => changeset != null);
};

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
  if (typeof newTagResult === 'object') {
    return newTagResult.url;
  }
  const oldTagResult = gitTag(oldVersion);
  if (typeof oldTagResult === 'object') {
    throw new TypeError(
      'gitTag function for new version returned a string, but for old version returned an object',
    );
  }
  return `${repoUrl}/compare/${oldTagResult}...${newTagResult}`;
};

const INLINE_CODE_SPANS_REGEXP = /`[^\n`]+`/g;
const REGEXP_SPECIAL_CHARS_REGEXP = /[$()*+.?[\\\]^{|}]/g;
const ESCAPED_BRACES_REGEXP = /\\\{([^{}]+)\\\}/g;

// Package names are often "compressed" when several of them are updated at once:
// `@angular-eslint/*`, `@tsrx/eslint-{plugin,parser}`
const isDependencyMentionedIn = (changesetSummary: string, dependency: string) =>
  (changesetSummary.match(INLINE_CODE_SPANS_REGEXP) || []).some((codeSpan) => {
    const pattern = codeSpan
      .slice(1, -1)
      .replaceAll(REGEXP_SPECIAL_CHARS_REGEXP, (specialChar) => `\\${specialChar}`)
      .replaceAll(
        ESCAPED_BRACES_REGEXP,
        (_, alternatives: string) => `(?:${alternatives.replaceAll(',', '|')})`,
      )
      .replaceAll(String.raw`\*`, '[^/]*');
    return new RegExp(`^${pattern}$`).test(dependency);
  });

// lychee is an optional external binary, and a broken link is never a reason to fail the whole run
const checkLinksWithLychee = async (changesetPath: string) => {
  try {
    const {exitCode, stdout, stderr} = await exec(
      'lychee',
      [
        '--config',
        'node_modules/lychee-config-nick2bad4u/lychee.toml',
        '--config',
        'lychee.toml',
        // Rule docs URLs in the not yet filled in changelog entry options are placeholders
        '--exclude',
        SAMPLE_RULE_NAME,
        changesetPath,
      ],
      {nodeOptions: {cwd: REPO_ROOT_PATH}},
    );

    if (exitCode !== 0) {
      console.log(`  ${styleText('red', 'Link check (lychee) failed:')}`);
    }
    const outputLines = `${stdout}${stderr}`
      .trim()
      .split('\n')
      .filter((line) => line.trim() && !line.includes('[EXCLUDED]'));
    if (outputLines.length > 0) {
      console.log(outputLines.map((line) => `  ${line}`).join('\n'));
    }
  } catch (error) {
    const isLycheeMissing =
      error != null && typeof error === 'object' && 'code' in error && error.code === 'ENOENT';
    if (isLycheeMissing) {
      console.log(
        `  ${styleText('yellow', 'Link check skipped: lychee (https://lychee.cli.rs) is not installed')}`,
      );
    } else {
      console.log(`  ${styleText('red', 'Link check (lychee) could not be run:')}`, error);
    }
  }
};

// =============================================================================

const {write: shouldWriteChangesets} = cli({
  strictFlags: true,
  booleanFlagNegation: true,
  flags: {
    write: {
      type: Boolean,
      description:
        'Create a patch changeset for every updated dependency belonging to a config that has no unreleased changeset yet',
      default: true,
    },
  },
}).flags;

const updatedDependenciesInfo = await main();
const unreleasedChangesets = await readUnreleasedChangesets();

const EXTENSIONS_TO_SKIP_IN_DIFF = new Set(['map', 'ts', 'cts', 'mts', 'tsbuildinfo']);
const EXTENSIONS_TO_SKIP_IN_DIFF_IF_COUNTERPART_FILE_EXISTS: Record<string, string[]> = {
  // For packages distributed as ESM+CJS (for example: eslint-plugin-zod-x@2.0.0)
  cjs: ['js', 'mjs'],
  cts: ['ts', 'mts'],
};

const FILE_HEADER_IN_DIFF_REGEXP = regexTyped('^diff --git a/(.+) b/(.+)$');
// eslint-disable-next-line unicorn/prefer-string-raw
const FILE_OR_PATH_WITH_EXTENSION_REGEXP = regexTyped('^(?<path>.*)\\.(?<extension>[a-z\\d]+)$');

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
    if (diffForLastFileSkipped && line.startsWith('+++ ')) {
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

  const pluginPrefix = PLUGIN_PACKAGES_META[dependency]?.pluginPrefix;
  const sampleRuleNameWithPrefix = [pluginPrefix, SAMPLE_RULE_NAME].filter(Boolean).join('/');
  const ruleDocsUrl = packageMeta?.ruleDocsUrl?.(SAMPLE_RULE_NAME);

  const ruleDocsUrlForMd = ruleDocsUrl
    ? `[\`${sampleRuleNameWithPrefix}\`](${ruleDocsUrl})`
    : `\`${sampleRuleNameWithPrefix}\``;

  const changelogEntry = `${mainUnConfigNames}: updated [\`${dependency}\` from v${oldVersion} to v${newVersion}](${getCompareDiffUrl(dependency, repoUrl, oldVersion, newVersion)})`;

  const changelogEntryOptions =
    pluginPrefix == null
      ? ''
      : `:

- 🟢 enabled ${ruleDocsUrlForMd} rule
- 🟢 enabled ${ruleDocsUrlForMd} rule and added it to the \`noStylisticRules\` config
- 🟢 enabled ${ruleDocsUrlForMd} rule and ⚠️ disabled autofix for it
- 🟡 enabled ${ruleDocsUrlForMd} rule (warning) with the following default options:
- ❓ enabled conditionally ${ruleDocsUrlForMd} rule in the ⚙️ \`\` sub-config
- 🔴 not enabled ${ruleDocsUrlForMd} rule
- ❌ \`${sampleRuleNameWithPrefix}\` rule was removed
- ⚠️ ${ruleDocsUrlForMd} rule was disabled because got deprecated
- 🔄 \`${sampleRuleNameWithPrefix}\` was renamed to ${ruleDocsUrlForMd}`;

  console.log(styleText('underline', 'For changelog:'));
  console.log(changelogEntry);

  if (changelogEntryOptions) {
    console.log(changelogEntryOptions);
  }

  if (ruleDocsUrl) {
    console.log(styleText('underline', 'Rule docs URLs:'));
    console.log(ruleDocsUrl);
  }

  if (packageMeta) {
    const changesetCandidates = unreleasedChangesets.filter(({summary}) =>
      isDependencyMentionedIn(summary, dependency),
    );

    if (changesetCandidates.length > 0) {
      console.log(
        styleText(
          'black',
          styleText(
            'bgYellowBright',
            ` ⚠ Possible changeset candidates mentioning ${dependency} - consider updating one of them instead of creating a new one: `,
          ),
        ),
      );
      for (const {id, summary} of changesetCandidates) {
        console.log(`  ${styleText('yellow', `.changeset/${id}.md`)}`);
        console.log(
          summary
            .split('\n')
            .map((line) => `    ${line}`)
            .join('\n'),
        );
      }
    } else if (shouldWriteChangesets) {
      const changesetSummary = `${changelogEntry}\n${changelogEntryOptions}`;
      const changesetId = await writeChangeset(
        {summary: changesetSummary, releases: [{name: ourPackageJson.name, type: 'patch'}]},
        REPO_ROOT_PATH,
      );

      const changesetPath = path.join(CHANGESETS_DIR_PATH, `${changesetId}.md`);
      await fs.writeFile(changesetPath, (await fs.readFile(changesetPath, 'utf8')).trimEnd());

      unreleasedChangesets.push({id: changesetId, summary: changesetSummary});
      console.log(
        styleText(
          'black',
          styleText(
            'bgGreenBright',
            ` ✔ Created a new patch changeset: .changeset/${changesetId}.md `,
          ),
        ),
      );

      await checkLinksWithLychee(changesetPath);
    }
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
