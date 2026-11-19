import {commitlintConfig} from '@andreww2012/commitlint-config';

export default commitlintConfig({
  spelling: {
    ignoreWords: [
      'subdependencies', // cspell:disable-line
      'vulns', // cspell:disable-line
    ],
  },
  coAuthors: {
    deny: ['ai'],
  },
});
