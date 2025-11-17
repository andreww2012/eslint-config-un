// cspell:ignore toolbelt radashi rambda mobily luxon
import type {GetRuleOptions} from './eslint';
import type {Prettify, RequireExactlyOne} from './types';
import {getKeysOfTruthyValues} from './utils';

type NoRestrictedImportsEntry = Prettify<
  RequireExactlyOne<{
    regex: string;
    group: [string, ...string[]];
  }> & {
    importNames?: [string, ...string[]];
    allowImportNames?: [string, ...string[]];
    importNamePattern?: string;
    allowImportNamePattern?: string;
    message?: string;
    caseSensitive?: boolean;
    allowTypeImports?: boolean;
  }
>;

const UTILITY_PACKAGES = {
  lodash: true,
  'lodash-es': true,
  underscore: true,
  'es-toolkit': true,
  '@antfu/utils': true,
  remeda: true,
  ramda: true,
  radashi: true,
  rambda: true,
  'node:util': true,
  'string-ts': true,
  'fp-ts': true,
  '@mobily/ts-belt': true,

  'date-fns': true,
  dayjs: true,
  luxon: true,

  'type-fest': true,
  'ts-toolbelt': true,
  'ts-essentials': true,
} satisfies Record<string, true>;

/**
 * Provides a regex for [`no-restricted-imports`](https://eslint.org/docs/latest/rules/no-restricted-imports) that forbids importing from (by default) most of the popular utility packages, such as `lodash` (and its' modern alternatives) or `type-fest`. This could be useful to prevent ending up with multiple import statements, for utility renaming or implementation tweaking. For example, one could use a single or several files re-exporting utilities from different packages, optionally renaming them if desired or changing implementation in some way.
 *
 * You can provide an optional `packageNames` object that will be merged with the default value, which allows to re-allow some or disallow more packages.
 *
 * Note that importing from sub-paths (`/something`) will be disallowed too.
 *
 * Full list of packages forbidden by default: `lodash`, `lodash-es`, `underscore`, `es-toolkit`, `@antfu/utils`, `remeda`, `ramda`, `radashi`, `rambda`, `node:util`, `string-ts`, `fp-ts`, `@mobily/ts-belt`, `date-fns`, `dayjs`, `luxon`, `type-fest`, `ts-toolbelt`, `ts-essentials`.
 */
export const forbidImportingFromUtilityLibraries = ({
  packageNames,
  message,
}: {
  packageNames?: Record<string, boolean>;
  message?: string;
} = {}): NoRestrictedImportsEntry => {
  const forbiddenPackages = getKeysOfTruthyValues({...UTILITY_PACKAGES, ...packageNames});
  return {
    regex: `^(?:${forbiddenPackages.join('|').replaceAll('.', String.raw`\.`)})(?:/.*)?$`,
    ...(message && {message}),
  };
};

type VueNoRestrictedSyntaxEntry = Extract<
  GetRuleOptions<'vue', 'no-restricted-syntax'>,
  Record<string, unknown>
>;

/**
 * Provides a selector for [`vue/no-restricted-syntax`](https://eslint.vuejs.org/rules/no-restricted-syntax.html) that forbids usage of [`$slots`](https://vuejs.org/api/component-instance.html#slots) inside Vue templates in favor of a variable holding [`defineSlots` macro](https://vuejs.org/api/sfc-script-setup.html#defineslots) result (only available in `<script setup lang="ts">` sections): `const slots = defineSlots<{...}>()`
 */
export const forbid$slotsInsideVueTemplates = (
  message = 'Please use `const slots = defineSlots<{...}>()` instead because `$slots` is not typed',
): VueNoRestrictedSyntaxEntry => ({
  selector: "VExpressionContainer Identifier[name='$slots']",
  ...(message && {message}),
});
