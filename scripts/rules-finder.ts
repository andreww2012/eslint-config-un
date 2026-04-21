// TODO: treat version from our package.json as latest
import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {cli} from 'cleye';
import consola from 'consola';
import {destr as jsonParse} from 'destr';
import prettier from 'prettier';
import {
  compare as compareVersions,
  parse as parseSemver,
  satisfies as rangeSatisfies,
  validRange,
} from 'semver';
import {exec} from 'tinyexec';
import * as z from 'zod';
import type {PackageJson} from 'zod-package-json';
import prettierConfig from '../.prettierrc.json' with {type: 'json'};
import type {generateEslintPluginsRulesPresence} from './shared';

const NPM_PACKAGE_NAME_REGEX = /^(?:@[*\-0-9a-z~][*\-.0-9_a-z~]*\/)?[*\-0-9a-z~][*\-.0-9_a-z~]*$/;

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_CONCURRENCY = 100;

const NpmPackageInfoZod = z.union([
  z.object({
    error: z.string(),
  }),
  z.object({
    'dist-tags': z.object({latest: z.string()}),
    versions: z.record(z.string(), z.object({})),
    time: z.record(z.string(), z.iso.datetime()),
  }),
]);

const KNOWN_NPM_PACKAGES_REQUIRING_OVERRIDE: readonly (
  | string
  | [override: string, version: string]
)[] = [
  ...['debug', 'jsx', 'hooks', 'react-hooks', 'react', 'react-dom', 'naming-convention'].map(
    (suffix) => `@eslint-react/eslint-plugin-${suffix}`,
  ),
  ['@typescript-eslint/experimental-utils@4.33.0', 'latest'],
  ['@graphql-eslint/parser@>=0.0.1 <0.0.2-0', '0.1.0'],
  '@local/eff', // Not found, dependency of @eslint-react/eslint-plugin@3.0.0-next.74
];
const DEFAULT_NPM_PACKAGE_OVERRIDE = 'npm:-';

const fileExists = async (fullPath: string) =>
  await fs
    .access(fullPath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);

const isStringRegexpValid = (regexp: string) => {
  try {
    // eslint-disable-next-line no-new
    new RegExp(regexp);
    return true;
  } catch (error) {
    if (error instanceof SyntaxError) {
      return false;
    }
    throw error;
  }
};

const mergeRulesPresenceResults = (
  results: ReturnType<typeof generateEslintPluginsRulesPresence>[],
): ReturnType<typeof generateEslintPluginsRulesPresence> => {
  const ruleMap = new Map<string, {versions: string[]; deprecatedVersions: string[]}>();

  for (const {rules} of results) {
    for (const {ruleName, versions, deprecatedVersions} of rules) {
      const existing = ruleMap.get(ruleName) || {versions: [], deprecatedVersions: []};
      existing.versions.push(...versions);
      existing.deprecatedVersions.push(...deprecatedVersions);
      ruleMap.set(ruleName, existing);
    }
  }

  return {
    rules: Array.from(ruleMap, ([ruleName, {versions, deprecatedVersions}]) => {
      const versionsSorted = versions.toSorted((a, b) => compareVersions(a, b));
      return {
        ruleName,
        minVersion: versionsSorted[0],
        maxVersion: versionsSorted.at(-1),
        totalVersions: versionsSorted.length,
        versions: versionsSorted,
        deprecatedVersions,
      };
    }),
    errors: results.flatMap(({errors}) => errors),
  };
};

const logger = consola.withTag('rules-finder');

const mainResult = main();

if (!mainResult) {
  process.exit(1);
}

const result = await run(mainResult);

if (!result) {
  process.exit(1);
}

