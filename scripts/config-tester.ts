import {eslintConfigInternal} from '../src/config';
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
  },
  {testMode: true},
);
