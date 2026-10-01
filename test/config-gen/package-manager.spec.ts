import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {detectPackageManager} from '../../src/config-un/package-manager';

const UPM = {name: 'upm', agent: 'upm'};

/** Creates the files in a temporary directory, one of whose directories becomes the working one */
const setUpProject = async (files: Record<string, string>, workingDir = '') => {
  const rootDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'eslint-config-un-package-manager-spec-'),
  );
  onTestFinished(() => fs.rm(rootDir, {recursive: true, force: true}));

  await Promise.all(
    Object.entries(files).map(async ([fileName, contents]) => {
      const filePath = path.join(rootDir, fileName);
      await fs.mkdir(path.dirname(filePath), {recursive: true});
      await fs.writeFile(filePath, contents);
    }),
  );

  const cwd = vi.spyOn(process, 'cwd').mockReturnValue(path.join(rootDir, workingDir));
  onTestFinished(() => cwd.mockRestore());
};

describe('detectPackageManager', () => {
  it('detects upm by its lockfile', async () => {
    await setUpProject({'package.json': '{}', 'upm.lock': '{}'});

    await expect(detectPackageManager()).resolves.toStrictEqual(UPM);
  });

  it('detects upm in a workspace package', async () => {
    await setUpProject(
      {'package.json': '{}', 'upm.lock': '{}', 'packages/app/package.json': '{}'},
      'packages/app',
    );

    await expect(detectPackageManager()).resolves.toStrictEqual(UPM);
  });

  it('prefers upm over another lockfile next to it, which upm ignores then', async () => {
    await setUpProject({'package.json': '{}', 'package-lock.json': '{}', 'upm.lock': '{}'});

    await expect(detectPackageManager()).resolves.toStrictEqual(UPM);
  });

  it('prefers upm over another lockfile in a parent directory', async () => {
    await setUpProject(
      {'pnpm-lock.yaml': '', 'app/package.json': '{}', 'app/upm.lock': '{}'},
      'app',
    );

    await expect(detectPackageManager()).resolves.toStrictEqual(UPM);
  });

  it('detects another package manager of a project nested in the upm one', async () => {
    await setUpProject(
      {'package.json': '{}', 'upm.lock': '{}', 'nested/package-lock.json': '{}'},
      'nested',
    );

    await expect(detectPackageManager()).resolves.toStrictEqual({name: 'npm', agent: 'npm'});
  });

  it('detects other package managers without the upm lockfile', async () => {
    await setUpProject({'package.json': '{}', 'pnpm-lock.yaml': ''});

    await expect(detectPackageManager()).resolves.toStrictEqual({name: 'pnpm', agent: 'pnpm'});
  });
});