async function run({
  packageName,
  packageVersionsRange,
  overwriteIfExists,
  ignoreVersions,
  overridePackages,
  skipInstallation,
  ignorePrereleaseRegexes,
  concurrency,
  batchSize,
}: ReturnType<typeof main> & {}) {
  const projectDir = path.join(import.meta.dirname, 'temp', packageName);
  const generatePathInProject = (...paths: string[]) => path.join(projectDir, ...paths);

  await fs.mkdir(projectDir, {recursive: true});

  const packageJsonPath = generatePathInProject('package.json');

  if ((await fileExists(packageJsonPath)) && !overwriteIfExists) {
    logger.error(
      `Project's package.json already exists at ${packageJsonPath}. Use --no-overwrite to skip overwriting it.`,
    );
    return false;
  }

  const npmPackageInfo = await getNpmPackageInfo(packageName);
  if ('error' in npmPackageInfo) {
    logger.error(`Failed to fetch package info for ${packageName}: ${npmPackageInfo.error}`);
    return false;
  }

  const allVersions = Object.keys(npmPackageInfo.versions);

  const versionsIgnoredByRange: string[] = [];
  const versionsIgnoredByPrereleaseRegexes: string[] = [];
  const versionsSorted = allVersions
    .map((version, i) => {
      if (ignoreVersions.some((rangeToIgnore) => rangeSatisfies(version, rangeToIgnore))) {
        versionsIgnoredByRange.push(version);
        return null;
      }
      const versionParsed = parseSemver(version);
      if (versionParsed) {
        const fullPrerelease = versionParsed.prerelease.join('.');
        if (fullPrerelease && ignorePrereleaseRegexes.some((regex) => regex.test(fullPrerelease))) {
          versionsIgnoredByPrereleaseRegexes.push(version);
          return null;
        }
      }
      return {
        version,
        date: new Date(npmPackageInfo.time[version] || ''),
        symbol: `$${i}`,
      };
    })
    .filter((v) => v != null)
    // eslint-disable-next-line unicorn/no-array-sort
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter(({version}) => !packageVersionsRange || rangeSatisfies(version, packageVersionsRange));

  const ignoredVersionsCount = allVersions.length - versionsSorted.length;
  logger.log(
    `${allVersions.length} version${allVersions.length === 1 ? '' : 's'} found${ignoredVersionsCount > 0 ? `, ${ignoredVersionsCount} ignored (${versionsIgnoredByRange.length} by range, ${versionsIgnoredByPrereleaseRegexes.length} by prerelease regexes)` : ''}`,
  );

  const generatedPackageJson: PackageJson = {
    name: `${packageName}--rules-finder`,
    version: '',
    type: 'module',
    dependencies: {
      'p-queue': '9.1.2',
      ...Object.fromEntries(
        versionsSorted.map(({version}) => [
          `${packageName}-${version}`,
          `npm:${packageName}@${version}`,
        ]),
      ),
    },
    pnpm: {
      overrides: {
        ...Object.fromEntries(
          KNOWN_NPM_PACKAGES_REQUIRING_OVERRIDE.map((missingPackage) =>
            Array.isArray(missingPackage)
              ? missingPackage
              : [missingPackage, DEFAULT_NPM_PACKAGE_OVERRIDE],
          ),
        ),
        ...Object.fromEntries(
          overridePackages.map(({packageName: missingPackageName, override}) => [
            missingPackageName,
            override || DEFAULT_NPM_PACKAGE_OVERRIDE,
          ]),
        ),
      },
    },
  };

  const runnerScriptPath = generatePathInProject('run.ts');
  const extraDepth = [...packageName.matchAll(/\//g)].length;

  const generateRunnerScriptSource = (allBatches: (typeof versionsSorted)[]) => `
import {createRequire} from 'module';
import PQueue from 'p-queue';
import {interopDefault} from '${'../'.repeat(3 + extraDepth)}src/utils';
import {generateEslintPluginsRulesPresence} from '${'../'.repeat(2 + extraDepth)}shared';
import {EslintPlugin} from '${'../'.repeat(3 + extraDepth)}src/eslint/eslint-types';

globalThis.__dirname = globalThis.__filename = '';
globalThis.require = createRequire(import.meta.url);

const toStdout = process.stdout.write.bind(process.stdout);

/** @ts-expect-error - pick ups the wrong overload */
process.stdout.write = (chunk, encodingOrCallback, callback) => {
  typeof encodingOrCallback === 'function' /** @ts-expect-error - same reason as above */
    ? encodingOrCallback()
    : callback?.();
  return true;
};

const batches: [string, string][][] = [
  ${allBatches.map((batch) => `[${batch.map(({version}) => `['${packageName}-${version}', '${version}']`).join(', ')}]`).join(',\n')}
];

const batchIndex = Number(process.argv[process.argv.indexOf('--batch') + 1]);
const batchVersions = batches[batchIndex]!;

const queue = new PQueue({concurrency: ${concurrency}});

const modules = await Promise.all(
  batchVersions.map(([name, version]) =>
    queue.add(() =>
      interopDefault<EslintPlugin>(import(name))
        .then((plugin) => ({plugin, version}))
        .catch((error: unknown) => ({error: JSON.stringify(error, Object.getOwnPropertyNames(error)), version})),
    ),
  ),
);

toStdout(JSON.stringify(generateEslintPluginsRulesPresence(modules), null, 2));
`;

  await fs.writeFile(packageJsonPath, JSON.stringify(generatedPackageJson, null, 2), 'utf8');

  const nodeModulesPath = generatePathInProject('node_modules');
  const depsInstalled = await Promise.all(
    Object.keys(generatedPackageJson.dependencies ?? {}).map((name) =>
      fs
        .access(path.join(nodeModulesPath, name))
        .then(() => true)
        .catch(() => false),
    ),
  ).then((results) => results.every(Boolean));

  if (skipInstallation === true && !depsInstalled) {
    logger.error(
      '--skip-installation was set but dependencies are not installed. Remove the flag to install them.',
    );
    return false;
  }

  if (depsInstalled) {
    logger.log('Dependencies already installed, skipping installation.');
  } else {
    logger.log('Installing dependencies...');

    const {stdout: dependencyInstallationOutput, exitCode: dependencyInstallationErrorCode} =
      await exec('pnpm', ['i', '--ignore-workspace', '--shamefully-hoist', 'true'], {
        nodeOptions: {cwd: projectDir},
      });

    if (dependencyInstallationErrorCode) {
      logger.error(
        dependencyInstallationOutput
          .split('\n')
          .filter((str) => str && !/^(?:Progress: |\s+WARN\s+)/.test(str))
          .join('\n'),
      );
      return false;
    }
  }

  const batches = versionsSorted.flatMap((_, i) =>
    i % batchSize === 0 ? [versionsSorted.slice(i, i + batchSize)] : [],
  );

  const batchResults: ReturnType<typeof generateEslintPluginsRulesPresence>[] = [];

  await prettier
    .format(generateRunnerScriptSource(batches), {
      parser: 'typescript',
      ...prettierConfig,
    })
    .then((source) => fs.writeFile(runnerScriptPath, source, 'utf8'));

  for (const [batchIndex, batchVersions] of batches.entries()) {
    logger.log(
      `Running batch ${batchIndex + 1}/${batches.length} (${batchIndex * batchSize + batchVersions.length} versions)...`,
    );

    const {
      stdout: batchStdout,
      stderr: batchStderr,
      exitCode: batchExitCode,
    } = await exec('node', [
      '--import',
      'tsx/esm',
      runnerScriptPath,
      '--batch',
      String(batchIndex),
    ]);

    if (batchExitCode) {
      logger.error(`Batch ${batchIndex + 1}/${batches.length} failed:\n${batchStderr}`);
      return false;
    }

    batchResults.push(
      jsonParse<ReturnType<typeof generateEslintPluginsRulesPresence>>(batchStdout),
    );
  }

  const {rules: rulesInfo, errors: pluginLoadingErrors} = mergeRulesPresenceResults(batchResults);

  if (pluginLoadingErrors.length > 0) {
    console.warn(
      styleText(
        'red',
        `${pluginLoadingErrors.length} plugin${pluginLoadingErrors.length === 1 ? '' : 's'} failed to load:`,
      ),
    );
    pluginLoadingErrors.forEach(({error, version}) => {
      console.warn(`- Version ${version}:`, error);
    });
  }

  const latestVersion = npmPackageInfo['dist-tags'].latest;
  const generateOverview = (sort: 'ruleName' | 'version'): string => {
    const sortedRules =
      sort === 'version'
        ? rulesInfo
        : rulesInfo.toSorted(({ruleName: a}, {ruleName: b}) => a.localeCompare(b));

    const hasDeprecated = sortedRules.some(({deprecatedVersions}) =>
      deprecatedVersions.includes(latestVersion),
    );

    const dataRows = sortedRules.map(({ruleName, minVersion, maxVersion, deprecatedVersions}) => [
      ...(hasDeprecated ? [deprecatedVersions.includes(latestVersion) ? '⛔' : '  '] : []),
      ruleName,
      minVersion || '',
      `${
        maxVersion === latestVersion
          ? '✅(latest)'
          : new Date(npmPackageInfo.time[maxVersion || ''] || '').getTime() >=
              new Date(npmPackageInfo.time[latestVersion] || '').getTime()
            ? '✅(future)'
            : '⚠️'
      } ${maxVersion}`,
    ]);

    const headerRow = [...(hasDeprecated ? ['  '] : []), 'Rule name', 'Min version', 'Max version'];

    const table: string[][] = [headerRow, ...dataRows];

    const maxColumnWidths = table.map((_, rowIndex) =>
      Math.max(...table.map((row) => row[rowIndex]?.length || 0)),
    );

    return table
      .flatMap((row, rowIndex) => [
        row
          .map((cell, colIndex, allColumns) =>
            cell.padEnd(
              colIndex === allColumns.length - 1 || (hasDeprecated && colIndex === 0)
                ? 0
                : maxColumnWidths[colIndex] || 0,
            ),
          )
          .join(' | '),
        ...(rowIndex === 0
          ? [row.map((_, colIndex) => '-'.repeat(maxColumnWidths[colIndex] || 0)).join(' | ')]
          : []),
      ])
      .join('\n');
  };

  const rulesInfoPath = generatePathInProject('rules-info.json');
  const rulesOverviewSortingNamePath = generatePathInProject('rules-overview-sorting-name.md');
  const rulesOverviewSortingVersionPath = generatePathInProject(
    'rules-overview-sorting-version.md',
  );
  const issuesPath = generatePathInProject('issues.md');

  const hasIssues =
    versionsIgnoredByRange.length > 0 ||
    versionsIgnoredByPrereleaseRegexes.length > 0 ||
    pluginLoadingErrors.length > 0;

  const issuesContents: string = hasIssues
    ? [
        ...(versionsIgnoredByRange.length > 0
          ? [
              '### ⚠️ Versions that were ignored by range\n',
              ...versionsIgnoredByRange.map(
                (version) =>
                  `- [\`${version}\`](https://socket.dev/npm/package/${packageName}/diff/${version})`,
              ),
              '',
            ]
          : []),
        ...(versionsIgnoredByPrereleaseRegexes.length > 0
          ? [
              '### ⚠️ Versions that were ignored by prerelease regexes\n',
              ...versionsIgnoredByPrereleaseRegexes.map((version) => `- \`${version}\``),
              '',
            ]
          : []),
        ...(pluginLoadingErrors.length > 0
          ? [
              '### ❌ Versions that failed to load\n',
              ...pluginLoadingErrors.flatMap(({version, error}) => [
                `#### [\`${version}\`](https://socket.dev/npm/package/${packageName}/diff/${version})\n`,
                `\`\`\`json\n${JSON.stringify(error, null, 2)}\n\`\`\``,
              ]),
            ]
          : []),
      ].join('\n')
    : 'No issues found 🎉\n';

  const mdHeading = `# Plugin \`${packageName}\`\n\n`;

  await Promise.all([
    fs.writeFile(
      rulesInfoPath,
      JSON.stringify({plugin: packageName, rules: rulesInfo, errors: pluginLoadingErrors}, null, 2),
      'utf8',
    ),
    fs.writeFile(rulesOverviewSortingNamePath, mdHeading + generateOverview('ruleName'), 'utf8'),
    fs.writeFile(rulesOverviewSortingVersionPath, mdHeading + generateOverview('version'), 'utf8'),
    fs.writeFile(issuesPath, mdHeading + issuesContents, 'utf8'),
  ]);

  logger.log(`📃 Rules overview (by name) saved to ${rulesOverviewSortingNamePath}`);
  logger.log(`📃 Rules overview (by version) saved to ${rulesOverviewSortingVersionPath}`);
  logger.log(`✅ Rules info saved to ${rulesInfoPath}`);
  logger.log(`${hasIssues ? '⚠️' : '✅'} Issues saved to ${issuesPath}`);

  return true;
}

async function getNpmPackageInfo(packageName: string) {
  // eslint-disable-next-line node/no-unsupported-features/node-builtins
  const response = await fetch(`https://registry.npmjs.org/${packageName}`);
  if (!response.ok) {
    return {error: `${response.status} ${response.statusText}`};
  }
  return NpmPackageInfoZod.parse(await response.json());
}

function main() {
  const argv = cli({
    parameters: ['<package>'],
    strictFlags: true,
    booleanFlagNegation: true,
    flags: {
      range: {
        type: String,
        description: 'Specify a version range for the package',
      },
      overwrite: {
        type: Boolean,
        description: 'Overwrite project package.json if it exists',
        default: true,
      },
      override: {
        type: [String],
        description:
          'Package names that do not exist on npm anymore and should be overridden with `-` package, or, if specified after `|`, with that version or range',
        alias: 's',
      },
      ignore: {
        type: [String],
        description: 'Package version semver range(s) to skip the installation of',
        alias: 'i',
      },
      skipInstallation: {
        type: Boolean,
        description:
          'Skip dependency installation step even if dependencies appear to be missing (auto-skipped when already installed)',
      },
      concurrency: {
        type: Number,
        description: 'Maximum number of plugin versions to import concurrently within a batch',
        default: DEFAULT_CONCURRENCY,
      },
      batchSize: {
        type: Number,
        description:
          'Number of plugin versions per runner process invocation (limits peak memory usage)',
        default: DEFAULT_BATCH_SIZE,
      },
      ignorePrerelease: {
        type: [String],
        description: 'Regex(es) for prerelease versions to ignore',
      },
      unescapeRegexes: {
        type: Boolean,
        description:
          'If the passed regexes get additionally escaped by your shell, use this option to unescape them',
      },
    },
  });

  const {package: packageName} = argv._;
  const {
    range: packageVersionsRange,
    overwrite: overwriteIfExists,
    ignore: ignoreVersions,
    override: overridePackagesRaw,
    skipInstallation,
    concurrency,
    batchSize,
    ignorePrerelease: ignorePrereleaseRegexStrings,
    unescapeRegexes,
  } = argv.flags;

  const errors: string[] = [];

  const invalidIgnoredPrereleaseRegexStrings = ignorePrereleaseRegexStrings.filter(
    (regexp) => !isStringRegexpValid(regexp),
  );
  if (invalidIgnoredPrereleaseRegexStrings.length > 0) {
    errors.push(
      `Invalid ignored prerelease regex(es):\n${invalidIgnoredPrereleaseRegexStrings.join('\n')}`,
    );
  }

  if (!NPM_PACKAGE_NAME_REGEX.test(packageName)) {
    errors.push(`Invalid package name: ${packageName}`);
  }

  if (packageVersionsRange && !validRange(packageVersionsRange)) {
    errors.push(`Invalid version range: ${packageVersionsRange}`);
  }

  const invalidIgnoredVersions = ignoreVersions.filter((version) => !validRange(version));
  if (invalidIgnoredVersions.length > 0) {
    errors.push(`Invalid ignored version ranges: ${invalidIgnoredVersions.join(', ')}`);
  }

  const invalidPackageNamesToOverride: string[] = [];
  const invalidPackageOverrides: string[] = [];
  const overridePackages = overridePackagesRaw.map((packageNameAndMaybeOverride) => {
    const [packageNameToOverride = '', override] = packageNameAndMaybeOverride
      .split('|')
      .map((s) => s.trim());
    if (!NPM_PACKAGE_NAME_REGEX.test(packageNameToOverride)) {
      invalidPackageNamesToOverride.push(packageNameToOverride);
    }
    if (override && !validRange(override)) {
      invalidPackageOverrides.push(override);
    }
    return {
      packageName: packageNameToOverride,
      override,
    };
  });
  if (invalidPackageNamesToOverride.length > 0) {
    errors.push(`Invalid package names to override: ${invalidPackageNamesToOverride.join(', ')}`);
  }
  if (invalidPackageOverrides.length > 0) {
    errors.push(`Invalid package overrides: ${invalidPackageOverrides.join(', ')}`);
  }

  if (errors.length > 0) {
    errors.forEach((error) => {
      logger.error(error);
    });
    return null;
  }

  const ignorePrereleaseRegexes = ignorePrereleaseRegexStrings.map((regexString) => {
    if (unescapeRegexes) {
      // eslint-disable-next-line no-param-reassign
      regexString = regexString.replaceAll(String.raw`\\`, '\\');
    }
    return new RegExp(regexString);
  });

  return {
    packageName,
    packageVersionsRange,
    overwriteIfExists,
    ignoreVersions,
    overridePackages,
    skipInstallation,
    ignorePrereleaseRegexes,
    concurrency,
    batchSize,
  };
}
