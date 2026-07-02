import pino from 'pino';

// Professional structured logging with Pino.
// This replaces raw console.log with JSON logging (valuable for Datadog/Splunk etc.)
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' 
    ? { target: 'pino-pretty', options: { colorize: true } }
    : undefined,
});
