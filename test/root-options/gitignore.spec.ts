import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type {GitignoreSourcesOptions} from 'gitignore-reader-x';
import {resolveGitignore} from '../../src/config-un/gitignore';

const FIXTURES_DIRECTORY = path.join(import.meta.dirname, '../fixtures/gitignore');
const RECURSIVE_FIXTURES_DIRECTORY = path.join(
  import.meta.dirname,
  '../fixtures/gitignore-recursive',
);

const createTemporaryDirectory = async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'eslint-config-un-gitignore-spec-'));
  onTestFinished(() => fs.rm(directory, {recursive: true, force: true}));

  return directory;
};

/** A repository with `$XDG_CONFIG_HOME/git/ignore`, where git looks for it by default */
const createRepositoryWithGlobalIgnoreFile = async () => {
  const directory = await createTemporaryDirectory();
  await Promise.all([
    fs.mkdir(path.join(directory, '.git')),
    fs.mkdir(path.join(directory, 'config', 'git'), {recursive: true}),
  ]);
  await fs.writeFile(path.join(directory, 'config', 'git', 'ignore'), '*.global', 'utf8');

  return {
    cwd: directory,
    env: {
      HOME: directory,
      XDG_CONFIG_HOME: path.join(directory, 'config'),
      GIT_CONFIG_NOSYSTEM: '1',
    },
  };
};

/** The option resolves against the real working directory unless it is given one of its own */
const stubWorkingDirectory = (directory: string) => {
  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(directory);
  onTestFinished(() => cwd.mockRestore());
};

const getGitignoreIgnores = async (
  gitignore: ((Parameters<typeof computeEslintConfig>[1] & {})['un'] & {})['gitignore'],
) =>
  (await computeEslintConfig({}, {un: {gitignore}})).getConfigByUnPostfix(
    'global-setup/ignores/gitignore',
  )?.ignores;

/** Keeps the ignore files outside of the fixture directory out of the results */
const getFixtureGitignoreOptions = (directory: string, sources?: GitignoreSourcesOptions) => ({
  cwd: directory,
  root: directory,
  sources: {files: ['example.gitignore'], infoExclude: false, ...sources},
});

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
      getGitignoreIgnores(getFixtureGitignoreOptions(FIXTURES_DIRECTORY)),
    ).resolves.toStrictEqual(['**/ignored-dir/', '**/*.ignored']);
  });

  it('respects nested `.gitignore` files by default', async () => {
    await expect(
      getGitignoreIgnores(getFixtureGitignoreOptions(RECURSIVE_FIXTURES_DIRECTORY)),
    ).resolves.toStrictEqual(['**/root-ignored-dir/', 'nested/**/*.nested-ignored']);
  });

  it('does not respect nested `.gitignore` files when `sources.nested` is set to `false`', async () => {
    await expect(
      getGitignoreIgnores(
        getFixtureGitignoreOptions(RECURSIVE_FIXTURES_DIRECTORY, {nested: false}),
      ),
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
    await fs.mkdir(path.join(directory, '.git'));
    await fs.writeFile(
      path.join(directory, '.gitmodules'),
      '[submodule "vendor"]\n\tpath = vendor\n',
      'utf8',
    );

    await expect(resolveGitignore({cwd: directory})).resolves.toHaveProperty('ignores', [
      'vendor/',
    ]);
  });

  it('respects parent `.gitignore` files and `.git/info/exclude`', async () => {
    const directory = await createTemporaryDirectory();
    await Promise.all([
      fs.mkdir(path.join(directory, '.git', 'info'), {recursive: true}),
      fs.mkdir(path.join(directory, 'package')),
    ]);
    await Promise.all([
      fs.writeFile(path.join(directory, '.git', 'info', 'exclude'), '*.excluded', 'utf8'),
      fs.writeFile(path.join(directory, '.gitignore'), '*.ignored', 'utf8'),
    ]);

    await expect(resolveGitignore({cwd: path.join(directory, 'package')})).resolves.toHaveProperty(
      'ignores',
      ['**/*.excluded', '**/*.ignored'],
    );
  });

  describe('global ignore file', () => {
    it('is not respected by default', async () => {
      await expect(
        resolveGitignore(await createRepositoryWithGlobalIgnoreFile()),
      ).resolves.toBeNull();
    });

    it('is not respected when other `sources` are passed', async () => {
      await expect(
        resolveGitignore({
          ...(await createRepositoryWithGlobalIgnoreFile()),
          sources: {nested: false},
        }),
      ).resolves.toBeNull();
    });

    it('is respected when `sources.globalIgnoreFile` is set to `true`', async () => {
      await expect(
        resolveGitignore({
          ...(await createRepositoryWithGlobalIgnoreFile()),
          sources: {globalIgnoreFile: true},
        }),
      ).resolves.toHaveProperty('ignores', ['**/*.global']);
    });
  });

  it('warns and creates no config when the options are invalid', async () => {
    const processOutput = spyOnProcessOutput();
    const directory = await createTemporaryDirectory();

    await expect(
      getGitignoreIgnores({cwd: directory, root: path.join(directory, 'nested')}),
    ).resolves.toBeUndefined();

    expect(processOutput.getStderrOutput()).toContain(
      'Could not generate the ignores from the gitignore files',
    );
  });
});
