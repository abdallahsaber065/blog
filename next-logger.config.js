const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');

let loggerInstance = null;

const logger = defaultConfig => {
    if (loggerInstance) {
        return loggerInstance;
    }

    const symbolsToFilter = ['✓', '⚠', '◯', '○'];

    const filterFormat = format((info) => {
        // Check if the message contains any of the symbols to filter
        const containsFilteredSymbols = symbolsToFilter.some(symbol => info.message.includes(symbol));
        if (containsFilteredSymbols) {
            // Skip this log entry by returning `false`, which Winston will ignore
            return false;
        }
        // Keep the log entry if it doesn't contain any filtered symbols
        return info;
    });

    const customFormat = format.printf(({ level, message, timestamp }) => {
        if (typeof message === 'object') {
            return `${timestamp} ${level}: ${JSON.stringify(message)}`;
        }
        return `${timestamp} ${level}: ${message}`;
    });

    loggerInstance = createLogger({
        level: 'info',
        transports: [
            new transports.Console({
                handleExceptions: true,
                format: format.combine(
                    format.colorize(),
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    customFormat,
                    format.errors({ stack: true })
                ),
            }),
            new transports.DailyRotateFile({
                handleExceptions: true,
                filename: 'logs/application-%DATE%.log',
                datePattern: 'YYYY-MM-DD',
                maxSize: '20m',
                maxFiles: '30d',
                format: format.combine(
                    filterFormat(),
                    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                    customFormat,
                    format.errors({ stack: true })
                )
            })
        ],
    });

    return loggerInstance;
}

module.exports = {
    logger,
};
