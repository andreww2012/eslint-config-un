import type * as Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type {AST} from 'vue-eslint-parser';
import {IGNORED_ELEMENTS_OPTION_SCHEMA, defineElementVisitor} from '../vue-template';

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    whitespace: {
      enum: ['condense', 'preserve'],
    },
    ignoredElements: IGNORED_ELEMENTS_OPTION_SCHEMA,
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

// Vue treats only these characters as whitespace
const WHITESPACE_ONLY_REGEX = /^[\t\n\f\r ]*$/;
const TRAILING_WHITESPACE_REGEX = /(?<![\t\n\f\r ])[\t\n\f\r ]+$/;
const NEWLINE_REGEX = /[\n\r]/;

// Elements with these directives may render nothing or be hidden
const OPTIONAL_ELEMENT_DIRECTIVES: ReadonlySet<string> = new Set(['else-if', 'for', 'if', 'show']);

const isWhitespaceOnly = (node: AST.VElement['children'][number]) =>
  node.type === 'VText' && WHITESPACE_ONLY_REGEX.test(node.value);

const isOptionalElement = (node: AST.VElement['children'][number]) =>
  node.type === 'VElement' &&
  node.startTag.attributes.some(
    (attribute) => attribute.directive && OPTIONAL_ELEMENT_DIRECTIVES.has(attribute.key.name.name),
  );

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow whitespace that Vue keeps at the end of a template element, where browsers show it when the text is selected',
    },
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: [
      {
        whitespace: 'condense',
        ignoredElements: [],
      },
    ] satisfies [RuleOptions],
    messages: {
      trailing:
        'Vue keeps this whitespace at the end of the element, and some browsers show it when the text is selected. Remove it.',
      beforeOptional:
        'Vue keeps this whitespace, and it ends the element when the elements after it are not rendered or hidden. Move it into the next element.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const options = context.options[0] as RuleOptions | undefined;
    const isCondensed = options?.whitespace !== 'preserve';

    const report = (start: number, end: number, messageId: 'trailing' | 'beforeOptional') => {
      context.report({
        loc: {start: sourceCode.getLocFromIndex(start), end: sourceCode.getLocFromIndex(end)},
        messageId,
      });
    };

    return defineElementVisitor(context, options?.ignoredElements, ({children}) => {
      // Anything after the last content that is always rendered may render nothing
      const lastIndex = children.findLastIndex(
        (child) => !isWhitespaceOnly(child) && !isOptionalElement(child),
      );
      const optionalChildren = children.slice(lastIndex + 1);

      const last = children[lastIndex];
      if (last?.type === 'VText') {
        const whitespace = TRAILING_WHITESPACE_REGEX.exec(
          sourceCode.text.slice(...last.range),
        )?.[0];
        if (whitespace != null) {
          report(
            last.range[1] - whitespace.length,
            last.range[1],
            optionalChildren.some((child) => child.type === 'VElement')
              ? 'beforeOptional'
              : 'trailing',
          );
        }
      }

      optionalChildren.forEach((child, index) => {
        const previous = children[lastIndex + index];
        // Vue drops it at the edges, and in `condense` mode also between elements on separate lines
        if (
          previous != null &&
          index < optionalChildren.length - 1 &&
          child.type === 'VText' &&
          !(isCondensed && previous.type === 'VElement' && NEWLINE_REGEX.test(child.value))
        ) {
          report(child.range[0], child.range[1], 'beforeOptional');
        }
      });
    });
  },
};

export {rule as vueNoTrailingElementWhitespace};
