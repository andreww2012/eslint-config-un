// cspell:ignore ncurc
import type {KnipConfig} from 'knip';
import packageJson from './package.json' with {type: 'json'};

const config: KnipConfig = {
  ignore: ['test/**', '.ncurc.cjs'],
  ignoreDependencies: Object.entries(packageJson.peerDependenciesMeta)
    .filter(([, meta]) => meta.optional)
    .map(([name]) => name),
  tags: ['-knipignore'],
  treatConfigHintsAsErrors: true,
};

export default config;
