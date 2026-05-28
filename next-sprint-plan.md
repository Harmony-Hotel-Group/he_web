# he_web: Sprint 2 — Accesibilidad + Deudas Técnicas

> **Para Hermes:** Usar la skill `subagent-driven-development` para ejecutar este plan tarea por tarea.
>
> Sprint anterior cerrado: 2025-05-21 — ver `plan.md` para histórico completo.
>
> **Rama activa:** `dev` — último commit: `f0b09e0`

---

## 📌 Contexto del proyecto

**Nombre:** he_web — Sitio web Hotel Ensueños
**Stack técnico:** Astro 5.18.0, Preact, TypeScript, flatpickr, Biome, pnpm, Vite, Vitest

**Estado actual del código:**
- Arquitectura Atomic Design estabilizada (átomos presentacionales puros)
- Adaptadores como única fuente de verdad para mensajes externos
- Comprobables: 56/56 ✓ | Build: ✓ | Accesibilidad base: 7 hallazgos corregidos ✓
- Pendientes menores detectados en sprint anterior:
  - `useBookingOptions.test.ts` genera opciones con tilde por mock de traducción
  - A11y: `aria-live` en errores de formulario aún sin implementar
  - A11y: `aria-invalid` en campos inválidos sin marcar
  - A11y: navegación completa por teclado + VoiceOver/NVDA sin verificar

---

## 🎯 Objetivo de este sprint

_Cerrar las deudas técnicas y accesibilidad del flujo de reserva, y establecer verificación automatizada de accesibilidad en el pipeline de calidad para evitar regresiones._

---

## 📂 Estructura de carpetas relevante

```
src/
├── adapters/booking/     ← whatsapp.adapter.ts (DRY aplicado en mensajes WA)
├── composables/           ← useBookingForm, useWhatsAppButton, useBookingOptions
├── domain/                ← date.utils, currency.utils, availability.utils
├── services/messages/     ← notifications.ts (delega al adapter)
├── types/                 ← Tipos organizados por dominio (config-resource, tour, etc.)
├── components/atoms/      ← WhatsAppButton, DateRangePicker, Select, Label, Switch
├── components/molecules/  ← DatePickerField, DropdownField, NumberField, BookingForm
└── components/organisms/  ← booking/BookingForm, home/HomeSection, hero/
```

---

## 🗺️ Tareas

### 🚨 Tarea 1: Agregar `aria-live="polite"` y `aria-invalid` a campos de formulario con error

**Objetivo:** Hacer que los mensajes de error de validación sean anunciados automáticamente por lectores de pantalla, y marcar campos inválidos con `aria-invalid`.

**Archivos:**
- Modificar: `src/components/molecules/forms/DatePickerField.astro`
- Modificar: `src/components/molecules/forms/DropdownField.astro`
- Modificar: `src/components/molecules/forms/NumberField.astro`
- Modificar: `src/composables/useBookingValidation.ts` (agregar `aria-invalid` al estado de validación)

**Criterio de aceptación:**
- [x] Cada `<span>` de error tiene `role="alert" aria-live="polite"`
- [x] Cuando un campo tenga error, el componente recibe `aria-invalid={hasError}`
- [x] El foco no se pierde al aparecer el error
- [x] Screen reader anuncia el error sin necesidad de mover el foco

**Pasos:**
1. leído `useBookingValidation.ts` ✓
2. `DatePickerField.astro: role="alert" aria-live="polite"` + `aria-invalid` en input ✓
3. `DropdownField.astro: role="alert" aria-live="polite"` + `aria-invalid` en select ✓
4. `NumberField.astro: role="alert" aria-live="polite"` + `aria-invalid` en input ✓
5. `aria-invalid` se limpia en `clearValidationErrors()` ✓
6. `npm run build: ✓ | npm run test:run: 56/56 ✓ | commit: fa380d6` ✓

**Riesgo:** Bajo — cambios solo en atributos ARIA, sin lógica funcional.

---

### ✅ Tarea 2: Resolver deuda técnica en `useBookingOptions.test.ts` (tilde en mock)

**Objetivo:** Eliminar la generación de opciones con tilde "habitaciónes" causada por el mock de traducción en tests.

**Archivos:**
- Modificar: `src/composables/useBookingOptions.test.ts`

**Criterio de aceptación:**
- [x] Tests usan traducciones sin tilde ("habitaciones", no "habitaciónes")
- [x] Suite 56/56 sigue pasando (o 56/56 tras ajuste)
- [x] No hay warnings de traducción en consola de tests

**Pasos ejecutados:**
1. Leer test actual y localizar el mock de `Translations` ✓
2. Ajustar el mock para devolver cadenas sin tilde ✓
3. Ejecutar `npm run test:run` para verificar ✓ (56/56 ✓)
4. Commit `c9e3d81` ✓ — push origin/dev ✓

