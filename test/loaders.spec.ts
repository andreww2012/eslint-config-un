import {MODULE_NOT_FOUND_ERROR_CODES, genModuleLoader} from '../src/loaders/shared';

const MISSING_PACKAGE = 'eslint-config-un-definitely-not-installed';

describe('module loaders', () => {
  describe('missing packages reporting', () => {
    it('reports a bare specifier package Node fails to resolve', async () => {
      const missingPackages = new Set<string>();

      const loader = genModuleLoader(
        'missing',
        MISSING_PACKAGE,
        // eslint-disable-next-line no-unsanitized/method -- a constant defined right above
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
        MISSING_PACKAGE,
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
  });
});
