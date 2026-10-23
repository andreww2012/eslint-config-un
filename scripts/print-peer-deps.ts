// cspell:ignore jsons
import {styleText} from 'node:util';
import {arrayUnique} from '@andreww2012/unutils';
import packageJson from '../package.json' with {type: 'json'};
import {fetchPackageInfo} from '../src/utils/package-detection';

const dependenciesUnique: readonly {
  packageName: string;
  isDev?: boolean;
}[] = arrayUnique(
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

const DEPENDENCIES_TO_SKIP: ReadonlySet<string> = new Set([
  'eslint',
  'eslint-typegen',
  '@eslint/config-inspector',
] satisfies readonly (keyof typeof packageJson.devDependencies)[]);

const WELL_KNOWN_PEER_DEPENDENCIES: ReadonlySet<string> = new Set([
  'eslint',
  'typescript',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/utils',
  '@typescript-eslint/parser',
  '@typescript-eslint/types',
]);

packageJsonsResult.forEach(({packageName, isDev, packageInfo}) => {
  if (
    !packageInfo?.info ||
    !packageName.includes('eslint') ||
    DEPENDENCIES_TO_SKIP.has(packageName)
  ) {
    return;
  }

  const {peerDependencies = {}} = packageInfo.info;
  if (Object.keys(peerDependencies).length === 0) {
    return;
  }

  console.log(
    styleText('blue', packageName),
    styleText('bgGray', packageInfo.info.version || '[version unknown]'),
    isDev ? styleText('bgGreenBright', ' DEV ') : '',
  );
  Object.entries(peerDependencies).forEach(([peerDependencyName, peerDependencyRange]) => {
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
  });
});
