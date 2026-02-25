describe('ts: sub config `configSortTsconfigKeys`', () => {
  describe.todo('basic tests', () => {
    it.todo('does not create `sort-tsconfig-keys` config when disabled (default)');
    it.todo('creates `sort-tsconfig-keys` config when enabled');
    it.todo('targets tsconfig.json files by default');
  });

  describe.todo('un options', () => {
    describe.todo('option: `files`', () => {
      it.todo('uses user-provided `files` in `sort-tsconfig-keys` config');
      it.todo('disables `sort-tsconfig-keys` config when `files` is empty array');
    });

    describe.todo('option: `ignores`', () => {
      it.todo(
        'uses user-provided `ignores` in `sort-tsconfig-keys` config and merges them with defaults',
      );
    });

    describe.todo('option: `overrides`', () => {
      it.todo('respects `overrides` in `sort-tsconfig-keys` config');
    });

    describe.todo('option: `overridesAny`', () => {
      it.todo('respects `overridesAny` in `sort-tsconfig-keys` config');
    });

    describe.todo('option: `forceSeverity`', () => {
      it.todo('respects `forceSeverity` in `sort-tsconfig-keys` config');
    });
  });

  describe.todo('options', () => {
    describe.todo('option: `orderTopLevel`', () => {
      it.todo('uses default top-level key order when `orderTopLevel` is `true` (default)');
      it.todo('does not order top-level keys when `orderTopLevel` is `false`');
      it.todo('uses custom top-level key order when `orderTopLevel` is an array');
    });

    describe.todo('option: `orderCompilerOptions`', () => {
      it.todo(
        'uses `antfu` preset for compiler options order when `orderCompilerOptions` is `true` (default)',
      );
      it.todo('does not order compiler options when `orderCompilerOptions` is `false`');
      it.todo('uses `antfu` preset when specified');
      it.todo('uses `totalTypescript` preset when specified');
      it.todo('uses custom key order when `type` is `order-keys`');
      it.todo('uses custom group order when `type` is `order-groups`');
    });

    describe.todo('option: `extraSortKeysConfigs`', () => {
      it.todo('does not add extra sort-keys configs when not provided');
      it.todo('appends extra sort-keys configs when provided');
    });
  });
});
