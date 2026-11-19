import ourPackageJson from '../../package.json' with {type: 'json'};

export const PLUGIN_META: Readonly<{name: string; version: string}> = {
  name: 'eslint-plugin-un-html-scripts',
  version: ourPackageJson.version,
};
