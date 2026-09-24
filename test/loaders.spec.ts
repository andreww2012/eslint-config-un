import os from 'node:os';
import path from 'node:path';
import {setImmediate} from 'node:timers/promises';
import {MODULE_NOT_FOUND_ERROR_CODES, genModuleLoader} from '../src/loaders/shared';

const LOADED_PACKAGE = 'eslint-config-un-loaded-package';
const MISSING_PACKAGE = 'eslint-config-un-definitely-not-installed';
const MISSING_RELATIVE_PATH = './definitely-not-a-file.mjs';

const createLoaderContext = () => ({rootOptions: {}, missingPackages: new Map()});

// Nothing is linked next to it, so whatever the code finds from its real location is not its own
const SHARED_STORE_PACKAGE_JSON_PATH = path.join(
  os.tmpdir(),
  'shared-store',
  'eslint-config-un@1.0.0',
  'node_modules',
  'eslint-config-un',
  'package.json',
);

describe('module loaders', () => {
  describe('missing packages reporting', () => {
    it('reports a bare specifier package Node fails to resolve', async () => {
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoader(
        'missing',
        LOADED_PACKAGE,
        // eslint-disable-next-line no-unsanitized/method
        () => import(MISSING_PACKAGE),
        MODULE_NOT_FOUND_ERROR_CODES,
      );

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toMatchObject({
        module: null,
      });
      expect([...missingPackages]).toStrictEqual([[MISSING_PACKAGE, new Set([LOADED_PACKAGE])]]);
    });

    it('reports a package a CommonJS `require` fails to resolve', async () => {
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoader(
        'missing',
        LOADED_PACKAGE,
        () => {
          throw Object.assign(new Error(`Cannot find module '${MISSING_PACKAGE}'`), {
            code: 'MODULE_NOT_FOUND',
          });
        },
        MODULE_NOT_FOUND_ERROR_CODES,
      );

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toMatchObject({
        module: null,
      });
      expect([...missingPackages]).toStrictEqual([[MISSING_PACKAGE, new Set([LOADED_PACKAGE])]]);
    });

    it('reports nothing when the failing import spelled out a path', async () => {
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoader(
        'missing',
        LOADED_PACKAGE,
        // eslint-disable-next-line no-unsanitized/method
        () => import(MISSING_RELATIVE_PATH),
        MODULE_NOT_FOUND_ERROR_CODES,
      );

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toMatchObject({
        module: null,
      });
      expect([...missingPackages]).toBeEmpty();
    });

    it('reports nothing when the missing package is the one the loader is for', async () => {
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoader(
        'missing',
        MISSING_PACKAGE,
        // eslint-disable-next-line no-unsanitized/method
        () => import(MISSING_PACKAGE),
        MODULE_NOT_FOUND_ERROR_CODES,
      );

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toMatchObject({
        module: null,
      });
      expect([...missingPackages]).toBeEmpty();
    });

    it('reports nothing when the missing package is a subpath of the one the loader is for', async () => {
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoader(
        'missing',
        MISSING_PACKAGE,
        () => {
          throw Object.assign(new Error(`Cannot find module '${MISSING_PACKAGE}/subpath'`), {
            code: 'MODULE_NOT_FOUND',
          });
        },
        MODULE_NOT_FOUND_ERROR_CODES,
      );

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toMatchObject({
        module: null,
      });
      expect([...missingPackages]).toBeEmpty();
    });
  });

  describe('concurrency', () => {
    it('does not start loading a module until the previous one is loaded', async () => {
      const {promise: firstModule, resolve: resolveFirstModule} = Promise.withResolvers<object>();
      const loadSecondModule = vi.fn<() => object>(() => ({}));

      const firstLoad = genModuleLoader(
        'first',
        LOADED_PACKAGE,
        () => firstModule,
      )(createLoaderContext());
      const secondLoad = genModuleLoader(
        'second',
        LOADED_PACKAGE,
        loadSecondModule,
      )(createLoaderContext());
      await setImmediate();

      expect(loadSecondModule).not.toHaveBeenCalled();

      resolveFirstModule({});
      await Promise.all([firstLoad, secondLoad]);

      expect(loadSecondModule).toHaveBeenCalledOnce();
    });

    it('keeps loading modules after one fails to load', async () => {
      const failingLoad = genModuleLoader('failing', LOADED_PACKAGE, () => {
        throw new Error('Unexpected error');
      })(createLoaderContext());
      const nextLoad = genModuleLoader('next', LOADED_PACKAGE, () => ({}))(createLoaderContext());

      await expect(failingLoad).rejects.toThrow('Unexpected error');
      await expect(nextLoad).resolves.toMatchObject({module: {}});
    });
  });

  describe('when installed in a store shared between projects', () => {
    afterEach(() => {
      vi.doUnmock(import('empathic/package'));
      vi.resetModules();
    });

    // aube's global virtual store may hoist another project's copy where the import would find it
    it('does not import an optional peer dependency that is not linked next to it', async () => {
      // The mock from the setup file would keep serving the utilities evaluated outside the store
      vi.doUnmock(import('../src/utils'));
      vi.resetModules();
      vi.doMock(import('empathic/package'), async (importOriginal) => ({
        ...(await importOriginal()),
        up: () => SHARED_STORE_PACKAGE_JSON_PATH,
      }));
      const {genModuleLoader: genModuleLoaderFromStore} = await import('../src/loaders/shared');
      const importModule = vi.fn<() => Record<string, unknown>>(() => ({}));
      const missingPackages = new Map<string, Set<string>>();

      const loader = genModuleLoaderFromStore('clsx', 'eslint-plugin-clsx', importModule);

      await expect(loader({rootOptions: {}, missingPackages})).resolves.toStrictEqual({
        module: null,
        packageName: 'eslint-plugin-clsx',
      });
      expect(importModule).not.toHaveBeenCalled();
      expect(missingPackages.size).toBe(0);
    });
  });
});
