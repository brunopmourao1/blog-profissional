// =============================================================
// Structured Logger
// =============================================================

const isProd = process.env.NODE_ENV === "production";

function formatMessage(
    level: string,
    message: string,
    meta?: Record<string, unknown>,
): string {
    if (isProd) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...meta,
        });
    }

    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}${metaStr}`;
}

export const logger = {
    info(message: string, meta?: Record<string, unknown>): void {
        console.log(formatMessage("info", message, meta));
    },
    warn(message: string, meta?: Record<string, unknown>): void {
        console.warn(formatMessage("warn", message, meta));
    },
    error(message: string, meta?: Record<string, unknown>): void {
        console.error(formatMessage("error", message, meta));
    },
    debug(message: string, meta?: Record<string, unknown>): void {
        if (!isProd) {
            console.debug(formatMessage("debug", message, meta));
        }
    },
};
