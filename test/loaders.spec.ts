import {MODULE_NOT_FOUND_ERROR_CODES, genModuleLoader} from '../src/loaders/shared';

const LOADED_PACKAGE = 'eslint-config-un-loaded-package';
const MISSING_PACKAGE = 'eslint-config-un-definitely-not-installed';
const MISSING_RELATIVE_PATH = './definitely-not-a-file.mjs';

describe('module loaders', () => {
  describe('missing packages reporting', () => {
    it('reports a bare specifier package Node fails to resolve', async () => {
      const missingPackages = new Set<string>();

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
      expect([...missingPackages]).toStrictEqual([MISSING_PACKAGE]);
    });

    it('reports a package a CommonJS `require` fails to resolve', async () => {
      const missingPackages = new Set<string>();

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
      expect([...missingPackages]).toStrictEqual([MISSING_PACKAGE]);
    });

    it('reports nothing when the failing import spelled out a path', async () => {
      const missingPackages = new Set<string>();

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
      const missingPackages = new Set<string>();

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
      const missingPackages = new Set<string>();

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
});
