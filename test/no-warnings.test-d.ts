import {eslintConfig} from '../src/index';

describe('option: `noWarnings` (type level)', () => {
  describe('when disabled (default)', () => {
    it('allows the `warning` severity on every severity-typed surface', () => {
      void eslintConfig({
        forceSeverity: 'warn',
        linterOptionsReportUnusedDisableDirectives: 'warn',
        linterOptionsReportUnusedInlineConfigs: 1,
        configs: {
          ts: {
            forceSeverity: 'warn',
            overrides: {'ts/array-type': ['warn']},
            configTypeAware: {forceSeverity: 'warn'},
          },
        },
      });
    });
  });

  describe('when enabled', () => {
    it('still allows `error`/`off` severities', () => {
      void eslintConfig({
        noWarnings: true,
        forceSeverity: 'error',
        linterOptionsReportUnusedDisableDirectives: 'error',
        linterOptionsReportUnusedInlineConfigs: 'off',
        configs: {
          ts: {
            forceSeverity: 2,
            overrides: {'ts/array-type': ['error']},
            configTypeAware: {forceSeverity: 'error'},
          },
        },
      });
    });

    it('forbids `warn` for the root `forceSeverity`', () => {
      void eslintConfig({
        noWarnings: true,
        // @ts-expect-error `warn` is forbidden by `noWarnings`
        forceSeverity: 'warn',
      });
    });

    it('forbids `1` for the root `forceSeverity`', () => {
      void eslintConfig({
        noWarnings: true,
        // @ts-expect-error `1` (warning) is forbidden by `noWarnings`
        forceSeverity: 1,
      });
    });

    it('forbids `warn` for `linterOptionsReportUnusedDisableDirectives`', () => {
      void eslintConfig({
        noWarnings: true,
        // @ts-expect-error `warn` is forbidden by `noWarnings`
        linterOptionsReportUnusedDisableDirectives: 'warn',
      });
    });

    it('forbids `warn` for `linterOptionsReportUnusedInlineConfigs`', () => {
      void eslintConfig({
        noWarnings: true,
        // @ts-expect-error `warn` is forbidden by `noWarnings`
        linterOptionsReportUnusedInlineConfigs: 1,
      });
    });

    it('forbids `warn` for a per-config `forceSeverity`', () => {
      void eslintConfig({
        noWarnings: true,
        configs: {
          ts: {
            // @ts-expect-error `warn` is forbidden by `noWarnings`
            forceSeverity: 'warn',
          },
        },
      });
    });

    it('forbids the `warn` severity inside `overrides`', () => {
      void eslintConfig({
        noWarnings: true,
        configs: {
          ts: {
            // @ts-expect-error `warn` severity in overrides is forbidden by `noWarnings`
            overrides: {'ts/array-type': ['warn']},
          },
        },
      });
    });

    it('forbids `warn` inside a nested sub-config', () => {
      void eslintConfig({
        noWarnings: true,
        configs: {
          ts: {
            configTypeAware: {
              // @ts-expect-error `warn` in a nested sub-config is forbidden by `noWarnings`
              forceSeverity: 'warn',
            },
          },
        },
      });
    });
  });
});
