import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:4321";

// Helpers
async function openBookingForm(page: Page) {
	await page.goto(BASE_URL + "/");
	await expect(page.locator("#booking-form")).toBeVisible();
}

async function selectDates(page: Page, checkin: string, checkout: string) {
	// flatpickr inputs
	const checkinInput = page.locator('input[name="checkin"]');
	await checkinInput.click();
	await checkinInput.fill(checkin);

	const checkoutInput = page.locator('input[name="checkout"]');
	await checkoutInput.click();
	await checkoutInput.fill(checkout);

	// Cerrar calendario
	await page.locator("body").click();
}

// ============================================================
// Flujo completo de reserva
// ============================================================

test("reserva estándar — 2 adultos, 1 habitación, con desayuno", async ({
	page,
}) => {
	await openBookingForm(page);

	// Seleccionar fechas
	await selectDates(page, "2026-06-20", "2026-06-22");

	// Seleccionar adultos y habitaciones
	await page.locator('select[name="adults"]').selectOption("2");
	await page.locator('select[name="rooms"]').selectOption("1");

	// Activar desayuno (switch field)
	const breakfastSwitch = page.locator("#breakfast-toggle");
	await breakfastSwitch.check();

	// Enviar reserva
	await page.locator('button[type="submit"]').click();

	// Verificar que el modal de confirmación aparezca o que la URL se mantenga
	await page.waitForTimeout(500);
	await expect(page).toHaveURL(BASE_URL + "/");
});

test("reserva grupo — 8+ adultos, distribución por edades", async ({
	page,
}) => {
	await openBookingForm(page);

	// Seleccionar "Grupo" en el dropdown de adultos
	await page.locator('select[name="adults"]').selectOption("group");

	// El componente BookingFormGuestCount muestra #group-fields cuando es grupo
	await expect(page.locator("#group-fields")).toBeVisible();

	// Rellenar distribución de edades
	await page.locator('input[name="teens"]').fill("2");
	await page.locator('input[name="children"]').fill("1");

	// Verificar que el formulario siga visible
	await expect(page.locator("#group-fields")).toBeVisible();
});

test("incluir vehículo — mostrar campos de matrícula", async ({ page }) => {
	await openBookingForm(page);

	// Activar toggle de vehículo
	const vehicleToggle = page.locator("#vehicle-toggle");
	await vehicleToggle.check();

	// El componente BookingFormVehicleFields muestra #vehicle-fields
	await expect(page.locator("#vehicle-fields")).toBeVisible();

	// Completar tipo y matrícula
	await page.locator("#vehicleType").selectOption("car");
	await page.locator("#vehiclePlate").fill("ABC-1234");

	// Enviar
	await page.locator('button[type="submit"]').click();
	await page.waitForTimeout(500);
});

test("validación — rechazar envío sin fechas", async ({ page }) => {
	await openBookingForm(page);

	// Enviar sin llenar fechas
	await page.locator('button[type="submit"]').click();

	// El formulario debería seguir visible (no enviado)
	await expect(page.locator("#booking-form")).toBeVisible();
});

test("cache headers — /api/rooms incluye Cache-Control", async ({ page }) => {
	const response = await page.request.get(BASE_URL + "/api/rooms");
	const cache = response.headers()["cache-control"];
	expect(cache).toContain("max-age");
	expect(cache).toContain("public");
});
