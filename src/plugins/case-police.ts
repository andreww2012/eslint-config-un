import {definePluginMetadata} from './shared';

export default definePluginMetadata('case-police', {
  configs: ['casePolice'],
  docsUrl: 'https://github.com/antfu/case-police/blob/HEAD/README.md',
  rules: {
    'string-check': {
      stylistic: true,
      autofixDisabled: [true, 'may alter JS strings, object properties, etc'],
    },
  },
});
