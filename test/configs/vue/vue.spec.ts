describe('vue config', () => {
  describe('vue version detection', () => {
    it('does not throw if Vue version cannot be determined', async () => {
      await expect(
        testEslintConfig('vue', 'template-with-useless-mustache.vue', import.meta.dirname),
      ).resolves.not.toThrowError();
    });

    it('prints a warning if Vue version cannot be determined', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await testEslintConfig('vue', 'template-with-useless-mustache.vue', import.meta.dirname);

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          '[warn] [eslint-config-un] [vue config] Vue major version could not be detected or not supported and was also not explicitly passed',
        ),
      ).toBe(true);
    });

    it('does not print a warning if Vue version can be determined', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await testEslintConfig(
        {
          vue: {
            majorVersion: 3,
          },
        },
        'template-with-useless-mustache.vue',
        import.meta.dirname,
      );

      expect(stderrSpy).toHaveBeenCalledTimes(0);
    });
  });

  it('triggers vue/no-useless-mustaches for string literals in mustaches', async () => {
    const fixtureFileName = 'template-with-useless-mustache.vue';

    const results = await testEslintConfig('vue', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeDefined();
  });

  it('does not trigger vue/no-useless-mustaches for plain text', async () => {
    const fixtureFileName = 'template-without-useless-mustache.vue';

    const results = await testEslintConfig('vue', fixtureFileName, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'vue/no-useless-mustaches',
    );

    expect(error).toBeUndefined();
  });
});
