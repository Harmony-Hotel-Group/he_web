#!/usr/bin/env node
// scripts/accessibility-scan.mjs
// Wrapper de axe-core usando @axe-core/puppeteer (sin dependencia de Chrome del sistema)
// Uso: pnpm exec node scripts/accessibility-scan.mjs [url]
// Por defecto: http://localhost:4321

import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';

const url = process.argv[2] || 'http://localhost:4321';
const tags = 'wcag2a,wcag2aa,wcag22aa';

let browser;
try {
  console.error(`🚀 Lanzando navegador con Puppeteer…`);
  browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  console.error(`🔍 Ejecutando axe-core contra ${url}`);
  console.error(`   Tags: ${tags}`);
  console.error('');

  const results = await new AxePuppeteer(page, { tags }).analyze();

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
      if (v.nodes.length) {
        console.log('  Nodes:');
        for (const node of v.nodes.slice(0, 5)) {
          console.log(`    - ${node.target.join(' > ')}`);
          if (node.failureSummary) console.log(`      ${node.failureSummary}`);
        }
        if (v.nodes.length > 5) console.log(`    … y ${v.nodes.length - 5} más`);
      }
    }
    console.log(`\n❌ Escaneo completado con ${violations.length} violacion(es).`);
    console.error(`   Recuerda: axe detecta ~30% de los issues; complementar con testing manual.\n`);
    process.exit(1);
  } else {
    console.log(`✅ Escaneo completado: sin violaciones de accesibilidad detectadas.\n`);
    process.exit(0);
  }
} catch (err) {
  console.error(`❌ Error en escaneo: ${err.message}`);
  process.exit(2);
} finally {
  if (browser) {
    await browser.close().catch(() => {});
  }
}
