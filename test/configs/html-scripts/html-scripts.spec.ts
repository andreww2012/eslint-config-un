import globals from 'globals';
import {GLOB_HTM_HTML} from '../../../src/constants';

const FIXTURES = {
  withEval: 'with-eval.html',
  functionCalledFromAnotherScript: 'function-called-from-another-script.html',
  moduleScriptDeclaringVariable: 'module-script-declaring-variable.html',
  underIndentedScript: 'under-indented-script.html',
  customScriptType: 'custom-script-type.html',
  scriptWithCdata: 'script-with-cdata.xhtml',
  imageWithoutAltAndEval: 'image-without-alt-and-eval.html',
  useStrictAndAwaitAsName: 'use-strict-and-await-as-name.html',
  htmlCodeBlockWithImport: 'html-code-block-with-import.md',
} as const;

const FILES = ['src/**/*.html'] as const;

describe('basic tests', () => {
  it('creates `html-scripts`, `html-scripts/all`, `html-scripts/classic` and `html-scripts/inside-markdown` eslint configs and loads `html-scripts` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('htmlScripts');

    const config = configResult.getConfigByUnPostfix('html-scripts');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.htm?(l)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);
    expect(config?.ignores).not.toContain(GLOB_HTM_HTML);
    expect(config?.processor).toBeDefined();

    const scriptsConfig = configResult.getConfigByUnPostfix('html-scripts/all');

    expect(scriptsConfig?.files).toMatchInlineSnapshot(
      '["**/*.*/+([0-9])_script-+([0-9]).?(m)js"]',
    );
    expect(scriptsConfig?.languageOptions?.['parser']).toMatchObject({
      meta: {name: 'eslint-plugin-un-html-scripts/parser'},
    });

    expect(configResult.getConfigByUnPostfix('html-scripts/classic')?.files).toMatchInlineSnapshot(
      '["**/*.*/+([0-9])_script-+([0-9]).js"]',
    );
    expect(
      configResult.getConfigByUnPostfix('html-scripts/inside-markdown')?.files,
    ).toMatchInlineSnapshot('["**/*.md?(x)/**/*.*/+([0-9])_script-+([0-9]).js"]');

    expect(configResult.getLoadedPlugin('html-scripts')).toBeDefined();
  });

  it('does not create `html-scripts`, `html-scripts/all`, `html-scripts/classic` and `html-scripts/inside-markdown` eslint configs and does not load `html-scripts` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({htmlScripts: false});

    expect(
      configResult.getConfigsByUnPostfix((configName) => configName.startsWith('html-scripts')),
    ).toBeEmpty();
    expect(configResult.getLoadedPlugin('html-scripts')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `html-scripts` eslint config', async () => {
      await expectConfigState({}, 'html-scripts', false);
    });

    it('creates `html-scripts` eslint config if explicitly enabled', async () => {
      await expectConfigState('htmlScripts', 'html-scripts', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `html-scripts` eslint config by default', async () => {
      await expectConfigState({}, 'html-scripts', true, 'default');
    });

    it('creates `html-scripts` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('htmlScripts', 'html-scripts', ['htmlScripts', true], 'default');
    });

    it('does not create `html-scripts` eslint config if explicitly disabled', async () => {
      await expectConfigState({htmlScripts: false}, 'html-scripts', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `html-scripts` eslint config', async () => {
      await expectConfigState({}, 'html-scripts', true, 'misc-enabled');
    });

    it('creates `html-scripts` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('htmlScripts', 'html-scripts', ['htmlScripts', true], 'misc-enabled');
    });

    it('does not create `html-scripts` eslint config if explicitly disabled', async () => {
      await expectConfigState({htmlScripts: false}, 'html-scripts', false, 'misc-enabled');
    });
  });
});

