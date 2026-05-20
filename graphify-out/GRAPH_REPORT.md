# Graph Report - he_web  (2026-05-20)

## Corpus Check
- 94 files · ~357,242 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 687 nodes · 825 edges · 61 communities (47 shown, 14 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f7b88709`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `Auditoría Astro — SEO & Performance` - 21 edges
2. `Auditoría global — Construcción de mensajes de WhatsApp` - 20 edges
3. `logger()` - 18 edges
4. `Arquitectura propuesta — Tour Intent + Canal desacoplado (Strategy/Adapter)` - 17 edges
5. `Hotel Ensueños - Project Context & Documentation` - 15 edges
6. `json200()` - 13 edges
7. `Auditoría de arquitectura frontend — `src/components/molecules`` - 13 edges
8. `loadData()` - 12 edges
9. `Api` - 10 edges
10. `notifyBooking()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `adaptTour()` --calls--> `adaptImageSource()`  [INFERRED]
  src/adapters/tour.adapter.ts → src/adapters/image/image.adapter.ts
- `GET()` --calls--> `json200()`  [EXTRACTED]
  src/pages/api/config.ts → src/utils/apiHelpers.ts
- `GET()` --calls--> `json200()`  [EXTRACTED]
  src/pages/api/destinations.ts → src/utils/apiHelpers.ts
- `GET()` --calls--> `json200()`  [EXTRACTED]
  src/pages/api/gastronomy.ts → src/utils/apiHelpers.ts
- `GET()` --calls--> `json200()`  [EXTRACTED]
  src/pages/api/rooms.ts → src/utils/apiHelpers.ts

## Communities (61 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (49): booking, log, bookingGroup, log, bookingVehicle, contact, log, server (+41 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (39): log, POST(), AvailabilityPrice, AvailabilityResponse, AvailabilityRoom, buildMockResponse(), diffNights(), GET() (+31 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (40): Architecture, Astro Configuration (`astro.config.mjs`), Available Scripts, Code Organization, code:block1 (he_web/), code:bash (npm run dev      # Start development server), Component Architecture (Atomic Design), Configuration (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (32): 1) Dónde se construyen mensajes de WhatsApp (hallazgos), 2) Problemas arquitectónicos detectados, 3) Propuesta obligatoria de centralización, 4.1 `src/components/organisms/booking/BookingForm.astro`, 4.2 `src/components/atoms/WhatsAppButton.astro`, 4.3 `src/services/messages/whatsapp.ts`, 4.4 `src/adapters/booking.adapter.ts`, 4.5 Limpieza de legado (+24 more)

### Community 4 - "Community 4"
Cohesion: 0.08
Nodes (17): adaptTour(), deepClone(), ErpClient, ErpClientOptions, ErpMode, ErpRequestOptions, log, ERP_ROOMS_MOCK (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.07
Nodes (29): 1) Meta tags dinámicos / centralización, 2) Uso de `<title>`, 3) Structured Data (JSON-LD), 4) OpenGraph / Twitter, 5) Lazy loading y atributos de imagen, 6) Peso de imágenes, Alcance, Auditoría Astro — SEO & Performance (+21 more)

### Community 6 - "Community 6"
Cohesion: 0.07
Nodes (27): 1.1 Normalizar jerarquía tipográfica global, 1.2 Unificar espaciado vertical entre secciones, 1.3 Cerrar escala de grises y superficies, 2.1 Unificar sistema visual de botones reutilizando componente existente, 2.2 Estandarizar radio y sombra en cards base, 2.3 Ajustar contenedores y anchuras narrativas, 3.1 Estabilizar contraste y overlay en hero home, 3.2 Homologar hero reutilizable de páginas internas (+19 more)

