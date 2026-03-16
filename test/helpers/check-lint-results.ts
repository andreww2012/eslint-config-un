import type {ESLint, Linter} from 'eslint';
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';

export function findLintMessageFromLintResults(
  lintResult: ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options?: {all?: false},
): Linter.LintMessage | undefined;
export function findLintMessageFromLintResults(
  lintResult: ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options: {all: true},
): Linter.LintMessage[];
export function findLintMessageFromLintResults(
  lintResult: ESLint.LintResult[],
  filePath: string,
  ruleId: string,
  options?: {all?: boolean},
): Linter.LintMessage | Linter.LintMessage[] | undefined {
  const fileName = filePath.split('/').at(-1) || '';
  const fileResult = lintResult.find(
    (r) => fileName && pathe.normalize(r.filePath).split('/').at(-1) === fileName,
  );
  if (options?.all) {
    return fileResult?.messages.filter((m) => m.ruleId === ruleId) || [];
  }
  return fileResult?.messages.find((m) => m.ruleId === ruleId);
}
