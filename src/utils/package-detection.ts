// cspell:ignore pnpapi
import {existsSync} from 'node:fs';
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import url from 'node:url';
import * as findUp from 'empathic/find';
import * as packageUtils from 'empathic/package';
import * as walk from 'empathic/walk';
import {resolve as resolvePackage} from 'import-meta-resolve';
import {getLastResolvedPackageJsonUrl} from 'import-meta-resolve/resolve';
import {parse as parseYaml} from 'yaml';
import type {Nullable, PackageJson} from '../types';
import {
  arrayPartition,
  arrayWithoutFalsy,
  isObject,
  jsonParseSafe,
  mapGetOrInsertComputed,
  once,
  readAndParseJson,
  readFileSafe,
} from '../utils';

// Yarn PnP has no `node_modules` for `import-meta-resolve` to traverse
// eslint-disable-next-line ts/no-unsafe-assignment -- `pnpapi` has no bundled types
const pnpApi: {resolveToUnqualified: (request: string, issuer: string) => string | null} | null =
  process.versions['pnp'] ? createRequire(import.meta.url)('pnpapi') : null;

const ownPackageDirectory = path.dirname(
  packageUtils.up({cwd: import.meta.dirname}) || import.meta.dirname,
);

// Where our own dependencies and peers are linked for us
const ownDependenciesDirectory = `${path.dirname(ownPackageDirectory)}${path.sep}`;

// A project's `node_modules` sits next to its `package.json`, unlike the one of a store shared between projects
const isInstalledInSharedStore = (() => {
  const pathSegments = ownPackageDirectory.split(path.sep);
  const nodeModulesIndex = pathSegments.indexOf('node_modules');
  return (
    !pnpApi &&
    nodeModulesIndex !== -1 &&
    !existsSync(
      path.join(pathSegments.slice(0, nodeModulesIndex).join(path.sep) || path.sep, 'package.json'),
    )
  );
})();

const resolvePackageJsonUrl = (packageName: string, parentUrl: string) => {
  try {
    // `getPackageInfo` from `local-pkg` isn't always able to find the correct package.json: https://github.com/antfu-collective/local-pkg/issues/16
    // This trick uses the patched version of `import-meta-resolve` that after calling `resolvePackage` updates the last resolved package's package.json path
    resolvePackage(packageName, parentUrl);
    return getLastResolvedPackageJsonUrl();
  } catch {
    // If module is not resolved, the error is thrown
    return null;
  }
};

// aube's global virtual store hoists the packages of every project above ours, so only what is linked next to us is ours
const resolveOwnPackageJsonUrl = (packageName: string) => {
  const packageJsonUrl = resolvePackageJsonUrl(packageName, import.meta.url);
  return packageJsonUrl &&
    (!isInstalledInSharedStore ||
      url.fileURLToPath(packageJsonUrl).startsWith(ownDependenciesDirectory))
    ? packageJsonUrl
    : null;
};

/** Whether importing the package from our own code loads the copy installed for us */
export const isOwnCopyImportable = (packageName: string) =>
  !isInstalledInSharedStore || resolveOwnPackageJsonUrl(packageName) != null;

/** Resolves the module the way the project itself would, which importing it from our own code may not */
export const resolveFromProject = (specifier: string, projectDirectory: string) => {
  try {
    return resolvePackage(specifier, url.pathToFileURL(`${projectDirectory}${path.sep}`).href);
  } catch {
    return null;
  }
};

const resolvePackageJsonPathWithPnp = (packageName: string, issuer: string) => {
  try {
    // Unqualified resolution skips `exports`, so `package.json` is found even if not exported
    return pnpApi?.resolveToUnqualified(`${packageName}/package.json`, issuer) || null;
  } catch {
    return null;
  }
};

