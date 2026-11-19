import type * as Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type {AST} from 'vue-eslint-parser';
import {
  IGNORED_ELEMENTS_OPTION_SCHEMA,
  defineElementVisitor,
  isWhitespaceOnly,
} from '../vue-template';

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    ignoredElements: IGNORED_ELEMENTS_OPTION_SCHEMA,
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

// Vue treats only these characters as whitespace
const LEADING_WHITESPACE_REGEX = /^[\t\n\f\r ]+(?=[^\t\n\f\r ])/;
const ENDING_WHITESPACE_REGEX = /[\t\n\f\r ]$/;

const rule: Eslint.JSRuleDefinition<{RuleOptions: [RuleOptions?]}> = {
  meta: {
    type: 'layout',
    docs: {
      description:
        'Disallow whitespace between the opening tag and the text of a Vue template element that only has text',
    },
    fixable: 'whitespace',
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: [
      {
        ignoredElements: [],
      },
    ] satisfies readonly [RuleOptions],
    messages: {
      leading: 'Start the text right after the opening tag.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const [options] = context.options;
    const getText = (node: AST.HasLocation) => sourceCode.text.slice(...node.range);

    // The whitespace at the start of such an element is what separates its text from that content
    const isRightAfterContent = (element: AST.VElement): boolean => {
      const {parent} = element;
      // The content before the component is in the templates that use it
      if (parent.type !== 'VElement') {
        return false;
      }

      const index = parent.children.indexOf(element);
      // Vue drops the whitespace at the start of an element, so the text starts where the parent
      // does
      if (parent.children.slice(0, index).every(isWhitespaceOnly)) {
        return isRightAfterContent(parent);
      }

      const previous = parent.children[index - 1];
      return previous?.type !== 'VText' || !ENDING_WHITESPACE_REGEX.test(getText(previous));
    };

    return defineElementVisitor(context, options?.ignoredElements, (element) => {
      const [text, ...rest] = element.children;
      // Formatters put the content of the root `<template>` on separate lines
      if (text?.type !== 'VText' || rest.length > 0 || element.parent.type !== 'VElement') {
        return;
      }

      const whitespace = LEADING_WHITESPACE_REGEX.exec(getText(text))?.[0];
      if (whitespace == null || isRightAfterContent(element)) {
        return;
      }

      const [start] = text.range;
      const end = start + whitespace.length;
      context.report({
        loc: {start: sourceCode.getLocFromIndex(start), end: sourceCode.getLocFromIndex(end)},
        messageId: 'leading',
        fix: (fixer) => fixer.removeRange([start, end]),
      });
    });
  },
};

export {rule as vueNoLeadingTextWhitespace};
