import fs from 'node:fs/promises';
import pathe from 'pathe';
import {features} from 'web-features';

const OUTPUT_PATH = pathe.join(import.meta.dirname, '../../../src/baseline.gen.ts');

const YEAR_REGEXP = /\d{4}/;

export const writeBaselineArtifacts = async (format: (code: string) => Promise<string>) => {
  const statusEntries = Object.entries(features).flatMap(([featureId, feature]) => {
    if (feature.kind !== 'feature') {
      return [];
    }

    const {baseline, baseline_low_date: lowDate} = feature.status;
    // Old features have dates like `<=2020-01-01`
    const year = Number(lowDate?.match(YEAR_REGEXP)?.[0]);
    return `${JSON.stringify(featureId)}: ${JSON.stringify(baseline && year ? [baseline, year] : [false])},`;
  });

  const code = `/**
 * Baseline status of every \`web-features\` feature (\`high\` is widely available, \`low\` is newly
 * available) and the year it became newly available
 */
export const BASELINE_STATUSES = {
${statusEntries.join('\n')}
} as const;

export type BaselineFeatureId = keyof typeof BASELINE_STATUSES;
`;

  await fs.writeFile(OUTPUT_PATH, await format(code));

  return {featuresCount: statusEntries.length};
};
