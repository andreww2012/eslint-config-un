import type Eslint from 'eslint';
import type {JSONSchema4} from 'json-schema';
import type {FromSchema as InferJsonSchemaType} from 'json-schema-to-ts';
import type {AST as JsonAST} from 'jsonc-eslint-parser';
import {minVersion as minSemverVersion, eq as semverVersionsEqual} from 'semver';
// eslint-disable-next-line import/no-extraneous-dependencies
import {PackageJson as PackageJsonZod} from 'zod-package-json/mini';
import {jsonParse} from '../src/utils';

const RULE_OPTIONS_SCHEMA = {
  type: 'object',
  properties: {
    ignore: {
      type: 'array',
      items: {
        type: 'string',
      },
      uniqueItems: true,
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema4;

type RuleOptions = InferJsonSchemaType<typeof RULE_OPTIONS_SCHEMA>;

const rule: Eslint.Rule.RuleModule = {
  meta: {
    type: 'problem',
    schema: [RULE_OPTIONS_SCHEMA],
    messages: {
      peerDependencyRangeTooLow:
        'Optional peer dependency {{name}} version must exactly match the installed version of the same dependency ({{installedVersion}}) and also be prepended with a caret (^)',
    },
  },
  create: (context) => {
    const packageJsonParseResult = PackageJsonZod.safeParse(jsonParse(context.sourceCode.text));
    const packageJson = packageJsonParseResult.data;
    if (!packageJsonParseResult.success || !packageJson) {
      return {};
    }

    const options = context.options[0] as RuleOptions | undefined;

    return {
      'Program > JSONExpressionStatement > JSONObjectExpression > JSONProperty[key.value=peerDependencies]':
        (node: JsonAST.JSONProperty) => {
          if (node.value.type !== 'JSONObjectExpression') {
            return;
          }

          node.value.properties.forEach((peerDependencyNode) => {
            if (peerDependencyNode.key.type !== 'JSONLiteral') {
              return;
            }

            const peerDependencyName = peerDependencyNode.key.value;
            if (typeof peerDependencyName !== 'string') {
              return;
            }

            if (options?.ignore?.includes(peerDependencyName)) {
              return;
            }

            if (!packageJson.peerDependenciesMeta?.[peerDependencyName]?.optional) {
              return;
            }

            const installedDevDependencyVersion = packageJson.devDependencies?.[peerDependencyName];
            if (!installedDevDependencyVersion) {
              return;
            }

            const {value} = peerDependencyNode;
            if (value.type !== 'JSONLiteral') {
              return;
            }

            const peerDependencyMaybeRange = value.value;
            if (typeof peerDependencyMaybeRange !== 'string') {
              return;
            }

            const minVersionSatisfyingRange = minSemverVersion(peerDependencyMaybeRange);
            if (!minVersionSatisfyingRange) {
              return;
            }

            if (
              !semverVersionsEqual(minVersionSatisfyingRange.version, installedDevDependencyVersion)
            ) {
              context.report({
                node: peerDependencyNode,
                messageId: 'peerDependencyRangeTooLow',
                data: {
                  name: peerDependencyName,
                  installedVersion: installedDevDependencyVersion,
                },
              });
            }
          });
        },
    };
  },
};

export {rule as optionalPeerDependencyVersionShouldMatchInstalledVersion};
