import {eslintConfig} from './src';

export default eslintConfig({
  configs: {
    vue: {
      files: ['*.vue'],
    },
    yaml: true,
    toml: true,
    json: true,
  },
});
