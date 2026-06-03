import { expect, type Page, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE_URL = "http://localhost:4321";

test.describe("API and SSR E2E tests", () => {
  // Helper function to check for axe violations on a page
  const checkAxeViolations = async (page: Page) => {
    const axeScanResults = await new AxeBuilder({ page }).analyze();
    expect(axeScanResults.violations).toEqual([]);
  };

  test("API /api/healthz returns 200 and no console errors", async ({ page }) => {
    // Monitor console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/healthz`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]); // No console errors
  });

  test("API /api/plugins returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/plugins`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/config returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/config`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/tours returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/tours`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/rooms returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/rooms`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/availability returns 200 with valid params and 400 with invalid params", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Test with valid parameters
    const validResponse = await page.request.get(
      `${BASE_URL}/api/availability?checkin=2026-06-05&checkout=2026-06-10`
    );
    expect(validResponse.status()).toBe(200);
    
    // Test with invalid parameters (checkout before checkin)
    const invalidResponse = await page.request.get(
      `${BASE_URL}/api/availability?checkin=2026-06-10&checkout=2026-06-05`
    );
    expect(invalidResponse.status()).toBe(400);
    
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/destinations returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/destinations`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /api/gastronomy returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/api/gastronomy`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("API /channels/ping returns 200 and no console errors", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.request.get(`${BASE_URL}/channels/ping`);
    expect(response.status()).toBe(200);
    expect(consoleErrors).toEqual([]);
  });

  test("SSR home page returns 200, no console errors, no axe violations, and has active language", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    const response = await page.goto(`${BASE_URL}/`);
    expect(response?.status()).toBe(200);
    expect(consoleErrors).toEqual([]);

    // Check for axe violations
    await checkAxeViolations(page);

    // Check that the page has an active language (lang attribute on html element)
    const htmlLang = page.locator("html");
    await expect(htmlLang).toHaveAttribute("lang", /^[a-z]{2}(-[a-z]{2})?$/i); // e.g., en, es, es-ES, etc.
  });
});