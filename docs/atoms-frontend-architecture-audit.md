# Auditoría de arquitectura frontend — `src/components/atoms`

## Objetivo
Evaluar si los átomos contienen lógica de negocio, validaciones/transformaciones indebidas y si se comportan como componentes puramente presentacionales (props limpias + render).

## Hallazgos principales

### 1) Lógica de negocio detectada dentro de atoms

1. **`DateRangePicker.astro` concentra reglas de dominio de booking**
   - Regla de negocio de estadía mínima implícita: bloquea selección cuando inicio y fin son el mismo día (`sameDayError` + `alert`).
   - Cálculo de noches y construcción de mensaje de negocio (`nights`, pluralización, texto final con rango).
   - Emisión de evento de dominio con payload enriquecido (`datepicker:change` con `nights`, `dates`, `syncGroup`).
   - Coordinación global de sincronización entre pickers (`datePickerSync.register/sync/unregister`) y bootstrap global (`window.initializeAllDatePickers`, `MutationObserver`).

2. **`SearchInput.astro` incluye lógica de comportamiento + filtrado de datos**
   - Filtrado en cliente (`options.filter`) con normalización (`toLowerCase`) e inclusión por texto (`includes`).
   - Render dinámico del dropdown y gestión de interacción (focus/click outside/selección).

3. **`WhatsAppButton.astro` incorpora construcción de URL de contacto**
   - Lee configuración global (`config.contactInfo.whatsapp`), transforma número y arma mensaje codificado para un caso de uso específico (reserva de habitación).
   - Esto es lógica de aplicación, no sólo render atómico.

4. **`Button.astro`, `Label.astro`, `TextAreaInput.astro` resuelven i18n internamente**
   - Invocan `Translations(...)` dentro del atom.
   - No es necesariamente “lógica de negocio”, pero sí acoplamiento de capa de presentación con infraestructura de i18n.

### 2) Validaciones o transformaciones indebidas para una capa atómica

1. **Validación/normalización dentro de atom de imagen**
   - `Imagen.astro` decide tipo de fuente (`src.startsWith("http")`) para enrutar a variante local/remota.
   - `ImagenValidada.astro` ejecuta `validateImageSource(src)`.
   - Aunque la validación usa adapter, sigue ocurriendo en el átomo (idealmente debería llegar ya saneado).

2. **`Select.astro` transforma semántica de selección**
   - Recibe `value?: number` pero lo interpreta como **índice 1-based** (`index === value - 1`), no como valor real de opción.
   - Esta traducción índice→opción es una decisión de capa superior.

3. **`SearchInput.astro` transforma dataset de opciones para autocompletar**
   - Normaliza y filtra; esto debería vivir en adapter/composable de búsqueda si se quiere atom puro.

4. **`ToggleButton.astro` genera `id` derivado (`name-value`)**
   - Es transformación menor (aceptable), pero sigue siendo lógica de preparación de datos dentro del atom.

## Archivos que deberían priorizar refactor

### Prioridad alta
- `src/components/atoms/DateRangePicker.astro`
- `src/components/atoms/SearchInput.astro`
- `src/components/atoms/WhatsAppButton.astro`

### Prioridad media
- `src/components/atoms/Select.astro`
- `src/components/atoms/button/Button.astro`
- `src/components/atoms/Label.astro`
- `src/components/atoms/TextAreaInput.astro`
- `src/components/atoms/image/Imagen.astro`
- `src/components/atoms/image/ImagenValidada.astro`

### Prioridad baja (ajustes de pureza)
- `src/components/atoms/ToggleButton.astro`
- `src/components/atoms/Switch.astro` (si se decide mover comportamiento JS fuera de atoms)

## Qué código mover a `adapters` o `utils`

### A `adapters/booking` o `utils/booking`
Desde `DateRangePicker.astro`:
- Regla “no permitir mismo día” y mensaje de error.
- Cálculo de noches.
- Formateo de rango para display.
- Construcción de payload de evento de cambio.

### A `adapters/search` o `utils/search`
Desde `SearchInput.astro`:
- Función de filtrado (`query` + normalización + includes).
- Opcional: mapeo de opciones a estructura renderizable.
- Controlador de estado (open/close/focus) si se quiere desacoplar totalmente del atom.

### A `adapters/contact` o `utils/contact`
Desde `WhatsAppButton.astro`:
- Limpieza de número (`replace(/\+/g, "")`).
- Plantilla de mensaje de negocio de reserva.
- Constructor de URL `wa.me`.

### A `adapters/forms`
Desde `Select.astro`:
- Resolver `selectedOption` desde modelo de dominio (evitar índice 1-based en atom).

### A capa superior (molecule/organism/page loader)
Desde `Button.astro`, `Label.astro`, `TextAreaInput.astro`:
- Resolución de traducción (`t(lblKey)` / placeholder traducido).
- Atom debería recibir string final listo para pintar.

### A `adapters/image`
Desde `Imagen.astro` y `ImagenValidada.astro`:
- Decisión local/remota según `src`.
- Sanitización previa de `src` antes de llegar al atom base.

## Estructura ideal final sugerida

```txt
src/
  components/
    atoms/
      Button.astro            # Presentacional puro: label string + clases + icon props
      Label.astro             # Presentacional puro: texto final, required boolean
      TextInput.astro
      TextAreaInput.astro
      Select.astro            # Recibe selectedValue directo
      Image.astro             # Opcionalmente solo wrapper mínimo
      ...

    molecules/
      DateRangeField.astro    # Orquesta datepicker + reglas de negocio UI
      SearchField.astro       # Controla autocompletado y dropdown state
      ContactWhatsAppCta.astro# Construye intención de contacto y la pasa al atom

  adapters/
    booking/
      date-range.adapter.ts   # nights, reglas de rango, payload mapper
    search/
      search-filter.adapter.ts
    contact/
      whatsapp.adapter.ts
    image/
      image.adapter.ts         # estrategia source + sanitización
    forms/
      select.adapter.ts        # selected value mapping

  utils/
    date/
      date-format.ts
    strings/
      normalize.ts

  i18n/
    ...                        # Resuelto en capas superiores (molecule/page)
```

## Criterio objetivo para atoms “limpios”
Un atom queda limpio cuando:
1. No consulta config global ni servicios.
2. No ejecuta reglas de negocio ni validaciones de dominio.
3. No transforma datos de entrada más allá de defaults visuales triviales.
4. Renderiza en función de props ya preparadas y emite eventos de UI genéricos.
