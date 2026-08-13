import {GLOB_HTM, GLOB_HTML, GLOB_HTM_HTML} from '../../../src/constants';
import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  withEval: 'with-eval.html',
} as const;

describe('basic tests', () => {
  it('creates `js-inline` and `js-inline/js-inside-html-inside-markdown` eslint configs if set to `true`', async () => {
    const configResult = await computeEslintConfig('jsInline');

    const config = configResult.getConfigByUnPostfix('js-inline');

    const markdownConfig = configResult.getConfigByUnPostfix(
      'js-inline/js-inside-html-inside-markdown',
    );

    expect(config).toBeDefined();
    expect(config?.plugins?.['html-processor']).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.htm?(l)"]');
    expect(config?.ignores?.length).toBeGreaterThan(0);
    expect(config?.ignores).not.toIncludeAnyMembers(['**/*.htm?(l)']);

    expect(markdownConfig).toBeDefined();
    expect(markdownConfig?.files).toMatchInlineSnapshot('["**/*.md/**/*.htm?(l)"]');
    expect(markdownConfig?.ignores?.length).toBeGreaterThan(0);
    expect(markdownConfig?.ignores).not.toIncludeAnyMembers([GLOB_HTML, GLOB_HTM, GLOB_HTM_HTML]);
  });

  it('does not create `js-inline` and `js-inline/js-inside-html-inside-markdown` eslint configs if set to `false`', async () => {
    const configResult = await computeEslintConfig({jsInline: false});

    expect(configResult.getConfigByUnPostfix('js-inline')).toBeUndefined();
    expect(
      configResult.getConfigByUnPostfix('js-inline/js-inside-html-inside-markdown'),
    ).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `js-inline` eslint config', async () => {
      await expectConfigState({}, 'js-inline', false);
    });

    it('creates `js-inline` eslint config if explicitly enabled', async () => {
      await expectConfigState('jsInline', 'js-inline', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `js-inline` eslint config by default', async () => {
      await expectConfigState({}, 'js-inline', true, 'default');
    });

    it('creates `js-inline` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsInline', 'js-inline', ['jsInline', true], 'default');
    });

    it('does not create `js-inline` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsInline: false}, 'js-inline', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `js-inline` eslint config', async () => {
      await expectConfigState({}, 'js-inline', true, 'misc-enabled');
    });

    it('creates `js-inline` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState('jsInline', 'js-inline', ['jsInline', true], 'misc-enabled');
    });

    it('does not create `js-inline` eslint config if explicitly disabled', async () => {
      await expectConfigState({jsInline: false}, 'js-inline', false, 'misc-enabled');
    });
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

    expect(error?.message).toMatchInlineSnapshot('"`eval` can be harmful."');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `js-inline` eslint config', async () => {
      const FILES = ['src/**/*.html'];

      const configResult = await computeEslintConfig({jsInline: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('js-inline')?.files).toStrictEqual(FILES);
    });

    it('disables `js-inline` and `js-inline/js-inside-html-inside-markdown` eslint configs when set to empty array', async () => {
      const configResult = await computeEslintConfig({jsInline: {files: []}});

      expect(configResult.getConfigByUnPostfix('js-inline')).toBeUndefined();
      expect(
        configResult.getConfigByUnPostfix('js-inline/js-inside-html-inside-markdown'),
      ).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `js-inline` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsInline: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('js-inline')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });

    it('does not propagate user `ignores` to `js-inline/js-inside-html-inside-markdown` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({jsInline: {ignores: IGNORES}});

      const mdIgnores = configResult.getConfigByUnPostfix(
        'js-inline/js-inside-html-inside-markdown',
      )?.ignores;

      expect(mdIgnores).not.toIncludeAnyMembers(IGNORES);
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
    expect(configResult.getRuleEntrySeverity('js-inline', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('does not set html settings by default', async () => {
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
            Record<string, unknown> | undefined
        )?.['html-extensions'],
      ).toMatchInlineSnapshot(
        '[".erb", ".handlebars", ".hbs", ".htm", ".html", ".mustache", ".nunjucks", ".php", ".tag", ".riot", ".twig", ".we"]',
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

      expect(htmlSettings).toHaveProperty(
        'html-extensions',
        expect.not.arrayContaining(DISABLED_EXTENSIONS),
      );
      expect(htmlSettings).toHaveProperty(
        'html-extensions',
        expect.arrayContaining(ENABLED_EXTENSIONS),
      );
    });

    it('sets `xml-extensions` to defaults when `settings` is provided without `xml-extensions`', async () => {
      const configResult = await computeEslintConfig({jsInline: {settings: {}}});

      expect(
        (
          configResult.getConfigByUnPostfix('js-inline')?.settings?.['html'] as
            Record<string, unknown> | undefined
        )?.['xml-extensions'],
      ).toMatchInlineSnapshot('[".xhtml", ".xml"]');
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

      expect(htmlSettings).toHaveProperty(
        'xml-extensions',
        expect.not.arrayContaining(DISABLED_EXTENSIONS),
      );
      expect(htmlSettings).toHaveProperty(
        'xml-extensions',
        expect.arrayContaining(ENABLED_EXTENSIONS),
      );
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
