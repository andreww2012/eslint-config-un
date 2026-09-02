import {
  GLOB_CSS,
  GLOB_JSON,
  GLOB_RIPPLE,
  GLOB_SCSS,
  GLOB_TSRX,
  GLOB_VUE,
  GLOB_YML_YAML,
} from '../../src/constants';

const IGNORES = ['vendor/**', '**/*.generated.css'];

describe('option: `parsing`', () => {
  describe('emitted config entries', () => {
    it('assigns the language in a single config entry of its own', async () => {
      const configResult = await computeEslintConfig('css');

      const config = configResult.getConfigByUnPostfix('parsing/css');

      expect(config?.language).toBe('css/css');
      expect(config?.files).toStrictEqual([GLOB_CSS]);
    });

    it('does not assign the language on the config holding the rules', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getConfigByUnPostfix('css')?.language).toBeUndefined();
    });

    it('does not create an entry for a language no enabled config targets', async () => {
      const configResult = await computeEslintConfig('css');

      expect(configResult.getConfigByUnPostfix('parsing/yaml')).toBeUndefined();
    });

    it('creates an entry for a language no enabled config targets when set to `true`', async () => {
      const configResult = await computeEslintConfig('css', {un: {parsing: {yaml: true}}});

      const config = configResult.getConfigByUnPostfix('parsing/yaml');

      expect(config?.language).toBe('yaml/yaml');
      expect(config?.files).toStrictEqual([GLOB_YML_YAML]);
    });

    it('creates one entry per dialect the enabled configs ask for', async () => {
      const configResult = await computeEslintConfig({markdown: true, markdownLinks: true});

      expect(configResult.getConfigByUnPostfix('parsing/markdown/gfm')?.language).toBe(
        'markdown/gfm',
      );
      expect(configResult.getConfigByUnPostfix('parsing/markdown/commonmark')?.language).toBe(
        'markdown/commonmark',
      );
    });

    it('collapses every dialect into the requested one when `dialect` is set', async () => {
      const configResult = await computeEslintConfig(
        {markdown: true, markdownLinks: true},
        {un: {parsing: {markdown: {dialect: 'commonmark'}}}},
      );

      expect(configResult.getConfigByUnPostfix('parsing/markdown/commonmark')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('parsing/markdown/gfm')).toBeUndefined();
    });
  });

  describe('option: `files`', () => {
    it('defaults to the union of the files of the configs targeting the language', async () => {
      addInstalledPackages({sass: '1.80.0'});

      const configResult = await computeEslintConfig('css');

      expect(configResult.getConfigByUnPostfix('parsing/css')?.files).toStrictEqual([
        GLOB_CSS,
        GLOB_SCSS,
      ]);
    });

    it('replaces the derived files when provided', async () => {
      const FILES = ['styles/**/*.css'];

      const configResult = await computeEslintConfig('css', {un: {parsing: {css: {files: FILES}}}});

      expect(configResult.getConfigByUnPostfix('parsing/css')?.files).toStrictEqual(FILES);
    });

    it('falls back to the default globs when the configs asking for the language name none', async () => {
      addInstalledPackages({vue: '3.5.0'});

      // Only `vue/block-lang` is left on, and that Sub-config carries no `files` of its own
      const configResult = await computeEslintConfig({
        vue: {configEnforceTypescriptInScriptSection: {ignores: ['a/**']}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/vue')?.files).toContain(GLOB_VUE);
    });

    it('gives an array entry without `files` the derived union rather than the default globs', async () => {
      addInstalledPackages({sass: '1.80.0'});

      const configResult = await computeEslintConfig('css', {
        un: {parsing: {css: [{}, {files: ['b/**']}]}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/css')?.files).toStrictEqual([
        GLOB_CSS,
        GLOB_SCSS,
      ]);
    });
  });

  describe('option: `ignores`', () => {
    it('adds the patterns to the entry itself', async () => {
      const configResult = await computeEslintConfig('css', {
        un: {parsing: {css: {ignores: IGNORES}}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/css')?.ignores).toStrictEqual(IGNORES);
    });

    it('adds the patterns to every config targeting the language', async () => {
      const configResult = await computeEslintConfig(
        {css: true, unicorn: true},
        {un: {parsing: {css: {ignores: IGNORES}}}},
      );

      expect(configResult.getConfigByUnPostfix('css')?.ignores).toIncludeAllMembers(IGNORES);
      expect(configResult.getConfigByUnPostfix('unicorn/css')?.ignores).toIncludeAllMembers(
        IGNORES,
      );
    });

    it('adds the patterns to the configs merely running on top of the language', async () => {
      const configResult = await computeEslintConfig(
        {markdown: true, unicorn: true},
        {un: {parsing: {markdown: {ignores: IGNORES}}}},
      );

      expect(configResult.getConfigByUnPostfix('unicorn/markdown')?.ignores).toIncludeAllMembers(
        IGNORES,
      );
    });

    it("keeps one array entry's patterns off its siblings, and out of the configs twice", async () => {
      const configResult = await computeEslintConfig('css', {
        un: {parsing: {css: [{ignores: ['a/**']}, {files: ['b/**']}]}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/css#1')?.ignores).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('css')?.ignores?.filter((glob) => glob === 'a/**'),
      ).toStrictEqual(['a/**']);
    });
  });

  describe('collapsing the dialects', () => {
    it('follows the dialect the configs asked for when `files` is specified without one', async () => {
      const configResult = await computeEslintConfig('markdownLinks', {
        un: {parsing: {markdown: [{files: ['docs/**']}]}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/markdown/commonmark')?.files).toStrictEqual(
        ['docs/**'],
      );
      expect(configResult.getConfigByUnPostfix('parsing/markdown/gfm')).toBeUndefined();
    });

    it('falls back to the default dialect when the configs asked for several', async () => {
      const configResult = await computeEslintConfig(
        {markdown: true, markdownLinks: true},
        {un: {parsing: {markdown: [{files: ['docs/**']}]}}},
      );

      expect(configResult.getConfigByUnPostfix('parsing/markdown/gfm')).toBeDefined();
      expect(configResult.getConfigByUnPostfix('parsing/markdown/commonmark')).toBeUndefined();
    });
  });

  describe('option: `languageOptions`', () => {
    it('merges the provided options into the emitted entry', async () => {
      const configResult = await computeEslintConfig('css', {
        un: {parsing: {css: {languageOptions: {tolerant: true}}}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/css')?.languageOptions).toStrictEqual({
        tolerant: true,
      });
    });

    it('takes what the configs contribute, so the entry shows the whole parser setup', async () => {
      addInstalledPackages({vue: '3.5.0', typescript: '5.9.0'});

      const configResult = await computeEslintConfig({vue: true, ts: true});

      const languageOptions = configResult.getConfigByUnPostfix('parsing/vue')?.languageOptions;

      // The parser reading the file, and the one taking its `<script>` blocks
      expect(languageOptions?.['parser']).toBeDefined();
      expect(languageOptions?.['parserOptions']).toMatchObject({sourceType: 'module'});
      expect(
        (languageOptions?.['parserOptions'] as Record<string, unknown>)['parser'],
      ).toBeDefined();
    });

    it('lets the user override what a config contributed', async () => {
      addInstalledPackages({vue: '3.5.0', typescript: '5.9.0'});

      const configResult = await computeEslintConfig(
        {vue: true, ts: true},
        {un: {parsing: {vue: {languageOptions: {parserOptions: {sourceType: 'script'}}}}}},
      );

      const parserOptions = configResult.getConfigByUnPostfix('parsing/vue')?.languageOptions?.[
        'parserOptions'
      ] as Record<string, unknown> | undefined;

      expect(parserOptions?.['sourceType']).toBe('script');
      // What the config contributed survives the override
      expect(parserOptions?.['parser']).toBeDefined();
    });
  });

  describe('option: `languageOptions.parser`', () => {
    it.each(['vue', 'ts'] as const)(
      'replaces the parser the `%s` dialect would have picked',
      async (language) => {
        addInstalledPackages({vue: '3.5.0', typescript: '5.9.0'});
        const PARSER = {parseForESLint: () => ({})};

        const configResult = await computeEslintConfig(
          {vue: true, ts: true},
          {un: {parsing: {[language]: {languageOptions: {parser: PARSER}}}}},
        );

        expect(
          configResult.getConfigByUnPostfix(`parsing/${language}`)?.languageOptions?.['parser'],
        ).toBe(PARSER);
      },
    );

    it('is assigned from the dialect when none is provided', async () => {
      addInstalledPackages({vue: '3.5.0', typescript: '5.9.0'});

      const configResult = await computeEslintConfig({vue: true, ts: true});

      expect(
        configResult.getConfigByUnPostfix('parsing/vue')?.languageOptions?.['parser'],
      ).toBeDefined();
      expect(
        configResult.getConfigByUnPostfix('parsing/ts')?.languageOptions?.['parser'],
      ).toBeDefined();
    });
  });

  describe('a config asking for a language without linting it', () => {
    it('sets the language up over the files it parses by default', async () => {
      addInstalledPackages({'@tsrx/core': '0.1.64'});

      const configResult = await computeEslintConfig('tsrx');

      // It also lints plain `.js`/`.ts`, which must not reach the parser
      expect(configResult.getConfigByUnPostfix('parsing/tsrx')?.files).toStrictEqual([
        '**/*.tsrx',
        '**/*.ripple',
      ]);
      expect(configResult.getConfigByUnPostfix('tsrx')?.files).toContain('**/*.?([cm])[jt]s');
    });

    it('emits no entry once the config asking for it is disabled', async () => {
      addInstalledPackages({'@tsrx/core': '0.1.64'});

      const configResult = await computeEslintConfig({tsrx: false});

      expect(configResult.getConfigByUnPostfix('parsing/tsrx')).toBeUndefined();
    });
  });

  describe('disabling a language', () => {
    it('emits no entry, and keeps the config written for it off every file', async () => {
      const configResult = await computeEslintConfig('markdown', {
        un: {parsing: {markdown: false}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/markdown/gfm')).toBeUndefined();
      expect(configResult.getConfigByUnPostfix('markdown/markdown')?.ignores).toContain('**/*');
    });

    it('reaches every config written for it, not only the one that declared the language', async () => {
      const configResult = await computeEslintConfig({vue: true}, {un: {parsing: {vue: false}}});

      for (const configName of ['vue', 'vue/a11y', 'vue/scoped-css'] as const) {
        expect(configResult.getConfigByUnPostfix(configName)?.ignores).toContain('**/*');
      }
    });

    it('reaches the configs holding the rules, not only the ones setting the parser up', async () => {
      addInstalledPackages({typescript: '5.9.0'});

      const configResult = await computeEslintConfig(
        {ts: true, jsdoc: true},
        {
          un: {parsing: {ts: false}},
        },
      );

      // Leaving these on would lint files nothing can parse
      for (const configName of [
        'ts/non-type-aware/rules',
        'ts/type-aware/rules',
        'ts/overrides',
        'jsdoc/ts',
      ] as const) {
        expect(configResult.getConfigByUnPostfix(configName)?.ignores).toContain('**/*');
      }
    });

    it('leaves the configs merely running on top of the language alone', async () => {
      const configResult = await computeEslintConfig(
        {unicorn: true, jsonc: true},
        {un: {parsing: {json: false}}},
      );

      const ignores = configResult.getConfigByUnPostfix('unicorn/json')?.ignores;

      expect(ignores).not.toContain('**/*');
      // `jsonc` still parses them
      expect(ignores).not.toContain(GLOB_JSON);
    });

    it('keeps them off the files once no other language is left to parse those', async () => {
      const configResult = await computeEslintConfig(
        {unicorn: true, json: true},
        {un: {parsing: {json: false}}},
      );

      expect(configResult.getConfigByUnPostfix('unicorn/json')?.ignores).toIncludeAllMembers([
        GLOB_JSON,
      ]);
    });

    it('reaches a config that asked for the language without linting it', async () => {
      addInstalledPackages({'@tsrx/core': '0.1.64'});

      const configResult = await computeEslintConfig({tsrx: true}, {un: {parsing: {tsrx: false}}});

      // It keeps linting plain `.js`/`.ts`, which needs no TSRX parser
      expect(configResult.getConfigByUnPostfix('tsrx')?.ignores).toIncludeAllMembers([
        GLOB_TSRX,
        GLOB_RIPPLE,
      ]);
      expect(configResult.getConfigByUnPostfix('tsrx')?.ignores).not.toContain('**/*');
    });
  });

  describe('cascade position', () => {
    it('places the entries after the config holding the rules, so that nothing overrides them', async () => {
      const configResult = await computeEslintConfig('markdown');
      const configNames = configResult.config.map(({name}) => name);

      expect(configNames.indexOf('eslint-config-un/parsing/markdown/gfm')).toBeGreaterThan(
        configNames.indexOf('eslint-config-un/markdown/markdown'),
      );
    });

    it('places the entries before the user provided configs, which stay able to override them', async () => {
      const configResult = await computeEslintConfig('markdown', {
        un: {extraConfigs: [{name: 'own', files: ['**/*.md'], rules: {}}]},
      });
      const configNames = configResult.config.map(({name}) => name);

      expect(configNames.indexOf('eslint-config-un/parsing/markdown/gfm')).toBeLessThan(
        configNames.indexOf('eslint-config-un/extra-config/own'),
      );
    });

    it('lets a framework parser win over the one TypeScript sets up for the same files', async () => {
      const configResult = await computeEslintConfig({vue: true, ts: true});
      const configNames = configResult.config.map(({name}) => name);

      expect(configNames.indexOf('eslint-config-un/parsing/ts')).toBeLessThan(
        configNames.indexOf('eslint-config-un/parsing/vue'),
      );
      // Both claim the vue files, so the later entry wins
      expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).toIncludeAllMembers([
        '**/*.vue',
      ]);
      expect(
        configResult.getConfigByUnPostfix('parsing/vue')?.languageOptions?.['parser'],
      ).toBeDefined();
    });
  });
});
