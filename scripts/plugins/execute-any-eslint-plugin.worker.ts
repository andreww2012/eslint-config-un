// cspell:ignore scandir
/* eslint-disable check-file/filename-naming-convention */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parentPort, workerData} from 'node:worker_threads';
import {exec} from 'tinyexec';
import {interopDefault} from '../../src/utils';
import {
  ExecuteAnyEslintPluginWorkerInitialDataZod,
  type ExecuteAnyEslintPluginWorkerOutput,
  getEslintPluginInfo,
} from './shared';

const {packageName} = ExecuteAnyEslintPluginWorkerInitialDataZod.parse(
  workerData || {packageName: '@abios/eslint-plugin'},
);

const sendMessageToParent = (message: ExecuteAnyEslintPluginWorkerOutput) => {
  parentPort?.postMessage(message);
};

const tempDirectoryPath = path.join(import.meta.dirname, 'temp', packageName);
try {
  await fs.mkdir(tempDirectoryPath, {recursive: true});
  await fs.writeFile(
    path.join(tempDirectoryPath, 'package.json'),
    JSON.stringify({name: `${packageName}__playground`}, null, 2),
    'utf8',
  );

  const {stdout, stderr, exitCode} = await exec('pnpm', ['--ignore-workspace', 'i', packageName], {
    nodeOptions: {cwd: tempDirectoryPath},
  });

  if (exitCode) {
    const cause = stderr || stdout;
    sendMessageToParent({
      error: {
        code: 'INSTALLATION',
        // eslint-disable-next-line sonarjs/super-linear-regex
        cause: cause.match(/^\s*(ERR_PNPM_\w+\s+(?:\S.*)?)$/m)?.[1] || cause,
      },
    });
    process.exit(0);
  }

  const requireForModule = createRequire(path.join(tempDirectoryPath, 'whatever'));

  const packageModule: unknown = await interopDefault(
    // eslint-disable-next-line no-unsanitized/method
    import(pathToFileURL(requireForModule.resolve(packageName)).href),
  );

  const eslintPluginInfo = getEslintPluginInfo(packageModule);

  sendMessageToParent(eslintPluginInfo);
} catch (error: unknown) {
  sendMessageToParent({
    error: {
      code: [
        'UNEXPECTED',
        typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
          ? error.code
          : null,
      ]
        .filter(Boolean)
        .join(':') as 'UNEXPECTED' | `UNEXPECTED:${string}`,
      cause:
        error instanceof Error
          ? JSON.stringify(error, ['message', 'code', 'stack'])
          : // eslint-disable-next-line ts/no-base-to-string
            String(error),
    },
  });
} finally {
  try {
    await fs.rm(tempDirectoryPath, {recursive: true, force: true});
  } catch (error: unknown) {
    console.warn(`Failed to clean up temporary directory ${tempDirectoryPath}:`, error);
  }
}