### Community 7 - "Community 7"
Cohesion: 0.07
Nodes (26): 1) Lógica de negocio detectada, 2) Construcción de mensajes de WhatsApp, 3) Validaciones indebidas, 4) Dependencias directas de adapters/utils, 5) Qué mover a `adapters`, 6) Qué simplificar, 7) Qué archivos pueden unificarse, A `adapters/media` (nuevo) (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.13
Nodes (21): ERPAvailability, ERPConfig, ERPDestination, ERPEndpoint, ERPGastronomy, ERPHotelData, ERPLocation, ERPMetadata (+13 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (17): clearTranslationCache(), findTranslation(), LANG_NAMES, Language, LanguageInfo, loadLanguages(), loadResources(), loadTranslations() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (23): 1) Diagnóstico del estado actual, 2) Principio arquitectónico, 3) Modelo de dominio recomendado, 4) Estructura de carpetas/archivos propuesta, 5.1 Action Strategy, 5.2 Channel Port, 5.3 Adapters, 5) Interfaces clave (Strategy + Adapter) (+15 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (16): assetKeys, assets, CacheEntry, cacheValidation(), detectResourceType(), extractYouTubeId(), getCachedValidation(), isYouTubeUrl() (+8 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (17): calculateNights(), DateRange, formatDate(), formatDateRange(), getMinCheckinDate(), getToday(), isValidCheckin(), isValidDateRange() (+9 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (9): Api, ApiServiceOptions, cacheMinutes, FetchOptions, initializeApiOnServer(), log, getGeolocation(), getLangFromUrl() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.1
Nodes (19): 1) Lógica de negocio detectada dentro de atoms, 2) Validaciones o transformaciones indebidas para una capa atómica, A `adapters/booking` o `utils/booking`, A `adapters/contact` o `utils/contact`, A `adapters/forms`, A `adapters/image`, A `adapters/search` o `utils/search`, A capa superior (molecule/organism/page loader) (+11 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (16): BookingData, BookingType, buildGroupMessage(), buildStandardMessage(), buildVehicleMessage(), buildWhatsAppMessage(), buildWhatsAppUrl(), calculateNights() (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (16): convertAndFormat(), convertCurrency(), Currency, CURRENCY_NAMES, CURRENCY_SYMBOLS, DEFAULT_EXCHANGE_RATES, ExchangeRates, formatMoney() (+8 more)

### Community 17 - "Community 17"
Cohesion: 0.14
Nodes (13): code:bash (node tools/generate_secret.js), code:env (CACHE_PRIVATE_KEY=a1b2c3d4e5f6...), code:bash (node tools/generate_secret.js), code:env (CACHE_PRIVATE_KEY=a1b2c3d4e5f6...), Descripción General, 🇬🇧 English, 🇪🇸 Español, Generate Secret Tool / Herramienta de Generación de Secretos (+5 more)

### Community 18 - "Community 18"
Cohesion: 0.17
Nodes (7): AvailabilityPrice, AvailabilityRoom, CartItem, Draft, normalizeDate(), parseDateRange(), Room

### Community 19 - "Community 19"
Cohesion: 0.15
Nodes (10): ASSETS, CITIES, CURRENTS, FLAGS, GLOB_CITIES, GLOB_CURRENTS, GLOB_FLAGS, GLOB_HOTEL (+2 more)

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (11): DEFAULT_ERP_CONFIG, getErpConfig(), getErpRoomsStub(), getErpToursStub(), MOCK_ROOMS, MOCK_TOURS, ErpClientConfig, ErpMode (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.18
Nodes (11): code:env (# ==================================================), code:env (LOG_ENABLED=false), code:env (LOG_CONTEXTS=*), code:env (LOG_CONTEXTS=Api), code:env (LOG_CONTEXTS=Api,Translation), code:typescript (import { log, warn, error } from '@/services/logger';), Configuration (`.env` file), Debugging & Logging (+3 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (10): 10. Morocho, 1. Mote Pillo, 2. Cuy Asado, 3. Locro de Papa, 4. Mote Sucio, 5. Fritada, 6. Bolón de Verde, 7. Ceviche de Chancho (+2 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (3): datePickerSync, DatePickerSyncManager, FlatpickrInstance

### Community 24 - "Community 24"
Cohesion: 0.22
Nodes (8): blogLink, currencySelector, form, hero, langSelector, reviews, rooms, whatsappLink

### Community 25 - "Community 25"
Cohesion: 0.38
Nodes (5): buildBookingMessage(), parseDateRange(), BookingProcessingData, BookingVehicleItem, BuildBookingMessageInput

### Community 26 - "Community 26"
Cohesion: 0.29
Nodes (6): CarouselResource, Category, Currency, ImageResource, SiteConfig, TranslationFunction

### Community 27 - "Community 27"
Cohesion: 0.29
Nodes (6): Catedral de la Inmaculada Concepción, Dónde comer, Museo Pumapungo, Plaza Abdón Calderón, Qué ver, Río Tomebamba

### Community 29 - "Community 29"
Cohesion: 0.33
Nodes (5): 1. Parque Nacional El Cajas, 2. Baños de Agua Santa, 3. Gualaceo y Chordeleg, 4. Ingapirca, 5. Reserva Biológica El Sillar

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (4): BookingChannel, BookingIntentType, BookingIntentV1, BookingSource

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (4): FlatpickrInstance, HTMLElement, LocalizedText, Window

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (3): CookieOptions, deleteCookie(), setCookie()

## Knowledge Gaps
- **343 isolated node(s):** `log`, `log`, `log`, `server`, `baseData` (+338 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `logger()` connect `Community 1` to `Community 0`, `Community 4`, `Community 8`, `Community 9`, `Community 11`, `Community 13`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `loadData()` connect `Community 1` to `Community 13`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `Api` connect `Community 13` to `Community 8`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `log`, `log`, `log` to the rest of the system?**
  _343 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._