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
    (r) => fileName && pathe.normalize(r.filePath).split('/').at(-1) === fileName,
  );
  return options?.all
    ? fileResult?.messages.filter((m) => m.ruleId === ruleId) || []
    : fileResult?.messages.find((m) => m.ruleId === ruleId || (m.ruleId == null && m.fatal));
}
