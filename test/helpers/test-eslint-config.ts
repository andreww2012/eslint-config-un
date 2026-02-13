import fs from 'node:fs/promises';
import path from 'node:path';
import {ESLint} from 'eslint';
import type {Linter} from 'eslint';
import {eslintConfig} from '../../src';
import type {EslintConfigUnOptions} from '../../src/config-un/shared';
import type {OmitStrict} from '../../src/types';
import {arraify, type MaybeArray} from '../../src/utils';

export const testEslintConfig = async <
  const FixturePaths extends string | readonly [string, ...string[]],
>(
  configsOrSingleConfigName:
    | EslintConfigUnOptions['configs']
    | keyof (EslintConfigUnOptions['configs'] & {}),
  fixturePaths: FixturePaths,
  options?: OmitStrict<EslintConfigUnOptions, 'configs'>,
): Promise<
  FixturePaths extends string
    ? ESLint.LintResult[]
    : {
        [K in keyof FixturePaths]: ESLint.LintResult[];
      }
> => {
  const config = await eslintConfig({
    defaultConfigsStatus: 'all-disabled',
    ...options,
    configs:
      typeof configsOrSingleConfigName === 'string'
        ? {
            [configsOrSingleConfigName]: true,
          }
        : configsOrSingleConfigName,
  });

  const eslint = new ESLint({
    overrideConfigFile: true,
    overrideConfig: config as Linter.Config[],
  });

  const fixtures = await Promise.all(
    arraify(fixturePaths).map(async (fixturePath) => ({
      contents: await fs.readFile(
        path.join(import.meta.dirname, '..', 'fixtures', fixturePath),
        'utf8',
      ),
      filePath: path.basename(fixturePath),
    })),
  );

  const lintResults = await Promise.all(
    fixtures.map(({contents, filePath}) =>
      eslint.lintText(contents, {
        filePath,
      }),
    ),
  );

  // @ts-expect-error -- TS doesn't support conditional return types
  return typeof fixturePaths === 'string' ? lintResults[0]! : lintResults;
};
