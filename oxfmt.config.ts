import {defineConfig} from 'oxfmt';

export default defineConfig({
  printWidth: 100,
  singleQuote: true,
  bracketSpacing: false,

  // `package.json` is sorted by `eslint-plugin-package-json`
  sortPackageJson: false,

  // JSON and Markdown are formatted by ESLint
  ignorePatterns: [
    '*.json',
    '*.md',
    '.claude/',
    'src/eslint-types.d.ts',
    'test/**/fixtures/**',
    'test/__mocks__/loader/packages/',
    'pnpm-lock.yaml',
  ],
});
