// cspell:ignore findlast findlastindex toreversed tosorted tospliced waitasync getfloat setfloat formatrange displaynames durationformat formatrangetoparts selectrange supportedvaluesof toarray groupby finalizationregistry weakref maxsafeinteger minsafeinteger fromentries withresolvers isdisjointfrom issubsetof issupersetof symmetricdifference iswellformed towellformed matchall replaceall trimstart trimend subclassing weakrefs
import {ERROR, OFF} from '../constants';
import {ConfigEntryBuilder, type ConfigSharedOptions} from '../eslint';
import type {PrettifyShallow} from '../types';
import {assignDefaults, memoize} from '../utils';
import type {UnConfigFn, UnConfigOptions} from './index';

interface EcmaFeatures {
  2025:
    | 'dataviewPrototypeGetFloat16SetFloat16'
    | 'dynamicImportOptions'
    | 'float16array'
    | 'importAttributes'
    | 'iteratorPrototypeDrop'
    | 'iteratorPrototypeEvery'
    | 'iteratorPrototypeFilter'
    | 'iteratorPrototypeFind'
    | 'iteratorPrototypeFlatMap'
    | 'iteratorPrototypeForEach'
    | 'iteratorPrototypeMap'
    | 'iteratorPrototypeReduce'
    | 'iteratorPrototypeSome'
    | 'iteratorPrototypeTake'
    | 'iteratorPrototypeToArray'
    | 'iterator'
    | 'jsonModules'
    | 'mathF16round'
    | 'promiseTry'
    | 'regexpDuplicateNamedCapturingGroups'
    | 'regexpEscape'
    | 'regexpModifiers'
    | 'setPrototypeDifference'
    | 'setPrototypeIntersection'
    | 'setPrototypeIsDisjointFrom'
    | 'setPrototypeIsSubsetOf'
    | 'setPrototypeIsSupersetOf'
    | 'setPrototypeSymmetricDifference'
    | 'setPrototypeUnion'
    | 'trailingDynamicImportCommas'
    | 'intlDurationFormat';
  2024:
    | 'arrayBufferPrototypeTransfer'
    | 'atomicsWaitAsync'
    | 'mapGroupBy'
    | 'objectGroupBy'
    | 'promiseWithResolvers'
    | 'regexpVFlag'
    | 'resizableAndGrowableArrayBuffers'
    | 'stringPrototypeIsWellFormed'
    | 'stringPrototypeToWellFormed';
  2023:
    | 'arrayPrototypeFindlastFindLastIndex'
    | 'arrayPrototypeToReversed'
    | 'arrayPrototypeToSorted'
    | 'arrayPrototypeToSpliced'
    | 'arrayPrototypeWith'
    | 'hashbang'
    | 'regexpUnicodePropertyEscapes2023'
    | 'intlNumberFormatPrototypeFormatRange'
    | 'intlNumberFormatPrototypeFormatRangeToParts'
    | 'intlPluralRulesPrototypeSelectRange';
  2022:
    | 'arbitraryModuleNamespaceNames'
    | 'arrayPrototypeAt'
    | 'classInstanceFields'
    | 'classPrivateFields'
    | 'classPrivateMethods'
    | 'classStaticBlock'
    | 'classStaticFields'
    | 'errorCause'
    | 'objectHasOwn'
    | 'privateIn'
    | 'regexpDFlag'
    | 'regexpUnicodePropertyEscapes2022'
    | 'stringPrototypeAt'
    | 'topLevelAwait'
    | 'intlSegmenter'
    | 'intlSupportedValuesOf';
  2021:
    | 'logicalAssignmentOperators'
    | 'numericSeparators'
    | 'promiseAny'
    | 'regexpUnicodePropertyEscapes2021'
    | 'stringPrototypeReplaceAll'
    | 'weakRefs'
    | 'intlDateTimeFormatPrototypeFormatRange'
    | 'intlDisplayNames'
    | 'intlListFormat';
  2020:
    | 'bigint'
    | 'dynamicImport'
    | 'exportNsFrom'
    | 'globalThis'
    | 'importMeta'
    | 'nullishCoalescingOperators'
    | 'optionalChaining'
    | 'promiseAllSettled'
    | 'regexpUnicodePropertyEscapes2020'
    | 'stringPrototypeMatchAll'
    | 'intlLocale'
    | 'intlRelativeTimeFormat';
  2019:
    | 'arrayPrototypeFlat'
    | 'jsonSuperset'
    | 'objectFromEntries'
    | 'optionalCatchBinding'
    | 'regexpUnicodePropertyEscapes2019'
    | 'stringPrototypeTrimStartTrimEnd'
    | 'symbolPrototypeDescription';
  2018:
    | 'asyncIteration'
    | 'malformedTemplateLiterals'
    | 'promisePrototypeFinally'
    | 'regexpLookbehindAssertions'
    | 'regexpNamedCaptureGroups'
    | 'regexpSFlag'
    | 'regexpUnicodePropertyEscapes'
    | 'restSpreadProperties'
    | 'intlNumberFormatPrototypeFormatToParts'
    | 'intlPluralRules';
  2017:
    | 'asyncFunctions'
    | 'atomics'
    | 'objectEntries'
    | 'objectGetOwnPropertyDescriptors'
    | 'objectValues'
    | 'sharedArrayBuffer'
    | 'stringPrototypePadStartPadEnd'
    | 'trailingFunctionCommas'
    | 'intlDateTimeFormatPrototypeFormatToParts';
  2016: 'arrayPrototypeIncludes' | 'exponentialOperators' | 'intlGetCanonicalLocales';
  2015:
    | 'arrayFrom'
    | 'arrayOf'
    | 'arrayPrototypeCopyWithin'
    | 'arrayPrototypeEntries'
    | 'arrayPrototypeFill'
    | 'arrayPrototypeFind'
    | 'arrayPrototypeFindIndex'
    | 'arrayPrototypeKeys'
    | 'arrayPrototypeValues'
    | 'arrowFunctions'
    | 'binaryNumericLiterals'
    | 'blockScopedFunctions'
    | 'blockScopedVariables'
    | 'classes'
    | 'computedProperties'
    | 'defaultParameters'
    | 'destructuring'
    | 'forOfLoops'
    | 'generators'
    | 'map'
    | 'mathAcosh'
    | 'mathAsinh'
    | 'mathAtanh'
    | 'mathCbrt'
    | 'mathClz32'
    | 'mathCosh'
    | 'mathExpm1'
    | 'mathFround'
    | 'mathHypot'
    | 'mathImul'
    | 'mathLog10'
    | 'mathLog1p'
    | 'mathLog2'
    | 'mathSign'
    | 'mathSinh'
    | 'mathTanh'
    | 'mathTrunc'
    | 'modules'
    | 'newTarget'
    | 'numberEpsilon'
    | 'numberIsFinite'
    | 'numberIsInteger'
    | 'numberIsNan'
    | 'numberIsSafeInteger'
    | 'numberMaxSafeInteger'
    | 'numberMinSafeInteger'
    | 'numberParseFloat'
    | 'numberParseInt'
    | 'objectAssign'
    | 'objectGetOwnPropertySymbols'
    | 'objectIs'
    | 'objectSetPrototypeOf'
    | 'objectSuperProperties'
    | 'octalNumericLiterals'
    | 'promise'
    | 'propertyShorthands'
    | 'proxy'
    | 'reflect'
    | 'regexpPrototypeFlags'
    | 'regexpUFlag'
    | 'regexpYFlag'
    | 'restParameters'
    | 'set'
    | 'spreadElements'
    | 'stringFromCodePoint'
    | 'stringPrototypeCodePointAt'
    | 'stringPrototypeEndsWith'
    | 'stringPrototypeIncludes'
    | 'stringPrototypeNormalize'
    | 'stringPrototypeRepeat'
    | 'stringPrototypeStartsWith'
    | 'stringRaw'
    | 'subclassingBuiltins'
    | 'symbol'
    | 'templateLiterals'
    | 'typedArrays'
    | 'unicodeCodepointEscapes'
    | 'weakMap'
    | 'weakSet';
  5:
    | 'accessorProperties'
    | 'arrayIsArray'
    | 'arrayPrototypeEvery'
    | 'arrayPrototypeFilter'
    | 'arrayPrototypeForEach'
    | 'arrayPrototypeIndexOf'
    | 'arrayPrototypeLastIndexOf'
    | 'arrayPrototypeMap'
    | 'arrayPrototypeReduce'
    | 'arrayPrototypeReduceRight'
    | 'arrayPrototypeSome'
    | 'dateNow'
    | 'functionPrototypeBind'
    | 'json'
    | 'keywordProperties'
    | 'objectCreate'
    | 'objectDefineProperties'
    | 'objectDefineProperty'
    | 'objectFreeze'
    | 'objectGetOwnPropertyDescriptor'
    | 'objectGetOwnPropertyNames'
    | 'objectGetPrototypeOf'
    | 'objectIsExtensible'
    | 'objectIsFrozen'
    | 'objectIsSealed'
    | 'objectKeys'
    | 'objectPreventExtensions'
    | 'objectSeal'
    | 'stringPrototypeTrim'
    | 'trailingCommas';
}

