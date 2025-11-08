import {eslintConfigInternal} from '../src/config-un/config';
import {generateAngularPluginsWithOldRules} from './shared';

const {plugin: pluginAngular, pluginTemplate: pluginAngularTemplate} =
  await generateAngularPluginsWithOldRules();

await eslintConfigInternal(
  {
    loadPluginsOnDemand: false,
    pluginsOverrides: {
      '@angular-eslint': pluginAngular,
      '@angular-eslint/template': pluginAngularTemplate,
    },
    configs: {
      // Ensure all rules are enabled
      es: {
        ecmaVersion: 5,
        ecmaFeatures: {5: {default: false}},
      },
    },
  },
  {testMode: true},
);
