export default {
  meta: {
    type: 'problem',
    schema: [],
  },
  create(context) {
    return {
      Identifier(node) {
        context.report({node, message: 'Use messageId instead'});
      },
    };
  },
};
