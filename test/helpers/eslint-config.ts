import {ERROR, OFF, type RuleSeverity, WARNING} from '../../src/constants';
import type {EslintFlatConfigEntry, EslintRuleEntry} from '../../src/eslint/eslint-types';
import type {Nullable} from '../../src/types';

export const getRuleSeverityFromEslintRuleEntry = (
  entry: Nullable<EslintRuleEntry>,
): RuleSeverity => {
  const severityRaw = Array.isArray(entry) ? entry[0] : (entry ?? OFF);

  if (typeof severityRaw === 'number') {
    return severityRaw as RuleSeverity;
  }

  switch (severityRaw) {
    case 'off': {
      return OFF;
    }
    case 'warn': {
      return WARNING;
    }
    case 'error': {
      return ERROR;
    }
    default: {
      severityRaw satisfies never;
    }
  }

  return OFF;
};

export const getAllRulesSeverities = (
  config: Nullable<EslintFlatConfigEntry>,
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
