/**
 * Captures everything the config generator prints and neutralizes non-zero exit codes
 * produces `logger.fatal`, which take the whole test worker down
 */
export const spyOnProcessOutput = () => {
  // eslint-disable-next-line un/no-type-assertion -- unlike `process.exit`, the mock returns
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

  onTestFinished(() => {
    exit.mockRestore();
    stderrSpy.mockRestore();
  });

  return {
    exit,
    stderr: stderrSpy,
    getStderrOutput: () => stderrSpy.mock.calls.map(([chunk]) => String(chunk)).join(''),
  };
};
