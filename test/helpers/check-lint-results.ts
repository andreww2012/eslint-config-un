import {ESLint} from 'eslint';

export const findLintMessageFromLintResults = (
  lintResult: ESLint.LintResult[],
  filePath: string,
  ruleId: string,
) => {
  const fileResult = lintResult.find((r) => r.filePath.endsWith(filePath));
  return fileResult?.messages.find((m) => m.ruleId === ruleId);
};
