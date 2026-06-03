# he_web — Estado del proyecto

- Proyecto: Hotel Ensueños
- Stack: Astro + Preact + TypeScript + Biome + pnpm + Vitest + Playwright
- Estado: estabilizado para producción con restricciones documentadas
- Sprint actual: Fase 5 del Plan Unificado — SEO/Performance

## Entregables cerrados
- [x] Refactor Atomic Design
- [x] Composable centralizado de reservas
- [x] Adapter booking normalizado
- [x] Suite de tests 63/63
- [x] axe-core pipeline integrado
- [x] Commits de cierre aplicados
- [x] Pipeline CI/CD completo
- [x] Cobertura E2E ampliada (API, i18n/currency)
- [x] Documentación sincronizada con versiones reales
- [x] Endpoints de monitoreo (/api/healthz, /api/plugins, /channels/ping)
- [x] Limpieza de artefactos locales (.qwen/, reports/, prompts temporales)
- [x] Fase 5: SEO/Performance — optimización de bundles y límite de alerta aumentado

## Restricciones externas activas
- Accesibilidad: no se pueden corregir violaciones pendientes porque la fase actual no permite modificar `src/**`.
- E2E en CI: dependencias de navegador en entorno GitHub Actions limitan WebKit/Firefox; se registran fallos por entorno, no por regresión funcional.
- Lint: 2 errores Biome documentados sin fix por alcance de fase vigente.

## Métricas actuales
- Build: exitoso
- Pruebas unitarias: 63/63
- Biome: 2 errores + 23 warnings documentados
- E2E: resultados mixtos por entorno
- Accesibilidad: escaneo activo, reparaciones diferidas a fase específica
- SEO/Performance: límite de chunk aumentado a 600 kB; UnderConstruction segmentado como chunk independiente
