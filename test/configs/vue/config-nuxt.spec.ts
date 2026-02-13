describe('vue: sub config `nuxt`', () => {
  const fixtureFileName = 'nuxt-using-process-server-instead-of-import-meta-server.vue';

  it('triggers nuxt/prefer-import-meta when using process.server', async () => {
    const results = await testEslintConfig(
      {
        vue: {
          configNuxt: true,
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const preferImportMetaError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'nuxt/prefer-import-meta',
    );

    expect(preferImportMetaError).toBeDefined();
  });

  it('does not trigger nuxt/prefer-import-meta when using import.meta.server', async () => {
    const fixtureFileName = 'nuxt-using-import-meta-server-instead-of-process-server.vue';

    const results = await testEslintConfig(
      {
        vue: {
          configNuxt: true,
        },
      },
      fixtureFileName,
      import.meta.dirname,
    );

    const preferImportMetaError = findLintMessageFromLintResults(
      results,
      fixtureFileName,
      'nuxt/prefer-import-meta',
    );

    expect(preferImportMetaError).toBeUndefined();
  });
});
