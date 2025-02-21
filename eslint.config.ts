import {eslintConfig} from './src';

export default eslintConfig({
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
});
