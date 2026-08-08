import {isInEditor} from 'is-in-editor';
import * as utils from '../../../src/utils';

vi.mock(import('is-in-editor'));

beforeEach(() => {
  vi.mocked(isInEditor).mockReturnValue(false);
  vi.spyOn(utils, 'isInCi', 'get').mockReturnValue(false);
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('fileProgress');

  it('loads `file-progress` plugin if used', () => {
    expect(configResult.getLoadedPlugin('file-progress')).toBeDefined();
  });

  it('creates `file-progress` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('file-progress')).toBeDefined();
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

  it('has no explicit `files` restriction in `file-progress` eslint config by default', () => {
    expect(configResult.getConfigByUnPostfix('file-progress')?.files).toBeUndefined();
  });

  it('has default `ignores` in `file-progress` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('file-progress')?.ignores?.length).toBeGreaterThan(0);
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
    it('uses user-provided `ignores` in `file-progress` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({fileProgress: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('file-progress')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
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
    it('merges default settings with user-provided ones and assignes to `file-progress` settings property', async () => {
      const SETTINGS = {hideFileName: true};

      const configResult = await computeEslintConfig({fileProgress: {settings: SETTINGS}});

      expect(
        configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
      ).toStrictEqual({hide: false, ...SETTINGS});
    });

    it('sets `hide` to `true` when in CI', async () => {
      // eslint-disable-next-line ts/no-unused-vars
      using _ = vi.spyOn(utils, 'isInCi', 'get').mockReturnValue(true);

      const configResult = await computeEslintConfig('fileProgress');

      expect(
        configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
      ).toStrictEqual({hide: true});
    });

    it('sets `hide` to `true` when in editor', async () => {
      // eslint-disable-next-line ts/no-unused-vars
      using _ = vi.spyOn(utils, 'isInEditor').mockReturnValue(true);

      const configResult = await computeEslintConfig('fileProgress');

      expect(
        configResult.getConfigByUnPostfix('file-progress')?.settings?.['progress'],
      ).toStrictEqual({hide: true});
    });
  });
});
