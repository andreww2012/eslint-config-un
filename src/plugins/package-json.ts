import {definePluginMetadata} from './shared';

// Hand-written rules, documented outside the sections of the rules generated per property
const RULES_OUTSIDE_PROPERTY_SECTIONS: ReadonlySet<string> = new Set([
  'require-attribution',
  'require-package-json-export',
  'valid-peerDependenciesMeta-relationship',
  'valid-repository-directory',
]);

const PROPERTY_RULE_KIND_REGEX = /^(require|valid)-/;

export default definePluginMetadata('package-json', {
  configs: ['packageJson'],
  docsUrl: 'https://github.com/michaelfaith/eslint-plugin-package-json/blob/HEAD/README.md',
  ruleDocsUrl: (ruleName) => {
    const propertyRuleKind = RULES_OUTSIDE_PROPERTY_SECTIONS.has(ruleName)
      ? undefined
      : PROPERTY_RULE_KIND_REGEX.exec(ruleName)?.[1];
    return `https://eslint-plugin-package-json.dev/rules/${propertyRuleKind ? `${propertyRuleKind}-properties/` : ''}${ruleName}`;
  },
  rules: {
    'bin-name-casing': {stylistic: true},
    'no-empty-fields': {stylistic: true},
    'order-properties': {stylistic: true},
    'scripts-name-casing': {stylistic: true},
    'sort-collections': {stylistic: true},
  },
});
