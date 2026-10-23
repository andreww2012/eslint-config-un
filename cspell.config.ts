import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import type {CSpellSettings} from 'cspell';

const ROOT_DIR = import.meta.dirname || process.cwd();

// TODO drop once cspell reads it itself: https://github.com/streetsidesoftware/cspell/issues/2709
const readGitExcludePatterns = () => {
  try {
    // eslint-disable-next-line sonar/no-os-command-from-path
    const excludeFilePath = execFileSync('git', ['rev-parse', '--git-path', 'info/exclude'], {
      cwd: ROOT_DIR,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return fs
      .readFileSync(path.resolve(ROOT_DIR, excludeFilePath), 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
};

export default {
  useGitignore: true,
  enableGlobDot: true,
  ignorePaths: [
    '.git/**',
    '**/.gitignore',
    '**/pnpm-lock.yaml',
    '.vscode/extensions.json',
    'test/**/*',
    'pnpm-workspace.yaml',
    '**/*.svg',
    'patches/**',
    // Gitignored, but cspell applies `.gitignore` only after walking all (possibly a lot) files in there
    '**/temp/**',
    '.claude/worktrees/**',
    'data/eslint-plugins-db.json',
    '.all-contributorsrc',
    '.changeset/*.json',
    '.agents/guidelines.md',
    ...readGitExcludePatterns(),
  ],
  dictionaries: ['npm', 'node', 'typescript', 'fullstack'],
  words: [
    // Names
    'awscdk',
    'devdeps',
    'qwik',
    'sonarjs',
    'klona',
    'nuxt',
    'vuejs',
    'unplugin',
    'jsdocs',
    'libxmljs',
    'kramed',
    'signale',
    'opensearchservice',
    'commonmark',
    'shiki',
    'defu',
    'turborepo',
    'marko',
    'intlify',
    'csstree',
    'smarttools',
    'destr',
    'unocss',
    'unhead',
    'attw',
    'tsgo',
    'tinyexec',
    'cleye',
    'unutils',
    'verkit',
    'knip',
    'tsdown',
    'commitlint',
    'vitest',
    'formatjs',
    'messageformat',
    'obug',
    'darraghor',
    'oxfmt',
    'splattributes', // Ember
    'tsrx',
    'npmx',
    'gypfile', // package.json field
    'libc', // package.json field
    'oxlint',
    'TSES', // `TSESTree` type from `@typescript-eslint/types`
    'humanwhocodes',
    'scsstree',
    'safeql',
    'solidjs',
    'danielx', // `@danielx/civet`
    'cssicorn',
    'soml',

    // Technical words/terms
    'arrayify',
    'renamer',
    'nonconstructor',
    'nonoctal',
    'thenables',
    'callees',
    'pseudorandomness',
    'httponly',
    'lookarounds',
    'chunkname',
    'namepaths',
    'lockfiles',
    'worklet',
    'nums',
    'textnodes',
    'multilines',
    'greppability',
    'codemod',
    'worktrees',

    // Misc
    'multicol',
    'subgrid',
    'bgsound',
    'noembed',
    'scopedslots',
    'setstate',
    'ctsx',
    'cjsx',
    'mtsx',
    'mjsx',
    'rrggbb',
    'ngsrc',
    'ngmodule',
    'andreww',
    'innerhtml',
    'labelledby',
    'activedescendant',
    'proptypes',
    'knipignore',
    'asyncdispose',
    'matchall',
    'typegen',
    'viewbox',
    'lychee',
    'smol',

    // Actual-ish English words
    'uncategorized',
    'mischeck',
    'unthrown',
    'promisable',
    'requirable',
    'rethrowing',
    'dedented',
    'curlies',
    'unsanitized',
    'dont',
    'uncapitalize', // TS utility type
    'dups',
    'strikethrough',
    'unexpressible',
    'cooldown',
  ],
  overrides: [
    {
      // Rule names come from the plugins, and the metadata generator rejects unknown ones
      filename: 'src/plugins/*.ts',
      ignoreRegExpList: [String.raw`/^\s*(?:'[\w@/-]+'|\w+)(?=:)/gm`],
    },
  ],
} satisfies CSpellSettings;
