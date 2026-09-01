import {identity} from '@andreww2012/unutils';
import type {CSSLanguageOptions} from '@eslint/css';
import type {MarkdownLanguageOptions} from '@eslint/markdown';
import type {ParserOptions as HtmlEslintParserOptions} from '@html-eslint/parser';
import {
  GLOB_ASTRO,
  GLOB_CSS,
  GLOB_EMBER_GLIMMER,
  GLOB_GRAPHQL,
  GLOB_HTM_HTML,
  GLOB_JSON,
  GLOB_JSON5,
  GLOB_JSONC,
  GLOB_MARKDOWN,
  GLOB_MDX,
  GLOB_RIPPLE,
  GLOB_SVELTE,
  GLOB_SVELTE_SCRIPT,
  GLOB_TOML,
  GLOB_TSRX,
  GLOB_TS_X,
  GLOB_VUE,
  GLOB_YML_YAML,
} from '../constants';
import type {EslintFlatConfigEntry} from '../eslint/eslint-types';
import {genFlatConfigEntryName, resolvePluginPrefix} from '../eslint/eslint-utils';
import {
  type LoadablePackagePrefix,
  type ParserPrefix,
  type PluginPrefix,
  generatePackageToLoadProperty,
} from '../loaders';
import type {ObjectValues} from '../types';
import {type MaybeArray, arrayUnique, arrayify, isObject, objectKeysUnsafe} from '../utils';
import {configRequestsTypeInformation, savePackagesToLoadFromConfig} from './config-utils';
import {
  type PackageRequester,
  type UnConfigContext,
  intersectParentConfigFilesWithProvidedFiles,
} from './shared';

/**
 * These file types are implicitly added to `ignores` array of every Config
 * unless the config set ups the parser for this language or opts out.
 */
export type ImplicitlyIgnoredFileTypeUnlessParsed =
  'css' | 'html' | 'json' | 'json5' | 'jsonc' | 'md' | 'mdx' | 'scss' | 'toml' | 'yaml';

type ParsingMechanism =
  | {
      language: [plugin: Exclude<PluginPrefix, ''>, languageName: string];
    }
  | {
      parser: ParserPrefix;
    }
  | {
      /**
       * A parser that ships inside a package we already load for other reasons
       */
      parserPackage: LoadablePackagePrefix;
    };

interface ParsingDialectDefinition {
  mechanism: ParsingMechanism;
  filesDefault: string[];
  ignoresExclusions?: ImplicitlyIgnoredFileTypeUnlessParsed[];
}

export interface ParsingLanguageDefinition {
  dialects: Record<string, ParsingDialectDefinition>;
  dialectDefault: string;
}

/**
 * The single source of truth for how every supported custom file type may be parsed.
 *
 * ⚠️ Languages declaration order matters: it is also the order the resulting flat config entries
 * are emitted in (later entries, if all matched, win).
 * Hence the general rule for this list: the more opt-in a language is, the later it goes
 */
