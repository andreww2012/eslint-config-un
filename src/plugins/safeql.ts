import {definePluginMetadata} from './shared';

export default definePluginMetadata('safeql', {
  configs: ['safeql'],
  docsUrl: 'https://safeql.dev',
  gitTag: (version) => `@ts-safeql/eslint-plugin@${version}`,
  suggestedPrefix: ['@ts-safeql', 'more concise and convenient to use; `@` feels redundant'],
  rules: {
    'check-sql': {
      requiresTypeInfo: [true, 'reports every matched query as invalid instead of throwing'],
      requiresNetwork: [true, 'connects to a PostgreSQL server, possibly a remote one'],
      disableInCodeBlocks: 'typeAware',
    },
  },
});
