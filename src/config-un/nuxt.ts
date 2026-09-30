import fs from 'node:fs/promises';
import path from 'node:path';
import * as findUp from 'empathic/find';
import type {NuxtOptions} from 'nuxt/schema';
import {
  describeError,
  isOwnCopyImportable,
  readFileSafe,
  resolveFromProject,
  sha256,
  toKebabCase,
} from '../utils';

const NUXT_CONFIG_FILE_NAMES = ['ts', 'mts', 'cts', 'js', 'mjs', 'cjs'].map(
  (extension) => `nuxt.config.${extension}`,
);

/** Every auto-import is emitted as its own `const <name>: ...` line inside a `declare global` block */
const NUXT_GLOBAL_DECLARATION_REGEX = /^[\t ]*const[\t ]+([$A-Z_a-z][\w$]*)[\t ]*:/gm;

/** Every auto-imported component is emitted as a top level `export const <Name>: ...` */
const NUXT_COMPONENT_DECLARATION_REGEX = /^export const ([$A-Z_a-z][\w$]*)[\t ]*:/gm;

/**
 * Directives are ordinary auto-imports that Nuxt tells apart by name alone, so an unrelated
 * composable named this way is read as one too - harmless, as the worst it does is stop a directive
 * name from being reported
 */
const NUXT_DIRECTIVE_NAME_REGEX = /^v[A-Z]/;

const extractDeclaredNames = (regex: RegExp, source: string | null) =>
  source == null
    ? []
    : Array.from(source.matchAll(regex), ([, name]) => name).filter((name) => name != null);

const relativeDirectoryWithin = (from: string, to: string) => {
  const relativePath = path.relative(from, to);
  // No ESLint pattern can reach outside the directory it is resolved against
  return relativePath.startsWith('..') || path.isAbsolute(relativePath)
    ? null
    : relativePath.replaceAll(path.sep, '/');
};

type NuxtComponentsOption =
  | boolean
  | string
  | {path?: string; dirs?: (string | {path?: string})[]}
  | NuxtComponentsOption[]
  | null
  | undefined;

/** Mirrors how Nuxt collects the component directories of a layer */
const collectNuxtComponentDirs = (option: NuxtComponentsOption): string[] => {
  if (Array.isArray(option)) {
    return option.flatMap((item) => collectNuxtComponentDirs(item));
  }
  if (option === true || option === undefined) {
    // Holds the `global` and `islands` ones too
    return ['components'];
  }
  if (typeof option === 'string') {
    return [option];
  }
  if (!option) {
    return [];
  }

  return ('dirs' in option ? option.dirs || [] : [option]).flatMap((dir) =>
    typeof dir === 'string' ? [dir] : dir.path ? [dir.path] : [],
  );
};

/**
 * The directories of a layer, taking Nuxt's defaults for whatever the config leaves out.
 * `resolveIn` joins a directory onto another one, which lets the paths be absolute or relative
 */
export const resolveNuxtLayerDirs = (
  {
    srcDir,
    rootDir,
    serverDir,
    dir,
    components,
  }: {
    srcDir: string;
    rootDir: string;
    serverDir?: string;
    dir?: Partial<
      Record<'app' | 'layouts' | 'middleware' | 'modules' | 'pages' | 'plugins' | 'shared', string>
    >;
    components?: NuxtComponentsOption;
  },
  resolveIn: (base: string, directory: string) => string,
) => {
  const relativeToSrcDir = (directory: string) =>
    path.relative(srcDir, resolveIn(srcDir, directory)).replaceAll(path.sep, '/');

  return {
    app: srcDir,
    modules: resolveIn(rootDir, dir?.modules || 'modules'),
    server: resolveIn(rootDir, serverDir || 'server'),
    shared: resolveIn(rootDir, dir?.shared || 'shared'),
    components: collectNuxtComponentDirs(components).map(relativeToSrcDir),
    layouts: relativeToSrcDir(dir?.layouts || 'layouts'),
    middleware: relativeToSrcDir(dir?.middleware || 'middleware'),
    pages: relativeToSrcDir(dir?.pages || 'pages'),
    plugins: relativeToSrcDir(dir?.plugins || 'plugins'),
    routerOptions: relativeToSrcDir(dir?.app || (srcDir === rootDir ? 'app' : '.')),
  };
};

