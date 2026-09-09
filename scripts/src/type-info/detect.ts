import fs from 'node:fs/promises';
import os from 'node:os';
import {inspect} from 'node:util';
import * as tsParser from '@typescript-eslint/parser';
import {Linter} from 'eslint';
import pathe from 'pathe';
import type {EslintPlugin} from '../../../src/eslint/eslint-types';
import {FIXTURE_FILES} from './fixture';

/**
 * The members of the typescript-eslint parser services that only exist when type information does.
 * Reading any of them is what "the rule consumes type information" means
 */
const TYPE_INFO_SERVICE_KEYS = new Set([
  'emitDecoratorMetadata',
  'esTreeNodeToTSNodeMap',
  'getSymbolAtLocation',
  'getTypeAtLocation',
  'hasFullTypeInformation',
  'program',
  'tsNodeToESTreeNodeMap',
]);

/**
 * A rule may build a visitor key out of its options, and an empty selector group like `:matches()`
 * makes ESLint abort the whole run instead of just that rule
 */
const EMPTY_SELECTOR_GROUP_REGEX = /\(\s*\)/;

const SOURCE_FILE_REGEX = /\.tsx?$/;

const TS_CHECKER_TOKENS_REGEX =
  /createBuiltinTypeCheckers|createTypeCheckers|esTreeNodeToTSNodeMap|getTypeAtLocation|getTypeChecker|hasFullTypeInformation|tsNodeToESTreeNodeMap|(?:Services|parserServices|services)[^\n.]{0,24}\.program\b/;

/**
 * A plugin may define its own `getParserServices` returning something else entirely, so the name
 * only counts next to a typescript-eslint import
 */
const TS_ESLINT_PACKAGE_REGEX = /@typescript-eslint\/(?:typescript-estree|utils)/;

const RULE_DIRECTORY_CANDIDATES = [
  'rules',
  'lib/rules',
  'dist/rules',
  'src/rules',
  'dist/lib/rules',
  'lib/src/rules',
  'build/rules',
];

const JS_FILE_REGEX = /\.[cm]?js$/;

const RELATIVE_IMPORT_REGEX = /import\s([^"';]*?)from\s*["'](\.[^"']+)["']/g;
const RELATIVE_REQUIRE_REGEX = /require\(\s*["'](\.[^"']+)["']\s*\)/g;
const RE_EXPORT_REGEX = /export\s*\{([^}]*)\}\s*from\s*["'](\.[^"']+)["']/g;
const STAR_EXPORT_REGEX = /export\s*\*\s*from\s*["'](\.[^"']+)["']/g;
const LOCAL_DECLARATION_EXPORT_REGEX =
  /export\s+(?:async\s+)?(?:class|const|function\*?|let|var)\s+(\w+)/g;
const LOCAL_LIST_EXPORT_REGEX = /export\s*\{([^}]*)\}[^\S\n]*;/g;
const IMPORT_ALIAS_REGEX = /\bas\b/;

const DEFAULT_EXPORT_NAME = 'default';
const NAMESPACE_IMPORT_NAME = '*';

/**
 * A name resolving to a barrel says nothing about which of its exports is checker-backed
 */
const OPAQUE_MODULE_NAMES = new Set(['index.js', 'utils.js']);

const isVisitorListener = (value: unknown): value is (...listenerArguments: unknown[]) => unknown =>
  typeof value === 'function';

const describeError = (error: unknown) => (error instanceof Error ? error.message : inspect(error));

/**
 * Enabling every rule of every plugin at once makes a good number of them announce a missing
 * dependency, a deprecation or an absent setting. None of it is about the rule being probed
 */
const withSilencedOutput = <Result>(run: () => Result) => {
  const streams = [process.stdout, process.stderr];
  const originalWrites = streams.map((stream) => stream.write.bind(stream));
  for (const stream of streams) {
    stream.write = () => true;
  }

  try {
    return run();
  } finally {
    for (const [index, stream] of streams.entries()) {
      const originalWrite = originalWrites[index];
      if (originalWrite) {
        stream.write = originalWrite;
      }
    }
  }
};

export const detectViaMeta = (plugin: EslintPlugin) =>
  new Set(
    Object.entries(plugin.rules || {})
      .filter(
        ([, rule]) =>
          (rule.meta?.docs as {requiresTypeChecking?: unknown} | undefined)
            ?.requiresTypeChecking === true,
      )
      .map(([ruleName]) => ruleName),
  );

