import {findVariable} from '@eslint-community/eslint-utils';
import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/types';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type * as ts from 'typescript';
import type {OmitStrict} from '../../types';

// `sparse` arrays have holes, which loops visit, but `forEach` skips
type ArrayState = 'array' | 'nonArray' | 'sparse' | 'unknown';

interface Candidate {
  receiver: ESTree.Node;
  body: ESTree.Statement;
  isKnownArray: boolean;
  element: string;
  index?: string;
  /** Changes to the body of a classic `for` loop, which reads the element by its index */
  replacements: readonly (readonly [range: Eslint.AST.Range, text: string])[];
  continueStatements: ESTree.ContinueStatement[];
}

const KNOWN_ARRAY_FACTORIES: ReadonlySet<string> = new Set([
  'Array.from',
  'Array.of',
  'Object.entries',
  'Object.keys',
  'Object.values',
]);

const ARRAY_TYPE_NAMES: ReadonlySet<string> = new Set(['Array', 'ReadonlyArray']);

const FUNCTION_TYPES: ReadonlySet<string> = new Set([
  'ArrowFunctionExpression',
  'FunctionDeclaration',
  'FunctionExpression',
  'StaticBlock',
]);

const LOOP_TYPES: ReadonlySet<string> = new Set([
  'DoWhileStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'WhileStatement',
]);

const BREAKABLE_TYPES: ReadonlySet<string> = new Set([...LOOP_TYPES, 'SwitchStatement']);

const TYPE_ONLY_WRAPPER_TYPES: ReadonlySet<string> = new Set([
  'TSAsExpression',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
]);

// Expressions that can be the object of a member access without parentheses
const MEMBER_OBJECT_TYPES: ReadonlySet<string> = new Set([
  'ArrayExpression',
  'CallExpression',
  'Identifier',
  'MemberExpression',
  'Super',
  'ThisExpression',
  'TSNonNullExpression',
]);

// A line starting with `(` or `[` continues these statements if they don't end with a semicolon
const EXPRESSION_ENDING_STATEMENT_TYPES: ReadonlySet<string> = new Set([
  'ExportDefaultDeclaration',
  'ExportNamedDeclaration',
  'ExpressionStatement',
  'ReturnStatement',
  'ThrowStatement',
  'VariableDeclaration',
]);

