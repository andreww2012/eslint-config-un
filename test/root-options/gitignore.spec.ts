import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {resolveGitignore} from '../../src/config-un/gitignore';

const FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures/gitignore');
const RECURSIVE_FIXTURES_DIR = path.join(import.meta.dirname, '../fixtures/gitignore-recursive');

const createTemporaryDirectory = async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'eslint-config-un-gitignore-spec-'));
  onTestFinished(() => fs.rm(directory, {recursive: true, force: true}));

  return directory;
};

/** The option resolves against the real working directory unless it is given one of its own */
const stubWorkingDirectory = (directory: string) => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(directory);
  onTestFinished(() => cwd.mockRestore());
};

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

  it('is derived from a nested `.gitignore` alone when no options are passed', async () => {
    const directory = await createTemporaryDirectory();
    await fs.mkdir(path.join(directory, 'nested'));
    await fs.writeFile(path.join(directory, 'nested', '.gitignore'), '*.nested-ignored', 'utf8');
    stubWorkingDirectory(directory);

    await expect(resolveGitignore(undefined)).resolves.toHaveProperty('ignores', [
      'nested/**/*.nested-ignored',
    ]);
  });

  it('resolves to nothing without warning when no ignore file exists at all', async () => {
    const processOutput = spyOnProcessOutput();
    stubWorkingDirectory(await createTemporaryDirectory());

    await expect(resolveGitignore(undefined)).resolves.toBeNull();

    expect(processOutput.getStderrOutput()).toBe('');
  });

  it('is derived from `.gitmodules` alone when no ignore file exists', async () => {
    const directory = await createTemporaryDirectory();
    await fs.writeFile(
      path.join(directory, '.gitmodules'),
      '[submodule "vendor"]\n\tpath = vendor\n',
      'utf8',
    );
    stubWorkingDirectory(directory);

    await expect(resolveGitignore(undefined)).resolves.toHaveProperty('ignores', ['vendor/**']);
  });

  it('warns and creates no config when the options point at a missing directory', async () => {
    const processOutput = spyOnProcessOutput();

    await expect(
      getGitignoreIgnores({cwd: path.join(await createTemporaryDirectory(), 'does-not-exist')}),
    ).resolves.toBeUndefined();

    expect(processOutput.getStderrOutput()).toContain(
      'Could not generate the ignores from the gitignore files',
    );
  });
});