export const PARSING_LANGUAGES = (
  identity as <
    Languages extends {
      [Key in keyof Languages]: {
        dialects: Record<string, ParsingDialectDefinition>;
        dialectDefault: keyof Languages[Key]['dialects'];
      };
    },
  >(
    languages: Languages,
  ) => Languages
)({
  // Must go first so that every framework whose files embed TypeScript can take the parsing over
  ts: {
    dialects: {
      ts: {
        mechanism: {parserPackage: 'typescriptEslintParser'},
        filesDefault: [GLOB_TS_X],
      },
    },
    dialectDefault: 'ts',
  },

  css: {
    dialects: {
      css: {
        mechanism: {language: ['css', 'css']},
        filesDefault: [GLOB_CSS],
        ignoresExclusions: ['css', 'scss'],
      },
    },
    dialectDefault: 'css',
  },

  jsonc: {
    dialects: {
      auto: {
        mechanism: {language: ['jsonc', 'x']},
        filesDefault: [GLOB_JSON, GLOB_JSONC, GLOB_JSON5],
        ignoresExclusions: ['json', 'jsonc', 'json5'],
      },
      json: {
        mechanism: {language: ['jsonc', 'json']},
        filesDefault: [GLOB_JSON],
        ignoresExclusions: ['json'],
      },
      jsonc: {
        mechanism: {language: ['jsonc', 'jsonc']},
        filesDefault: [GLOB_JSONC],
        ignoresExclusions: ['jsonc'],
      },
      json5: {
        mechanism: {language: ['jsonc', 'json5']},
        filesDefault: [GLOB_JSON5],
        ignoresExclusions: ['json5'],
      },
    },
    dialectDefault: 'auto',
  },

  json: {
    dialects: {
      json: {
        mechanism: {language: ['json', 'json']},
        filesDefault: [GLOB_JSON],
        ignoresExclusions: ['json'],
      },
      jsonc: {
        mechanism: {language: ['json', 'jsonc']},
        filesDefault: [GLOB_JSONC],
        ignoresExclusions: ['jsonc'],
      },
      json5: {
        mechanism: {language: ['json', 'json5']},
        filesDefault: [GLOB_JSON5],
        ignoresExclusions: ['json5'],
      },
    },
    dialectDefault: 'json',
  },

  yaml: {
    dialects: {
      yaml: {
        mechanism: {language: ['yaml', 'yaml']},
        filesDefault: [GLOB_YML_YAML],
        ignoresExclusions: ['yaml'],
      },
    },
    dialectDefault: 'yaml',
  },

  toml: {
    dialects: {
      toml: {
        mechanism: {language: ['toml', 'toml']},
        filesDefault: [GLOB_TOML],
        ignoresExclusions: ['toml'],
      },
    },
    dialectDefault: 'toml',
  },

  markdown: {
    dialects: {
      commonmark: {
        mechanism: {language: ['markdown', 'commonmark']},
        filesDefault: [GLOB_MARKDOWN],
        ignoresExclusions: ['md'],
      },
      gfm: {
        mechanism: {language: ['markdown', 'gfm']},
        filesDefault: [GLOB_MARKDOWN],
        ignoresExclusions: ['md'],
      },
      extendedSyntax: {
        mechanism: {language: ['markdown-preferences', 'extended-syntax']},
        filesDefault: [GLOB_MARKDOWN],
        ignoresExclusions: ['md'],
      },
    },
    dialectDefault: 'gfm',
  },

  html: {
    dialects: {
      html: {
        mechanism: {parser: '@html-eslint/parser'},
        filesDefault: [GLOB_HTM_HTML],
        ignoresExclusions: ['html'],
      },
    },
    dialectDefault: 'html',
  },

  mdx: {
    dialects: {
      mdx: {
        mechanism: {parser: 'mdx-eslint-parser'},
        filesDefault: [GLOB_MDX],
        ignoresExclusions: ['mdx'],
      },
    },
    dialectDefault: 'mdx',
  },

  vue: {
    dialects: {
      vue: {
        mechanism: {parser: 'vue-eslint-parser'},
        filesDefault: [GLOB_VUE],
      },
    },
    dialectDefault: 'vue',
  },

  svelte: {
    dialects: {
      svelte: {
        mechanism: {parser: 'svelte-eslint-parser'},
        // The parser reads the runes modules too, unlike the rules
        filesDefault: [GLOB_SVELTE, GLOB_SVELTE_SCRIPT],
      },
    },
    dialectDefault: 'svelte',
  },

  astro: {
    dialects: {
      astro: {
        mechanism: {parser: 'astro-eslint-parser'},
        filesDefault: [GLOB_ASTRO],
      },
    },
    dialectDefault: 'astro',
  },

  graphql: {
    dialects: {
      graphql: {
        mechanism: {parser: 'graphql-eslint-parser'},
        filesDefault: [GLOB_GRAPHQL],
      },
    },
    dialectDefault: 'graphql',
  },

  ember: {
    dialects: {
      ember: {
        mechanism: {parser: 'ember-eslint-parser'},
        filesDefault: [GLOB_EMBER_GLIMMER],
      },
    },
    dialectDefault: 'ember',
  },

  ripple: {
    dialects: {
      ripple: {
        mechanism: {parser: '@tsrx/eslint-parser'},
        filesDefault: [GLOB_TSRX, GLOB_RIPPLE],
      },
    },
    dialectDefault: 'ripple',
  },

  angularTemplate: {
    dialects: {
      angularTemplate: {
        mechanism: {parser: '@angular-eslint/template-parser'},
        filesDefault: [GLOB_HTM_HTML],
        ignoresExclusions: ['html'],
      },
    },
    dialectDefault: 'angularTemplate',
  },

  plain: {
    dialects: {
      plain: {
        mechanism: {parser: 'eslint-parser-plain'},
        filesDefault: [],
      },
    },
    dialectDefault: 'plain',
  },
});

