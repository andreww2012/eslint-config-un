import {commitlintConfig} from '@andreww2012/commitlint-config';

export default commitlintConfig({
  spelling: {
    ignoreWords: ['subdependencies', 'vulns'], // cspell:disable-line
  },
});
