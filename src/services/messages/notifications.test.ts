// Tests para el servicio de notificaciones multi-canal
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de los módulos de canales antes de importar
vi.mock('@/services/messages/whatsapp', () => ({
	sendWhatsappMessage: vi.fn().mockResolvedValue({ ok: true, skipped: true }),
}));

vi.mock('@/services/messages/email', () => ({
	sendEmail: vi.fn().mockResolvedValue({ ok: true }),
	sendAdminEmail: vi.fn().mockResolvedValue({ ok: true, skipped: true }),
}));

vi.mock('@/services/messages/telegram', () => ({
	sendTelegramMessage: vi.fn().mockResolvedValue({ ok: true, skipped: true }),
}));

vi.mock('@/services/messages/webhooks', () => ({
	postWebhook: vi.fn().mockResolvedValue({ ok: true }),
}));

vi.mock('@/services/logger', () => ({
	logger: () => ({
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
	}),
}));

import { notifyBooking, notifyAllChannels } from '@/services/messages/notifications';
import { sendTelegramMessage } from '@/services/messages/telegram';
import { sendAdminEmail } from '@/services/messages/email';

describe('notifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('notifyBooking', () => {
		it('debería enviar a los canales especificados', async () => {
			const results = await notifyBooking(
				{
					type: 'standard',
					checkin: '2026-04-01',
					checkout: '2026-04-05',
					adults: '2',
				},
				{ channels: ['telegram'] },
			);

			expect(results).toHaveLength(1);
			expect(results[0].channel).toBe('telegram');
			expect(sendTelegramMessage).toHaveBeenCalled();
		});

		it('debería enviar a email', async () => {
			const results = await notifyBooking(
				{ type: 'standard' },
				{ channels: ['email'] },
			);

			expect(results).toHaveLength(1);
			expect(results[0].channel).toBe('email');
			expect(sendAdminEmail).toHaveBeenCalled();
		});

		it('debería manejar canales sin configurar', async () => {
			const results = await notifyBooking(
				{ type: 'standard' },
				{ channels: ['telegram', 'email'] },
			);

			expect(results).toHaveLength(2);
			// Todos los canales mock retornan skipped o ok
			for (const r of results) {
				expect(r.ok || r.skipped).toBeTruthy();
			}
		});
	});

	describe('notifyAllChannels', () => {
		it('debería enviar a telegram y email por defecto', async () => {
			const results = await notifyAllChannels({
				type: 'group',
				groupAdults: '10',
				groupNotes: 'Evento corporativo',
			});

			expect(results.length).toBeGreaterThanOrEqual(2);
		});
	});
});
