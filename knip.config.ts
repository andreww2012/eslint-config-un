import type {KnipConfig} from 'knip';

const config: KnipConfig = {
  ignore: ['test/**/fixtures/**'],
  entry: [
    '.ncurc.cjs', // cspell:disable-line
  ],
  ignoreDependencies: [
    '@eslint/core',
    'yaml-eslint-parser', // Pre-loaded in src/loaders/plugins.ts
  ],
  tags: ['-knipignore'],
  treatConfigHintsAsErrors: true,
};

export default config;
