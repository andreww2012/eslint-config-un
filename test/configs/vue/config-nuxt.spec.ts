const FIXTURES = {
  nuxtUsingProcessServer: 'nuxt-using-process-server-instead-of-import-meta-server.vue',
  nuxtUsingImportMetaServer: 'nuxt-using-import-meta-server-instead-of-process-server.vue',
} as const;

describe('vue: sub config `nuxt`', () => {
  it('triggers nuxt/prefer-import-meta when using process.server', async () => {
    const results = await testEslintConfig(
      {vue: {configNuxt: true}},
      FIXTURES.nuxtUsingProcessServer,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nuxtUsingProcessServer,
      'nuxt/prefer-import-meta',
    );

    expect(error?.message).toMatchInlineSnapshot(`"Replace \`process.server\` with \`import.meta.server\`."`);
  });

  it('does not trigger nuxt/prefer-import-meta when using import.meta.server', async () => {
    const results = await testEslintConfig(
      {vue: {configNuxt: true}},
      FIXTURES.nuxtUsingImportMetaServer,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nuxtUsingImportMetaServer,
      'nuxt/prefer-import-meta',
    );

    expect(error).toBeUndefined();
  });
});
