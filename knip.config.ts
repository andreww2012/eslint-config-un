import type {KnipConfig} from 'knip';

const config: KnipConfig = {
  ignore: ['test/**/fixtures/**'],
  entry: [
    '.ncurc.cjs', // cspell:disable-line
  ],
  ignoreDependencies: ['@eslint/core'],
  tags: ['-knipignore'],
  treatConfigHintsAsErrors: true,
};

export default config;