const doesRunOnJavascript = (rule: NonNullable<EslintPlugin['rules']>[string]) => {
  const languages: unknown = (rule.meta as {languages?: unknown} | undefined)?.languages;
  return (
    !Array.isArray(languages) ||
    languages.some((language) => language === '*' || String(language).startsWith('js'))
  );
};

/**
 * Lints the fixture with every rule enabled at once, recording which rules read the type information
 * members of the parser services, and which ones throw when there are none
 */
export const probeRules = async (
  plugins: Record<string, EslintPlugin>,
  {withTypeInfo}: {withTypeInfo: boolean},
) => {
  const accessed = new Map<string, Set<string>>();
  const threw = new Map<string, string>();
  const failures: string[] = [];
  let currentRuleName: string | null = null;

  const recordAccess = (key: string) => {
    if (currentRuleName == null) {
      return;
    }
    const keys = accessed.get(currentRuleName);
    if (keys) {
      keys.add(key);
    } else {
      accessed.set(currentRuleName, new Set([key]));
    }
  };

  const withCurrentRule = <T>(ruleName: string, run: () => T, fallback: T) => {
    const previous = currentRuleName;
    currentRuleName = ruleName;
    try {
      return run();
    } catch (error) {
      if (!threw.has(ruleName)) {
        threw.set(ruleName, describeError(error).slice(0, 200));
      }
      return fallback;
    } finally {
      currentRuleName = previous;
    }
  };

  const spyOnServices = <Services extends object>(services: Services) =>
    new Proxy(services, {
      get(target, property, receiver): unknown {
        if (typeof property === 'string' && TYPE_INFO_SERVICE_KEYS.has(property)) {
          recordAccess(property);
        }
        return Reflect.get(target, property, receiver);
      },
      has(target, property) {
        if (typeof property === 'string' && TYPE_INFO_SERVICE_KEYS.has(property)) {
          recordAccess(property);
        }
        return Reflect.has(target, property);
      },
    });

  const spyingParser = {
    meta: tsParser.meta,
    parseForESLint: (code: string, options?: Parameters<typeof tsParser.parseForESLint>[1]) => {
      const result = tsParser.parseForESLint(code, options);
      return {...result, services: spyOnServices(result.services)};
    },
  };

  const wrapVisitor = (ruleName: string, visitor: Record<string, unknown> | null | undefined) =>
    Object.fromEntries(
      Object.entries(visitor || {}).flatMap(([key, listener]) =>
        isVisitorListener(listener) && !EMPTY_SELECTOR_GROUP_REGEX.test(key)
          ? [
              [
                key,
                (...listenerArguments: unknown[]) =>
                  withCurrentRule(ruleName, () => listener(...listenerArguments), undefined),
              ] as const,
            ]
          : [],
      ),
    );

  const wrappedPlugins = Object.fromEntries(
    Object.entries(plugins).map(([prefix, plugin]) => [
      prefix,
      {
        rules: Object.fromEntries(
          Object.entries(plugin.rules || {})
            .filter(([, rule]) => doesRunOnJavascript(rule))
            .map(([ruleName, rule]) => {
              const fullRuleName = `${prefix}/${ruleName}`;
              const {create} = rule as unknown as {
                create: (context: unknown) => Record<string, unknown> | null | undefined;
              };
              return [
                ruleName,
                {
                  ...rule,
                  // Options are never passed, so a schema requiring them would fail config
                  // validation before the rule ever runs
                  meta: {...rule.meta, languages: undefined, schema: false as const},
                  create: (context: unknown) =>
                    withCurrentRule(
                      fullRuleName,
                      () => wrapVisitor(fullRuleName, create(context)),
                      {},
                    ),
                },
              ];
            }),
        ),
      },
    ]),
  );

  const rulesToEnable: Linter.RulesRecord = Object.fromEntries(
    Object.entries(wrappedPlugins).flatMap(([prefix, {rules}]) =>
      Object.keys(rules).map((ruleName) => [`${prefix}/${ruleName}`, 1] as const),
    ),
  );

  const fixtureDirectory = await fs.mkdtemp(pathe.join(os.tmpdir(), 'type-info-probe-'));
  await Promise.all(
    Object.entries(FIXTURE_FILES).map(([name, source]) =>
      fs.writeFile(pathe.join(fixtureDirectory, name), source),
    ),
  );

  // Flat config matches `files` against the base path, and the fixture lives outside the project
  const linter = new Linter({cwd: fixtureDirectory});

  for (const [name, source] of Object.entries(FIXTURE_FILES)) {
    if (!SOURCE_FILE_REGEX.test(name)) {
      continue;
    }
    try {
      withSilencedOutput(() =>
        linter.verify(
          source,
          {
            files: ['**/*.ts', '**/*.tsx'],
            linterOptions: {noInlineConfig: true, reportUnusedDisableDirectives: 'off'},
            languageOptions: {
              parser: spyingParser,
              parserOptions: {
                ecmaFeatures: {jsx: true},
                ...(withTypeInfo && {
                  project: pathe.join(fixtureDirectory, 'tsconfig.json'),
                  tsconfigRootDir: fixtureDirectory,
                }),
              },
              sourceType: 'module',
            },
            plugins: wrappedPlugins,
            rules: rulesToEnable,
          },
          {filename: pathe.join(fixtureDirectory, name)},
        ),
      );
    } catch (error) {
      failures.push(`${name}: ${describeError(error)}`);
    }
  }

  await fs.rm(fixtureDirectory, {force: true, recursive: true});

  return {accessed, threw, failures};
};

