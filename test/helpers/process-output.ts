/**
 * Captures everything the config generator prints and neutralizes non-zero exit codes
 * produces `logger.fatal`, which take the whole test worker down
 */
export const spyOnProcessOutput = () => {
  const exit = vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);

  onTestFinished(() => {
    exit.mockRestore();
    stderr.mockRestore();
  });

  return {
    exit,
    stderr,
    getStderrOutput: () => stderr.mock.calls.map(([chunk]) => String(chunk)).join(''),
  };
};
