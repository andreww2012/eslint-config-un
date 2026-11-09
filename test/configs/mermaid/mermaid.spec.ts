import {GLOB_MERMAID} from '../../../src/constants';

const FIXTURES = {
  styleOfUndefinedVertex: 'style-of-undefined-vertex.mmd',
  spacedLinkStroke: 'spaced-link-stroke.mermaid',
  noDiagramHeader: 'no-diagram-header.mmd',
  mermaidAndMmdCodeBlocksMd: 'mermaid-and-mmd-code-blocks.md',
  mermaidCodeBlockMdx: 'mermaid-code-block.mdx',
} as const;

beforeEach(() => {
  addInstalledPackages({mermaid: '11.12.0'});
});

describe('basic tests', () => {
  it('creates `mermaid` and `parsing/mermaid` eslint configs and loads `mermaid` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('mermaid');

    const config = configResult.getConfigByUnPostfix('mermaid');

    expect(config).toBeDefined();
    expect(config?.files).toMatchInlineSnapshot('["**/*.{mmd,mermaid}"]');

    const ignores = config?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.toIncludeAnyMembers([GLOB_MERMAID]);

    const parsingConfig = configResult.getConfigByUnPostfix('parsing/mermaid');

    expect(parsingConfig?.files).toMatchInlineSnapshot('["**/*.{mmd,mermaid}"]');
    expect(parsingConfig?.language).toMatchInlineSnapshot('"mermaid/mermaid"');

    expect(configResult.getLoadedPlugin('mermaid')).toBeDefined();
  });

  it('does not create `mermaid` and `parsing/mermaid` eslint configs and does not load `mermaid` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({mermaid: false});

    expect(configResult.getConfigByUnPostfix('mermaid')).toBeUndefined();
    expect(configResult.getConfigByUnPostfix('parsing/mermaid')).toBeUndefined();
    expect(configResult.getLoadedPlugin('mermaid')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `mermaid` eslint config', async () => {
      await expectConfigState({}, 'mermaid', false);
    });

    it('creates `mermaid` eslint config if explicitly enabled', async () => {
      await expectConfigState('mermaid', 'mermaid', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    describe('`mermaid` is installed', () => {
      it('creates `mermaid` eslint config by default', async () => {
        await expectConfigState({}, 'mermaid', true, 'default');
      });

      it('creates `mermaid` eslint config and prints a warning if explicitly enabled', async () => {
        await expectConfigState('mermaid', 'mermaid', ['mermaid', true], 'default');
      });

      it('does not create `mermaid` eslint config if explicitly disabled', async () => {
        await expectConfigState({mermaid: false}, 'mermaid', false, 'default');
      });
    });

    describe('`mermaid` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `mermaid` eslint config', async () => {
        await expectConfigState({}, 'mermaid', false, 'default');
      });

      it('creates `mermaid` eslint config if explicitly enabled', async () => {
        await expectConfigState('mermaid', 'mermaid', true, 'default');
      });

      it('does not create `mermaid` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({mermaid: false}, 'mermaid', ['mermaid', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `mermaid` eslint config when `mermaid` is installed', async () => {
      await expectConfigState({}, 'mermaid', true, 'misc-enabled');
    });

    it('creates `mermaid` eslint config and prints a warning if explicitly enabled', async () => {
      await expectConfigState({mermaid: true}, 'mermaid', ['mermaid', true], 'misc-enabled');
    });

    it('does not create `mermaid` eslint config if explicitly disabled', async () => {
      await expectConfigState({mermaid: false}, 'mermaid', false, 'misc-enabled');
    });
  });
});

describe('rules', () => {
  it('correctly sets severities by default', async () => {
    const configResult = await computeEslintConfig('mermaid');

    expect(configResult.getRuleSeverities('mermaid')).toMatchObject({
      'mermaid/flowchart-no-undef': 2,
      'mermaid/flowchart-no-unclosed-description-block': 2,
    });
  });

  it('`mermaid/flowchart-no-undef` rule fires on a .mmd file styling an undefined vertex', async () => {
    const results = await testEslintConfig(
      'mermaid',
      FIXTURES.styleOfUndefinedVertex,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.styleOfUndefinedVertex,
      'mermaid/flowchart-no-undef',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"mermaid.js adds a new vertex with these styles for the undefined id `C`."',
    );
  });

  it('`mermaid/flowchart-no-spaced-stroke` rule fires on a .mermaid file with a spaced link stroke', async () => {
    const results = await testEslintConfig(
      'mermaid',
      FIXTURES.spacedLinkStroke,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.spacedLinkStroke,
      'mermaid/flowchart-no-spaced-stroke',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"`stroke` written with whitespace before `:` is not a form that the mermaid.js documentation shows, and mermaid.js does not read it for the colour of an arrowhead."',
    );
  });

  it('reports a parsing error on a .mmd file without a diagram header', async () => {
    const results = await testEslintConfig(
      'mermaid',
      FIXTURES.noDiagramHeader,
      import.meta.dirname,
    );

    const messages = results.flatMap((result) => result.messages);

    expect(messages).toHaveLength(1);
    expect(messages[0]?.fatal).toBe(true);
    expect(messages[0]?.message).toMatchInlineSnapshot('"Parsing error: No diagram type detected"');
  });

  describe('code blocks inside .md files', async () => {
    const results = await testEslintConfig(
      {mermaid: true, markdown: true},
      FIXTURES.mermaidAndMmdCodeBlocksMd,
      import.meta.dirname,
    );

    it('`mermaid/flowchart-no-undef` rule fires in a `mermaid` code block', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mermaidAndMmdCodeBlocksMd,
        'mermaid/flowchart-no-undef',
      );

      expect(error?.line).toBe(6);
    });

    it('`mermaid/flowchart-no-spaced-stroke` rule fires in an `mmd` code block', () => {
      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.mermaidAndMmdCodeBlocksMd,
        'mermaid/flowchart-no-spaced-stroke',
      );

      expect(error?.line).toBe(12);
    });
  });

  it('`mermaid/flowchart-no-undef` rule fires in a `mermaid` code block inside an .mdx file', async () => {
    const results = await testEslintConfig(
      {mermaid: true, mdx: true},
      FIXTURES.mermaidCodeBlockMdx,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.mermaidCodeBlockMdx,
      'mermaid/flowchart-no-undef',
    );

    expect(error?.line).toBe(6);
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `mermaid` eslint config', async () => {
      const FILES = ['docs/**/*.mmd'] as const;

      const configResult = await computeEslintConfig({mermaid: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('mermaid')?.files).toStrictEqual(FILES);
    });

    it('disables `mermaid` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({mermaid: {files: []}});

      expect(configResult.getConfigByUnPostfix('mermaid')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `mermaid` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'] as const;

      const configResult = await computeEslintConfig({mermaid: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('mermaid')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `mermaid` eslint config', async () => {
    const configResult = await computeEslintConfig({
      mermaid: {
        overrides: {'mermaid/flowchart-no-undef': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleSeverities('mermaid')).toMatchObject({
      'mermaid/flowchart-no-undef': 0,
      'no-console': 0,
    });
  });
});