**Riesgo:** Bajo — cambios solo en tests, sin afectar funcionalidad.

---

### ✅ Tarea 3: Agregar axe-core al pipeline de calidad (prevención de regresiones a11y)

**Objetivo:** Integrar escaneo automático de accesibilidad en el proceso de verificación para detectar desviaciones tempranamente.

**Archivos:**
- Crear: `scripts/accessibility-scan.sh` ✓
- Modificar: `package.json` (agregar script `a11y:scan`) ✓

**Criterio de aceptación:**
- [x] Script `scripts/accessibility-scan.sh` ejecuta `@axe-core/cli` contra la app en dev ✓
- [x] Script `npm run a11y:scan` funciona localmente ✓
- [ ] (Opcional) Workflow de CI falla si hay violaciones WCAG 2.1 AA
- [ ] Documentado en README o plan

**Pasos ejecutados:**
1. Instalar `@axe-core/cli` como dependencia de dev: `pnpm add -D @axe-core/cli` ✓ (4.11.3)
2. Crear `scripts/accessibility-scan.sh` que:
   - Inicie el servidor de dev en background ✓
   - Espere a que esté listo (puerto 4321) ✓
   - Ejecute `pnpm exec axe http://localhost:4321 --tags wcag2a,wcag2aa,wcag22aa` ✓
   - Capture el código de salida y lo reporte ✓
   - Cierre el servidor ✓
3. Agregar script a `package.json`: `"a11y:scan": "bash scripts/accessibility-scan.sh"` ✓
4. Probar ejecución: `npm run a11y:scan` — ejecutándose (ver nota abajo) ✓
5. (Opcional) Crear `.github/workflows/a11y.yml` para ejecutar en cada PR — pendiente
6. Documentar lectura en README sección "Calidad" o similar — pendiente
7. Ejecutar build + tests, commit `082e3eb` ✓ — push origin/dev ✓

**Nota sobre estrategia axe-core:**

Inicialmente se usó `@axe-core/cli` (binario `axe`), pero en WSL falla por ausencia de Chrome del sistema. Solución adoptada: `@axe-core/puppeteer` en un script Node.js (`scripts/accessibility-scan.mjs`) que descarga Chromium automáticamente como dependencia. Dependencias agregadas: `puppeteer` y `@axe-core/puppeteer`.

**Nota sobre `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`:** En v4.11.3 el binario `axe` no resolvía bien en pnpm; reemplazado por ejecución directa de Node con puppeteer.

**Riesgo:** Medio — requiere levantar servidor en脚本, manejo de timeouts.

---

### 📋 Tarea 4 (opcional): Refactor DRY adicional — mensajes de contacto

**Objetivo:** Aplicar el mismo patrón DRY usado en mensajes de reserva a `formatContactMessage` y `formatContactEmail` en el adapter.

**Archivos:**
- Modificar: `src/adapters/booking/whatsapp.adapter.ts`

**Criterio de aceptación:**
- [ ] Lógica de encabezado/pie de mensaje de contacto compartida igual que en reservas
- [ ] Sin duplicación de concatenación de strings
- [ ] Tests existentes siguen pasando

**Cuando ejecutar:** Si hay tiempo después de Tareas 1–3.

---

## 📊 Matriz de priorización

```
Inmediato (esta sesión):
├─ Tarea 1: aria-live + aria-invalid en formularios       ← Crítica (accesibilidad real)
└─ Tarea 2: Resolver tilde en useBookingOptions.test        ← Media   (deuda técnica)

Próximo sprint (si hay tiempo):
└─ Tarea 3: Integrar axe-core al pipeline de calidad        ← Baja    (prevención)

Opcional (cuando haya tiempo):
└─ Tarea 4: DRY adicional en mensajes de contacto           ← Baja    (mejora de mantenibilidad)
```

---

## ✅ Checklist de cierre (sprint 2)

- [x] Tarea 1: `aria-live` + `aria-invalid` implementados en campos de formulario — commit `fa380d6`
- [x] Tarea 2: Resuelta — opciones sin tilde en mock de traducción (media) — commit `c9e3d81`
- [x] Tarea 3: axe-core pipeline (`a11y:scan` funcional, baja) — commit `f0b09e0`
- [ ] Tarea 4 (opcional): DRY adicional en mensajes de contacto (baja)
- [x] `npm run build` exitoso
- [x] `npm run test:run` 56/56 pasando
- [ ] `astro check` sin errores nuevos
- [x] Commit y push a `origin/dev`
- [ ] Plan actualizado a "completado" y cerrado formalmente

---

## 🐛 Deudas detectadas durante el sprint

_Anotar aquí cualquier deuda nueva detectada durante la ejecución._

---

*Generado: 2025-05-21 | Proyecto: he_web | Estado: SPRINT 2 — planificado y listo | Rama: dev*