describe('linting the markup', () => {
  it('creates `parsing/html/html-scripts` eslint config passing the whole file on to the `html` config when it is enabled', async () => {
    const configResult = await computeEslintConfig({htmlScripts: true, html: true});

    const config = configResult.getConfigByUnPostfix('parsing/html/html-scripts');

    expect(config?.files).toMatchInlineSnapshot('["**/*.htm?(l)"]');
    expect(config?.processor).toBeDefined();
    expect(config?.processor).not.toBe(
      configResult.getConfigByUnPostfix('html-scripts')?.processor,
    );
  });

  it('does not create `parsing/html/html-scripts` eslint config when the `html` config is disabled', async () => {
    const configResult = await computeEslintConfig({htmlScripts: true, html: false});

    expect(configResult.getConfigByUnPostfix('parsing/html')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('parsing/html/html-scripts')).toBeUndefined();
  });

  it('only passes the files of the `html-scripts` eslint config on to the `html` config', async () => {
    const configResult = await computeEslintConfig({htmlScripts: {files: FILES}, html: true});

    expect(configResult.getConfigByUnPostfix('parsing/html/html-scripts')?.files).toStrictEqual([
      [GLOB_HTM_HTML, ...FILES],
    ]);
  });

  it('creates `parsing/angularTemplate/html-scripts` eslint config when the `angular` config is enabled', async () => {
    const configResult = await computeEslintConfig({htmlScripts: true, angular: true});

    expect(configResult.getConfigByUnPostfix('parsing/angularTemplate/html-scripts')).toBeDefined();
  });

  it('reports the problems of both the markup and the scripts when the `html` config is enabled', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true, html: true},
      FIXTURES.imageWithoutAltAndEval,
      import.meta.dirname,
    );

    expect(
      results[0]?.messages
        .filter(({ruleId}) => ruleId === 'no-eval' || ruleId === 'html/require-img-alt')
        .map(({ruleId, line}) => `${line}: ${ruleId}`),
    ).toMatchInlineSnapshot('["7: html/require-img-alt", "9: no-eval"]');
  });

  it('only reports the problems of the scripts when the `html` config is disabled', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true},
      FIXTURES.imageWithoutAltAndEval,
      import.meta.dirname,
    );

    expect(results[0]?.messages.map(({ruleId, line}) => `${line}: ${ruleId}`)).toStrictEqual([
      '9: no-eval',
    ]);
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('htmlScripts');

    expect(configResult.getRuleSeverities('html-scripts/all')).toMatchObject({
      'html-scripts/scope-sharing': 2,
    });
    expect(configResult.getRuleSeverities('html-scripts/classic')).toMatchObject({
      strict: 0,
    });
  });

  it("`strict` rule does not fire on `'use strict'` of a classic script", async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true},
      FIXTURES.useStrictAndAwaitAsName,
      import.meta.dirname,
    );

    expect(
      findLintMessageFromLintResults(results, FIXTURES.useStrictAndAwaitAsName, 'strict', {
        all: true,
      }),
    ).toBeEmpty();
  });

  it('correctly processes inline JS in HTML files (`no-eval` fires inside `<script>` tag when `js` config is enabled)', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true},
      FIXTURES.withEval,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.withEval, 'no-eval');

    expect(error?.message).toMatchInlineSnapshot('"`eval` can be harmful."');
  });

  it('correctly processes inline JS in HTML files when `html` config is enabled and autofix of its rules is disabled', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true, html: true},
      FIXTURES.withEval,
      {
        searchFixturesRelativeToPath: import.meta.dirname,
        un: {autofixDisabledGloballyFor: {rules: {'html/head-order': true}}},
      },
    );

    expect(
      findLintMessageFromLintResults(results, FIXTURES.withEval, 'no-eval')?.message,
    ).toMatchInlineSnapshot('"`eval` can be harmful."');
  });

  it('`html-scripts/scope-sharing` rule shares the global variables of classic scripts', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true},
      FIXTURES.functionCalledFromAnotherScript,
      import.meta.dirname,
    );

    expect(
      results[0]?.messages.filter(
        ({ruleId}) => ruleId === 'no-undef' || ruleId === 'no-unused-vars',
      ),
    ).toStrictEqual([]);
  });

  it('lints module scripts as modules, which do not share their declarations', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true},
      FIXTURES.moduleScriptDeclaringVariable,
      import.meta.dirname,
    );

    expect(
      results[0]?.messages.map(({ruleId, line, message}) => `${line}: ${ruleId} ${message}`),
    ).toMatchInlineSnapshot(
      `["10: no-unused-vars 'formatted' is assigned a value but never used.", "13: no-undef 'formatted' is not defined."]`,
    );
  });

  it('lints `import` statements of classic scripts inside HTML code blocks of Markdown files', async () => {
    const results = await testEslintConfig(
      {htmlScripts: true, js: true, markdown: true},
      FIXTURES.htmlCodeBlockWithImport,
      import.meta.dirname,
    );

    expect(results[0]?.messages.map(({ruleId, line}) => `${line}: ${ruleId}`)).toStrictEqual([
      '7: eqeqeq',
    ]);
  });
});