const resolveNuxtLayers = (
  cwd: string,
  {alias, _layers: layers}: NuxtOptions,
  resolveAlias: (path: string, alias: Record<string, string>) => string,
) => {
  const resolveIn = (base: string, directory: string) =>
    path.resolve(base, resolveAlias(directory, alias));

  const [projectLayer, ...otherLayers] = layers.map(({config}) => {
    const {
      app: srcDir,
      modules: modulesDir,
      server: serverDir,
      shared: sharedDir,
      ...dirsInApp
    } = resolveNuxtLayerDirs(config, resolveIn);
    const app = relativeDirectoryWithin(cwd, srcDir);
    const modules = relativeDirectoryWithin(cwd, modulesDir);
    const server = relativeDirectoryWithin(cwd, serverDir);
    const shared = relativeDirectoryWithin(cwd, sharedDir);
    // A layer installed as a package is none of the project's code
    return app == null ||
      modules == null ||
      server == null ||
      shared == null ||
      app.split('/').includes('node_modules')
      ? null
      : {app, modules, server, shared, ...dirsInApp};
  });

  return projectLayer
    ? ([projectLayer, ...otherLayers.filter((layer) => layer != null)] as const)
    : null;
};

/** Relative to the ESLint working directory */
export interface NuxtLayerDirs {
  /** `srcDir` */
  app: string;
  modules: string;
  server: string;
  shared: string;

  // Relative to `app` instead, so that the ones of the project move along with `vueOrNuxtProjectDir`
  components: string[];
  layouts: string;
  middleware: string;
  pages: string;
  plugins: string;
  /** Where `router.options` sits */
  routerOptions: string;
}

export interface NuxtAutoImports {
  /** Absolute path the artifacts were read from */
  buildDir: string;

  /**
   * Why the Nuxt config could not be loaded, when the build directory was known regardless.
   * The auto-imports are still read, but the directory layout has to be guessed
   */
  error?: string;

  /**
   * The directories of the project, followed by the ones of every layer it extends that sits inside
   * the ESLint working directory.
   * `null` when the Nuxt project root sits above that directory, leaving nothing an ESLint pattern
   * can express
   */
  layers: readonly [NuxtLayerDirs, ...NuxtLayerDirs[]] | null;

  /**
   * Whether the app lives in a directory of its own rather than at the project root.
   * `undefined` when only the build directory is known, i.e. the Nuxt config could not be loaded
   */
  isV4DirectoryStructure?: boolean;

  /**
   * Nuxt exposes a different set of auto-imports to app code, to Nitro server code and to the
   * `shared` directory, so that a binding available in one context is still undefined in another
   */
  globals: Record<'app' | 'server' | 'shared', string[]>;

  /**
   * Whether the build directory holds the generated artifacts at all, telling a project Nuxt has
   * never prepared apart from one that turned auto-imports off and legitimately declares none
   */
  isBuildDirGenerated: boolean;

  componentNames: string[];

  /** Each directive under both the name as written and its kebab-cased form */
  directiveNames: string[];

  /**
   * Hash of everything that was read, for the resolved config cache to be keyed on: adding or
   * removing a composable changes nothing else the key already covers
   */
  cacheKey: string;
}

/** A Nuxt config was found, but nothing could be read at all */
export interface NuxtAutoImportsFailure {
  error: string;

  /** Keyed on the failure itself, so that a different one is not served from the cache */
  cacheKey: string;
}

export type NuxtAutoImportsResult = NuxtAutoImports | NuxtAutoImportsFailure;

const importNuxtKit = async (cwd: string) => {
  const nuxtKitUrl = resolveFromProject('nuxt/kit', cwd);
  if (nuxtKitUrl) {
    // eslint-disable-next-line no-unsanitized/method -- resolved from a fixed specifier
    return (await import(nuxtKitUrl)) as typeof import('nuxt/kit');
  }

  // Yarn PnP has no `node_modules` to resolve from, while a store shared between projects may hold another project's Nuxt
  if (isOwnCopyImportable('nuxt')) {
    // eslint-disable-next-line import/no-extraneous-dependencies
    return await import('nuxt/kit');
  }

  throw new Error("Cannot find package 'nuxt'");
};

