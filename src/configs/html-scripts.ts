import type * as Eslint from 'eslint';
import globals from 'globals';
import type {ParsingLanguages} from '../config-un/parsing';
import {
  ERROR,
  GLOB_HTML_CLASSIC_SCRIPTS,
  GLOB_HTML_SCRIPTS,
  GLOB_HTM_HTML,
  OFF,
} from '../constants';
import {generatePackageToLoadProperty} from '../loaders';
import type {HtmlProcessorOptions} from '../plugin-html-scripts';
import {allUnionMembers, pick} from '../utils';
import {
  type ExtraPluginsType,
  type UnFlatConfigEntryBase,
  assignDefaults,
  defineUnConfig,
} from './index';

type ProcessorOptionKey = 'indent' | 'reportBadIndent' | 'scriptTags' | 'xmlExtensions';

const PROCESSOR_OPTION_KEYS = allUnionMembers<ProcessorOptionKey, {readonly: true}>()([
  'indent',
  'reportBadIndent',
  'scriptTags',
  'xmlExtensions',
]);

// ESLint only copies `sourceType` to `parserOptions` for espree, and the global setup puts `module`
// there
const generateSourceTypeOptions = (sourceType: Eslint.Linter.SourceType) => ({
  sourceType,
  parserOptions: {sourceType},
});

// They parse HTML files as a whole, so the processor passes the whole file on to them too
const LANGUAGES_PARSING_HTML_FILES: readonly ParsingLanguages[] = [
  'html',
  'angularTemplate',
  'plain',
];

const generateProcessorProperty = (processorOptions: HtmlProcessorOptions) =>
  generatePackageToLoadProperty('processor', 'htmlScriptsProcessorFactory', {
    valueTransformFn: {
      fn(this: HtmlProcessorOptions, {htmlScriptsProcessorFactory: createProcessor}) {
        return createProcessor(this);
      },
      scope: processorOptions,
    },
  });

/**
 * Lints the JavaScript inside `<script>` tags of HTML files, each tag as a virtual file named after
 * the HTML file: `index.html/0_script-0.js` for a classic script (one without `type="module"`),
 * `index.html/1_script-1.mjs` for a module one.
 *
 * 📁 Default `files`: <code>**&#47;*.{htm,html}</code>
 */
export interface HtmlScriptsEslintConfigOptions<ExtraPlugins extends ExtraPluginsType = never>
  extends
    UnFlatConfigEntryBase<ExtraPlugins, 'html-scripts'>,
    Pick<HtmlProcessorOptions, ProcessorOptionKey> {
  /**
   * Language options of the scripts, merged with the default.
   *
   * Unless `sourceType` is specified here, classic scripts are parsed as scripts, and module ones
   * (`<script type="module">`) as modules.
   *
   * To parse the scripts with another parser, set it in `parserOptions.parser`: `parser` itself
   * must stay the one this Config sets, otherwise classic scripts don't see the global variables
   * of the previous ones
   * @default {globals: <browser globals>}
   */
  languageOptions?: Eslint.Linter.LanguageOptions;
}

export default defineUnConfig<HtmlScriptsEslintConfigOptions>('htmlScripts', {
  enabledBy: true,
  // Turns off the `strict` rule of the `js` config in classic scripts, so we must win
  after: ['js'],
})((context, optionsRaw) => {
  const optionsResolved = assignDefaults(optionsRaw, {});

  const {languageOptions} = optionsResolved;
  const processorOptions: HtmlProcessorOptions = pick(optionsResolved, PROCESSOR_OPTION_KEYS);

  const configBuilder = context.createConfigBuilder(optionsResolved, 'html-scripts');

  const processorConfig = configBuilder?.addConfig(
    [
      'html-scripts',
      {
        filesDefault: [GLOB_HTM_HTML],
        parsingIgnoresInheritedFrom: ['html'],
      },
    ],
    // @ts-expect-error Type '{ [packageToLoadSymbol]: ...' has no properties in common with type 'FlatConfigEntryForBuilder'
    generateProcessorProperty(processorOptions),
  ).config;

  if (processorConfig) {
    LANGUAGES_PARSING_HTML_FILES.forEach((language) => {
      context.requestParsing(language, {
        kind: 'augments',
        nameSuffix: 'html-scripts',
        files: processorConfig.files,
        ignores: processorConfig.ignores,
        entryProperties: generateProcessorProperty({...processorOptions, lintMarkup: true}),
      });
    });
  }

  configBuilder
    ?.addConfig(
      [
        'html-scripts/all',
        {
          // The user's `files` and `ignores` target the HTML files, not the scripts' virtual files
          applyUserFilesAndIgnores: false,
          filesDefault: [GLOB_HTML_SCRIPTS],
        },
      ],
      {
        languageOptions: {
          // JS is not one of the languages `parsing` sets up, so the parser is set here
          ...(languageOptions?.parser == null &&
            generatePackageToLoadProperty('parser', 'htmlScriptsParser')),
          globals: {
            ...globals.browser,
          },
          ...languageOptions,
          ...(languageOptions?.sourceType && {
            parserOptions: {
              ...languageOptions.parserOptions,
              sourceType: languageOptions.sourceType,
            },
          }),
        },
      },
    )
    .addRule('scope-sharing', ERROR) /** @since 1.0.0 */
    .addOverrides();

  if (languageOptions?.sourceType == null) {
    configBuilder
      ?.addConfig(
        [
          'html-scripts/classic',
          {applyUserFilesAndIgnores: false, filesDefault: [GLOB_HTML_CLASSIC_SCRIPTS]},
        ],
        {
          languageOptions: generateSourceTypeOptions('script'),
        },
      )
      // Run as scripts: dropping the directive would turn sloppy mode on
      .addAnyRule('', 'strict', OFF);
  }

  configBuilder?.addConfig(
    [
      'html-scripts/inside-markdown',
      {
        applyUserFilesAndIgnores: false,
        filesDefault: [`**/*.md?(x)/${GLOB_HTML_CLASSIC_SCRIPTS}`],
      },
    ],
    {
      // Allows `import` statements
      languageOptions: generateSourceTypeOptions('module'),
    },
  );
});
