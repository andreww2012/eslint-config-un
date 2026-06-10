import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {regex} from 'arkregex';
import {destr} from 'destr';
import {exec} from 'tinyexec';
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import ourPackageJson from '../package.json' with {type: 'json'};
import {fetchPackageInfo} from '../src/utils';
import {PACKAGES_META, PLUGIN_PACKAGES_META} from './shared/packages-meta';

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

  const pluginPrefix = PLUGIN_PACKAGES_META[dependency]?.pluginPrefix;
  const sampleRuleName = [pluginPrefix, 'SAMPLE-RULE-NAME'].filter(Boolean).join('/');
  const ruleDocsUrl = packageMeta?.ruleDocsUrl?.(sampleRuleName);

  if (ruleDocsUrl) {
    const ruleDocsUrlForMd = `[\`${sampleRuleName}\`](${ruleDocsUrl})`;

    console.log(styleText('underline', 'For changelog:'));
    console.log(
      `${mainUnConfigNames}: updated [\`${dependency}\` from v${oldVersion} to v${newVersion}](${getCompareDiffUrl(dependency, repoUrl, oldVersion, newVersion)}):

- 🟢 enabled ${ruleDocsUrlForMd} rule
- 🟢 enabled ${ruleDocsUrlForMd} rule and added it to the \`noStylisticRules\` config
- 🟡 enabled ${ruleDocsUrlForMd} rule (warning) with the following default options:
- ❓ enabled conditionally ${ruleDocsUrlForMd} rule in ⚙️ \`\` sub-config
- 🔴 not enabled ${ruleDocsUrlForMd} rule
- ❌ \`\` rule was removed
- ⚠️ ${ruleDocsUrlForMd} rule was disabled because got deprecated
- 🔄 \`\` was renamed to ${ruleDocsUrlForMd}`,
    );
  }

  if (ruleDocsUrl) {
    console.log(styleText('underline', 'Rule docs URLs:'));
    console.log(ruleDocsUrl);
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
}
