import {ESLint, Linter} from 'eslint';

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
  const fileResult = lintResult.find((r) => r.filePath.endsWith(filePath));
  if (options?.all) {
    return fileResult?.messages.filter((m) => m.ruleId === ruleId) || [];
  }
  return fileResult?.messages.find((m) => m.ruleId === ruleId);
}
