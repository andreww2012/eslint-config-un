import {type ObjectValues, isKeyIn, objectValuesUnsafe} from '@andreww2012/unutils';
import type {CategorizeRule, RuleCategorization} from './shared';

const UNICORN_LANGUAGES_TO_CATEGORIES = {
  '*': 'anyLanguage',
  'js/js': 'js',
  'css/css': 'css',
  'html/html': 'html',
  'json/json': 'json',
  'json/jsonc': 'json',
  'json/json5': 'json',
  'markdown/commonmark': 'markdown',
  'markdown/gfm': 'markdown',
  'yml/yaml': 'yaml',
} as const;

const categorizeUnicornRule: CategorizeRule<
  ObjectValues<typeof UNICORN_LANGUAGES_TO_CATEGORIES>
> = ({rule}) => {
  const {languages} = rule.meta || {};
  if (!Array.isArray(languages)) {
    return {categories: [], errors: ['does not declare `meta.languages`']};
  }

  const errors: string[] = [];
  const categories = [
    ...new Set(
      languages
        .map((language) => {
          if (isKeyIn(language, UNICORN_LANGUAGES_TO_CATEGORIES)) {
            return UNICORN_LANGUAGES_TO_CATEGORIES[language];
          }
          errors.push(`unknown language \`${language}\``);
          return null;
        })
        .filter((v) => v != null),
    ),
  ];

  return {categories, errors};
};

export const unicornRuleCategorization = {
  categories: objectValuesUnsafe(UNICORN_LANGUAGES_TO_CATEGORIES),
  createRuleCategorizer: () => categorizeUnicornRule,
} satisfies RuleCategorization<ObjectValues<typeof UNICORN_LANGUAGES_TO_CATEGORIES>>;
