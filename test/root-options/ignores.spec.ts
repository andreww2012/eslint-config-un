import {DEFAULT_GLOBAL_IGNORES} from '../../src/constants';

const IGNORES = ['**/coverage', '**/temp'];

const getGlobalIgnores = async (
  ignores: ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['ignores'],
) =>
  (await computeEslintConfig({}, {un: {ignores}})).getConfigByUnPostfix('ignores/global')?.ignores;

describe('option: `ignores`', () => {
  it('creates a config with only the default ignores when option is not set', async () => {
    const config = (await computeEslintConfig({})).getConfigByUnPostfix('ignores/global');

    expect(config).toStrictEqual({
      name: expect.any(String) as unknown,
      ignores: [...DEFAULT_GLOBAL_IGNORES],
    });
  });

  describe('array form', () => {
    it('merges the provided patterns with the default ignores', async () => {
      await expect(getGlobalIgnores(IGNORES)).resolves.toStrictEqual([
        ...DEFAULT_GLOBAL_IGNORES,
        ...IGNORES,
      ]);
    });

    it('keeps only the default ignores when set to an empty array', async () => {
      await expect(getGlobalIgnores([])).resolves.toStrictEqual([...DEFAULT_GLOBAL_IGNORES]);
    });
  });

  describe('object form', () => {
    it('merges `files` with the default ignores', async () => {
      await expect(getGlobalIgnores({files: IGNORES})).resolves.toStrictEqual([
        ...DEFAULT_GLOBAL_IGNORES,
        ...IGNORES,
      ]);
    });

    it('merges `files` with the default ignores when `override` is `false`', async () => {
      await expect(getGlobalIgnores({files: IGNORES, override: false})).resolves.toStrictEqual([
        ...DEFAULT_GLOBAL_IGNORES,
        ...IGNORES,
      ]);
    });

    it('replaces the default ignores when `override` is `true`', async () => {
      await expect(getGlobalIgnores({files: IGNORES, override: true})).resolves.toStrictEqual(
        IGNORES,
      );
    });

    it('does not create a config when `files` is empty and `override` is `true`', async () => {
      await expect(getGlobalIgnores({files: [], override: true})).resolves.toBeUndefined();
    });
  });
});
