# Auditoría Astro — SEO & Performance

## Alcance
Se revisó el proyecto en:
- Meta tags dinámicos.
- Uso de `<title>`.
- Structured Data (JSON-LD).
- OpenGraph/Twitter Cards.
- Lazy loading.
- Peso de imágenes.

## Hallazgos

### 1) Meta tags dinámicos / centralización

## Situación actual
- Existe `BaseHead.astro` con metadatos completos (canonical, OG, Twitter), pero no es el layout principal usado en páginas.
- El layout realmente usado (`BaseLayout.astro`) solo define metadata mínima (`description`, canonical/hreflang, title), sin OG/Twitter/JSON-LD.

## Riesgo
- Doble estrategia de SEO en código (`BaseHead` vs `BaseLayout`) y ausencia de una capa única reutilizable.

## Evidencia
- `BaseHead.astro` contiene OG/Twitter/canonical/title y comentarios de schema no implementados.
- `BaseLayout.astro` define `<title>` y `<meta description>`, pero no OG/Twitter ni JSON-LD.

---

### 2) Uso de `<title>`

## Situación actual
- En `BaseLayout.astro` el título se arma con traducción (`t(titleKey)`), lo cual es válido para páginas estáticas/listado.
- En páginas de detalle dinámico (rooms/tours/etc.) el título no incluye entidad concreta (ej. nombre de habitación/tour) cuando se usa solo `titleKey`.

## Riesgo
- Menor relevancia SEO para páginas transaccionales/detalle (titles menos específicos).

---

### 3) Structured Data (JSON-LD)

## Situación actual
- No hay JSON-LD activo en layout principal.
- En `BaseHead.astro` hay comentarios de “Schema Markup”, pero no ejecución real.

## Riesgo
- Sin rich results para Hotel/LocalBusiness, sin señales explícitas para Google sobre negocio local.

---

### 4) OpenGraph / Twitter

## Situación actual
- OG/Twitter están implementados en `BaseHead.astro`.
- No están en `BaseLayout.astro` (layout principal).

## Riesgo
- Compartición social inconsistente según página/layout usado.

---

### 5) Lazy loading y atributos de imagen

## Hallazgos
- Hay imágenes con `loading="lazy"` en varios listados.
- Persisten múltiples `<img>` sin `loading`, sin `width/height` explícitos en hero/detalle, elevando riesgo de CLS/LCP inestable.
- Existe un stack de `ImagenBase/ImageResource` con soporte de `loading` y `decoding`, pero no está adoptado consistentemente en páginas.

## Riesgo
- Penalización de Core Web Vitals (LCP/CLS) por imágenes críticas sin dimensionado y no críticas sin lazy.

---

### 6) Peso de imágenes

## Resultado del muestreo local (`src/assets/img`)
- Total aprox: **8.28 MB** en 144 archivos.
- Archivos >100KB: **6**.
- Top pesado: `calderon-catedral.webp` (~210KB), `plaza-orquideas.webp` (~167KB), etc.

## Lectura
- El peso global está razonable, pero se recomienda estandarizar estrategia responsive (`srcset/sizes`) y prioridades de carga para hero.

---

## Propuesta de estructura SEO centralizada

```txt
src/
  components/core/seo/
    SeoHead.astro
    schema/
      hotel.schema.ts
      breadcrumb.schema.ts
      webpage.schema.ts
  utils/seo/
    seo-meta.ts
```

### Responsabilidad por capa
- `SeoHead.astro`: render único de `<title>`, meta description, canonical, hreflang, OG/Twitter, robots y JSON-LD.
- `schema/*.ts`: generadores puros de JSON-LD.
- `seo-meta.ts`: helpers para URLs absolutas, imágenes OG por defecto, sanitización de title/description.

---

## Propuesta de componente `SeoHead.astro`

Objetivo: reemplazar duplicidad `BaseHead`/`BaseLayout` por un solo punto de verdad.

Props sugeridas:
- `title: string`
- `description: string`
- `lang: "es" | "en"`
- `canonicalPath?: string`
- `ogImage?: string`
- `type?: "website" | "article" | "hotel"`
- `noindex?: boolean`
- `publishedTime?: string`
- `structuredData?: Record<string, unknown> | Array<Record<string, unknown>>`

Comportamiento:
1. Resolver `siteUrl` y canonical absoluto.
2. Inyectar title + description + canonical + hreflang.
3. Inyectar OG/Twitter completo.
4. Inyectar JSON-LD si `structuredData` existe.

---

## Datos estructurados propuestos para Hotel

Implementar JSON-LD tipo `Hotel` (schema.org), mínimo:
- `@context`, `@type: "Hotel"`
- `name`
- `url`
- `image`
- `description`
- `telephone`
- `email`
- `address` (`PostalAddress`)
- `geo` (`GeoCoordinates`) *(si se dispone)*
- `sameAs` (redes sociales)
- `checkinTime`, `checkoutTime` *(si aplica)*
- `priceRange` *(si aplica)*

Fuente de datos recomendada:
- `src/data/config.json` (`siteName`, `contactInfo`, `socialLinks`) + defaults de negocio.

---

## Plan de adopción incremental (sin romper runtime)

1. Crear `SeoHead.astro` y mantener `BaseLayout` funcional.
2. Integrar `SeoHead` en `BaseLayout` sin eliminar aún `BaseHead`.
3. Migrar páginas clave:
   - Home (es/en)
   - Rooms list/detail
   - Tours list/detail
   - Gastronomy/Destinations detail
4. Añadir JSON-LD `Hotel` en Home y, opcionalmente, `WebPage`/`BreadcrumbList` en detalles.
5. Eliminar redundancia histórica (`BaseHead`) cuando toda página use `SeoHead`.

---

## Checklist técnico sugerido

- [ ] Todas las páginas usan una única capa SEO (`SeoHead`).
- [ ] `<title>` específico por detalle (incluye nombre de room/tour).
- [ ] OG/Twitter presentes en 100% de rutas indexables.
- [ ] JSON-LD `Hotel` activo en home.
- [ ] Imágenes no críticas con `loading="lazy"`.
- [ ] Imágenes críticas (hero) con prioridad controlada y dimensiones explícitas.
- [ ] Uso consistente de componentes de imagen (`ImageResource/ImagenBase`) o estrategia equivalente.
