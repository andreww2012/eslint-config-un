import path from 'node:path';

const FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures/gitignore');

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
});
