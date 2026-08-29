import {GLOB_MD_X_CODE_BLOCKS} from '../../../src/constants';

describe('ts: how the files it lints are parsed', () => {
  describe('`parsing/ts`', () => {
    it('carries the parser and its options', async () => {
      const configResult = await computeEslintConfig('ts');

      const config = configResult.getConfigByUnPostfix('parsing/ts');

      expect(config?.files).toMatchInlineSnapshot('["**/*.?([cm])ts?(x)"]');
      expect(config?.languageOptions?.['parser']).toBeDefined();
      expect(config?.languageOptions?.['parserOptions']).toMatchObject({sourceType: 'module'});
    });

    it('is not created when the `ts` config is disabled', async () => {
      const configResult = await computeEslintConfig({ts: false});

      expect(configResult.getConfigByUnPostfix('parsing/ts')).toBeUndefined();
    });

    it.each([
      ['astro', '**/*.astro'],
      ['svelte', '**/*.svelte'],
      ['vue', '**/*.vue'],
    ] as const)(
      'takes the files of the `%s` config when it is enabled',
      async (configName, glob) => {
        const configResult = await computeEslintConfig({ts: true, [configName]: true});

        expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).toIncludeAllMembers([glob]);
      },
    );

    it.each([
      ['astro', '**/*.astro'],
      ['svelte', '**/*.svelte'],
      ['vue', '**/*.vue'],
    ] as const)(
      'drops the files of the `%s` config once its language is turned off',
      async (configName, glob) => {
        const configResult = await computeEslintConfig(
          {ts: true, [configName]: true},
          {un: {parsing: {[configName]: false}}},
        );

        const configNames = ['parsing/ts', 'parsing/ts/type-aware', 'ts/non-type-aware/rules'];
        for (const name of configNames) {
          expect(configResult.getConfigByUnPostfix(name)?.files).not.toIncludeAnyMembers([glob]);
        }
      },
    );
  });

  describe('`parsing/ts/type-aware`', () => {
    it('sets the project service up, leaving the parser to the entry above it', async () => {
      const configResult = await computeEslintConfig('ts');

      const config = configResult.getConfigByUnPostfix('parsing/ts/type-aware');

      expect(config?.languageOptions?.['parserOptions']).toStrictEqual({projectService: {}});
      expect(config?.languageOptions?.['parser']).toBeUndefined();
    });

    it('skips the code blocks the parser still reads, since no program covers them', async () => {
      const configResult = await computeEslintConfig('ts');

      expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.ignores).toStrictEqual([
        GLOB_MD_X_CODE_BLOCKS,
      ]);
      expect(configResult.getConfigByUnPostfix('parsing/ts')?.ignores).toBeUndefined();
    });

    it('stays inside the files the entry above it parses', async () => {
      const configResult = await computeEslintConfig('ts', {
        un: {parsing: {ts: {files: ['src/**/*.ts']}}},
      });

      expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files).toStrictEqual([
        ['src/**/*.ts', '**/*.?([cm])ts?(x)'],
      ]);
    });

    it('gets a name of its own for every entry the array form asks for', async () => {
      const configResult = await computeEslintConfig('ts', {
        un: {parsing: {ts: [{files: ['a/**/*.ts']}, {files: ['b/**/*.ts']}]}},
      });

      const names = configResult.config
        .map(({name}) => name)
        .filter((name) => name?.includes('parsing/ts'));

      expect(names).toStrictEqual([...new Set(names)]);
    });

    it('follows the `ignores` of the framework files it took on, which no program covers either', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        vue: {
          configEnforceTypescriptInScriptSection: {
            files: ['**/*.vue'],
            ignores: ['legacy/**/*.vue'],
          },
        },
      });

      expect(configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.ignores).toStrictEqual([
        GLOB_MD_X_CODE_BLOCKS,
        'legacy/**/*.vue',
      ]);
    });

    it('leaves out the vue files when they only asked for the non-type-aware rules', async () => {
      const configResult = await computeEslintConfig({
        ts: true,
        vue: {
          configEnforceTypescriptInScriptSection: {
            typescriptRules: 'only-non-type-aware',
            files: ['**/*.vue'],
          },
        },
      });

      expect(
        configResult.getConfigByUnPostfix('parsing/ts/type-aware')?.files,
      ).not.toIncludeAnyMembers(['**/*.vue']);
      expect(configResult.getConfigByUnPostfix('parsing/ts')?.files).toIncludeAllMembers([
        '**/*.vue',
      ]);
    });
  });
});
