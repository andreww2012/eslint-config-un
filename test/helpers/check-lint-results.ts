import {ESLint} from 'eslint';

/**
 * Returns `null` if the specified `filePath` was not found
 */
export const findLintMessageFromLintResults = (
  lintResult: ESLint.LintResult[],
  filePath: string,
  ruleId: string,
) => {
  const fileResult = lintResult.find((r) => r.filePath.endsWith(filePath));
  return fileResult ? fileResult.messages.find((m) => m.ruleId === ruleId) : null;
};
