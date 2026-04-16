// TODO: treat version from our package.json as latest
// TODO: handle importing too many modules
import fs from 'node:fs/promises';
import path from 'node:path';
import {styleText} from 'node:util';
import {cli} from 'cleye';
import consola from 'consola';
import {destr as jsonParse} from 'destr';
import prettier from 'prettier';
import {parse as parseSemver, satisfies as rangeSatisfies, validRange} from 'semver';
import {exec} from 'tinyexec';
import * as z from 'zod';
import type {PackageJson} from 'zod-package-json';
import prettierConfig from '../.prettierrc.json' with {type: 'json'};
import type {generateEslintPluginsRulesPresence} from './shared';

const NPM_PACKAGE_NAME_REGEX = /^(?:@[*\-0-9a-z~][*\-.0-9_a-z~]*\/)?[*\-0-9a-z~][*\-.0-9_a-z~]*$/;

const TOO_MANY_VERSIONS_THRESHOLD = 300;

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
  allowManyVersions,
  skipInstallation,
  ignorePrereleaseRegexes,
}: ReturnType<typeof main> & {}) {
  const projectDir = path.join(import.meta.dirname, 'temp', packageName);
  const generatePathInProject = (...paths: string[]) => path.join(projectDir, ...paths);

  await fs.mkdir(projectDir, {recursive: true});

  const packageJsonPath = generatePathInProject('package.json');

  if ((await fileExists(packageJsonPath)) && !overwriteIfExists) {
    logger.error(
      `Project's package.json already exists at ${packageJsonPath}. Use --overwrite to overwrite it.`,
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

  if (versionsSorted.length >= TOO_MANY_VERSIONS_THRESHOLD && !allowManyVersions) {
    logger.error(
      `This package has too many versions (${versionsSorted.length}). Use --allow-many-versions flag to skip this check.`,
    );
    return false;
  }

  const ignoredVersionsCount = allVersions.length - versionsSorted.length;
  logger.log(
    `${allVersions.length} version${allVersions.length === 1 ? '' : 's'} found${ignoredVersionsCount > 0 ? `, ${ignoredVersionsCount} ignored (${versionsIgnoredByRange.length} by range, ${versionsIgnoredByPrereleaseRegexes.length} by prerelease regexes)` : ''}`,
  );

  const generatedPackageJson: PackageJson = {
    name: `${packageName}--rules-finder`,
    version: '',
    dependencies: Object.fromEntries(
      versionsSorted.map(({version}) => [
        `${packageName}-${version}`,
        `npm:${packageName}@${version}`,
      ]),
    ),
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
  const runnerScriptSource = `import {createRequire} from 'module';
  import {interopDefault} from '${'../'.repeat(3 + extraDepth)}src/utils';
  import {generateEslintPluginsRulesPresence} from '${'../'.repeat(2 + extraDepth)}shared';

  globalThis.__dirname = globalThis.__filename = '';
  globalThis.require = createRequire(import.meta.url);

  const toStdout = process.stdout.write.bind(process.stdout);

  process.stdout.write = (chunk, encodingOrCallback, callback) => {
    typeof encodingOrCallback === 'function' ? encodingOrCallback() : callback?.();
    return true;
  }

  (async () => {
  const modules = await Promise.all([${versionsSorted.map(({version}) => `['${packageName}-${version}', '${version}']`).join(',\n')}].map(([name, version]) =>
    interopDefault<EslintPlugin>(import(name))
      .then((plugin) => ({plugin, version}))
      .catch((error: unknown) => ({error: JSON.stringify(error, Object.getOwnPropertyNames(error)), version})),
  ));

  toStdout(JSON.stringify(generateEslintPluginsRulesPresence(modules), null, 2));
  })();`;

  await Promise.all([
    fs.writeFile(packageJsonPath, JSON.stringify(generatedPackageJson, null, 2), 'utf8'),
    prettier
      .format(runnerScriptSource, {parser: 'typescript', ...prettierConfig})
      .then((source) => fs.writeFile(runnerScriptPath, source, 'utf8')),
  ]);

  if (!skipInstallation) {
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

  logger.log('Running the rules finder...');

  const {
    stdout: rulesInfoString,
    stderr: rulesInfoError,
    exitCode: rulesInfoExitCode,
  } = await exec('npx', ['tsx', runnerScriptPath]);

  if (rulesInfoExitCode) {
    logger.error(rulesInfoError);
    return false;
  }

  const {rules: rulesInfo, errors: pluginLoadingErrors} =
    jsonParse<ReturnType<typeof generateEslintPluginsRulesPresence>>(rulesInfoString);

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

    const table: string[][] = [
      ['Rule name', 'Min version', 'Max version'],
      ...sortedRules.map(({ruleName, minVersion, maxVersion, deprecatedVersions}) => [
        `${deprecatedVersions.includes(latestVersion) ? '⛔ ' : ''}${ruleName}`,
        minVersion || '',
        `${
          maxVersion === latestVersion
            ? '✅(latest)'
            : new Date(npmPackageInfo.time[maxVersion || ''] || '').getTime() >=
                new Date(npmPackageInfo.time[latestVersion] || '').getTime()
              ? '✅(future)'
              : '⚠️'
        } ${maxVersion}`,
      ]),
    ];

    const maxColumnWidths = table.map((_, rowIndex) =>
      Math.max(...table.map((row) => row[rowIndex]?.length || 0)),
    );

    return table
      .flatMap((row, rowIndex) => [
        row
          .map((cell, colIndex, allColumns) =>
            cell.padEnd(colIndex === allColumns.length - 1 ? 0 : maxColumnWidths[colIndex] || 0),
          )
          .join(' | '),
        ...(rowIndex === 0
          ? [row.map((_, colIndex) => '-'.repeat(maxColumnWidths[colIndex] || 0)).join(' | ')]
          : []),
      ])
      .join('\n');
  };

  const rulesInfoPath = generatePathInProject('rules-info.json');
  const rulesOverviewPath = generatePathInProject('rules-overview.md');

  const rulesOverviewContents: string = [
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
    '### Sorted by rule name\n',
    generateOverview('ruleName'),
    '',
    '### Sorted by version\n',
    generateOverview('version'),
  ].join('\n');

  await Promise.all([
    fs.writeFile(rulesInfoPath, rulesInfoString, 'utf8'),
    fs.writeFile(rulesOverviewPath, rulesOverviewContents, 'utf8'),
  ]);

  logger.log(`✅ Rules info saved to ${rulesInfoPath}`);
  logger.log(`📃 Rules overview saved to ${rulesOverviewPath}`);

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
    flags: {
      range: {
        type: String,
        description: 'Specify a version range for the package',
      },
      overwrite: {
        type: Boolean,
        description: 'Overwrite project package.json if it exists',
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
      allowManyVersions: {
        type: Boolean,
        description: `Allow packages with many versions (>=${TOO_MANY_VERSIONS_THRESHOLD})`,
      },
      skipInstallation: {
        type: Boolean,
        description:
          'Skip dependency installation step (for example, if it gets stuck for some reason)',
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
    allowManyVersions,
    skipInstallation,
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
    allowManyVersions,
    skipInstallation,
    ignorePrereleaseRegexes,
  };
}
