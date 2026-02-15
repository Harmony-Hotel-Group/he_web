# Plan técnico de implementación incremental UI/UX (basado en auditoría existente)

> Este documento **convierte 1:1** las recomendaciones ya definidas en la auditoría anterior en un plan técnico ejecutable por fases, sin introducir mejoras nuevas.
>
> Restricciones preservadas: sin rediseño completo, sin cambios de arquitectura, sin nuevas dependencias, sin alterar booking/WhatsApp/utils, sin crear componentes nuevos salvo necesidad estricta (no requerida en este plan).

## Fase 1 – Cambios globales seguros

### 1.1 Normalizar jerarquía tipográfica global
- **Categoría:** Tipografía
- **Archivo específico:** `src/styles/global.css`
- **Clase exacta a cambiar/agregar:**
  - Agregar reglas base para `h1`, `h2`, `h3`, `p` usando utilidades equivalentes a:
    - `h1`: `text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold`
    - `h2`: `text-3xl md:text-4xl leading-tight font-semibold`
    - `h3`: `text-xl md:text-2xl leading-snug font-semibold`
    - `p`: `text-base leading-7`
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Jerarquía más consistente entre páginas, lectura más premium y menos fluctuación de tamaños.

### 1.2 Unificar espaciado vertical entre secciones
- **Categoría:** Espaciado
- **Archivo específico:**
  - `src/pages/index.astro`
  - `src/components/organisms/home/HomeSection.astro`
  - `src/pages/rooms/index.astro`
- **Clase exacta a cambiar/agregar:**
  - Estandarizar contenedores de sección a `py-20` como base.
  - Usar `py-16` solo en secciones compactas y `py-24` en bloques hero-like.
  - Mantener consistencia en `mb-*`/`mt-*` para títulos y CTAs (ej. `mb-10 md:mb-12`, `mt-10 md:mt-12`).
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Ritmo vertical uniforme, interfaz menos “cortada” entre bloques.

### 1.3 Cerrar escala de grises y superficies
- **Categoría:** Espaciado
- **Archivo específico:**
  - `src/styles/global.css`
  - `src/components/core/Footer.astro`
  - `src/pages/rooms/index.astro`
  - `src/components/molecules/cards/InfoCard.astro`
- **Clase exacta a cambiar/agregar:**
  - Priorizar únicamente: `gray-50`, `gray-100`, `gray-300`, `gray-600`, `gray-900`.
  - Reemplazar usos dispersos de grises fuera de esta escala cuando corresponda.
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Mayor coherencia cromática secundaria y sensación de sistema visual maduro.

---

## Fase 2 – Componentes base

### 2.1 Unificar sistema visual de botones reutilizando componente existente
- **Categoría:** Botones
- **Archivo específico:**
  - `src/components/atoms/button/Button.astro`
  - `src/components/organisms/home/HomeSection.astro`
  - `src/pages/rooms/index.astro`
- **Clase exacta a cambiar/agregar:**
  - En `Button.astro`: homologar base a `py-3 px-6 md:px-8 rounded-xl transition-all duration-300 ease-out`.
  - En CTAs inline (`<a>`): alinear con variantes existentes (Primary/Secondary/Accent), evitando radios/tamaños distintos.
  - Mantener jerarquía:
    - Primary: `bg-primary text-white hover:bg-primary/90`
    - Secondary: `border border-primary text-primary hover:bg-primary/5`
    - Accent (acción crítica): `bg-accent text-white hover:bg-accent/90`
- **Nivel de riesgo:** Medio
- **Impacto visual esperado:** CTAs coherentes en todo el sitio, mejor percepción de prioridad de acción.

### 2.2 Estandarizar radio y sombra en cards base
- **Categoría:** Cards
- **Archivo específico:**
  - `src/components/molecules/cards/InfoCard.astro`
  - `src/pages/rooms/index.astro`
- **Clase exacta a cambiar/agregar:**
  - Unificar radio principal de cards a `rounded-xl`.
  - Unificar elevación: reposo `shadow-md`, hover `shadow-lg`.
  - Mantener padding interno base `p-6`.
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Superficies más premium, consistencia entre cards de home y listados internos.

### 2.3 Ajustar contenedores y anchuras narrativas
- **Categoría:** Espaciado
- **Archivo específico:**
  - `src/pages/index.astro`
  - `src/components/organisms/home/HomeSection.astro`
- **Clase exacta a cambiar/agregar:**
  - Mantener layout principal en `max-w-7xl`.
  - Ajustar bloques textuales largos a `max-w-3xl` o `max-w-4xl`.
  - Conservar `px-4 sm:px-6 lg:px-8` en todos los contenedores principales.
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Mejor legibilidad y menor fatiga visual en contenido descriptivo.

