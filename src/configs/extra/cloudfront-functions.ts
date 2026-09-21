import globals from 'globals';
import {ERROR, OFF} from '../../constants';
import {buildEsConfigs} from '../es';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from '../index';

/**
 * [Amazon CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
 * specific rules.
 *
 * [JavaScript runtime 2.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html)
 * is assumed by default.
 * For functions written for
 * [JavaScript runtime 1.0](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-10.html),
 * use `v1` sub-config.
 *
 * Note that if neither `files` nor `ignores` is specified as a non-empty array in the main or a
 * sub-config, that config won't be generated.
 */
export interface CloudfrontFunctionsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins> {
  /**
   * A sub-config for functions written for the v1 runtime.
   * By default, the runtime version is assumed to be 2.
   *
   * 📁 Default `files`: none, must be specified explicitly
   * @default false
   */
  configV1?: UnFlatConfigEntryBase<ExtraPlugins>;
}

const genSyntaxNotAllowedErrorMessage = (syntax: string, isPlural = false) =>
  `${syntax} ${isPlural ? 'are' : 'is'} not allowed in CloudFront functions`;

const getAllowedImports = (isV2 = true): string[] =>
  ['querystring', 'crypto', isV2 && 'cloudfront'].filter((v) => typeof v === 'string');

// Turning Node.js globals off makes `no-undef` report the ones missing in CloudFront
const getGlobals = (isV2: boolean) =>
  Object.fromEntries([
    ...Object.keys(globals.node)
      .filter((name) => !Object.hasOwn(globals.builtin, name))
      .map((name) => [name, 'off'] as const),
    ...[
      'console',
      'InternalError',
      'require',
      ...(isV2 ? ['atob', 'btoa', 'Buffer', 'TextDecoder', 'TextEncoder'] : ['MemoryError']),
    ].map((name) => [name, 'readonly'] as const),
  ]);

