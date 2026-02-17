/* eslint-disable vars-on-top */
declare global {
  var projectGraph: object | undefined;
  var projectRootMappings: Map<string, string> | undefined;
  var projectFileMap: Record<string, unknown[]> | undefined;
}
/* eslint-enable vars-on-top */

const FIXTURES = {
  withUnusedDep: 'with-unused-dep/package.json',
  withoutDeps: 'without-deps/package.json',
  crossBoundaryImport: 'cross-boundary-import.ts',
  localImport: 'local-import.ts',
} as const;

describe('nx config', () => {
  // @nx/eslint-plugin rules read the Nx project graph from globalThis (set by
  // `ensureGlobalProjectGraph`). Without it, some rules silently bail out while
  // others (e.g. nx-plugin-checks) crash. We mock the minimal required globals:
  // - projectGraph: must include a project with a `build` target so that
  //   `dependency-checks` doesn't skip the file.
  // - projectRootMappings: maps the workspace root to the project name so that
  //   `findProjectForPath` can resolve linted files to a project.
  // - projectFileMap: used by `findNpmDependencies` (crashes without it).
  beforeAll(() => {
    globalThis.projectGraph = {
      nodes: {
        'test-project': {
          name: 'test-project',
          type: 'lib',
          data: {
            root: '.',
            sourceRoot: 'src',
            targets: {
              build: {
                executor: '@nx/js:tsc',
                options: {},
              },
            },
            tags: [],
          },
        },
        'project-b': {
          name: 'project-b',
          type: 'lib',
          data: {
            root: 'libs/b',
            sourceRoot: 'libs/b/src',
            targets: {},
            tags: [],
          },
        },
      },
      externalNodes: {},
      dependencies: {
        'test-project': [],
        'project-b': [],
      },
    };
    globalThis.projectRootMappings = new Map([
      ['.', 'test-project'],
      ['libs/b', 'project-b'],
    ]);
    globalThis.projectFileMap = {'test-project': []};
  });

  afterAll(() => {
    delete globalThis.projectGraph;
    delete globalThis.projectRootMappings;
    delete globalThis.projectFileMap;
  });

  it('triggers nx/dependency-checks for a package.json with an unused dependency', async () => {
    const results = await testEslintConfig('nx', FIXTURES.withUnusedDep, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withUnusedDep,
      'nx/dependency-checks',
    );

    expect(error).toBeDefined();
  });

  it('does not trigger nx/dependency-checks for a package.json without dependencies', async () => {
    const results = await testEslintConfig('nx', FIXTURES.withoutDeps, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withoutDeps,
      'nx/dependency-checks',
    );

    expect(error).toBeUndefined();
  });

  describe('option: `enforceModuleBoundaries`', () => {
    const RULE_ID = 'nx/enforce-module-boundaries';

    it('does not trigger for a cross-boundary import by default', async () => {
      const results = await testEslintConfig(
        'nx',
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.crossBoundaryImport, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('does not trigger for a local import by default', async () => {
      const results = await testEslintConfig('nx', FIXTURES.localImport, import.meta.dirname);

      const error = findLintMessageFromLintResults(results, FIXTURES.localImport, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('triggers for a cross-boundary import when set to `true`', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: true}},
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.crossBoundaryImport, RULE_ID);

      expect(error?.message).toMatchInlineSnapshot(
        `"Projects cannot be imported by a relative or absolute path, and must begin with a npm scope"`,
      );
    });

    it('does not trigger for a local import when set to `true`', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: true}},
        FIXTURES.localImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.localImport, RULE_ID);

      expect(error).toBeUndefined();
    });

    it('triggers for a cross-boundary import when set to an object', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: {depConstraints: []}}},
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.crossBoundaryImport, RULE_ID);

      expect(error?.message).toMatchInlineSnapshot(
        `"Projects cannot be imported by a relative or absolute path, and must begin with a npm scope"`,
      );
    });

    it('does not trigger for a local import when set to an object', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: {depConstraints: []}}},
        FIXTURES.localImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(results, FIXTURES.localImport, RULE_ID);

      expect(error).toBeUndefined();
    });
  });
});
