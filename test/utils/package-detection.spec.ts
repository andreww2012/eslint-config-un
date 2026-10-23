import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import os from 'node:os';
import path from 'node:path';
import {PACKAGES_INSTALLED_THROUGH} from '../../src/constants';
import type {PackageJson} from '../../src/types';

type PackageDetectionModule = typeof import('../../src/utils/package-detection');

const MODULE_PATH = '../../src/utils/package-detection';

// The functions looking packages up are replaced by mocks in `test/setup.ts`, so the real
// implementations have to be imported explicitly
const {fetchPackageInfo, fetchProjectPackagesInfo} =
  await vi.importActual<PackageDetectionModule>(MODULE_PATH);

const PLAIN_OBJECT_FIXTURE_PATH = path.join(
  import.meta.dirname,
  '..',
  'fixtures',
  'plain-object.json',
);

const SOURCE_FILE_REGEXP = /package-detection\.ts$/;

// Nothing is linked next to it, so whatever the code finds from its real location is not its own
const SHARED_STORE_PACKAGE_JSON_PATH = path.join(
  os.tmpdir(),
  'shared-store',
  'eslint-config-un@1.0.0',
  'node_modules',
  'eslint-config-un',
  'package.json',
);

const importModuleFromStore = async () => {
  vi.resetModules();
  vi.doMock(import('empathic/package'), async (importOriginal) => ({
    ...(await importOriginal()),
    up: () => SHARED_STORE_PACKAGE_JSON_PATH,
  }));
  return await vi.importActual<PackageDetectionModule>(MODULE_PATH);
};

const useAsCwd = (directory: string) => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(directory);
  onTestFinished(() => cwd.mockRestore());
};

/**
 * Creates a project directory with the given files, objects being written as JSON, and symbolic
 * links pointing to the given paths inside of it
 */
const stubProject = async (
  files: Readonly<Record<string, unknown>>,
  symlinks: Readonly<Record<string, string>> = {},
) => {
  const projectDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'un-utils-spec-'));
  onTestFinished(() => fs.rm(projectDirectory, {recursive: true, force: true}));

  const createParentDirectory = (filePath: string) =>
    fs.mkdir(path.dirname(path.join(projectDirectory, filePath)), {recursive: true});
  await Promise.all(
    Object.entries(files).map(async ([filePath, contents]) => {
      await createParentDirectory(filePath);
      await fs.writeFile(
        path.join(projectDirectory, filePath),
        typeof contents === 'string' ? contents : JSON.stringify(contents),
      );
    }),
  );
  await Promise.all(
    Object.entries(symlinks).map(async ([linkPath, targetPath]) => {
      await createParentDirectory(linkPath);
      await fs.symlink(
        path.join(projectDirectory, targetPath),
        path.join(projectDirectory, linkPath),
        'junction',
      );
    }),
  );

  return projectDirectory;
};

const stubInstalledPackage = (directory: string, packageJson: PackageJson) => ({
  [`${directory}/package.json`]: packageJson,
  // Resolution fails without the entry point
  [`${directory}/index.js`]: '',
});

/** Makes the package available only from the current working directory */
const stubProjectWithPackage = async (packageName: string, version: string) => {
  useAsCwd(
    await stubProject(
      stubInstalledPackage(`node_modules/${packageName}`, {name: packageName, version}),
    ),
  );
};

const fetchProjectPackageVersions = async (
  ...parameters: Parameters<typeof fetchProjectPackagesInfo<string>>
) =>
  Object.fromEntries(
    Object.entries(await fetchProjectPackagesInfo(...parameters)).map(
      ([packageName, packageInfo]) => [packageName, packageInfo?.versions.full ?? null],
    ),
  );

