const SPECIFIERS_TO_MOCK_PACKAGE_URL = {
  '@glimmer/env': 'glimmer-env.js',
};

export const resolve = (specifier, context, next) => {
  const mockedPackageUrl = SPECIFIERS_TO_MOCK_PACKAGE_URL[specifier];
  if (mockedPackageUrl) {
    return {
      shortCircuit: true,
      url: new URL(`./packages/${mockedPackageUrl}`, import.meta.url).href,
    };
  }

  return next(specifier, context);
};
