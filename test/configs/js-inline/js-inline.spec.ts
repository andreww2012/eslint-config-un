import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  withEval: 'with-eval.html',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('jsInline');

  it('loads `html` plugin if used', () => {
    expect(configResult.getConfigByUnPostfix('js-inline')?.plugins?.['html']).toBeDefined();
  });

  it('creates `js-inline` and `js-inline/js-inside-html-inside-markdown` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('js-inline')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `js-inline` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeUndefined();
    });

    it('creates `js-inline` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('jsInline');

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `js-inline` eslint config by default', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeDefined();
    });

    it('creates `js-inline` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig('jsInline', {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`jsInline\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `js-inline` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({jsInline: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `js-inline` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeDefined();
    });
  });

  it('has default `files` in `js-inline` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('js-inline')?.files).toMatchInlineSnapshot(
      `["**/*.htm?(l)"]`,
    );
  });

  it('has default `ignores` in `js-inline` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix('js-inline')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members(['**/*.htm?(l)']);
  });

  it('has default `files` in `js-inline/js-inside-html-inside-markdown` eslint config', () => {
    expect(
      configResult.getConfigByUnPostfix('js-inline/js-inside-html-inside-markdown')?.files,
    ).toMatchInlineSnapshot(`["**/*.md/**/*.htm?(l)"]`);
  });

  it('has default `ignores` in `js-inline/js-inside-html-inside-markdown` eslint config', () => {
    const ignores = configResult.getConfigByUnPostfix(
      'js-inline/js-inside-html-inside-markdown',
    )?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members(['**/*.htm?(l)']);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('jsInline');

  it('has no plugin-specific rules', () => {
    expect(configResult.getConfigByUnPostfix('js-inline')?.rules).toStrictEqual({});
  });

  it('correctly processes inline JS in HTML files (`no-eval` fires inside `<script>` tag when `js` config is enabled)', async () => {
    const results = await testEslintConfig(
      {jsInline: true, js: true},
      FIXTURES.withEval,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.withEval, 'no-eval');

    expect(error?.message).toMatchInlineSnapshot(`"eval can be harmful."`);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `js-inline` eslint config', async () => {
      const FILES = ['src/**/*.html'];
      const configResult = await computeEslintConfig({
        jsInline: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('js-inline')?.files).toStrictEqual(FILES);
    });

    it('disables `js-inline` and `js-inline/js-inside-html-inside-markdown` eslint configs when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        jsInline: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('js-inline/js-inside-html-inside-markdown'),
      ).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `js-inline` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        jsInline: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('js-inline')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('does not propagate user `ignores` to `js-inline/js-inside-html-inside-markdown` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        jsInline: {ignores: IGNORES},
      });

      const mdIgnores = configResult.getConfigByUnPostfix(
        'js-inline/js-inside-html-inside-markdown',
      )?.ignores;

      expect(mdIgnores).not.to.include.members(IGNORES);
    });
  });

  it('respects only `overridesAny` (and not `overrides`) in `js-inline` eslint config', async () => {
    const configResult = await computeEslintConfig({
      jsInline: {
        // @ts-expect-error does not support `overrides` because have no config-specific rules
        overrides: {'no-eval': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntry('js-inline', 'no-eval')).toBeUndefined();

    expect(
      getRuleSeverityFromEslintRuleEntry(configResult.getRuleEntry('js-inline', 'no-console')),
    ).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('does not support `forceSeverity`', async () => {
      const configResult = await computeEslintConfig({
        jsInline: {
          // @ts-expect-error does not support `forceSeverity` because have no config-specific rules
          forceSeverity: 'error',
          overridesAny: {'no-console': 0},
        },
      });

      expect(getAllRulesSeverities(configResult.getConfigByUnPostfix('js-inline'))).toStrictEqual([
        0,
      ]);
    });
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set html settings when not provided', async () => {
      const configResult = await computeEslintConfig('jsInline');
      const config = configResult.getConfigByUnPostfix('js-inline');

      expect(config?.settings?.['html']).toBeUndefined();
    });

    it('sets default `html-extensions` when `settings` is provided without overrides', async () => {
      const configResult = await computeEslintConfig({
        jsInline: {settings: {'html-extensions': {}}},
      });

      expect(
        (
          configResult.getConfigByUnPostfix('js-inline')?.settings?.['html'] as
            | Record<string, unknown>
            | undefined
        )?.['html-extensions'],
      ).toMatchInlineSnapshot(
        `[".erb", ".handlebars", ".hbs", ".htm", ".html", ".mustache", ".nunjucks", ".php", ".tag", ".riot", ".twig", ".we"]`,
      );
    });

    it('customizes `html-extensions` when provided', async () => {
      const DISABLED_EXTENSIONS = ['.erb'];
      const ENABLED_EXTENSIONS = ['.custom'];

      const configResult = await computeEslintConfig({
        jsInline: {
          settings: {
            'html-extensions': Object.fromEntries([
              ...DISABLED_EXTENSIONS.map((ext) => [ext, false] satisfies NonEmptyTuple),
              ...ENABLED_EXTENSIONS.map((ext) => [ext, true] satisfies NonEmptyTuple),
            ]),
          },
        },
      });

      const htmlSettings = configResult.getConfigByUnPostfix('js-inline')?.settings?.['html'];

      expect(htmlSettings).property('html-extensions').not.to.include.members(DISABLED_EXTENSIONS);
      expect(htmlSettings).property('html-extensions').to.include.members(ENABLED_EXTENSIONS);
    });

    it('sets `xml-extensions` to defaults when `settings` is provided without `xml-extensions`', async () => {
      const configResult = await computeEslintConfig({jsInline: {settings: {}}});

      expect(
        (
          configResult.getConfigByUnPostfix('js-inline')?.settings?.['html'] as
            | Record<string, unknown>
            | undefined
        )?.['xml-extensions'],
      ).toMatchInlineSnapshot(`[".xhtml", ".xml"]`);
    });

    it('customizes `xml-extensions` when provided', async () => {
      const DISABLED_EXTENSIONS = ['.xhtml'];
      const ENABLED_EXTENSIONS = ['.svg'];

      const configResult = await computeEslintConfig({
        jsInline: {
          settings: {
            'xml-extensions': Object.fromEntries([
              ...DISABLED_EXTENSIONS.map((ext) => [ext, false] satisfies NonEmptyTuple),
              ...ENABLED_EXTENSIONS.map((ext) => [ext, true] satisfies NonEmptyTuple),
            ]),
          },
        },
      });

      const htmlSettings = configResult.getConfigByUnPostfix('js-inline')?.settings?.['html'];

      expect(htmlSettings).property('xml-extensions').not.to.include.members(DISABLED_EXTENSIONS);
      expect(htmlSettings).property('xml-extensions').to.include.members(ENABLED_EXTENSIONS);
    });

    it('passes through other settings properties', async () => {
      const SETTINGS = {
        'html-extensions': {},
        indent: '2' as const,
        'report-bad-indent': 'warn' as const,
        'javascript-tag-names': ['script'],
        'javascript-mime-types': 'text/javascript',
        'ignore-tags-without-type': false,
      };

      const configResult = await computeEslintConfig({jsInline: {settings: SETTINGS}});

      expect(configResult.getConfigByUnPostfix('js-inline')?.settings?.['html']).toMatchObject(
        SETTINGS,
      );
    });
  });

  describe('option: `languageOptions`', () => {
    it('includes browser globals by default', async () => {
      const [configResult, globals] = await Promise.all([
        computeEslintConfig('jsInline'),
        import('globals'),
      ]);

      expect(
        configResult.getConfigByUnPostfix('js-inline')?.languageOptions?.['globals'],
      ).toStrictEqual(globals.browser);
    });

    it('merges user-provided `languageOptions`', async () => {
      const configResult = await computeEslintConfig({
        jsInline: {languageOptions: {sourceType: 'module'}},
      });

      expect(configResult.getConfigByUnPostfix('js-inline')?.languageOptions?.['sourceType']).toBe(
        'module',
      );
    });
  });
});
