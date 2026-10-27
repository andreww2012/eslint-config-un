import type {ESLint, Linter} from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';
import {substringAfterLast} from '../../src/utils';

export function findLintMessageFromLintResults(
  lintResult: readonly ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options?: {all?: false},
): Linter.LintMessage | undefined;
export function findLintMessageFromLintResults(
  lintResult: readonly ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options: {all: true},
): readonly Linter.LintMessage[];
export function findLintMessageFromLintResults(
  lintResult: readonly ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options?: {all?: boolean},
): Linter.LintMessage | readonly Linter.LintMessage[] | undefined {
  const fileName = substringAfterLast(filePath, '/');
  const fileResult = lintResult.find(
    (result) => fileName && pathe.normalize(result.filePath).split('/').at(-1) === fileName,
  );
  return options?.all
    ? fileResult?.messages.filter((message) => message.ruleId === ruleId) || []
    : fileResult?.messages.find(
        (message) => message.ruleId === ruleId || (message.ruleId == null && message.fatal),
      );
}
