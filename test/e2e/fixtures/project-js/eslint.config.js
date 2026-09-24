import {eslintConfig} from 'eslint-config-un';

export default eslintConfig({
  configs: {
    // aube's global virtual store shares hoisted packages between projects, so the `remeda` of the other fixture is detected
    remeda: false,
  },
});
