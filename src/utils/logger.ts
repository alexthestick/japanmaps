/**
 * logger.ts — conditional logger that only outputs in development.
 * In production builds (import.meta.env.PROD), log/warn are no-ops.
 * Errors are always logged so real exceptions are never silently swallowed.
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log:   (...args: unknown[]) => { if (isDev) console.log(...args); },
  warn:  (...args: unknown[]) => { if (isDev) console.warn(...args); },
  error: (...args: unknown[]) => { console.error(...args); }, // always surface real errors
  info:  (...args: unknown[]) => { if (isDev) console.info(...args); },
};
