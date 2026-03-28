/**
 * Sistema de logging centralizado para V.HUB
 * Substitui console.log dispersos com logging estruturado
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: Set<LogLevel> = new Set(['info', 'warn', 'error']);

  constructor() {
    if (this.isDevelopment) {
      this.enabledLevels.add('debug');
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!this.enabledLevels.has(level)) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    const logFn = level === 'error' ? console.error : 
                  level === 'warn' ? console.warn : 
                  console.log;

    if (context && Object.keys(context).length > 0) {
      logFn(`${prefix} ${message}`, context);
    } else {
      logFn(`${prefix} ${message}`);
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  /**
   * Cria um logger com contexto pré-definido (ex: sessionId, userId)
   */
  withContext(baseContext: LogContext) {
    return {
      debug: (msg: string, ctx?: LogContext) => this.debug(msg, { ...baseContext, ...ctx }),
      info: (msg: string, ctx?: LogContext) => this.info(msg, { ...baseContext, ...ctx }),
      warn: (msg: string, ctx?: LogContext) => this.warn(msg, { ...baseContext, ...ctx }),
      error: (msg: string, ctx?: LogContext) => this.error(msg, { ...baseContext, ...ctx }),
    };
  }
}

export const logger = new Logger();
