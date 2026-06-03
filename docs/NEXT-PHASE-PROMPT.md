# Prompt siguiente fase — he_web

## Objetivo
Avanzar por UNA sola línea del Plan Unificado, manteniendo `he_web` estable y sin reabrir fases anteriores.

## Estado documentado
- Rama: `dev`
- Build: exitoso
- Tests unitarios: 63/63
- Biome: 2 errores + 23 warnings documentados como alcance vigente
- E2E: resultados mixtos por dependencias de entorno en CI
- Accesibilidad: reparaciones diferidas por restricción de modificar `src/**` en esta fase

## Tareas
1. Confirmar que el árbol está limpio y sin artefactos temporales.
2. Ejecutar y registrar:
   - `pnpm biome check src/`
   - `pnpm vitest run`
   - `pnpm astro build`
3. Elegir UNA fase del Plan Unificado:
   - Fase 1: adopción adapter
   - Fase 2: atoms/molecules
   - Fase 3: UI/UX
   - Fase 4: Tour Intent
   - Fase 5: SEO/Performance
4. Proponer el primer commit atómico de esa fase, con mensaje en español.
5. Actualizar `docs/PROJECT-STATE.md` con la fase elegida y el objetivo del próximo hito.

## Restricciones
- No reabrir arquitectura vieja ni refactors ya aprobados.
- No eliminar archivos sin justificación documentada.
- Un solo foco de trabajo por fase.