// ASI stands for "Automatic semicolon insertion"
const ASI_HAZARD_REGEX = /^[([]/;

const isIdentifierNamed = (node: ESTree.Node | null | undefined, name: string) =>
  node?.type === 'Identifier' && node.name === name;

const isArrayTypeNode = (typeNode: TSESTree.TypeNode | undefined): boolean => {
  switch (typeNode?.type) {
    case AST_NODE_TYPES.TSArrayType:
    case AST_NODE_TYPES.TSTupleType: {
      return true;
    }

    case AST_NODE_TYPES.TSTypeOperator: {
      return typeNode.operator === 'readonly' && isArrayTypeNode(typeNode.typeAnnotation);
    }

    case AST_NODE_TYPES.TSTypeReference: {
      return (
        typeNode.typeName.type === AST_NODE_TYPES.Identifier &&
        ARRAY_TYPE_NAMES.has(typeNode.typeName.name)
      );
    }

    case AST_NODE_TYPES.TSUnionType: {
      return typeNode.types.every(isArrayTypeNode);
    }

    default: {
      return false;
    }
  }
};

const getTypeAnnotationArrayState = ({
  typeAnnotation,
}: ESTree.Identifier & {typeAnnotation?: TSESTree.TSTypeAnnotation}): ArrayState =>
  isArrayTypeNode(typeAnnotation?.typeAnnotation)
    ? 'array'
    : typeAnnotation?.typeAnnotation.type === AST_NODE_TYPES.TSStringKeyword
      ? 'nonArray'
      : 'unknown';

const getArrayState = (
  node: ESTree.Node,
  scope: Eslint.Scope.Scope,
  shouldResolveIdentifiers = true,
): ArrayState => {
  switch (node.type) {
    case 'ArrayExpression': {
      return node.elements.includes(null) ? 'sparse' : 'array';
    }

    // `Array(length)` creates holes
    case 'CallExpression': {
      const {callee} = node;
      if (isIdentifierNamed(callee, 'Array')) {
        return 'sparse';
      }

      return callee.type === 'MemberExpression' &&
        callee.object.type === 'Identifier' &&
        callee.property.type === 'Identifier' &&
        !callee.computed &&
        KNOWN_ARRAY_FACTORIES.has(`${callee.object.name}.${callee.property.name}`)
        ? 'array'
        : 'unknown';
    }

    case 'NewExpression': {
      return isIdentifierNamed(node.callee, 'Array') ? 'sparse' : 'nonArray';
    }

    case 'Literal':
    case 'TemplateLiteral': {
      return 'nonArray';
    }

    case 'Identifier': {
      const variable = shouldResolveIdentifiers ? findVariable(scope, node) : null;
      const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
      if (variable == null || definition == null) {
        return 'unknown';
      }

      const typeAnnotationState = getTypeAnnotationArrayState(definition.name);
      if (typeAnnotationState !== 'unknown') {
        return typeAnnotationState;
      }

      // Resolving only one level deep is enough and rules out cycles
      return definition.type === 'Variable' &&
        definition.node.id === definition.name &&
        definition.node.init != null &&
        variable.references.every((reference) => reference.init || !reference.isWrite())
        ? getArrayState(definition.node.init, scope, false)
        : 'unknown';
    }

    default: {
      return 'unknown';
    }
  }
};

const hasTypeInformation = (
  parserServices: unknown,
): parserServices is {
  program: ts.Program;
  esTreeNodeToTSNodeMap: {get: (node: ESTree.Node) => ts.Node};
} =>
  typeof parserServices === 'object' &&
  parserServices != null &&
  'esTreeNodeToTSNodeMap' in parserServices &&
  'program' in parserServices &&
  parserServices.program != null;

const getTypeArrayState = (type: ts.Type, checker: ts.TypeChecker): ArrayState => {
  // A type parameter is judged by its constraint
  const constraint = checker.getBaseConstraintOfType(type) || type;
  if (constraint.isUnion()) {
    const memberStates = constraint.types.flatMap((member) =>
      // `for...of` and `forEach` throw on nullish values alike
      [checker.getNullType().flags, checker.getUndefinedType().flags].includes(member.flags)
        ? []
        : getTypeArrayState(member, checker),
    );
    return memberStates.every((state) => state === memberStates[0])
      ? memberStates[0] || 'unknown'
      : 'unknown';
  }

  // Branded arrays
  if (constraint.isIntersection()) {
    return constraint.types.some((member) => getTypeArrayState(member, checker) === 'array')
      ? 'array'
      : 'nonArray';
  }

  return [
    checker.getAnyType().flags,
    checker.getUnknownType().flags,
    checker.getNeverType().flags,
  ].includes(constraint.flags) || constraint.isTypeParameter()
    ? 'unknown'
    : // Also covers tuples and the subtypes of arrays, like `RegExpMatchArray`
      checker.isArrayLikeType(constraint)
      ? 'array'
      : 'nonArray';
};

const isStableReference = (node: ESTree.Node): boolean =>
  node.type === 'Identifier' ||
  node.type === 'ThisExpression' ||
  (node.type === 'MemberExpression' &&
    !node.computed &&
    !node.optional &&
    isStableReference(node.object));

// `array[index]` can't be replaced with the element where it's written to or called as a method
const isElementWriteOrCall = (
  target: ESTree.Node | undefined,
  parent: ESTree.Node | undefined,
  grandparent: ESTree.Node | undefined,
) => {
  switch (parent?.type) {
    case 'AssignmentExpression': {
      return parent.left === target;
    }

    case 'CallExpression': {
      return parent.callee === target;
    }

    case 'UnaryExpression': {
      return parent.operator === 'delete';
    }

    case 'Property': {
      return grandparent?.type === 'ObjectPattern';
    }

    case 'ArrayPattern':
    case 'AssignmentPattern':
    case 'ForInStatement':
    case 'ForOfStatement':
    case 'RestElement':
    case 'TaggedTemplateExpression':
    case 'UpdateExpression': {
      return true;
    }

    default: {
      return false;
    }
  }
};

const getStatementSiblings = (parent: Eslint.Rule.Node | null): readonly ESTree.Node[] => {
  switch (parent?.type) {
    case 'BlockStatement':
    case 'Program':
    case 'StaticBlock': {
      return parent.body;
    }

    case 'SwitchCase': {
      return parent.consequent;
    }

    default: {
      return [];
    }
  }
};

const getAvailableName = (usedNames: ReadonlySet<string>, suffix = 1): string => {
  const name = suffix === 1 ? 'element' : `element${suffix}`;
  return usedNames.has(name) ? getAvailableName(usedNames, suffix + 1) : name;
};

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer `Array#forEach()` over the `for` and `for...of` loops it can replace without a change in behavior',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      preferForEach: 'Use `.forEach(...)` instead of this loop.',
      replaceWithForEach:
        'Replace the loop with `.forEach(...)`. Only do this if the iterated value is an array.',
    },
  },

  create: (context) => {
    const {sourceCode} = context;
    const parserServices: unknown = sourceCode.parserServices;
    const candidates = new Map<ESTree.Node, Candidate>();

    const isInside = (node: ESTree.Node, container: ESTree.Node) => {
      const [start, end] = sourceCode.getRange(container);
      const [nodeStart] = sourceCode.getRange(node);
      return nodeStart >= start && nodeStart < end;
    };

    // Closest first, up to the nearest function
    const getAncestorsInFunction = (node: ESTree.Node) => {
      const ancestors = sourceCode.getAncestors(node);
      return ancestors
        .slice(ancestors.findLastIndex((ancestor) => FUNCTION_TYPES.has(ancestor.type)) + 1)
        .toReversed();
    };

    // For `await`, `yield`, `return` and `var`, which change their meaning inside a callback
    const discardEnclosingCandidates = (node: ESTree.Node) => {
      if (candidates.size > 0) {
        getAncestorsInFunction(node).forEach((ancestor) => {
          const candidate = candidates.get(ancestor);
          // `for (const element of await getArray())` is fine
          if (candidate && isInside(node, candidate.body)) {
            candidates.delete(ancestor);
          }
        });
      }
    };

    const discardJumpedOverCandidates = (
      node: ESTree.BreakStatement | ESTree.ContinueStatement,
      targetTypes: ReadonlySet<string>,
    ) => {
      if (candidates.size === 0) {
        return;
      }

      const {label} = node;
      const ancestors = getAncestorsInFunction(node);
      const targetIndex = ancestors.findIndex((ancestor) =>
        label
          ? ancestor.type === 'LabeledStatement' && ancestor.label.name === label.name
          : targetTypes.has(ancestor.type),
      );
      ancestors.slice(0, targetIndex + 1).forEach((ancestor) => {
        candidates.delete(ancestor);
      });
    };

    const needsLeadingSemicolon = (node: Eslint.Rule.Node) => {
      const siblings = getStatementSiblings(node.parent);
      const previous = siblings[siblings.indexOf(node) - 1];
      return (
        previous != null &&
        EXPRESSION_ENDING_STATEMENT_TYPES.has(previous.type) &&
        sourceCode.getLastToken(previous)?.value !== ';'
      );
    };

    // The whole line if the statement is alone on it
    const getRemovalRange = (statement: ESTree.Node): Eslint.AST.Range => {
      const {line} = sourceCode.getLoc(statement).start;
      return sourceCode.lines[line - 1]?.trim() === sourceCode.getText(statement)
        ? [
            sourceCode.getIndexFromLoc({line, column: 0}),
            sourceCode.getIndexFromLoc({line: line + 1, column: 0}),
          ]
        : sourceCode.getRange(statement);
    };

    // `const item = array[index]` opening the body, whose name the element parameter can take
    const getElementDeclaration = (
      body: ESTree.Statement,
      elementReads: readonly ESTree.Node[],
    ) => {
      const [statement] = body.type === 'BlockStatement' ? body.body : [];
      const declarator =
        statement?.type === 'VariableDeclaration' &&
        statement.kind === 'const' &&
        statement.declarations.length === 1
          ? statement.declarations[0]
          : undefined;
      const id: (ESTree.Pattern & {typeAnnotation?: unknown}) | undefined = declarator?.id;
      const init = declarator?.init;
      return statement != null &&
        declarator != null &&
        init != null &&
        id?.type === 'Identifier' &&
        id.typeAnnotation == null &&
        elementReads.includes(init) &&
        sourceCode.getCommentsInside(declarator).length === 0 &&
        // A replaced `array[index]` must not end up referring to another variable with this name
        sourceCode.getTokens(body).filter((token) => token.value === id.name).length ===
          sourceCode.getDeclaredVariables(declarator)[0]?.references.length
        ? {name: id.name, init, statement}
        : undefined;
    };

    const addCandidate = (
      node: ESTree.ForOfStatement | ESTree.ForStatement,
      candidate: OmitStrict<Candidate, 'body' | 'isKnownArray' | 'continueStatements'>,
    ) => {
      const {receiver} = candidate;
      const syntaxArrayState = getArrayState(receiver, sourceCode.getScope(node));
      // Holes are invisible to types, and an unhelpful type leaves only the syntax to rely on
      const typeArrayState =
        syntaxArrayState !== 'sparse' && hasTypeInformation(parserServices)
          ? getTypeArrayState(
              parserServices.program
                .getTypeChecker()
                .getTypeAtLocation(parserServices.esTreeNodeToTSNodeMap.get(receiver)),
              parserServices.program.getTypeChecker(),
            )
          : 'unknown';
      const arrayState = typeArrayState === 'unknown' ? syntaxArrayState : typeArrayState;
      if (arrayState !== 'nonArray') {
        candidates.set(node, {
          ...candidate,
          body: node.body,
          isKnownArray: arrayState === 'array',
          continueStatements: [],
        });
      }
    };

    const reportCandidate = (
      node: (ESTree.ForOfStatement | ESTree.ForStatement) & Eslint.Rule.NodeParentExtension,
    ) => {
      const candidate = candidates.get(node);
      candidates.delete(node);
      const closingParenthesis = sourceCode.getTokenBefore(node.body);
      if (candidate == null || closingParenthesis == null) {
        return;
      }

      const {receiver, body, element, index, replacements, continueStatements} = candidate;
      const [bodyStart] = sourceCode.getRange(body);
      const isBlock = body.type === 'BlockStatement';

      const fix = (fixer: Eslint.Rule.RuleFixer) => {
        const receiverText = sourceCode.getText(receiver);
        const object = MEMBER_OBJECT_TYPES.has(receiver.type) ? receiverText : `(${receiverText})`;
        const parameters = index == null ? element : `${element}, ${index}`;
        const head = `${object}.forEach((${parameters}) => ${isBlock ? '' : '{ '}`;
        return [
          fixer.replaceTextRange(
            [sourceCode.getRange(node)[0], bodyStart],
            ASI_HAZARD_REGEX.test(head) && needsLeadingSemicolon(node) ? `;${head}` : head,
          ),
          ...replacements.map(([range, text]) => fixer.replaceTextRange(range, text)),
          ...continueStatements.map((statement) => {
            const [start] = sourceCode.getRange(statement);
            return fixer.replaceTextRange([start, start + 'continue'.length], 'return');
          }),
          fixer.insertTextAfter(body, isBlock ? ');' : ' });'),
        ];
      };

      // The head is rebuilt from scratch, so the comments in it would be lost
      const isFixable = sourceCode
        .getCommentsInside(node)
        .every((comment) => sourceCode.getRange(comment)[0] > bodyStart);

      context.report({
        loc: {start: sourceCode.getLoc(node).start, end: closingParenthesis.loc.end},
        messageId: 'preferForEach',
        ...(isFixable &&
          (candidate.isKnownArray ? {fix} : {suggest: [{messageId: 'replaceWithForEach', fix}]})),
      });
    };

    return {
      ForOfStatement: (node) => {
        if (node.await) {
          discardEnclosingCandidates(node);
          return;
        }

        const {left, right} = node;
        const pattern =
          left.type === 'VariableDeclaration' && (left.kind === 'const' || left.kind === 'let')
            ? left.declarations[0]?.id
            : undefined;
        if (pattern == null || node.parent.type === 'LabeledStatement') {
          return;
        }

        const entriesReceiver =
          right.type === 'CallExpression' &&
          right.arguments.length === 0 &&
          right.callee.type === 'MemberExpression' &&
          !right.callee.computed &&
          !right.callee.optional &&
          isIdentifierNamed(right.callee.property, 'entries')
            ? right.callee.object
            : undefined;
        if (entriesReceiver == null) {
          addCandidate(node, {
            receiver: right,
            element: sourceCode.getText(pattern),
            replacements: [],
          });
          return;
        }

        const [indexPattern, elementPattern, ...restPatterns] =
          pattern.type === 'ArrayPattern' ? pattern.elements : [];
        if (
          elementPattern != null &&
          elementPattern.type !== 'RestElement' &&
          restPatterns.length === 0 &&
          (indexPattern == null || indexPattern.type === 'Identifier')
        ) {
          addCandidate(node, {
            receiver: entriesReceiver,
            element: sourceCode.getText(elementPattern),
            index: indexPattern?.name,
            replacements: [],
          });
        }
      },

      ForStatement: (node) => {
        const {init, test, update, body} = node;
        const declarator =
          init?.type === 'VariableDeclaration' &&
          init.kind === 'let' &&
          init.declarations.length === 1
            ? init.declarations[0]
            : undefined;
        if (
          declarator?.id.type !== 'Identifier' ||
          node.parent.type === 'LabeledStatement' ||
          !(declarator.init?.type === 'Literal' && declarator.init.value === 0)
        ) {
          return;
        }

        const indexName = declarator.id.name;
        const lengthAccess =
          test?.type === 'BinaryExpression' &&
          test.operator === '<' &&
          isIdentifierNamed(test.left, indexName) &&
          test.right.type === 'MemberExpression' &&
          !test.right.computed &&
          !test.right.optional &&
          isIdentifierNamed(test.right.property, 'length')
            ? test.right
            : undefined;
        const isIncrement =
          update?.type === 'UpdateExpression'
            ? update.operator === '++' && isIdentifierNamed(update.argument, indexName)
            : update?.type === 'AssignmentExpression' &&
              update.operator === '+=' &&
              isIdentifierNamed(update.left, indexName) &&
              update.right.type === 'Literal' &&
              update.right.value === 1;
        const [indexVariable] = sourceCode.getDeclaredVariables(declarator);
        if (
          lengthAccess == null ||
          !isIncrement ||
          !isStableReference(lengthAccess.object) ||
          // Changing the index anywhere but in the update clause skips or repeats elements
          indexVariable?.references.filter((reference) => reference.isWrite()).length !== 2
        ) {
          return;
        }

        const receiver = lengthAccess.object;
        const receiverText = sourceCode.getText(receiver);
        const bodyIdentifiers = indexVariable.references.flatMap(({identifier}) =>
          identifier.type === 'Identifier' && isInside(identifier, body) ? identifier : [],
        );
        const elementAccesses = bodyIdentifiers.flatMap((identifier) => {
          // Closest first, starting with `array[index]` itself
          const [member, ...ancestors] = sourceCode.getAncestors(identifier).toReversed();
          if (
            member?.type !== 'MemberExpression' ||
            member.property !== identifier ||
            member.optional ||
            sourceCode.getText(member.object) !== receiverText
          ) {
            return [];
          }

          const contextIndex = ancestors.findIndex(
            (ancestor) => !TYPE_ONLY_WRAPPER_TYPES.has(ancestor.type),
          );
          return {
            member,
            isRead: !isElementWriteOrCall(
              ancestors[contextIndex - 1] || member,
              ancestors[contextIndex],
              ancestors[contextIndex + 1],
            ),
          };
        });

        // Unlike `forEach`, the loop reads the element anew every time, so it can only be read
        // once if the body doesn't touch the array otherwise
        const rootName = sourceCode.getFirstToken(receiver)?.value;
        const countRootTokens = (container: ESTree.Node) =>
          sourceCode.getTokens(container).filter((token) => token.value === rootName).length;
        const elementReads =
          elementAccesses.every(({isRead}) => isRead) &&
          countRootTokens(body) === elementAccesses.length * countRootTokens(receiver)
            ? elementAccesses.map(({member}) => member)
            : [];

        const elementDeclaration = getElementDeclaration(body, elementReads);
        const element =
          elementDeclaration?.name ||
          getAvailableName(
            new Set(
              sourceCode
                .getTokens(node)
                .flatMap((token) => (token.type === 'Identifier' ? token.value : [])),
            ),
          );
        addCandidate(node, {
          receiver,
          element,
          ...(elementReads.length < bodyIdentifiers.length && {index: indexName}),
          replacements: elementReads.map((read) =>
            read === elementDeclaration?.init
              ? ([getRemovalRange(elementDeclaration.statement), ''] as const)
              : ([sourceCode.getRange(read), element] as const),
          ),
        });
      },

      'ForOfStatement:exit': reportCandidate,
      'ForStatement:exit': reportCandidate,

      ReturnStatement: discardEnclosingCandidates,
      AwaitExpression: discardEnclosingCandidates,
      YieldExpression: discardEnclosingCandidates,
      'VariableDeclaration[kind="var"], VariableDeclaration[kind="await using"]':
        discardEnclosingCandidates,

      BreakStatement: (node) => {
        discardJumpedOverCandidates(node, BREAKABLE_TYPES);
      },

      ContinueStatement: (node) => {
        if (node.label) {
          discardJumpedOverCandidates(node, LOOP_TYPES);
          return;
        }

        const loop = getAncestorsInFunction(node).find((ancestor) => LOOP_TYPES.has(ancestor.type));
        if (loop) {
          candidates.get(loop)?.continueStatements.push(node);
        }
      },
    };
  },
};

export {rule as preferArrayForEach};
