import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/types';
import type * as Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type * as ts from 'typescript';

type TypeAssertion = TSESTree.TSAsExpression | TSESTree.TSTypeAssertion;

// Vue templates have a token store of their own
type TokenStore = Pick<
  Eslint.SourceCode,
  'getTokenAfter' | 'getTokenBefore' | 'getTokenByRangeStart'
>;

interface TypeInformation {
  checker: ts.TypeChecker;
  getTsNode: (node: TSESTree.Node) => ts.Node | undefined;
}

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    allowedTypes: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
    allowWidening: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const WHITESPACE_REGEX = /\s+/gu;

const removeWhitespace = (text: string) => text.replaceAll(WHITESPACE_REGEX, '');

const isAsToken = (token: Eslint.AST.Token) => token.value === 'as';
const isClosingAngleBracketToken = (token: Eslint.AST.Token) => token.value === '>';
const isEqualsToken = (token: Eslint.AST.Token) => token.value === '=';

const isConstAssertion = (typeNode: TSESTree.TypeNode) =>
  typeNode.type === AST_NODE_TYPES.TSTypeReference &&
  typeNode.typeName.type === AST_NODE_TYPES.Identifier &&
  typeNode.typeName.name === 'const';

// Where the type ends without its type arguments, like `PropType` of `PropType<User>`
const getTypeNameEnd = (typeNode: TSESTree.TypeNode) => {
  switch (typeNode.type) {
    case AST_NODE_TYPES.TSImportType:
    case AST_NODE_TYPES.TSTypeQuery:
    case AST_NODE_TYPES.TSTypeReference: {
      return typeNode.typeArguments?.range[0] || typeNode.range[1];
    }

    default: {
      return typeNode.range[1];
    }
  }
};

// Unlike the text, tokens ignore whitespace and comments
const getTokenValues = (tokenStore: TokenStore, [start, end]: TSESTree.Range) => {
  const values: string[] = [];
  let token = tokenStore.getTokenByRangeStart(start);
  while (token != null && token.range[1] <= end) {
    values.push(token.value);
    token = tokenStore.getTokenAfter(token);
  }
  return values.join(' ');
};

// `any` is assignable to anything and the other way around, so it would make any assertion pass
const containsAny = (
  type: ts.Type & Pick<ts.TypeReference, 'typeArguments'>,
  anyType: ts.Type,
  visitedTypes: Set<ts.Type>,
): boolean => {
  if (visitedTypes.has(type)) {
    return false;
  }

  visitedTypes.add(type);
  return (
    type.flags === anyType.flags ||
    [
      ...(type.isUnionOrIntersection() ? type.types : []),
      ...(type.typeArguments || []),
      ...(type.aliasTypeArguments || []),
    ].some((member) => containsAny(member, anyType, visitedTypes))
  );
};

