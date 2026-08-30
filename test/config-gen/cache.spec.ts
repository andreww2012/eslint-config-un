import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import * as packageUtils from 'empathic/package';
import {detect as detectPackageManager} from 'package-manager-detector/detect';
import {exec} from 'tinyexec';
import type {CacheDataInFs} from '../../src/config-un/cache';
import type {Environment} from '../../src/config-un/shared';

vi.mock(import('empathic/package'), async (importOriginal) => {
  const mod = await importOriginal();
  return {...mod, cache: vi.fn<typeof mod.cache>(mod.cache)};
});

vi.mock(import('package-manager-detector/detect'), async (importOriginal) => {
  const mod = await importOriginal();
  return {...mod, detect: vi.fn<typeof mod.detect>(mod.detect)};
});

vi.mock(import('tinyexec'), async (importOriginal) => {
  const mod = await importOriginal();
  return {...mod, exec: vi.fn<typeof mod.exec>(mod.exec)};
});

vi.mock(import('node:fs/promises'), async (importOriginal) => {
  const mod = await importOriginal();
  const writeFile = vi.fn<typeof mod.writeFile>(mod.writeFile);
  return {...mod, writeFile, default: {...mod.default, writeFile}};
});

const CACHE_ROOT_DIR = path.join(os.tmpdir(), 'eslint-config-un-cache-spec');
// The cache directory resolver appends the name the config generator asks for
const CACHE_FILE_PATH = path.join(CACHE_ROOT_DIR, 'eslint-config-un', 'config.json');

const MEMORY_CACHE_GLOBAL_NAME = 'eslintConfigUnResolvedConfig';

const MAX_CACHE_VALID_MS = 3_600_000;

/**
 * The configs of these are the cheapest ones which between them cover every way a value can be
 * injected into a config after it was restored: a parser (`svelte`), a package value used as-is
 * (`svelte`), an arrow transform function (`graphql`) and a method transform function called with
 * a scope (`import`)
 */
const CONFIGS_USING_PACKAGES = {svelte: true, graphql: true, import: true} as const;

type CacheFileContents = CacheDataInFs & {key: string; date: string};

const readCacheFile = async (): Promise<CacheFileContents> =>
  JSON.parse(await fs.readFile(CACHE_FILE_PATH, 'utf8')) as CacheFileContents;

const cacheFileExists = () =>
  fs
    .stat(CACHE_FILE_PATH)
    .then(() => true)
    .catch(() => false);

const clearMemoryCache = () => {
  Reflect.deleteProperty(globalThis, MEMORY_CACHE_GLOBAL_NAME);
};

const computeCachedConfig = (
  configs: Parameters<typeof computeEslintConfig>[0] = {},
  unOptions?: (Parameters<typeof computeEslintConfig>[1] & {})['un'],
) => computeEslintConfig(configs, {un: {...unOptions, cacheConfigs: true}});

/** Nothing but a config restored from the file system can contain it */
const MARKER_CONFIG_POSTFIX = 'only-in-the-cache';

/**
 * Marks the stored configs as restorable-only and forgets the memory cache, so that the next run
 * has no choice but to go to the file system
 */
const markStoredConfigs = async (patch?: Partial<CacheFileContents>) => {
  const cacheFile = await readCacheFile();

  await fs.writeFile(
    CACHE_FILE_PATH,
    JSON.stringify({
      ...cacheFile,
      configs: [...cacheFile.configs, {name: `eslint-config-un/${MARKER_CONFIG_POSTFIX}`}],
      ...patch,
    }),
    'utf8',
  );
  clearMemoryCache();
};

const originalCacheDirectory = process.env['CACHE_DIR'];

beforeAll(() => {
  process.env['CACHE_DIR'] = CACHE_ROOT_DIR;
});

