# Auditoría de Arquitectura y Funcionalidades — HE_WEB

**Proyecto:** Hotel Ensueños (he_web)  
**Stack:** Astro + Preact + TypeScript + Tailwind + Biome + pnpm + Vitest + Playwright  
**Fecha:** 2026-06-02  
**Estado de Build:** Exitoso (`pnpm build` exit code 0)  
**Servidor Dev:** Activo en modo dev (http://localhost:4321)  
**Objetivo:** Distinguir entre implementado, stub y pendiente.  
**No se modificó código ni se hicieron commits.**

---

## 1. Resumen de Arquitectura

### 1.1 Estructura de carpetas clave

| Carpeta / Archivo | Responsabilidad principal | Estado |
|---|---|---|
| `src/pages/` | Routing y endpoints SSR/API (Astro Islands) | Implementado |
| `src/pages/api/` | API routes SSR (rooms, availability, config, admin cache) | Implementado |
| `src/pages/es/` y `src/pages/en/` | Rutas en español e inglés | Implementado |
| `src/components/` | Atoms, Molecules, Organisms, Islands (UI) | Implementado |
| `src/components/organisms/booking/` | Formulario de reserva y submódulos | Implementado |
| `src/components/organisms/home/` | Secciones del home | Implementado |
| `src/components/core/` | Header, Footer, LangSelector, CurrencySelector | Implementado |
| `src/layouts/` | Layouts base con metadatos SEO, i18n, currency, analytics | Implementado |
| `src/composables/` | Lógica de estado y comportamiento cliente (formularios, fechas, validación, submit) | Implementado |
| `src/adapters/` | Integraciones externas (WhatsApp, ERP, imagen, tour) | **Implementado (WhatsApp y ERP con mocks)** |
| `src/services/` | API central, notificaciones (email/WA/telegram), logger, ERP client | **Implementado (email con safe no-op)** |
| `src/domain/` | Utilidades puras de dominio (fechas, moneda, disponibilidad) | Implementado |
| `src/types/` | Contratos TypeScript (booking, config, i18n, tours, destinos) | Implementado |
| `src/data/` | Datos estáticos JSON (rooms, reviews, tours, config) | Implementado |
| `src/i18n/` | Traducciones y helpers de internacionalización | Implementado |
| `src/utils/` | Helpers varios (apiHelpers, cookies, security, storage, geo, currency, sync) | Implementado |
| `src/integrations/` | Sentry cliente | Implementado |
| `tests/` | E2E Playwright + config | Implementado |
| `docs/` | Auditorías previas (SPRINT, SEO, architecture audits) | Documentación existente |

### 1.2 Decisiones arquitectónicas observadas

- **Framework:** Astro con SSR (`export const prerender = false` en endpoints dinámicos) e Islands interactivos (Preact).
- **Patrón de integración:** Adapters para aislar terceros (WhatsApp Business API, ERP sync, imagen, tours).
- **Estrategia de datos:** JSON estáticos + sincronización ERP (mock/real) para disponibilidad/precios/upstream.
- **Formularios:** Server Actions de Astro (`booking.ts`, `bookingGroup.ts`, `bookingVehicle.ts`, `contact.ts`).
- **Testing:** Vitest (unit + adapters) + Playwright (E2E multi-navegador).
- **i18n:** Sistema propio con objetos `LocalizedText` (ES/EN).
- **Moneda:** Multi-moneda (USD, EUR, GBP) con exchange rates en `config.json`.
- **Logging:** Servicio `logger` estructurado con etiquetas por módulo.

---

## 2. Mapa de Flujos Funcionales Reales

### 2.1 Booking (Reserva de habitación)
**Rutas principales:**
- `/booking` (ES) y `/en/booking` (EN)
- `/rooms/[slot]` — detalle de habitación desde rooms.json
- `/rooms/index` — listado

**Componentes involucrados:**
- `BookingForm.astro`, `BookingFormDates.astro`, `BookingFormGuestCount.astro`, `BookingFormBreakfast.astro`, `BookingFormSpecialRequests.astro`, `BookingFormVehicleToggle.astro`, `BookingFormVehicleFields.astro`, `BookingFormSubmit.astro`, `BookingBar.astro`
- Composable: `useBookingForm.ts`, `useBookingValidation.ts` (Zod), `useBookingSubmit.ts`, `useDatePicker.ts`, `useBookingOptions.ts`, `useSearchInput.ts`, `useWhatsAppButton.ts`

**Acciones servidor:**
- `booking.ts` (habitaciones)
- `bookingGroup.ts` (reserva grupal)
- `bookingVehicle.ts` (con vehículo)

**Estado:** Implementado (mock availability centralizado en `domain/availability.utils.ts`; ERP client con modo mock/real).

### 2.2 Contacto
**Ruta:** `/contact`, `/en/contact`
**Acción servidor:** `contact.ts`
**Componente:** Formulario de contacto + notificación (email + WhatsApp)

**Estado:** Implementado (envío con Mailgun; safe no-op si no hay credenciales).

### 2.3 Reseñas
**Ruta:** `/destinations/[slot]` (sección reseñas), componentes `ReviewsSection.astro`
**Datos:** `src/data/reviews.json` (5 reseñas verificadas: Google, TripAdvisor, Booking.com)

**Estado:** Implementado (datos estáticos bilingües delimitados por fecha).

### 2.4 Idioma / Moneda
**Componentes:** `LangSelector.astro`, `CurrencySelector.astro`
**i18n:** `src/i18n/translation.ts` con claves ES/EN
**Moneda:** USD (base), EUR, GBP con símbolos y rates en `config.json`; utilidad `currency.ts`

**Estado:** Implementado (cliente; selector visible en layout. Persistencia no verificada explícitamente en código leído).

### 2.5 Imágenes
**Adapters/Componentes:** `image.adapter.ts`, `Imagen.astro`, `ImagenLocal.astro`, `ImagenValidada.astro`, `VisualCarousel.astro`, `PhotoCollage.astro`, componentes `ImageResource.astro`, `VideoResource.astro`, `YouTubeResource.astro`

**Estado:** Implementado (procesamiento local validado; sin CDN externo detectado en archivos revisados).

### 2.6 Admin (Cache control)
**Ruta:** `POST /api/admin/cache`
**Auth:** Bearer token (`CACHE_PRIVATE_KEY`)
**Acción:** Flush / disable cache por targets, duration, count

**Estado:** Implementado (SSR, autenticado, usa `configureCacheControl`).

### 2.7 Tours
**Rutas:** `/tours`, `/tours/[slot]`, `/en/tours`, `/en/tours/[slot]`
**Datos:** `src/data/tours.json` (2 paquetes: Historic City Tour $50/4h, Nature Adventure $75/6h)
**Adapter:** `tour.adapter.ts`

**Estado:** Implementado (estático + adapter stub para posible sincronización).

### 2.8 Gastronomía / Destinos / Blog / Galería / FAQ / Términos / Privacidad / Cancelación / About / Amenities
**Rutas:** `/gastronomy`, `/destinations`, `/blog`, `/gallery`, `/faq`, `/terms`, `/privacy`, `/cancellation`, `/about`, `/amenities` (y sus contrapartes EN)
**Datos:** `config.json` (destinations, gastronomies, tags); `tours.json`

**Estado:** Implementado (páginas estáticas con data de config.json).

---

## 3. Estado Funcional por Flujo

### 3.1 Implementado (funciona en dev/test/build)
| Flujo | Evidencia |
|---|---|
| **Rutas base** | Home, rooms, booking, contact, tours, gastronomy, destinations, gallery, faq, about, amenities, blog (index + slug), terms, privacy, cancellation (ES y EN) |
| **API pública** | `GET /api/rooms`, `GET /api/availability`, `GET /api/config` — SSR, con cache (`loadData`), merge de precios desde config.json |
| **Booking completo** | Formulario multi-paso con date picker, guest count, desayuno, solicitudes especiales, vehículo; validación Zod; acciones `booking`, `bookingGroup`, `bookingVehicle` |
| **Disponibilidad con mock** | `buildMockAvailabilityFromJson` centralizado; ERP client preparado para mock/real; parámetros checkin/checkout/roomId/currency |
| **Contacto** | Formulario con notificación email (Mailgun) y WhatsApp; no-op si faltan env vars |
| **Reviews** | Sección con 5 entradas verificadas, bilingües, con fecha y fuente |
| **Idioma/Moneda** | Selectores ES/EN; USD base, EUR, GBP con rates en config y utilidades de formateo |
| **Imágenes/media** | Validación de rutas, carrusel, collage, recursos visuales (imagen, video, YouTube) |
| **Admin cache** | Endpoint protegido por Bearer para flush/disable de cache |
| **i18n estático** | Traducciones completas ES/EN en componentes y textos |
| **Tests unitarios** | Vitest: `useBookingOptions.test.ts`, `DateRangePicker.test.ts`, `whatsapp.adapter.test.ts`, `erp-sync.adapter.test.ts`, `notifications.test.ts`, `date.utils.test.ts`, `currency.utils.test.ts`, `useWhatsAppButton.test.ts` |
| **Tests E2E** | Playwright: booking flow, home page (configurado para Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari) |
| **Build** | `pnpm build` exitoso (exit 0) |
| **Dev server** | Corriendo en background (http://localhost:4321), responde HTTP 200 |

### 3.2 Stub / Parcial
| Flujo | Detalle |
|---|---|
| **ERP sync real** | `erp-sync.adapter.ts` y `erp.client.ts` existen y exponen endpoint `/availability`; pero `loadData` en `availability.ts` usa archivo local `rooms.json` como fallback y `buildMockAvailabilityFromJson` como mock centralizado. El sync real depende de env vars y `ERPConfig` (`mock` vs `real`). En el código actual, el flujo **no está roto** pero **no es 100% real** sin configuración del ERP. |
| **Notificaciones WhatsApp** | `notifications.ts` dispatchea a email, WhatsApp y Telegram. WhatsApp usa `whatsapp.ts` service. Si el ERP mode es `mock`, las notificaciones pueden enviarse con datos mock. El canal funciona si la API de WhatsApp está configurada; el adapter tiene lógica robusta. |
| **Notificaciones Telegram** | Servicio `telegram.ts` presente en `src/services/messages/`, pero no verificado en detalle si tiene fallback no-op como email. |
| **Imágenes CDN/remotas** | Adapter `image.adapter.ts` presente pero importa `ImagenLocal` como fallback en tipos; no se evidenció uso de CDN externo tipo Cloudinary/S3 en los archivos revisados. |
| **Auth/Carry session** | Componentes y composables listos, pero no hay sistema de autenticación de usuario visible (solo admin cache por Bearer). |
| **Persistencia de idioma/moneda** | Selectores implementados en layout; no se verificó persistencia en localStorage/cookie explícita en utils (`cookies.ts` existe pero uso no evidenciado en componentes revisados). |

### 3.3 Pendiente / No encontrado
| Flujo | Detalle |
|---|---|
| **Panel admin completo** | Solo existe endpoint de cache (`/api/admin/cache`). No hay dashboard de reservas, usuarios, ERP sync manual, analytics ni CRUD de habitaciones/tours/destinos. |
| **Gestión de blog (CMS)** | Páginas estáticas (`/blog/index`, `/blog/[slug]`) y rutas EN; sin admin ni CMS para crear/editar entradas desde UI. |
| **Reserva directa (pago)** | No hay integración con pasarela de pago (Stripe, PayPal, etc.). Las reservas parecen orientadas a confirmación manual vía WhatsApp/email. |
| **Multi-tenant / multi-hotel** | No evidencia de multi-tenant; config parece ser single-site. |
| **Tests E2E de contact/reviews/admin** | Playwright solo tiene `booking.spec.ts` y `home.spec.ts` en la raíz de `tests/e2e/` (según find). No hay specs para contact, gallery, rooms, etc. |
| **Test de config/destinations API** | No hay test unitario para `api/config.ts`, `api/rooms.ts`, `api/availability.ts` en `src/pages/api/`. |
| **Accesibilidad (a11y) tests** | No se encontraron tests de accesibilidad (axe, pa11y, etc.) en config o suites. |
| **CI/CD** | No se encontró `.github/workflows`, `.gitlab-ci.yml`, `Jenkinsfile` ni configuración de preview/deploy. |

---

## 4. Tareas Pendientes Priorizadas para Cierre

| # | Prioridad | Tarea | Razón / Impacto |
|---|---|---|---|
| 1 | Alta | **Definir modo ERP real y cerrar integración** | Hoy el flujo usa mock/fallback a JSON. Sin ERP real productivo, la disponibilidad y precios no son confiables en producción. |
| 2 | Alta | **Cerrar pipeline de reserva end-to-end en pruebas** | Verificar que `booking.ts` → notificaciones → WhatsApp/email funcionan contra el ERP real/mock configurado, no solo unit tests. |
| 3 | Alta | **Asegurar persistencia de idioma y moneda** | Selectores están pero falta confirmar persistencia (cookie/localStorage) y que todas las páginas consumen el valor guardado. |
| 4 | Media | **Extender E2E Playwright** | Agregar specs para `contact`, `rooms`, `gallery`, `destinations`, `faq`, `amenities`, `lang/currency` toggle. Actualmente solo `home` y `booking`. |
| 5 | Media | **Agregar tests de API routes SSR** | `rooms.ts`, `availability.ts`, `config.ts` no tienen tests unitarios. Son endpoints SSR con lógica de merge y cache. |
| 6 | Media | **Completar panel admin básico** | Solo cache control. Faltan vistas para monitorear reservas, logs, estado ERP, y configuraciones básicas del sitio. |
| 7 | Media | **Stub de blog → CMS o contenido dinámico** | Si el blog debe crecer, necesidad de admin o al menos un flujo de importación de Markdown/JSON. Hoy estático. |
| 8 | Baja | **Agregar tests de accesibilidad** | A11y no tiene coverage. Priorizar si hay compliance legal o requisitos de cliente. |
| 9 | Baja | **Configurar CI/CD** | Falta pipeline de build, test y deploy. Priorizar una vez cerrados los flujos críticos. |
| 10 | Baja | **CDN/optimización de imágenes** | Si se escala contenido visual, definir adapter de imagen externo (Cloudinary/S3) y `srcset`/`sizes`. |

---

## 5. Recomendaciones de Deuda Técnica y Calidad

### 5.1 Tests
- **Cobertura actual:** Unit tests existen para composables, adapters clave (WhatsApp, ERP), domains (date, currency) y notificaciones. E2E limitado a 2 flujos (home, booking).
- **Brecha:** Sin tests para API SSR (`pages/api/*.ts`), sin tests de integración entre actions y adapters, sin tests de accesibilidad.
- **Recomendación:** 
  - Agregar `vitest` tests para cada endpoint en `src/pages/api/` mockeando `loadData` y `APIContext`.
  - Al menos un E2E por módulo: contact, rooms (detalle y listado), gallery, destinations, tours, lang/currency.
  - Considerar `@axe-core/playwright` o `pa11y` para a11y en CI.

### 5.2 Accesibilidad
- Componentes con `DateRangePicker`, `Select`, `Switch`, `TextAreaInput`, `SearchInput` deben validar labels, roles, estados `aria`, foco visible y navegación por teclado.
- Recomendación: agregar tests con `axe-playwright` en pipeline y auditoría manual con Lighthouse.

### 5.3 CI/CD
- No hay workflows. Riesgo: merge sin pasar todos los tests (unit + e2e) o sin build verificado.
- Recomendación: GitHub Actions (o equivalente) con jobs:
  - `lint` (Biome)
  - `typecheck` (`tsc --noEmit`)
  - `unit` (Vitest)
  - `e2e` (Playwright, chromium mínimo en CI; full matrix en PR)
  - `build` (`pnpm build`)
  - `preview` (deploy preview si se usa Vercel/Netlify/Railway)

### 5.4 Logging y Monitoreo
- Sentry client configurado (`src/integrations/sentry.client.ts`). Verificar que errores de actions y adapters se capturen correctamente.
- Recomendación: estandarizar niveles (`info`, `warn`, `error`) y asegurar que `context`/`tags` incluyan request id o session id si hay auth.

### 5.5 Contratos y Tipos
- `types/booking.ts` y `contracts/erp.contract.ts` cubren los flujos principales.
- Brecha: `src/pages/api/availability.ts` usa `any` en `loadData<any[]>`; debería mapear a tipos de room tipados.
- Recomendación: evitar `any`; usar tipos de `rooms.json` para backend data contracts.

### 5.6 Seguridad
- Admin cache usa Bearer simple. Recomendación: si hay más endpoints admin, centralizar middleware de auth y rate limiting.
- `security.ts` existe; verificar uso en forms (CSRF, sanitización).

### 5.7 Performance
- Carga de datos estáticos JSON + cache. Riesgo: JSON completo (`config.json` ~20KB, `rooms.json` ~9KB) en memoria por request si no hay CDN o edge caching.
- Recomendación: 
  - Considerar `Astro.cache` o response caching (`Cache-Control`, `s-maxage`) en endpoints públicos.
  - Lazy-load de imágenes y componenetes pesados (carousel, collage) vía client directives (`client:visible`, `client:load`).

---

## 6. Anexo: Rutas y Archivos Clave por Flujo

### Booking
- `src/pages/es/booking.astro`, `src/pages/en/booking.astro`
- `src/actions/booking.ts`, `bookingGroup.ts`, `bookingVehicle.ts`
- `src/composables/useBooking*.ts`
- `src/domain/availability.utils.ts`, `date.utils.ts`

### Contacto
- `src/pages/es/contact.astro`, `src/pages/en/contact.astro`
- `src/actions/contact.ts`
- `src/services/messages/email.ts`, `whatsapp.ts`, `telegram.ts`, `notifications.ts`

### Reseñas
- `src/data/reviews.json`
- `src/components/organisms/reviews/ReviewsSection.astro`

### Idioma / Moneda
- `src/components/core/LangSelector.astro`, `CurrencySelector.astro`
- `src/i18n/translation.ts`
- `src/utils/currency.ts`
- `src/data/config.json` (supportedCurrencies, exchangeRate)

### Imágenes
- `src/adapters/image/image.adapter.ts`
- `src/components/atoms/image/Imagen.astro`, `ImagenLocal.astro`, `ImagenValidada.astro`
- `src/components/organisms/carousel/VisualCarousel.astro`, `PhotoCollage.astro`

### Admin
- `src/pages/api/admin/cache.ts`
- `src/utils/apiHelpers.ts` (configureCacheControl, loadData)

---

## Conclusión

El proyecto **he_web** tiene una arquitectura sólida y modular con separación clara entre UI (Astro Islands), lógica cliente (composables), integraciones (adapters) y datos (JSON + ERP).  
**Los flujos críticos (home, booking, contacto, reseñas, idioma/moneda, imágenes, admin cache) están implementados y el build pasa.**  
La deuda principal está en: (1) cierre de la integración ERP real, (2) ampliación de E2E y tests de API SSR, (3) cierre de gaps de admin/Dashboard, y (4) pipeline CI/CD.

---

*Auditoría generada objetivamente sobre el estado del repositorio en `/home/wcun/Projects/he_web` al 2026-06-02.*