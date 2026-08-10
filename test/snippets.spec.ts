import {forbid$slotsInsideVueTemplates, forbidImportingFromUtilityLibraries} from '../src/snippets';

const buildRegex = (...args: Parameters<typeof forbidImportingFromUtilityLibraries>) =>
  new RegExp(forbidImportingFromUtilityLibraries(...args).regex);

describe('forbidImportingFromUtilityLibraries', () => {
  it('forbids the utility packages disallowed by default', () => {
    const regex = buildRegex();

    expect(regex.test('lodash')).toBe(true);
    expect(regex.test('type-fest')).toBe(true);
    expect(regex.test('@mobily/ts-belt')).toBe(true);
    expect(regex.test('node:util')).toBe(true);
  });

  it('allows the packages absent from the list', () => {
    const regex = buildRegex();

    expect(regex.test('vue')).toBe(false);
    expect(regex.test('not-lodash')).toBe(false);
  });

  it('forbids importing from sub-paths', () => {
    const regex = buildRegex();

    expect(regex.test('lodash/merge')).toBe(true);
    expect(regex.test('date-fns/format/index.js')).toBe(true);
  });

  it('escapes dots in package names', () => {
    const regex = buildRegex({packageNames: {'lodash.merge': true}});

    expect(regex.test('lodash.merge')).toBe(true);
    expect(regex.test('lodashXmerge')).toBe(false);
  });

  it('forbids an extra package passed as `true` in `packageNames`', () => {
    const regex = buildRegex({packageNames: {'my-utils': true}});

    expect(regex.test('my-utils')).toBe(true);
  });

  it('allows a default package passed as `false` in `packageNames`', () => {
    const regex = buildRegex({packageNames: {lodash: false}});

    expect(regex.test('lodash')).toBe(false);
    expect(regex.test('lodash-es')).toBe(true);
  });

  it('does not set `message` when option is not set', () => {
    expect(forbidImportingFromUtilityLibraries()).not.toHaveProperty('message');
  });

  it('sets the provided `message`', () => {
    const MESSAGE = 'Please import from `utils.ts` instead';

    expect(forbidImportingFromUtilityLibraries({message: MESSAGE})).toHaveProperty(
      'message',
      MESSAGE,
    );
  });
});

describe('forbid$slotsInsideVueTemplates', () => {
  it('selects `$slots` identifiers inside template expressions', () => {
    expect(forbid$slotsInsideVueTemplates().selector).toMatchInlineSnapshot(
      `"VExpressionContainer Identifier[name='$slots']"`,
    );
  });

  it('sets the default `message` when option is not set', () => {
    expect(forbid$slotsInsideVueTemplates().message).toMatchInlineSnapshot(
      '"Please use `const slots = defineSlots<{...}>()` instead because `$slots` is not typed"',
    );
  });

  it('sets the provided `message`', () => {
    const MESSAGE = 'Use `defineSlots` instead';

    expect(forbid$slotsInsideVueTemplates(MESSAGE).message).toBe(MESSAGE);
  });

  it('does not set `message` when it is an empty string', () => {
    expect(forbid$slotsInsideVueTemplates('')).not.toHaveProperty('message');
  });
});
