import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type {
  NuxtAutoImports,
  NuxtAutoImportsResult,
  NuxtLayerDirs,
  resolveNuxtAutoImports,
} from '../../../src/config-un/nuxt';

const FIXTURES = {
  nuxtProject: 'nuxt-auto-imports-project',
  brokenNuxtProject: 'nuxt-broken-config-project',
  nuxtCustomDirsProject: 'nuxt-custom-dirs-project',
} as const;

const NUXT_BUILD_DIR = 'nuxt-build';
const NUXT_PROJECT_DIR = path.join(import.meta.dirname, 'fixtures', FIXTURES.nuxtProject);
const BROKEN_NUXT_PROJECT_DIR = path.join(
  import.meta.dirname,
  'fixtures',
  FIXTURES.brokenNuxtProject,
);
const NUXT_CUSTOM_DIRS_PROJECT_DIR = path.join(
  import.meta.dirname,
  'fixtures',
  FIXTURES.nuxtCustomDirsProject,
);

const {autoImports, resolveNuxtAutoImportsMock} = vi.hoisted(() => {
  // Read on every call, because each test assigns what the resolver should return after this runs
  const autoImports = {current: null as NuxtAutoImportsResult | null};
  return {
    autoImports,
    resolveNuxtAutoImportsMock: vi.fn<typeof resolveNuxtAutoImports>(() =>
      Promise.resolve(autoImports.current),
    ),
  };
});

vi.mock(import('../../../src/config-un/nuxt'), async (importOriginal) => ({
  ...(await importOriginal()),
  resolveNuxtAutoImports: resolveNuxtAutoImportsMock,
}));

const importActualNuxt = async () =>
  await vi.importActual<typeof import('../../../src/config-un/nuxt')>(
    '../../../src/config-un/nuxt',
  );

/** Narrows away the failure branch, which the successful cases never produce */
const resolveFromFixture = async (options?: {cwd?: string; buildDir?: string}) => {
  const {resolveNuxtAutoImports} = await importActualNuxt();
  const result = await resolveNuxtAutoImports({cwd: NUXT_PROJECT_DIR, ...options});
  return result && 'globals' in result ? result : null;
};

// Outside the repository, so its own `nuxt` isn't reachable from there
const createNuxtProject = async (nuxtKitSource?: string) => {
  const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), 'un-nuxt-project-'));
  onTestFinished(() => fs.rm(projectDir, {recursive: true, force: true}));

  await fs.writeFile(path.join(projectDir, 'nuxt.config.ts'), 'export default {};\n');
  if (nuxtKitSource != null) {
    const nuxtDir = path.join(projectDir, 'node_modules', 'nuxt');
    await fs.mkdir(nuxtDir, {recursive: true});
    await Promise.all([
      fs.writeFile(
        path.join(nuxtDir, 'package.json'),
        JSON.stringify({name: 'nuxt', type: 'module', exports: {'./kit': './kit.js'}}),
      ),
      fs.writeFile(path.join(nuxtDir, 'kit.js'), nuxtKitSource),
    ]);
  }

  return projectDir;
};

// Nothing is linked next to it, so whatever the code finds from its real location is not its own
const SHARED_STORE_PACKAGE_JSON_PATH = path.join(
  os.tmpdir(),
  'shared-store',
  'eslint-config-un@1.0.0',
  'node_modules',
  'eslint-config-un',
  'package.json',
);

const createLayerDirs = (overrides?: Partial<NuxtLayerDirs>): NuxtLayerDirs => ({
  app: 'app',
  modules: 'modules',
  server: 'server',
  shared: 'shared',
  components: ['components'],
  layouts: 'layouts',
  middleware: 'middleware',
  pages: 'pages',
  plugins: 'plugins',
  routerOptions: '',
  ...overrides,
});

const createAutoImports = (overrides?: Partial<NuxtAutoImports>): NuxtAutoImports => ({
  buildDir: '/project/.nuxt',
  layers: [createLayerDirs()],
  isV4DirectoryStructure: true,
  isBuildDirGenerated: true,
  globals: {
    app: ['useFetch', 'useMyComposable', 'vMyDirective'],
    server: ['defineEventHandler'],
    shared: ['useMySharedUtil'],
  },
  componentNames: ['MyButton'],
  directiveNames: ['my-directive'],
  cacheKey: '',
  ...overrides,
});

