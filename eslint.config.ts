import {defineConfig} from 'eslint/config';
import {eslintConfig} from './src';

export default defineConfig(
  eslintConfig({
    configs: {
      deMorgan: true,
      vue: {
        files: ['*.vue'],
      },
      yaml: true,
      toml: true,
      json: true,
      packageJson: true,
    },
  }),
);
