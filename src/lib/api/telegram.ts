import { telegramConfig } from '@/data/telegramConfig.json';

export interface TelegramMessage {
  error: string;
  context: string;
  isCritical: boolean;
  timestamp: string;
  hash: string;
}

export const sendTelegramNotification = async (errorData: TelegramMessage): Promise<{ success: boolean; reason?: string }> => {
  if (!telegramConfig.enabled) {
    return { success: true, reason: 'disabled' };
  }

  if (telegramConfig.criticalErrorsOnly && !errorData.isCritical) {
    return { success: true, reason: 'non-critical' };
  }

  try {
    return await retry(() => sendMessageToTelegram(errorData), telegramConfig.maxRetries);
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return { success: false, reason: error.message };
  }
};

const sendMessageToTelegram = async (errorData: TelegramMessage): Promise<{ success: boolean; reason?: string }> => {
  const { botToken, chatId } = telegramConfig;

  if (!botToken || !chatId || botToken === 'PLACEHOLDER' || chatId === 'PLACEHOLDER') {
    return { success: true, reason: 'not configured' };
  }

  const message = generateTelegramMessage(errorData);

  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
      disable_notification: !errorData.isCritical // Silent for non-critical errors
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${response.status} ${response.statusText} - ${errorData.description}`);
  }

  return { success: true };
};

const generateTelegramMessage = (errorData: TelegramMessage): string => {
  const emoji = errorData.isCritical ? '🚨' : '⚠️';
  const criticality = errorData.isCritical ? '*Critical*' : '*Warning*';

  return `${emoji} *Hotel Ensueños Error*

*Context:* ${errorData.context}
*Error:* ${errorData.error}
*Timestamp:* ${new Date(errorData.timestamp).toLocaleString()}
*ID:* ${errorData.hash}
*Level:* ${criticality}

[View Details](https://hotelensuenos.com/admin/errors/${errorData.hash})`;
};

const retry = async <T>(fn: () => Promise<T>, maxRetries: number): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (i < maxRetries) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  throw lastError!;
};