type EcmaVersion = keyof EcmaFeatures;

export interface EsEslintConfigOptions extends ConfigSharedOptions<'es'> {
  /**
   * [`eslint-plugin-es-x`](https://www.npmjs.com/package/eslint-plugin-es-x) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `es-x` property and applied to the specified `files` and `ignores`.
   */
  settings?: {
    /**
     * "This plugin never reports prototype methods by default. Because it's hard to know
     * the type of objects, it will cause false positives. If you configured the `aggressive` mode,
     * this plugin reports prototype methods even if the rules couldn't know the type of objects"
     * - [plugin docs](https://eslint-community.github.io/eslint-plugin-es-x/#the-aggressive-mode)
     */
    aggressive?: boolean;

    /**
     * "This plugin has rules to report forbidden property accesses. These rules report all
     * forbidden property accesses by default, but if you want to allow existence-tested properties
     * in your scripts, you can use the `allowTestedProperty` mode"
     * - [plugin docs](https://eslint-community.github.io/eslint-plugin-es-x/#the-allowtestedproperty-mode)
     */
    allowTestedProperty?: boolean;
  };

  /**
   * Max supported ECMAScript version.
   * @default 'latest'
   */
  ecmaVersion?: EcmaVersion | 'latest';

  /**
   * Specify more granularly than `ecmaVersion` which ECMAScript features
   * are **supported** in the codebase.
   */
  ecmaFeatures?: Partial<{
    [Version in EcmaVersion]:
      | boolean
      | PrettifyShallow<{default?: boolean} & Partial<Record<EcmaFeatures[Version], boolean>>>;
  }>;
}

