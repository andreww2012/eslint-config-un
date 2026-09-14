import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {exec} from 'tinyexec';
import type {TestProject} from 'vitest/node';
import packageJson from '../../package.json' with {type: 'json'};
import {isPlainObject} from '../../src/utils';
import {startRegistry} from './registry-server';

declare module 'vitest' {
  export interface ProvidedContext {
    packageVersion: string;
    registryUrl: string;
  }
}

const REPO_ROOT = path.join(import.meta.dirname, '..', '..');

const run = async (command: string, args: string[], cwd: string) => {
  // Keeps macOS `tar` from adding AppleDouble files to the archive
  const result = await exec(command, args, {nodeOptions: {cwd, env: {COPYFILE_DISABLE: '1'}}});
  if (result.exitCode !== 0) {
    throw new Error(`\`${command} ${args.join(' ')}\` failed:\n${result.stderr || result.stdout}`);
  }
};

export const setup = async (project: TestProject) => {
  const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'un-e2e-registry-'));

  await run('pnpm', ['build:code'], REPO_ROOT);
  // Lifecycle scripts would rebuild the package and touch README
  await run(
    'pnpm',
    ['pack', '--config.ignore-scripts=true', '--pack-destination', workDir],
    REPO_ROOT,
  );

  const packedTarballName = (await fs.readdir(workDir)).find((fileName) =>
    fileName.endsWith('.tgz'),
  );
  if (packedTarballName == null) {
    throw new Error(`\`pnpm pack\` did not produce a tarball in ${workDir}`);
  }
  await run('tar', ['-xzf', packedTarballName], workDir);

  // Package managers cache tarballs by name and version, so a stable version would get a stale build
  const version = `${packageJson.version}${packageJson.version.includes('-') ? '.' : '-'}e2e.${Date.now()}`;
  const manifestPath = path.join(workDir, 'package', 'package.json');
  const packedManifest: unknown = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (!isPlainObject(packedManifest)) {
    throw new Error(`${manifestPath} does not contain an object`);
  }
  const manifest = {...packedManifest, version};
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  const tarballPath = path.join(workDir, 'repacked.tgz');
  await run('tar', ['-czf', tarballPath, 'package'], workDir);

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
    await fs.rm(workDir, {recursive: true, force: true});
  };
};
