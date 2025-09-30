import { mailgunConfig } from '@/data/mailgunConfig.json';
import { telegramConfig } from '@/data/telegramConfig.json';
import { sendErrorReport } from './mailgun';
import { sendTelegramNotification } from './telegram';
import { isDuplicateError, updateErrorCache, generateErrorHash } from '@/lib/utils/cacheUtils';

export const logError = async (error: Error, context: string, options: { isCritical?: boolean } = {}): Promise<void> => {
  console.error(`[ERROR] ${context}: ${error.message}`);

  // Don't report in phase 1 (development)
  if (!mailgunConfig.errorReporting.enabled && !telegramConfig.enabled) {
    return;
  }

  const errorHash = generateErrorHash(error, context);

  if (isDuplicateError(errorHash)) {
    return;
  }

  updateErrorCache(errorHash);

  // Send to Mailgun if enabled
  if (mailgunConfig.errorReporting.enabled) {
    const mailgunResult = await sendErrorReport({
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      hash: errorHash
    });

    if (!mailgunResult.success) {
      console.error('Failed to send error report to Mailgun:', mailgunResult.reason);
    }
  }

  // Send to Telegram if critical or if configured for all errors
  if (telegramConfig.enabled && (options.isCritical || !telegramConfig.criticalErrorsOnly)) {
    const telegramResult = await sendTelegramNotification({
      error: error.message,
      context,
      isCritical: options.isCritical || false,
      timestamp: new Date().toISOString(),
      hash: errorHash
    });

    if (!telegramResult.success) {
      console.error('Failed to send Telegram notification:', telegramResult.reason);
    }
  }
};

// Convenience methods for different error types
export const logCriticalError = (error: Error, context: string): Promise<void> => {
  return logError(error, context, { isCritical: true });
};

export const logWarning = (error: Error, context: string): Promise<void> => {
  return logError(error, context, { isCritical: false });
};

// Global error handler for unhandled errors
export const setupGlobalErrorHandler = (): void => {
  if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('error', (event) => {
      logError(new Error(event.message), 'Unhandled Error', {
        isCritical: true
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logError(new Error(event.reason), 'Unhandled Promise Rejection', {
        isCritical: true
      });
    });
  } else {
    // Node.js environment
    process.on('uncaughtException', (error) => {
      logCriticalError(error, 'Uncaught Exception');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logCriticalError(new Error(reason), 'Unhandled Rejection');
    });
  }
};