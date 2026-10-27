/* eslint-disable check-file/filename-naming-convention */
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {parentPort, workerData} from 'node:worker_threads';
import {exec} from 'tinyexec';
import {isNodeError, writeJsonFile} from 'utilery/server';
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
  await writeJsonFile(path.join(tempDirectoryPath, 'package.json'), {
    name: `${packageName}__playground`,
  });

  const {stdout, stderr, exitCode} = await exec('pnpm', ['--ignore-workspace', 'i', packageName], {
    nodeOptions: {cwd: tempDirectoryPath},
  });

  if (exitCode) {
    const cause = stderr || stdout;
    sendMessageToParent({
      error: {
        code: 'INSTALLATION',
        // eslint-disable-next-line sonar/super-linear-regex
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
} catch (error) {
  sendMessageToParent({
    error: {
      code: isNodeError(error) && error.code ? `UNEXPECTED:${error.code}` : 'UNEXPECTED',
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
  } catch (error) {
    console.warn(`Failed to clean up temporary directory ${tempDirectoryPath}:`, error);
  }
}
