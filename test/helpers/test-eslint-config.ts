import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
import type {Linter} from 'eslint';
import {eslintConfig} from '../../src';
import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import type {OmitStrict} from '../../src/types';

export const testEslintConfig = async (
  configs: EslintConfigUnOptions['configs'],
  fixturePath: string,
  options?: OmitStrict<EslintConfigUnOptions, 'configs'>,
) => {
  const config = await eslintConfig({
    defaultConfigsStatus: 'all-disabled',
    ...options,
    configs,
  });

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as Linter.Config[],
  });

  const content = await fs.readFile(
    path.join(import.meta.dirname, '..', 'fixtures', fixturePath),
    'utf8',
  );

  return await eslint.lintText(content, {
    filePath: path.basename(fixturePath),
  });
};