beforeEach(() => {
  addInstalledPackages({vue: '3.5.0', nuxt: '3.0.0'});
  autoImports.current = createAutoImports();
  resolveNuxtAutoImportsMock.mockClear();
});

describe('vue: sub config `nuxt` auto-imports', () => {
  describe('basic tests', () => {
    it('creates an eslint config per auto-import context when auto-imports are resolved', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')).toBeDefined();
    });

    it('does not create the eslint configs when auto-imports could not be resolved', async () => {
      autoImports.current = null;

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')).toBeUndefined();
    });

    it('does not create the eslint configs when the `nuxt` sub-config is disabled', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: false}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')).toBeUndefined();
    });

    it('skips the eslint config of a context that has no auto-imports', async () => {
      autoImports.current = createAutoImports({
        globals: {app: ['useFetch'], server: [], shared: []},
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')).toBeUndefined();
    });
  });

  describe('warnings', () => {
    it('warns when the build directory has not been generated', async () => {
      autoImports.current = createAutoImports({isBuildDirGenerated: false});
      const processOutput = spyOnProcessOutput();

      await computeEslintConfig({vue: {configNuxt: true}});

      expect(processOutput.getStderrOutput()).toContain('has not been generated yet');
    });

    it('warns when the Nuxt config could not be loaded, pointing at the `buildDir` option', async () => {
      autoImports.current = {error: 'Cannot find module `some-nuxt-module`', cacheKey: ''};
      const processOutput = spyOnProcessOutput();

      await computeEslintConfig({vue: {configNuxt: true}});

      const stderr = processOutput.getStderrOutput();

      expect(stderr).toContain('could not be loaded');
      expect(stderr).toContain('Cannot find module `some-nuxt-module`');
      expect(stderr).toContain('buildDir');
    });

    it('stays quiet about an unloadable Nuxt config when the sub config is off', async () => {
      autoImports.current = {error: 'boom', cacheKey: ''};
      const processOutput = spyOnProcessOutput();

      await computeEslintConfig({vue: {configNuxt: false}});

      expect(processOutput.getStderrOutput()).not.toContain('could not be loaded');
    });

    it('warns that the layout was guessed when `buildDir` rescued an unloadable config', async () => {
      autoImports.current = createAutoImports({error: 'Cannot find module `x`', layers: null});
      const processOutput = spyOnProcessOutput();

      await computeEslintConfig({vue: {configNuxt: true}});

      const output = processOutput.getStderrOutput();

      expect(output).toContain('directory layout had to be guessed');
      expect(output).toContain('Cannot find module `x`');
    });

    it('stays quiet for a project that turned auto-imports off', async () => {
      autoImports.current = createAutoImports({
        globals: {app: [], server: [], shared: []},
        componentNames: [],
        directiveNames: [],
      });
      const processOutput = spyOnProcessOutput();

      await computeEslintConfig({vue: {configNuxt: true}});

      expect(processOutput.getStderrOutput()).not.toContain('nuxt prepare');
    });
  });

  describe('option: `buildDir`', () => {
    it('is passed on to the resolver', async () => {
      await computeEslintConfig({vue: {configNuxt: {buildDir: 'custom-build'}}});

      expect(resolveNuxtAutoImportsMock).toHaveBeenCalledWith({buildDir: 'custom-build'});
    });

    it('is left unset when the option is not passed', async () => {
      await computeEslintConfig({vue: {configNuxt: true}});

      expect(resolveNuxtAutoImportsMock).toHaveBeenCalledWith({buildDir: undefined});
    });

    it('reads nothing at all when the `nuxt` sub config is disabled', async () => {
      await computeEslintConfig({vue: {configNuxt: false}});

      expect(resolveNuxtAutoImportsMock).not.toHaveBeenCalled();
    });

    it('reads nothing at all when the whole `vue` config is disabled', async () => {
      await computeEslintConfig({vue: false});

      expect(resolveNuxtAutoImportsMock).not.toHaveBeenCalled();
    });
  });

  describe('globals', () => {
    it('declares every auto-import of a context as a readonly global', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')?.languageOptions?.[
          'globals'
        ],
      ).toStrictEqual({
        useFetch: 'readonly',
        useMyComposable: 'readonly',
        vMyDirective: 'readonly',
      });
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')?.languageOptions?.[
          'globals'
        ],
      ).toStrictEqual({defineEventHandler: 'readonly'});
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')?.languageOptions?.[
          'globals'
        ],
      ).toStrictEqual({useMySharedUtil: 'readonly'});
    });

    it('excludes `server` and `shared` from the app config when the app sits at the project root', async () => {
      autoImports.current = createAutoImports({
        layers: [createLayerDirs({app: ''})],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      const appConfig = configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app');

      expect(appConfig?.files).toStrictEqual(['**/*.?([cm])[jt]s?(x)', '**/*.vue']);
      expect(appConfig?.ignores).toStrictEqual(['server/**', 'shared/**']);
    });

    it('excludes `server` and `shared` from the app config when they are nested inside it', async () => {
      autoImports.current = createAutoImports({
        layers: [createLayerDirs({app: 'src', server: 'src/server'})],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')?.ignores).toStrictEqual(
        ['src/server/**'],
      );
    });

    it('takes the context directories from the resolved Nuxt config', async () => {
      autoImports.current = createAutoImports({
        layers: [createLayerDirs({app: 'source', server: 'api', shared: 'common'})],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')?.files,
      ).toStrictEqual(['api/**/*.?([cm])[jt]s?(x)', 'api/**/*.vue']);
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')?.files,
      ).toStrictEqual(['common/**/*.?([cm])[jt]s?(x)', 'common/**/*.vue']);
      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')?.files).toStrictEqual([
        'source/**/*.?([cm])[jt]s?(x)',
        'source/**/*.vue',
      ]);
    });

    it('scopes the configs to the app directory when the v4 directory structure is on', async () => {
      const configResult = await computeEslintConfig({
        vue: {configNuxt: {v4DirectoryStructure: true}},
      });

      expect(configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')?.files).toStrictEqual([
        'app/**/*.?([cm])[jt]s?(x)',
        'app/**/*.vue',
      ]);
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app')?.ignores,
      ).not.toIncludeAnyMembers(['server/**', 'shared/**']);
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')?.files,
      ).toStrictEqual(['server/**/*.?([cm])[jt]s?(x)', 'server/**/*.vue']);
    });

    it('declares the auto-imports of a context in every layer', async () => {
      autoImports.current = createAutoImports({
        layers: [
          createLayerDirs(),
          createLayerDirs({
            app: 'layers/base',
            server: 'layers/base/server',
            shared: 'layers/base/shared',
          }),
        ],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      const appConfig = configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/app');

      expect(appConfig?.files).toMatchInlineSnapshot(
        '["app/**/*.?([cm])[jt]s?(x)", "app/**/*.vue", "layers/base/**/*.?([cm])[jt]s?(x)", "layers/base/**/*.vue"]',
      );
      expect(appConfig?.ignores).toStrictEqual(['layers/base/server/**', 'layers/base/shared/**']);
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/server')?.files,
      ).toMatchInlineSnapshot(
        '["server/**/*.?([cm])[jt]s?(x)", "server/**/*.vue", "layers/base/server/**/*.?([cm])[jt]s?(x)", "layers/base/server/**/*.vue"]',
      );
      expect(
        configResult.getConfigByUnPostfix('vue/nuxt/auto-imports/shared')?.files,
      ).toMatchInlineSnapshot(
        '["shared/**/*.?([cm])[jt]s?(x)", "shared/**/*.vue", "layers/base/shared/**/*.?([cm])[jt]s?(x)", "layers/base/shared/**/*.vue"]',
      );
    });
  });

  describe('directories', () => {
    it('takes the directories of the project from the resolved Nuxt config', async () => {
      autoImports.current = createAutoImports({
        layers: [
          createLayerDirs({
            modules: 'local-modules',
            server: 'api',
            components: ['widgets', '../ui'],
            layouts: 'page-layouts',
            middleware: 'route-middleware',
            pages: 'views',
            plugins: 'nuxt-plugins',
          }),
        ],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(
        configResult.getConfigByUnPostfix('vue/allow-default-export')?.files,
      ).toMatchInlineSnapshot(
        '["**/*.vue", "app/widgets/**/*", "ui/**/*", "app/page-layouts/**/*", "app/route-middleware/**/*", "app/views/**/*", "app/nuxt-plugins/**/*", "app/router.options.?([cm])[jt]s", "local-modules/**/*", "api/**/*"]',
      );
      expect(
        configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
      ).toMatchInlineSnapshot(
        '["app/pages/**/*.vue", "app/views/**/*.vue", "app/page-layouts/**/*.vue", "app/app.vue", "app/error.vue"]',
      );
      expect(configResult.getConfigByUnPostfix('vue/allow-implicit-slots')?.files).toStrictEqual([
        'app/page-layouts/**/*.vue',
      ]);
    });

    it('covers the directories of every layer', async () => {
      autoImports.current = createAutoImports({
        layers: [
          createLayerDirs(),
          createLayerDirs({
            app: 'layers/base',
            modules: 'layers/base/modules',
            server: 'layers/base/server',
            shared: 'layers/base/shared',
            routerOptions: 'app',
          }),
        ],
      });

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getConfigByUnPostfix('vue/nuxt')?.files).toStrictEqual([
        'app/**/*.vue',
        'layers/base/**/*.vue',
      ]);
      expect(
        configResult.getConfigByUnPostfix('vue/allow-default-export')?.files,
      ).toMatchInlineSnapshot(
        '["**/*.vue", "app/components/**/*", "app/layouts/**/*", "app/middleware/**/*", "app/pages/**/*", "app/plugins/**/*", "app/router.options.?([cm])[jt]s", "modules/**/*", "server/**/*", "layers/base/components/**/*", "layers/base/layouts/**/*", "layers/base/middleware/**/*", "layers/base/pages/**/*", "layers/base/plugins/**/*", "layers/base/app/router.options.?([cm])[jt]s", "layers/base/modules/**/*", "layers/base/server/**/*"]',
      );
      expect(
        configResult.getConfigByUnPostfix('vue/allow-single-word-component-names')?.files,
      ).toMatchInlineSnapshot(
        '["app/pages/**/*.vue", "app/views/**/*.vue", "app/layouts/**/*.vue", "app/app.vue", "app/error.vue", "layers/base/pages/**/*.vue", "layers/base/layouts/**/*.vue", "layers/base/app.vue", "layers/base/error.vue"]',
      );
      expect(configResult.getConfigByUnPostfix('vue/allow-implicit-slots')?.files).toStrictEqual([
        'app/layouts/**/*.vue',
        'layers/base/layouts/**/*.vue',
      ]);
    });

    it('moves the directories of the project, but not of its layers, along with `vueOrNuxtProjectDir`', async () => {
      autoImports.current = createAutoImports({
        layers: [createLayerDirs({layouts: 'page-layouts'}), createLayerDirs({app: 'layers/base'})],
      });

      const configResult = await computeEslintConfig({
        vue: {configNuxt: true, vueOrNuxtProjectDir: 'source'},
      });

      expect(configResult.getConfigByUnPostfix('vue/allow-implicit-slots')?.files).toStrictEqual([
        'source/page-layouts/**/*.vue',
        'layers/base/layouts/**/*.vue',
      ]);
    });
  });

  describe('rules', () => {
    it('exempts auto-imported components from `vue/no-undef-components`', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-components')[0]).toHaveProperty(
        'ignorePatterns',
        expect.arrayContaining(['^MyButton$']),
      );
    });

    it('escapes the component names it turns into `ignorePatterns`', async () => {
      autoImports.current = createAutoImports({componentNames: ['My$Button']});

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-components')[0]).toHaveProperty(
        'ignorePatterns',
        expect.arrayContaining([String.raw`^My\$Button$`]),
      );
    });

    it('exempts auto-imported directives from `vue/no-undef-directives`', async () => {
      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([
        {ignore: ['my-directive']},
      ]);
    });

    it('passes no options to `vue/no-undef-directives` when there are no auto-imported directives', async () => {
      autoImports.current = createAutoImports({directiveNames: []});

      const configResult = await computeEslintConfig({vue: {configNuxt: true}});

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([]);
    });

    it('lets `knownComponentNames` drop an auto-imported component', async () => {
      const configResult = await computeEslintConfig({
        vue: {configNuxt: true, knownComponentNames: {'^MyButton$': false}},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-components')[0]).toHaveProperty(
        'ignorePatterns',
        expect.not.arrayContaining(['^MyButton$']),
      );
    });

    it('merges `knownDirectiveNames` with the auto-imported directives', async () => {
      const configResult = await computeEslintConfig({
        vue: {configNuxt: true, knownDirectiveNames: ['my-other-directive']},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([
        {ignore: ['my-directive', 'my-other-directive']},
      ]);
    });

    it('lets `knownDirectiveNames` drop an auto-imported directive', async () => {
      const configResult = await computeEslintConfig({
        vue: {configNuxt: true, knownDirectiveNames: {'my-directive': false}},
      });

      expect(configResult.getRuleEntryOptions('vue', 'vue/no-undef-directives')).toStrictEqual([]);
    });
  });
});

