import {setImmediate} from 'node:timers/promises';
import {MODULE_NOT_FOUND_ERROR_CODES, genModuleLoader} from '../src/loaders/shared';

const LOADED_PACKAGE = 'eslint-config-un-loaded-package';
const MISSING_PACKAGE = 'eslint-config-un-definitely-not-installed';
const MISSING_RELATIVE_PATH = './definitely-not-a-file.mjs';

const createLoaderContext = () => ({rootOptions: {}, missingPackages: new Map()});

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
});