---

## Fase 3 – Secciones principales

### 3.1 Estabilizar contraste y overlay en hero home
- **Categoría:** Hero
- **Archivo específico:** `src/components/organisms/hero/HomeHero.astro`
- **Clase exacta a cambiar/agregar:**
  - Mantener hero inmersivo con `h-screen`/`min-h-[85vh]` según necesidad visual.
  - Estandarizar overlay en rango `bg-black/35` a `bg-black/50` para legibilidad consistente.
- **Nivel de riesgo:** Medio
- **Impacto visual esperado:** Mejor lectura sobre imágenes/video y mayor sensación editorial premium.

### 3.2 Homologar hero reutilizable de páginas internas
- **Categoría:** Hero
- **Archivo específico:** `src/components/organisms/hero/PageHero.astro`
- **Clase exacta a cambiar/agregar:**
  - Revisar clases dinámicas de título/subtítulo para mantener la escala definida en tipografía global.
  - Alinear estilo de overlay y peso de texto con hero home.
- **Nivel de riesgo:** Medio
- **Impacto visual esperado:** Narrativa visual continua entre home e internas.

### 3.3 Mejorar legibilidad del bloque de reserva sobre hero
- **Categoría:** Hero
- **Archivo específico:** `src/components/organisms/booking/BookingBar.astro`
- **Clase exacta a cambiar/agregar:**
  - Afinar superficie translúcida: mantener `bg-white/30 backdrop-blur-md` y elevar contraste de textos/títulos según escala global.
  - Mantener padding y radio consistentes con sistema (`p-6 md:p-8`, `rounded-xl`).
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Booking más claro y sólido sin alterar flujo funcional.

### 3.4 Reducir ruido visual en navegación y footer
- **Categoría:** Espaciado
- **Archivo específico:**
  - `src/components/core/Header.astro`
  - `src/components/core/Footer.astro`
- **Clase exacta a cambiar/agregar:**
  - Header: suavizar excesos de tracking y variaciones de hover, conservando `hover:text-accent` como patrón principal.
  - Footer: homogenizar enlaces y contenedores sociales a radios/estados coherentes con sistema base.
- **Nivel de riesgo:** Medio
- **Impacto visual esperado:** Menos saturación visual en zonas de alta densidad, sensación más refinada.

### 3.5 Consistencia de proporciones de imagen en cards/listados
- **Categoría:** Cards
- **Archivo específico:**
  - `src/components/molecules/cards/InfoCard.astro`
  - `src/pages/rooms/index.astro`
- **Clase exacta a cambiar/agregar:**
  - Definir proporción por contexto y sostenerla de forma consistente (`aspect-3/2` o `aspect-[4/3]` según sección).
  - Alinear borde de imagen con radio de card (`rounded-xl` en contenedor cuando aplique).
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Galería/listados visualmente más ordenados y elegantes.

---

## Fase 4 – Microinteracciones

### 4.1 Estandarizar hover y transiciones en cards
- **Categoría:** Animaciones
- **Archivo específico:**
  - `src/components/molecules/cards/InfoCard.astro`
  - `src/pages/rooms/index.astro`
- **Clase exacta a cambiar/agregar:**
  - Aplicar patrón: `transition-all duration-300 ease-out` + `hover:-translate-y-1` + cambio controlado de sombra (`shadow-md` → `shadow-lg`).
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Interacción más fluida, percepción de calidad sin sobrecarga.

### 4.2 Estandarizar estados interactivos de botones y links clave
- **Categoría:** Animaciones
- **Archivo específico:**
  - `src/components/atoms/button/Button.astro`
  - `src/components/core/Header.astro`
  - `src/components/core/Footer.astro`
- **Clase exacta a cambiar/agregar:**
  - Reutilizar `transition-all duration-300 ease-out` en botones.
  - En navegación, priorizar transición de color uniforme (`hover:text-accent`) y evitar combinaciones agresivas de desplazamiento/tracking.
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Comportamiento interactivo consistente y más “calmo”.

### 4.3 Aplicar entrada suave de secciones con accesibilidad
- **Categoría:** Animaciones
- **Archivo específico:**
  - `src/styles/global.css`
  - (aplicación en clases existentes de secciones en `index.astro` y listados principales)
- **Clase exacta a cambiar/agregar:**
  - Definir clase utilitaria de fade-in suave (opacidad + translateY leve).
  - Respetar `prefers-reduced-motion` para desactivar animación cuando corresponda.