describe('fetchPackageInfo', () => {
  it('returns `null` for a package that cannot be resolved', async () => {
    await expect(fetchPackageInfo('this-package-is-not-installed')).resolves.toBeNull();
  });

  it('returns the `package.json` contents and the parsed versions of an installed package', async () => {
    const packageInfo = await fetchPackageInfo('verkit');

    expect(packageInfo?.info.name).toBe('verkit');
    expect(packageInfo?.versions.full).toBeString();
    expect(packageInfo?.versions.major).toBeNumber();
    expect(packageInfo?.versions.majorAndMinor).toBeNumber();
  });

  it('resolves a scoped package', async () => {
    expect((await fetchPackageInfo('@antfu/utils'))?.info.name).toBe('@antfu/utils');
  });

  it('falls back to resolving from the current working directory', async () => {
    const packageName = 'this-package-is-only-in-the-project';
    await stubProjectWithPackage(packageName, '1.2.3');

    expect((await fetchPackageInfo(packageName))?.versions.full).toBe('1.2.3');
  });

  it('prefers the package resolved from its own location over the working directory one', async () => {
    await stubProjectWithPackage('verkit', '0.0.0');

    expect((await fetchPackageInfo('verkit'))?.versions.full).not.toBe('0.0.0');
  });

  describe('under Yarn PnP', () => {
    const resolveToUnqualified = vi.fn<(request: string, issuer: string) => string | null>();
    // Borrows the rest of `require`'s shape from the real one to satisfy its type
    const requirePnpApi = Object.assign(
      () => ({resolveToUnqualified}),
      createRequire(import.meta.url),
    );

    const importModuleUnderPnp = async () => {
      process.versions['pnp'] = '3';
      vi.resetModules();
      vi.doMock(import('node:module'), () => ({createRequire: () => requirePnpApi}));
      return await vi.importActual<PackageDetectionModule>(MODULE_PATH);
    };

    afterEach(() => {
      delete process.versions['pnp'];
      resolveToUnqualified.mockReset();
      vi.doUnmock(import('node:module'));
      vi.resetModules();
    });

    it('reads `package.json` located by the PnP API', async () => {
      resolveToUnqualified.mockReturnValue(PLAIN_OBJECT_FIXTURE_PATH);
      const packageDetection = await importModuleUnderPnp();

      expect((await packageDetection.fetchPackageInfo('typescript'))?.info).toStrictEqual({
        greeting: 'hello',
      });
      expect(resolveToUnqualified).toHaveBeenCalledExactlyOnceWith(
        'typescript/package.json',
        expect.stringMatching(SOURCE_FILE_REGEXP),
      );
    });

    it('falls back to resolving from the current working directory', async () => {
      resolveToUnqualified.mockImplementation((_request, issuer) => {
        if (issuer.endsWith('package-detection.ts')) {
          throw new Error('not declared in its dependencies');
        }
        return PLAIN_OBJECT_FIXTURE_PATH;
      });
      const packageDetection = await importModuleUnderPnp();

      expect((await packageDetection.fetchPackageInfo('clsx'))?.info).toStrictEqual({
        greeting: 'hello',
      });
      expect(resolveToUnqualified).toHaveBeenLastCalledWith(
        'clsx/package.json',
        `${process.cwd()}${path.sep}`,
      );
    });

    it('returns `null` when the PnP API cannot resolve the package', async () => {
      resolveToUnqualified.mockImplementation(() => {
        throw new Error('not declared in its dependencies');
      });
      const packageDetection = await importModuleUnderPnp();

      await expect(packageDetection.fetchPackageInfo('typescript')).resolves.toBeNull();
    });
  });

  describe('when installed in a store shared between projects', () => {
    afterEach(() => {
      vi.doUnmock(import('empathic/package'));
      vi.resetModules();
    });

    // Like the packages aube's global virtual store hoists from other projects
    it('ignores packages reachable from its own location but not linked next to it', async () => {
      const packageDetection = await importModuleFromStore();
      await stubProjectWithPackage('this-package-is-only-in-the-project', '1.2.3');

      expect(packageDetection.isOwnCopyImportable('verkit')).toBe(false);
      await expect(packageDetection.fetchPackageInfo('verkit')).resolves.toBeNull();
      expect(
        (await packageDetection.fetchPackageInfo('this-package-is-only-in-the-project'))?.versions
          .full,
      ).toBe('1.2.3');
    });
  });
});