const loadNuxtOptions = async (cwd: string) => {
  try {
    const {loadNuxtConfig, resolveAlias} = await importNuxtKit(cwd);
    // `dev` because Nuxt otherwise moves the build directory under `node_modules`, while the
    // development one is where `nuxt prepare` generates the type artifacts.
    // `dotenv` because loading a config otherwise injects the linted project's `.env` into
    // `process.env`, which nothing downstream of a config generator should have to expect
    const options = await loadNuxtConfig({cwd, dotenv: false, overrides: {dev: true}});
    return {options, layers: resolveNuxtLayers(cwd, options, resolveAlias)};
  } catch (error) {
    return {error: describeError(error)};
  }
};

/** Reads Nuxt's auto-imports resolved by `nuxt/kit` (Nuxt 3.3+) */
export const resolveNuxtAutoImports = async ({
  cwd = process.cwd(),
  buildDir: buildDirOption,
}: {cwd?: string; buildDir?: string} = {}): Promise<NuxtAutoImportsResult | null> => {
  // Yes, bounded to `cwd` because a potential config above it belongs to a different project
  const hasNuxtConfig = findUp.any(NUXT_CONFIG_FILE_NAMES, {cwd, last: cwd}) != null;
  if (!hasNuxtConfig && !buildDirOption) {
    return null;
  }

  const loadResult = hasNuxtConfig ? await loadNuxtOptions(cwd) : null;
  // An explicitly pointed at build directory is enough on its own, so a config we failed to load
  // only costs us the directory layout
  if (!buildDirOption && loadResult?.error != null) {
    return {error: loadResult.error, cacheKey: sha256(loadResult.error)};
  }

  const nuxtOptions = loadResult?.options || null;
  const buildDirRaw = buildDirOption || nuxtOptions?.buildDir;
  /* v8 ignore next 3 - Either the option provided the directory or the config was loaded */
  if (buildDirRaw == null) {
    return null;
  }

  // Nuxt reports POSIX separators even on Windows
  const buildDir = path.resolve(cwd, buildDirRaw);

  // Windows reports reading through a file as `ENOENT`, indistinguishable from a directory that has
  // never been generated
  const buildDirStats = await fs.stat(buildDir).catch(() => null);
  if (buildDirStats?.isDirectory() === false) {
    const error = `\`${buildDir}\` is not a directory`;
    return {error, cacheKey: sha256(error)};
  }

  const layers = loadResult?.layers || null;
  const isV4DirectoryStructure = nuxtOptions
    ? nuxtOptions.srcDir !== nuxtOptions.rootDir
    : undefined;

  const sources = await Promise.all([
    readFileSafe(path.join(buildDir, 'types', 'imports.d.ts')),
    readFileSafe(path.join(buildDir, 'types', 'nitro-imports.d.ts')),
    readFileSafe(path.join(buildDir, 'types', 'shared-imports.d.ts')),
    readFileSafe(path.join(buildDir, 'components.d.ts')),
    // Anything other than a missing file, such as a directory that cannot be read, would otherwise
    // take the whole ESLint config down with it
  ]).catch((error: unknown) => describeError(error));

  if (typeof sources === 'string') {
    return {error: sources, cacheKey: sha256(sources)};
  }

  const [appSource, serverSource, sharedSource, componentsSource] = sources;
  const appGlobals = extractDeclaredNames(NUXT_GLOBAL_DECLARATION_REGEX, appSource);

  return {
    buildDir,
    ...(loadResult?.error != null && {error: loadResult.error}),
    layers,
    isV4DirectoryStructure,
    isBuildDirGenerated: sources.some((source) => source != null),
    globals: {
      app: appGlobals,
      server: extractDeclaredNames(NUXT_GLOBAL_DECLARATION_REGEX, serverSource),
      shared: extractDeclaredNames(NUXT_GLOBAL_DECLARATION_REGEX, sharedSource),
    },
    componentNames: extractDeclaredNames(NUXT_COMPONENT_DECLARATION_REGEX, componentsSource).filter(
      (name) => name !== 'componentNames',
    ),
    directiveNames: [
      // The rule's schema rejects duplicates
      ...new Set(
        appGlobals.flatMap((name) =>
          NUXT_DIRECTIVE_NAME_REGEX.test(name)
            ? // The rule kebab-cases `vHTMLSafe` differently, so both spellings are needed
              [name.slice(1), toKebabCase(name.slice(1))]
            : [],
        ),
      ),
    ],
    cacheKey: sha256(
      JSON.stringify([
        {buildDir, layers, isV4DirectoryStructure, error: loadResult?.error},
        ...sources,
      ]),
    ),
  };
};
