// cspell:ignore jsons
// eslint-disable-next-line node/no-unsupported-features/node-builtins
import {styleText} from 'node:util';
import {uniqBy} from 'es-toolkit';
import {getPackageInfo} from 'local-pkg';
import packageJson from '../package.json' with {type: 'json'};

const dependenciesUnique: {
  packageName: string;
  isDev?: boolean;
}[] = uniqBy(
  [
    ...Object.keys(packageJson.dependencies).map((packageName) => ({packageName, isDev: false})),
    ...Object.keys(packageJson.devDependencies).map((packageName) => ({packageName, isDev: true})),
  ],
  (v) => v.packageName,
).sort(({packageName: a}, {packageName: b}) => a.localeCompare(b));

const packageJsonsResult = await Promise.all(
  dependenciesUnique.map(async (dependency) => {
    const packageInfo = await getPackageInfo(dependency.packageName);
    return {
      ...dependency,
      packageInfo,
    };
  }),
);

const DEPENDENCIES_TO_SKIP = new Set<string>([
  'eslint',
  'eslint-typegen',
  '@eslint/config-inspector',
] satisfies (keyof typeof packageJson.devDependencies)[]);

const WELL_KNOWN_PEER_DEPENDENCIES = new Set<string>([
  'eslint',
  'typescript',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/utils',
  '@typescript-eslint/parser',
  '@typescript-eslint/types',
]);

for (const {packageName, isDev, packageInfo} of packageJsonsResult) {
  if (
    !packageInfo?.packageJson ||
    !packageName.includes('eslint') ||
    DEPENDENCIES_TO_SKIP.has(packageName)
  ) {
    continue;
  }

  const {peerDependencies} = packageInfo.packageJson;
  if (Object.keys(peerDependencies || {}).length > 0) {
    console.log(
      styleText('yellow', packageName),
      styleText('bgGray', packageInfo.version || '[version unknown]'),
      isDev ? styleText('bgGreenBright', ' DEV ') : '',
    );
    for (const [peerDependencyName, peerDependencyRange] of Object.entries(
      peerDependencies || {},
    )) {
      // eslint-disable-next-line ts/no-unsafe-assignment
      const isOptional =
        // eslint-disable-next-line ts/no-unsafe-member-access
        packageInfo.packageJson.peerDependenciesMeta?.[peerDependencyName]?.optional;
      console.log(
        '\t',
        WELL_KNOWN_PEER_DEPENDENCIES.has(peerDependencyName)
          ? styleText('gray', peerDependencyName)
          : isOptional
            ? peerDependencyName
            : styleText('red', peerDependencyName),
        styleText('gray', peerDependencyRange),
        styleText('greenBright', isOptional ? '[optional]' : ''),
      );
    }
  }
}
