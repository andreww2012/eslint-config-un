import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {cli} from 'cleye';
import consola from 'consola';
import pathe from 'pathe';
import {RULE_CATEGORIES_PER_PLUGIN} from '../src/eslint-rule-categories.gen';
import {pluginsLoaders} from '../src/loaders/plugins';
import type {ModuleLoaderContext} from '../src/loaders/shared';
import {RULES_REQUIRING_TYPE_INFORMATION} from '../src/plugins.gen';
import {stylePluginPrefix, styleRuleName, styleText} from '../src/utils';
import {readPluginMetadata} from './shared/plugin-metadata';
import {
  detectViaMeta,
  findRuleDirectory,
  probeRules,
  traceRulesUsingTypeInfo,
} from './src/type-info/detect';

const logger = consola.withTag('type-info-rules');

const require = createRequire(import.meta.url);

const LOADER_CONTEXT: ModuleLoaderContext = {rootOptions: {}, missingPackages: new Map()};

/**
 * Both take over the process when their prerequisites are missing, which kills the probe
 */
const PLUGINS_BREAKING_THE_PROBE = new Set(['file-progress', 'import-integrity']);

/**
 * Their entries are derived from what the plugin itself declares, so a candidate the plugin does not
 * flag is a decision taken upstream, not a gap here
 */
const PREFIXES_DECLARING_TYPE_INFO_THEMSELVES = new Set(
  Object.entries(RULE_CATEGORIES_PER_PLUGIN).flatMap(([prefix, categories]) =>
    'typeAware' in categories ? [prefix] : [],
  ),
);

const CAVEAT =
  'Every line above is a candidate, not a verdict. The probe only proves what it saw: a rule whose type-aware branch the fixture never reaches leaves no trace, and one that bails out of a guarded helper looks like it degrades even when a later call would throw. The trace resolves an imported name to a file, so a helper module mixing checker-backed and AST-only exports over-reports. Read the plugin source before changing the metadata.';

type Requirement = true | 'optional';

interface Detection {
  /** Only the probe can tell the two apart, and only for the rules the fixture actually reaches */
  requirement: Requirement | null;
  reasons: string[];
}

interface Finding extends Detection {
  prefix: string;
  ruleName: string;
  declared: Requirement | null;
  isDetected: boolean;
}

const loadPlugins = async () => {
  const loaded = await Promise.all(
    Object.entries(pluginsLoaders).map(async ([prefix, loadPlugin]) => {
      const {module: plugin, packageName} = await loadPlugin(LOADER_CONTEXT);
      return {prefix, packageName, plugin};
    }),
  );

  return loaded.flatMap(({prefix, packageName, plugin}) =>
    plugin ? [{prefix, packageName, plugin}] : [],
  );
};

const findPackageRoot = async (packageName: string) => {
  let entry: string;
  try {
    entry = require.resolve(packageName);
  } catch {
    return null;
  }

  for (
    let directory = pathe.dirname(entry);
    directory !== pathe.dirname(directory);
    directory = pathe.dirname(directory)
  ) {
    const manifest = await fs
      .readFile(pathe.join(directory, 'package.json'), 'utf8')
      .then((contents) => JSON.parse(contents) as {name?: string})
      .catch(() => null);
    if (manifest?.name === packageName) {
      return directory;
    }
  }
  return null;
};

const report = (
  title: string,
  findings: readonly Finding[],
  describe: (finding: Finding) => string,
) => {
  console.log(`\n${styleText('bold', title)} (${findings.length})`);
  if (findings.length === 0) {
    console.log('  none');
    return;
  }
  const groups = [...Map.groupBy(findings, ({prefix}) => prefix)].toSorted(([left], [right]) =>
    left.localeCompare(right),
  );
  for (const [prefix, group] of groups) {
    console.log(`  ${stylePluginPrefix(prefix)} (${group.length})`);
    for (const finding of group) {
      console.log(`    ${styleRuleName(finding.ruleName).padEnd(60)} ${describe(finding)}`);
    }
  }
};