beforeEach(async () => {
  clearMemoryCache();
  await fs.rm(CACHE_FILE_PATH, {force: true});
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

afterAll(async () => {
  if (originalCacheDirectory == null) {
    Reflect.deleteProperty(process.env, 'CACHE_DIR');
  } else {
    process.env['CACHE_DIR'] = originalCacheDirectory;
  }

  await fs.rm(CACHE_ROOT_DIR, {recursive: true, force: true});
});

const computeConfigWithDefaultCaching = (environment: Environment) => {
  vi.stubEnv('ESLINT_CONFIG_UN_CACHE_CONFIGS', '');

  return computeEslintConfig({}, {un: {cacheConfigs: undefined, environment}});
};

describe('option: `cacheConfigs`', () => {
  describe('default value', () => {
    it('enables caching when the resolved environment is `editor`', async () => {
      const first = await computeConfigWithDefaultCaching('editor');

      await expect(computeConfigWithDefaultCaching('editor')).resolves.toHaveProperty(
        'config',
        first.config,
      );
    });

    it.each(['ci', 'default'] as const)(
      'does not enable caching when the resolved environment is `%s`',
      async (environment) => {
        const first = await computeConfigWithDefaultCaching(environment);
        const second = await computeConfigWithDefaultCaching(environment);

        expect(second.config).not.toBe(first.config);
      },
    );
  });

  describe('memory cache', () => {
    it('serves the very same config on a subsequent call', async () => {
      const first = await computeCachedConfig();

      await expect(computeCachedConfig()).resolves.toHaveProperty('config', first.config);
    });

    it('recomputes the config when caching is disabled', async () => {
      const first = await computeEslintConfig({});
      const second = await computeEslintConfig({});

      expect(second.config).not.toBe(first.config);
    });

    it('recomputes the config when the cache key changes', async () => {
      const first = await computeCachedConfig();
      const second = await computeCachedConfig({}, {offlineMode: true});

      expect(second.config).not.toBe(first.config);
    });

    it('recomputes the config when the resolved environment changes', async () => {
      const first = await computeCachedConfig();
      const second = await computeCachedConfig({}, {environment: 'ci'});

      expect(second.config).not.toBe(first.config);
    });

    it('recomputes the config when the cached one is older than an hour', async () => {
      const first = await computeCachedConfig();

      vi.useFakeTimers({toFake: ['Date']});
      vi.setSystemTime(Date.now() + MAX_CACHE_VALID_MS + 1);

      const second = await computeCachedConfig();

      expect(second.config).not.toBe(first.config);
    });
  });

  describe('file system cache', () => {
    it('does not write anything when caching is disabled', async () => {
      await computeEslintConfig({});

      await expect(cacheFileExists()).resolves.toBe(false);
    });

    it('stores the resolved configs along with the data needed to rehydrate them', async () => {
      await computeCachedConfig('unicorn');

      const cacheFile = await readCacheFile();

      expect(cacheFile.key).toStrictEqual(expect.any(String));
      expect(cacheFile.date).toStrictEqual(expect.any(String));
      expect(cacheFile.usedPlugins).toContain('unicorn');
      expect(cacheFile.configs.map(({name}) => name)).toContain('eslint-config-un/unicorn');
    });

    it('stores what asked for every package that may need to be loaded', async () => {
      await computeCachedConfig('deMorgan');

      await expect(readCacheFile()).resolves.toHaveProperty('packageRequesters', {
        'eslint-plugin-de-morgan': ['config:deMorgan'],
      });
    });

    it('stores the parsers by the names of the configs using them', async () => {
      await computeCachedConfig('svelte');

      await expect(readCacheFile()).resolves.toHaveProperty('usedParsers', {
        'svelte-eslint-parser': ['eslint-config-un/parsing/svelte'],
      });
    });

    it('strips the plugins off the stored configs', async () => {
      await computeCachedConfig('unicorn');

      const cacheFile = await readCacheFile();

      expect(
        cacheFile.configs.find(({name}) => name === 'eslint-config-un/global-setup/plugins'),
      ).toStrictEqual({name: 'eslint-config-un/global-setup/plugins'});
    });

    it('restores the stored configs when the memory cache is empty', async () => {
      await computeCachedConfig('unicorn');
      await markStoredConfigs();

      const configResult = await computeCachedConfig('unicorn');

      expect(configResult.getConfigByUnPostfix(MARKER_CONFIG_POSTFIX)).toBeDefined();
    });

    it('puts the plugins back into the restored configs', async () => {
      await computeCachedConfig('unicorn');
      clearMemoryCache();

      const configResult = await computeCachedConfig('unicorn');

      expect(configResult.getLoadedPlugin('unicorn')).toBeDefined();
    });

    it('are restored even when they hold no config to put the plugins into', async () => {
      await computeCachedConfig('unicorn');
      const cacheFile = await readCacheFile();
      await markStoredConfigs({
        configs: cacheFile.configs.filter(
          ({name}) => name !== 'eslint-config-un/global-setup/plugins',
        ),
      });

      const configResult = await computeCachedConfig('unicorn');

      expect(configResult.getConfigByUnPostfix('global-setup/plugins')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('unicorn')).toBeDefined();
    });

    it('ignores the stored configs when their key no longer matches', async () => {
      await computeCachedConfig('unicorn');
      await markStoredConfigs({key: 'a-key-of-a-different-environment'});

      const configResult = await computeCachedConfig('unicorn');

      expect(configResult.getConfigByUnPostfix(MARKER_CONFIG_POSTFIX)).toBeUndefined();
    });

    it('ignores the stored configs when they are older than an hour', async () => {
      await computeCachedConfig('unicorn');
      await markStoredConfigs({
        date: new Date(Date.now() - MAX_CACHE_VALID_MS - 1).toISOString(),
      });

      const configResult = await computeCachedConfig('unicorn');

      expect(configResult.getConfigByUnPostfix(MARKER_CONFIG_POSTFIX)).toBeUndefined();
    });

    it('reports a failure to write the cache file', async () => {
      const processOutput = spyOnProcessOutput();
      vi.mocked(fs.writeFile).mockRejectedValueOnce(new Error('EACCES: permission denied'));

      await computeCachedConfig();

      expect(processOutput.getStderrOutput()).toContain('Could not save cache data');
      await expect(cacheFileExists()).resolves.toBe(false);
    });
  });

  describe('cache key', () => {
    it.each([
      {reason: 'the package manager cannot be detected', packageManager: null},
      {
        reason: 'the detected package manager has no lockfile around',
        packageManager: {name: 'npm', agent: 'npm'} as const,
      },
    ])('differs when $reason', async ({packageManager}) => {
      await computeCachedConfig();
      const {key} = await readCacheFile();

      await fs.rm(CACHE_FILE_PATH, {force: true});
      clearMemoryCache();
      vi.mocked(detectPackageManager).mockResolvedValueOnce(packageManager);

      await computeCachedConfig();

      await expect(readCacheFile()).resolves.not.toHaveProperty('key', key);
    });

    it('is still computed when the git revision cannot be read', async () => {
      const processOutput = spyOnProcessOutput();
      vi.mocked(exec).mockRejectedValueOnce(new Error('git is not installed'));

      await computeCachedConfig();

      expect(processOutput.getStderrOutput()).toContain('Error getting git HEAD hash');
      await expect(cacheFileExists()).resolves.toBe(true);
    });

    it('is still computed when the git command exits with an error', async () => {
      const {exec: execActual} = await vi.importActual<typeof import('tinyexec')>('tinyexec');
      vi.mocked(exec).mockReturnValueOnce(
        execActual('git', ['rev-parse', '--verify', 'not-a-real-revision']),
      );

      await computeCachedConfig();

      await expect(cacheFileExists()).resolves.toBe(true);
    });
  });

  describe('restored configs', () => {
    it('receive back the values coming straight from a package', async () => {
      const fresh = await computeCachedConfig(CONFIGS_USING_PACKAGES);
      clearMemoryCache();

      const restored = await computeCachedConfig(CONFIGS_USING_PACKAGES);

      expect(restored.getConfigByUnPostfix('parsing/svelte')?.languageOptions?.['parser']).toBe(
        fresh.getConfigByUnPostfix('parsing/svelte')?.languageOptions?.['parser'],
      );
      expect(restored.getConfigByUnPostfix('parsing/svelte')?.processor).toBe(
        fresh.getConfigByUnPostfix('parsing/svelte')?.processor,
      );
    });

    it('receive back the values produced by a transform function', async () => {
      const fresh = await computeCachedConfig(CONFIGS_USING_PACKAGES);
      clearMemoryCache();

      const restored = await computeCachedConfig(CONFIGS_USING_PACKAGES);

      expect(restored.getConfigByUnPostfix('graphql/processor')?.processor).toBe(
        fresh.getConfigByUnPostfix('graphql/processor')?.processor,
      );
      // Produces a new value on every call, so only its kind can be compared
      expect(
        restored.getConfigByUnPostfix('import')?.settings?.['import-x/resolver-next'],
      ).toStrictEqual(expect.any(Array));
    });

    it('receive nothing for a package use whose config is no longer stored', async () => {
      await computeCachedConfig(CONFIGS_USING_PACKAGES);
      const cacheFile = await readCacheFile();

      await fs.writeFile(
        CACHE_FILE_PATH,
        JSON.stringify({
          ...cacheFile,
          usedPackages: Object.fromEntries(
            Object.entries(cacheFile.usedPackages).map(([packagePrefix, packageUses]) => [
              packagePrefix,
              packageUses.map((packageUse) => ({
                ...packageUse,
                configName: 'eslint-config-un/no-longer-generated',
              })),
            ]),
          ),
        }),
        'utf8',
      );
      clearMemoryCache();

      const restored = await computeCachedConfig(CONFIGS_USING_PACKAGES);

      expect(restored.getConfigByUnPostfix('parsing/svelte')?.processor).toBeUndefined();
    });
  });

  describe('configs which cannot be stored', () => {
    let processOutput: ReturnType<typeof spyOnProcessOutput>;

    beforeEach(() => {
      processOutput = spyOnProcessOutput();
    });

    it('are reported when they cannot be serialized at all', async () => {
      const circularSettings: Record<string, unknown> = {};
      circularSettings['self'] = circularSettings;

      await computeCachedConfig(
        {},
        {extraConfigs: [{name: 'circular', settings: circularSettings}]},
      );

      await expect(cacheFileExists()).resolves.toBe(false);
      expect(processOutput.getStderrOutput()).toContain(
        'Could not serialize configs to store in cache',
      );
    });

    it('are reported by name and by path when they hold an unserializable value', async () => {
      await computeCachedConfig(
        {},
        {extraConfigs: [{name: 'unserializable', settings: {transform: () => 'value'}}]},
      );

      const output = processOutput.getStderrOutput();

      await expect(cacheFileExists()).resolves.toBe(false);
      expect(output).toContain('unserializable data at paths');
      expect(output).toContain('eslint-config-un/extra-config/unserializable');
      expect(output).toContain('settings.transform');
    });
  });

  // Must go last: the mocked cache directory resolver is left broken for the rest of the file
  describe('unresolvable cache directory', () => {
    it('is reported and nothing is cached', async () => {
      const processOutput = spyOnProcessOutput();
      vi.mocked(packageUtils.cache).mockReturnValue(undefined);

      await computeCachedConfig();

      await expect(cacheFileExists()).resolves.toBe(false);
      expect(processOutput.getStderrOutput()).toContain('Could not determine the cache path');
    });
  });
});
