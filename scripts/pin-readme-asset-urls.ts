import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {cli} from 'cleye';
import packageJson from '../package.json' with {type: 'json'};

const REPOSITORY_SLUG_REGEXP = /github\.com\/([^/]+\/[^./]+)/;

const repositorySlug = packageJson.repository.url.match(REPOSITORY_SLUG_REGEXP)?.[1];
if (repositorySlug == null) {
  throw new Error(`Cannot derive a GitHub repository from \`${packageJson.repository.url}\``);
}

const README_PATH = path.join(import.meta.dirname, '../README.md');

const RELATIVE_ASSETS_PREFIX = './assets/';

const REFERENCED_ASSET_REGEXP = /(?<=\.\/)assets\/[^\s")\]]+/g;

// Mirrors the tag changesets creates for a release
const pinnedAssetsPrefix = `https://raw.githubusercontent.com/${repositorySlug}/${packageJson.name}@${packageJson.version}/assets/`;

const {unpin: isUnpinning} = cli({
  name: 'pin-readme-asset-urls',
  strictFlags: true,
  flags: {
    unpin: {
      type: Boolean,
      description: 'Restore the relative asset paths instead of pinning them to a release tag',
      default: false,
    },
  },
}).flags;

const [searchValue, replaceValue] = isUnpinning
  ? [pinnedAssetsPrefix, RELATIVE_ASSETS_PREFIX]
  : [RELATIVE_ASSETS_PREFIX, pinnedAssetsPrefix];

const readme = await fs.readFile(README_PATH, 'utf8');

if (!isUnpinning) {
  const referencedAssets = [...new Set(readme.match(REFERENCED_ASSET_REGEXP))];
  const trackedAssets = new Set(
    // eslint-disable-next-line sonar/no-os-command-from-path
    execFileSync('git', ['ls-files', '--', ...referencedAssets], {encoding: 'utf8'}).split('\n'),
  );
  const untrackedAssets = referencedAssets.filter((assetPath) => !trackedAssets.has(assetPath));

  if (untrackedAssets.length > 0) {
    throw new Error(
      `The readme references asset(s) unknown to git, which would 404 once pinned to a release tag:\n${untrackedAssets.map((assetPath) => `  ${assetPath}`).join('\n')}`,
    );
  }
}

const replacementsCount = readme.split(searchValue).length - 1;
if (replacementsCount > 0) {
  await fs.writeFile(
    README_PATH,
    readme.replaceAll(searchValue, () => replaceValue),
  );
}

console.log(
  isUnpinning
    ? `Restored ${styleText('bold', String(replacementsCount))} relative readme asset reference(s)`
    : `Pinned ${styleText('bold', String(replacementsCount))} readme asset reference(s) to ${styleText('cyan', pinnedAssetsPrefix)}`,
);
