// lib/logger.ts
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, printf } = format;
//request methods array
const requestMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

const logFormat = printf(({ level, message, timestamp }) => {
    // foramte timestamp
    timestamp = timestamp.replace('T', ' ').replace('Z', '');

    // check for the method line using regex (full line until \n)
    const methodLine = message.match(new RegExp(`(${requestMethods.join('|')}) .*\\n`));
    message = message.replace("\n", "");

    // delete the method line from the message alongside with \n
    if (methodLine) {
        message = message.replace(methodLine[0], '');
    }

    // check for the Response Status line
    const responseStatusLine = message.match(/Response Status: .*$/m);
    let responseStatus = '';
    if (responseStatusLine) {
        responseStatus = responseStatusLine[0].replace('Response Status: ', '');
        message = message.replace(responseStatusLine[0], '').trim();
    }

    return `${timestamp} ${level.toUpperCase()} ==> (${responseStatus}) ${methodLine ? methodLine[0].trim() : ''}:\n${message}\n`; 
});

const logger = createLogger({
    format: combine(
        // current filename
        timestamp(),
        logFormat
    ),
    transports: [
        new transports.File({ filename: 'logs/app.log', level: 'info' }),
        new transports.Console()
    ],
});

export default logger;