/** Resolves the package the way the code in the given directory would */
const resolvePackageJsonPathFrom = (packageName: string, issuerDirectory: string) => {
  const issuer = `${issuerDirectory}${path.sep}`;
  if (pnpApi) {
    return resolvePackageJsonPathWithPnp(packageName, issuer);
  }
  const packageJsonUrl = resolvePackageJsonUrl(packageName, url.pathToFileURL(issuer).href);
  return packageJsonUrl ? url.fileURLToPath(packageJsonUrl) : null;
};

const resolvePackageJsonPath = (packageName: string) =>
  // In stores shared between projects or in Yarn PnP workspaces, we only reach our own dependencies
  (pnpApi
    ? resolvePackageJsonPathWithPnp(packageName, import.meta.filename)
    : resolveOwnPackageJsonUrl(packageName)) ||
  resolvePackageJsonPathFrom(packageName, process.cwd());

const readPackageInfo = async (packageJsonPath: Nullable<string | URL>) => {
  const packageInfo = packageJsonPath ? await readAndParseJson<PackageJson>(packageJsonPath) : null;
  if (!packageInfo) {
    return null;
  }

  /* v8 ignore next - No package in `node_modules` declares a missing or non-numeric version */
  const fullVersion = packageInfo.version || '';

  const majorVersionRaw = Number.parseInt(fullVersion, 10);
  /* v8 ignore next */
  const majorVersion = Number.isNaN(majorVersionRaw) ? null : majorVersionRaw;

  const majorAndMinorVersionRaw = Number.parseFloat(fullVersion);
  /* v8 ignore next */
  const majorAndMinorVersion = Number.isNaN(majorAndMinorVersionRaw)
    ? null
    : majorAndMinorVersionRaw;

  return {
    info: packageInfo,
    versions: {
      full: fullVersion,
      major: majorVersion,
      majorAndMinor: majorAndMinorVersion,
    },
  };
};

type PackageInfo = NonNullable<Awaited<ReturnType<typeof readPackageInfo>>>;

/** Finds the package the way our own code would, or else the way the project would */
export const fetchPackageInfo = async (packageName: string) =>
  await readPackageInfo(resolvePackageJsonPath(packageName));

const INSTALLED_DEPENDENCY_FIELDS = [
  'dependencies',
  'optionalDependencies',
  'peerDependencies',
] as const;

// Unlike the ones of the project, dev dependencies of an installed package are not installed
const DECLARED_DEPENDENCY_FIELDS = [...INSTALLED_DEPENDENCY_FIELDS, 'devDependencies'] as const;

// npm, Yarn and Bun read the `workspaces` field of `package.json` instead
const WORKSPACE_FILE_NAMES = ['pnpm-workspace.yaml', 'aube-workspace.yaml'] as const;

const DENO_CONFIG_FILE_NAMES = ['deno.json', 'deno.jsonc'] as const;

const MANIFEST_FILE_NAMES = ['package.json', ...DENO_CONFIG_FILE_NAMES] as const;

// Only with a version range or a dist-tag is the installed package sure to have the declared name,
// unlike with `npm:`, `catalog:`, `file:` and other such specifiers
const PLAIN_SPECIFIER_REGEXP = /^[^/:]*$/;

// Deno installs the packages of `npm:` imports under their own names
const DENO_NPM_SPECIFIER_REGEXP = /^npm:\/?(?<name>(?:@[^/@]+\/)?[^/@]+)(?:@(?<range>[^/]*))?/;

const JSONC_COMMENTS_REGEXP = /("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g;

const JSONC_TRAILING_COMMAS_REGEXP = /("(?:\\.|[^"\\])*")|,(?=\s*[\]}])/g;

interface DenoConfig {
  imports?: Record<string, string>;
  workspace?: string[];
}

const readDenoConfig = async (directory: string) => {
  const contents = (
    await Promise.all(
      DENO_CONFIG_FILE_NAMES.map((fileName) => readFileSafe(path.join(directory, fileName))),
    )
  ).find((fileContents) => fileContents != null);
  // Unlike JSON, it may have comments and trailing commas
  const config =
    contents == null
      ? null
      : jsonParseSafe<DenoConfig | null>(
          contents
            .replaceAll(JSONC_COMMENTS_REGEXP, '$1')
            .replaceAll(JSONC_TRAILING_COMMAS_REGEXP, '$1'),
        );
  return isObject(config) ? config : null;
};

