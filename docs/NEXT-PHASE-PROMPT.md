# Prompt siguiente fase — he_web (Fase 4 Microinteracciones)

## Estado actual
- Rama: `dev`
- Último commit Fase 3: `874a8f2` — overlay de `HomeHero` / `PageHero` actualizado
- Build: exitoso
- Tests unitarios: 63/63
- Biome: 2 errores + 23 warnings documentados como alcance vigente
- E2E: resultados mixtos por dependencias de entorno en CI
- Accesibilidad: reparaciones diferidas por restricción de modificar `src/**` en Fase 3

## Fase vigente
- Cerrada Fase 3 del Plan Unificado — UI/UX (homogeneización visual sin rediseño)
- Siguiente: **Fase 4 — Microinteracciones** (animaciones y transiciones seguras)

## Tareas
1. Confirmar que el árbol sigue limpio y sin artefactos temporales.
2. Ejecutar y registrar:
   - `pnpm biome check src/` (2 errores + 23 warnings vigentes)
   - `pnpm vitest run` (63/63)
   - `pnpm astro build` (exitoso)
   - `pnpm playwright test` si aplica
3. Ejecutar Fase 4 Microinteracciones con commits atómicos sin tocar `src/**` a menos que el prompt lo pida expresamente.
4. Si hay más trabajo de Fase 4, proponer commits atómicos mediante cambios pequeños en componentes visuales.
5. Actualizar `docs/PROJECT-STATE.md` con:
   - fase vigente
   - commits aplicados
   - estado de verificaciones

## Restricciones
- No reabrir arquitectura vieja ni refactors ya aprobados.
- No eliminar archivos sin justificación documentada.
- Un solo foco de trabajo por fase.
