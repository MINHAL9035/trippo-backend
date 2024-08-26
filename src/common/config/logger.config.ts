import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const customFormat = winston.format.printf(
  ({ timestamp, level, stack, message, context }) => {
    return `${timestamp} - [${level.toUpperCase().padEnd(7)}] - [${context}] - ${stack || message}`;
  },
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  customFormat,
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
);

const developmentTransports = [
  new winston.transports.Console({
    format: developmentFormat,
    level: 'silly',
  }),
];

const productionTransports = [
  new winston.transports.DailyRotateFile({
    filename: 'logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'error',
    format: productionFormat,
  }),
  new winston.transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: productionFormat,
  }),
];

export const winstonConfig: WinstonModuleOptions = {
  format:
    process.env.NODE_ENV === 'production'
      ? productionFormat
      : developmentFormat,
  transports:
    process.env.NODE_ENV === 'production'
      ? productionTransports
      : developmentTransports,
};
