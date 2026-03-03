describe('ts: sub config `configTypeAware`', () => {
  describe.todo('basic tests', () => {
    it.todo(
      'creates `ts/type-aware/setup` and `ts/type-aware/rules` configs when enabled (default)',
    );

    it.todo('does not create `ts/type-aware/setup` or `ts/type-aware/rules` configs when disabled');
  });

  describe.todo('un options', () => {
    describe.todo('option: `files`', () => {
      it.todo('uses user-provided `files` in type-aware configs');

      it.todo('disables type-aware rules config when `files` is empty array');
    });

    describe.todo('option: `ignores`', () => {
      it.todo('uses user-provided `ignores` in type-aware configs and merges them with defaults');
    });

    it.todo('respects `overrides` and `overridesAny` in type-aware eslint configs');

    describe.todo('option: `forceSeverity`', () => {
      it.todo('respects `forceSeverity` in type-aware rules');
    });
  });
});