const collectJsFiles = async (directory: string, into: string[]) => {
  const entries = await fs.readdir(directory, {withFileTypes: true}).catch(() => []);
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = pathe.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
          await collectJsFiles(entryPath, into);
        }
      } else if (JS_FILE_REGEX.test(entry.name)) {
        into.push(entryPath);
      }
    }),
  );
};

const namesFromClause = (clause: string | undefined) =>
  (clause || '')
    .split(',')
    .map((part) => part.trim().split(IMPORT_ALIAS_REGEX))
    .flatMap(([imported, alias]) =>
      imported?.trim() ? [{imported: imported.trim(), local: (alias || imported).trim()}] : [],
    );

/**
 * Splits `foo, {bar, baz as qux}` into the default binding and the braced names
 */
const splitImportClause = (clause: string) => {
  const bracesStart = clause.indexOf('{');
  const bracesEnd = clause.lastIndexOf('}');
  return bracesStart === -1 || bracesEnd < bracesStart
    ? {defaultBinding: clause.trim(), braced: ''}
    : {
        defaultBinding: clause.slice(0, bracesStart).replace(',', '').trim(),
        braced: clause.slice(bracesStart + 1, bracesEnd),
      };
};

const doesUseTypeInfo = (code: string) =>
  TS_CHECKER_TOKENS_REGEX.test(code) ||
  (code.includes('getParserServices') && TS_ESLINT_PACKAGE_REGEX.test(code));

export const findRuleDirectory = async (packageRoot: string) => {
  for (const candidate of RULE_DIRECTORY_CANDIDATES) {
    const directory = pathe.join(packageRoot, candidate);
    const entries = await fs.readdir(directory).catch(() => []);
    if (entries.filter((name) => JS_FILE_REGEX.test(name)).length > 2) {
      return directory;
    }
  }
  return null;
};

/**
 * Marks a rule when its own source reaches the TypeScript checker, or when a name it imports
 * resolves - through barrels and renamed re-exports - to a file that does.
 *
 * The granularity is the defining file, so a helper module mixing checker-backed and AST-only
 * exports over-reports: every rule it names still needs the plugin source read
 */
