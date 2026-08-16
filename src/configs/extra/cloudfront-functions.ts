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
 * use `configV1` sub-config.
 *
 * Note that if neither `files` or `ignores` are specified or is an empty array in the main or a
 * sub-config, the config won't be generated.
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

export default defineUnConfig<CloudfrontFunctionsEslintConfigOptions>('cloudfrontFunctions', {
  enabledBy: false,
  phase: 'extra',
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const configs = (
    [
      [1, optionsResolved.configV1 || {}],
      [2, optionsResolved],
    ] satisfies [1 | 2, UnFlatConfigEntryBase][]
  ).flatMap(([runtimeVersion, options]) => {
    const isV2 = runtimeVersion === 2;

    const {files, ignores} = options;
    if (!files?.length && !ignores?.length) {
      return [];
    }

    const configsEs = buildEsConfigs(context, undefined, {
      prefix: `cloudfront-functions/v${runtimeVersion}/es-features`,
      options: {
        files,
        ignores,

        // Reference: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/functions-javascript-runtime-20.html
        ecmaVersion: 5,
        ecmaFeatures: {
          5: {
            //
          },
          2015: {
            arrowFunctions: true,
            blockScopedVariables: isV2,
            modules: true,
            restParameters: true,
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
            typedArrays: true,
          },
          2016: {
            arrayPrototypeIncludes: true,
          },
          2017: {
            asyncFunctions: isV2,

            objectEntries: true,
            objectValues: true,

            stringPrototypePadStartPadEnd: true,
          },
          2018: {
            regexpSFlag: isV2,

            promisePrototypeFinally: true,
          },
          2019: {
            stringPrototypeTrimStartTrimEnd: true,
          },
          2020: {
            promiseAllSettled: isV2,
          },
          2021: {
            stringPrototypeReplaceAll: isV2,
            numericSeparators: isV2,
            promiseAny: isV2,
          },
        },
      },
    }).configs;

    const allowedImports = getAllowedImports(isV2);

    const configBuilder = context.createConfigBuilder(options, '');

    configBuilder
      ?.addConfig(`cloudfront-functions/v${runtimeVersion}`)
      .addAnyRule('', 'no-unused-vars', ERROR, [
        {
          varsIgnorePattern: '^handler$',
        },
      ])
      .addRule('no-var', isV2 ? null : OFF)
      .addRule('prefer-destructuring', OFF)
      .addRule('prefer-object-has-own', OFF)
      .addRule('vars-on-top', isV2 ? null : OFF)
      .addAnyRule('unicorn', 'prefer-logical-operator-over-ternary', OFF)
      .addAnyRule('node', 'prefer-node-protocol', OFF)
      .addRule('no-restricted-syntax', ERROR, [
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
          selector: "CallExpression[callee.name='eval']",
          message: genSyntaxNotAllowedErrorMessage('Use of `eval`'),
        },
        {
          selector: "NewExpression[callee.name='Function']",
          message: genSyntaxNotAllowedErrorMessage('Use of `new Function()`'),
        },
        {
          selector: `ImportDeclaration:${allowedImports.map((module) => `not([source.value='${module}'])`).join(':')}`,
          message: `Only specific modules are allowed to be imported in CloudFront functions: ${allowedImports.map((module) => `\`${module}\``).join(', ')}.`,
        },
        {
          selector: `CallExpression[callee.name='require']:${allowedImports.map((module) => `not([arguments.0.value='${module}'])`).join(':')}`,
          message: `Only specific modules are allowed to be required in CloudFront functions: ${allowedImports.map((module) => `\`${module}\``).join(', ')}.`,
        },
      ])
      .addRule('no-restricted-globals', ERROR, [
        {
          name: 'setTimeout',
          message: genSyntaxNotAllowedErrorMessage('`setTimeout`'),
        },
        {
          name: 'clearTimeout',
          message: genSyntaxNotAllowedErrorMessage('`clearTimeout`'),
        },
        {
          name: 'setImmediate',
          message: genSyntaxNotAllowedErrorMessage('`setImmediate`'),
        },
        {
          name: 'process',
          message: genSyntaxNotAllowedErrorMessage('Use of the `process` global'),
        },
      ])
      .addAnyRule('node', 'no-missing-import', ERROR, [
        {
          allowModules: allowedImports,
        },
      ])
      .addAnyRule('node', 'no-missing-require', ERROR, [
        {
          allowModules: allowedImports,
        },
      ])
      .addOverrides();

    return [...configsEs, configBuilder];
  });

  return {
    configs,
    optionsResolved,
  };
});