export type ParsingLanguages = keyof typeof PARSING_LANGUAGES;

/**
 * A Config declares which language its rules are written for, optionally pinning a dialect.
 * The bare key form means "whatever dialect this language resolves to"
 */
export type ParsingLanguagesWithDialects = ObjectValues<{
  [Key in ParsingLanguages]:
    Key | [language: Key, dialect: keyof (typeof PARSING_LANGUAGES)[Key]['dialects']];
}>;

interface ParsingLanguageCustomOptions {
  css: CSSLanguageOptions;
  html: {parserOptions?: HtmlEslintParserOptions};
  markdown: MarkdownLanguageOptions;
  yaml: {parserOptions?: {defaultYAMLVersion?: '1.1' | '1.2'}};
}

interface ParsingEntry<Key extends ParsingLanguages = ParsingLanguages> {
  /**
   * Files parsed with this language.
   *
   * Defaults to the union of the `files` of every enabled Config whose rules target this language,
   * which keeps the set of linted files exactly what the enabled Configs asked for.
   * Providing it switches the entry to fully explicit mode
   */
  files?: string[];

  /**
   * Files excluded from this language.
   *
   * They are also added to the `ignores` of every Config targeting this language, which is what
   * makes a single entry here enough to stop ESLint from tripping over a file it cannot parse
   */
  ignores?: string[];

  /**
   * Which flavor of the language to parse with
   */
  dialect?: keyof (typeof PARSING_LANGUAGES)[Key]['dialects'];

  /**
   * Merged into the `languageOptions` of the emitted flat config entry
   */
  languageOptions?: Key extends keyof ParsingLanguageCustomOptions
    ? ParsingLanguageCustomOptions[Key]
    : EslintFlatConfigEntry['languageOptions'];
}

export type ParsingOptions = {
  [Key in ParsingLanguages]?: boolean | MaybeArray<ParsingEntry<Key>>;
};

export interface ParsingRequest {
  /**
   * - `writtenFor` - widens the language's files, and stops linting once it is turned off
   * - `splitOff` - follows the config it was split off from
   * - `runsOn` - only follows the `ignores`: another language may parse the same files
   * - `setUpOnly` - lints nothing, so it neither widens the files nor reacts to `false`
   */
  kind: 'writtenFor' | 'splitOff' | 'runsOn' | 'setUpOnly';

  /** The config to propagate the `ignores` to. A `setUpOnly` request should have none */
  config?: EslintFlatConfigEntry;

  dialect?: string;

  /** Merged into the emitted entry, underneath the user's own */
  languageOptions?: Record<string, unknown>;

  /**
   * Spread into the emitted entry, which is how a processor gets there.
   * Loosely typed because the lazy loading marker is spread in rather than assigned
   */
  entryProperties?: Record<string, unknown>;

  /**
   * Emits an entry of its own instead of merging in.
   * For handling only part of the parsed files can take, like the TypeScript project service
   */
  nameSuffix?: string;

  /** Defaults to the files the language parses. Only read alongside a name suffix */
  files?: string[];

  /** Only read alongside a name suffix */
  ignores?: string[];

  /** Filled in by the context the request came through */
  requestedBy?: PackageRequester;
}

interface ResolvedParsingEntry {
  dialect: string;

  /** What the packages the entry ends up needing are attributed to */
  requesters: PackageRequester[];
  files?: EslintFlatConfigEntry['files'];
  ignores?: string[];
  languageOptions?: object;
  entryProperties?: object;

  /** Requests asking for an entry of their own on top of this one */
  layers?: ParsingRequest[];

  /**
   * The entry only carries the `ignores` to propagate: no config entry is emitted for it
   */
  isDisabled?: boolean;
}

/** Several sources write into these at once, so they are merged rather than replaced */
const LANGUAGE_OPTIONS_MERGED_KEYS = ['parserOptions', 'globals'] as const;