export default defineUnConfig<CloudfrontFunctionsEslintConfigOptions>('cloudfrontFunctions', {
  enabledBy: false,
  phase: 'extra',
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  (
    [
      [1, optionsResolved.configV1 || {}],
      [2, optionsResolved],
    ] satisfies [1 | 2, UnFlatConfigEntryBase][]
  ).forEach(([runtimeVersion, options]) => {
    const isV2 = runtimeVersion === 2;

    const {files, ignores} = options;
    if (!files?.length && !ignores?.length) {
      return;
    }

    buildEsConfigs(context, undefined, {
      prefix: `cloudfront-functions/v${runtimeVersion}/es-features`,
      options: {
        files,
        ignores,

        // Reference: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html
        ecmaVersion: 5,
        ecmaFeatures: {
          2015: {
            arrowFunctions: true,
            blockScopedVariables: isV2,
            modules: true,
            restParameters: true,
            symbol: isV2,
            templateLiterals: true,

            objectAssign: true,
            objectIs: true,
            objectSetPrototypeOf: true,

            stringFromCodePoint: true,
            stringPrototypeCodePointAt: true,
            stringPrototypeEndsWith: true,
            stringPrototypeIncludes: true,
            stringPrototypeRepeat: true,
            stringPrototypeStartsWith: true,

            numberEpsilon: true,
            numberIsFinite: true,
            numberIsInteger: true,
            numberIsNan: true,
            numberIsSafeInteger: true,
            numberMaxSafeInteger: true,
            numberMinSafeInteger: true,
            numberParseFloat: true,
            numberParseInt: true,

            mathAcosh: true,
            mathAsinh: true,
            mathAtanh: true,
            mathCbrt: true,
            mathClz32: true,
            mathCosh: true,
            mathExpm1: true,
            mathFround: true,
            mathHypot: true,
            mathImul: true,
            mathLog10: true,
            mathLog1p: true,
            mathLog2: true,
            mathSign: true,
            mathSinh: true,
            mathTanh: true,
            mathTrunc: true,

            arrayOf: true,
            arrayPrototypeCopyWithin: true,
            arrayPrototypeFill: true,
            arrayPrototypeFind: true,
            arrayPrototypeFindIndex: true,

            promise: true,
            regexpPrototypeFlags: isV2,
            regexpYFlag: isV2,
            typedArrays: true,
          },
          2016: {
            arrayPrototypeIncludes: true,
            exponentialOperators: true,
          },
          2017: {
            asyncFunctions: isV2,

            objectEntries: true,
            objectGetOwnPropertyDescriptors: isV2,
            objectValues: true,

            stringPrototypePadStartPadEnd: true,
          },
          2018: {
            regexpNamedCaptureGroups: true,
            regexpSFlag: isV2,

            promisePrototypeFinally: true,
          },
          2019: {
            stringPrototypeTrimStartTrimEnd: true,
          },
          2020: {
            globalThis: true,
            promiseAllSettled: isV2,
          },
          2021: {
            stringPrototypeReplaceAll: isV2,
            numericSeparators: isV2,
            promiseAny: isV2,
          },
        },
      },
    });

    const allowedImports = getAllowedImports(isV2);

    const configBuilder = context.createConfigBuilder(options, '');

    configBuilder
      ?.addConfig(`cloudfront-functions/v${runtimeVersion}`, {
        languageOptions: {
          globals: getGlobals(isV2),
        },
      })
      .addRule('no-console', ERROR, [{allow: ['log']}])
      .addRule('no-eval', ERROR)
      .addRule('no-new-func', ERROR)
      .addRule('no-undef', ERROR)
      .addRule('no-unused-vars', ERROR, [
        {
          // Optional catch binding is not supported, so the caught error can't be omitted
          caughtErrors: 'none',
          varsIgnorePattern: '^handler$',
        },
      ])
      .addRule('no-var', isV2 ? null : OFF)
      .addRule('vars-on-top', isV2 ? null : OFF)
      .addRule(
        'no-restricted-syntax',
        ERROR,
        [
          {
            selector: 'ExportNamedDeclaration',
            message: genSyntaxNotAllowedErrorMessage('Named export statements', true),
          },
          {
            selector: 'ExportDefaultDeclaration',
            message: genSyntaxNotAllowedErrorMessage('Default export statements', true),
          },
          {
            selector: 'ExportAllDeclaration',
            message: genSyntaxNotAllowedErrorMessage(
              'Re-export statements (export * from ...)',
              true,
            ),
          },
          {
            selector: `ImportDeclaration:${allowedImports.map((module) => `not([source.value='${module}'])`).join(':')}`,
            message: `Only specific modules are allowed to be imported in CloudFront functions: ${allowedImports.map((module) => `\`${module}\``).join(', ')}.`,
          },
          {
            selector: `CallExpression[callee.name='require']:${allowedImports.map((module) => `not([arguments.0.value='${module}'])`).join(':')}`,
            message: `Only specific modules are allowed to be required in CloudFront functions: ${allowedImports.map((module) => `\`${module}\``).join(', ')}.`,
          },
          {
            selector:
              "CallExpression[callee.object.name='console'][callee.property.name='log'][arguments.length>1]",
            message: genSyntaxNotAllowedErrorMessage('Passing multiple arguments to `console.log`'),
          },
          {
            selector:
              "CallExpression[callee.object.name='Object'][callee.property.name='create'][arguments.length>1]",
            message: genSyntaxNotAllowedErrorMessage(
              'Passing property descriptors to `Object.create`',
            ),
          },
          isV2 && {
            selector:
              ':function :function[async=true], :matches(CallExpression, NewExpression) > :function[async=true]',
            message: genSyntaxNotAllowedErrorMessage(
              'Nested async functions and async function arguments',
              true,
            ),
          },
        ].filter((v) => typeof v === 'object'),
      )
      // AWS recommends sequential `await`s over `Promise.all()` and similar methods to save memory
      .disableAnyRule('', 'no-await-in-loop')
      // The rules below suggest syntax or APIs CloudFront functions don't support
      .disableAnyRule('', 'logical-assignment-operators')
      .disableAnyRule('', 'object-shorthand')
      .disableAnyRule('', 'prefer-destructuring')
      .disableAnyRule('', 'prefer-numeric-literals')
      .disableAnyRule('', 'prefer-object-has-own')
      .disableAnyRule('', 'prefer-object-spread')
      .disableAnyRule('', 'prefer-spread')
      .disableAnyRule('e18e', 'prefer-array-to-spliced')
      .disableAnyRule('e18e', 'prefer-nullish-coalescing')
      .disableAnyRule('e18e', 'prefer-object-has-own')
      .disableAnyRule('node', 'prefer-node-protocol')
      .disableAnyRule('node', 'prefer-process-get-builtin-module')
      .disableAnyRule('unicorn', 'prefer-array-from-range')
      .disableAnyRule('unicorn', 'prefer-array-last-methods')
      .disableAnyRule('unicorn', 'prefer-at')
      .disableAnyRule('unicorn', 'prefer-default-parameters')
      .disableAnyRule('unicorn', 'prefer-logical-operator-over-ternary')
      .disableAnyRule('unicorn', 'prefer-object-from-entries')
      .disableAnyRule('unicorn', 'prefer-optional-catch-binding')
      .disableAnyRule('unicorn', 'prefer-promise-with-resolvers')
      .disableAnyRule('unicorn', 'prefer-reflect-apply')
      .disableAnyRule('unicorn', 'prefer-set-has')
      .disableAnyRule('unicorn', 'prefer-string-match-all')
      .disableAnyRule('unicorn', 'prefer-string-raw')
      .disableAnyRule('unicorn', 'prefer-structured-clone')
      .disableAnyRule('unicorn', 'prefer-unicode-code-point-escapes')
      .addAnyRule('unicorn', 'prefer-single-replace', isV2 ? null : OFF)
      // v1 documents non-standard string methods like `toBytes`
      .addAnyRule('unicorn', 'no-nonstandard-builtin-properties', isV2 ? null : OFF)
      // Imports are already limited to the modules CloudFront provides
      .disableAnyRule('import', 'no-unresolved')
      .disableAnyRule('node', 'no-missing-import')
      .disableAnyRule('node', 'no-missing-require')
      .addOverrides();
  });
});
