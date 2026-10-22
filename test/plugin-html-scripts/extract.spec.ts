import type {TagNode} from '../../src/plugin-html-scripts/css-selector';
import {type IndentDescriptor, extract} from '../../src/plugin-html-scripts/extract';

const INDENTATION_REGEXP = /^[\t ]*/;

const isScriptTag = ({tagName}: TagNode) => tagName === 'script';

// Removes the indentation of the template literal, and of its last line, 2 spaces less indented
const dedent = (text: string) => {
  const textWithoutLeadingLineBreak = text.startsWith('\n') ? text.slice(1) : text;
  const indent = INDENTATION_REGEXP.exec(
    textWithoutLeadingLineBreak.split('\n').find((line) => line.trim()) || '',
  )?.[0];
  if (!indent) {
    return textWithoutLeadingLineBreak;
  }

  const dedented = textWithoutLeadingLineBreak.replaceAll(new RegExp(`^${indent}`, 'gm'), '');
  return indent.endsWith('  ')
    ? dedented.replace(new RegExp(`${indent.slice(0, -2)}$`), '')
    : dedented;
};

const expectExtraction = ({
  input,
  expected,
  isXml = false,
  indent,
  match = isScriptTag,
  badIndentationLines = [],
}: {
  input: string;
  expected: readonly string[];
  isXml?: boolean;
  indent?: IndentDescriptor;
  match?: (node: TagNode) => boolean;
  badIndentationLines?: readonly number[];
}) => {
  const result = extract(dedent(input), {
    isXml,
    indent,
    scriptMatchers: [{match, isModule: false}],
  });

  expect(result.scripts.map((script) => script.code.toString())).toStrictEqual(expected);
  expect(result.badIndentationLines).toStrictEqual(badIndentationLines);
};

it('extract simple javascript', () => {
  expectExtraction({
    input: `
      some html
      <script>var foo = 1;</script>
      other
    `,
    expected: ['var foo = 1;'],
  });
});

it('extract indented javascript', () => {
  expectExtraction({
    input: `
      some html
      <script>
        var foo = 1;
      </script>
      other
    `,
    expected: ['var foo = 1;\n'],
  });
});

it('extract javascript with first line next to the script tag', () => {
  expectExtraction({
    input: `
      some html
      <script>var foo = 1;
        var baz = 1;
      </script>
      other
    `,
    expected: ['var foo = 1;\nvar baz = 1;\n'],
  });
});

it('extract javascript with last line next to the script tag', () => {
  expectExtraction({
    input: `
      some html
      <script>
        var foo = 1;
        var baz = 1;</script>
      other
    `,
    expected: ['var foo = 1;\nvar baz = 1;'],
  });
});

it('extract multiple script tags', () => {
  expectExtraction({
    input: `
      some html
      <script>
        var foo = 1;
      </script>
      other
      <script>
        var bar = 1;
      </script>
    `,
    expected: ['var foo = 1;\n', 'var bar = 1;\n'],
  });
});

it('trim last line spaces', () => {
  expectExtraction({
    input: `
      some html
        <script>
          var foo = 1;
        </script>
      other
    `,
    expected: ['var foo = 1;\n'],
  });
});

it('trim last line spaces ignoring CDATA', () => {
  expectExtraction({
    input: `
      some html
        <script><![CDATA[
          var foo = 1;
        ]]></script>
      other
    `,
    isXml: true,
    expected: ['var foo = 1;\n'],
  });
});

it("extract script containing 'lower than' characters correctly (#1)", () => {
  expectExtraction({
    input: `
      <script>
        if (a < b) { doit(); }
      </script>
    `,
    expected: ['if (a < b) { doit(); }\n'],
  });
});

it('extract empty script tag (#7)', () => {
  expectExtraction({
    input: `
      <script></script>
    `,
    expected: [''],
  });
});

it.each(
  ['text/', 'text/x-', 'application/', 'application/x-'].flatMap((prefix) =>
    ['javascript', 'babel'].map((type) => `${prefix}${type}`),
  ),
)('extracts a script tag with type=%s', (type) => {
  expectExtraction({
    input: `
      some html
      <script type="${type}">var foo = 1;</script>
      other
    `,
    expected: ['var foo = 1;'],
  });
});

it('collects bad indentations', () => {
  expectExtraction({
    input: `
      <script>
        a;
      a;
       a;
      </script>
    `,
    badIndentationLines: [3, 4],
    expected: ['a;\na;\n a;\n'],
  });
});

