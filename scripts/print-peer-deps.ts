// cspell:ignore jsons
import {styleText} from 'node:util';
import {uniqBy} from 'es-toolkit';
import packageJson from '../package.json' with {type: 'json'};
import {fetchPackageInfo} from '../src/utils';

const dependenciesUnique: {
  packageName: string;
  isDev?: boolean;
}[] = uniqBy(
  [
    ...Object.keys(packageJson.dependencies).map((packageName) => ({packageName, isDev: false})),
    ...Object.keys(packageJson.devDependencies).map((packageName) => ({packageName, isDev: true})),
  ],
  (v) => v.packageName,
  // eslint-disable-next-line unicorn/no-array-sort
).sort(({packageName: a}, {packageName: b}) => a.localeCompare(b));

const packageJsonsResult = await Promise.all(
  dependenciesUnique.map(async (dependency) => {
    const packageInfo = await fetchPackageInfo(dependency.packageName);
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
    !packageInfo?.info ||
    !packageName.includes('eslint') ||
    DEPENDENCIES_TO_SKIP.has(packageName)
  ) {
    continue;
  }

  const {peerDependencies} = packageInfo.info;
  if (Object.keys(peerDependencies || {}).length > 0) {
    console.log(
      styleText('blue', packageName),
      styleText('bgGray', packageInfo.info.version || '[version unknown]'),
      isDev ? styleText('bgGreenBright', ' DEV ') : '',
    );
    for (const [peerDependencyName, peerDependencyRange] of Object.entries(
      peerDependencies || {},
    )) {
      const isOptional = packageInfo.info.peerDependenciesMeta?.[peerDependencyName]?.optional;
      console.log(
        '\t',
        WELL_KNOWN_PEER_DEPENDENCIES.has(peerDependencyName)
          ? styleText('gray', peerDependencyName)
          : isOptional
            ? peerDependencyName
            : styleText(isDev ? 'yellow' : 'red', peerDependencyName),
        styleText('gray', peerDependencyRange),
        styleText('greenBright', isOptional ? '[optional]' : ''),
      );
    }
  }
}
