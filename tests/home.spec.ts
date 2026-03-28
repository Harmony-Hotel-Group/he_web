import { test, expect } from '@playwright/test';

test.describe('Hotel Ensueños — Home Page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('debería cargar el título del sitio', async ({ page }) => {
		await expect(page).toHaveTitle(/Hotel Ensueños/);
	});

	test('debería mostrar el hero con el nombre del hotel', async ({ page }) => {
		const hero = page.locator('h1, h2').filter({ hasText: /Hotel Ensueños/i });
		await expect(hero.first()).toBeVisible();
	});

	test('debería tener link de WhatsApp', async ({ page }) => {
		const whatsappLink = page.locator('a[href*="wa.me"]');
		await expect(whatsappLink).toBeVisible();
	});

	test('debería mostrar sección de habitaciones', async ({ page }) => {
		const rooms = page.locator('text=Habitaciones').or(page.locator('text=Rooms'));
		await expect(rooms.first()).toBeVisible();
	});

	test('debería mostrar sección de reviews', async ({ page }) => {
		const reviews = page.locator('text=huéspedes').or(page.locator('text=guests'));
		await expect(reviews.first()).toBeVisible();
	});
});

test.describe('Hotel Ensueños — Booking Page', () => {
	test('debería cargar la página de reservas', async ({ page }) => {
		await page.goto('/booking');
		await expect(page).toHaveTitle(/Reservar|Booking/);
	});

	test('debería mostrar el formulario de reserva', async ({ page }) => {
		await page.goto('/booking');
		const form = page.locator('form, #booking-form');
		await expect(form.first()).toBeVisible();
	});
});

test.describe('Hotel Ensueños — Rooms Page', () => {
	test('debería cargar la página de habitaciones', async ({ page }) => {
		await page.goto('/rooms');
		await expect(page).toHaveTitle(/Habitaciones|Rooms/);
	});
});

test.describe('Hotel Ensueños — Navigation', () => {
	test('debería tener link al blog', async ({ page }) => {
		await page.goto('/');
		const blogLink = page.locator('a[href="/blog"]');
		await expect(blogLink).toBeVisible();
	});

	test('debería tener selector de idioma', async ({ page }) => {
		await page.goto('/');
		const langSelector = page.locator('[class*="lang"], [id*="lang"]').first();
		await expect(langSelector).toBeVisible();
	});

	test('debería tener selector de moneda', async ({ page }) => {
		await page.goto('/');
		const currencySelector = page.locator('[class*="currency"], [id*="currency"]').first();
		await expect(currencySelector).toBeVisible();
	});
});
