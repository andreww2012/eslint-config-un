// cspell:ignore findlast findlastindex toreversed tosorted tospliced waitasync getfloat setfloat formatrange displaynames durationformat formatrangetoparts selectrange supportedvaluesof toarray groupby finalizationregistry weakref maxsafeinteger minsafeinteger fromentries withresolvers isdisjointfrom issubsetof issupersetof symmetricdifference iswellformed towellformed replaceall trimstart trimend subclassing weakrefs fromasync asyncdisposablestack disposablestack suppressederror sumprecise frombase fromhex setfrombase setfromhex tobase tohex firstdayofweek getcalendars getcollations gethourcycles getnumberingsystems gettextinfo gettimezones getweekinfo israwjson rawjson
import {ERROR, OFF} from '../constants';
import type {Prettify} from '../types';
import {memoize} from '../utils';
import {
  type ExtraPluginsType,
  type UnConfigFn,
  type UnFlatConfigEntryBase,
  assignDefaults,
} from './index';

interface EcmaFeatures {
  2026:
    | 'arrayFromAsync'
    | 'asyncDisposableStack'
    | 'disposableStack'
    | 'errorIsError'
    | 'mathSumPrecise'
    | 'suppressedError'
    | 'symbolAsyncDispose'
    | 'symbolDispose'
    | 'uint8ArrayFromBase64'
    | 'uint8ArrayFromHex'
    | 'uint8ArrayPrototypeSetFromBase64'
    | 'uint8ArrayPrototypeSetFromHex'
    | 'uint8ArrayPrototypeToBase64'
    | 'uint8ArrayPrototypeToHex'
    | 'usingDeclarations'
    | 'intlLocalePrototypeFirstDayOfWeek'
    | 'intlLocalePrototypeGetCalendars'
    | 'intlLocalePrototypeGetCollations'
    | 'intlLocalePrototypeGetHourCycles'
    | 'intlLocalePrototypeGetNumberingSystems'
    | 'intlLocalePrototypeGetTextInfo'
    | 'intlLocalePrototypeGetTimeZones'
    | 'intlLocalePrototypeGetWeekInfo'
    | 'iteratorConcat'
    | 'jsonIsRawJson'
    | 'jsonParseReviverContextParameter'
    | 'jsonRawJson'
    | 'mapPrototypeGetOrInsert'
    | 'mapPrototypeGetOrInsertComputed'
    | 'weakMapPrototypeGetOrInsert'
    | 'weakMapPrototypeGetOrInsertComputed';
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
    | 'symbolMatchAll'
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

export interface EsEslintConfigOptions<
  ExtraPlugins extends ExtraPluginsType = never,
> extends UnFlatConfigEntryBase<ExtraPlugins, 'es'> {
  /**
   * [`eslint-plugin-es-x`](https://npmjs.com/eslint-plugin-es-x) plugin
   * [shared settings](https://eslint.org/docs/latest/use/configure/configuration-files#configuring-shared-settings)
   * that will be assigned to `es-x` property
   * and applied to the resolved `files` and `ignores` of this config.
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
      | Prettify<{default?: boolean} & Partial<Record<EcmaFeatures[Version], boolean>>>;
  }>;
}

export default ((context, optionsRaw, customConfig) => {
  const optionsResolved = assignDefaults(customConfig?.options ?? optionsRaw, {
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
    const isFeatureSupported =
      // eslint-disable-next-line ts/no-unnecessary-condition
      esFeatures[feature as keyof typeof esFeatures] ?? esFeatures.default;
    return isFeatureSupported ? OFF : ERROR;
  };

  const configBuilder = context.createConfigBuilder(optionsResolved, 'es');

  const mainConfig = configBuilder?.addConfig([
    customConfig?.prefix || 'es',
    {
      includeDefaultFilesAndIgnores: true,
      // TODO why?
      ignoresInternal: {
        html: false,
      },
      settings: {
        'es-x': pluginSettings,
      },
    },
  ]);

  if (!isEsVersionFullySupported(2026)) {
    mainConfig
      ?.markCategory('ES2026')
      .addRule('no-array-fromasync', grs(2026, 'arrayFromAsync')) /** @since 8.7.0 */
      .addRule('no-asyncdisposablestack', grs(2026, 'asyncDisposableStack')) /** @since 8.7.0 */
      .addRule('no-disposablestack', grs(2026, 'disposableStack')) /** @since 8.7.0 */
      .addRule('no-error-iserror', grs(2026, 'errorIsError')) /** @since 8.7.0 */
      .addRule('no-json-israwjson', grs(2026, 'jsonIsRawJson')) /** @since 9.3.0 */
      .addRule(
        'no-json-parse-reviver-context-parameter',
        grs(2026, 'jsonParseReviverContextParameter'),
      ) /** @since 9.3.0 */
      .addRule('no-json-rawjson', grs(2026, 'jsonRawJson')) /** @since 9.3.0 */
      .addRule('no-math-sumprecise', grs(2026, 'mathSumPrecise')) /** @since 9.1.0 */
      .addRule('no-suppressederror', grs(2026, 'suppressedError')) /** @since 8.7.0 */
      .addRule('no-symbol-asyncdispose', grs(2026, 'symbolAsyncDispose')) /** @since 9.0.0 */
      .addRule('no-symbol-dispose', grs(2026, 'symbolDispose')) /** @since 9.0.0 */
      .addRule('no-uint8array-frombase64', grs(2026, 'uint8ArrayFromBase64')) /** @since 9.1.0 */
      .addRule('no-uint8array-fromhex', grs(2026, 'uint8ArrayFromHex')) /** @since 9.1.0 */
      .addRule(
        'no-uint8array-prototype-setfrombase64',
        grs(2026, 'uint8ArrayPrototypeSetFromBase64'),
      ) /** @since 9.1.0 */
      .addRule(
        'no-uint8array-prototype-setfromhex',
        grs(2026, 'uint8ArrayPrototypeSetFromHex'),
      ) /** @since 9.1.0 */
      .addRule(
        'no-uint8array-prototype-tobase64',
        grs(2026, 'uint8ArrayPrototypeToBase64'),
      ) /** @since 9.1.0 */
      .addRule(
        'no-uint8array-prototype-tohex',
        grs(2026, 'uint8ArrayPrototypeToHex'),
      ) /** @since 9.1.0 */
      .addRule('no-using-declarations', grs(2026, 'usingDeclarations')) /** @since 8.7.0 */
      .markCategory('2026-intl')
      .addRule(
        'no-intl-locale-prototype-firstdayofweek',
        grs(2026, 'intlLocalePrototypeFirstDayOfWeek'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-getcalendars',
        grs(2026, 'intlLocalePrototypeGetCalendars'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-getcollations',
        grs(2026, 'intlLocalePrototypeGetCollations'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-gethourcycles',
        grs(2026, 'intlLocalePrototypeGetHourCycles'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-getnumberingsystems',
        grs(2026, 'intlLocalePrototypeGetNumberingSystems'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-gettextinfo',
        grs(2026, 'intlLocalePrototypeGetTextInfo'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-gettimezones',
        grs(2026, 'intlLocalePrototypeGetTimeZones'),
      ) /** @since 9.2.0 */
      .addRule(
        'no-intl-locale-prototype-getweekinfo',
        grs(2026, 'intlLocalePrototypeGetWeekInfo'),
      ) /** @since 9.2.0 */
      .addRule('no-iterator-concat', grs(2026, 'iteratorConcat')) /** @since 9.2.0 */
      .addRule(
        'no-map-prototype-getorinsert', // cspell:disable-line
        grs(2026, 'mapPrototypeGetOrInsert'),
      ) /** @since 9.4.0 */
      .addRule(
        'no-map-prototype-getorinsertcomputed', // cspell:disable-line
        grs(2026, 'mapPrototypeGetOrInsertComputed'),
      ) /** @since 9.4.0 */
      .addRule(
        'no-weakmap-prototype-getorinsert', // cspell:disable-line
        grs(2026, 'weakMapPrototypeGetOrInsert'),
      ) /** @since 9.4.0 */
      .addRule(
        'no-weakmap-prototype-getorinsertcomputed', // cspell:disable-line
        grs(2026, 'weakMapPrototypeGetOrInsertComputed'),
      ) /** @since 9.4.0 */;
  }
  if (!isEsVersionFullySupported(2025)) {
    mainConfig
      ?.markCategory('ES2025')
      .addRule(
        'no-dataview-prototype-getfloat16-setfloat16',
        grs(2025, 'dataviewPrototypeGetFloat16SetFloat16'),
      ) /** @since 8.5.0 */
      .addRule('no-dynamic-import-options', grs(2025, 'dynamicImportOptions')) /** @since 8.1.0 */
      .addRule('no-float16array', grs(2025, 'float16array')) /** @since 8.5.0 */
      .addRule('no-import-attributes', grs(2025, 'importAttributes')) /** @since 8.1.0 */
      .addRule('no-iterator', grs(2025, 'iterator')) /** @since 8.1.0 */
      .addRule('no-iterator-prototype-drop', grs(2025, 'iteratorPrototypeDrop')) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-every',
        grs(2025, 'iteratorPrototypeEvery'),
      ) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-filter',
        grs(2025, 'iteratorPrototypeFilter'),
      ) /** @since 8.1.0 */
      .addRule('no-iterator-prototype-find', grs(2025, 'iteratorPrototypeFind')) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-flatmap',
        grs(2025, 'iteratorPrototypeFlatMap'),
      ) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-foreach',
        grs(2025, 'iteratorPrototypeForEach'),
      ) /** @since 8.1.0 */
      .addRule('no-iterator-prototype-map', grs(2025, 'iteratorPrototypeMap')) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-reduce',
        grs(2025, 'iteratorPrototypeReduce'),
      ) /** @since 8.1.0 */
      .addRule('no-iterator-prototype-some', grs(2025, 'iteratorPrototypeSome')) /** @since 8.1.0 */
      .addRule('no-iterator-prototype-take', grs(2025, 'iteratorPrototypeTake')) /** @since 8.1.0 */
      .addRule(
        'no-iterator-prototype-toarray',
        grs(2025, 'iteratorPrototypeToArray'),
      ) /** @since 8.1.0 */
      .addRule('no-json-modules', grs(2025, 'jsonModules')) /** @since 8.1.0 */
      .addRule('no-math-f16round', grs(2025, 'mathF16round')) /** @since 8.5.0 */
      .addRule('no-promise-try', grs(2025, 'promiseTry')) /** @since 8.1.0 */
      .addRule(
        'no-regexp-duplicate-named-capturing-groups',
        grs(2025, 'regexpDuplicateNamedCapturingGroups'),
      ) /** @since 7.8.0 */
      .addRule('no-regexp-escape', grs(2025, 'regexpEscape')) /** @since 8.5.0 */
      .addRule('no-regexp-modifiers', grs(2025, 'regexpModifiers')) /** @since 8.1.0 */
      .addRule(
        'no-set-prototype-difference',
        grs(2025, 'setPrototypeDifference'),
      ) /** @since 7.7.0 */
      .addRule(
        'no-set-prototype-intersection',
        grs(2025, 'setPrototypeIntersection'),
      ) /** @since 7.7.0 */
      .addRule(
        'no-set-prototype-isdisjointfrom',
        grs(2025, 'setPrototypeIsDisjointFrom'),
      ) /** @since 7.7.0 */
      .addRule(
        'no-set-prototype-issubsetof',
        grs(2025, 'setPrototypeIsSubsetOf'),
      ) /** @since 7.7.0 */
      .addRule(
        'no-set-prototype-issupersetof',
        grs(2025, 'setPrototypeIsSupersetOf'),
      ) /** @since 7.7.0 */
      .addRule(
        'no-set-prototype-symmetricdifference',
        grs(2025, 'setPrototypeSymmetricDifference'),
      ) /** @since 7.7.0 */
      .addRule('no-set-prototype-union', grs(2025, 'setPrototypeUnion')) /** @since 7.7.0 */
      .addRule(
        'no-trailing-dynamic-import-commas',
        grs(2025, 'trailingDynamicImportCommas'),
      ) /** @since 8.1.0 */
      .markCategory('2025-intl')
      .addRule('no-intl-durationformat', grs(2025, 'intlDurationFormat')); /** @since 8.5.0 */
  }

  if (!isEsVersionFullySupported(2024)) {
    mainConfig
      ?.markCategory('ES2024')
      .addRule(
        'no-arraybuffer-prototype-transfer',
        grs(2024, 'arrayBufferPrototypeTransfer'),
      ) /** @since 7.6.0 */
      .addRule('no-atomics-waitasync', grs(2024, 'atomicsWaitAsync')) /** @since 7.1.0 */
      .addRule('no-map-groupby', grs(2024, 'mapGroupBy')) /** @since 8.0.0 */
      .addRule('no-object-groupby', grs(2024, 'objectGroupBy')) /** @since 8.0.0 */
      .addRule('no-promise-withresolvers', grs(2024, 'promiseWithResolvers')) /** @since 7.5.0 */
      .addRule('no-regexp-v-flag', grs(2024, 'regexpVFlag')) /** @since 7.2.0 */
      .addRule(
        'no-resizable-and-growable-arraybuffers',
        grs(2024, 'resizableAndGrowableArrayBuffers'),
      ) /** @since 7.3.0 */
      .addRule(
        'no-string-prototype-iswellformed',
        grs(2024, 'stringPrototypeIsWellFormed'),
      ) /** @since 8.0.0 */
      .addRule(
        'no-string-prototype-towellformed',
        grs(2024, 'stringPrototypeToWellFormed'),
      ); /** @since 8.0.0 */
  }

  if (!isEsVersionFullySupported(2023)) {
    mainConfig
      ?.markCategory('ES2023')
      .addRule(
        'no-array-prototype-findlast-findlastindex',
        grs(2023, 'arrayPrototypeFindlastFindLastIndex'),
      ) /** @since 5.3.0 */
      .addRule(
        'no-array-prototype-toreversed',
        grs(2023, 'arrayPrototypeToReversed'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-array-prototype-tosorted',
        grs(2023, 'arrayPrototypeToSorted'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-array-prototype-tospliced',
        grs(2023, 'arrayPrototypeToSpliced'),
      ) /** @since 6.0.0 */
      .addRule('no-array-prototype-with', grs(2023, 'arrayPrototypeWith')) /** @since 6.0.0 */
      .addRule('no-hashbang', grs(2023, 'hashbang')) /** @since 5.3.0 */
      .addRule(
        'no-regexp-unicode-property-escapes-2023',
        grs(2023, 'regexpUnicodePropertyEscapes2023'),
      ) /** @since 6.1.0 */
      .markCategory('2023-intl')
      .addRule(
        'no-intl-numberformat-prototype-formatrange',
        grs(2023, 'intlNumberFormatPrototypeFormatRange'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-intl-numberformat-prototype-formatrangetoparts',
        grs(2023, 'intlNumberFormatPrototypeFormatRangeToParts'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-intl-pluralrules-prototype-selectrange',
        grs(2023, 'intlPluralRulesPrototypeSelectRange'),
      ); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2022)) {
    mainConfig
      ?.markCategory('ES2022')
      .addRule(
        'no-arbitrary-module-namespace-names',
        grs(2022, 'arbitraryModuleNamespaceNames'),
      ) /** @since 5.0.0 */
      .addRule('no-array-prototype-at', grs(2022, 'arrayPrototypeAt')) /** @since 8.0.0 */
      .addRule('no-class-instance-fields', grs(2022, 'classInstanceFields')) /** @since 8.0.0 */
      .addRule('no-class-private-fields', grs(2022, 'classPrivateFields')) /** @since 8.0.0 */
      .addRule('no-class-private-methods', grs(2022, 'classPrivateMethods')) /** @since 8.0.0 */
      .addRule('no-class-static-block', grs(2022, 'classStaticBlock')) /** @since 5.0.0 */
      .addRule('no-class-static-fields', grs(2022, 'classStaticFields')) /** @since 8.0.0 */
      .addRule('no-error-cause', grs(2022, 'errorCause')) /** @since 6.0.0 */
      .addRule('no-object-hasown', grs(2022, 'objectHasOwn')) /** @since 5.0.0 */
      .addRule('no-private-in', grs(2022, 'privateIn')) /** @since 5.0.0 */
      .addRule('no-regexp-d-flag', grs(2022, 'regexpDFlag')) /** @since 5.0.0 */
      .addRule(
        'no-regexp-unicode-property-escapes-2022',
        grs(2022, 'regexpUnicodePropertyEscapes2022'),
      ) /** @since 6.0.0 */
      .addRule('no-string-prototype-at', grs(2022, 'stringPrototypeAt')) /** @since 8.0.0 */
      .addRule('no-top-level-await', grs(2022, 'topLevelAwait')) /** @since 5.0.0 */
      .markCategory('2022-intl')
      .addRule('no-intl-segmenter', grs(2022, 'intlSegmenter')) /** @since 6.0.0 */
      .addRule('no-intl-supportedvaluesof', grs(2022, 'intlSupportedValuesOf')); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2021)) {
    mainConfig
      ?.markCategory('ES2021')
      .addRule(
        'no-logical-assignment-operators',
        grs(2021, 'logicalAssignmentOperators'),
      ) /** @since 4.0.0 */
      .addRule('no-numeric-separators', grs(2021, 'numericSeparators')) /** @since 4.0.0 */
      .addRule('no-promise-any', grs(2021, 'promiseAny')) /** @since 4.0.0 */
      .addRule(
        'no-regexp-unicode-property-escapes-2021',
        grs(2021, 'regexpUnicodePropertyEscapes2021'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-string-prototype-replaceall',
        grs(2021, 'stringPrototypeReplaceAll'),
      ) /** @since 5.0.0 */
      .addRule('no-weakrefs', grs(2021, 'weakRefs')) /** @since 4.0.0 */
      .markCategory('2021-intl')
      .addRule(
        'no-intl-datetimeformat-prototype-formatrange',
        grs(2021, 'intlDateTimeFormatPrototypeFormatRange'),
      ) /** @since 6.0.0 */
      .addRule('no-intl-displaynames', grs(2021, 'intlDisplayNames')) /** @since 6.0.0 */
      .addRule('no-intl-listformat', grs(2021, 'intlListFormat')); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2020)) {
    mainConfig
      ?.markCategory('ES2020')
      .addRule('no-bigint', grs(2020, 'bigint')) /** @since 2.0.0 */
      .addRule('no-dynamic-import', grs(2020, 'dynamicImport')) /** @since 2.0.0 */
      .addRule('no-export-ns-from', grs(2020, 'exportNsFrom')) /** @since 4.0.0 */
      .addRule('no-global-this', grs(2020, 'globalThis')) /** @since 3.0.0 */
      .addRule('no-import-meta', grs(2020, 'importMeta')) /** @since 4.0.0 */
      .addRule(
        'no-nullish-coalescing-operators',
        grs(2020, 'nullishCoalescingOperators'),
      ) /** @since 4.0.0 */
      .addRule('no-optional-chaining', grs(2020, 'optionalChaining')) /** @since 4.0.0 */
      .addRule('no-promise-all-settled', grs(2020, 'promiseAllSettled')) /** @since 2.0.0 */
      .addRule(
        'no-regexp-unicode-property-escapes-2020',
        grs(2020, 'regexpUnicodePropertyEscapes2020'),
      ) /** @since 6.0.0 */
      .addRule(
        'no-string-prototype-matchall',
        grs(2020, 'stringPrototypeMatchAll'),
      ) /** @since 5.0.0 */
      .addRule('no-symbol-matchall', grs(2020, 'symbolMatchAll')) /** @since 9.0.0 */
      .markCategory('2020-intl')
      .addRule('no-intl-locale', grs(2020, 'intlLocale')) /** @since 6.0.0 */
      .addRule(
        'no-intl-relativetimeformat',
        grs(2020, 'intlRelativeTimeFormat'),
      ); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2019)) {
    mainConfig
      ?.markCategory('ES2019')
      .addRule('no-array-prototype-flat', grs(2019, 'arrayPrototypeFlat')) /** @since 5.0.0 */
      .addRule('no-json-superset', grs(2019, 'jsonSuperset')) /** @since 1.3.0 */
      .addRule('no-object-fromentries', grs(2019, 'objectFromEntries')) /** @since 4.0.0 */
      .addRule('no-optional-catch-binding', grs(2019, 'optionalCatchBinding')) /** @since 1.3.0 */
      .addRule(
        'no-regexp-unicode-property-escapes-2019',
        grs(2019, 'regexpUnicodePropertyEscapes2019'),
      ) /** @since 2.0.0 */
      .addRule(
        'no-string-prototype-trimstart-trimend',
        grs(2019, 'stringPrototypeTrimStartTrimEnd'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-symbol-prototype-description',
        grs(2019, 'symbolPrototypeDescription'),
      ); /** @since 5.0.0 */
  }

  if (!isEsVersionFullySupported(2018)) {
    mainConfig
      ?.markCategory('ES2018')
      .addRule('no-async-iteration', grs(2018, 'asyncIteration')) /** @since 1.0.0 */
      .addRule(
        'no-malformed-template-literals',
        grs(2018, 'malformedTemplateLiterals'),
      ) /** @since 1.0.0 */
      .addRule(
        'no-promise-prototype-finally',
        grs(2018, 'promisePrototypeFinally'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-regexp-lookbehind-assertions',
        grs(2018, 'regexpLookbehindAssertions'),
      ) /** @since 1.0.0 */
      .addRule(
        'no-regexp-named-capture-groups',
        grs(2018, 'regexpNamedCaptureGroups'),
      ) /** @since 1.0.0 */
      .addRule('no-regexp-s-flag', grs(2018, 'regexpSFlag')) /** @since 1.0.0 */
      .addRule(
        'no-regexp-unicode-property-escapes',
        grs(2018, 'regexpUnicodePropertyEscapes'),
      ) /** @since 1.0.0 */
      .addRule('no-rest-spread-properties', grs(2018, 'restSpreadProperties')) /** @since 1.0.0 */
      .markCategory('2018-intl')
      .addRule(
        'no-intl-numberformat-prototype-formattoparts',
        grs(2018, 'intlNumberFormatPrototypeFormatToParts'),
      ) /** @since 6.0.0 */
      .addRule('no-intl-pluralrules', grs(2018, 'intlPluralRules')); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2017)) {
    mainConfig
      ?.markCategory('ES2017')
      .addRule('no-async-functions', grs(2017, 'asyncFunctions')) /** @since 1.0.0 */
      .addRule('no-atomics', grs(2017, 'atomics')) /** @since 1.2.0 */
      .addRule('no-object-entries', grs(2017, 'objectEntries')) /** @since 1.2.0 */
      .addRule(
        'no-object-getownpropertydescriptors',
        grs(2017, 'objectGetOwnPropertyDescriptors'),
      ) /** @since 1.2.0 */
      .addRule('no-object-values', grs(2017, 'objectValues')) /** @since 1.2.0 */
      .addRule('no-shared-array-buffer', grs(2017, 'sharedArrayBuffer')) /** @since 1.2.0 */
      .addRule(
        'no-string-prototype-padstart-padend',
        grs(2017, 'stringPrototypePadStartPadEnd'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-trailing-function-commas',
        grs(2017, 'trailingFunctionCommas'),
      ) /** @since 1.0.0 */
      .markCategory('2017-intl')
      .addRule(
        'no-intl-datetimeformat-prototype-formattoparts',
        grs(2017, 'intlDateTimeFormatPrototypeFormatToParts'),
      ); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2016)) {
    mainConfig
      ?.markCategory('ES2016')
      .addRule(
        'no-array-prototype-includes',
        grs(2016, 'arrayPrototypeIncludes'),
      ) /** @since 5.0.0 */
      .addRule('no-exponential-operators', grs(2016, 'exponentialOperators')) /** @since 1.0.0 */
      .markCategory('2016-intl')
      .addRule(
        'no-intl-getcanonicallocales',
        grs(2016, 'intlGetCanonicalLocales'),
      ); /** @since 6.0.0 */
  }

  if (!isEsVersionFullySupported(2015)) {
    mainConfig
      ?.markCategory('ES2015')
      .addRule('no-array-from', grs(2015, 'arrayFrom')) /** @since 1.2.0 */
      .addRule('no-array-of', grs(2015, 'arrayOf')) /** @since 1.2.0 */
      .addRule(
        'no-array-prototype-copywithin',
        grs(2015, 'arrayPrototypeCopyWithin'),
      ) /** @since 5.0.0 */
      .addRule('no-array-prototype-entries', grs(2015, 'arrayPrototypeEntries')) /** @since 5.0.0 */
      .addRule('no-array-prototype-fill', grs(2015, 'arrayPrototypeFill')) /** @since 5.0.0 */
      .addRule('no-array-prototype-find', grs(2015, 'arrayPrototypeFind')) /** @since 5.0.0 */
      .addRule(
        'no-array-prototype-findindex',
        grs(2015, 'arrayPrototypeFindIndex'),
      ) /** @since 5.0.0 */
      .addRule('no-array-prototype-keys', grs(2015, 'arrayPrototypeKeys')) /** @since 5.0.0 */
      .addRule('no-array-prototype-values', grs(2015, 'arrayPrototypeValues')) /** @since 5.0.0 */
      .addRule('no-arrow-functions', grs(2015, 'arrowFunctions')) /** @since 1.0.0 */
      .addRule('no-binary-numeric-literals', grs(2015, 'binaryNumericLiterals')) /** @since 1.0.0 */
      .addRule('no-block-scoped-functions', grs(2015, 'blockScopedFunctions')) /** @since 1.0.0 */
      .addRule('no-block-scoped-variables', grs(2015, 'blockScopedVariables')) /** @since 1.0.0 */
      .addRule('no-classes', grs(2015, 'classes')) /** @since 1.0.0 */
      .addRule('no-computed-properties', grs(2015, 'computedProperties')) /** @since 1.0.0 */
      .addRule('no-default-parameters', grs(2015, 'defaultParameters')) /** @since 1.0.0 */
      .addRule('no-destructuring', grs(2015, 'destructuring')) /** @since 1.0.0 */
      .addRule('no-for-of-loops', grs(2015, 'forOfLoops')) /** @since 1.0.0 */
      .addRule('no-generators', grs(2015, 'generators')) /** @since 1.0.0 */
      .addRule('no-map', grs(2015, 'map')) /** @since 1.2.0 */
      .addRule('no-math-acosh', grs(2015, 'mathAcosh')) /** @since 1.2.0 */
      .addRule('no-math-asinh', grs(2015, 'mathAsinh')) /** @since 1.2.0 */
      .addRule('no-math-atanh', grs(2015, 'mathAtanh')) /** @since 1.2.0 */
      .addRule('no-math-cbrt', grs(2015, 'mathCbrt')) /** @since 1.2.0 */
      .addRule('no-math-clz32', grs(2015, 'mathClz32')) /** @since 1.2.0 */
      .addRule('no-math-cosh', grs(2015, 'mathCosh')) /** @since 1.2.0 */
      .addRule('no-math-expm1', grs(2015, 'mathExpm1')) /** @since 1.2.0 */
      .addRule('no-math-fround', grs(2015, 'mathFround')) /** @since 1.2.0 */
      .addRule('no-math-hypot', grs(2015, 'mathHypot')) /** @since 1.2.0 */
      .addRule('no-math-imul', grs(2015, 'mathImul')) /** @since 1.2.0 */
      .addRule('no-math-log10', grs(2015, 'mathLog10')) /** @since 1.2.0 */
      .addRule('no-math-log1p', grs(2015, 'mathLog1p')) /** @since 1.2.0 */
      .addRule('no-math-log2', grs(2015, 'mathLog2')) /** @since 1.2.0 */
      .addRule('no-math-sign', grs(2015, 'mathSign')) /** @since 1.2.0 */
      .addRule('no-math-sinh', grs(2015, 'mathSinh')) /** @since 1.2.0 */
      .addRule('no-math-tanh', grs(2015, 'mathTanh')) /** @since 1.2.0 */
      .addRule('no-math-trunc', grs(2015, 'mathTrunc')) /** @since 1.2.0 */
      .addRule('no-modules', grs(2015, 'modules')) /** @since 1.0.0 */
      .addRule('no-new-target', grs(2015, 'newTarget')) /** @since 1.0.0 */
      .addRule('no-number-epsilon', grs(2015, 'numberEpsilon')) /** @since 1.2.0 */
      .addRule('no-number-isfinite', grs(2015, 'numberIsFinite')) /** @since 1.2.0 */
      .addRule('no-number-isinteger', grs(2015, 'numberIsInteger')) /** @since 1.2.0 */
      .addRule('no-number-isnan', grs(2015, 'numberIsNan')) /** @since 1.2.0 */
      .addRule('no-number-issafeinteger', grs(2015, 'numberIsSafeInteger')) /** @since 1.2.0 */
      .addRule('no-number-maxsafeinteger', grs(2015, 'numberMaxSafeInteger')) /** @since 1.2.0 */
      .addRule('no-number-minsafeinteger', grs(2015, 'numberMinSafeInteger')) /** @since 1.2.0 */
      .addRule('no-number-parsefloat', grs(2015, 'numberParseFloat')) /** @since 1.2.0 */
      .addRule('no-number-parseint', grs(2015, 'numberParseInt')) /** @since 1.2.0 */
      .addRule('no-object-assign', grs(2015, 'objectAssign')) /** @since 1.2.0 */
      .addRule(
        'no-object-getownpropertysymbols',
        grs(2015, 'objectGetOwnPropertySymbols'),
      ) /** @since 1.2.0 */
      .addRule('no-object-is', grs(2015, 'objectIs')) /** @since 1.2.0 */
      .addRule('no-object-setprototypeof', grs(2015, 'objectSetPrototypeOf')) /** @since 1.2.0 */
      .addRule('no-object-super-properties', grs(2015, 'objectSuperProperties')) /** @since 1.1.0 */
      .addRule('no-octal-numeric-literals', grs(2015, 'octalNumericLiterals')) /** @since 1.0.0 */
      .addRule('no-promise', grs(2015, 'promise')) /** @since 1.2.0 */
      .addRule('no-property-shorthands', grs(2015, 'propertyShorthands')) /** @since 1.0.0 */
      .addRule('no-proxy', grs(2015, 'proxy')) /** @since 1.2.0 */
      .addRule('no-reflect', grs(2015, 'reflect')) /** @since 1.2.0 */
      .addRule('no-regexp-prototype-flags', grs(2015, 'regexpPrototypeFlags')) /** @since 5.0.0 */
      .addRule('no-regexp-u-flag', grs(2015, 'regexpUFlag')) /** @since 1.0.0 */
      .addRule('no-regexp-y-flag', grs(2015, 'regexpYFlag')) /** @since 1.0.0 */
      .addRule('no-rest-parameters', grs(2015, 'restParameters')) /** @since 1.0.0 */
      .addRule('no-set', grs(2015, 'set')) /** @since 1.2.0 */
      .addRule('no-spread-elements', grs(2015, 'spreadElements')) /** @since 1.0.0 */
      .addRule('no-string-fromcodepoint', grs(2015, 'stringFromCodePoint')) /** @since 1.2.0 */
      .addRule(
        'no-string-prototype-codepointat',
        grs(2015, 'stringPrototypeCodePointAt'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-string-prototype-endswith',
        grs(2015, 'stringPrototypeEndsWith'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-string-prototype-includes',
        grs(2015, 'stringPrototypeIncludes'),
      ) /** @since 5.0.0 */
      .addRule(
        'no-string-prototype-normalize',
        grs(2015, 'stringPrototypeNormalize'),
      ) /** @since 5.0.0 */
      .addRule('no-string-prototype-repeat', grs(2015, 'stringPrototypeRepeat')) /** @since 5.0.0 */
      .addRule(
        'no-string-prototype-startswith',
        grs(2015, 'stringPrototypeStartsWith'),
      ) /** @since 5.0.0 */
      .addRule('no-string-raw', grs(2015, 'stringRaw')) /** @since 1.2.0 */
      .addRule('no-subclassing-builtins', grs(2015, 'subclassingBuiltins')) /** @since 1.2.0 */
      .addRule('no-symbol', grs(2015, 'symbol')) /** @since 1.2.0 */
      .addRule('no-template-literals', grs(2015, 'templateLiterals')) /** @since 1.0.0 */
      .addRule('no-typed-arrays', grs(2015, 'typedArrays')) /** @since 1.2.0 */
      .addRule(
        'no-unicode-codepoint-escapes',
        grs(2015, 'unicodeCodepointEscapes'),
      ) /** @since 1.0.0 */
      .addRule('no-weak-map', grs(2015, 'weakMap')) /** @since 1.2.0 */
      .addRule('no-weak-set', grs(2015, 'weakSet')); /** @since 1.2.0 */
  }

  if (!isEsVersionFullySupported(5)) {
    mainConfig
      ?.markCategory('ES5')
      .addRule('no-accessor-properties', grs(5, 'accessorProperties')) /** @since 1.1.0 */
      .addRule('no-array-isarray', grs(5, 'arrayIsArray')) /** @since 3.0.0 */
      .addRule('no-array-prototype-every', grs(5, 'arrayPrototypeEvery')) /** @since 5.0.0 */
      .addRule('no-array-prototype-filter', grs(5, 'arrayPrototypeFilter')) /** @since 5.0.0 */
      .addRule('no-array-prototype-foreach', grs(5, 'arrayPrototypeForEach')) /** @since 5.0.0 */
      .addRule('no-array-prototype-indexof', grs(5, 'arrayPrototypeIndexOf')) /** @since 5.0.0 */
      .addRule(
        'no-array-prototype-lastindexof',
        grs(5, 'arrayPrototypeLastIndexOf'),
      ) /** @since 5.0.0 */
      .addRule('no-array-prototype-map', grs(5, 'arrayPrototypeMap')) /** @since 5.0.0 */
      .addRule('no-array-prototype-reduce', grs(5, 'arrayPrototypeReduce')) /** @since 5.0.0 */
      .addRule(
        'no-array-prototype-reduceright',
        grs(5, 'arrayPrototypeReduceRight'),
      ) /** @since 5.0.0 */
      .addRule('no-array-prototype-some', grs(5, 'arrayPrototypeSome')) /** @since 5.0.0 */
      .addRule('no-date-now', grs(5, 'dateNow')) /** @since 3.0.0 */
      .addRule('no-function-prototype-bind', grs(5, 'functionPrototypeBind')) /** @since 5.0.0 */
      .addRule('no-json', grs(5, 'json')) /** @since 3.0.0 */
      .addRule('no-keyword-properties', grs(5, 'keywordProperties')) /** @since 1.1.0 */
      .addRule('no-object-create', grs(5, 'objectCreate')) /** @since 5.0.0 */
      .addRule('no-object-defineproperties', grs(5, 'objectDefineProperties')) /** @since 3.0.0 */
      .addRule('no-object-defineproperty', grs(5, 'objectDefineProperty')) /** @since 3.0.0 */
      .addRule('no-object-freeze', grs(5, 'objectFreeze')) /** @since 3.0.0 */
      .addRule(
        'no-object-getownpropertydescriptor',
        grs(5, 'objectGetOwnPropertyDescriptor'),
      ) /** @since 3.0.0 */
      .addRule(
        'no-object-getownpropertynames',
        grs(5, 'objectGetOwnPropertyNames'),
      ) /** @since 3.0.0 */
      .addRule('no-object-getprototypeof', grs(5, 'objectGetPrototypeOf')) /** @since 3.0.0 */
      .addRule('no-object-isextensible', grs(5, 'objectIsExtensible')) /** @since 3.0.0 */
      .addRule('no-object-isfrozen', grs(5, 'objectIsFrozen')) /** @since 3.0.0 */
      .addRule('no-object-issealed', grs(5, 'objectIsSealed')) /** @since 3.0.0 */
      .addRule('no-object-keys', grs(5, 'objectKeys')) /** @since 3.0.0 */
      .addRule('no-object-preventextensions', grs(5, 'objectPreventExtensions')) /** @since 3.0.0 */
      .addRule('no-object-seal', grs(5, 'objectSeal')) /** @since 3.0.0 */
      .addRule('no-string-prototype-trim', grs(5, 'stringPrototypeTrim')) /** @since 5.0.0 */
      .addRule('no-trailing-commas', grs(5, 'trailingCommas')); /** @since 1.1.0 */
  }

  mainConfig
    ?.markCategory('Legacy')
    .addRule('no-date-prototype-getyear-setyear', OFF) /** @since 5.1.0 */
    .addRule('no-date-prototype-togmtstring', OFF) /** @since 5.1.0 */
    .addRule('no-escape-unescape', OFF) /** @since 5.1.0 */
    .addRule(
      'no-function-declarations-in-if-statement-clauses-without-block',
      OFF,
    ) /** @since 5.1.0 */
    .addRule('no-initializers-in-for-in', OFF) /** @since 5.1.0 */
    .addRule('no-labelled-function-declarations', OFF) /** @since 5.1.0 */
    .addRule('no-legacy-object-prototype-accessor-methods', OFF) /** @since 5.2.0 */
    .addRule('no-regexp-prototype-compile', OFF) /** @since 5.1.0 */
    .addRule('no-shadow-catch-param', OFF) /** @since 5.1.0 */
    .addRule('no-string-create-html-methods', OFF) /** @since 5.1.0 */
    .addRule('no-string-prototype-substr', OFF) /** @since 5.1.0 */
    .addRule('no-string-prototype-trimleft-trimright', OFF) /** @since 5.1.0 */
    .markCategory('Non-standards')
    .addRule('no-nonstandard-array-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-array-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-arraybuffer-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-arraybuffer-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-asyncdisposablestack-properties', OFF) /** @since 8.7.0 */
    .addRule('no-nonstandard-asyncdisposablestack-prototype-properties', OFF) /** @since 8.7.0 */
    .addRule('no-nonstandard-atomics-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-bigint-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-bigint-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-boolean-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-boolean-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-dataview-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-dataview-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-date-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-date-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-disposablestack-properties', OFF) /** @since 8.7.0 */
    .addRule('no-nonstandard-disposablestack-prototype-properties', OFF) /** @since 8.7.0 */
    .addRule('no-nonstandard-error-properties', OFF) /** @since 8.7.0 */
    .addRule('no-nonstandard-finalizationregistry-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-finalizationregistry-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-function-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-collator-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-collator-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-datetimeformat-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-datetimeformat-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-displaynames-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-displaynames-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-durationformat-properties', OFF) /** @since 8.5.0 */
    .addRule('no-nonstandard-intl-durationformat-prototype-properties', OFF) /** @since 8.5.0 */
    .addRule('no-nonstandard-intl-listformat-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-listformat-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-locale-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-locale-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-numberformat-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-numberformat-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-pluralrules-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-pluralrules-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-relativetimeformat-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-relativetimeformat-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-segmenter-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-intl-segmenter-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-iterator-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-iterator-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-json-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-map-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-map-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-math-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-number-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-number-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-object-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-promise-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-promise-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-proxy-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-reflect-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-regexp-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-regexp-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-set-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-set-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-sharedarraybuffer-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-sharedarraybuffer-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-string-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-string-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-symbol-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-symbol-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-typed-array-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-typed-array-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-weakmap-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-weakmap-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-weakref-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-weakref-prototype-properties', OFF) /** @since 8.2.0 */
    .addRule('no-nonstandard-weakset-properties', OFF) /** @since 8.4.0 */
    .addRule('no-nonstandard-weakset-prototype-properties', OFF) /** @since 8.2.0 */
    .enableConfigTesterForPlugin('es')
    .addOverrides();

  return {
    configs: [configBuilder],
    optionsResolved,
  };
}) satisfies UnConfigFn<
  'es',
  | {
      prefix: string;
      options: EsEslintConfigOptions;
    }
  | undefined
>;
