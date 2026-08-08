const {RuleTester} = require('eslint');

new RuleTester().run('my-rule', rule, {
  valid: [{only: true, code: 'const a = 1;'}],
  invalid: [{code: 'const b = 2;', errors: 1}],
});
