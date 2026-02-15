# Arquitectura propuesta — Tour Intent + Canal desacoplado (Strategy/Adapter)

## Objetivo
Diseñar una arquitectura que permita evolucionar desde:

- **Fase actual:** “Agregar tours a WhatsApp”.
- **Fase futura:** “Agregar tours a carrito” + “integrar pasarela/ERP”.

Sin romper el flujo actual y separando:
- **Acción de negocio** (ej. add-to-cart, quote, checkout) 
- **Canal de salida** (ej. WhatsApp, Web checkout, ERP API)

---

## 1) Diagnóstico del estado actual

Hoy la app mezcla responsabilidades:

1. **UI arma mensaje/canal directamente**
   - `BookingForm.astro` construye string y abre `wa.me`.
2. **Servicio WhatsApp también construye otro mensaje**
   - `services/messages/whatsapp.ts` contiene su propio formatter.
3. **Tours detail no tiene capa de “intención” reutilizable**
   - El CTA existe pero no hay pipeline de intención/canal extensible.

### Consecuencia
Si mañana se agrega carrito o pasarela, habría que duplicar reglas de negocio en múltiples componentes.

---

## 2) Principio arquitectónico

Aplicar **Strategy + Adapter** en dos ejes:

1. **Action Strategy (qué hacer con la intención)**
   - `ADD_TO_WHATSAPP`
   - `ADD_TO_CART`
   - `CHECKOUT`

2. **Channel Adapter (por qué canal ejecutarlo)**
   - `whatsapp`
   - `web-cart`
   - `payment-gateway`
   - `erp`

> Una acción puede usar uno o varios canales según política.

---

## 3) Modelo de dominio recomendado

Crear una intención canónica de tour (independiente de canal):

```ts
export interface TourIntent {
  type: "TOUR_BOOKING";
  source: "WEB";
  locale: "es" | "en";
  currency: "USD" | "EUR";
  createdAt: string;
  payload: {
    tour: {
      id: string;
      name: string;
      price?: number;
      date?: string;
      pax?: number;
    };
    customer?: {
      name?: string;
      phone?: string;
      email?: string;
    };
    notes?: string;
  };
}
```

- Este contrato vive en dominio (`contracts/` o `types/intent/`).
- No incluye URL de WhatsApp, ni campos de pasarela, ni forma de ERP.

---

## 4) Estructura de carpetas/archivos propuesta

```txt
src/
  contracts/
    tour.intent.ts                      # contrato canónico de intención

  adapters/
    tour/
      tour-intent.adapter.ts            # UI/FormData -> TourIntent
      tour-whatsapp.adapter.ts          # TourIntent -> mensaje WhatsApp
      tour-cart.adapter.ts              # TourIntent -> CartItem
      tour-erp.adapter.ts               # TourIntent -> payload ERP
      tour-payment.adapter.ts           # TourIntent -> payload pasarela

  strategies/
    action/
      action.strategy.ts                # interfaz ActionStrategy
      add-to-whatsapp.strategy.ts       # fase actual
      add-to-cart.strategy.ts           # fase futura
      checkout.strategy.ts              # fase futura
      action-strategy.factory.ts        # selecciona estrategia

  channels/
    channel.port.ts                     # interfaz ChannelPort
    whatsapp.channel.ts                 # abre wa.me o usa API cloud
    cart.channel.ts                     # persiste en storage/backend cart
    payment.channel.ts                  # redirección/SDK gateway
    erp.channel.ts                      # cliente ERP

  services/
    orchestration/
      tour-intent.service.ts            # orquesta action + channel

  components/
    organisms/tours/
      TourActionBar.astro               # UI agnóstica de canal
      TourActionButton.astro            # dispara actionType
```

---

## 5) Interfaces clave (Strategy + Adapter)

## 5.1 Action Strategy

```ts
export interface ActionStrategy {
  execute(intent: TourIntent): Promise<ActionResult>;
}
```

Implementaciones:
- `AddToWhatsappStrategy`
- `AddToCartStrategy`
- `CheckoutStrategy`

## 5.2 Channel Port

```ts
export interface ChannelPort<TPayload = unknown> {
  send(payload: TPayload): Promise<{ ok: boolean; ref?: string; error?: string }>;
}
```

Implementaciones:
- `WhatsappChannel`
- `CartChannel`
- `PaymentChannel`
- `ErpChannel`

## 5.3 Adapters

Adapters puros para transformar el mismo `TourIntent` a payload específico de cada canal.

---

## 6) Flujo por fases

## Fase actual — “Agregar tours a WhatsApp”
1. UI captura intención mínima del tour.
2. `tour-intent.adapter.ts` crea `TourIntent`.
3. `add-to-whatsapp.strategy.ts` usa:
   - `tour-whatsapp.adapter.ts` (mensaje o payload)
   - `whatsapp.channel.ts` (wa.me/API)
4. UI solo muestra resultado (toast/redirección).

### Compatibilidad
- Se puede mantener temporalmente el flujo actual como fallback.
- No se rompe booking general ni formulario existente.

## Fase futura — “Agregar tours a carrito”
1. Reutiliza **el mismo `TourIntent`**.
2. `add-to-cart.strategy.ts` + `tour-cart.adapter.ts` + `cart.channel.ts`.
3. Sin tocar componente de WhatsApp, porque canal está desacoplado.

## Fase futura — “Pasarela/ERP”
1. `checkout.strategy.ts` selecciona `payment.channel.ts` y/o `erp.channel.ts`.
2. `tour-payment.adapter.ts` y `tour-erp.adapter.ts` generan payload específico.
3. Se mantiene intacta la UI (solo cambia `actionType`).

---

## 7) No ruptura del flujo actual

Aplicar migración incremental:

1. **Paso 1:** introducir contrato `TourIntent` + adapters puros (sin cambiar UI).
2. **Paso 2:** crear `whatsapp.channel.ts` y `AddToWhatsappStrategy`.
3. **Paso 3:** encapsular llamada actual desde `TourActionService`.
4. **Paso 4:** reemplazar gradualmente CTAs de tour para usar servicio.
5. **Paso 5:** añadir `AddToCartStrategy` (feature flag).
6. **Paso 6:** añadir `CheckoutStrategy` con pasarela/ERP.

---

## 8) Reglas de diseño (importantes)

1. **UI no construye strings de canal.**
2. **Adapters no hacen I/O** (puros).
3. **Channels no contienen lógica de negocio**, solo transporte.
4. **Strategies orquestan**: eligen adapter + channel.
5. **Intent canónico único** para evitar duplicación.

---

## 9) Mapeo explícito con archivos actuales

- Flujo WhatsApp actual en UI: `src/components/organisms/booking/BookingForm.astro`.
- Formatter duplicado en servicio: `src/services/messages/whatsapp.ts`.
- Capa ERP base ya creada para evolución futura: `src/services/erp/erp.client.ts`, `erp.tours.ts`, `erp.rooms.ts`.

La propuesta permite converger esos puntos hacia una orquestación única basada en intención + estrategia + canal.
