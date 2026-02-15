# Auditoría global — Construcción de mensajes de WhatsApp

## Objetivo de esta auditoría
- Detectar en todo el proyecto dónde se construyen mensajes de WhatsApp.
- Definir una estrategia para centralizar esa generación en **un único adapter**.
- Asegurar que WhatsApp sea solo canal de entrega y no contenedor de lógica de negocio.

## Resultado corto
Hoy existen **múltiples puntos** con construcción manual de strings para WhatsApp (UI + servicio), por lo que la lógica está distribuida y duplicada.

---

## 1) Dónde se construyen mensajes de WhatsApp (hallazgos)

## A. `src/components/atoms/WhatsAppButton.astro`
- Construye un texto hardcodeado de intención y lo codifica con `encodeURIComponent`.
- Construye URL final `https://wa.me/${phoneNumber}?text=${message}`.

**Impacto:** lógica de mensaje dentro de un atom.

## B. `src/components/organisms/booking/BookingForm.astro`
- Arma manualmente un mensaje largo (grupo/estándar + vehículos).
- Parsea rango de fechas desde texto de UI (`dateRangeGroup`) para volver a reconstruir datos.
- Codifica con `encodeURIComponent` y construye URL `wa.me`.

**Impacto:** lógica de negocio + formateo de canal en el organismo.

## C. `src/services/messages/whatsapp.ts`
- Función `formatBookingMessage(formData, bookingType)` construye otro formato de mensaje.
- `sendWhatsappMessage` usa ese mensaje para WhatsApp Cloud API.

**Impacto:** doble fuente de verdad del mensaje (distinta a BookingForm).

## D. Código legado/referencia
- `src/backup/utils/whatsapp/buildBookingMessage.ts` contiene otra implementación de builder para `BookingIntentV1`.

**Impacto:** evidencia histórica de tercer formato de mensaje.

---

## 2) Problemas arquitectónicos detectados

1. **Duplicación de formato de mensaje**
   - `BookingForm` y `services/messages/whatsapp.ts` generan textos diferentes para el mismo dominio (reserva).

2. **Acoplamiento de capa UI al canal WhatsApp**
   - Componentes construyen strings, codifican y crean URL.

3. **Canal mezclado con dominio**
   - Datos de negocio (fechas, noches, huéspedes, vehículos) se deciden y formatean para canal en capas de UI.

4. **Parsing frágil de texto de UI**
   - Se parsea `dateRangeGroup` desde string visual para recuperar check-in/check-out/noches.

5. **Inconsistencia de contratos**
   - Existen `BookingIntent` y `BookingIntentV1`, pero no hay un único builder productivo para WhatsApp.

---

## 3) Propuesta obligatoria de centralización

Crear un único archivo:

```txt
src/adapters/booking/whatsapp.adapter.ts
```

Con una función pura:

```ts
buildWhatsappMessage(intent: BookingIntent): string
```

### Principios de diseño
- **Pura**: sin acceso a DOM, `window`, cookies, `localStorage` o `FormData`.
- **Determinista**: mismo `intent` => mismo mensaje.
- **Canal-agnóstica en dominio**: el intent representa negocio; WhatsApp solo recibe string final.
- **Single Source of Truth**: ningún otro archivo debe concatenar strings de WhatsApp.

---

## 4) Reemplazos necesarios (archivo por archivo)

## 4.1 `src/components/organisms/booking/BookingForm.astro`

### Reemplazar
- Bloques que construyen `message` manualmente.
- `encodeURIComponent(message.trim())` con mensaje ya generado por adapter.

### Por
1. Construir `BookingIntent` desde estado/resultado ya validado.
2. Llamar `buildWhatsappMessage(intent)`.
3. Mantener en UI solo:
   - obtención de `whatsappNumber`,
   - apertura de canal (`window.open(...)`) o trigger de action,
   - feedback visual (`toast`).

## 4.2 `src/components/atoms/WhatsAppButton.astro`

### Reemplazar
- Mensaje hardcodeado literal.

### Por
- Un `BookingIntent` mínimo (p. ej. intención general) y llamada a `buildWhatsappMessage(intent)`.
- El atom idealmente recibe `href` ya resuelto desde capa superior; como mínimo no debe armar texto manual.

## 4.3 `src/services/messages/whatsapp.ts`

### Reemplazar
- `formatBookingMessage(formData, bookingType)`.

### Por
1. Mapper `FormData -> BookingIntent` (puede vivir en otro adapter/mapping function).
2. `buildWhatsappMessage(intent)` para `payload.text.body`.

> El servicio debe encargarse de transporte API, no de formato de negocio.

## 4.4 `src/adapters/booking.adapter.ts`

### Reemplazar / ajustar
- Actualmente `createBookingIntent` devuelve `message` embebido.

### Por
- `createBookingIntent` devuelve solo datos de intención (sin campo `message`).
- El mensaje se genera exclusivamente en `whatsapp.adapter.ts`.

## 4.5 Limpieza de legado
- `src/backup/utils/whatsapp/buildBookingMessage.ts` queda como referencia histórica, no fuente activa.

---

## 5) Contrato recomendado de dominio

El proyecto ya tiene `src/types/booking.ts` y `src/contracts/booking.intent.ts`.
Para minimizar fricción:

- Opción A (rápida): evolucionar `src/types/booking.ts` para cubrir campos reales (grupo/vehículos/desayuno/notas) y usarlo en el adapter nuevo.
- Opción B (más robusta): adoptar `BookingIntentV1` como contrato canónico y mapear desde UI/acciones.

En ambos casos, `buildWhatsappMessage(intent)` debe depender de **un único contrato tipado**.

---

## 6) Estructura final sugerida

```txt
src/
  adapters/
    booking/
      booking-intent.adapter.ts      # (opcional) mappers UI/FormData -> BookingIntent
      whatsapp.adapter.ts            # buildWhatsappMessage(intent)

  services/
    messages/
      whatsapp.ts                    # SOLO envío por API (sin construir mensaje)

  components/
    organisms/
      booking/BookingForm.astro      # SOLO orquestación UI + canal
    atoms/
      WhatsAppButton.astro           # SOLO render/cta o href recibido
```

---

## 7) Criterio de aceptación de la centralización

Se considera cumplido cuando:
1. Existe `src/adapters/booking/whatsapp.adapter.ts` con `buildWhatsappMessage(intent: BookingIntent): string`.
2. Ningún componente (`atoms/molecules/organisms/pages`) concatena o templatea mensaje de WhatsApp.
3. Ningún servicio de transporte (`services/messages/*`) formatea mensaje de negocio.
4. Todas las salidas (wa.me y Cloud API) consumen el mismo builder.

---

## 8) Riesgos actuales si no se centraliza

- Cambios de copy/negocio deben replicarse en varios archivos.
- Inconsistencias entre mensaje de web-open (`wa.me`) y mensaje API.
- Errores por parseo de cadenas visuales (p. ej. rango de fechas).
- Dificultad para internacionalización y versionado del contrato de reserva.
