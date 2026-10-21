import {parseCssSelector} from '../../src/plugin-html-scripts/css-selector';

const doesDivMatch = (selector: string, attributes: Record<string, string> = {}) =>
  parseCssSelector(selector)({tagName: 'div', attributes});

describe('css selector', () => {
  it('matches tag', () => {
    expect(doesDivMatch('div')).toBe(true);
    expect(doesDivMatch('*')).toBe(true);
    expect(doesDivMatch('span')).toBe(false);
  });

  it('matches .class', () => {
    expect(doesDivMatch('.foo', {class: 'foo'})).toBe(true);
    expect(doesDivMatch('.foo', {class: 'foo bar'})).toBe(true);
    expect(doesDivMatch('.foo.bar', {class: 'foo bar'})).toBe(true);
    expect(doesDivMatch('.foo.bar', {class: 'foo'})).toBe(false);
    expect(doesDivMatch('.foo', {class: 'bar'})).toBe(false);
    expect(doesDivMatch('.foo', {class: ''})).toBe(false);
    expect(doesDivMatch('.foo')).toBe(false);
  });

  it('matches [attribute]', () => {
    expect(doesDivMatch('[type]', {type: 'module'})).toBe(true);
    expect(doesDivMatch('[type]')).toBe(false);
    expect(doesDivMatch('[type=module]', {type: 'module'})).toBe(true);
    expect(doesDivMatch('[type=module]')).toBe(false);
    expect(doesDivMatch('[type^=mod]', {type: 'module'})).toBe(true);
    expect(doesDivMatch('[type$=ule]', {type: 'module'})).toBe(true);
    expect(doesDivMatch('[type*=du]', {type: 'module'})).toBe(true);
    expect(doesDivMatch('[type|=fr]', {type: 'fr'})).toBe(true);
    expect(doesDivMatch('[type|=fr]', {type: 'fr-FR'})).toBe(true);
    expect(doesDivMatch('[type|=fr]', {type: 'xxx-fr'})).toBe(false);
    expect(doesDivMatch('[type~=b]', {type: 'a b c'})).toBe(true);
    expect(doesDivMatch('[type~=""]', {type: ''})).toBe(false);
  });

  it('does not match inherited properties as attributes', () => {
    expect(doesDivMatch('[constructor]')).toBe(false);
  });

  it('matches [attribute=value i] case-insensitively', () => {
    expect(doesDivMatch('[type="text/javascript" i]', {type: 'TEXT/JavaScript'})).toBe(true);
    expect(doesDivMatch('[type^="Text/" i]', {type: 'text/javascript'})).toBe(true);
    expect(doesDivMatch('[type="text/javascript"]', {type: 'TEXT/JavaScript'})).toBe(false);
    expect(doesDivMatch('[type="text/javascript" s]', {type: 'TEXT/JavaScript'})).toBe(false);
  });

  it('matches #id', () => {
    expect(doesDivMatch('#foo', {id: 'foo'})).toBe(true);
    expect(doesDivMatch('#bar', {id: 'foo'})).toBe(false);
  });

  it('matches :not', () => {
    expect(doesDivMatch(':not(a)')).toBe(true);
    expect(doesDivMatch(':not(div)')).toBe(false);
  });

  it('matches any of the comma-separated selectors', () => {
    expect(doesDivMatch('span, div')).toBe(true);
    expect(doesDivMatch('span, a')).toBe(false);
  });

  it('throws on unsupported syntax', () => {
    expect(() => parseCssSelector('div > span')).toThrow();
    expect(() => parseCssSelector(':first-child')).toThrow();
  });
});
