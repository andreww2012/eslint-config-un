import type {KnipConfig} from 'knip';

const config: KnipConfig = {
  ignore: ['test/**/fixtures/**'],
  entry: [
    '.ncurc.js', // cspell:disable-line
    '.puppeteerrc.js', // cspell:disable-line
  ],
  ignoreDependencies: ['@eslint/core', 'lychee-config-nick2bad4u'],
  tags: ['-knipignore'],
  treatConfigHintsAsErrors: true,
  cycles: {
    allow: [['src/utils.ts', 'src/utils/assign-defaults.ts']],
  },
};

export default config;
