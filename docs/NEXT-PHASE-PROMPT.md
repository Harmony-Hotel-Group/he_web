# Prompt siguiente fase — he_web (post Fase 4)

## Estado actual confirmado
- Rama: `dev`
- HEAD: `baa7826`
- Fase 4 Microinteracciones: cerrada
- Build: exitoso
- Tests unitarios: 63/63
- Biome: 2 errores + 23 warnings documentados
- Accesibilidad: `prefers-reduced-motion` aplicado en `global.css`; resto de ajustes en `src/**` diferidos.

## E2E real (no obviar)
Suite: `pnpm exec playwright test --project=chromium`
- `booking.spec.ts`: 1/5 verde con fallos repetitivos (flatpickr y búsqueda).
- `visual-autonomous.spec.ts`: 4/5 verde; fallo repetitivo en interacción flatpickr.

Diagnóstico técnico (verificado):
- El selector que usa el test NO coincide con la implementación actual.
- `src/components/atoms/DateRangePicker.astro` define el input de fecha como `input` readonly, no como botón.
- `src/components/molecules/forms/DatePickerField.astro` instancia `DateRangePicker` con `id="date-range-picker"` (u otro `fieldId`), `name=checkin|checkout`, `type="text"`, `data-lang`, `data-sync-group`.
- Selector correcto esperado en tests E2E: localizar el input readonly dentro de `#booking-form` mediante `#booking-form input[name="checkin"]` y `#booking-form input[name="checkout"]`, clickeando sobre él para abrir flatpickr.

Cambios ya aplicados que NO funcionaron (no volver a repetir misma ruta):
- `page.getByRole("button", { name: /check-in|checkin|fecha de entrada/i })` → NO encuentra el elemento.

## Próxima fase elegida
Fase 5: SEO/Performance.

## Tareas obligatorias
1. Confirmar árbol limpio y sin artefactos temporales.
2. Ejecutar y registrar:
   - `pnpm biome check src/`
   - `pnpm vitest run`
   - `pnpm astro build`
   - `pnpm exec playwright test tests/e2e/booking.spec.ts --project=chromium --reporter=list`
   - `pnpm exec playwright test tests/e2e/visual-autonomous.spec.ts --project=chromium --reporter=list`
3. Implementar SOLO cambios alineados con Fase 5 (SEO/Performance), sin reabrir Fase 4 ni tocar lógica de negocio.
4. Proponer commits atómicos con mensajes en español.
5. Actualizar `docs/PROJECT-STATE.md` y `docs/OPEN-ITEMS.md`.

## Restricciones
- No reabrir Fase 4.
- No eliminar archivos sin justificación documentada.
- Un solo foco de trabajo por fase.
- No mezclar código ajeno o cambios estructurales extra.
