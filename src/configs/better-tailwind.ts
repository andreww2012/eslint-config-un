import type {
  Attributes as BetterTailwindcssAttributes,
  Callees as BetterTailwindcssCallees,
  Tags as BetterTailwindcssTags,
  Variables as BetterTailwindcssVariables,
} from 'eslint-plugin-better-tailwindcss/api/types';
import {ERROR, OFF, WARNING} from '../constants';
import {type GetRuleOptions, type UnConfigOptions, createConfigBuilder} from '../eslint';
import {assignDefaults} from '../utils';
import type {UnConfigFn} from './index';

export interface BetterTailwindEslintConfigOptions extends UnConfigOptions<'better-tailwindcss'> {
  /**
   * [`eslint-plugin-better-tailwindcss`](https://npmjs.com/eslint-plugin-better-tailwindcss) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `better-tailwindcss` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * [Tailwind 4 only] The path to the entry file of the css based Tailwind config
     */
    entryPoint?: string;

    /**
     * [Tailwind 3 only] The path to the Tailwind config file (e.g.: `tailwind.config.js`)
     */
    tailwindConfig?: string;

    /**
     * The name of the attribute that contains the tailwind classes.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#attributes
     */
    attributes?: BetterTailwindcssAttributes;

    /**
     * List of function names which arguments should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#callees
     */
    callees?: BetterTailwindcssCallees;

    /**
     * List of variable names whose initializer should also get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#variables
     */
    variables?: BetterTailwindcssVariables;

    /**
     * List of template literal tag names whose content should get linted.
     * @see https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/HEAD/docs/settings/settings.md#tags
     */
    tags?: BetterTailwindcssTags;
  };

  /**
   * Not enforced by default
   */
  breakUpClassesIntoMultipleLines?: GetRuleOptions<'better-tailwindcss', 'multiline'>[0];

  restrictedClasses?: string[];
}

export const betterTailwindUnConfig: UnConfigFn<'betterTailwind'> = (context) => {
  const optionsRaw = context.rootOptions.configs?.betterTailwind;
  const optionsResolved = assignDefaults(
    optionsRaw,
    {} satisfies Partial<BetterTailwindEslintConfigOptions>,
  );

  const {
    settings: pluginSettings,
    breakUpClassesIntoMultipleLines,
    restrictedClasses,
  } = optionsResolved;

  const tailwindPackageInfo = context.packagesInfo.tailwindcss;
  const tailwindRealMajorVersion = tailwindPackageInfo?.versions.major;
  const tailwindMajorVersion = tailwindRealMajorVersion === 3 ? 3 : 4;

  if (tailwindRealMajorVersion === 4 && !pluginSettings?.entryPoint) {
    context.logger.warn(
      "[betterTailwind] You haven't specified `settings.entryPoint` option which is required for `eslint-plugin-better-tailwindcss` to work properly with Tailwind 4",
    );
  }
  if (
    tailwindRealMajorVersion != null &&
    (tailwindRealMajorVersion < 3 || tailwindRealMajorVersion > 4)
  ) {
    context.logger.warn(
      '[betterTailwind] The detected Tailwind version is not supported by `eslint-plugin-better-tailwindcss`',
    );
  }

  const configBuilder = createConfigBuilder(context, optionsResolved, 'better-tailwindcss');

  // Legend:
  // 🟢 - in recommended
  // 4️⃣ - only Tailwind 4

  configBuilder
    ?.addConfig(['better-tailwindcss', {includeDefaultFilesAndIgnores: true}], {
      ...(pluginSettings && {
        settings: {
          'better-tailwindcss': pluginSettings,
        },
      }),
    })
    /* Category: Stylistic rules */
    .addRule(
      'enforce-consistent-variable-syntax',
      // v3 doesn't support `parentheses` syntax (`bg-(--primary)`) so there's nothing to enforce
      tailwindMajorVersion === 3 ? OFF : WARNING,
    )
    .addRule(
      'multiline',
      breakUpClassesIntoMultipleLines ? WARNING : OFF,
      breakUpClassesIntoMultipleLines ? [breakUpClassesIntoMultipleLines] : [],
    ) // 🟢
    .addRule('no-duplicate-classes', WARNING) // 🟢
    .addRule('no-unnecessary-whitespace', WARNING) // 🟢
    .addRule('sort-classes', WARNING) // 🟢
    /* Category: Correctness rules */
    .addRule('no-conflicting-classes', ERROR)
    .addRule(
      'no-restricted-classes',
      restrictedClasses?.length ? ERROR : OFF,
      restrictedClasses?.length ? [{restrict: restrictedClasses}] : [],
    ) // 4️⃣
    .addRule('no-unregistered-classes', OFF) // 🟢
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
};
