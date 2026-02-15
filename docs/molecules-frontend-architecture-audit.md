# Auditoría de arquitectura frontend — `src/components/molecules`

## Alcance
Se revisaron los siguientes módulos:
- `forms/`: `DatePickerField`, `DropdownField`, `NumberField`, `SwitchField`.
- `cards/`: `InfoCard`.
- `media/`: `VisualResource`, `ImageResource`, `VideoResource`, `YouTubeResource`.

## 1) Lógica de negocio detectada

### Hallazgo A — `InfoCard.astro` contiene lógica de dominio de precios/moneda
- Lee estado de moneda desde cookie (`Astro.cookies.get("currency")`).
- Construye mapa de tipos de cambio (`supportedCurrencies.reduce`).
- Convierte importes (`convert`) y formatea moneda (`formatCurrency`).
- Replica lógica en cliente para reaccionar a `currencyChanged` + `localStorage`.

**Conclusión:** `InfoCard` no es solo composición visual; mezcla presentación + reglas de precio/currency.

### Hallazgo B — `VisualResource.astro` decide estrategia de recurso y fallback
- Detecta tipo de recurso (`detectResourceType`).
- Valida recurso (`validateResource`) y decide placeholder.
- Extrae `videoId` para YouTube y enruta al subcomponente.

**Conclusión:** hay orquestación de estrategia y validación en una molecule que podría simplificarse si recibe datos ya resueltos.

### Hallazgo C — `YouTubeResource.astro` contiene lógica operativa compleja en cliente
- Extrae `videoId` y genera URL de embed.
- Implementa capa anti-pausa para autoplay con `postMessage`/`messageHandler`.
- Ajusta tamaño manual de iframe con lógica de `cover`.

**Conclusión:** demasiado comportamiento de infraestructura dentro del componente; conviene moverlo a un controller/util específico.

### Hallazgo D — `VideoResource.astro` implementa manager completo de runtime
- Deducción de MIME y construcción de `sources`.
- Clase `VideoResourceManager` con listeners, manejo de errores, autoplay inteligente con `IntersectionObserver`, API pública y cleanup.

**Conclusión:** es una pieza de infraestructura multimedia más que una molecule de UI.

## 2) Construcción de mensajes de WhatsApp

- **No se detectó construcción de mensajes de WhatsApp en `src/components/molecules`.**
- La búsqueda de `whatsapp`, `wa.me`, `encodeURIComponent` no arrojó resultados en esta carpeta.

## 3) Validaciones indebidas

### Casos detectados
- `VisualResource.astro`: validación de recurso y fallback en capa de componente.
- `ImageResource.astro`: vuelve a validar recurso cuando `src` es string.

> Esto duplica responsabilidades de validación/sanitización y acopla la molecule al origen de datos.

## 4) Dependencias directas de adapters/utils

### Dependencias directas observadas
- `VisualResource.astro` depende de `@/utils/visual-resource-utils.ts` (`detectResourceType`, `validateResource`, `extractYouTubeId`).
- `ImageResource.astro` depende de `validateResource` desde el mismo util.
- `YouTubeResource.astro` depende de `getYouTubeEmbedUrl` y `extractYouTubeId` desde util.

### Nota
- No hay dependencia directa a `adapters/` en molecules revisados, pero sí dependencia fuerte a `utils` con responsabilidades de dominio/técnicas mezcladas.

## 5) Qué mover a `adapters`

## A `adapters/pricing` (nuevo)
Desde `cards/InfoCard.astro`:
- Resolver moneda seleccionada y fallback.
- Mapa de rates (`supportedCurrencies -> Record`).
- Conversión monetaria y formato final de display.
- Payload para actualizaciones cliente (`data-*`), idealmente ya preparado.

## A `adapters/media` (nuevo)
Desde `media/VisualResource.astro`:
- Detección de tipo de recurso.
- Validación de recurso y política de fallback (placeholder).
- Resolución de estrategia final: `{ componentType, resolvedSrc, videoId, error }`.

Desde `media/YouTubeResource.astro`:
- Construcción de URL embed + params.
- Extracción/normalización de `videoId`.

## A `adapters/video` o `utils/video-controller`
Desde `media/VideoResource.astro` y `media/YouTubeResource.astro`:
- `VideoResourceManager` completo.
- Lógica de resize cover del iframe.
- Lógica anti-pausa/autoplay via mensajes.

## 6) Qué simplificar

1. `InfoCard.astro`
   - Mantener render de tarjeta.
   - Recibir ya resuelto: `displayPrice`, `currencyCode`, `priceData`.
   - Quitar cálculos duplicados server/client.

2. `VisualResource.astro`
   - Convertirlo en “router visual” mínimo.
   - Recibir `resolvedType`, `resolvedSrc`, `videoId` preparados por adapter.

3. `YouTubeResource.astro`
   - Dejar solo markup + clases.
   - Delegar lógica JS a módulo aislado reutilizable.

4. `VideoResource.astro`
   - Mantener capa visual/estado.
   - Mover manager a archivo TS dedicado (`video-resource.manager.ts`).

5. `forms/*Field.astro`
   - Mantenerlos como composición de atoms + i18n.
   - No hay señales claras de negocio fuerte aquí; la mayor deuda está en `cards/media`.

## 7) Qué archivos pueden unificarse

### Opción 1 (recomendada): unificación de runtime multimedia
- Unificar lógica JS de `VideoResource.astro` + `YouTubeResource.astro` en:
  - `src/utils/media/media-runtime-controller.ts`
- Beneficio: una sola estrategia de listeners, cleanup y resize.

### Opción 2: consolidación de resolución de recursos
- Unificar `validateResource` + `detectResourceType` + extracción de IDs en:
  - `src/adapters/media/resource-resolution.adapter.ts`
- `VisualResource` e `ImageResource` consumen el mismo contrato.

### Opción 3: fields de formulario base
- `DatePickerField`, `DropdownField`, `NumberField`, `SwitchField` comparten patrón (`Row + Icono + Label + Input + error`).
- Crear `FormFieldShell.astro` para evitar duplicación estructural.

## Priorización de refactor

### Alta
- `src/components/molecules/cards/InfoCard.astro`
- `src/components/molecules/media/YouTubeResource.astro`
- `src/components/molecules/media/VideoResource.astro`
- `src/components/molecules/media/VisualResource.astro`

### Media
- `src/components/molecules/media/ImageResource.astro`

### Baja
- `src/components/molecules/forms/*.astro` (mejoras de DRY/composición, no urgentes por negocio)
