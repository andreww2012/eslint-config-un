import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import pathe from 'pathe';
import type {MockInstance} from 'vitest';

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

const PROJECT_B_ROOT = pathe.relative(
  process.cwd(),
  path.join(import.meta.dirname, 'fixtures/libs/b'),
);

const MOCK_PROJECT_GRAPH = {
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
        root: PROJECT_B_ROOT,
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

const MOCK_PROJECT_ROOT_MAPPINGS = new Map([
  ['.', 'test-project'],
  [PROJECT_B_ROOT, 'project-b'],
]);

let originalProcessArgv1: string;

beforeAll(() => {
  // Make isTerminalRun() return true so nx rules use the already-set
  // globalThis.projectGraph directly instead of attempting (and failing) to
  // refresh from the Nx cache, which produces "No cached ProjectGraph" warnings.
  originalProcessArgv1 = process.argv[1] || '';
  process.argv[1] = 'node_modules/eslint/bin/eslint.js';

  globalThis.projectGraph = {nodes: {}, externalNodes: {}, dependencies: {}};
  globalThis.projectRootMappings = new Map();
  globalThis.projectFileMap = {};
});

beforeEach(() => {
  addInstalledPackages({nx: '20.0.0'});
});

afterAll(() => {
  process.argv[1] = originalProcessArgv1;

  delete globalThis.projectGraph;
  delete globalThis.projectRootMappings;
  delete globalThis.projectFileMap;
});

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('nx');

  it('loads `nx` plugin', () => {
    expect(configResult.getLoadedPlugin('nx')).toBeDefined();
  });

  it('creates `nx` and `nx/json` eslint configs', () => {
    expect(configResult.getConfigByUnPostfix('nx')).toBeDefined();
    expect(configResult.getConfigByUnPostfix('nx/json')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `nx` eslint config', async () => {
      await expectConfigState({}, 'nx', false);
    });

    it('creates `nx` eslint config if explicitly enabled', async () => {
      await expectConfigState('nx', 'nx', true);
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `nx` eslint config when `nx` package is installed', async () => {
      await expectConfigState({}, 'nx', true, 'default');
    });

    it('creates `nx` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState('nx', 'nx', ['nx', true], 'default');
    });

    it('does not create `nx` eslint config if explicitly disabled', async () => {
      await expectConfigState({nx: false}, 'nx', false, 'default');
    });

    describe('`nx` is not installed', () => {
      beforeEach(() => {
        setInstalledPackages({});
      });

      it('does not create `nx` eslint config', async () => {
        await expectConfigState({}, 'nx', false, 'default');
      });

      it('creates `nx` eslint config if explicitly enabled', async () => {
        await expectConfigState('nx', 'nx', true, 'default');
      });

      it('does not create `nx` eslint config and prints a warning if explicitly disabled', async () => {
        await expectConfigState({nx: false}, 'nx', ['nx', false], 'default');
      });
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `nx` eslint config when `nx` package is installed', async () => {
      await expectConfigState({}, 'nx', true, 'misc-enabled');
    });

    it('creates `nx` eslint config if explicitly enabled and prints a warning', async () => {
      await expectConfigState({nx: true}, 'nx', ['nx', true], 'misc-enabled');
    });

    it('does not create `nx` eslint config if explicitly disabled', async () => {
      await expectConfigState({nx: false}, 'nx', false, 'misc-enabled');
    });
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('nx');

  // `@nx/eslint-plugin` rules read the Nx project graph from `globalThis` (set by
  // `ensureGlobalProjectGraph`). Without it, some rules silently bail out while
  // others (e.g. `nx-plugin-checks`) crash. We mock the minimal required globals:
  // - `projectGraph`: must include a project with a `build` target so that
  //   `dependency-checks` doesn't skip the file.
  // - `projectRootMappings`: maps the workspace root to the project name so that
  //   `findProjectForPath` can resolve linted files to a project.
  // - `projectFileMap`: used by `findNpmDependencies` (crashes without it).

  // Suppress `console.warn` from `@nx/eslint-plugin` (e.g. "Error reading
  // tsconfig.base.json") which is non-fatal and does not affect test results.
  let consoleWarnSpy: MockInstance;

  beforeAll(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // Intentionally empty
    });

    globalThis.projectGraph = MOCK_PROJECT_GRAPH;
    globalThis.projectRootMappings = MOCK_PROJECT_ROOT_MAPPINGS;
    globalThis.projectFileMap = {'test-project': []};
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();

    delete globalThis.projectGraph;
    delete globalThis.projectRootMappings;
    delete globalThis.projectFileMap;
  });

  it('correctly sets severities by default', () => {
    expect(configResult.getRuleSeverities('nx/json')).toMatchObject({
      'nx/dependency-checks': 2,
      'nx/enforce-module-boundaries': 0,
    });
  });

  it('does not enable `nx/enforce-module-boundaries` rule by default', () => {
    expect(configResult.getRuleEntrySeverity('nx', 'nx/enforce-module-boundaries')).toBe(0);
  });

  it('triggers `nx/dependency-checks` for a package.json with an unused dependency', async () => {
    const results = await testEslintConfig('nx', FIXTURES.withUnusedDep, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withUnusedDep,
      'nx/dependency-checks',
    );

    expect(error?.message).toMatchInlineSnapshot(
      '"The "lodash" package is not used by "test-project" project."',
    );
  });

  it('does not trigger `nx/dependency-checks` for a package.json without dependencies', async () => {
    const results = await testEslintConfig('nx', FIXTURES.withoutDeps, import.meta.dirname);

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.withoutDeps,
      'nx/dependency-checks',
    );

    expect(error).toBeUndefined();
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `nx` eslint config', async () => {
      const FILES = ['src/**/*.ts'];

      const configResult = await computeEslintConfig({nx: {files: FILES}});

      expect(configResult.getConfigByUnPostfix('nx')?.files).toStrictEqual(FILES);
    });

    it('disables `nx` eslint config when set to empty array', async () => {
      const configResult = await computeEslintConfig({nx: {files: []}});

      expect(configResult.getConfigByUnPostfix('nx')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `nx` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];

      const configResult = await computeEslintConfig({nx: {ignores: IGNORES}});

      const ignores = configResult.getConfigByUnPostfix('nx')?.ignores;

      expect(ignores).toIncludeAllMembers(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `nx` eslint config', async () => {
    const configResult = await computeEslintConfig({
      nx: {overrides: {'nx/dependency-checks': 0}, overridesAny: {'no-console': 0}},
    });

    expect(configResult.getRuleEntrySeverity('nx', 'nx/dependency-checks')).toBe(0);
    expect(configResult.getRuleEntrySeverity('nx', 'no-console')).toBe(0);
  });
});

