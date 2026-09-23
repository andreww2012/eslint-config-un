import path from 'node:path';
import {exec} from 'tinyexec';

const FIXTURES = {
  withVar: 'with-var.js',
} as const;

// The plugin only moves the cursor and erases lines when it's printing to a terminal
const FAKE_TERMINAL_MODULE_URL = `data:text/javascript,${encodeURIComponent("import tty from 'node:tty'; tty.isatty = () => true;")}`;

const lintFixtureInTerminal = async (noVarSeverity: 0 | 1 | 2) => {
  const {stderr} = await exec(
    'eslint',
    [
      '--no-config-lookup',
      '--plugin',
      'file-progress',
      '--rule',
      'file-progress/activate: 2',
      '--rule',
      `no-var: ${noVarSeverity}`,
      path.join('fixtures', FIXTURES.withVar),
    ],
    {
      nodeOptions: {
        cwd: import.meta.dirname,
        env: {
          // The spinner falls back to plain lines if it detects CI or a dumb terminal
          CI: undefined,
          TERM: 'xterm-256color',
          NO_COLOR: '1',
          NODE_OPTIONS: `--import=${FAKE_TERMINAL_MODULE_URL}`,
        },
      },
    },
  );

  return (
    stderr
      .replaceAll(path.sep, '/')
      // Control pictures keep snapshots free of control characters and trailing spaces
      .replaceAll('\u{1B}', '␛')
      .replaceAll('\n', '↵')
  );
};

describe('basic tests', () => {
  it('creates `file-progress` eslint config and loads `file-progress` plugin if set to `true`', async () => {
    const configResult = await computeEslintConfig('fileProgress');

    const config = configResult.getConfigByUnPostfix('file-progress');

    expect(config).toBeDefined();
    expect(config?.files).toBeUndefined();
    expect(config?.ignores).toBeUndefined();

    expect(configResult.getLoadedPlugin('file-progress')).toBeDefined();
  });

  it('does not create `file-progress` eslint config and does not load `file-progress` plugin if set to `false`', async () => {
    const configResult = await computeEslintConfig({fileProgress: false});

    expect(configResult.getConfigByUnPostfix('file-progress')).toBeUndefined();
    expect(configResult.getLoadedPlugin('file-progress')).toBeUndefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `file-progress` eslint config', async () => {
      await expectConfigState({}, 'file-progress', false);
    });

    it('creates `file-progress` eslint config if explicitly enabled', async () => {
      await expectConfigState('fileProgress', 'file-progress', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('does not create `file-progress` eslint config', async () => {
      await expectConfigState({}, 'file-progress', false, 'default');
    });

    it('creates `file-progress` eslint config if explicitly enabled', async () => {
      await expectConfigState('fileProgress', 'file-progress', true, 'default');
    });

    it('does not create `file-progress` eslint config if explicitly disabled, without printing a warning', async () => {
      await expectConfigState({fileProgress: false}, 'file-progress', false, 'default');
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('does not create `file-progress` eslint config (not in misc group)', async () => {
      await expectConfigState({}, 'file-progress', false, 'misc-enabled');
    });

    it('creates `file-progress` eslint config if explicitly enabled', async () => {
      await expectConfigState('fileProgress', 'file-progress', true, 'misc-enabled');
    });

    it('does not create `file-progress` eslint config if explicitly disabled', async () => {
      await expectConfigState({fileProgress: false}, 'file-progress', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('fileProgress');

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('file-progress')).toMatchObject({
      'file-progress/activate': 2,
    });
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `file-progress` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({fileProgress: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('file-progress')?.files).toStrictEqual(FILES);
    });

    it('disables `file-progress` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({fileProgress: {files: []}});

      expect(configResult.getConfigByUnPostfix('file-progress')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `file-progress` eslint config', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({fileProgress: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('file-progress')?.ignores;

      expect(ignores).toStrictEqual(IGNORES);
    });
  });

  it('respects `overrides` and `overridesAny` in `file-progress` eslint config', async () => {
    const configResult = await computeEslintConfig({
      fileProgress: {
        overrides: {'file-progress/activate': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(configResult.getRuleEntrySeverity('file-progress', 'file-progress/activate')).toBe(0);
    expect(configResult.getRuleEntrySeverity('file-progress', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  describe('option: `settings`', () => {
    it('merges default settings with user-provided ones and assigns them to `file-progress` settings property', async () => {
      const SETTINGS = {hideFileName: true};

      const configResult = await computeEslintConfig('fileProgress', {
        un: {plugins: {'file-progress': {settings: SETTINGS}}},
      });

      expect(
        configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
      ).toStrictEqual({hide: false, ...SETTINGS});
    });

    it.each(['ci', 'editor'] as const)(
      'sets `hide` to `true` when the resolved environment is `%s`',
      async (environment) => {
        const configResult = await computeEslintConfig('fileProgress', {un: {environment}});

        expect(
          configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
        ).toStrictEqual({hide: true});
      },
    );
  });
});

describe('terminal output', () => {
  it('never hides the cursor', async () => {
    await expect(lintFixtureInTerminal(2)).resolves.toMatchInlineSnapshot(
      '"␛[1G| Processing: fixtures/with-var.js ↵"',
    );
  });

  it('does not erase the ESLint output printed after the last progress line', async () => {
    await expect(lintFixtureInTerminal(1)).resolves.toMatchInlineSnapshot(
      '"␛[1G| Processing: fixtures/with-var.js ↵␛[1G✔ Lint done.↵␛[?25h"',
    );
  });

  it('replaces the last progress line with the success message if nothing was printed after it', async () => {
    await expect(lintFixtureInTerminal(0)).resolves.toMatchInlineSnapshot(
      '"␛[1G| Processing: fixtures/with-var.js ↵␛[1G␛[2K␛[1G␛[1A␛[2K␛[1G✔ Lint done.↵␛[?25h"',
    );
  });
});