const readManifest = async (directory: string) => {
  const [packageJsonRaw, denoConfig] = await Promise.all([
    readAndParseJson<PackageJson>(path.join(directory, 'package.json')),
    readDenoConfig(directory),
  ]);
  const packageJson = isObject(packageJsonRaw) ? packageJsonRaw : null;
  if (!packageJson && !denoConfig) {
    return null;
  }

  const workspaces = packageJson?.workspaces;
  return {
    directory,
    declaredPackages: [
      ...DECLARED_DEPENDENCY_FIELDS.flatMap((field) => Object.entries(packageJson?.[field] || {})),
      ...Object.values(denoConfig?.imports || {}).flatMap((specifier) => {
        const {name, range = ''} = DENO_NPM_SPECIFIER_REGEXP.exec(specifier)?.groups || {};
        return name ? [[name, range] as const] : [];
      }),
    ],
    workspacePatterns: [
      ...(Array.isArray(workspaces) ? workspaces : workspaces?.packages || []),
      ...(denoConfig?.workspace || []),
    ],
  };
};

type Manifest = NonNullable<Awaited<ReturnType<typeof readManifest>>>;

const parseYamlSafe = (yaml: string): unknown => {
  try {
    return parseYaml(yaml);
  } catch {
    return null;
  }
};

const findWorkspacePackageDirectories = async ({directory, workspacePatterns}: Manifest) => {
  const workspaceFiles = await Promise.all(
    WORKSPACE_FILE_NAMES.map((fileName) => readFileSafe(path.join(directory, fileName))),
  );
  const patterns: unknown[] = [
    ...workspacePatterns,
    ...workspaceFiles.flatMap((workspaceFile): unknown[] => {
      const workspaceConfig = workspaceFile == null ? null : parseYamlSafe(workspaceFile);
      return isObject(workspaceConfig) &&
        'packages' in workspaceConfig &&
        Array.isArray(workspaceConfig.packages)
        ? workspaceConfig.packages
        : [];
    }),
  ];
  const [excludedPatterns, includedPatterns] = arrayPartition(
    patterns.filter((pattern) => typeof pattern === 'string'),
    (pattern) => pattern.startsWith('!'),
  );

  const manifestPaths = await Array.fromAsync(
    fs.glob(
      includedPatterns.map((pattern) =>
        path.posix.join(pattern, `{${MANIFEST_FILE_NAMES.join(',')}}`),
      ),
      {
        cwd: directory,
        exclude: ['**/node_modules', ...excludedPatterns.map((pattern) => pattern.slice(1))],
      },
    ),
  );
  return [
    ...new Set(
      manifestPaths.map((manifestPath) => path.resolve(directory, path.dirname(manifestPath))),
    ),
  ];
};

const hasDependency = ({info}: PackageInfo, packageName: string) =>
  INSTALLED_DEPENDENCY_FIELDS.some((field) => Object.hasOwn(info[field] || {}, packageName));

interface FoundPackage {
  packageInfo: PackageInfo;
  directory: string;
}

const findPackageFrom = async (
  packageName: string,
  issuerDirectory: string,
): Promise<FoundPackage | null> => {
  const packageJsonPath = resolvePackageJsonPathFrom(packageName, issuerDirectory);
  if (!packageJsonPath) {
    return null;
  }

  const packageInfo = await readPackageInfo(packageJsonPath);
  if (!packageInfo) {
    return null;
  }

  const packageDirectory = path.dirname(packageJsonPath);
  // Stores put the dependencies of a package next to its real location only, while the path Yarn
  // PnP returns must be kept as is: it tells which peer dependencies the package got
  return {packageInfo, directory: pnpApi ? packageDirectory : await fs.realpath(packageDirectory)};
};

