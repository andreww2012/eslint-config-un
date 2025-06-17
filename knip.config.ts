import type {KnipConfig} from 'knip';
import packageJson from './package.json' with {type: 'json'};

const config: KnipConfig = {
  ignore: ['test/**', '@graphql-eslint/eslint-plugin'],
  ignoreDependencies: Object.entries(packageJson.peerDependenciesMeta)
    .filter(([, meta]) => meta.optional)
    .map(([name]) => name),
  tags: ['knipignore'],
};

export default config;
