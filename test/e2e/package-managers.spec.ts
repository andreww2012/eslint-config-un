import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {exec} from 'tinyexec';
import {inject} from 'vitest';
import * as z from 'zod';
import packageJson from '../../package.json' with {type: 'json'};

type CommandLine = readonly [command: string, ...args: string[]];

const PrintConfigZod = z.object({rules: z.record(z.string(), z.unknown())});

const LintResultsZod = z
  .object({
    filePath: z.string(),
    messages: z
      .object({ruleId: z.string().nullable(), messageId: z.string().optional(), line: z.number()})
      .array(),
  })
  .array();

const NPM_ENV_VARIABLE_REGEXP = /^npm_/i;

// `--print-config` output alone is around 100 kilobytes
const COMMAND_REPORT_STDOUT_MAX_LENGTH = 2000;

const FIXTURE_PROJECT_DIR = path.join(import.meta.dirname, 'fixtures', 'project');

const FIXTURE_EXAMPLE_LINES = (
  await fs.readFile(path.join(FIXTURE_PROJECT_DIR, 'src', 'example.ts'), 'utf8')
).split('\n');

const YARN_CLASSIC = 'yarn@1.22.22';
const YARN_BERRY = 'yarn@4.18.0';

const FIXTURE_DEPENDENCIES = {
  // Its `exports` don't expose `package.json`
  clsx: '2.1.1',
  eslint: packageJson.devDependencies.eslint,
  'eslint-plugin-clsx': packageJson.devDependencies['eslint-plugin-clsx'],
  // Makes the inlined plugins spawn their Prettier workers
  prettier: '3.9.6',
  // Our own `typescript` dev dependency is an npm alias, so only its version is reusable
  typescript: packageJson.devDependencies.typescript.split('@').at(-1),
};

// Scripts receive the config of the package manager running them through these variables, which
// would override the fixture's `.npmrc`
const CHILD_PROCESS_ENV = {
  ...Object.fromEntries(
    Object.keys(process.env)
      .filter((name) => NPM_ENV_VARIABLE_REGEXP.test(name))
      .map((name) => [name, undefined]),
  ),
  COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
};

const getYarnBerryFiles = (registryUrl: string, nodeLinker: 'node-modules' | 'pnp') => ({
  '.yarnrc.yml': [
    `nodeLinker: ${nodeLinker}`,
    `npmRegistryServer: "${registryUrl}"`,
    'unsafeHttpWhitelist: [localhost]',
    // Enabled by default in CI, but there is no lockfile to keep intact
    'enableImmutableInstalls: false',
    'enableTelemetry: false',
  ].join('\n'),
  // Marks the directory as a project root
  'yarn.lock': '',
});

const PACKAGE_MANAGERS: {
  id: string;
  install: CommandLine;
  eslint: CommandLine;
  getFiles?: (registryUrl: string) => Record<string, string>;
}[] = [
  {
    id: 'npm',
    install: ['npm', 'install', '--no-audit', '--no-fund'],
    eslint: ['npx', '--no-install', 'eslint'],
  },
  {
    id: 'pnpm',
    install: ['pnpm', 'install', '--no-frozen-lockfile'],
    eslint: ['pnpm', 'exec', 'eslint'],
  },
  {
    id: 'yarn-classic',
    install: ['corepack', YARN_CLASSIC, 'install', '--non-interactive'],
    eslint: ['corepack', YARN_CLASSIC, '--silent', 'eslint'],
  },
  {
    id: 'yarn-berry-pnp',
    install: ['corepack', YARN_BERRY, 'install'],
    eslint: ['corepack', YARN_BERRY, 'eslint'],
    getFiles: (registryUrl) => getYarnBerryFiles(registryUrl, 'pnp'),
  },
  {
    id: 'yarn-berry-node-modules',
    install: ['corepack', YARN_BERRY, 'install'],
    eslint: ['corepack', YARN_BERRY, 'eslint'],
    getFiles: (registryUrl) => getYarnBerryFiles(registryUrl, 'node-modules'),
  },
  {
    id: 'bun',
    install: ['bun', 'install'],
    eslint: ['bun', 'run', '--silent', 'eslint'],
  },
  {
    id: 'aube',
    install: ['aube', 'install', '--no-frozen-lockfile'],
    eslint: ['aube', 'exec', 'eslint'],
  },
  {
    id: 'nub',
    install: ['nub', 'install', '--no-frozen-lockfile'],
    eslint: ['nubx', 'eslint'],
  },
  {
    id: 'deno',
    install: ['deno', 'install'],
    eslint: ['deno', 'run', '--allow-all', 'node_modules/eslint/bin/eslint.js'],
  },
];

// Set in CI to run a single package manager per job
const SELECTED_PACKAGE_MANAGER_ID = process.env['E2E_PACKAGE_MANAGER'];

const isCommandAvailable = async (command: string) => {
  try {
    return (await exec(command, ['--version'])).exitCode === 0;
  } catch {
    return false;
  }
};

