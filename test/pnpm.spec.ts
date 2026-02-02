describe('pnpm config', () => {
  it('does not crash when linting pnpm-workspace.yaml when `yaml` config is not enabled', async () => {
    await expect(
      testEslintConfig(
        {
          pnpm: true,
        },
        'pnpm-workspace.yaml',
      ),
    ).resolves.toBeDefined();
  });
});
