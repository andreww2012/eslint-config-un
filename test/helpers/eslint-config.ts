import type {EslintFlatConfigEntry} from '../../src/eslint/eslint-types';
import type {Nullable} from '../../src/types';
import {arrayUnique} from '../../src/utils';

export {getRuleSeverityFromEslintRuleEntry} from '../../src/eslint/eslint-utils';

export const getAllRulesSeverities = (
  config: Nullable<EslintFlatConfigEntry>,
  // eslint-disable-next-line unicorn/consistent-boolean-name -- Fine
  ruleFilter?: (ruleName: string) => boolean,
) => {
  const severities = arrayUnique(
    Object.entries(config?.rules || {})
      .filter(
        ([ruleName]) =>
          !ruleName.startsWith('disable-autofix/') && (!ruleFilter || ruleFilter(ruleName)),
      )
      .map(([, ruleEntry]) => getRuleSeverityFromEslintRuleEntry(ruleEntry)),
  );
  // eslint-disable-next-line unicorn/no-array-sort -- The array is a fresh copy
  return severities.sort((a, b) => a - b);
};