export const traceRulesUsingTypeInfo = async (packageRoot: string, ruleDirectory: string) => {
  const files: string[] = [];
  await collectJsFiles(packageRoot, files);

  const sources = new Map(
    await Promise.all(
      files.map(async (file) => [file, await fs.readFile(file, 'utf8').catch(() => '')] as const),
    ),
  );
  const sourceOf = (file: string) => sources.get(file) || '';

  const resolveSpecifier = (fromFile: string, specifier: string) => {
    const base = pathe.resolve(pathe.dirname(fromFile), specifier);
    return (
      [base, `${base}.js`, `${base}.cjs`, `${base}.mjs`, `${base}/index.js`].find((candidate) =>
        sources.has(candidate),
      ) || null
    );
  };

  const importsOf = (file: string) => {
    const code = sourceOf(file);

    const imports = [...code.matchAll(RELATIVE_IMPORT_REGEX)].flatMap((match) => {
      const target = resolveSpecifier(file, match[2] || '');
      if (target == null) {
        return [];
      }
      const {defaultBinding, braced} = splitImportClause(match[1] || '');
      return [
        {
          target,
          names: [
            ...namesFromClause(braced),
            ...(defaultBinding && !defaultBinding.startsWith(NAMESPACE_IMPORT_NAME)
              ? [{imported: DEFAULT_EXPORT_NAME, local: defaultBinding}]
              : []),
          ],
        },
      ];
    });

    const requires = [...code.matchAll(RELATIVE_REQUIRE_REGEX)].flatMap((match) => {
      const target = resolveSpecifier(file, match[1] || '');
      return target == null
        ? []
        : [{target, names: [{imported: NAMESPACE_IMPORT_NAME, local: NAMESPACE_IMPORT_NAME}]}];
    });

    return [...imports, ...requires];
  };

  const reExportsOf = new Map<string, Map<string, {file: string; name: string}>>();
  const starExportsOf = new Map<string, string[]>();
  const localExportsOf = new Map<string, Set<string>>();

  for (const file of files) {
    const code = sourceOf(file);

    reExportsOf.set(
      file,
      new Map(
        [...code.matchAll(RE_EXPORT_REGEX)].flatMap((match) => {
          const target = resolveSpecifier(file, match[2] || '');
          return target == null
            ? []
            : namesFromClause(match[1]).map(
                ({imported, local}) => [local, {file: target, name: imported}] as const,
              );
        }),
      ),
    );

    starExportsOf.set(
      file,
      [...code.matchAll(STAR_EXPORT_REGEX)].flatMap(
        (match) => resolveSpecifier(file, match[1] || '') || [],
      ),
    );

    localExportsOf.set(
      file,
      new Set([
        ...[...code.matchAll(LOCAL_DECLARATION_EXPORT_REGEX)].flatMap((match) => match[1] || []),
        ...[...code.matchAll(LOCAL_LIST_EXPORT_REGEX)].flatMap((match) =>
          namesFromClause(match[1]).map(({local}) => local),
        ),
        ...(code.includes('export default') ? [DEFAULT_EXPORT_NAME] : []),
      ]),
    );
  }

  const resolveExport = (file: string, name: string, seen = new Set<string>()): string => {
    const key = `${file}\0${name}`;
    if (seen.has(key)) {
      return file;
    }
    seen.add(key);

    const reExported = reExportsOf.get(file)?.get(name);
    if (reExported) {
      return resolveExport(reExported.file, reExported.name, seen);
    }
    if (localExportsOf.get(file)?.has(name)) {
      return file;
    }
    for (const starExport of starExportsOf.get(file) || []) {
      if (localExportsOf.get(starExport)?.has(name) || reExportsOf.get(starExport)?.has(name)) {
        return resolveExport(starExport, name, seen);
      }
    }
    return file;
  };

  const awareness = new Map<string, boolean>();
  const isAware = (file: string, name: string, stack = new Set<string>()): boolean => {
    const key = `${file}\0${name}`;
    const known = awareness.get(key);
    if (known != null) {
      return known;
    }
    if (stack.has(key)) {
      return false;
    }
    stack.add(key);

    const definingFile = name === NAMESPACE_IMPORT_NAME ? file : resolveExport(file, name);
    const isDefiningFileAware =
      doesUseTypeInfo(sourceOf(definingFile)) ||
      importsOf(definingFile).some(({target, names}) =>
        names.some(({imported}) => isAware(target, imported, stack)),
      );

    stack.delete(key);
    awareness.set(key, isDefiningFileAware);
    return isDefiningFileAware;
  };

  return new Map(
    files
      .filter((file) => pathe.dirname(file) === ruleDirectory && file.endsWith('.js'))
      .flatMap((file) => {
        const reasons = [
          ...(doesUseTypeInfo(sourceOf(file)) ? ['reads the parser services directly'] : []),
          ...importsOf(file).flatMap(({target, names}) =>
            names.flatMap(({imported, local}) => {
              if (imported === NAMESPACE_IMPORT_NAME || !isAware(target, imported)) {
                return [];
              }
              const definingFile = pathe.basename(resolveExport(target, imported));
              return OPAQUE_MODULE_NAMES.has(definingFile) ? [] : [`${local} <- ${definingFile}`];
            }),
          ),
        ];

        return reasons.length > 0
          ? [[pathe.basename(file, '.js'), reasons.slice(0, 3).join(', ')] as const]
          : [];
      }),
  );
};