describe('options', () => {
  let consoleWarnSpy: MockInstance;

  beforeAll(() => {
    // eslint-disable-next-line ts/no-empty-function
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    globalThis.projectGraph = MOCK_PROJECT_GRAPH;
    globalThis.projectRootMappings = MOCK_PROJECT_ROOT_MAPPINGS;
    globalThis.projectFileMap = {'test-project': []};
  });

  afterAll(() => {
    consoleWarnSpy.mockRestore();

    delete globalThis.projectGraph;
    delete globalThis.projectRootMappings;
    delete globalThis.projectFileMap;
  });

  describe('option: `enforceModuleBoundaries`', () => {
    it('does not trigger for a cross-boundary import by default', async () => {
      const results = await testEslintConfig(
        'nx',
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.crossBoundaryImport,
        'nx/enforce-module-boundaries',
      );

      expect(error).toBeUndefined();
    });

    it('does not trigger for a local import by default', async () => {
      const results = await testEslintConfig('nx', FIXTURES.localImport, import.meta.dirname);

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.localImport,
        'nx/enforce-module-boundaries',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for a cross-boundary import when set to `true`', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: true}},
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.crossBoundaryImport,
        'nx/enforce-module-boundaries',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Projects cannot be imported by a relative or absolute path, and must begin with a npm scope"',
      );
    });

    it('does not trigger for a local import when set to `true`', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: true}},
        FIXTURES.localImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.localImport,
        'nx/enforce-module-boundaries',
      );

      expect(error).toBeUndefined();
    });

    it('triggers for a cross-boundary import when set to object', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: {depConstraints: []}}},
        FIXTURES.crossBoundaryImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.crossBoundaryImport,
        'nx/enforce-module-boundaries',
      );

      expect(error?.message).toMatchInlineSnapshot(
        '"Projects cannot be imported by a relative or absolute path, and must begin with a npm scope"',
      );
    });

    it('does not trigger for a local import when set to object', async () => {
      const results = await testEslintConfig(
        {nx: {enforceModuleBoundaries: {depConstraints: []}}},
        FIXTURES.localImport,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.localImport,
        'nx/enforce-module-boundaries',
      );

      expect(error).toBeUndefined();
    });
  });
});
