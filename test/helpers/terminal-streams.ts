/**
 * Makes stdout and stderr look like a terminal or not until the end of the test.
 * Also removes the environment variables that decide on colors regardless of the streams or
 * depend on the machine running the tests
 */
export const pinTerminalStreams = ({stdout, stderr}: Record<'stdout' | 'stderr', boolean>) => {
  const isStdoutTty = process.stdout.isTTY;
  const isStderrTty = process.stderr.isTTY;

  process.stdout.isTTY = stdout;
  process.stderr.isTTY = stderr;
  vi.stubEnv('FORCE_COLOR', undefined);
  vi.stubEnv('NO_COLOR', undefined);
  vi.stubEnv('NODE_DISABLE_COLORS', undefined);
  vi.stubEnv('CI', undefined);
  vi.stubEnv('TERM', 'xterm-256color');

  onTestFinished(() => {
    process.stdout.isTTY = isStdoutTty;
    process.stderr.isTTY = isStderrTty;
    vi.unstubAllEnvs();
  });
};
