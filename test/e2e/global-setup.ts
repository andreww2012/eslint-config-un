import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies -- unlike `utilery`'s, runs Windows `.cmd` shims like `pnpm`
import {exec} from 'tinyexec';
import type {TestProject} from 'vitest/node';
import packageJson from '../../package.json' with {type: 'json'};
import {isPlainObject, readAndParseJson, writeJsonFile} from '../../src/utils';
import {startRegistry} from './registry-server';

declare module 'vitest' {
  export interface ProvidedContext {
    packageVersion: string;
    registryUrl: string;
  }
}

const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

const run = async (command: string, arguments_: readonly string[], cwd: string) => {
  // Keeps macOS `tar` from adding AppleDouble files to the archive
  const result = await exec(command, arguments_, {
    nodeOptions: {cwd, env: {COPYFILE_DISABLE: '1'}},
  });
  if (result.exitCode !== 0) {
    throw new Error(
      `\`${command} ${arguments_.join(' ')}\` failed:\n${result.stderr || result.stdout}`,
    );
  }
};

export const setup = async (project: TestProject) => {
  const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'un-e2e-registry-'));

  await run('pnpm', ['build:code'], REPO_ROOT);
  // Lifecycle scripts would rebuild the package and touch README
  await run(
    'pnpm',
    ['pack', '--config.ignore-scripts=true', '--pack-destination', temporaryDirectory],
    REPO_ROOT,
  );

  const packedTarballName = (await fs.readdir(temporaryDirectory)).find((fileName) =>
    fileName.endsWith('.tgz'),
  );
  if (packedTarballName == null) {
    throw new Error(`\`pnpm pack\` did not produce a tarball in ${temporaryDirectory}`);
  }
  await run('tar', ['-xzf', packedTarballName], temporaryDirectory);

  // Package managers cache tarballs by name and version, so a stable one would get a stale build
  const version = `${packageJson.version}${packageJson.version.includes('-') ? '.' : '-'}e2e.${Date.now()}`;
  const manifestPath = path.join(temporaryDirectory, 'package', 'package.json');
  const packedManifest = await readAndParseJson(manifestPath);
  if (!isPlainObject(packedManifest)) {
    throw new Error(`${manifestPath} does not contain an object`);
  }
  const manifest = {...packedManifest, version};
  await writeJsonFile(manifestPath, manifest);

  const tarballPath = path.join(temporaryDirectory, 'repacked.tgz');
  await run('tar', ['-czf', tarballPath, 'package'], temporaryDirectory);

  const registry = await startRegistry({
    name: packageJson.name,
    version,
    manifest,
    tarball: await fs.readFile(tarballPath),
  });

  project.provide('packageVersion', version);
  project.provide('registryUrl', registry.url);

  return async () => {
    await registry.close();
    await fs.rm(temporaryDirectory, {recursive: true, force: true});
  };
};
