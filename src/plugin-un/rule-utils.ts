import {findVariable} from '@eslint-community/eslint-utils';
import type {TSESTree} from '@typescript-eslint/types';
import type * as Eslint from 'eslint';
import type * as ESTree from 'estree';
import type * as ts from 'typescript';
import type {Prettify} from '../types';
import {allUnionMembers} from '../utils';

/**
 * TypeScript-only expression wrappers, which are absent from `ESTree` types because they are erased
 * at runtime and therefore never change the value of the expression they wrap
 */
export interface TypeOnlyWrapperExpression {
  type:
    | 'TSAsExpression'
    | 'TSInstantiationExpression'
    | 'TSNonNullExpression'
    | 'TSSatisfiesExpression'
    | 'TSTypeAssertion';
  expression: ESTree.Expression;
  typeAnnotation?: TSESTree.TypeNode;
}

// Set by the scope analysis of `typescript-eslint`, which keeps types and values apart
interface TypeScriptVariableTraits {
  isTypeVariable?: boolean;
  isValueVariable?: boolean;
}

interface ParserServicesWithTypeInformation {
  program: ts.Program;
  esTreeNodeToTSNodeMap: {get: (node: ESTree.Node) => ts.Node | undefined};
}

export const TYPE_ONLY_WRAPPER_TYPES: ReadonlySet<string> = new Set(
  allUnionMembers<TypeOnlyWrapperExpression['type']>()([
    'TSAsExpression',
    'TSInstantiationExpression',
    'TSNonNullExpression',
    'TSSatisfiesExpression',
    'TSTypeAssertion',
  ]),
);

/**
 * Returns the expression inside TypeScript-only wrappers, like `value as T` or `value!`
 */
export const unwrapTypeOnlyWrappers = (
  node: ESTree.Node | TypeOnlyWrapperExpression,
): ESTree.Node => {
  switch (node.type) {
    case 'TSAsExpression':
    case 'TSInstantiationExpression':
    case 'TSNonNullExpression':
    case 'TSSatisfiesExpression':
    case 'TSTypeAssertion': {
      return unwrapTypeOnlyWrappers(node.expression);
    }

    default: {
      return node;
    }
  }
};

// Expressions that can be the object of a member access without parentheses
export const MEMBER_OBJECT_TYPES: ReadonlySet<string> = new Set([
  'ArrayExpression',
  'CallExpression',
  'Identifier',
  'MemberExpression',
  'Super',
  'ThisExpression',
  'TSNonNullExpression',
]);

const hasTypeInformation = (
  parserServices: unknown,
): parserServices is ParserServicesWithTypeInformation =>
  typeof parserServices === 'object' &&
  parserServices != null &&
  'esTreeNodeToTSNodeMap' in parserServices &&
  'program' in parserServices &&
  parserServices.program != null;

export const getTypeInformation = (sourceCode: Eslint.SourceCode) => {
  const parserServices: unknown = sourceCode.parserServices;
  return hasTypeInformation(parserServices)
    ? {
        checker: parserServices.program.getTypeChecker(),
        getTsNode: (node: ESTree.Node) => parserServices.esTreeNodeToTSNodeMap.get(node),
      }
    : undefined;
};

// Whether the name refers to the global, like `Array`, rather than to a declaration that shadows it
export const isGlobalReference = (
  sourceCode: Eslint.SourceCode,
  identifier: ESTree.Identifier | TSESTree.Identifier,
  space: 'type' | 'value',
) => {
  const variable: Prettify<Eslint.Scope.Variable & TypeScriptVariableTraits> | null = findVariable(
    sourceCode.getScope(identifier),
    identifier.name,
  );
  return (
    variable == null ||
    variable.defs.length === 0 ||
    (space === 'type' ? variable.isTypeVariable : variable.isValueVariable) === false
  );
};