describe('indent option', () => {
  it('absolute indent with spaces', () => {
    expectExtraction({
      input: `
        <head>
          <script>
            a;
          a;
        a;
          </script>
        </head>
      `,
      indent: {
        spaces: '  ',
        isRelative: false,
      },
      badIndentationLines: [3, 5],
      expected: ['    a;\na;\na;\n'],
    });
  });

  it('relative indent with spaces', () => {
    expectExtraction({
      input: `
        <head>
          <script>
            a;
          a;
        a;
          </script>
        </head>
      `,
      indent: {
        spaces: '  ',
        isRelative: true,
      },
      badIndentationLines: [4, 5],
      expected: ['a;\n  a;\na;\n'],
    });
  });

  /* eslint-disable un/no-multiple-consecutive-spaces -- tabs after the spaces of the template
  literal indentation are what these tests are about */
  it('absolute indent with tabs', () => {
    expectExtraction({
      input: `
        <head>
        \t<script>
        \t\ta;
        \ta;
        a;
        \t</script>
        </head>
      `,
      indent: {
        spaces: '\t',
        isRelative: false,
      },
      badIndentationLines: [3, 5],
      expected: ['\t\ta;\na;\na;\n'],
    });
  });

  it('relative indent with tabs', () => {
    expectExtraction({
      input: `
        <head>
        \t<script>
        \t\ta;
        \ta;
        a;
        \t</script>
        </head>
      `,
      indent: {
        spaces: '\t',
        isRelative: true,
      },
      badIndentationLines: [4, 5],
      expected: ['a;\n\ta;\na;\n'],
    });
  });
  /* eslint-enable un/no-multiple-consecutive-spaces */
});

it('works with crlf new lines', () => {
  expectExtraction({
    input: '<p>\r\n</p>\r\n<script>\r\n  foo;\r\nbar;\r\n    baz;\r\n</script>\r\n',
    badIndentationLines: [5],
    expected: ['foo;\r\nbar;\r\n  baz;\r\n'],
  });
});

it('works with CDATA', () => {
  expectExtraction({
    input: `
    <script>
      a;
      <![CDATA[
      b;
      ]]>
      c;
    </script>`,
    isXml: true,
    expected: ['a;\n\nb;\n\nc;\n'],
  });
});

it('custom type', () => {
  expectExtraction({
    input: `
    <script>
      a
    </script>

    <script type="foo/bar">
      b
    </script>

    <script type="foo/baz">
      c
    </script>
    `,
    match: ({tagName, attributes}) =>
      tagName === 'script' && (!attributes['type'] || attributes['type'] === 'foo/bar'),
    expected: ['a\n', 'b\n'],
  });
});

it('keeps empty lines after the last html tags', () => {
  expectExtraction({
    input: `
    <script>
      a
    </script>


    `,
    expected: ['a\n'],
  });
});

it('handles empty input', () => {
  expectExtraction({
    input: '',
    expected: [],
  });
});

it('handles self closing script tags in xhtml mode', () => {
  expectExtraction({
    input: 'a <script /> b',
    isXml: true,
    expected: [],
  });
});

it('keeps the tags inside scripts in xhtml mode', () => {
  expectExtraction({
    input: '<script>a<b>c</b>d</script>',
    isXml: true,
    expected: ['a<b>c</b>d'],
  });
});

it('skips script with src attributes', () => {
  expectExtraction({
    input: '<script src="foo"></script>',
    match: ({tagName, attributes}) => tagName === 'script' && attributes['src'] == null,
    expected: [],
  });
});

it('skips script without type attribute', () => {
  expectExtraction({
    input: '<script></script>',
    match: ({tagName, attributes}) => tagName === 'script' && attributes['type'] != null,
    expected: [],
  });
});

it('extract multiple tags types', () => {
  expectExtraction({
    input: `
      some html
      <script>
        var foo = 1;
      </script>
      other
      <customscript>
        var bar = 1;
      </customscript>
    `,
    match: ({tagName}) => tagName === 'script' || tagName === 'customscript',
    expected: ['var foo = 1;\n', 'var bar = 1;\n'],
  });
});

describe('disable comments', () => {
  it('ignores next script', () => {
    expectExtraction({
      input: `
      <!-- eslint-disable-next-script -->
      <script>
        var foo = 1;
      </script>

      <script>
        var bar = 2;
      </script>
      `,
      expected: ['var bar = 2;\n'],
    });
  });

  it('ignores script', () => {
    expectExtraction({
      input: `
      <!-- eslint-disable -->
      <script>
        var foo = 1;
      </script>
      <!-- eslint-enable -->
      <script>
        var bar = 2;
      </script>
      `,
      expected: ['var bar = 2;\n'],
    });
  });
});
