/*
 * A simple logger utilitly. Can be configured via the LOG_LEVEL environment variable in .env:
 *
 * LOG_LEVEL=error  -> only errors
 * LOG_LEVEL=info   -> errors + high-level progress (default)
 * LOG_LEVEL=debug  -> everything, including verbose per-round detail
 */
export enum LogLevel {
    ERROR = 0,
    INFO = 1,
    DEBUG = 2,
}

const LEVELS: Record<string, LogLevel> = {
    error: LogLevel.ERROR,
    info: LogLevel.INFO,
    debug: LogLevel.DEBUG,
};

// Falls back to INFO if LOG_LEVEL is unset or unrecognized.
const activeLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase() ?? "info"] ?? LogLevel.INFO;

export const logger = {
    error: (...args: unknown[]) => {
        if (activeLevel >= LogLevel.ERROR) console.error("[ERROR]", ...args);
    },
    info: (...args: unknown[]) => {
        if (activeLevel >= LogLevel.INFO) console.log("[INFO]", ...args);
    },
    debug: (...args: unknown[]) => {
        if (activeLevel >= LogLevel.DEBUG) console.log("[DEBUG]", ...args);
    },
};
