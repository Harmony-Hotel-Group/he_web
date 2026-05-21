import { describe, it, expect, vi, beforeEach } from "vitest";
import { useWhatsAppButton } from "./useWhatsAppButton";

// Mock del adapter
vi.mock("@/adapters/booking/whatsapp.adapter", () => ({
	buildContactMessage: vi.fn(() => "Mensaje de contacto mock"),
	buildWhatsAppUrl: vi.fn((phone: string, message: string) =>
		`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
	),
}));

describe("useWhatsAppButton", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("limpia el + del número de teléfono", () => {
		const { phoneNumber } = useWhatsAppButton({ phoneNumber: "+593987654321" });
		expect(phoneNumber).toBe("593987654321");
	});

	it("mantiene el número sin + si no lo tiene", () => {
		const { phoneNumber } = useWhatsAppButton({ phoneNumber: "593987654321" });
		expect(phoneNumber).toBe("593987654321");
	});

	it("construye el mensaje de contacto usando buildContactMessage", () => {
		const { message } = useWhatsAppButton({ phoneNumber: "593987654321" });
		expect(message).toBe("Mensaje de contacto mock");
	});

	it("construye la URL de WhatsApp usando buildWhatsAppUrl", () => {
		const { whatsappUrl } = useWhatsAppButton({ phoneNumber: "593987654321" });
		expect(whatsappUrl).toBe(
			"https://wa.me/593987654321?text=Mensaje%20de%20contacto%20mock",
		);
	});

	it("devuelve phoneNumber, message y whatsappUrl", () => {
		const result = useWhatsAppButton({ phoneNumber: "+1 234 567 8900" });
		expect(result).toHaveProperty("phoneNumber");
		expect(result).toHaveProperty("message");
		expect(result).toHaveProperty("whatsappUrl");
	});
});
