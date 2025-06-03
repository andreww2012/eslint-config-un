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
      console.log(`\t${peerDependencyName}`, styleText('gray', peerDependencyRange));
    }
  }
}