const main = async () => {
  const argv = cli({
    name: 'detect-type-info-rules',
    flags: {
      plugin: {
        type: [String],
        description: 'Limit the report to these plugins, named by prefix or by package name',
        default: [],
      },
      strict: {
        type: Boolean,
        description: 'Exit with a non-zero code when a rule is detected but not declared',
        default: false,
      },
      probe: {
        type: Boolean,
        description:
          'Lint a fixture with every rule enabled to see which ones read the parser services, and which ones throw without them',
        default: true,
      },
      trace: {
        type: Boolean,
        description: 'Follow the import graph of the plugins shipping one file per rule',
        default: true,
      },
    },
  });

  const plugins = await loadPlugins();

  const prefixesByName = new Map(
    plugins.flatMap(({prefix, packageName}) => [
      [prefix, prefix] as const,
      [packageName, prefix] as const,
    ]),
  );
  const unknownNames = argv.flags.plugin.filter((name) => !prefixesByName.has(name));
  if (unknownNames.length > 0) {
    logger.error(
      `No such plugin: ${unknownNames.map((name) => stylePluginPrefix(name)).join(', ')}. Name it by its prefix (${stylePluginPrefix('unicorn')}) or its package (${stylePluginPrefix('eslint-plugin-unicorn')})`,
    );
    process.exitCode = 1;
    return;
  }
  const onlyPrefixes = new Set(argv.flags.plugin.flatMap((name) => prefixesByName.get(name) || []));
  const ruleCount = plugins.reduce(
    (total, {plugin}) => total + Object.keys(plugin.rules || {}).length,
    0,
  );
  logger.info(`Loaded ${plugins.length} plugin(s), ${ruleCount} rule(s)`);

  // A rejected candidate is a decision already taken, and it says why
  const rejected = new Set(
    (await readPluginMetadata()).flatMap(({prefix, metadata}) =>
      Object.entries(metadata.rules).flatMap(([ruleName, traits]) => {
        const entry = traits.requiresTypeInfo;
        return Array.isArray(entry) && entry[0] === false ? [`${prefix}/${ruleName}`] : [];
      }),
    ),
  );

  const detections = new Map<string, Detection>();
  const addDetection = (fullRuleName: string, reason: string, requirement?: Requirement) => {
    const existing = detections.get(fullRuleName);
    if (existing) {
      existing.reasons.push(reason);
      existing.requirement = requirement || existing.requirement;
    } else {
      detections.set(fullRuleName, {requirement: requirement || null, reasons: [reason]});
    }
  };

  for (const {prefix, plugin} of plugins) {
    for (const ruleName of detectViaMeta(plugin)) {
      addDetection(`${prefix}/${ruleName}`, 'meta.docs.requiresTypeChecking');
    }
  }

  if (argv.flags.probe) {
    const probeInput = Object.fromEntries(
      plugins
        .filter(({prefix}) => !PLUGINS_BREAKING_THE_PROBE.has(prefix))
        .map(({prefix, plugin}) => [prefix, plugin]),
    );

    const [typed, untyped] = await Promise.all([
      probeRules(probeInput, {withTypeInfo: true}),
      probeRules(probeInput, {withTypeInfo: false}),
    ]);

    for (const failure of [...typed.failures, ...untyped.failures]) {
      logger.warn(`The probe could not finish a fixture file: ${failure}`);
    }

    for (const [fullRuleName, keys] of typed.accessed) {
      const doesThrowWithoutTypeInfo =
        untyped.threw.has(fullRuleName) && !typed.threw.has(fullRuleName);
      // Not throwing proves nothing on its own: the fixture may simply never take the rule down the
      // path that asks for a type. Reaching the services in both passes is weak evidence that it does
      const doesDegradeGracefully =
        untyped.accessed.has(fullRuleName) && !untyped.threw.has(fullRuleName);

      // Reading only the AST node maps is how a rule detects the TypeScript parser, not
      // a question about a type
      if (doesThrowWithoutTypeInfo || [...keys].some((key) => !key.endsWith('NodeMap'))) {
        addDetection(
          fullRuleName,
          `probe: read ${[...keys].toSorted().join(', ')}`,
          doesThrowWithoutTypeInfo || (doesDegradeGracefully ? 'optional' : undefined),
        );
      }
    }

    for (const fullRuleName of untyped.threw.keys()) {
      if (!typed.threw.has(fullRuleName)) {
        addDetection(fullRuleName, 'probe: throws without type information', true);
      }
    }
  }

  if (argv.flags.trace) {
    for (const {prefix, packageName, plugin} of plugins) {
      if (onlyPrefixes.size > 0 && !onlyPrefixes.has(prefix)) {
        continue;
      }
      const packageRoot = await findPackageRoot(packageName);
      const ruleDirectory = packageRoot == null ? null : await findRuleDirectory(packageRoot);
      if (packageRoot == null || ruleDirectory == null) {
        continue;
      }
      const knownRuleNames = new Set(Object.keys(plugin.rules || {}));
      for (const [ruleName, reason] of await traceRulesUsingTypeInfo(packageRoot, ruleDirectory)) {
        if (knownRuleNames.has(ruleName)) {
          addDetection(`${prefix}/${ruleName}`, `trace: ${reason}`);
        }
      }
    }
  }

  const findings = plugins
    .filter(({prefix}) => onlyPrefixes.size === 0 || onlyPrefixes.has(prefix))
    .flatMap(({prefix, plugin}) =>
      Object.keys(plugin.rules || {})
        .toSorted()
        .flatMap((ruleName) => {
          const fullRuleName = `${prefix}/${ruleName}`;
          const declared = RULES_REQUIRING_TYPE_INFORMATION[prefix]?.rules[ruleName] || null;
          const isOutOfScope =
            rejected.has(fullRuleName) || PREFIXES_DECLARING_TYPE_INFO_THEMSELVES.has(prefix);
          const detection =
            isOutOfScope && declared == null ? undefined : detections.get(fullRuleName);
          return declared == null && detection == null
            ? []
            : [
                {
                  prefix,
                  ruleName,
                  declared,
                  isDetected: detection != null,
                  requirement: detection?.requirement || null,
                  reasons: detection?.reasons || [],
                } satisfies Finding,
              ];
        }),
    );

  const undeclared = findings.filter(({declared, isDetected}) => declared == null && isDetected);

  report(
    'Detected but not declared',
    undeclared,
    ({requirement, reasons}) =>
      `${styleText('yellow', requirement == null ? 'severity unproven' : String(requirement))} ${reasons.join(' | ')}`,
  );

  const undetected = findings.filter(({declared, isDetected}) => declared != null && !isDetected);
  const contradicted = findings.filter(
    ({declared, requirement}) =>
      declared != null && requirement != null && declared !== requirement,
  );

  // Both need a judgement call the metadata has no way to record, so neither can be held at zero.
  // Strict mode only says how many there are, to keep an automated run quiet
  if (argv.flags.strict) {
    console.log(
      `\n${styleText('dim', `${undetected.length} declared rule(s) the probe did not reach, ${contradicted.length} whose requirement it read differently. Run \`nr type-info-rules\` for the detail.`)}`,
    );
  } else {
    report('Declared but nothing detected', undetected, ({declared}) =>
      styleText('yellow', String(declared)),
    );

    report(
      'Declared `true`, but observed to degrade instead of throwing',
      contradicted,
      ({declared, requirement, reasons}) =>
        `declared ${styleText('yellow', String(declared))}, observed ${styleText('yellow', String(requirement))} ${reasons.join(' | ')}`,
    );

    console.log(`\n${styleText('dim', CAVEAT)}`);
  }

  if (!argv.flags.strict || undeclared.length === 0) {
    return;
  }

  logger.error(
    `${undeclared.length} rule(s) consume type information without saying so. Declare each one in its plugin metadata file, or record why it does not count with \`requiresTypeInfo: [false, 'reason']\``,
  );
  process.exitCode = 1;
};

await main();
