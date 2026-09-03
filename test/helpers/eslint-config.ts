import type {EslintFlatConfigEntry} from '../../src/eslint/eslint-types';
import type {Nullable} from '../../src/types';

export {getRuleSeverityFromEslintRuleEntry} from '../../src/eslint/eslint-utils';

export const getAllRulesSeverities = (
  config: Nullable<EslintFlatConfigEntry>,
  // eslint-disable-next-line unicorn/consistent-boolean-name
  ruleFilter?: (ruleName: string) => boolean,
) =>
  // TODO `e18e/prefer-array-to-sorted` shouldn't trigger here - report
  [
    ...new Set(
      Object.entries(config?.rules || {})
        .filter(
          ([ruleName]) =>
            !ruleName.startsWith('disable-autofix/') && (!ruleFilter || ruleFilter(ruleName)),
        )
        .map(([, ruleEntry]) => getRuleSeverityFromEslintRuleEntry(ruleEntry)),
    ),
    // eslint-disable-next-line unicorn/no-array-sort
  ].sort((a, b) => a - b);
