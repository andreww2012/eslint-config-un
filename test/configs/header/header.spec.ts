import type {NonEmptyTuple} from '../../../src/types';

const FIXTURES = {
  noHeader: 'no-header.js',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('header');

  it('loads `header` plugin if used', () => {
    expect(configResult.getLoadedPlugin('header')).toBeDefined();
  });

  it('creates `header` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('header')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `header` eslint config', async () => {
      await expectConfigState({}, 'header', false);
    });

    it('creates `header` eslint config if explicitly enabled', async () => {
      await expectConfigState('header', 'header', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `header` eslint config', async () => {
      await expectConfigState({}, 'header', false, 'default');
    });

    it('creates `header` eslint config if explicitly enabled', async () => {
      await expectConfigState('header', 'header', true, 'default');
    });

    it('does not create `header` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({header: false}, 'header', ['header', false], 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `header` eslint config', async () => {
      await expectConfigState({}, 'header', false, 'misc-enabled');
    });

    it('creates `header` eslint config if explicitly enabled', async () => {
      await expectConfigState({header: true}, 'header', true, 'misc-enabled');
    });

    it('does not create `header` eslint config and prints a warning if explicitly disabled', async () => {
      await expectConfigState({header: false}, 'header', ['header', false], 'misc-enabled');
    });
  });

  it('has no explicit `files` restriction in `header` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('header')?.files).toBeUndefined();
  });

  it('has default `ignores` in `header` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('header')?.ignores?.length).toBeGreaterThan(0);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('header');

  it('enables `header/header` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('header', 'header/header')).toBe(2);
  });

  it('`header/header` rule fires on a file missing the required header', async () => {
    const results = await testEslintConfig(
      {header: {options: {comment: 'Copyright'}}},
      FIXTURES.noHeader,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(results, FIXTURES.noHeader, 'header/header');

    expect(error?.message).toMatchInlineSnapshot('"missing header"');
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `header` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({header: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('header')?.files).toStrictEqual(FILES);
    });

    it('disables `header` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({header: {files: []}});

      expect(configResult.getConfigByUnPostfix('header')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `header` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({header: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('header')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `header` eslint config', async () => {
    const configResult = await computeEslintConfig({
      header: {overrides: {'header/header': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('header', 'header/header')).toBe(0);
    expect(configResult.getRuleEntrySeverity('header', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `options`', () => {
    it('does not pass extra args to `header/header` rule by default', async () => {
      const configResult = await computeEslintConfig('header');

      expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot('2');
    });

    it('passes array-style options to `header/header` rule as-is', async () => {
      const OPTIONS = [
        'block' as const,
        'Copy-right',
        2,
        {lineEndings: 'windows' as const},
      ] satisfies NonEmptyTuple;

      const configResult = await computeEslintConfig({
        header: {options: OPTIONS},
      });

      expect(configResult.getRuleEntryOptions('header', 'header/header')).toStrictEqual(OPTIONS);
    });

    describe('option: `pathToFileWithComment`', () => {
      it('passes path to `header/header` rule when `pathToFileWithComment` is set', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {pathToFileWithComment: '/path/to/header.txt'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "/path/to/header.txt"]',
        );
      });
    });

    describe('option: `commentStyle`', () => {
      it('uses `block` comment style by default', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright"]',
        );
      });

      it('uses `block` comment style when `commentStyle` is `block`', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {commentStyle: 'block', comment: 'Copyright'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright"]',
        );
      });

      it('uses `line` comment style when `commentStyle` is `line`', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {commentStyle: 'line', comment: 'Copyright'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "line", "Copyright"]',
        );
      });
    });

    describe('option: `comment`', () => {
      it('passes a string comment', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright Acme Corp'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright Acme Corp"]',
        );
      });

      it('passes array of comments', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: ['Copyright Acme Corp', 'All rights reserved']}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", ["Copyright Acme Corp", "All rights reserved"]]',
        );
      });

      it('passes a comment object with pattern and template', async () => {
        const configResult = await computeEslintConfig({
          header: {
            options: {comment: {pattern: String.raw`Copyright \d{4}`, template: 'Copyright 2024'}},
          },
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", {"pattern": "Copyright \\d{4}", "template": "Copyright 2024"}]',
        );
      });
    });

    describe('option: `numberOfNewlinesAfterHeader`', () => {
      it('does not set newlines count after header by default', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright"]',
        );
      });

      it('uses custom newline count when `numberOfNewlinesAfterHeader` is set', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright', numberOfNewlinesAfterHeader: 2}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright", 2]',
        );
      });
    });

    describe('option: `lineEndings`', () => {
      it('passes no `lineEndings` by default', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright"]',
        );
      });

      it('passes `unix` `lineEndings` to `header/header` rule', async () => {
        const configResult = await computeEslintConfig({
          header: {options: {comment: 'Copyright', lineEndings: 'unix'}},
        });

        expect(configResult.getRuleEntry('header', 'header/header')).toMatchInlineSnapshot(
          '[2, "block", "Copyright", 1, {"lineEndings": "unix"}]',
        );
      });
    });
  });
});