describe('fetchProjectPackagesInfo', () => {
  it('only finds the installed packages the project declares', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {
          dependencies: {regular: '^1.0.0'},
          devDependencies: {dev: '^1.0.0', 'not-installed': '^1.0.0'},
          optionalDependencies: {optional: '^1.0.0'},
          peerDependencies: {peer: '^1.0.0'},
        },
        ...stubInstalledPackage('node_modules/regular', {version: '1.0.0'}),
        ...stubInstalledPackage('node_modules/dev', {version: '2.0.0'}),
        ...stubInstalledPackage('node_modules/optional', {version: '3.0.0'}),
        ...stubInstalledPackage('node_modules/peer', {version: '4.0.0'}),
        // Like a dependency of a dependency in a flat `node_modules`
        ...stubInstalledPackage('node_modules/undeclared', {version: '5.0.0'}),
      }),
    );

    await expect(
      fetchProjectPackageVersions([
        'regular',
        'dev',
        'optional',
        'peer',
        'undeclared',
        'not-installed',
      ]),
    ).resolves.toStrictEqual({
      regular: '1.0.0',
      dev: '2.0.0',
      optional: '3.0.0',
      peer: '4.0.0',
      undeclared: null,
      'not-installed': null,
    });
  });

  it('looks up a package by its alias', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {dependencies: {vue3: 'npm:vue@^3.0.0'}},
        ...stubInstalledPackage('node_modules/vue3', {name: 'vue', version: '3.0.0'}),
      }),
    );

    await expect(
      fetchProjectPackageVersions(['vue'], {aliases: {vue: 'vue3'}}),
    ).resolves.toStrictEqual({vue: '3.0.0'});
  });

  it.each([
    'npm:is-odd@^3.0.0',
    // Catalog entries may be aliases too
    'catalog:',
    'workspace:is-odd@*',
    'file:./vendor/is-odd',
  ])('finds a package declared under another name with `%s`', async (specifier) => {
    useAsCwd(
      await stubProject({
        'package.json': {devDependencies: {odd: specifier}},
        ...stubInstalledPackage('node_modules/odd', {name: 'is-odd', version: '3.0.1'}),
      }),
    );

    await expect(fetchProjectPackageVersions(['is-odd'])).resolves.toStrictEqual({
      'is-odd': '3.0.1',
    });
  });

  it('prefers a package declared under its own name over the one declared under another', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {dependencies: {vue: '^2.7.0', vue3: 'npm:vue@^3.5.0'}},
        ...stubInstalledPackage('node_modules/vue', {name: 'vue', version: '2.7.16'}),
        ...stubInstalledPackage('node_modules/vue3', {name: 'vue', version: '3.5.0'}),
      }),
    );

    await expect(fetchProjectPackageVersions(['vue'])).resolves.toStrictEqual({vue: '2.7.16'});
  });

  it('reads the `npm:` imports of `deno.jsonc`, which may have comments and trailing commas', async () => {
    useAsCwd(
      await stubProject({
        'deno.jsonc': [
          '{',
          '  // Deno installs them under their own names, not the import ones',
          '  "imports": {',
          '    "odd": "npm:is-odd@3.0.1", /* not a comment: "//" */',
          '    "scoped/": "npm:/@scope/package@^1/",',
          '    "@std/path": "jsr:@std/path@^1",',
          '  },',
          '}',
        ].join('\n'),
        ...stubInstalledPackage('node_modules/is-odd', {version: '3.0.1'}),
        ...stubInstalledPackage('node_modules/@scope/package', {version: '1.2.3'}),
        ...stubInstalledPackage('node_modules/odd', {version: '0.0.0'}),
      }),
    );

    await expect(
      fetchProjectPackageVersions(['is-odd', '@scope/package', 'odd']),
    ).resolves.toStrictEqual({'is-odd': '3.0.1', '@scope/package': '1.2.3', odd: null});
  });

  it('reads the members of a Deno workspace', async () => {
    useAsCwd(
      await stubProject({
        'deno.json': {workspace: ['./packages/app']},
        'packages/app/deno.json': {imports: {'is-odd': 'npm:is-odd@3.0.1'}},
        ...stubInstalledPackage('node_modules/is-odd', {version: '3.0.1'}),
        ...stubInstalledPackage('node_modules/undeclared', {version: '1.0.0'}),
      }),
    );

    await expect(fetchProjectPackageVersions(['is-odd', 'undeclared'])).resolves.toStrictEqual({
      'is-odd': '3.0.1',
      undeclared: null,
    });
  });

  it('finds a package through a declared package depending on it', async () => {
    // Like pnpm, which only links the dependencies of a package next to its real location
    const storeDirectory = 'node_modules/.pnpm/wrapper@1.0.0/node_modules';
    useAsCwd(
      await stubProject(
        {
          'package.json': {devDependencies: {wrapper: '^1.0.0'}},
          ...stubInstalledPackage(`${storeDirectory}/wrapper`, {
            version: '1.0.0',
            dependencies: {inner: '^2.0.0'},
          }),
          ...stubInstalledPackage(`${storeDirectory}/inner`, {version: '2.0.0'}),
        },
        {'node_modules/wrapper': `${storeDirectory}/wrapper`},
      ),
    );

    await expect(
      fetchProjectPackageVersions(['inner'], {installedThrough: {inner: ['wrapper']}}),
    ).resolves.toStrictEqual({inner: '2.0.0'});
  });

  it('finds a package through a chain of packages depending on each other', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {dependencies: {outer: '^1.0.0'}},
        ...stubInstalledPackage('node_modules/outer', {
          version: '1.0.0',
          dependencies: {middle: '^1.0.0'},
        }),
        ...stubInstalledPackage('node_modules/middle', {
          version: '1.0.0',
          peerDependencies: {inner: '^1.0.0'},
        }),
        ...stubInstalledPackage('node_modules/inner', {version: '1.2.3'}),
      }),
    );

    await expect(
      fetchProjectPackageVersions(['inner'], {
        installedThrough: {inner: ['middle'], middle: ['outer']},
      }),
    ).resolves.toStrictEqual({inner: '1.2.3'});
  });

  it('ignores a package a declared package does not depend on', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {dependencies: {wrapper: '^1.0.0'}},
        ...stubInstalledPackage('node_modules/wrapper', {version: '1.0.0', devDependencies: {}}),
        ...stubInstalledPackage('node_modules/inner', {version: '2.0.0'}),
      }),
    );

    await expect(
      fetchProjectPackageVersions(['inner'], {installedThrough: {inner: ['wrapper']}}),
    ).resolves.toStrictEqual({inner: null});
  });

  it('reads the packages listed in the `workspaces` field', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {workspaces: ['packages/*']},
        'packages/app/package.json': {dependencies: {vue: '^3.0.0'}},
        ...stubInstalledPackage('packages/app/node_modules/vue', {version: '3.0.0'}),
      }),
    );

    await expect(fetchProjectPackageVersions(['vue'])).resolves.toStrictEqual({vue: '3.0.0'});
  });

  it('reads the packages listed in `pnpm-workspace.yaml`, except the excluded ones', async () => {
    useAsCwd(
      await stubProject({
        'package.json': {},
        'pnpm-workspace.yaml': "packages:\n  - 'packages/*'\n  - '!packages/excluded'\n",
        'packages/app/package.json': {dependencies: {vue: '^3.0.0'}},
        ...stubInstalledPackage('packages/app/node_modules/vue', {version: '3.0.0'}),
        'packages/excluded/package.json': {dependencies: {react: '^19.0.0'}},
        ...stubInstalledPackage('packages/excluded/node_modules/react', {version: '19.0.0'}),
      }),
    );

    await expect(fetchProjectPackageVersions(['vue', 'react'])).resolves.toStrictEqual({
      vue: '3.0.0',
      react: null,
    });
  });

  it('reads the directories above a workspace package, but not its sibling packages', async () => {
    const projectDirectory = await stubProject({
      'package.json': {devDependencies: {typescript: '^6.0.0'}, workspaces: ['packages/*']},
      ...stubInstalledPackage('node_modules/typescript', {version: '6.0.0'}),
      'packages/app/package.json': {},
      'packages/web/package.json': {dependencies: {vue: '^3.0.0'}},
      ...stubInstalledPackage('packages/web/node_modules/vue', {version: '3.0.0'}),
    });
    useAsCwd(path.join(projectDirectory, 'packages', 'app'));

    await expect(fetchProjectPackageVersions(['typescript', 'vue'])).resolves.toStrictEqual({
      typescript: '6.0.0',
      vue: null,
    });
  });

  it('looks up the packages from its own location and the working directory outside of a project', async () => {
    const packageName = 'this-package-is-only-in-the-project';
    await stubProjectWithPackage(packageName, '1.2.3');

    await expect(fetchProjectPackageVersions([packageName])).resolves.toStrictEqual({
      [packageName]: '1.2.3',
    });
  });

  describe('under Yarn PnP', () => {
    const resolveToUnqualified = vi.fn<(request: string, issuer: string) => string | null>();
    // Borrows the rest of `require`'s shape from the real one to satisfy its type
    const requirePnpApi = Object.assign(
      () => ({resolveToUnqualified}),
      createRequire(import.meta.url),
    );

    afterEach(() => {
      delete process.versions['pnp'];
      resolveToUnqualified.mockReset();
      vi.doUnmock(import('node:module'));
      vi.resetModules();
    });

    it('resolves a package from where the PnP API placed the package depending on it', async () => {
      const virtualWrapperDirectory = '.yarn/__virtual__/wrapper-virtual-0/node_modules/wrapper';
      const projectDirectory = await stubProject(
        {
          'package.json': {devDependencies: {wrapper: '^1.0.0'}},
          'cache/wrapper/package.json': {version: '1.0.0', peerDependencies: {inner: '*'}},
          'cache/inner/package.json': {version: '2.0.0'},
        },
        // Packages with peer dependencies get virtual paths, which must not be resolved further
        {[virtualWrapperDirectory]: 'cache/wrapper'},
      );
      useAsCwd(projectDirectory);
      resolveToUnqualified.mockImplementation((request) =>
        path.join(
          projectDirectory,
          request.startsWith('wrapper/') ? virtualWrapperDirectory : 'cache/inner',
          'package.json',
        ),
      );

      process.versions['pnp'] = '3';
      vi.resetModules();
      vi.doMock(import('node:module'), () => ({createRequire: () => requirePnpApi}));
      const packageDetection = await vi.importActual<PackageDetectionModule>(MODULE_PATH);

      expect(
        (
          await packageDetection.fetchProjectPackagesInfo(['inner'], {
            installedThrough: {inner: ['wrapper']},
          })
        ).inner?.versions.full,
      ).toBe('2.0.0');
      expect(resolveToUnqualified).toHaveBeenLastCalledWith(
        'inner/package.json',
        `${path.join(projectDirectory, virtualWrapperDirectory)}${path.sep}`,
      );
    });
  });
});

describe('packages installed through other packages', () => {
  // A cycle would make the lookup wait for itself forever
  it('never come through themselves', () => {
    const getPackagesInstalledThrough = (
      packageName: string,
      seenPackageNames: ReadonlySet<string> = new Set(),
    ): string[] =>
      (PACKAGES_INSTALLED_THROUGH[packageName] || []).flatMap((name) => [
        name,
        ...(seenPackageNames.has(name)
          ? []
          : getPackagesInstalledThrough(name, new Set([...seenPackageNames, name]))),
      ]);

    Object.keys(PACKAGES_INSTALLED_THROUGH).forEach((packageName) => {
      expect(getPackagesInstalledThrough(packageName)).not.toContain(packageName);
    });
  });
});
