describe('option: `noWarnings`', () => {
  describe('runtime: warning severities are coerced to `error`', () => {
    it('coerces built-in warning-severity rules to `error`', async () => {
      const normal = await computeEslintConfig('js');
      const withNoWarnings = await computeEslintConfig('js', {un: {noWarnings: true}});

      const normalSeverities = getAllRulesSeverities(normal.getConfigByUnPostfix('js'));
      const noWarningsSeverities = getAllRulesSeverities(withNoWarnings.getConfigByUnPostfix('js'));

      // Sanity: the `js` config emits warning-severity rules by default.
      expect(normalSeverities).toContain(1);
      expect(noWarningsSeverities).not.toContain(1);
      // The warnings became errors, nothing got disabled in the process.
      expect(noWarningsSeverities).toStrictEqual(
        normalSeverities.filter((severity) => severity !== 1),
      );
    });

    it('keeps warnings as-is when `noWarnings` is not enabled', async () => {
      const withoutFlag = await computeEslintConfig('js');
      const withFalseFlag = await computeEslintConfig('js', {un: {noWarnings: false}});

      expect(getAllRulesSeverities(withoutFlag.getConfigByUnPostfix('js'))).toContain(1);
      expect(getAllRulesSeverities(withFalseFlag.getConfigByUnPostfix('js'))).toContain(1);
    });

    it("coerces per-config `forceSeverity: 'warn'` (string) to `error`", async () => {
      const withForce = await computeEslintConfig(
        {js: {forceSeverity: 'warn'}},
        {un: {noWarnings: true}},
      );

      const severities = getAllRulesSeverities(withForce.getConfigByUnPostfix('js'));

      expect(severities).not.toContain(1);
      expect(severities).toContain(2);
    });

    it('coerces per-config `forceSeverity: 1` (number) to `error`', async () => {
      const withForce = await computeEslintConfig(
        {js: {forceSeverity: 1}},
        {un: {noWarnings: true}},
      );

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(1);
    });

    it("coerces root-level `forceSeverity: 'warn'` to `error`", async () => {
      const withForce = await computeEslintConfig('js', {
        un: {noWarnings: true, forceSeverity: 'warn'},
      });

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(1);
    });

    it("keeps per-config `forceSeverity: 'warn'` as warning when `noWarnings` is disabled", async () => {
      const withForce = await computeEslintConfig({js: {forceSeverity: 'warn'}});

      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).toContain(1);
      expect(getAllRulesSeverities(withForce.getConfigByUnPostfix('js'))).not.toContain(2);
    });
  });

  describe('runtime: `linterOptionsReportUnusedDisableDirectives`', () => {
    const POSTFIX = 'global-setup/linter-options/reportUnusedDisableDirectives';

    it("sets `2` severity by default to override ESLint's default of `warn`", async () => {
      const configResult = await computeEslintConfig({}, {un: {noWarnings: true}});

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 2},
      });
    });

    it('does not emit a config by default when `noWarnings` is disabled', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toBeUndefined();
    });

    it('coerces an explicit `warn` value to `error`', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 'warn'}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 'error'},
      });
    });

    it('coerces an explicit `1` value to `2`', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 1}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 2},
      });
    });

    it('leaves non-warning values untouched', async () => {
      const configResult = await computeEslintConfig(
        {},
        {un: {noWarnings: true, linterOptionsReportUnusedDisableDirectives: 'off'}},
      );

      expect(configResult.getConfigByUnPostfix(POSTFIX)).toMatchObject({
        linterOptions: {reportUnusedDisableDirectives: 'off'},
      });
    });
  });
});
