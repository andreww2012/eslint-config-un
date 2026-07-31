import fs from 'node:fs';
import path from 'node:path';
import type {KnipConfig} from 'knip';

const config: KnipConfig = {
  ignore: [
    'test/**/fixtures/**',
    // Since v6.30.0, it started to report unresolved imports in the `dist` directory for some reason
    ...(fs.existsSync(path.join(import.meta.dirname, 'dist')) ? ['dist/**'] : []),
  ],
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
