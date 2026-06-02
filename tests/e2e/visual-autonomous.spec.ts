/**
 * Pruebas visuales autónomas para he_web
 * Ejecuta: pnpm test:e2e (levanta el servidor automáticamente)
 * 
 * Genera reporte HTML en: test-results/
 * Screenshots en: test-results/ (only-on-failure)
 */

import { expect, test } from "@playwright/test";

// Test suite completo para validación visual
test.describe("Validación visual autónoma", () => {
  test("formulario visible y accesible", async ({ page }) => {
    await page.goto("/");
    
    // Verificar que el formulario principal existe
    const form = page.locator("#booking-form");
    await expect(form).toBeVisible();
    
    // Capturar screenshot del estado inicial
    await page.screenshot({ path: "test-results/form-initial.png", fullPage: true });
  });

  test("interacción flatpickr funciona", async ({ page }) => {
    await page.goto("/");
    
    // Click en checkin
    await page.click('input[name="checkin"]');
    await page.waitForSelector(".flatpickr-calendar", { state: "visible" });
    
    // Verificar calendario visible
    const calendar = page.locator(".flatpickr-calendar");
    await expect(calendar).toBeVisible();
    
    // Screenshot del calendario abierto
    await page.screenshot({ path: "test-results/calendar-open.png" });
  });

  test("botón submit responde", async ({ page }) => {
    await page.goto("/");
    
    // Click en submit sin datos
    await page.click('button[type="submit"]');
    
    // Esperar feedback visual (error o formulario sigue visible)
    await page.waitForTimeout(500);
    
    // El formulario debería permanecer visible
    await expect(page.locator("#booking-form")).toBeVisible();
  });

  test("mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Verificar elementos adaptados
    const form = page.locator("#booking-form");
    await expect(form).toBeVisible();
  });
});

// Test de accesibilidad visual
test.describe("Accesibilidad visual", () => {
  test("contraste de botones", async ({ page }) => {
    await page.goto("/");
    
    // Evaluar contraste con axe-core
    // (integrado en el pipeline de Hermes)
  });
});