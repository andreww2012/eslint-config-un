describe('ts: sub config `configNoTypeAssertion`', () => {
  describe.todo('basic tests', () => {
    it.todo('does not create `no-type-assertion` config when disabled (default)');

    it.todo('creates `no-type-assertion` config when enabled');

    it.todo('loads `no-type-assertion` plugin when enabled');
  });

  describe.todo('un options', () => {
    describe.todo('option: `files`', () => {
      it.todo('uses user-provided `files` in `no-type-assertion` config');

      it.todo('disables `no-type-assertion` config when `files` is empty array');
    });

    describe.todo('option: `ignores`', () => {
      it.todo(
        'uses user-provided `ignores` in `no-type-assertion` config and merges them with defaults',
      );
    });

    it.todo('respects `overrides` and `overridesAny` in `no-type-assertion` eslint config');

    describe.todo('option: `forceSeverity`', () => {
      it.todo('respects `forceSeverity` in `no-type-assertion` config');
    });
  });
});
