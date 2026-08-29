import path from 'node:path';

const FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures/gitignore');
const RECURSIVE_FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures/gitignore-recursive');

const getGitignoreIgnores = async (
  gitignore: ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['gitignore'],
) =>
  (await computeEslintConfig({}, {un: {gitignore}})).getConfigByUnPostfix('ignores/gitignore')
    ?.ignores;

describe('option: `gitignore`', () => {
  it('derives the ignores from the `.gitignore` of the current working directory by default', async () => {
    await expect(getGitignoreIgnores(undefined)).resolves.toContain('**/node_modules/');
  });

  it('behaves the same way when set to `true`', async () => {
    await expect(getGitignoreIgnores(true)).resolves.toStrictEqual(
      await getGitignoreIgnores(undefined),
    );
  });

  it('does not create a respective config when set to `false`', async () => {
    await expect(getGitignoreIgnores(false)).resolves.toBeUndefined();
  });

  it('passes the object form to the underlying config as options', async () => {
    await expect(
      getGitignoreIgnores({cwd: FIXTURES_DIR, files: ['example.gitignore']}),
    ).resolves.toStrictEqual(['**/ignored-dir/', '**/*.ignored']);
  });

  it('respects nested `.gitignore` files by default', async () => {
    await expect(
      getGitignoreIgnores({cwd: RECURSIVE_FIXTURES_DIR, files: ['example.gitignore']}),
    ).resolves.toStrictEqual(['**/root-ignored-dir/', 'nested/**/*.nested-ignored']);
  });

  it('does not respect nested `.gitignore` files when `recursive` is set to `false`', async () => {
    await expect(
      getGitignoreIgnores({
        cwd: RECURSIVE_FIXTURES_DIR,
        files: ['example.gitignore'],
        recursive: false,
      }),
    ).resolves.toStrictEqual(['**/root-ignored-dir/']);
  });
});