describe('un options', () => {
  const SCRIPTS_CONFIG_NAMES = [
    'html-scripts/all',
    'html-scripts/classic',
    'html-scripts/inside-markdown',
  ] as const;

  describe('option: `files`', () => {
    it('uses user-provided `files` in `html-scripts` eslint config', async () => {
      const configResult = await computeEslintConfig({htmlScripts: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('html-scripts')?.files).toStrictEqual(FILES);
    });

    it('does not apply user-provided `files` to the eslint configs of the scripts', async () => {
      const configResult = await computeEslintConfig({htmlScripts: {files: FILES}});

      SCRIPTS_CONFIG_NAMES.forEach((configName) => {
        expect(configResult.getConfigByUnPostfix(configName)?.files).not.toIncludeAnyMembers(FILES);
      });
    });

    it('disables all `html-scripts` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({htmlScripts: {files: []}});

      expect(
        configResult.getConfigsByUnPostfix((configName) => configName.includes('html-scripts')),
      ).toBeEmpty();
    });
  });

  describe('option: `ignores`', () => {
    const IGNORES = ['**/fixtures/**'] as const;

    it('uses user-provided `ignores` in `html-scripts` eslint config and merges them with defaults', async () => {
      const configResult = await computeEslintConfig({htmlScripts: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('html-scripts')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('does not apply user-provided `ignores` to the eslint configs of the scripts', async () => {
      const configResult = await computeEslintConfig({htmlScripts: {ignores: IGNORES}});

      SCRIPTS_CONFIG_NAMES.forEach((configName) => {
        expect(configResult.getConfigByUnPostfix(configName)?.ignores).not.toIncludeAnyMembers(
          IGNORES,
        );
      });
    });

    it('applies user-provided `ignores` to `parsing/html/html-scripts` eslint config', async () => {
      const configResult = await computeEslintConfig({
        htmlScripts: {ignores: IGNORES},
        html: true,
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/html/html-scripts')?.ignores,
      ).toIncludeAllMembers(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `html-scripts/all` eslint config', async () => {
    const configResult = await computeEslintConfig({
      htmlScripts: {
        overrides: {'html-scripts/scope-sharing': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('html-scripts/all')).toMatchObject({
      'html-scripts/scope-sharing': 0,
      'no-console': 0,
    });
  });
});

describe('options', () => {
  const BAD_INDENTATION_RULE_ID = '(html-scripts)';

  describe('option: `languageOptions`', () => {
    it('includes browser globals when option is not set', async () => {
      const configResult = await computeEslintConfig('htmlScripts');

      expect(
        configResult.getConfigByUnPostfix('html-scripts/all')?.languageOptions?.['globals'],
      ).toStrictEqual(globals.browser);
    });

    it('parses classic scripts as scripts when option is not set', async () => {
      const results = await testEslintConfig(
        {htmlScripts: true, js: true},
        FIXTURES.useStrictAndAwaitAsName,
        import.meta.dirname,
      );

      expect(results[0]?.messages.filter(({fatal}) => fatal)).toStrictEqual([]);
    });

    it('merges user-provided `languageOptions`', async () => {
      const GLOBALS = Object.freeze({myGlobal: 'readonly'} as const);

      const configResult = await computeEslintConfig({
        htmlScripts: {languageOptions: {globals: GLOBALS, ecmaVersion: 2020}},
      });

      expect(configResult.getConfigByUnPostfix('html-scripts/all')?.languageOptions).toMatchObject({
        globals: GLOBALS,
        ecmaVersion: 2020,
        parser: {meta: {name: 'eslint-plugin-un-html-scripts/parser'}},
      });
    });

    it('parses every script, module ones included, with the user-provided `sourceType`', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {languageOptions: {sourceType: 'script'}}, js: true},
        FIXTURES.moduleScriptDeclaringVariable,
        import.meta.dirname,
      );

      expect(
        results[0]?.messages.filter(({fatal}) => fatal).map(({message}) => message),
      ).toMatchInlineSnapshot(
        `["Parsing error: 'import' and 'export' may appear only with 'sourceType: module'"]`,
      );
    });

    it('does not create `html-scripts/classic` eslint config when `sourceType` is set', async () => {
      const configResult = await computeEslintConfig({
        htmlScripts: {languageOptions: {sourceType: 'module'}},
      });

      expect(configResult.getConfigByUnPostfix('html-scripts/classic')).toBeUndefined();
    });

    it('uses the user-provided `parser` instead of its own', async () => {
      const PARSER = Object.freeze({
        meta: {name: 'custom-parser'},
        parse: () => ({type: 'Program', body: [], sourceType: 'script'}),
      });

      const configResult = await computeEslintConfig({
        htmlScripts: {languageOptions: {parser: PARSER}},
      });

      expect(
        configResult.getConfigByUnPostfix('html-scripts/all')?.languageOptions?.['parser'],
      ).toBe(PARSER);
    });
  });

  describe('option: `reportBadIndent`', () => {
    it('does not report the lines less indented than the script when option is not set', async () => {
      const results = await testEslintConfig(
        {htmlScripts: true},
        FIXTURES.underIndentedScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.underIndentedScript,
          BAD_INDENTATION_RULE_ID,
          {all: true},
        ),
      ).toBeEmpty();
    });

    it('does not report the lines less indented than the script by default', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {reportBadIndent: 'off'}},
        FIXTURES.underIndentedScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.underIndentedScript,
          BAD_INDENTATION_RULE_ID,
          {all: true},
        ),
      ).toBeEmpty();
    });

    it.each([
      ['warn', 1],
      ['error', 2],
    ] as const)(
      'reports the lines less indented than the script when option is `%s`',
      async (reportBadIndent, severity) => {
        const results = await testEslintConfig(
          {htmlScripts: {reportBadIndent}},
          FIXTURES.underIndentedScript,
          import.meta.dirname,
        );

        expect(
          findLintMessageFromLintResults(
            results,
            FIXTURES.underIndentedScript,
            BAD_INDENTATION_RULE_ID,
            {all: true},
          ).map(({line, message, severity: messageSeverity}) => ({
            line,
            message,
            severity: messageSeverity,
          })),
        ).toStrictEqual([{line: 9, message: 'Bad line indentation.', severity}]);
      },
    );
  });

  describe('option: `indent`', () => {
    it('takes the indentation of the first line of the script when option is not set', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {reportBadIndent: 'error'}},
        FIXTURES.underIndentedScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.underIndentedScript,
          BAD_INDENTATION_RULE_ID,
          {all: true},
        ).map(({line}) => line),
      ).toStrictEqual([9]);
    });

    it('expects the given indentation when option is `4`', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {reportBadIndent: 'error', indent: 4}},
        FIXTURES.underIndentedScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.underIndentedScript,
          BAD_INDENTATION_RULE_ID,
          {all: true},
        ).map(({line}) => line),
      ).toStrictEqual([8]);
    });

    it('expects the indentation relative to the `<script>` tag when option is `+2`', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {reportBadIndent: 'error', indent: '+2'}},
        FIXTURES.underIndentedScript,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(
          results,
          FIXTURES.underIndentedScript,
          BAD_INDENTATION_RULE_ID,
          {all: true},
        ).map(({line}) => line),
      ).toStrictEqual([9]);
    });
  });

  describe('option: `scriptTags`', () => {
    it('lints the scripts of JavaScript types only when option is not set', async () => {
      const results = await testEslintConfig(
        {htmlScripts: true, js: true},
        FIXTURES.customScriptType,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.customScriptType, 'no-eval', {
          all: true,
        }).map(({line}) => line),
      ).toStrictEqual([11]);
    });

    it('only lints the tags matching the given selectors', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {scriptTags: [{match: 'script[type="text/x-custom"]'}]}, js: true},
        FIXTURES.customScriptType,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.customScriptType, 'no-eval', {
          all: true,
        }).map(({line}) => line),
      ).toStrictEqual([8]);
    });
  });

  describe('option: `xmlExtensions`', () => {
    it('parses `.xhtml` files as XML when option is not set', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {files: ['**/*.xhtml']}, js: true},
        FIXTURES.scriptWithCdata,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.scriptWithCdata, 'no-eval')?.message,
      ).toMatchInlineSnapshot('"`eval` can be harmful."');
    });

    it('parses `.xhtml` files as HTML when option is `[]`', async () => {
      const results = await testEslintConfig(
        {htmlScripts: {files: ['**/*.xhtml'], xmlExtensions: []}, js: true},
        FIXTURES.scriptWithCdata,
        import.meta.dirname,
      );

      expect(
        findLintMessageFromLintResults(results, FIXTURES.scriptWithCdata, 'no-eval')?.message,
      ).toMatchInlineSnapshot('"Parsing error: Unexpected token <"');
    });
  });
});
