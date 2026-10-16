const reportEveryFile = () => (_tree, file) => {
  const message = file.message('Reported by a remark plugin', {line: 1, column: 1});
  message.source = 'fixture';
  message.ruleId = 'report-every-file';
};

export default {plugins: [reportEveryFile]};
