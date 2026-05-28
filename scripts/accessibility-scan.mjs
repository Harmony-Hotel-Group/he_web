#!/usr/bin/env node
// scripts/accessibility-scan.mjs
// Escaneo de accesibilidad con @axe-core/playwright
// Uso: pnpm exec node scripts/accessibility-scan.mjs [url]
import { chromium } from 'playwright-core';
import { AxeBuilder } from '@axe-core/playwright';

const url = process.argv[2] || 'http://localhost:4321';

let browser;
try {
  console.error(`🚀 Lanzando navegador con Playwright (Chromium)…`);
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.error(`🔍 Ejecutando axe-core contra ${url}`);
  console.error('');

  // Usar tag wcag2a,wcag2aa,wcag22aa para cubrir normas completas de AA
  // Excluir iframes de YouTube (cross-origin, no modificables)
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
		.exclude('iframe') // Excluir todos los iframes (cross-origin, no modificables)
		.analyze();

  const { violations, passes, incomplete, inapplicable } = results;
  const total = violations.length + passes.length + incomplete.length + inapplicable.length;

  console.log(`\n===== Axe Results for ${url} =====`);
  console.log(`Total checks: ${total}`);
  console.log(`✅ Passes:      ${passes.length}`);
  console.log(`❌ Violations:  ${violations.length}`);
  console.log(`⚠️  Incomplete:  ${incomplete.length}`);
  console.log(`⏭️  Inapplicable: ${inapplicable.length}`);
  console.log('');

  if (violations.length > 0) {
    for (const v of violations) {
      console.log(`\n[${v.id}] ${v.help} — Impact: ${v.impact || 'n/a'}`);
      console.log(`  Description: ${v.description || ''}`);
      if (v.nodes?.length) {
        console.log('  Nodes:');
        for (const node of v.nodes.slice(0, 5)) {
          console.log(`    - ${node.target?.join(' > ') || '(unknown)'}`);
          if (node.failureSummary) console.log(`      ${node.failureSummary}`);
        }
        if (v.nodes.length > 5) console.log(`    … y ${v.nodes.length - 5} más`);
      }
    }
    console.log(`\n❌ Escaneo completado con ${violations.length} violacion(es).`);
    console.error('   Recuerda: axe detecta ~30% de los issues; complementar con testing manual.\n');
    process.exitCode = 1;
  } else {
    console.log(`✅ Escaneo completado: sin violaciones de accesibilidad detectadas.\n`);
    process.exitCode = 0;
  }
} catch (err) {
  console.error(`❌ Error en escaneo: ${err.message}`);
  process.exitCode = 2;
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
}
