const FIXTURES = {
  pnpmWorkspace: 'pnpm-workspace.yaml',
} as const;

describe('pnpm config', () => {
  it('does not crash when linting pnpm-workspace.yaml when `yaml` config is not enabled', async () => {
    await expect(
      testEslintConfig('pnpm', FIXTURES.pnpmWorkspace, import.meta.dirname),
    ).resolves.toBeDefined();
  });
});
