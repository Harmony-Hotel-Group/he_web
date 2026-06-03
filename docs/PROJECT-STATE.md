# he_web — Estado del proyecto

- Proyecto: Hotel Ensueños
- Stack: Astro + Preact + TypeScript + Biome + pnpm + Vitest + Playwright
- Estado: estabilizado para producción con restricciones documentadas
- Sprint actual: Fase 4 del Plan Unificado — Microinteracciones

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
- [x] Fase 3 UI/UX cerrada (overlays homogeneizados)
- [x] No se permitieron reparaciones de accesibilidad en `src/**` en Fase 3

## Entregables pendientes (próxima fase)
- [x] Fase 4 Microinteracciones — transiciones y microanimaciones seguras (Plan Unificado)
- [~] Fase 4 Microinteracciones — en progreso (4.1 completada, 4.2/4.3/4.4 pendientes de habilitar `src/**`)

## Restricciones externas activas (para no reabrir)
- Accesibilidad: no se permiten reparaciones de accesibilidad en `src/**` en Fase 3 (diferidas a fase específica). 
- E2E en CI: dependencias de navegador en entorno limitan WebKit/Firefox; se registran fallos por entorno, no por regresión funcional.
- Lint: 2 errores Biome documentados sin fix por alcance de fase vigente.

## Métricas actuales
- Build: exitoso
- Pruebas unitarias: 63/63
- Biome: 2 errores + 23 warnings documentados
- E2E: resultados mixtos por entorno
- Accesibilidad: escaneo activo, reparaciones diferidas

## Próximos pasos sugeridos
1. Ejecutar Fase 4 Microinteracciones con cambios visuales pequeños y commits atómicos.
2. Accesibilidad: reparar violaciones cuando se permita modificar `src/**` en fase designada.
3. E2E: resolver dependencias de navegadores en CI para WebKit/Firefox.
