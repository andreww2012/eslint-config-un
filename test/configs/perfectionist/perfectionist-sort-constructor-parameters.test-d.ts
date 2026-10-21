import {eslintConfig} from '../../../src/index';

describe('`perfectionist/sortConstructorParameters` sub-config (type level)', () => {
  it('allows `false` and `options` with `useConfigurationIf`', () => {
    void eslintConfig({
      configs: {perfectionist: {configSortConstructorParameters: false}},
    });
    void eslintConfig({
      configs: {
        perfectionist: {
          configSortConstructorParameters: {
            options: {useConfigurationIf: {allNamesMatchPattern: 'Service$'}},
          },
        },
      },
    });
  });

  it('forbids `true`', () => {
    void eslintConfig({
      configs: {
        perfectionist: {
          // @ts-expect-error the rule sorts nothing without `useConfigurationIf`
          configSortConstructorParameters: true,
        },
      },
    });
  });

  it('forbids omitting `options`', () => {
    void eslintConfig({
      configs: {
        perfectionist: {
          // @ts-expect-error the rule sorts nothing without `useConfigurationIf`
          configSortConstructorParameters: {files: ['**/*.ts']},
        },
      },
    });
  });

  it('forbids `options` without `useConfigurationIf`', () => {
    void eslintConfig({
      configs: {
        perfectionist: {
          // @ts-expect-error the rule sorts nothing without `useConfigurationIf`
          configSortConstructorParameters: {options: {type: 'natural'}},
        },
      },
    });
  });
});
