import type {CSSLanguageOptions} from '@eslint/css';
import {generatePackageToLoadProperty} from '../loaders';
import type {MaybeFn} from '../utils';
import type {UnConfigContext} from './shared';

export type CssCustomSyntax = Extract<CSSLanguageOptions['customSyntax'], Record<string, unknown>>;

export type CssCustomSyntaxOption = MaybeFn<
  CssCustomSyntax,
  [
    {
      /**
       * Default CSS syntax provided by `@eslint/css`, which in turn comes from
       * `@eslint/css-tree/definition-syntax-data`.
       */
      defaultSyntax: CssCustomSyntax;

      /**
       * Extra syntax provided by us.
       * Currently may only be TailwindCSS syntax coming from `tailwind-csstree` based on the
       * installed version of `tailwindcss` package.
       *
       * NOTE: it will already contain the merged default syntax, see
       * [implementation](https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src)
       * for details (`tailwindX.js` files specifically).
       */
      extraSyntax?: CssCustomSyntax;
    },
  ]
>;

/**
 * The syntax that makes Tailwind at-rules and functions known to the CSS parser, with the
 * user-provided `customSyntax` applied on top of it.
 * `null` if the installed TailwindCSS version is not supported
 */
export const generateTailwindCssSyntaxProperty = (
  context: UnConfigContext,
  customSyntax?: CssCustomSyntaxOption,
  // Needs an explicit return type because the returned symbol key cannot be emitted in decl. file
): Record<string, unknown> | null => {
  const tailwindMajorVersion = context.packagesInfo.tailwindcss?.versions.major;

  if (tailwindMajorVersion !== 3 && tailwindMajorVersion !== 4) {
    return null;
  }

  return generatePackageToLoadProperty(
    'customSyntax',
    ['tailwindCsstree', 'eslintCssTreeSyntax', '_utils'],
    {
      valueTransformFn: {
        fn(
          this: {
            tailwindMajorVersion: typeof tailwindMajorVersion;
            customSyntax: typeof customSyntax;
          },
          {tailwindCsstree, eslintCssTreeSyntax: defaultSyntax, _utils: utils},
        ) {
          const tailwindSyntaxFn = tailwindCsstree[`tailwind${this.tailwindMajorVersion}`];
          const tailwindSyntax = tailwindSyntaxFn(
            // @ts-expect-error This is fine - the type is too strict. In real code, only `types` property is expected to exist, which it already does (see `tailwindX.js` files at https://github.com/humanwhocodes/tailwind-csstree/tree/907ea0a7e2820c1e29cf26f6f716da002cf0c6bc/src)
            defaultSyntax,
          );
          return utils.maybeCall(this.customSyntax || tailwindSyntax, {
            defaultSyntax,
            extraSyntax: tailwindSyntax,
          });
        },
        scope: {tailwindMajorVersion, customSyntax},
      },
    },
  );
};