const createProjectPackageFinder = async (
  projectManifest: Manifest,
  installedThrough: Readonly<Record<string, readonly string[]>>,
) => {
  const [workspaceManifests, parentManifests] = await Promise.all([
    findWorkspacePackageDirectories(projectManifest).then((directories) =>
      Promise.all(directories.map(readManifest)),
    ),
    Promise.all(walk.up(path.dirname(projectManifest.directory)).map(readManifest)),
  ]);
  const manifests = arrayWithoutFalsy([projectManifest, ...workspaceManifests, ...parentManifests]);

  // The first manifest declaring a package decides where it's resolved from
  const declarations = new Map(
    manifests
      .flatMap(({directory, declaredPackages}) =>
        declaredPackages.map(
          ([packageName, specifier]) => [packageName, {directory, specifier}] as const,
        ),
      )
      .toReversed(),
  );

  // Packages declared under other names, like `"vue3": "npm:vue@^3"`, by their own names
  const findAliasedPackages = once(
    async () =>
      new Map(
        arrayWithoutFalsy(
          await Promise.all(
            [...declarations]
              .filter(([, {specifier}]) => !PLAIN_SPECIFIER_REGEXP.test(specifier))
              .map(async ([packageAlias, {directory}]) => {
                const foundPackage = await findPackageFrom(packageAlias, directory);
                const packageName = foundPackage?.packageInfo.info.name;
                return foundPackage && packageName && packageName !== packageAlias
                  ? ([packageName, foundPackage] as const)
                  : null;
              }),
          ),
        ),
      ),
  );

  const foundPackages = new Map<string, Promise<FoundPackage | null>>();
  const findPackage = (packageName: string): Promise<FoundPackage | null> =>
    mapGetOrInsertComputed(foundPackages, packageName, async () => {
      const declaration = declarations.get(packageName);
      if (declaration) {
        return await findPackageFrom(packageName, declaration.directory);
      }

      const aliasedPackage = (await findAliasedPackages()).get(packageName);
      if (aliasedPackage) {
        return aliasedPackage;
      }

      const dependents = await Promise.all((installedThrough[packageName] || []).map(findPackage));
      const dependent = dependents.find(
        (foundPackage) =>
          foundPackage != null && hasDependency(foundPackage.packageInfo, packageName),
      );
      return dependent ? await findPackageFrom(packageName, dependent.directory) : null;
    });

  return async (packageName: string) => (await findPackage(packageName))?.packageInfo || null;
};

/**
 * Finds the packages the project uses: the ones declared, under any name, in its `package.json`
 * and `deno.json`, in the ones of its workspace packages and of the directories above it, and the
 * ones a declared package depends on, listed in `installedThrough`.
 * Unlike {@link fetchPackageInfo}, the result doesn't depend on how the package manager lays out
 * `node_modules`.
 * Outside of a project, the packages are looked up by {@link fetchPackageInfo}
 */
export const fetchProjectPackagesInfo = async <PackageName extends string>(
  packageNames: readonly PackageName[],
  {
    aliases = {},
    installedThrough = {},
  }: {
    aliases?: Partial<Record<PackageName, string>>;
    installedThrough?: Readonly<Record<string, readonly string[]>>;
  } = {},
) => {
  const projectManifestPath = findUp.any([...MANIFEST_FILE_NAMES], {cwd: process.cwd()});
  const projectManifest =
    projectManifestPath && (await readManifest(path.dirname(projectManifestPath)));
  const findPackage = projectManifest
    ? await createProjectPackageFinder(projectManifest, installedThrough)
    : fetchPackageInfo;

  const packagesInfo = await Promise.all(
    packageNames.map(
      async (packageName) =>
        [packageName, await findPackage(aliases[packageName] || packageName)] as const,
    ),
  );
  // eslint-disable-next-line un/no-type-assertion -- the entries cover every package
  return Object.fromEntries(packagesInfo) as Record<PackageName, PackageInfo | null>;
};