const mergeLanguageOptions = (
  lower: Record<string, unknown>,
  higher: Record<string, unknown> | undefined,
) => {
  if (higher == null) {
    return lower;
  }

  return LANGUAGE_OPTIONS_MERGED_KEYS.reduce<Record<string, unknown>>(
    (result, key) => {
      const lowerValue = lower[key];
      const higherValue = higher[key];
      if (isObject(lowerValue) && isObject(higherValue)) {
        result[key] = {...lowerValue, ...higherValue};
      }
      return result;
    },
    {...lower, ...higher},
  );
};

const resolveEntriesForLanguage = (
  language: ParsingLanguages,
  // Indexing with the whole key union drops the per-language narrowing, gone once the language
  // stops being a literal
  option: ParsingOptions[ParsingLanguages],
  requests: ParsingRequest[],
): ResolvedParsingEntry[] => {
  const definition: ParsingLanguageDefinition = PARSING_LANGUAGES[language];

  if (option === false) {
    return [
      {dialect: definition.dialectDefault, requesters: [], ignores: ['**/*'], isDisabled: true},
    ];
  }

  const userEntries = option == null || typeof option === 'boolean' ? [] : arrayify(option);
  const dialectFromUser = userEntries.findLast((entry) => entry.dialect != null)?.dialect;

  const requestsByDialect = new Map<string, ParsingRequest[]>();
  const requestsRequiringLanguage = requests.filter(
    ({kind}) => kind === 'writtenFor' || kind === 'setUpOnly',
  );
  for (const request of requestsRequiringLanguage) {
    const dialect = dialectFromUser || request.dialect || definition.dialectDefault;
    requestsByDialect.set(dialect, [...(requestsByDialect.get(dialect) || []), request]);
  }

  const layersOfDialect = (dialect: string) =>
    (requestsByDialect.get(dialect) || []).filter(({nameSuffix}) => nameSuffix != null);

  const requestersOfDialect = (dialect: string) =>
    (requestsByDialect.get(dialect) || [])
      .map(({requestedBy}) => requestedBy)
      .filter((v) => v != null);

  const contributorsOfDialect = (dialect: string) =>
    (requestsByDialect.get(dialect) || []).filter(({nameSuffix}) => nameSuffix == null);

  // A Config without `files` contributes nothing rather than everything: an unscoped parser would
  // take the whole project over, and the language's own defaults are the closest safe answer
  const filesFromRequests = (dialect: string) => {
    const dialectRequests = contributorsOfDialect(dialect);
    const requestsWrittenForDialect = dialectRequests.filter(({kind}) => kind === 'writtenFor');
    const filesDefault = definition.dialects[dialect]?.filesDefault || [];
    const files: NonNullable<EslintFlatConfigEntry['files']> = [
      // Narrowing what a Config lints must not narrow what gets parsed
      ...(dialectRequests.some(({kind}) => kind === 'setUpOnly') ? filesDefault : []),
      ...requestsWrittenForDialect.flatMap(({config}) => config?.files || []),
    ];
    if (files.length === 0) {
      return filesDefault;
    }

    const seenFiles = new Set<string>();
    return files.filter((filesEntry) => {
      const key = JSON.stringify(filesEntry);
      const isSeen = seenFiles.has(key);
      seenFiles.add(key);
      return !isSeen;
    });
  };

  const languageOptionsFromRequests = (dialect: string) =>
    contributorsOfDialect(dialect).reduce<Record<string, unknown>>(
      (accumulated, {languageOptions}) => mergeLanguageOptions(accumulated, languageOptions),
      {},
    );

  const entryPropertiesFromRequests = (dialect: string) =>
    contributorsOfDialect(dialect).reduce<object>(
      (accumulated, {entryProperties}) => Object.assign(accumulated, entryProperties),
      {},
    );

  // Naming `files` anywhere makes every entry stand on its own; without it they are modifiers
  // applied to every dialect the Configs asked for
  if (userEntries.some((entry) => entry.files != null)) {
    // Naming `files` collapses the dialects, so the one the Configs asked for beats the default
    const [dialectRequested, ...otherDialectsRequested] = requestsByDialect.keys();
    const dialectFallback =
      dialectRequested && otherDialectsRequested.length === 0
        ? dialectRequested
        : definition.dialectDefault;

    return userEntries.map((entry) => {
      const dialect = entry.dialect || dialectFallback;
      return {
        dialect,
        requesters: requestersOfDialect(dialect),
        files: entry.files || filesFromRequests(dialect),
        ignores: entry.ignores,
        languageOptions: mergeLanguageOptions(
          languageOptionsFromRequests(dialect),
          entry.languageOptions,
        ),
        entryProperties: entryPropertiesFromRequests(dialect),
        layers: layersOfDialect(dialect),
      };
    });
  }

  const ignoresFromUser = arrayUnique(userEntries.flatMap((entry) => entry.ignores || []));
  const languageOptionsFromUser = userEntries.reduce<Record<string, unknown>>(
    (accumulated, entry) => mergeLanguageOptions(accumulated, entry.languageOptions),
    {},
  );

  const dialectsToEmit =
    requestsByDialect.size > 0
      ? Object.keys(definition.dialects).filter((dialect) => requestsByDialect.has(dialect))
      : // Nothing targets the language, so it is only set up when explicitly asked for
        option === true
        ? [dialectFromUser || definition.dialectDefault]
        : [];

  return dialectsToEmit.map((dialect) => ({
    dialect,
    requesters: requestersOfDialect(dialect),
    files: filesFromRequests(dialect),
    ignores: ignoresFromUser,
    languageOptions: mergeLanguageOptions(
      languageOptionsFromRequests(dialect),
      languageOptionsFromUser,
    ),
    entryProperties: entryPropertiesFromRequests(dialect),
    layers: layersOfDialect(dialect),
  }));
};

