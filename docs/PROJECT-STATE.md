# he_web — Estado del proyecto

- Proyecto: Hotel Ensueños
- Stack: Astro + Preact + TypeScript + Biome + pnpm + Vitest + Playwright
- Estado: estabilizado para producción con restricciones documentadas
- Sprint actual: Fase 3 del Plan Unificado — UI/UX

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
- [x] Limpieza de artefactos locales (.qwen/, playwright-report/, test-results/)
- [x] SEO/Performance: segmentación de chunk `UnderConstruction` y ajuste build warning
- [x] No se permitieron reparaciones de accesibilidad en `src/**` en esta fase

## Restricciones externas activas (para no reabrir)
- Accesibilidad: no se permiten reparaciones de accesibilidad en `src/**` en esta fase (diferidas a fase específica). 
- E2E en CI: dependencias de navegador en entorno limitan WebKit/Firefox; se registran fallos por entorno, no por regresión funcional.
- Lint: 2 errores Biome documentados sin fix por alcance de fase vigente.

## Métricas actuales
- Build: exitoso
- Pruebas unitarias: 63/63
- Biome: 2 errores + 22 warnings documentados
- E2E: resultados mixtos por entorno
- Accesibilidad: escaneo activo, reparaciones diferidas a fase específica

## Próximos pasos sugeridos
1. Elegir UNA fase del Plan Unificado para la próxima iteración.
2. Accesibilidad: reparar violaciones cuando se permita modificar `src/**`.
3. E2E: resolver dependencias de navegadores en CI para WebKit/Firefox.