// The same check as `satisfies` does, excess properties of object literals included
const isWidening = ({checker, getTsNode}: TypeInformation, node: TypeAssertion) => {
  const expressionTsNode = getTsNode(node.expression);
  const typeTsNode = getTsNode(node.typeAnnotation);
  if (expressionTsNode == null || typeTsNode == null) {
    return false;
  }

  const expressionType = checker.getTypeAtLocation(expressionTsNode);
  const assertedType = checker.getTypeAtLocation(typeTsNode);
  const anyType = checker.getAnyType();
  const visitedTypes = new Set<ts.Type>();
  if ([expressionType, assertedType].some((type) => containsAny(type, anyType, visitedTypes))) {
    return false;
  }

  try {
    return checker.isTypeAssignableTo(expressionType, assertedType);
  } catch {
    // TypeScript may overflow the stack here: https://github.com/microsoft/TypeScript/issues/62933
    return false;
  }
};

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow type assertions, except the ones that are always safe: `as const`, `as unknown` and `satisfies T as T`',
    },
    hasSuggestions: true,
    schema: [RULE_OPTIONS_SCHEMA],
    defaultOptions: [
      {
        // Vue types runtime prop declarations with `type: Object as PropType<T>`
        allowedTypes: ['PropType'],
        allowWidening: false,
      },
    ] satisfies [RuleOptions],
    messages: {
      noTypeAssertion:
        'Type assertions are not allowed, because TypeScript does not check that they are correct. Narrow the type with a runtime check, or use a type annotation or `satisfies T as T` instead.',
      replaceWithAnnotation: 'Replace the assertion with a type annotation',
      replaceWithSatisfies: 'Check the assertion with `satisfies`',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const options = context.options[0] as RuleOptions | undefined;
    const allowedTypes = new Set(options?.allowedTypes?.map(removeWhitespace));

    // eslint-disable-next-line ts/no-unsafe-assignment -- ESLint types parser services as `any`
    const parserServices: {
      program?: ts.Program | null;
      esTreeNodeToTSNodeMap?: {get: (node: TSESTree.Node) => ts.Node | undefined};
      defineTemplateBodyVisitor?: (
        templateBodyVisitor: Record<string, (node: TypeAssertion) => void>,
        scriptVisitor: Record<string, (node: TypeAssertion) => void>,
      ) => Record<string, (node: TypeAssertion) => void>;
      getTemplateBodyTokenStore?: () => TokenStore;
    } = sourceCode.parserServices;
    const {program, esTreeNodeToTSNodeMap} = parserServices;
    // No type information is available for Vue templates
    const scriptTypeInformation: TypeInformation | undefined =
      program && esTreeNodeToTSNodeMap
        ? {checker: program.getTypeChecker(), getTsNode: (node) => esTreeNodeToTSNodeMap.get(node)}
        : undefined;

    const getText = ([start, end]: TSESTree.Range) => sourceCode.text.slice(start, end);

    const isAllowedType = (typeNode: TSESTree.TypeNode) =>
      [typeNode.range[1], getTypeNameEnd(typeNode)].some((end) =>
        allowedTypes.has(removeWhitespace(getText([typeNode.range[0], end]))),
      );

    // Suggestions need type information, so they are only built for the script part
    const getAnnotationFix = (
      node: TypeAssertion,
      operatorToken: Eslint.AST.Token,
      typeText: string,
    ) => {
      const {parent} = node;
      const canBeAnnotated =
        (parent.type === AST_NODE_TYPES.VariableDeclarator &&
          parent.init === node &&
          parent.id.typeAnnotation == null) ||
        (parent.type === AST_NODE_TYPES.PropertyDefinition &&
          parent.value === node &&
          parent.typeAnnotation == null);
      const firstToken = canBeAnnotated ? sourceCode.getTokenByRangeStart(node.range[0]) : null;
      const equalsToken = firstToken && sourceCode.getTokenBefore(firstToken, isEqualsToken);
      const annotationTarget = equalsToken && sourceCode.getTokenBefore(equalsToken);
      // `as T`, or `<T>` together with the whitespace after it
      const assertionStart =
        node.type === AST_NODE_TYPES.TSAsExpression
          ? sourceCode.getTokenBefore(operatorToken)?.range[1]
          : node.range[0];
      const assertionEnd =
        node.type === AST_NODE_TYPES.TSAsExpression
          ? node.range[1]
          : sourceCode.getTokenAfter(operatorToken)?.range[0];

      return annotationTarget && assertionStart != null && assertionEnd != null
        ? (fixer: Eslint.Rule.RuleFixer) => [
            fixer.insertTextAfterRange(annotationTarget.range, `: ${typeText}`),
            fixer.removeRange([assertionStart, assertionEnd]),
          ]
        : undefined;
    };

    const getSuggestions = (
      node: TypeAssertion,
      operatorToken: Eslint.AST.Token,
    ): Eslint.Rule.SuggestionReportDescriptor[] => {
      const typeText = getText(node.typeAnnotation.range);
      const annotationFix = getAnnotationFix(node, operatorToken, typeText);
      return [
        ...(annotationFix ? [{messageId: 'replaceWithAnnotation', fix: annotationFix}] : []),
        {
          messageId: 'replaceWithSatisfies',
          fix: (fixer) =>
            node.type === AST_NODE_TYPES.TSAsExpression
              ? fixer.insertTextBeforeRange(operatorToken.range, `satisfies ${typeText} `)
              : // `<T>value satisfies T` would check the assertion instead of the value
                fixer.replaceTextRange(
                  [operatorToken.range[1], node.range[1]],
                  `(${getText([operatorToken.range[1], node.range[1]]).trim()} satisfies ${typeText})`,
                ),
        },
      ];
    };

    const checkAssertion = (
      node: TypeAssertion,
      tokenStore: TokenStore,
      typeInformation?: TypeInformation,
    ) => {
      const {expression, typeAnnotation} = node;
      if (
        isConstAssertion(typeAnnotation) ||
        typeAnnotation.type === AST_NODE_TYPES.TSUnknownKeyword ||
        isAllowedType(typeAnnotation) ||
        (expression.type === AST_NODE_TYPES.TSSatisfiesExpression &&
          getTokenValues(tokenStore, expression.typeAnnotation.range) ===
            getTokenValues(tokenStore, typeAnnotation.range))
      ) {
        return;
      }

      const isWideningAssertion = typeInformation != null && isWidening(typeInformation, node);
      if (isWideningAssertion && options?.allowWidening) {
        return;
      }

      const isAs = node.type === AST_NODE_TYPES.TSAsExpression;
      const boundaryToken = tokenStore.getTokenByRangeStart(
        (isAs ? typeAnnotation : expression).range[0],
      );
      const operatorToken =
        boundaryToken &&
        tokenStore.getTokenBefore(boundaryToken, isAs ? isAsToken : isClosingAngleBracketToken);

      context.report({
        loc: operatorToken
          ? {
              start: isAs ? operatorToken.loc.start : node.loc.start,
              end: isAs ? node.loc.end : operatorToken.loc.end,
            }
          : node.loc,
        messageId: 'noTypeAssertion',
        ...(isWideningAssertion && operatorToken && {suggest: getSuggestions(node, operatorToken)}),
      });
    };

    const createVisitor = (tokenStore: TokenStore, typeInformation?: TypeInformation) => {
      const visit = (node: TypeAssertion) => {
        checkAssertion(node, tokenStore, typeInformation);
      };
      return {TSAsExpression: visit, TSTypeAssertion: visit};
    };

    const scriptVisitor = createVisitor(sourceCode, scriptTypeInformation);
    const templateTokenStore = parserServices.getTemplateBodyTokenStore?.();
    return ((templateTokenStore &&
      parserServices.defineTemplateBodyVisitor?.(
        createVisitor(templateTokenStore),
        scriptVisitor,
      )) ||
      // ESLint types have no way of expressing a node type for a selector unknown to them
      scriptVisitor) as unknown as Eslint.Rule.RuleListener;
  },
};

export {rule as noTypeAssertion};
