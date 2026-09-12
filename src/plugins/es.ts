// cspell:ignore disposablestack plaindate
import {definePluginMetadata} from './shared';

export default definePluginMetadata('es', {
  configs: ['es'],
  docsUrl: 'https://eslint-community.github.io/eslint-plugin-es-x',
  ruleDocsUrl: (ruleName) =>
    `https://eslint-community.github.io/eslint-plugin-es-x/rules/${ruleName}.html`,
  suggestedPrefix: [
    'es-x',
    'a fork meant to replace the original plugin, so it keeps the original prefix',
  ],
  rules: {
    'no-array-prototype-at': {requiresTypeInfo: 'optional'},
    'no-array-prototype-copywithin': {requiresTypeInfo: 'optional'},
    'no-array-prototype-entries': {requiresTypeInfo: 'optional'},
    'no-array-prototype-every': {requiresTypeInfo: 'optional'},
    'no-array-prototype-fill': {requiresTypeInfo: 'optional'},
    'no-array-prototype-filter': {requiresTypeInfo: 'optional'},
    'no-array-prototype-find': {requiresTypeInfo: 'optional'},
    'no-array-prototype-findindex': {requiresTypeInfo: 'optional'},
    'no-array-prototype-findlast-findlastindex': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-array-prototype-flat': {requiresTypeInfo: 'optional'},
    'no-array-prototype-foreach': {requiresTypeInfo: 'optional'},
    'no-array-prototype-includes': {requiresTypeInfo: 'optional'},
    'no-array-prototype-indexof': {requiresTypeInfo: 'optional'},
    'no-array-prototype-keys': {requiresTypeInfo: 'optional'},
    'no-array-prototype-lastindexof': {requiresTypeInfo: 'optional'},
    'no-array-prototype-map': {requiresTypeInfo: 'optional'},
    'no-array-prototype-reduce': {requiresTypeInfo: 'optional'},
    'no-array-prototype-reduceright': {requiresTypeInfo: 'optional'},
    'no-array-prototype-some': {requiresTypeInfo: 'optional'},
    'no-array-prototype-toreversed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-array-prototype-tosorted': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-array-prototype-tospliced': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-array-prototype-values': {requiresTypeInfo: 'optional'},
    'no-array-prototype-with': {requiresTypeInfo: 'optional'},
    'no-array-string-prototype-at': {requiresTypeInfo: 'optional'},
    'no-arraybuffer-prototype-transfer': {requiresTypeInfo: 'optional'},
    'no-dataview-prototype-getfloat16-setfloat16': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-date-prototype-getyear-setyear': {requiresTypeInfo: 'optional'},
    'no-date-prototype-togmtstring': {requiresTypeInfo: 'optional'},
    'no-date-prototype-totemporalinstant': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-function-prototype-bind': {requiresTypeInfo: 'optional'},
    'no-intl-datetimeformat-prototype-formatrange': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-datetimeformat-prototype-formattoparts': {requiresTypeInfo: 'optional'},
    'no-intl-locale-prototype-firstdayofweek': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-getcalendars': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-getcollations': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-gethourcycles': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-getnumberingsystems': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-gettextinfo': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-gettimezones': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-locale-prototype-getweekinfo': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-numberformat-prototype-formatrange': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-numberformat-prototype-formatrangetoparts': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-intl-numberformat-prototype-formattoparts': {requiresTypeInfo: 'optional'},
    'no-intl-pluralrules-prototype-selectrange': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-iterator-prototype-drop': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-every': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-filter': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-find': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-flatmap': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-foreach': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-map': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-reduce': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-some': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-take': {requiresTypeInfo: 'optional'},
    'no-iterator-prototype-toarray': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-map-prototype-getorinsert': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-map-prototype-getorinsertcomputed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-array-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-arraybuffer-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-asyncdisposablestack-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-bigint-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-boolean-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-dataview-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-date-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-disposablestack-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-finalizationregistry-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-intl-collator-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-datetimeformat-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-displaynames-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-intl-durationformat-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-intl-listformat-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-locale-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-numberformat-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-pluralrules-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-relativetimeformat-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-intl-segmenter-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-iterator-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-map-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-number-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-promise-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-regexp-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-set-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-sharedarraybuffer-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-string-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-symbol-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-temporal-duration-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-temporal-instant-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-temporal-plaindate-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-temporal-plaindatetime-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-temporal-plainmonthday-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-temporal-plaintime-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-temporal-plainyearmonth-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-temporal-zoneddatetime-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-typed-array-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-weakmap-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-nonstandard-weakref-prototype-properties': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-nonstandard-weakset-prototype-properties': {requiresTypeInfo: 'optional'},
    'no-promise-prototype-finally': {requiresTypeInfo: 'optional'},
    'no-regexp-prototype-compile': {requiresTypeInfo: 'optional'},
    'no-regexp-prototype-flags': {requiresTypeInfo: 'optional'},
    'no-resizable-and-growable-arraybuffers': {requiresTypeInfo: 'optional'},
    'no-set-prototype-difference': {requiresTypeInfo: 'optional'},
    'no-set-prototype-intersection': {requiresTypeInfo: 'optional'},
    'no-set-prototype-isdisjointfrom': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-set-prototype-issubsetof': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-set-prototype-issupersetof': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-set-prototype-symmetricdifference': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-set-prototype-union': {requiresTypeInfo: 'optional'},
    'no-string-create-html-methods': {requiresTypeInfo: 'optional'},
    'no-string-prototype-at': {requiresTypeInfo: 'optional'},
    'no-string-prototype-codepointat': {requiresTypeInfo: 'optional'},
    'no-string-prototype-endswith': {requiresTypeInfo: 'optional'},
    'no-string-prototype-includes': {requiresTypeInfo: 'optional'},
    'no-string-prototype-iswellformed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-string-prototype-iswellformed-towellformed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-string-prototype-matchall': {requiresTypeInfo: 'optional'},
    'no-string-prototype-normalize': {requiresTypeInfo: 'optional'},
    'no-string-prototype-padstart-padend': {requiresTypeInfo: 'optional'},
    'no-string-prototype-repeat': {requiresTypeInfo: 'optional'},
    'no-string-prototype-replaceall': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-string-prototype-startswith': {requiresTypeInfo: 'optional'},
    'no-string-prototype-substr': {requiresTypeInfo: 'optional'},
    'no-string-prototype-towellformed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-string-prototype-trim': {requiresTypeInfo: 'optional'},
    'no-string-prototype-trimleft-trimright': {requiresTypeInfo: 'optional'},
    'no-string-prototype-trimstart-trimend': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-symbol-prototype-description': {requiresTypeInfo: 'optional'},
    'no-uint8array-prototype-setfrombase64': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-uint8array-prototype-setfromhex': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-uint8array-prototype-tobase64': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-uint8array-prototype-tohex': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-weakmap-prototype-getorinsert': {requiresTypeInfo: 'optional'}, // cspell:disable-line
    'no-weakmap-prototype-getorinsertcomputed': {requiresTypeInfo: 'optional'}, // cspell:disable-line
  },
});