const getEnabledRuleNames = (printConfigOutput: string) =>
  Object.entries(PrintConfigZod.parse(JSON.parse(printConfigOutput)).rules)
    .filter(([, ruleEntry]) => [ruleEntry].flat()[0] !== 0)
    .map(([ruleName]) => ruleName);

const getMessagesByFileName = (lintOutput: string) =>
  new Map(
    LintResultsZod.parse(JSON.parse(lintOutput)).map(({filePath, messages}) => [
      path.basename(filePath),
      messages,
    ]),
  );

const getFixtureExampleLine = (lineStart: string) =>
  FIXTURE_EXAMPLE_LINES.findIndex((line) => line.startsWith(lineStart)) + 1;

beforeAll(() => {
  if (
    SELECTED_PACKAGE_MANAGER_ID != null &&
    PACKAGE_MANAGERS.every(({id}) => id !== SELECTED_PACKAGE_MANAGER_ID)
  ) {
    throw new Error(`Unknown package manager \`${SELECTED_PACKAGE_MANAGER_ID}\``);
  }
});

describe.each(PACKAGE_MANAGERS)('$id', ({id, install, eslint, getFiles}) => {
  it('installs from the registry and lints the project', async ({skip}) => {
    if (SELECTED_PACKAGE_MANAGER_ID == null) {
      const [command] = install;
      if (!(await isCommandAvailable(command))) {
        skip(`\`${command}\` is not installed`);
      }
    } else if (SELECTED_PACKAGE_MANAGER_ID !== id) {
      skip();
    }

    const registryUrl = inject('registryUrl');
    const projectDir = await fs.mkdtemp(path.join(os.tmpdir(), `un-e2e-${id}-`));
    onTestFinished(() => fs.rm(projectDir, {recursive: true, force: true}));

    await fs.cp(FIXTURE_PROJECT_DIR, projectDir, {recursive: true});
    const files = {
      'package.json': JSON.stringify({
        private: true,
        type: 'module',
        devDependencies: {
          ...FIXTURE_DEPENDENCIES,
          [packageJson.name]: inject('packageVersion'),
        },
      }),
      '.npmrc': `registry=${registryUrl}\n`,
      ...getFiles?.(registryUrl),
    };
    await Promise.all(
      Object.entries(files).map(([fileName, contents]) =>
        fs.writeFile(path.join(projectDir, fileName), contents),
      ),
    );

    const commandReports: string[] = [];
    onTestFailed(() => {
      console.error(commandReports.join('\n\n'));
    });

    const run = async (commandLine: CommandLine) => {
      const [command, ...args] = commandLine;
      const result = await exec(command, args, {
        nodeOptions: {cwd: projectDir, env: CHILD_PROCESS_ENV},
      });
      commandReports.push(
        [
          `$ ${commandLine.join(' ')} (exit code ${result.exitCode})`,
          result.stderr,
          result.stdout.slice(-COMMAND_REPORT_STDOUT_MAX_LENGTH),
        ].join('\n'),
      );
      return result;
    };

    await expect(run(install)).resolves.toHaveProperty('exitCode', 0);

    const printConfigResult = await run([...eslint, '--print-config', 'src/example.ts']);

    expect(printConfigResult.exitCode).toBe(0);

    const enabledRuleNames = getEnabledRuleNames(printConfigResult.stdout);

    // `typescript` is detected
    expect(enabledRuleNames).toContain('ts/no-unnecessary-condition');
    expect(enabledRuleNames).not.toContain('no-unused-vars');
    // `clsx` is detected and its optional peer plugin is loaded
    expect(enabledRuleNames.filter((ruleName) => ruleName.startsWith('clsx/'))).not.toHaveLength(0);

    const lintResult = await run([...eslint, '--format', 'json', 'src/example.ts', 'README.md']);

    // The fixture has lint errors on purpose, while a crash exits with 2
    expect(lintResult.exitCode).toBe(1);

    const messagesByFileName = getMessagesByFileName(lintResult.stdout);
    const exampleMessages = messagesByFileName.get('example.ts') || [];
    const arrowReturnStyleReports = exampleMessages
      .filter(({ruleId}) => ruleId === 'arrow-return-style/arrow-return-style')
      .map(({line, messageId}) => ({line, messageId}));

    // Type information is available
    expect(exampleMessages.map(({ruleId}) => ruleId)).toContain('ts/no-unnecessary-condition');
    // Only Prettier running in the worker knows these don't fit, otherwise the rule falls back to
    // comparing the line length with 80 and reports the opposite
    expect(arrowReturnStyleReports).toContainEqual({
      line: getFixtureExampleLine('export const isDefined'),
      messageId: 'use-explicit-return',
    });
    expect(arrowReturnStyleReports.map(({line}) => line)).not.toContain(
      getFixtureExampleLine('const sum'),
    );
    // A broken worker would crash the whole run instead
    expect(messagesByFileName.get('README.md')?.map(({ruleId}) => ruleId)).toContain(
      'prettier/prettier',
    );
    // Fatal errors, like parsing ones, have no rule
    expect([...messagesByFileName.values()].flat().map(({ruleId}) => ruleId)).not.toContain(null);
  });
});