export const esUnConfig: UnConfigFn<
  'es',
  unknown,
  [
    customConfig?: {
      prefix: string;
      options: UnConfigOptions<EsEslintConfigOptions>;
    },
  ]
> = (context, customConfig) => {
  const optionsRaw = customConfig?.options ?? context.rootOptions.configs?.es;
  const optionsResolved = assignDefaults(optionsRaw, {
    ecmaVersion: 'latest',
  } satisfies EsEslintConfigOptions);

  const {settings: pluginSettings, ecmaVersion, ecmaFeatures = {}} = optionsResolved;

  const getEsVersionFeatures = memoize((version: EcmaVersion) => {
    const overallVersionSupported = ecmaVersion === 'latest' || version <= ecmaVersion;
    const esFeatures = ecmaFeatures[version] ?? overallVersionSupported;
    return typeof esFeatures === 'boolean'
      ? {default: esFeatures}
      : {default: overallVersionSupported, ...esFeatures};
  });
  const isEsVersionFullySupported = memoize((version: EcmaVersion) => {
    const esFeatures = getEsVersionFeatures(version);
    return (
      (ecmaVersion === 'latest' || version <= ecmaVersion) &&
      !Object.values(esFeatures).some((v) => !v)
    );
  });
  // `grs` means "get rule severity"
  const grs = <Version extends EcmaVersion>(version: Version, feature: EcmaFeatures[Version]) => {
    const esFeatures = getEsVersionFeatures(version);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const isFeatureSupported = esFeatures[feature as keyof typeof esFeatures] ?? esFeatures.default;
    return isFeatureSupported ? OFF : ERROR;
  };

  const configBuilder = new ConfigEntryBuilder('es', optionsResolved, context);

  const mainConfig = configBuilder.addConfig(
    [customConfig?.prefix || 'es', {includeDefaultFilesAndIgnores: true}],
    {
      ...(pluginSettings && {
        settings: {
          'es-x': pluginSettings,
        },
      }),
    },
  );

  /* Category: ES2025 */
  if (!isEsVersionFullySupported(2025)) {
    mainConfig
      .addRule(
        'no-dataview-prototype-getfloat16-setfloat16',
        grs(2025, 'dataviewPrototypeGetFloat16SetFloat16'),
      ) // >=8.5.0
      .addRule('no-dynamic-import-options', grs(2025, 'dynamicImportOptions')) // >=8.1.0
      .addRule('no-float16array', grs(2025, 'float16array')) // >=8.5.0
      .addRule('no-import-attributes', grs(2025, 'importAttributes')) // >=8.1.0
      .addRule('no-iterator-prototype-drop', grs(2025, 'iteratorPrototypeDrop')) // >=8.1.0
      .addRule('no-iterator-prototype-every', grs(2025, 'iteratorPrototypeEvery')) // >=8.1.0
      .addRule('no-iterator-prototype-filter', grs(2025, 'iteratorPrototypeFilter')) // >=8.1.0
      .addRule('no-iterator-prototype-find', grs(2025, 'iteratorPrototypeFind')) // >=8.1.0
      .addRule('no-iterator-prototype-flatmap', grs(2025, 'iteratorPrototypeFlatMap')) // >=8.1.0
      .addRule('no-iterator-prototype-foreach', grs(2025, 'iteratorPrototypeForEach')) // >=8.1.0
      .addRule('no-iterator-prototype-map', grs(2025, 'iteratorPrototypeMap')) // >=8.1.0
      .addRule('no-iterator-prototype-reduce', grs(2025, 'iteratorPrototypeReduce')) // >=8.1.0
      .addRule('no-iterator-prototype-some', grs(2025, 'iteratorPrototypeSome')) // >=8.1.0
      .addRule('no-iterator-prototype-take', grs(2025, 'iteratorPrototypeTake')) // >=8.1.0
      .addRule('no-iterator-prototype-toarray', grs(2025, 'iteratorPrototypeToArray')) // >=8.1.0
      .addRule('no-iterator', grs(2025, 'iterator')) // >=8.1.0
      .addRule('no-json-modules', grs(2025, 'jsonModules')) // >=8.1.0
      .addRule('no-math-f16round', grs(2025, 'mathF16round')) // >=8.5.0
      .addRule('no-promise-try', grs(2025, 'promiseTry')) // >=8.1.0
      .addRule(
        'no-regexp-duplicate-named-capturing-groups',
        grs(2025, 'regexpDuplicateNamedCapturingGroups'),
      ) // >=7.8.0
      .addRule('no-regexp-escape', grs(2025, 'regexpEscape')) // >=8.5.0
      .addRule('no-regexp-modifiers', grs(2025, 'regexpModifiers')) // >=8.1.0
      .addRule('no-set-prototype-difference', grs(2025, 'setPrototypeDifference')) // >=7.7.0
      .addRule('no-set-prototype-intersection', grs(2025, 'setPrototypeIntersection')) // >=7.7.0
      .addRule('no-set-prototype-isdisjointfrom', grs(2025, 'setPrototypeIsDisjointFrom')) // >=7.7.0
      .addRule('no-set-prototype-issubsetof', grs(2025, 'setPrototypeIsSubsetOf')) // >=7.7.0
      .addRule('no-set-prototype-issupersetof', grs(2025, 'setPrototypeIsSupersetOf')) // >=7.7.0
      .addRule('no-set-prototype-symmetricdifference', grs(2025, 'setPrototypeSymmetricDifference')) // >=7.7.0
      .addRule('no-set-prototype-union', grs(2025, 'setPrototypeUnion')) // >=7.7.0
      .addRule('no-trailing-dynamic-import-commas', grs(2025, 'trailingDynamicImportCommas')) // >=8.1.0
      /* Category: ES2025 Intl API */
      .addRule('no-intl-durationformat', grs(2025, 'intlDurationFormat')); // >=8.5.0
  }

  /* Category: ES2024 */
  if (!isEsVersionFullySupported(2024)) {
    mainConfig
      .addRule('no-arraybuffer-prototype-transfer', grs(2024, 'arrayBufferPrototypeTransfer')) // >=7.6.0
      .addRule('no-atomics-waitasync', grs(2024, 'atomicsWaitAsync')) // >=7.1.0
      .addRule('no-map-groupby', grs(2024, 'mapGroupBy')) // >=8.0.0
      .addRule('no-object-groupby', grs(2024, 'objectGroupBy')) // >=8.0.0
      .addRule('no-promise-withresolvers', grs(2024, 'promiseWithResolvers')) // >=7.5.0
      .addRule('no-regexp-v-flag', grs(2024, 'regexpVFlag')) // >=7.2.0
      .addRule(
        'no-resizable-and-growable-arraybuffers',
        grs(2024, 'resizableAndGrowableArrayBuffers'),
      ) // >=7.3.0
      .addRule('no-string-prototype-iswellformed', grs(2024, 'stringPrototypeIsWellFormed')) // >=8.0.0
      .addRule('no-string-prototype-towellformed', grs(2024, 'stringPrototypeToWellFormed')); // >=8.0.0
  }

  /* Category: ES2023 */
  if (!isEsVersionFullySupported(2023)) {
    mainConfig
      .addRule(
        'no-array-prototype-findlast-findlastindex',
        grs(2023, 'arrayPrototypeFindlastFindLastIndex'),
      ) // >=5.3.0
      .addRule('no-array-prototype-toreversed', grs(2023, 'arrayPrototypeToReversed')) // >=6.0.0
      .addRule('no-array-prototype-tosorted', grs(2023, 'arrayPrototypeToSorted')) // >=6.0.0
      .addRule('no-array-prototype-tospliced', grs(2023, 'arrayPrototypeToSpliced')) // >=6.0.0
      .addRule('no-array-prototype-with', grs(2023, 'arrayPrototypeWith')) // >=6.0.0
      .addRule('no-hashbang', grs(2023, 'hashbang')) // >=5.3.0
      .addRule(
        'no-regexp-unicode-property-escapes-2023',
        grs(2023, 'regexpUnicodePropertyEscapes2023'),
      ) // >=6.1.0
      /* Category: ES2023 Intl API */
      .addRule(
        'no-intl-numberformat-prototype-formatrange',
        grs(2023, 'intlNumberFormatPrototypeFormatRange'),
      ) // >=6.0.0
      .addRule(
        'no-intl-numberformat-prototype-formatrangetoparts',
        grs(2023, 'intlNumberFormatPrototypeFormatRangeToParts'),
      ) // >=6.0.0
      .addRule(
        'no-intl-pluralrules-prototype-selectrange',
        grs(2023, 'intlPluralRulesPrototypeSelectRange'),
      ); // >=6.0.0
  }

  /* Category: ES2022 */
  if (!isEsVersionFullySupported(2022)) {
    mainConfig
      .addRule('no-arbitrary-module-namespace-names', grs(2022, 'arbitraryModuleNamespaceNames')) // >=5.0.0
      .addRule('no-array-prototype-at', grs(2022, 'arrayPrototypeAt')) // >=8.0.0
      .addRule('no-class-instance-fields', grs(2022, 'classInstanceFields')) // >=8.0.0
      .addRule('no-class-private-fields', grs(2022, 'classPrivateFields')) // >=8.0.0
      .addRule('no-class-private-methods', grs(2022, 'classPrivateMethods')) // >=8.0.0
      .addRule('no-class-static-block', grs(2022, 'classStaticBlock')) // >=5.0.0
      .addRule('no-class-static-fields', grs(2022, 'classStaticFields')) // >=8.0.0
      .addRule('no-error-cause', grs(2022, 'errorCause')) // >=6.0.0
      .addRule('no-object-hasown', grs(2022, 'objectHasOwn')) // >=5.0.0
      .addRule('no-private-in', grs(2022, 'privateIn')) // >=5.0.0
      .addRule('no-regexp-d-flag', grs(2022, 'regexpDFlag')) // >=5.0.0
      .addRule(
        'no-regexp-unicode-property-escapes-2022',
        grs(2022, 'regexpUnicodePropertyEscapes2022'),
      ) // >=6.0.0
      .addRule('no-string-prototype-at', grs(2022, 'stringPrototypeAt')) // >=8.0.0
      .addRule('no-top-level-await', grs(2022, 'topLevelAwait')) // >=5.0.0
      /* Category: ES2022 Intl API */
      .addRule('no-intl-segmenter', grs(2022, 'intlSegmenter')) // >=6.0.0
      .addRule('no-intl-supportedvaluesof', grs(2022, 'intlSupportedValuesOf')); // >=6.0.0
  }

  /* Category: ES2021 */
  if (!isEsVersionFullySupported(2021)) {
    mainConfig
      .addRule('no-logical-assignment-operators', grs(2021, 'logicalAssignmentOperators')) // >=4.0.0
      .addRule('no-numeric-separators', grs(2021, 'numericSeparators')) // >=4.0.0
      .addRule('no-promise-any', grs(2021, 'promiseAny')) // >=4.0.0
      .addRule(
        'no-regexp-unicode-property-escapes-2021',
        grs(2021, 'regexpUnicodePropertyEscapes2021'),
      ) // >=6.0.0
      .addRule('no-string-prototype-replaceall', grs(2021, 'stringPrototypeReplaceAll')) // >=5.0.0
      .addRule('no-weakrefs', grs(2021, 'weakRefs')) // >=4.0.0
      /* Category: ES2021 Intl API */
      .addRule(
        'no-intl-datetimeformat-prototype-formatrange',
        grs(2021, 'intlDateTimeFormatPrototypeFormatRange'),
      ) // >=6.0.0
      .addRule('no-intl-displaynames', grs(2021, 'intlDisplayNames')) // >=6.0.0
      .addRule('no-intl-listformat', grs(2021, 'intlListFormat')); // >=6.0.0
  }

  /* Category: ES2020 */
  if (!isEsVersionFullySupported(2020)) {
    mainConfig
      .addRule('no-bigint', grs(2020, 'bigint')) // >=2.0.0
      .addRule('no-dynamic-import', grs(2020, 'dynamicImport')) // >=2.0.0
      .addRule('no-export-ns-from', grs(2020, 'exportNsFrom')) // >=4.0.0
      .addRule('no-global-this', grs(2020, 'globalThis')) // >=3.0.0
      .addRule('no-import-meta', grs(2020, 'importMeta')) // >=4.0.0
      .addRule('no-nullish-coalescing-operators', grs(2020, 'nullishCoalescingOperators')) // >=4.0.0
      .addRule('no-optional-chaining', grs(2020, 'optionalChaining')) // >=4.0.0
      .addRule('no-promise-all-settled', grs(2020, 'promiseAllSettled')) // >=2.0.0
      .addRule(
        'no-regexp-unicode-property-escapes-2020',
        grs(2020, 'regexpUnicodePropertyEscapes2020'),
      ) // >=6.0.0
      .addRule('no-string-prototype-matchall', grs(2020, 'stringPrototypeMatchAll')) // >=5.0.0
      /* Category: ES2020 Intl API */
      .addRule('no-intl-locale', grs(2020, 'intlLocale')) // >=6.0.0
      .addRule('no-intl-relativetimeformat', grs(2020, 'intlRelativeTimeFormat')); // >=6.0.0
  }

  /* Category: ES2019 */
  if (!isEsVersionFullySupported(2019)) {
    mainConfig
      .addRule('no-array-prototype-flat', grs(2019, 'arrayPrototypeFlat')) // >=5.0.0
      .addRule('no-json-superset', grs(2019, 'jsonSuperset')) // >=1.3.0
      .addRule('no-object-fromentries', grs(2019, 'objectFromEntries')) // >=4.0.0
      .addRule('no-optional-catch-binding', grs(2019, 'optionalCatchBinding')) // >=1.3.0
      .addRule(
        'no-regexp-unicode-property-escapes-2019',
        grs(2019, 'regexpUnicodePropertyEscapes2019'),
      ) // >=2.0.0
      .addRule(
        'no-string-prototype-trimstart-trimend',
        grs(2019, 'stringPrototypeTrimStartTrimEnd'),
      ) // >=5.0.0
      .addRule('no-symbol-prototype-description', grs(2019, 'symbolPrototypeDescription')); // >=5.0.0
  }

  /* Category: ES2018 */
  if (!isEsVersionFullySupported(2018)) {
    mainConfig
      .addRule('no-async-iteration', grs(2018, 'asyncIteration')) // >=1.0.0
      .addRule('no-malformed-template-literals', grs(2018, 'malformedTemplateLiterals')) // >=1.0.0
      .addRule('no-promise-prototype-finally', grs(2018, 'promisePrototypeFinally')) // >=5.0.0
      .addRule('no-regexp-lookbehind-assertions', grs(2018, 'regexpLookbehindAssertions')) // >=1.0.0
      .addRule('no-regexp-named-capture-groups', grs(2018, 'regexpNamedCaptureGroups')) // >=1.0.0
      .addRule('no-regexp-s-flag', grs(2018, 'regexpSFlag')) // >=1.0.0
      .addRule('no-regexp-unicode-property-escapes', grs(2018, 'regexpUnicodePropertyEscapes')) // >=1.0.0
      .addRule('no-rest-spread-properties', grs(2018, 'restSpreadProperties')) // >=1.0.0
      /* Category: ES2018 Intl API */
      .addRule(
        'no-intl-numberformat-prototype-formattoparts',
        grs(2018, 'intlNumberFormatPrototypeFormatToParts'),
      ) // >=6.0.0
      .addRule('no-intl-pluralrules', grs(2018, 'intlPluralRules')); // >=6.0.0
  }

  /* Category: ES2017 */
  if (!isEsVersionFullySupported(2017)) {
    mainConfig
      .addRule('no-async-functions', grs(2017, 'asyncFunctions')) // >=1.0.0
      .addRule('no-atomics', grs(2017, 'atomics')) // >=1.2.0
      .addRule('no-object-entries', grs(2017, 'objectEntries')) // >=1.2.0
      .addRule('no-object-getownpropertydescriptors', grs(2017, 'objectGetOwnPropertyDescriptors')) // >=1.2.0
      .addRule('no-object-values', grs(2017, 'objectValues')) // >=1.2.0
      .addRule('no-shared-array-buffer', grs(2017, 'sharedArrayBuffer')) // >=1.2.0
      .addRule('no-string-prototype-padstart-padend', grs(2017, 'stringPrototypePadStartPadEnd')) // >=5.0.0
      .addRule('no-trailing-function-commas', grs(2017, 'trailingFunctionCommas')) // >=1.0.0
      /* Category: ES2017 Intl API */
      .addRule(
        'no-intl-datetimeformat-prototype-formattoparts',
        grs(2017, 'intlDateTimeFormatPrototypeFormatToParts'),
      ); // >=6.0.0
  }

  /* Category: ES2016 */
  if (!isEsVersionFullySupported(2016)) {
    mainConfig
      .addRule('no-array-prototype-includes', grs(2016, 'arrayPrototypeIncludes')) // >=5.0.0
      .addRule('no-exponential-operators', grs(2016, 'exponentialOperators')) // >=1.0.0
      /* Category: ES2016 Intl API */
      .addRule('no-intl-getcanonicallocales', grs(2016, 'intlGetCanonicalLocales')); // >=6.0.0
  }

  /* Category: ES2015 */
  if (!isEsVersionFullySupported(2015)) {
    mainConfig
      .addRule('no-array-from', grs(2015, 'arrayFrom')) // >=1.2.0
      .addRule('no-array-of', grs(2015, 'arrayOf')) // >=1.2.0
      .addRule('no-array-prototype-copywithin', grs(2015, 'arrayPrototypeCopyWithin')) // >=5.0.0
      .addRule('no-array-prototype-entries', grs(2015, 'arrayPrototypeEntries')) // >=5.0.0
      .addRule('no-array-prototype-fill', grs(2015, 'arrayPrototypeFill')) // >=5.0.0
      .addRule('no-array-prototype-find', grs(2015, 'arrayPrototypeFind')) // >=5.0.0
      .addRule('no-array-prototype-findindex', grs(2015, 'arrayPrototypeFindIndex')) // >=5.0.0
      .addRule('no-array-prototype-keys', grs(2015, 'arrayPrototypeKeys')) // >=5.0.0
      .addRule('no-array-prototype-values', grs(2015, 'arrayPrototypeValues')) // >=5.0.0
      .addRule('no-arrow-functions', grs(2015, 'arrowFunctions')) // >=1.0.0
      .addRule('no-binary-numeric-literals', grs(2015, 'binaryNumericLiterals')) // >=1.0.0
      .addRule('no-block-scoped-functions', grs(2015, 'blockScopedFunctions')) // >=1.0.0
      .addRule('no-block-scoped-variables', grs(2015, 'blockScopedVariables')) // >=1.0.0
      .addRule('no-classes', grs(2015, 'classes')) // >=1.0.0
      .addRule('no-computed-properties', grs(2015, 'computedProperties')) // >=1.0.0
      .addRule('no-default-parameters', grs(2015, 'defaultParameters')) // >=1.0.0
      .addRule('no-destructuring', grs(2015, 'destructuring')) // >=1.0.0
      .addRule('no-for-of-loops', grs(2015, 'forOfLoops')) // >=1.0.0
      .addRule('no-generators', grs(2015, 'generators')) // >=1.0.0
      .addRule('no-map', grs(2015, 'map')) // >=1.2.0
      .addRule('no-math-acosh', grs(2015, 'mathAcosh')) // >=1.2.0
      .addRule('no-math-asinh', grs(2015, 'mathAsinh')) // >=1.2.0
      .addRule('no-math-atanh', grs(2015, 'mathAtanh')) // >=1.2.0
      .addRule('no-math-cbrt', grs(2015, 'mathCbrt')) // >=1.2.0
      .addRule('no-math-clz32', grs(2015, 'mathClz32')) // >=1.2.0
      .addRule('no-math-cosh', grs(2015, 'mathCosh')) // >=1.2.0
      .addRule('no-math-expm1', grs(2015, 'mathExpm1')) // >=1.2.0
      .addRule('no-math-fround', grs(2015, 'mathFround')) // >=1.2.0
      .addRule('no-math-hypot', grs(2015, 'mathHypot')) // >=1.2.0
      .addRule('no-math-imul', grs(2015, 'mathImul')) // >=1.2.0
      .addRule('no-math-log10', grs(2015, 'mathLog10')) // >=1.2.0
      .addRule('no-math-log1p', grs(2015, 'mathLog1p')) // >=1.2.0
      .addRule('no-math-log2', grs(2015, 'mathLog2')) // >=1.2.0
      .addRule('no-math-sign', grs(2015, 'mathSign')) // >=1.2.0
      .addRule('no-math-sinh', grs(2015, 'mathSinh')) // >=1.2.0
      .addRule('no-math-tanh', grs(2015, 'mathTanh')) // >=1.2.0
      .addRule('no-math-trunc', grs(2015, 'mathTrunc')) // >=1.2.0
      .addRule('no-modules', grs(2015, 'modules')) // >=1.0.0
      .addRule('no-new-target', grs(2015, 'newTarget')) // >=1.0.0
      .addRule('no-number-epsilon', grs(2015, 'numberEpsilon')) // >=1.2.0
      .addRule('no-number-isfinite', grs(2015, 'numberIsFinite')) // >=1.2.0
      .addRule('no-number-isinteger', grs(2015, 'numberIsInteger')) // >=1.2.0
      .addRule('no-number-isnan', grs(2015, 'numberIsNan')) // >=1.2.0
      .addRule('no-number-issafeinteger', grs(2015, 'numberIsSafeInteger')) // >=1.2.0
      .addRule('no-number-maxsafeinteger', grs(2015, 'numberMaxSafeInteger')) // >=1.2.0
      .addRule('no-number-minsafeinteger', grs(2015, 'numberMinSafeInteger')) // >=1.2.0
      .addRule('no-number-parsefloat', grs(2015, 'numberParseFloat')) // >=1.2.0
      .addRule('no-number-parseint', grs(2015, 'numberParseInt')) // >=1.2.0
      .addRule('no-object-assign', grs(2015, 'objectAssign')) // >=1.2.0
      .addRule('no-object-getownpropertysymbols', grs(2015, 'objectGetOwnPropertySymbols')) // >=1.2.0
      .addRule('no-object-is', grs(2015, 'objectIs')) // >=1.2.0
      .addRule('no-object-setprototypeof', grs(2015, 'objectSetPrototypeOf')) // >=1.2.0
      .addRule('no-object-super-properties', grs(2015, 'objectSuperProperties')) // >=1.1.0
      .addRule('no-octal-numeric-literals', grs(2015, 'octalNumericLiterals')) // >=1.0.0
      .addRule('no-promise', grs(2015, 'promise')) // >=1.2.0
      .addRule('no-property-shorthands', grs(2015, 'propertyShorthands')) // >=1.0.0
      .addRule('no-proxy', grs(2015, 'proxy')) // >=1.2.0
      .addRule('no-reflect', grs(2015, 'reflect')) // >=1.2.0
      .addRule('no-regexp-prototype-flags', grs(2015, 'regexpPrototypeFlags')) // >=5.0.0
      .addRule('no-regexp-u-flag', grs(2015, 'regexpUFlag')) // >=1.0.0
      .addRule('no-regexp-y-flag', grs(2015, 'regexpYFlag')) // >=1.0.0
      .addRule('no-rest-parameters', grs(2015, 'restParameters')) // >=1.0.0
      .addRule('no-set', grs(2015, 'set')) // >=1.2.0
      .addRule('no-spread-elements', grs(2015, 'spreadElements')) // >=1.0.0
      .addRule('no-string-fromcodepoint', grs(2015, 'stringFromCodePoint')) // >=1.2.0
      .addRule('no-string-prototype-codepointat', grs(2015, 'stringPrototypeCodePointAt')) // >=5.0.0
      .addRule('no-string-prototype-endswith', grs(2015, 'stringPrototypeEndsWith')) // >=5.0.0
      .addRule('no-string-prototype-endswith', grs(2015, 'stringPrototypeEndsWith')) // >=5.0.0
      .addRule('no-string-prototype-includes', grs(2015, 'stringPrototypeIncludes')) // >=5.0.0
      .addRule('no-string-prototype-normalize', grs(2015, 'stringPrototypeNormalize')) // >=5.0.0
      .addRule('no-string-prototype-repeat', grs(2015, 'stringPrototypeRepeat')) // >=5.0.0
      .addRule('no-string-prototype-startswith', grs(2015, 'stringPrototypeStartsWith')) // >=5.0.0
      .addRule('no-string-prototype-startswith', grs(2015, 'stringPrototypeStartsWith')) // >=5.0.0
      .addRule('no-string-raw', grs(2015, 'stringRaw')) // >=1.2.0
      .addRule('no-subclassing-builtins', grs(2015, 'subclassingBuiltins')) // >=1.2.0
      .addRule('no-symbol', grs(2015, 'symbol')) // >=1.2.0
      .addRule('no-template-literals', grs(2015, 'templateLiterals')) // >=1.0.0
      .addRule('no-typed-arrays', grs(2015, 'typedArrays')) // >=1.2.0
      .addRule('no-unicode-codepoint-escapes', grs(2015, 'unicodeCodepointEscapes')) // >=1.0.0
      .addRule('no-weak-map', grs(2015, 'weakMap')) // >=1.2.0
      .addRule('no-weak-set', grs(2015, 'weakSet')); // >=1.2.0
  }

  /* Category: ES5 */
  if (!isEsVersionFullySupported(5)) {
    mainConfig
      .addRule('no-accessor-properties', grs(5, 'accessorProperties')) // >=1.1.0
      .addRule('no-array-isarray', grs(5, 'arrayIsArray')) // >=3.0.0
      .addRule('no-array-prototype-every', grs(5, 'arrayPrototypeEvery')) // >=5.0.0
      .addRule('no-array-prototype-filter', grs(5, 'arrayPrototypeFilter')) // >=5.0.0
      .addRule('no-array-prototype-foreach', grs(5, 'arrayPrototypeForEach')) // >=5.0.0
      .addRule('no-array-prototype-indexof', grs(5, 'arrayPrototypeIndexOf')) // >=5.0.0
      .addRule('no-array-prototype-lastindexof', grs(5, 'arrayPrototypeLastIndexOf')) // >=5.0.0
      .addRule('no-array-prototype-map', grs(5, 'arrayPrototypeMap')) // >=5.0.0
      .addRule('no-array-prototype-reduce', grs(5, 'arrayPrototypeReduce')) // >=5.0.0
      .addRule('no-array-prototype-reduceright', grs(5, 'arrayPrototypeReduceRight')) // >=5.0.0
      .addRule('no-array-prototype-some', grs(5, 'arrayPrototypeSome')) // >=5.0.0
      .addRule('no-date-now', grs(5, 'dateNow')) // >=3.0.0
      .addRule('no-function-prototype-bind', grs(5, 'functionPrototypeBind')) // >=5.0.0
      .addRule('no-json', grs(5, 'json')) // >=3.0.0
      .addRule('no-keyword-properties', grs(5, 'keywordProperties')) // >=1.1.0
      .addRule('no-object-create', grs(5, 'objectCreate')) // >=5.0.0
      .addRule('no-object-defineproperties', grs(5, 'objectDefineProperties')) // >=3.0.0
      .addRule('no-object-defineproperty', grs(5, 'objectDefineProperty')) // >=3.0.0
      .addRule('no-object-freeze', grs(5, 'objectFreeze')) // >=3.0.0
      .addRule('no-object-getownpropertydescriptor', grs(5, 'objectGetOwnPropertyDescriptor')) // >=3.0.0
      .addRule('no-object-getownpropertynames', grs(5, 'objectGetOwnPropertyNames')) // >=3.0.0
      .addRule('no-object-getprototypeof', grs(5, 'objectGetPrototypeOf')) // >=3.0.0
      .addRule('no-object-isextensible', grs(5, 'objectIsExtensible')) // >=3.0.0
      .addRule('no-object-isfrozen', grs(5, 'objectIsFrozen')) // >=3.0.0
      .addRule('no-object-issealed', grs(5, 'objectIsSealed')) // >=3.0.0
      .addRule('no-object-keys', grs(5, 'objectKeys')) // >=3.0.0
      .addRule('no-object-preventextensions', grs(5, 'objectPreventExtensions')) // >=3.0.0
      .addRule('no-object-seal', grs(5, 'objectSeal')) // >=3.0.0
      .addRule('no-string-prototype-trim', grs(5, 'stringPrototypeTrim')) // >=5.0.0
      .addRule('no-trailing-commas', grs(5, 'trailingCommas')); // >=1.1.0
  }

  /* Category: Legacy */
  mainConfig
    // .addRule('no-date-prototype-getyear-setyear', OFF) // >=5.1.0
    // .addRule('no-date-prototype-togmtstring', OFF) // >=5.1.0
    // .addRule('no-escape-unescape', OFF) // >=5.1.0
    // .addRule('no-function-declarations-in-if-statement-clauses-without-block', OFF) // >=5.1.0
    // .addRule('no-initializers-in-for-in', OFF) // >=5.1.0
    // .addRule('no-labelled-function-declarations', OFF) // >=5.1.0
    // .addRule('no-legacy-object-prototype-accessor-methods', OFF) // >=5.2.0
    // .addRule('no-regexp-prototype-compile', OFF) // >=5.1.0
    // .addRule('no-shadow-catch-param', OFF) // >=5.1.0
    // .addRule('no-string-create-html-methods', OFF) // >=5.1.0
    // .addRule('no-string-prototype-substr', OFF) // >=5.1.0
    // .addRule('no-string-prototype-trimleft-trimright', OFF) // >=5.1.0
    /* Category: Non-standards */
    // .addRule('no-nonstandard-array-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-array-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-arraybuffer-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-arraybuffer-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-atomics-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-bigint-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-bigint-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-boolean-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-boolean-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-dataview-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-dataview-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-date-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-date-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-finalizationregistry-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-finalizationregistry-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-function-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-collator-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-collator-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-datetimeformat-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-datetimeformat-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-displaynames-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-displaynames-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-durationformat-properties', OFF) // >=8.5.0
    // .addRule('no-nonstandard-intl-durationformat-prototype-properties', OFF) // >=8.5.0
    // .addRule('no-nonstandard-intl-listformat-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-listformat-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-locale-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-locale-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-numberformat-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-numberformat-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-pluralrules-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-pluralrules-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-relativetimeformat-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-relativetimeformat-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-segmenter-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-intl-segmenter-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-iterator-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-iterator-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-json-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-map-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-map-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-math-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-number-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-number-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-object-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-promise-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-promise-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-proxy-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-reflect-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-regexp-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-regexp-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-set-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-set-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-sharedarraybuffer-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-sharedarraybuffer-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-string-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-string-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-symbol-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-symbol-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-typed-array-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-typed-array-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-weakmap-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-weakmap-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-weakref-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-weakref-prototype-properties', OFF) // >=8.2.0
    // .addRule('no-nonstandard-weakset-properties', OFF) // >=8.4.0
    // .addRule('no-nonstandard-weakset-prototype-properties', OFF) // >=8.2.0
    /* Category: Deprecated */
    // .addRule('no-array-string-prototype-at', OFF) // >=5.0.0
    // .addRule('no-class-fields', OFF) // >=5.0.0
    // .addRule('no-object-map-groupby', OFF) // >=7.5.0
    // .addRule('no-string-prototype-iswellformed-towellformed', OFF) // >=7.1.0
    .addOverrides();

  return {
    configs: [...configBuilder.getAllConfigs()],
    optionsResolved,
  };
};
