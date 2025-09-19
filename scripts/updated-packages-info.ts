import {execSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {destr} from 'destr';
import {getPackageInfo} from 'local-pkg';
import {exec} from 'tinyexec';
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import ourPackageJson from '../package.json' with {type: 'json'};
import type {UnionToIntersection} from '../src/types';

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
};

// =============================================================================

const updatedDependenciesInfo = await main();

const getGitHubVersionTag = (dependency: string, version: string) =>
  PACKAGES_GIT_TAGS_PATTERNS[dependency as keyof typeof PACKAGES_GIT_TAGS_PATTERNS]?.(version) ??
  `v${version}`;

for (const {
  dependency,
  repoUrl,
  oldVersion,
  newVersion,
  codeDiffResult,
} of updatedDependenciesInfo) {
  if (repoUrl == null) {
    continue;
  }

  console.log(
    styleText('yellow', dependency),
    `${styleText('gray', oldVersion)} → ${styleText('green', newVersion)}`,
  );
  console.log(styleText('bold', 'Source code diff:'));
  console.log(
    codeDiffResult.stdout
      .trim()
      .split('\n')
      .map((line) => {
        const formattedLine = line.startsWith('@')
          ? styleText('cyan', line)
          : line.startsWith('---') || line.startsWith('+++')
            ? styleText('blue', line)
            : line.startsWith('+')
              ? styleText('green', line)
              : line.startsWith('-')
                ? styleText('red', line)
                : line.startsWith(' ')
                  ? line
                  : styleText('blue', line);
        return `  ${formattedLine}`;
      })
      .join('\n'),
  );
  console.log(`${styleText('bold', 'Repo:')} ${styleText('cyan', repoUrl)}`);
  console.log(`${styleText('bold', 'Releases:')} ${styleText('cyan', `${repoUrl}/releases`)}`);
  console.log(
    `${styleText('bold', 'For changelog:')}\n\`${dependency}\`: [${oldVersion} → ${newVersion}](${repoUrl}/compare/${getGitHubVersionTag(dependency, oldVersion)}...${getGitHubVersionTag(dependency, newVersion)})`,
  );
}

// =============================================================================

function parsePackageJson(packageJsonText: string) {
  return PackageJsonZod.safeParse(destr(packageJsonText));
}

async function readRootPackageJson() {
  const packageJsonPath = path.resolve(import.meta.dirname, '../package.json');
  return parsePackageJson(await fs.readFile(packageJsonPath, 'utf8'));
}

function readRootPackageJsonBeforeUncommittedChanges() {
  try {
    // eslint-disable-next-line sonarjs/no-os-command-from-path
    return parsePackageJson(execSync('git --no-pager show HEAD:package.json', {encoding: 'utf8'}));
  } catch {
    return null;
  }
}

function normalizeRepoUrl(url: string): string {
  return url.replace(/^git\+/, '').replace(/\.git$/, '');
}

async function getDependencyRepoUrl(dependency: string) {
  const info = await getPackageInfo(dependency);
  if (!info?.packageJson) {
    return '';
  }

  const packageJson = structuredClone(info.packageJson);
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

  const repoUrlParsed = URL.parse(repoUrl);
  if (repoUrlParsed == null) {
    // https://github.com/vercel/next.js/blob/v15.4.6/packages/eslint-plugin-next/package.json
    const isGitHubRepoHostname = /^[\w-]+\/[\w\-.]+$/.test(repoUrl);
    if (isGitHubRepoHostname) {
      return `https://github.com/${repoUrl}`;
    }

    // https://github.com/ember-tooling/ember-eslint-parser/blob/v0.5.11-ember-eslint-parser/package.json
    const sshLikeUrlMatch = repoUrl.match(/^git@github.com:([\w-]+\/[\w\-.]+)\.git?$/);
    if (sshLikeUrlMatch) {
      return `https://github.com/${sshLikeUrlMatch[1] || ''}`;
    }

    console.warn(`Failed to parse repository URL of ${dependency}: ${repoUrl}`);
    return '';
  }

  if (repoUrlParsed.hostname !== 'github.com') {
    console.warn(`Not a GitHub repository specified as repository for ${dependency}`);
    return '';
  }

  // Non-https protocol is used: https://github.com/webpack/enhanced-resolve/blob/v5.18.3/package.json
  return normalizeRepoUrl(`https://github.com${repoUrlParsed.pathname}`);
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

  const result = await Promise.all(
    Object.entries(currentDependencies)
      .filter(
        ([dependency, version]) =>
          dependency in dependenciesBeforeChanges &&
          version !== dependenciesBeforeChanges[dependency],
      )
      .map(async ([dependency, newVersion]) => {
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