- **Nivel de riesgo:** Medio
- **Impacto visual esperado:** Percepción moderna y premium sin comprometer performance ni accesibilidad.

### 4.4 Uniformar foco visual en campos del booking
- **Categoría:** Animaciones
- **Archivo específico:**
  - `src/components/organisms/booking/BookingForm.astro`
  - `src/components/molecules/forms/DatePickerField.astro`
  - `src/components/molecules/forms/DropdownField.astro`
  - `src/components/molecules/forms/NumberField.astro`
- **Clase exacta a cambiar/agregar:**
  - Homologar `focus` con patrón `ring-2 ring-accent/40` en inputs/selects/controles interactivos.
- **Nivel de riesgo:** Bajo
- **Impacto visual esperado:** Mayor claridad de interacción y acabado profesional del flujo de reserva.

---

## Cambios identificados como: Bajo riesgo + Global + No afectan lógica

> Criterio aplicado:
> - **Bajo riesgo**: marcado como `Nivel de riesgo: Bajo` en el plan.
> - **Global**: aplica a reglas base reutilizadas transversalmente (no solo a una vista puntual).
> - **No afectan lógica**: son ajustes puramente visuales de clases/estilos.

### A) Normalizar jerarquía tipográfica global
- **Referencia en plan:** `1.1 Normalizar jerarquía tipográfica global`
- **Categoría:** Tipografía
- **Archivo:** `src/styles/global.css`
- **Clases/reglas:**
  - `h1`: `text-4xl md:text-5xl lg:text-6xl leading-tight font-semibold`
  - `h2`: `text-3xl md:text-4xl leading-tight font-semibold`
  - `h3`: `text-xl md:text-2xl leading-snug font-semibold`
  - `p`: `text-base leading-7`
- **Por qué califica:** es base global de tipografía, bajo riesgo, y no toca lógica funcional.

### B) Unificar espaciado vertical entre secciones
- **Referencia en plan:** `1.2 Unificar espaciado vertical entre secciones`
- **Categoría:** Espaciado
- **Archivos:**
  - `src/pages/index.astro`
  - `src/components/organisms/home/HomeSection.astro`
  - `src/pages/rooms/index.astro`
- **Clases/reglas:**
  - `py-20` como base
  - `py-16` en compactas
  - `py-24` en hero-like
  - consistencia en `mb-10 md:mb-12` y `mt-10 md:mt-12`
- **Por qué califica:** estandariza ritmo visual transversal, con cambios de clases únicamente.

### C) Cerrar escala de grises y superficies
- **Referencia en plan:** `1.3 Cerrar escala de grises y superficies`
- **Categoría:** Espaciado
- **Archivos:**
  - `src/styles/global.css`
  - `src/components/core/Footer.astro`
  - `src/pages/rooms/index.astro`
  - `src/components/molecules/cards/InfoCard.astro`
- **Clases/reglas:** uso restringido a `gray-50`, `gray-100`, `gray-300`, `gray-600`, `gray-900`
- **Por qué califica:** mejora coherencia global de UI sin afectar comportamiento.

### D) Estandarizar estados interactivos base (transiciones)
- **Referencia en plan:** `4.2 Estandarizar estados interactivos de botones y links clave`
- **Categoría:** Animaciones
- **Archivos:**
  - `src/components/atoms/button/Button.astro`
  - `src/components/core/Header.astro`
  - `src/components/core/Footer.astro`
- **Clases/reglas:** `transition-all duration-300 ease-out` + patrón `hover:text-accent` uniforme
- **Por qué califica:** patrón reutilizable global de interacción visual, sin alterar lógica.

### E) Uniformar foco visual accesible en formularios
- **Referencia en plan:** `4.4 Uniformar foco visual en campos del booking`
- **Categoría:** Animaciones
- **Archivos:**
  - `src/components/organisms/booking/BookingForm.astro`
  - `src/components/molecules/forms/DatePickerField.astro`
  - `src/components/molecules/forms/DropdownField.astro`
  - `src/components/molecules/forms/NumberField.astro`
- **Clases/reglas:** `ring-2 ring-accent/40` para estado focus
- **Por qué califica:** estándar de foco transversal y visual; no modifica lógica de reserva.


## Orden de ejecución recomendado
1. Fase 1 (globales seguros)  
2. Fase 2 (componentes base)  
3. Fase 3 (secciones principales)  
4. Fase 4 (microinteracciones)

Este orden minimiza riesgo de regresión visual y evita retrabajos entre componentes y páginas.
