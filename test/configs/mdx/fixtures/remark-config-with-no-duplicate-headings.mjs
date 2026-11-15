// Named like a `remark-lint` rule that has a native ESLint counterpart, so its reports only show
// up when `mdx/remark` runs it instead of skipping it
const noDuplicateHeadings = () => (_tree, file) => {
  const message = file.message('Reported by a remark plugin', {line: 1, column: 1});
  message.source = 'remark-lint';
  message.ruleId = 'no-duplicate-headings';
};
Object.defineProperty(noDuplicateHeadings, 'name', {value: 'remark-lint:no-duplicate-headings'});

export default {plugins: [noDuplicateHeadings]};
