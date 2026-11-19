import type {EslintFlatConfigEntry} from '../../src/eslint/eslint-types';
import type {Nullable} from '../../src/types';
import {arrayUnique} from '../../src/utils';

export {getRuleSeverityFromEslintRuleEntry} from '../../src/eslint/eslint-utils';

export const getAllRulesSeverities = (
  config: Nullable<EslintFlatConfigEntry>,
  // eslint-disable-next-line unicorn/consistent-boolean-name -- Reads better as a filter than with a boolean prefix
  ruleFilter?: (ruleName: string) => boolean,
) =>
  arrayUnique(
    Object.entries(config?.rules || {})
      .filter(
        ([ruleName]) =>
          !ruleName.startsWith('disable-autofix/') && (!ruleFilter || ruleFilter(ruleName)),
      )
      .map(([, ruleEntry]) => getRuleSeverityFromEslintRuleEntry(ruleEntry)),
  )
    // eslint-disable-next-line unicorn/no-array-sort -- The array is a fresh copy
    .sort((a, b) => a - b);
