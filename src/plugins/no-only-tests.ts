import {definePluginMetadata} from './shared';

export default definePluginMetadata('no-only-tests', {
  configs: ['noOnlyTests'],
  docsUrl: 'https://github.com/levibuzolic/eslint-plugin-no-only-tests/blob/HEAD/README.md',
  directDependencyReason:
    'Tiny and commonly enabled through the sub-configs of the test framework Configs',
  rules: {},
});