const CONFIG_NAME_COLLATOR = new Intl.Collator('en');

/** This must be the only place a language, a parser or a processor is ever assigned */
export const resolveParsingConfigs = (context: UnConfigContext) => {
  const parsingOptions = context.rootOptions.parsing || {};
  const resultConfigs: EslintFlatConfigEntry[] = [];
  const occurrences = new Map<string, number>();
  // The `ignores` are propagated only once every language has said which files it parses
  const resolved: {
    language: ParsingLanguages;
    requests: ParsingRequest[];
    entries: ResolvedParsingEntry[];
  }[] = [];

  for (const language of objectKeysUnsafe(PARSING_LANGUAGES)) {
    // Configs resolve concurrently, so request order differs between runs
    const requests = (context.parsingRequests.get(language) || []).toSorted(
      ({config: configA}, {config: configB}) =>
        CONFIG_NAME_COLLATOR.compare(configA?.name || '', configB?.name || ''),
    );
    const entries = resolveEntriesForLanguage(language, parsingOptions[language], requests);

    entries.forEach((entry) => {
      if (entry.isDisabled) {
        return;
      }

      // Nothing asked for any file, and an entry without `files` would claim all of them
      const entryFiles = entry.files;
      if (!entryFiles?.length) {
        return;
      }

      const {dialects}: ParsingLanguageDefinition = PARSING_LANGUAGES[language];
      const dialectDefinition = dialects[entry.dialect];
      /* v8 ignore next 3 -- the dialect is validated by the option types */
      if (!dialectDefinition) {
        return;
      }

      const {mechanism} = dialectDefinition;
      // Whoever provided a parser meant it, so the dialect's own is neither loaded nor assigned
      const hasParserAlready = isObject(entry.languageOptions) && 'parser' in entry.languageOptions;
      const languageOptions = {
        ...(!hasParserAlready &&
          'parserPackage' in mechanism &&
          generatePackageToLoadProperty('parser', mechanism.parserPackage)),
        ...entry.languageOptions,
      };
      const occurrenceKey = `${language}/${entry.dialect}`;
      const occurrence = occurrences.get(occurrenceKey) || 0;
      occurrences.set(occurrenceKey, occurrence + 1);

      const hasSingleDialect = Object.keys(PARSING_LANGUAGES[language].dialects).length === 1;

      const config: EslintFlatConfigEntry = {
        name: genFlatConfigEntryName(
          `parsing/${language}${hasSingleDialect ? '' : `/${entry.dialect}`}${occurrence > 0 ? `#${occurrence}` : ''}`,
        ),
        files: entryFiles,
        ...(entry.ignores?.length && {ignores: entry.ignores}),
        ...('language' in mechanism && {
          language: `${resolvePluginPrefix(context, mechanism.language[0])}/${mechanism.language[1]}`,
        }),
        ...entry.entryProperties,
        ...(Reflect.ownKeys(languageOptions).length > 0 && {languageOptions}),
      };

      const requesters: PackageRequester[] =
        entry.requesters.length > 0 ? entry.requesters : ['option:parsing'];

      if ('language' in mechanism) {
        context.registerUsedPlugin(mechanism.language[0], requesters);
      }
      if (!hasParserAlready && 'parser' in mechanism) {
        context.usedParsers.set(mechanism.parser, [
          ...(context.usedParsers.get(mechanism.parser) || []),
          config,
        ]);
        context.recordPackageRequester('parser', mechanism.parser, requesters);
      }

      savePackagesToLoadFromConfig(context, config, requesters);

      resultConfigs.push(config);

      entry.layers?.forEach((layer) => {
        const layerIgnores = arrayUnique([...(entry.ignores || []), ...(layer.ignores || [])]);
        const layerLanguageOptions = {...layer.languageOptions};
        // A layer only ever covers part of what the entry parses, so it cannot reach past it
        const layerFiles = layer.files?.length
          ? layer.files.every((glob) => entryFiles.includes(glob))
            ? layer.files
            : intersectParentConfigFilesWithProvidedFiles(entryFiles, layer.files)
          : entryFiles;
        const layerConfig: EslintFlatConfigEntry = {
          name: genFlatConfigEntryName(
            `parsing/${language}/${layer.nameSuffix}${occurrence > 0 ? `#${occurrence}` : ''}`,
          ),
          ...(layerFiles.length > 0 && {files: layerFiles}),
          ...(layerIgnores.length > 0 && {ignores: layerIgnores}),
          ...layer.entryProperties,
          ...(Reflect.ownKeys(layerLanguageOptions).length > 0 && {
            languageOptions: layerLanguageOptions,
          }),
        };

        const typeInfoIgnores = context.typeInfoRulesResolved.ignores;
        if (typeInfoIgnores?.length && configRequestsTypeInformation(layerConfig)) {
          layerConfig.ignores = [...(layerConfig.ignores || []), ...typeInfoIgnores];
        }

        savePackagesToLoadFromConfig(context, layerConfig, [layer.requestedBy || 'option:parsing']);

        resultConfigs.push(layerConfig);
      });
    });

    resolved.push({language, requests, entries});
  }

  const filesParsedByAnyLanguage = new Set(resultConfigs.flatMap(({files}) => files || []));

  for (const {language, requests, entries} of resolved) {
    const ignoresToPropagate = arrayUnique(entries.flatMap((entry) => entry.ignores || []));
    // A `runsOn` config may still be served by another language parsing the same files, so a
    // disabled language only keeps it off the files nothing is left to parse
    const ignoresToPropagateToInheritingConfigs = arrayUnique([
      ...entries.flatMap((entry) => (entry.isDisabled ? [] : entry.ignores || [])),
      ...(entries.some(({isDisabled}) => isDisabled)
        ? Object.values<ParsingDialectDefinition>(PARSING_LANGUAGES[language].dialects)
            .flatMap(({filesDefault}) => filesDefault)
            .filter((glob) => !filesParsedByAnyLanguage.has(glob))
        : []),
    ]);

    requests.forEach(({config, kind}) => {
      const ignores =
        kind === 'runsOn' ? ignoresToPropagateToInheritingConfigs : ignoresToPropagate;
      // A `setUpOnly` request has no config to keep off anything
      if (config && ignores.length > 0) {
        config.ignores = [...(config.ignores || []), ...ignores];
      }
    });
  }

  return resultConfigs;
};

export const createRequestParsing =
  (
    parsingRequests: UnConfigContext['parsingRequests'],
    requestedBy?: PackageRequester,
  ): UnConfigContext['requestParsing'] =>
  (language, request) => {
    parsingRequests.set(language, [
      ...(parsingRequests.get(language) || []),
      requestedBy ? {requestedBy, ...request} : request,
    ]);
  };
