describe('option: `packageAliases`', () => {
  it('looks up a package by the aliased name', async () => {
    addInstalledPackages({'cypress-aliased': '13.0.0'});

    await expectConfigState({}, 'cypress', true, {
      reset: true,
      un: {packageAliases: {cypress: 'cypress-aliased'}},
    });
  });

  it('does not find a package installed under an alias when the option is not specified', async () => {
    addInstalledPackages({'cypress-aliased': '13.0.0'});

    await expectConfigState({}, 'cypress', false, 'default');
  });

  it('does not look up a package by the canonical name if the alias is specified', async () => {
    addInstalledPackages({cypress: '13.0.0'});

    await expectConfigState({}, 'cypress', false, {
      reset: true,
      un: {packageAliases: {cypress: 'cypress-aliased'}},
    });
  });
});
