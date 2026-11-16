import type * as Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {AST} from 'vue-eslint-parser';
import {toKebabCase} from '../utils';

export type ElementChild = AST.VElement['children'][number];

// Vue keeps the whitespace inside these as written
const PREFORMATTED_ELEMENT_NAMES: ReadonlySet<string> = new Set(['pre', 'textarea']);

// Vue treats only these characters as whitespace
const WHITESPACE_ONLY_REGEX = /^[\t\n\f\r ]*$/;

export const IGNORED_ELEMENTS_OPTION_SCHEMA = {
  type: 'array',
  items: {
    type: 'string',
  },
  uniqueItems: true,
} as const satisfies JSONSchema4;

export const isWhitespaceOnly = (node: ElementChild) =>
  node.type === 'VText' && WHITESPACE_ONLY_REGEX.test(node.value);

export const defineElementVisitor = (
  context: Eslint.Rule.RuleContext,
  ignoredElements: readonly string[] | undefined,
  visitElement: (element: AST.VElement) => void,
) => {
  // eslint-disable-next-line ts/no-unsafe-assignment -- ESLint types parser services as `any`
  const services: {
    defineTemplateBodyVisitor?: (visitor: {
      VElement: (element: AST.VElement) => void;
    }) => Eslint.Rule.RuleListener;
    // Other languages, like Markdown, have no parser services
  } = context.sourceCode.parserServices || {};

  const ignoredElementNames = new Set(ignoredElements?.map((name) => toKebabCase(name)));
  const isIgnored = (element: AST.VElement): boolean =>
    PREFORMATTED_ELEMENT_NAMES.has(element.name) ||
    ignoredElementNames.has(toKebabCase(element.rawName)) ||
    (element.parent.type === 'VElement' && isIgnored(element.parent));

  return (
    services.defineTemplateBodyVisitor?.({
      VElement: (element) => {
        if (!isIgnored(element)) {
          visitElement(element);
        }
      },
    }) || {}
  );
};
