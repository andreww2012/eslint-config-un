import {eslintConfig} from '../../../src/index';

describe('`unicorn` config `overrides` (type level)', () => {
  it('allows overriding a rule declared in the main config', () => {
    void eslintConfig({
      configs: {unicorn: {overrides: {'unicorn/no-lonely-if': 0}}},
    });
  });

  it('forbids overriding a rule moved to the `configAnyLanguage` sub-config', () => {
    void eslintConfig({
      configs: {
        unicorn: {
          overrides: {
            // @ts-expect-error `unicorn/prefer-https` is declared in `configAnyLanguage`
            'unicorn/prefer-https': 0,
          },
        },
      },
    });
  });

  it('allows overriding the rules each sub-config declares', () => {
    void eslintConfig({
      configs: {
        unicorn: {
          configAnyLanguage: {overrides: {'unicorn/prefer-https': 0}},
          configCss: {overrides: {'unicorn/no-transition-all': 0}},
          configHtml: {overrides: {'unicorn/no-invalid-file-input-accept': 0}},
          configJson: {overrides: {'unicorn/no-manually-wrapped-comments': 0}},
          configMarkdown: {overrides: {'unicorn/require-frontmatter-fields': 0}},
        },
      },
    });
  });

  it('forbids overriding a rule a sub-config does not declare', () => {
    void eslintConfig({
      configs: {
        unicorn: {
          configCss: {
            overrides: {
              // @ts-expect-error `unicorn/no-lonely-if` does not support CSS
              'unicorn/no-lonely-if': 0,
            },
          },
        },
      },
    });
  });

  it('forbids overriding a rule of another language in a sub-config', () => {
    void eslintConfig({
      configs: {
        unicorn: {
          configCss: {
            overrides: {
              // @ts-expect-error `unicorn/require-frontmatter-fields` is Markdown-only
              'unicorn/require-frontmatter-fields': 0,
            },
          },
          configJson: {
            overrides: {
              // @ts-expect-error `unicorn/no-transition-all` does not support JSON
              'unicorn/no-transition-all': 0,
            },
          },
        },
      },
    });
  });

  it('still allows any rule via `overridesAny`', () => {
    void eslintConfig({
      configs: {
        unicorn: {
          overrides: {'unicorn/no-lonely-if': 0},
          overridesAny: {'unicorn/prefer-https': 0, 'no-console': 0},
          configCss: {overridesAny: {'unicorn/no-lonely-if': 0}},
        },
      },
    });
  });
});