describe('vue: `resolveNuxtAutoImports`', () => {
  it('returns `null` when no Nuxt config can be found', async () => {
    const {resolveNuxtAutoImports} = await importActualNuxt();

    await expect(
      resolveNuxtAutoImports({cwd: path.parse(import.meta.dirname).root}),
    ).resolves.toBeNull();
  });

  it('returns `null` from a nested directory that has no Nuxt config of its own', async () => {
    const {resolveNuxtAutoImports} = await importActualNuxt();

    await expect(
      resolveNuxtAutoImports({cwd: path.join(NUXT_PROJECT_DIR, 'packages', 'plain-lib')}),
    ).resolves.toBeNull();
  });

  it('reads the artifacts from the build directory Nuxt reports', async () => {
    expect((await resolveFromFixture())?.buildDir).toBe(
      path.join(NUXT_PROJECT_DIR, NUXT_BUILD_DIR),
    );
  });

  it('resolves the directories relative to the working directory', async () => {
    expect((await resolveFromFixture())?.layers).toStrictEqual([createLayerDirs()]);
  });

  it('reads the directories of the project and of its layers from the Nuxt config', async () => {
    expect((await resolveFromFixture({cwd: NUXT_CUSTOM_DIRS_PROJECT_DIR}))?.layers).toStrictEqual([
      createLayerDirs({
        modules: 'local-modules',
        components: ['widgets', '../ui'],
        layouts: 'page-layouts',
        middleware: 'route-middleware',
        pages: 'views',
        plugins: 'nuxt-plugins',
      }),
      createLayerDirs({
        app: 'layers/base',
        modules: 'layers/base/modules',
        server: 'layers/base/server',
        shared: 'layers/base/shared',
        pages: 'screens',
        routerOptions: 'app',
      }),
    ]);
  });

  it('leaves out the layers installed as packages or living outside the working directory', async () => {
    const temporaryDir = await fs.mkdtemp(path.join(os.tmpdir(), 'un-nuxt-layers-'));
    onTestFinished(() => fs.rm(temporaryDir, {recursive: true, force: true}));

    const projectDir = path.join(temporaryDir, 'project');
    await Promise.all(
      [
        path.join(projectDir, 'node_modules', 'package-layer'),
        path.join(temporaryDir, 'outside-layer'),
      ].map(async (layerDir) => {
        await fs.mkdir(layerDir, {recursive: true});
        await fs.writeFile(path.join(layerDir, 'nuxt.config.ts'), 'export default {};\n');
      }),
    );
    await fs.writeFile(
      path.join(projectDir, 'nuxt.config.ts'),
      "export default {extends: ['../outside-layer', './node_modules/package-layer']};\n",
    );

    const result = await resolveFromFixture({cwd: projectDir});

    expect(result?.layers?.map((layer) => layer.app)).toStrictEqual(['']);
  });

  it('collects the component directories the way Nuxt does', async () => {
    const projectDir = await createNuxtProject();
    await fs.writeFile(
      path.join(projectDir, 'nuxt.config.ts'),
      "export default {components: [true, false, 'bits', {path: 'icons'}, {prefix: 'No'}, {dirs: ['widgets', {global: true}]}]};\n",
    );

    expect((await resolveFromFixture({cwd: projectDir}))?.layers?.[0].components).toStrictEqual([
      'components',
      'bits',
      'icons',
      'widgets',
    ]);
  });

  it('reports the directory structure Nuxt resolved', async () => {
    expect((await resolveFromFixture())?.isV4DirectoryStructure).toBe(true);
  });

  it('extracts the auto-imports of every context', async () => {
    expect((await resolveFromFixture())?.globals).toStrictEqual({
      app: ['computed', 'useFetch', 'useMyComposable', 'vMyDirective'],
      server: ['defineEventHandler', 'useMyServerUtil'],
      shared: ['useRuntimeConfig', 'useMySharedUtil'],
    });
  });

  it('extracts the auto-imported components without the trailing `componentNames` export', async () => {
    expect((await resolveFromFixture())?.componentNames).toStrictEqual([
      'MyButton',
      'NuxtLink',
      'LazyMyButton',
    ]);
  });

  it('reports the failure when a Nuxt config is found but cannot be loaded', async () => {
    const {resolveNuxtAutoImports} = await importActualNuxt();

    const result = await resolveNuxtAutoImports({cwd: BROKEN_NUXT_PROJECT_DIR});

    expect(result).toMatchObject({
      error: expect.stringContaining('Intentionally broken') as unknown,
    });
    expect(result?.cacheKey).not.toBe('');
  });

  it('reads an explicitly given build directory where no Nuxt config can be found', async () => {
    const result = await resolveFromFixture({
      cwd: path.join(NUXT_PROJECT_DIR, 'packages', 'plain-lib'),
      buildDir: path.join(NUXT_PROJECT_DIR, NUXT_BUILD_DIR),
    });

    expect(result?.globals.app).toStrictEqual([
      'computed',
      'useFetch',
      'useMyComposable',
      'vMyDirective',
    ]);
    // Nothing was loaded, so the layout stays unknown and the Config falls back to its own defaults
    expect(result?.layers).toBeNull();
    expect(result?.isV4DirectoryStructure).toBeUndefined();
  });

  it('prefers an explicitly given build directory over the one a loadable config reports', async () => {
    const result = await resolveFromFixture({buildDir: NUXT_BUILD_DIR});

    expect(result?.buildDir).toBe(path.join(NUXT_PROJECT_DIR, NUXT_BUILD_DIR));
    // The config still loaded, so the layout it reports is kept
    expect(result?.layers).toStrictEqual([createLayerDirs()]);
  });

  it('reports a build directory that cannot be read rather than throwing', async () => {
    const {resolveNuxtAutoImports} = await importActualNuxt();

    // A file rather than a directory, which is reported instead of being read as a missing one
    const result = await resolveNuxtAutoImports({
      cwd: NUXT_PROJECT_DIR,
      buildDir: 'nuxt.config.ts',
    });

    expect(result).toMatchObject({
      error: expect.stringContaining('is not a directory') as unknown,
    });
  });

  it('keeps reading the auto-imports when `buildDir` is set but the config cannot be loaded', async () => {
    const {resolveNuxtAutoImports} = await importActualNuxt();

    const result = await resolveNuxtAutoImports({
      cwd: BROKEN_NUXT_PROJECT_DIR,
      buildDir: path.join(NUXT_PROJECT_DIR, NUXT_BUILD_DIR),
    });
    const autoImportsRead = result && 'globals' in result ? result : null;

    expect(autoImportsRead?.error).toContain('Intentionally broken');
    expect(autoImportsRead?.globals.app).toContain('useMyComposable');
    // Nothing was loaded, so the layout is left for the Config to guess
    expect(autoImportsRead?.layers).toBeNull();
  });

  it('changes the cache key when the artifacts change, and only then', async () => {
    const temporaryDir = await fs.mkdtemp(path.join(os.tmpdir(), 'un-nuxt-auto-imports-'));
    const buildDir = path.join(temporaryDir, NUXT_BUILD_DIR);
    await fs.cp(path.join(NUXT_PROJECT_DIR, NUXT_BUILD_DIR), buildDir, {recursive: true});

    const before = await resolveFromFixture({buildDir});
    const unchanged = await resolveFromFixture({buildDir});
    await fs.appendFile(path.join(buildDir, 'types', 'imports.d.ts'), '\n');
    const afterChange = await resolveFromFixture({buildDir});
    await fs.rm(temporaryDir, {recursive: true});

    expect(unchanged?.cacheKey).toBe(before?.cacheKey);
    expect(afterChange?.cacheKey).not.toBe(before?.cacheKey);
  });

  it('extracts each auto-imported directive under both names the rule may compare against', async () => {
    expect((await resolveFromFixture())?.directiveNames).toStrictEqual([
      'MyDirective',
      'my-directive',
    ]);
  });

  describe('loading the Nuxt config', () => {
    afterEach(() => {
      vi.doUnmock(import('empathic/package'));
      vi.resetModules();
    });

    // Our own location may be in a store shared between projects, where it reaches another project's Nuxt or none at all
    it("uses the project's own Nuxt", async () => {
      const {resolveNuxtAutoImports} = await importActualNuxt();
      const projectDir = await createNuxtProject(
        "export const loadNuxtConfig = async ({cwd}) => ({buildDir: 'own-nuxt-build', rootDir: cwd, srcDir: cwd, _layers: []});\n",
      );

      const result = await resolveNuxtAutoImports({cwd: projectDir});

      expect(result && 'buildDir' in result ? result.buildDir : null).toBe(
        path.join(projectDir, 'own-nuxt-build'),
      );
    });

    // What `loadNuxtConfig` makes up when it finds no layer at all
    it('assumes the default directories of a layer its config says nothing about', async () => {
      const {resolveNuxtAutoImports} = await importActualNuxt();
      const projectDir = await createNuxtProject(
        "export const loadNuxtConfig = async ({cwd}) => ({buildDir: '.nuxt', rootDir: cwd, srcDir: cwd, alias: {}, _layers: [{cwd, config: {rootDir: cwd, srcDir: cwd}}]});\nexport const resolveAlias = (path) => path;\n",
      );

      const result = await resolveNuxtAutoImports({cwd: projectDir});

      expect(result && 'layers' in result ? result.layers : null).toStrictEqual([
        createLayerDirs({app: '', routerOptions: 'app'}),
      ]);
    });

    // Like under Yarn PnP, where there is no `node_modules` to resolve from
    it('falls back to the Nuxt reachable from its own location when the project has none to resolve', async () => {
      const {resolveNuxtAutoImports} = await importActualNuxt();
      const projectDir = await createNuxtProject();

      const result = await resolveNuxtAutoImports({cwd: projectDir});

      expect(result).not.toHaveProperty('error');
      expect(result && 'buildDir' in result ? result.buildDir : null).toBe(
        path.join(projectDir, '.nuxt'),
      );
    });

    it('does not fall back to the Nuxt of another project when installed in a store shared between projects', async () => {
      // The mock from the setup file would keep serving the utilities evaluated outside the store
      vi.doUnmock(import('../../../src/utils'));
      vi.resetModules();
      vi.doMock(import('empathic/package'), async (importOriginal) => ({
        ...(await importOriginal()),
        up: () => SHARED_STORE_PACKAGE_JSON_PATH,
      }));
      const {resolveNuxtAutoImports} = await importActualNuxt();
      const projectDir = await createNuxtProject();

      await expect(resolveNuxtAutoImports({cwd: projectDir})).resolves.toMatchObject({
        error: "Cannot find package 'nuxt'",
      });
    });
  });
});
