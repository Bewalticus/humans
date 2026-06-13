// Logger Configuration
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        customFormat
      )
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new transports.File({ filename: 'logs/rejections.log' })
  ]
});

module.exports = logger;