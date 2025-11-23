import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {destr} from 'destr';
import {exec} from 'tinyexec';
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnionToIntersection} from '../src/types';
import {fetchPackageInfo} from '../src/utils';

const PACKAGES_GIT_TAGS_PATTERNS: Partial<
  Record<
    keyof UnionToIntersection<(typeof ourPackageJson)['dependencies' | 'devDependencies']>,
    (version: string) => string
  >
> = {
  '@eslint/compat': (version) => `compat-v${version}`,
  '@eslint/css': (version) => `css-v${version}`,
  '@nx/eslint-plugin': (version) => version,
  '@sveltejs/kit': (version) => `@sveltejs/kit@${version}`,
  'ember-eslint-parser': (version) => `v${version}-ember-eslint-parser`,
  'tailwind-csstree': (version) => `tailwind-csstree-v${version}`,
  'eslint-plugin-prefer-arrow-functions': (version) => version,
};

// =============================================================================

const updatedDependenciesInfo = await main();

const getGitHubVersionTag = (dependency: string, version: string) =>
  PACKAGES_GIT_TAGS_PATTERNS[dependency as keyof typeof PACKAGES_GIT_TAGS_PATTERNS]?.(version) ??
  `v${version}`;

const FILE_EXTENSIONS_TO_SKIP_IN_DIFF = ['map', 'cjs', 'cts'];

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

  console.log(styleText('bold', 'Source code diff:'));
  let diffForLastFileSkipped = false;
  for (const line of codeDiffResult.stdout.trim().split('\n')) {
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
    if (line.startsWith('diff --git ')) {
      diffForLastFileSkipped = FILE_EXTENSIONS_TO_SKIP_IN_DIFF.some((extension) =>
        line.endsWith(`.${extension}`),
      );
      // eslint-disable-next-line sonarjs/no-redundant-assignments
      isDiffHeader = true;
    }
    if (isDiffHeader || !diffForLastFileSkipped) {
      console.log(`  ${formattedLine}`);
    }
    if (line.startsWith('+++ ') && diffForLastFileSkipped) {
      console.log(`  ${styleText('yellow', 'Diff for this file is not shown')}`);
    }
  }

  console.log(`${styleText('bold', 'Repo:')} ${styleText('cyan', repoUrl)}`);
  console.log(`${styleText('bold', 'Releases:')} ${styleText('cyan', `${repoUrl}/releases`)}`);
  console.log(
    `${styleText('bold', 'For changelog:')}\n\`${dependency}\`: [${oldVersion} → ${newVersion}](${repoUrl}/compare/${getGitHubVersionTag(dependency, oldVersion)}...${getGitHubVersionTag(dependency, newVersion)})`,
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
    styleText('red', '\nPlease do not forget'),
    'to review new rules additions to decide which ones should be considered stylistic',
  );
  if (updatedOptionalPeerDependencies.length > 0) {
    console.log(
      styleText('red', 'Please do not forget'),
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
    return parsePackageJson((await exec('git --no-pager show HEAD:package.json')).stdout);
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
        // TODO report
        // eslint-disable-next-line no-useless-assignment
        gitHubRepoPath = repoUrlParsed.pathname;
      } else {
        console.warn(`Not a GitHub repository specified as repository for ${dependency}`);
        return '';
      }
    }

    gitHubRepoPath = repoUrlParsed.pathname.slice(1) /* remove `/` at the beginning */;
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
