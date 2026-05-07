const isProduction = process.env.NODE_ENV === 'production';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLOURS: Record<LogLevel, string> = {
  info:  '\x1b[36m',  // cyan
  warn:  '\x1b[33m',  // yellow
  error: '\x1b[31m',  // red
  debug: '\x1b[35m',  // magenta
};
const RESET = '\x1b[0m';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const ts = new Date().toISOString();

  if (isProduction) {
    // JSON structured log for log aggregators (Datadog, Logtail, etc.)
    process.stdout.write(
      JSON.stringify({ ts, level, message, ...meta }) + '\n'
    );
  } else {
    const colour = COLOURS[level];
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    console.log(`${colour}[${level.toUpperCase()}]${RESET} ${ts} – ${message}${metaStr}`);
  }
}

export const logger = {
  info:  (msg: string, meta?: Record<string, unknown>) => log('info',  msg, meta),
  warn:  (msg: string, meta?: Record<string, unknown>) => log('warn',  msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => log('error', msg, meta),
  debug: (msg: string, meta?: Record<string, unknown>) => {
    if (!isProduction) log('debug', msg, meta);
  },
};
