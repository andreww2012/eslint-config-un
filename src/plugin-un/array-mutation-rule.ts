import {findVariable} from '@eslint-community/eslint-utils';
import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/types';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type * as ts from 'typescript';
import type {Prettify} from '../types';
import {
  MEMBER_OBJECT_TYPES,
  TYPE_ONLY_WRAPPER_TYPES,
  type TypeOnlyWrapperExpression,
  getTypeInformation,
  isGlobalReference,
  unwrapTypeOnlyWrappers,
} from './rule-utils';

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    unneededCopies: {
      description:
        "Copies of new arrays that nothing else uses, like the result of `Array#filter()`: `'report'` (default) reports them, `'allow'` allows them, and `'require'` asks for them, like the rule of the same name in `eslint-plugin-unicorn`",
      enum: ['report', 'allow', 'require'],
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

type MutatingMethod = 'reverse' | 'sort' | 'splice';

type MessageId =
  | 'assignCopy'
  | 'preferCopy'
  | 'preferInPlace'
  | 'switchToCopy'
  | 'switchToCopyOfSpread'
  | 'switchToInPlace';

interface MethodInfo {
  copyingMethod: string;
  /** The method returns the array it changes, so a copy can take the place of its result */
  returnsArray: boolean;
  isSupportedCall: (callArguments: ESTree.CallExpression['arguments']) => boolean;
}

// What the methods returning a new array are methods of
type NewArrayMethodOwner = 'Array' | 'Iterator' | 'String';

interface NewArrayCheck {
  areHolesAllowed: boolean;
  /** Whether the method of the object, named like one returning a new array, returns one */
  isNewArrayMethodCall: (object: ESTree.Node, methodName: string) => boolean;
}

// An argument like these can't be a compare function, so the method is likely not of an array
const NON_FUNCTION_TYPES: ReadonlySet<string> = new Set([
  'ArrayExpression',
  'BinaryExpression',
  'Literal',
  'ObjectExpression',
  'TemplateLiteral',
  'UnaryExpression',
  'UpdateExpression',
]);

const METHODS: Readonly<Record<MutatingMethod, MethodInfo>> = {
  reverse: {
    copyingMethod: 'toReversed',
    returnsArray: true,
    isSupportedCall: (callArguments) => callArguments.length === 0,
  },
  sort: {
    copyingMethod: 'toSorted',
    returnsArray: true,
    isSupportedCall: ([compareFunction, ...otherArguments]) =>
      otherArguments.length === 0 &&
      (compareFunction == null || !NON_FUNCTION_TYPES.has(compareFunction.type)),
  },
  splice: {
    copyingMethod: 'toSpliced',
    returnsArray: false,
    isSupportedCall: () => true,
  },
};

const NEW_ARRAY_METHOD_OWNERS: ReadonlyMap<string, NewArrayMethodOwner> = new Map([
  ['concat', 'Array'],
  ['filter', 'Array'],
  ['flat', 'Array'],
  ['flatMap', 'Array'],
  ['map', 'Array'],
  ['match', 'String'],
  ['slice', 'Array'],
  ['splice', 'Array'],
  ['split', 'String'],
  ['toArray', 'Iterator'],
]);

// They always return a new value
const COPYING_METHODS: ReadonlySet<string> = new Set([
  'toReversed',
  'toSorted',
  'toSpliced',
  'with',
]);

const NEW_ARRAY_FUNCTIONS: ReadonlySet<string> = new Set([
  'Array.from',
  'Array.of',
  'JSON.parse',
  'Object.entries',
  'Object.getOwnPropertyNames',
  'Object.getOwnPropertySymbols',
  'Object.keys',
  'Object.values',
  'Reflect.ownKeys',
  'structuredClone',
]);

const NEW_ARRAY_ASYNC_FUNCTIONS: ReadonlySet<string> = new Set([
  'Array.fromAsync',
  'Promise.all',
  'Promise.allSettled',
]);

// They return the array they are called on
const RECEIVER_RETURNING_METHODS: ReadonlySet<string> = new Set([
  'copyWithin',
  'fill',
  'reverse',
  'sort',
  'valueOf',
]);

// The iterators they return see the later changes of the array
const ITERATOR_METHODS: ReadonlySet<string> = new Set(['entries', 'keys', 'values']);

// Typed arrays are left out: `Buffer#slice()`, for example, returns a view of the same memory
const isArrayType = (checker: ts.TypeChecker, type: ts.Type): boolean => {
  const constraint = checker.getBaseConstraintOfType(type) || type;
  return constraint.isUnion()
    ? constraint.types.every((member) => isArrayType(checker, member))
    : checker.isArrayType(constraint) || checker.isTupleType(constraint);
};

const isPlainArrayTypeNode = (sourceCode: Eslint.SourceCode, typeNode: TSESTree.TypeNode) =>
  typeNode.type === AST_NODE_TYPES.TSArrayType ||
  (typeNode.type === AST_NODE_TYPES.TSTypeReference &&
    typeNode.typeName.type === AST_NODE_TYPES.Identifier &&
    typeNode.typeName.name === 'Array' &&
    isGlobalReference(sourceCode, typeNode.typeName, 'type'));

// Other types, like the one of `as const`, may be read-only arrays or tuples
const hasPlainArrayAssertions = (
  sourceCode: Eslint.SourceCode,
  node: ESTree.Node | TypeOnlyWrapperExpression,
): boolean => {
  switch (node.type) {
    case 'TSAsExpression':
    case 'TSSatisfiesExpression':
    case 'TSTypeAssertion': {
      return (
        node.typeAnnotation != null &&
        isPlainArrayTypeNode(sourceCode, node.typeAnnotation) &&
        hasPlainArrayAssertions(sourceCode, node.expression)
      );
    }

    case 'TSInstantiationExpression':
    case 'TSNonNullExpression': {
      return hasPlainArrayAssertions(sourceCode, node.expression);
    }

    default: {
      return true;
    }
  }
};

const hasPlainArrayAnnotation = (
  sourceCode: Eslint.SourceCode,
  {typeAnnotation}: Prettify<ESTree.Identifier & {typeAnnotation?: TSESTree.TSTypeAnnotation}>,
) => typeAnnotation == null || isPlainArrayTypeNode(sourceCode, typeAnnotation.typeAnnotation);

// `Object.keys` for `Object.keys(object)`, unless a declaration shadows `Object`
const getGlobalCalleeName = (
  sourceCode: Eslint.SourceCode,
  {callee}: ESTree.CallExpression | ESTree.NewExpression,
) => {
  const [root, methodName] =
    callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier'
      ? [callee.object, callee.property.name]
      : [callee];
  return root.type === 'Identifier' && isGlobalReference(sourceCode, root, 'value')
    ? methodName == null
      ? root.name
      : `${root.name}.${methodName}`
    : undefined;
};

const isGlobalCallOf = (
  sourceCode: Eslint.SourceCode,
  node: ESTree.CallExpression | ESTree.NewExpression,
  functionNames: ReadonlySet<string>,
) => {
  const calleeName = getGlobalCalleeName(sourceCode, node);
  return calleeName != null && functionNames.has(calleeName);
};

// Whether the expression always evaluates to a new array, which nothing else references yet
const isNewArray = (
  sourceCode: Eslint.SourceCode,
  node: ESTree.Node,
  check: NewArrayCheck,
): boolean => {
  const expression = unwrapTypeOnlyWrappers(node);
  switch (expression.type) {
    case 'ArrayExpression': {
      return check.areHolesAllowed || !expression.elements.includes(null);
    }

    case 'AwaitExpression': {
      const {argument} = expression;
      return (
        argument.type === 'CallExpression' &&
        isGlobalCallOf(sourceCode, argument, NEW_ARRAY_ASYNC_FUNCTIONS)
      );
    }

    case 'ChainExpression': {
      return isNewArray(sourceCode, expression.expression, check);
    }

    case 'CallExpression':
    case 'NewExpression': {
      // `Array(length)` creates holes
      if (getGlobalCalleeName(sourceCode, expression) === 'Array') {
        return check.areHolesAllowed || expression.arguments.length !== 1;
      }

      const {callee} = expression;
      if (expression.type === 'NewExpression') {
        return false;
      }

      if (isGlobalCallOf(sourceCode, expression, NEW_ARRAY_FUNCTIONS)) {
        return true;
      }

      if (
        callee.type !== 'MemberExpression' ||
        callee.computed ||
        callee.property.type !== 'Identifier'
      ) {
        return false;
      }

      const methodName = callee.property.name;
      return (
        COPYING_METHODS.has(methodName) ||
        (NEW_ARRAY_METHOD_OWNERS.has(methodName) &&
          check.isNewArrayMethodCall(callee.object, methodName)) ||
        (RECEIVER_RETURNING_METHODS.has(methodName) && isNewArray(sourceCode, callee.object, check))
      );
    }

    default: {
      return false;
    }
  }
};

const getParent = (sourceCode: Eslint.SourceCode, node: ESTree.Node) =>
  sourceCode.getAncestors(node).at(-1);

const getOuterCall = (node: ESTree.CallExpression & Eslint.Rule.NodeParentExtension) =>
  node.parent.type === 'ChainExpression' ? node.parent : node;

// Thrown away by an expression statement or the comma operator, like the rules of
// `eslint-plugin-unicorn` check it
const isDiscarded = (sourceCode: Eslint.SourceCode, node: ESTree.Node): boolean => {
  const parent = getParent(sourceCode, node);
  switch (parent?.type) {
    case 'ExpressionStatement': {
      return true;
    }

    case 'ChainExpression': {
      return isDiscarded(sourceCode, parent);
    }

    case 'SequenceExpression': {
      return parent.expressions.at(-1) !== node || isDiscarded(sourceCode, parent);
    }

    default: {
      return false;
    }
  }
};

// Also covers the values only used to decide what to evaluate next, like in `isSorted || array.sort();`
const isValueUnused = (sourceCode: Eslint.SourceCode, node: ESTree.Node): boolean => {
  if (isDiscarded(sourceCode, node)) {
    return true;
  }

  const parent = getParent(sourceCode, node);
  switch (parent?.type) {
    case 'ChainExpression': {
      return isValueUnused(sourceCode, parent);
    }

    case 'ConditionalExpression': {
      return parent.test !== node && isValueUnused(sourceCode, parent);
    }

    case 'LogicalExpression': {
      return parent.right === node && isValueUnused(sourceCode, parent);
    }

    case 'SequenceExpression': {
      return isValueUnused(sourceCode, parent);
    }

    case 'UnaryExpression': {
      return parent.operator === 'void';
    }

    default: {
      return false;
    }
  }
};

// Whether the loop may run its child more than once
const isRepeatedByLoop = (node: ESTree.Node, child: ESTree.Node) => {
  switch (node.type) {
    case 'DoWhileStatement':
    case 'WhileStatement': {
      return true;
    }

    case 'ForStatement': {
      return child !== node.init;
    }

    case 'ForInStatement':
    case 'ForOfStatement': {
      return child !== node.right;
    }

    default: {
      return false;
    }
  }
};

// Whether a loop between the node and the block, which may be a loop itself, may run the node more
// than once
const isRepeatedWithin = (sourceCode: Eslint.SourceCode, node: ESTree.Node, block: ESTree.Node) => {
  const ancestors = sourceCode.getAncestors(node);
  const chain = [...ancestors.slice(Math.max(ancestors.indexOf(block), 0)), node];
  return chain.some((ancestor, index) => {
    const child = chain[index + 1];
    return child != null && isRepeatedByLoop(ancestor, child);
  });
};

// A local variable that starts with a new array
const getLocalArray = (
  sourceCode: Eslint.SourceCode,
  identifier: ESTree.Identifier,
  check: NewArrayCheck,
) => {
  const variable = findVariable(sourceCode.getScope(identifier), identifier);
  const definition = variable?.defs.length === 1 ? variable.defs[0] : undefined;
  const init = definition?.type === 'Variable' ? definition.node.init : undefined;
  return init != null &&
    variable != null &&
    definition?.type === 'Variable' &&
    definition.node.id === definition.name &&
    // Other scripts and modules can reach these
    variable.scope.type !== 'global' &&
    getParent(sourceCode, definition.parent)?.type !== 'ExportNamedDeclaration' &&
    isNewArray(sourceCode, init, check)
    ? {variable, definition, init}
    : undefined;
};

type LocalArray = NonNullable<ReturnType<typeof getLocalArray>>;

const isInDeclaringFunction = ({variable}: LocalArray, reference: Eslint.Scope.Reference) =>
  reference.from.variableScope === variable.scope.variableScope;

// The reference of the identifier, if it's in the function that declares the variable
const getDeclaringFunctionReference = (local: LocalArray, identifier: ESTree.Identifier) => {
  const reference = local.variable.references.find(
    (candidate) => candidate.identifier === identifier,
  );
  return reference != null && isInDeclaringFunction(local, reference) ? reference : undefined;
};

// A call that returns the array itself or an iterator that sees its later changes. Callbacks get
// the array too, as their last argument, but keeping it from there is rare enough to ignore
const isLeakingCall = (
  sourceCode: Eslint.SourceCode,
  call: ESTree.Node | undefined,
  member: ESTree.MemberExpression,
  isLoopHeadAllowed: boolean,
) => {
  if (
    call?.type !== 'CallExpression' ||
    call.callee !== member ||
    isValueUnused(sourceCode, call)
  ) {
    return false;
  }

  if (member.computed || member.property.type !== 'Identifier') {
    return true;
  }

  const methodName = member.property.name;
  if (ITERATOR_METHODS.has(methodName)) {
    // `for (const [index, element] of array.entries())`
    const loop = getParent(sourceCode, call);
    return !(isLoopHeadAllowed && loop?.type === 'ForOfStatement' && loop.right === call);
  }

  return RECEIVER_RETURNING_METHODS.has(methodName);
};

// A copy loses the properties added to the array, and a deleted element leaves a hole
const isPropertyChange = (member: ESTree.MemberExpression, parent: ESTree.Node | undefined) => {
  const isNamedProperty =
    !member.computed &&
    !(member.property.type === 'Identifier' && member.property.name === 'length');
  switch (parent?.type) {
    case 'AssignmentExpression': {
      return parent.left === member && isNamedProperty;
    }

    case 'UnaryExpression': {
      return parent.operator === 'delete';
    }

    case 'UpdateExpression': {
      return isNamedProperty;
    }

    default: {
      return false;
    }
  }
};

// A use after which the variable is still the only reference to its array
const isPrivateUse = (
  sourceCode: Eslint.SourceCode,
  local: LocalArray,
  reference: Eslint.Scope.Reference,
  check: NewArrayCheck,
) => {
  const {identifier} = reference;
  if (reference.init) {
    return true;
  }

  if (identifier.type !== 'Identifier') {
    return false;
  }

  const ancestors = sourceCode.getAncestors(identifier);
  const parentIndex = ancestors.findLastIndex(
    (ancestor) => !TYPE_ONLY_WRAPPER_TYPES.has(ancestor.type),
  );
  const parent = ancestors[parentIndex];
  const child = ancestors[parentIndex + 1] || identifier;
  switch (parent?.type) {
    case 'AssignmentExpression': {
      return (
        parent.left === child &&
        parent.operator === '=' &&
        isNewArray(sourceCode, parent.right, check)
      );
    }

    // A loop in another function may be paused by `yield` or `await` while the array changes
    case 'ForOfStatement': {
      return parent.right === child && isInDeclaringFunction(local, reference);
    }

    case 'MemberExpression': {
      const memberParent = ancestors[parentIndex - 1];
      return (
        parent.object === child &&
        !isPropertyChange(parent, memberParent) &&
        !isLeakingCall(sourceCode, memberParent, parent, isInDeclaringFunction(local, reference))
      );
    }

    case 'SpreadElement': {
      return true;
    }

    default: {
      return false;
    }
  }
};

// After this use, the variable is never used again and nothing else references its array
const isLastUse = (
  sourceCode: Eslint.SourceCode,
  local: LocalArray,
  identifier: ESTree.Identifier,
  check: NewArrayCheck,
) => {
  const reference = getDeclaringFunctionReference(local, identifier);
  const [start] = sourceCode.getRange(identifier);
  return (
    reference != null &&
    !isRepeatedWithin(sourceCode, identifier, local.variable.scope.block) &&
    local.variable.references.every(
      (other) =>
        other === reference ||
        (isInDeclaringFunction(local, other) &&
          other.identifier.type === 'Identifier' &&
          sourceCode.getRange(other.identifier)[0] < start &&
          isPrivateUse(sourceCode, local, other, check)),
    )
  );
};

// An in-place change of the array would also change what a loop over it gets next
const isInLoopOver = (sourceCode: Eslint.SourceCode, {variable}: LocalArray, node: ESTree.Node) => {
  const ancestors = sourceCode.getAncestors(node);
  return ancestors.some((ancestor, index) => {
    if (ancestor.type !== 'ForOfStatement' || (ancestors[index + 1] || node) === ancestor.right) {
      return false;
    }

    const iterated = unwrapTypeOnlyWrappers(ancestor.right);
    const target =
      iterated.type === 'CallExpression' &&
      iterated.callee.type === 'MemberExpression' &&
      !iterated.callee.computed &&
      iterated.callee.property.type === 'Identifier' &&
      ITERATOR_METHODS.has(iterated.callee.property.name)
        ? unwrapTypeOnlyWrappers(iterated.callee.object)
        : iterated;
    return variable.references.some((reference) => reference.identifier === target);
  });
};

// Read-only arrays have no in-place methods, and a changed copy may not fit a tuple type
const isTypedAsPlainArray = (
  sourceCode: Eslint.SourceCode,
  receiver: ESTree.Node,
  local: LocalArray | undefined,
) =>
  hasPlainArrayAssertions(sourceCode, receiver) &&
  (local == null ||
    (hasPlainArrayAnnotation(sourceCode, local.definition.name) &&
      hasPlainArrayAssertions(sourceCode, local.init)));

// `[...array]`
const getSpreadArgument = (node: ESTree.Node) => {
  const [element, ...otherElements] = node.type === 'ArrayExpression' ? node.elements : [];
  return element?.type === 'SpreadElement' && otherElements.length === 0
    ? element.argument
    : undefined;
};

export const createArrayMutationRule = (
  method: MutatingMethod,
): Eslint.JSRuleDefinition<{RuleOptions: [RuleOptions?]; MessageIds: MessageId}> => {
  const {copyingMethod, returnsArray, isSupportedCall} = METHODS[method];

  return {
    meta: {
      type: 'suggestion',
      docs: {
        description: returnsArray
          ? `Prefer \`Array#${copyingMethod}()\` over \`Array#${method}()\` for the arrays that may be used elsewhere, but \`Array#${method}()\` for the new ones that nothing else uses, like the result of \`Array#filter()\``
          : `Prefer \`Array#${method}()\` over assigning the result of \`Array#${copyingMethod}()\` back to the variable that holds the only reference to its array`,
      },
      fixable: 'code',
      hasSuggestions: true,
      schema: [RULE_OPTIONS_SCHEMA],
      defaultOptions: [{unneededCopies: 'report'}],
      messages: {
        preferCopy: `Use \`.${copyingMethod}()\` instead of \`.${method}()\`, which changes the array in place.`,
        preferInPlace: `\`.${copyingMethod}()\` copies an array that nothing else uses. Use \`.${method}()\` to change it in place instead.`,
        switchToCopy: `Switch to \`.${copyingMethod}()\`.`,
        switchToCopyOfSpread: `Switch to \`.${copyingMethod}()\` of the spread value. Only do this if it is an array.`,
        switchToInPlace: `Switch to \`.${method}()\`. Only do this if nothing else references the array.`,
        assignCopy: `Assign the \`.${copyingMethod}()\` result back to the variable.`,
      },
    },

    create: (context) => {
      const {sourceCode} = context;
      const unneededCopies = context.options[0]?.unneededCopies || 'report';
      const typeInformation = getTypeInformation(sourceCode);

      const checker = typeInformation?.checker;

      // Without type information, or for `any`, the type tells nothing
      const getType = (node: ESTree.Node) => {
        const nullableType = typeInformation?.getType(node);
        const type = nullableType && checker?.getNonNullableType(nullableType);
        return type?.flags === checker?.getAnyType().flags ? undefined : type;
      };

      // Without type information, any value may have the method
      const mayHaveMethod = (node: ESTree.Node, methodName: string) => {
        const type = getType(node);
        return type == null || checker?.getPropertyOfType(type, methodName) != null;
      };

      // `undefined` if it is not known, which takes type information
      const isKnownNewArrayMethodCall = (object: ESTree.Node, methodName: string) => {
        const type = getType(object);
        const owner = NEW_ARRAY_METHOD_OWNERS.get(methodName);
        return checker == null || type == null || owner === 'Iterator'
          ? undefined
          : owner === 'String'
            ? checker.isTypeAssignableTo(type, checker.getStringType())
            : isArrayType(checker, type);
      };

      const isLikelyNewArrayMethodCall = (object: ESTree.Node, methodName: string) =>
        isKnownNewArrayMethodCall(object, methodName) ?? true;

      // An array with holes is fine as long as nothing is fixed
      const newArrayCheck: NewArrayCheck = {
        areHolesAllowed: true,
        isNewArrayMethodCall: isLikelyNewArrayMethodCall,
      };
      // Unlike `toSorted()`, `sort()` keeps the holes
      const denseArrayCheck: NewArrayCheck = {
        areHolesAllowed: false,
        isNewArrayMethodCall: isLikelyNewArrayMethodCall,
      };
      const knownDenseArrayCheck: NewArrayCheck = {
        areHolesAllowed: false,
        isNewArrayMethodCall: (object, methodName) =>
          isKnownNewArrayMethodCall(object, methodName) ?? false,
      };

      // Nothing else references the receiver after the call
      const analyzeReceiver = (receiver: ESTree.Node, check: NewArrayCheck) => {
        const expression = unwrapTypeOnlyWrappers(receiver);
        if (expression.type !== 'Identifier') {
          return {isUnshared: isNewArray(sourceCode, expression, check), local: undefined};
        }

        const local = getLocalArray(sourceCode, expression, check);
        return {
          isUnshared: local != null && isLastUse(sourceCode, local, expression, check),
          local,
        };
      };

      // A variable holding the only reference to its array, so nothing can tell an in-place change
      // from replacing the array with a changed copy
      const getChangeableArray = (
        identifier: ESTree.Identifier,
        change: ESTree.Node,
        check: NewArrayCheck,
      ) => {
        const local = getLocalArray(sourceCode, identifier, check);
        return local != null &&
          // A function may run in the middle of a loop over the array
          getDeclaringFunctionReference(local, identifier) != null &&
          local.variable.references.every((reference) =>
            isPrivateUse(sourceCode, local, reference, check),
          ) &&
          !isInLoopOver(sourceCode, local, change) &&
          isTypedAsPlainArray(sourceCode, identifier, local)
          ? local
          : undefined;
      };

      const reportInPlace = (
        property: ESTree.Node,
        fix: Eslint.Rule.ReportFixer | undefined,
        isKnownNew: boolean,
      ) => {
        context.report({
          node: property,
          messageId: 'preferInPlace',
          ...(fix && (isKnownNew ? {fix} : {suggest: [{messageId: 'switchToInPlace', fix}]})),
        });
      };

      // `array.sort()` -> `array.toSorted()`
      const reportCopy = (receiver: ESTree.Node, property: ESTree.Node) => {
        const switchToCopy = (fixer: Eslint.Rule.RuleFixer) =>
          fixer.replaceText(property, copyingMethod);
        const spreadArgument = getSpreadArgument(receiver);
        context.report({
          node: property,
          messageId: 'preferCopy',
          suggest:
            spreadArgument &&
            // Removing the brackets must not lose comments
            sourceCode.getCommentsInside(receiver).length ===
              sourceCode.getCommentsInside(spreadArgument).length
              ? [
                  {
                    messageId: 'switchToCopyOfSpread',
                    fix: (fixer) => {
                      const text = sourceCode.getText(spreadArgument);
                      return [
                        fixer.replaceText(
                          receiver,
                          MEMBER_OBJECT_TYPES.has(spreadArgument.type) ? text : `(${text})`,
                        ),
                        switchToCopy(fixer),
                      ];
                    },
                  },
                  {messageId: 'switchToCopy', fix: switchToCopy},
                ]
              : [{messageId: 'switchToCopy', fix: switchToCopy}],
        });
      };

      // `array.splice()` -> `array = array.toSpliced()`
      const reportAssignedCopy = (
        node: ESTree.CallExpression & Eslint.Rule.NodeParentExtension,
        {object: receiver, property}: ESTree.MemberExpression,
      ) => {
        const identifier = unwrapTypeOnlyWrappers(receiver);
        const local =
          identifier.type === 'Identifier'
            ? getChangeableArray(identifier, node, newArrayCheck)
            : undefined;
        if (
          local != null &&
          // Only these can be assigned again
          (local.definition.parent.kind === 'let' || local.definition.parent.kind === 'var') &&
          mayHaveMethod(receiver, copyingMethod)
        ) {
          context.report({
            node: property,
            messageId: 'preferCopy',
            suggest: [
              {
                messageId: 'assignCopy',
                fix: (fixer) => [
                  fixer.insertTextBefore(getOuterCall(node), `${local.definition.name.name} = `),
                  fixer.replaceText(property, copyingMethod),
                ],
              },
            ],
          });
        }
      };

      const checkMutatingCall = (
        node: ESTree.CallExpression & Eslint.Rule.NodeParentExtension,
        callee: ESTree.MemberExpression,
      ) => {
        const {object: receiver, property} = callee;
        if (unneededCopies === 'require') {
          // Like the rules of `eslint-plugin-unicorn`, which allow in-place changes as statements,
          // unless the array is a copy made with a spread
          if (!isDiscarded(sourceCode, node)) {
            if (returnsArray && mayHaveMethod(receiver, copyingMethod)) {
              reportCopy(receiver, property);
            }
          } else if (!returnsArray) {
            reportAssignedCopy(node, callee);
          } else if (getSpreadArgument(receiver)) {
            reportCopy(receiver, property);
          }

          return;
        }

        if (
          returnsArray &&
          !isValueUnused(sourceCode, node) &&
          !analyzeReceiver(receiver, newArrayCheck).isUnshared &&
          mayHaveMethod(receiver, copyingMethod)
        ) {
          reportCopy(receiver, property);
        }
      };

      const checkCopyingCall = (
        node: ESTree.CallExpression & Eslint.Rule.NodeParentExtension,
        {object: receiver, property}: ESTree.MemberExpression,
      ) => {
        const assignment = getParent(sourceCode, getOuterCall(node));

        // `array = array.toSorted()` -> `array.sort()`
        if (
          assignment?.type === 'AssignmentExpression' &&
          assignment.operator === '=' &&
          assignment.right === getOuterCall(node) &&
          assignment.left.type === 'Identifier' &&
          receiver.type === 'Identifier' &&
          assignment.left.name === receiver.name &&
          isValueUnused(sourceCode, assignment)
        ) {
          if (
            getChangeableArray(receiver, node, denseArrayCheck) != null &&
            mayHaveMethod(receiver, method)
          ) {
            const [assignmentStart] = sourceCode.getRange(assignment);
            const [receiverStart] = sourceCode.getRange(receiver);
            // No parenthesis may start the statement, which may continue the previous line, and the
            // removed part must have no comments
            const isFixable =
              sourceCode.getTokenBefore(receiver)?.value === '=' &&
              sourceCode
                .getCommentsInside(assignment)
                .every((comment) => sourceCode.getRange(comment)[0] >= receiverStart);
            reportInPlace(
              property,
              isFixable
                ? (fixer) => [
                    fixer.removeRange([assignmentStart, receiverStart]),
                    fixer.replaceText(property, method),
                  ]
                : undefined,
              getChangeableArray(receiver, node, knownDenseArrayCheck) != null,
            );
          }

          return;
        }

        // A copy of a new array can't take the place of the removed elements `splice()` returns
        if (!returnsArray) {
          return;
        }

        const {isUnshared, local} = analyzeReceiver(receiver, denseArrayCheck);
        if (
          isUnshared &&
          isTypedAsPlainArray(sourceCode, receiver, local) &&
          mayHaveMethod(receiver, method)
        ) {
          reportInPlace(
            property,
            (fixer) => fixer.replaceText(property, method),
            analyzeReceiver(receiver, knownDenseArrayCheck).isUnshared,
          );
        }
      };

      return {
        CallExpression: (node) => {
          const {callee} = node;
          if (
            !node.optional &&
            callee.type === 'MemberExpression' &&
            !callee.computed &&
            callee.property.type === 'Identifier' &&
            isSupportedCall(node.arguments)
          ) {
            if (callee.property.name === method) {
              checkMutatingCall(node, callee);
            } else if (unneededCopies === 'report' && callee.property.name === copyingMethod) {
              checkCopyingCall(node, callee);
            }
          }
        },
      };
    },
  };
};
