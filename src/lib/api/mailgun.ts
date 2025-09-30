import { mailgunConfig } from '@/data/mailgunConfig.json';

export interface ErrorReport {
  error: string;
  stack?: string;
  context: string;
  timestamp: string;
  hash: string;
}

export interface DailySummary {
  totalReservations: number;
  groupReservations: number;
  revenueUSD: number;
  date: string;
}

export const sendErrorReport = async (errorData: ErrorReport): Promise<{ success: boolean; reason?: string }> => {
  if (!mailgunConfig.errorReporting.enabled) {
    return { success: true, reason: 'disabled' };
  }

  try {
    return await retry(() => sendToMailgun(errorData), mailgunConfig.errorReporting.maxRetries);
  } catch (error) {
    console.error('Failed to send error report to Mailgun:', error);
    return { success: false, reason: error.message };
  }
};

export const sendDailySummary = async (summary: DailySummary): Promise<{ success: boolean; reason?: string }> => {
  if (!mailgunConfig.dailySummary.enabled) {
    return { success: true, reason: 'disabled' };
  }

  try {
    return await retry(() => sendSummaryToMailgun(summary), mailgunConfig.dailySummary.maxRetries || 3);
  } catch (error) {
    console.error('Failed to send daily summary to Mailgun:', error);
    return { success: false, reason: error.message };
  }
};

const sendToMailgun = async (errorData: ErrorReport): Promise<{ success: boolean; reason?: string }> => {
  const { apiKey, domain } = mailgunConfig;

  if (!apiKey || !domain || apiKey === 'PLACEHOLDER' || domain === 'placeholder') {
    return { success: true, reason: 'not configured' };
  }

  const formData = new FormData();
  formData.append('from', `Hotel Ensueños <errors@${domain}>`);
  formData.append('to', mailgunConfig.errorReporting.toEmail);
  formData.append('subject', `🚨 Error Report - ${errorData.context}`);
  formData.append('html', generateErrorEmailTemplate(errorData));

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Mailgun API error: ${response.status} ${response.statusText}`);
  }

  return { success: true };
};

const sendSummaryToMailgun = async (summary: DailySummary): Promise<{ success: boolean; reason?: string }> => {
  const { apiKey, domain } = mailgunConfig;

  if (!apiKey || !domain || apiKey === 'PLACEHOLDER' || domain === 'placeholder') {
    return { success: true, reason: 'not configured' };
  }

  const formData = new FormData();
  formData.append('from', `Hotel Ensueños <reports@${domain}>`);
  formData.append('to', mailgunConfig.dailySummary.toEmail);
  formData.append('subject', `📊 Daily Summary - ${summary.date}`);
  formData.append('html', generateSummaryEmailTemplate(summary));

  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Mailgun API error: ${response.status} ${response.statusText}`);
  }

  return { success: true };
};

const generateErrorEmailTemplate = (errorData: ErrorReport): string => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #dc3545; margin-bottom: 20px;">🚨 Error Report</h2>

          <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
            <p><strong>Context:</strong> ${errorData.context}</p>
            <p><strong>Error:</strong> ${errorData.error}</p>
            <p><strong>Timestamp:</strong> ${new Date(errorData.timestamp).toLocaleString()}</p>
            <p><strong>Error ID:</strong> ${errorData.hash}</p>
          </div>

          ${errorData.stack ? `
            <div style="background: #f1f3f4; padding: 15px; border-radius: 4px;">
              <h4 style="margin-top: 0;">Stack Trace:</h4>
              <pre style="white-space: pre-wrap; font-size: 12px; color: #5f6368;">${errorData.stack}</pre>
            </div>
          ` : ''}

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            This error report was generated automatically by the Hotel Ensueños system.
          </p>
        </div>
      </body>
    </html>
  `;
};

const generateSummaryEmailTemplate = (summary: DailySummary): string => {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #28a745; margin-bottom: 20px;">📊 Daily Summary Report</h2>

          <div style="background: white; padding: 20px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Total Reservations:</span>
              <strong>${summary.totalReservations}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Group Reservations:</span>
              <strong>${summary.groupReservations}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Revenue (USD):</span>
              <strong>$${summary.revenueUSD.toFixed(2)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Date:</span>
              <strong>${summary.date}</strong>
            </div>
          </div>

          <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 14px;">
            This daily summary was generated automatically by the Hotel Ensueños system.
          </p>
        </div>
      </body>
    </html>
  `;
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