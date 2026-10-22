import {execFileSync} from 'node:child_process';
import fs from 'node:fs/promises';
import {cli} from 'cleye';
import pathe from 'pathe';
import {parseAllDocuments} from 'yaml';
import * as z from 'zod';
import {ALL_RULES_PER_PLUGIN} from '../src/eslint-rules.gen';
import {pluginsLoaders} from '../src/loaders/plugins';
import {getRuleDocsUrl, readPluginMetadata} from './shared/plugin-metadata';

const ROOT_DIR = pathe.join(import.meta.dirname, '..');
const LOCKFILE = 'pnpm-lock.yaml';

// Changing any of these may change the docs URL of every rule
const FILES_AFFECTING_ALL_URLS: ReadonlySet<string> = new Set([
  'scripts/list-rule-docs-urls.ts',
  'scripts/shared/plugin-metadata.ts',
  'src/plugins/shared.ts',
]);

const RULE_NAMES_PER_PLUGIN: Readonly<Record<string, readonly string[]>> = ALL_RULES_PER_PLUGIN;
const PLUGIN_LOADERS: Readonly<Partial<Record<string, {packageName: string}>>> = pluginsLoaders;

const ALL_PLUGIN_PREFIXES: ReadonlySet<string> = new Set(Object.keys(RULE_NAMES_PER_PLUGIN));

// The suffix lists the resolved peers, so it changes for every plugin whenever ESLint is updated
const PEER_SUFFIX_REGEX = /\(.*/;

const LockfileDependenciesZod = z.record(z.string(), z.object({version: z.string()}));
const LockfileZod = z.object({
  importers: z.object({
    '.': z.object({
      dependencies: LockfileDependenciesZod.optional(),
      devDependencies: LockfileDependenciesZod.optional(),
      optionalDependencies: LockfileDependenciesZod.optional(),
    }),
  }),
});

const git = (...args: readonly string[]) =>
  // eslint-disable-next-line sonar/no-os-command-from-path
  execFileSync('git', args, {cwd: ROOT_DIR, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});

const isCommit = (ref: string) => {
  try {
    return git('cat-file', '-t', ref).trim() === 'commit';
  } catch {
    return false;
  }
};

/**
 * pnpm writes its own installation into a document of its own, before the project's one
 */
const readDependencyVersions = (lockfileText: string) =>
  new Map(
    parseAllDocuments(lockfileText).flatMap((document) => {
      const parsed = LockfileZod.safeParse(document.toJS());
      if (!parsed.success) {
        return [];
      }
      const {dependencies, devDependencies, optionalDependencies} = parsed.data.importers['.'];
      return Object.entries({...dependencies, ...devDependencies, ...optionalDependencies}).map(
        ([packageName, {version}]) =>
          [packageName, version.replace(PEER_SUFFIX_REGEX, '')] as const,
      );
    }),
  );

const argv = cli({
  name: 'list-rule-docs-urls',
  strictFlags: true,
  flags: {
    changedSince: {
      type: String,
      description:
        'Only list the rules of the plugins whose metadata file or package version changed since this git ref',
    },
  },
});

const plugins = await readPluginMetadata();

const getChangedPluginPrefixes = async (ref: string): Promise<ReadonlySet<string>> => {
  // A newly pushed branch has no commit to compare with
  if (!isCommit(ref)) {
    return ALL_PLUGIN_PREFIXES;
  }
  const changedFiles = new Set(git('diff', '--name-only', ref).split('\n'));
  if (!FILES_AFFECTING_ALL_URLS.isDisjointFrom(changedFiles)) {
    return ALL_PLUGIN_PREFIXES;
  }
  const [versionsBefore, versionsAfter] = [
    readDependencyVersions(git('show', `${ref}:${LOCKFILE}`)),
    readDependencyVersions(await fs.readFile(pathe.join(ROOT_DIR, LOCKFILE), 'utf8')),
  ];
  return new Set(
    plugins
      .filter(({prefix, fileName}) => {
        const packageName = prefix ? PLUGIN_LOADERS[prefix]?.packageName : 'eslint';
        return (
          changedFiles.has(`src/plugins/${fileName}`) ||
          (packageName != null &&
            versionsBefore.get(packageName) !== versionsAfter.get(packageName))
        );
      })
      .map(({prefix}) => prefix),
  );
};

const pluginPrefixes =
  argv.flags.changedSince == null
    ? ALL_PLUGIN_PREFIXES
    : await getChangedPluginPrefixes(argv.flags.changedSince);
const metadataPerPlugin = Object.fromEntries(
  plugins.map(({prefix, metadata}) => [prefix, metadata]),
);

// A line per rule, so that the lychee report names the rule a broken link belongs to
process.stdout.write(
  Object.entries(RULE_NAMES_PER_PLUGIN)
    .filter(([prefix]) => pluginPrefixes.has(prefix))
    .flatMap(([prefix, ruleNames]) => {
      const metadata = metadataPerPlugin[prefix];
      return ruleNames.flatMap((ruleName) => {
        const url = metadata && getRuleDocsUrl(metadata, ruleName);
        return url ? `- \`${prefix ? `${prefix}/` : ''}${ruleName}\`: <${url}>\n` : [];
      });
    })
    .join(''),
);
