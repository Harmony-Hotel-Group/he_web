import { test, expect } from '@playwright/test';

test.describe('Hotel Ensueños Website', () => {
  test('debería cargar la página principal', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el título contiene "Hotel Ensueños"
    await expect(page).toHaveTitle(/Hotel Ensueños/);
  });

  test('debería mostrar el meta description correcto', async ({ page }) => {
    await page.goto('/');
    
    // Verificar meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /Hotel Ensueños/);
  });

  test('debería tener keywords de hotel', async ({ page }) => {
    await page.goto('/');
    
    // Verificar keywords
    const keywords = page.locator('meta[name="keywords"]');
    await expect(keywords).toHaveAttribute('content', /hotel/);
  });

  test('debería tener JSON-LD para Hotel', async ({ page }) => {
    await page.goto('/');
    
    // Verificar schema.org JSON-LD
    const jsonLd = page.locator('script[type="application/ld+json"]');
    await expect(jsonLd).toHaveCount(1);
    
    const content = await jsonLd.textContent();
    expect(content).toContain('"@type":"Hotel"');
    expect(content).toContain('Hotel Ensueños');
  });

  test('debería tener OpenGraph', async ({ page }) => {
    await page.goto('/');
    
    // Verificar OpenGraph
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogImage = page.locator('meta[property="og:image"]');
    
    await expect(ogTitle).toHaveAttribute('content', /Hotel Ensueños/);
    await expect(ogDescription).toHaveAttribute('content', /.+/);
    await expect(ogImage).toHaveAttribute('content', /.+/);
  });

  test('debería ser responsivo en móvil', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // La página debe cargar sin errores
    await expect(page).toHaveTitle(/Hotel Ensueños/);
  });
});

test.describe('Booking', () => {
  test('debería cargar la página de reservas', async ({ page }) => {
    await page.goto('/booking');
    
    // Verificar que la página carga
    await expect(page).toHaveTitle(/Hotel Ensueños/);
  });
});
