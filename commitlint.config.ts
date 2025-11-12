import type {UserConfig} from '@commitlint/types';

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-length': [2, 'always', 150],
    'body-max-line-length': [0],
    'subject-full-stop': [0], // Sometimes full stop is used for shorthands
    // `sentence-case`, `start-case` sometimes useful if commit message starts with a proper name
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
  },
} satisfies UserConfig;
