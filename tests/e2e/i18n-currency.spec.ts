import { expect, type Page, test } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE_URL = "http://localhost:4321";

test.describe("i18n and currency persistence E2E tests", () => {
  // Helper function to check for axe violations on a page
  const checkAxeViolations = async (page: Page) => {
    const axeScanResults = await new AxeBuilder({ page }).analyze();
    expect(axeScanResults.violations).toEqual([]);
  };

  test("language persists after reload", async ({ page }) => {
    // Go to home page
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(BASE_URL + "/");

    // Check initial language (should be Spanish by default based on README)
    const htmlLang = page.locator("html");
    await expect(htmlLang).toHaveAttribute("lang", /^es/); // Spanish

    // Click language selector button to open dropdown
    await page.locator("#lang-switcher-button").click();
    // Wait for dropdown to be visible
    await expect(page.locator("#lang-switcher-dropdown")).toBeVisible();

    // Click on English language option (assuming it's the second option or we can find by text)
    // We'll find the link that contains "English" or has href with /en
    const englishLink = page.locator("#lang-switcher-dropdown a").filter({ hasText: /English/i });
    await expect(englishLink).toBeVisible();
    await englishLink.click();

    // Wait for navigation to complete (the link causes a full page reload)
    await page.waitForLoadState("networkidle");

    // Verify that the URL now contains /en
    await expect(page).toHaveURL(/\/en\//);

    // Verify the html lang attribute is now English
    await expect(htmlLang).toHaveAttribute("lang", /^en/);

    // Reload the page to test persistence
    await page.reload();
    await page.waitForLoadState("networkidle");

    // After reload, the URL should still be in English
    await expect(page).toHaveURL(/\/en\//);
    // And the lang attribute should still be English
    await expect(htmlLang).toHaveAttribute("lang", /^en/);

    // Check for axe violations and console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await checkAxeViolations(page);
    expect(consoleErrors).toEqual([]);
  });

  test("currency persists after reload", async ({ page }) => {
    // Go to home page
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(BASE_URL + "/");

    // Open currency selector dropdown
    await page.locator("#currency-switcher-button").click();
    await expect(page.locator("#currency-switcher-dropdown")).toBeVisible();

    // Select EUR (second currency option)
    const eurOption = page.locator(".currency-option").filter({ hasText: /EUR/i }).first();
    await expect(eurOption).toBeVisible();
    await eurOption.click();

    // The currency selector triggers a page reload via window.location.reload()
    await page.waitForLoadState("networkidle");

    // Verify that the currency selector now shows EUR
    const currencyCodeEl = page.locator("#currency-switcher-code");
    await expect(currencyCodeEl).toHaveText("EUR");

    // Reload the page to test persistence
    await page.reload();
    await page.waitForLoadState("networkidle");

    // After reload, the currency should still be EUR
    await expect(currencyCodeEl).toHaveText("EUR");

    // Check for axe violations and console errors
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });
    await checkAxeViolations(page);
    expect(consoleErrors).toEqual([]);
  });
});