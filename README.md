# Hotel Ensueños - Sitio Web Oficial

[![Astro](https://img.shields.io/badge/Astro-4.16.19-orange.svg)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC.svg)](https://tailwindcss.com)
[![Preact](https://img.shields.io/badge/Preact-10.27.2-673AB8.svg)](https://preactjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg)](https://www.typescriptlang.org)

Un sitio web moderno y escalable para Hotel Ensueños, ubicado en el corazón histórico de Cuenca, Ecuador. Construido con tecnologías de vanguardia para ofrecer una experiencia excepcional al usuario.

## 🌟 Características Principales

### ✨ Tecnologías Modernas
- **Astro 4.0** - Framework web de última generación
- **Tailwind CSS** - Utilidades CSS primero móvil
- **Preact** - Librería React ligera y rápida
- **TypeScript** - Tipado estático para mayor robustez

### 🌍 Internacionalización
- **Multi-idioma** - Español e Inglés
- **Multi-moneda** - USD, EUR, GBP
- **Contenido localizado** - Adaptado culturalmente

### 📱 Optimización y Rendimiento
- **Mobile-first** - Diseño responsivo
- **Carga diferida** - Imágenes y componentes
- **Optimización SEO** - Meta tags y estructura
- **Accesibilidad** - Cumple estándares WCAG

### 🏨 Funcionalidades del Hotel
- **Sistema de reservas** - Formulario integrado
- **Galería de habitaciones** - Imágenes y detalles
- **Información turística** - Destinos locales
- **Carta gastronómica** - Platos típicos
- **Contacto directo** - Múltiples canales

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** 18.0 o superior
- **pnpm** 8.0 o superior

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd hotel-ensuenos
   ```

2. **Instalar dependencias**
   ```bash
   pnpm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones reales
   ```

4. **Iniciar desarrollo**
   ```bash
   pnpm dev
   ```

5. **Abrir navegador**
   ```
   http://localhost:4321
   ```

### Comandos Disponibles

```bash
# Desarrollo
pnpm dev          # Servidor de desarrollo
pnpm start        # Alias para dev

# Producción
pnpm build        # Construir para producción
pnpm preview      # Vista previa de producción

# Utilidades
pnpm astro        # Ejecutar comandos de Astro
pnpm format       # Formatear código (si está configurado)
pnpm lint         # Linting (si está configurado)
```

## 📁 Estructura del Proyecto

```
hotel-ensuenos/
├── public/                 # Archivos estáticos
│   ├── icons/             # Iconos SVG para amenidades
│   ├── rooms/             # Imágenes de habitaciones
│   ├── tourism/           # Imágenes de destinos turísticos
│   └── gastronomy/        # Imágenes gastronómicas
├── src/
│   ├── components/        # Componentes reutilizables
│   │   ├── global/       # Header, Footer, Navigation
│   │   ├── hotel/        # RoomCard, TourismCard, etc.
│   │   └── ui/           # Button, Card, Rating, Toggle
│   ├── data/             # Datos JSON
│   │   ├── siteConfig.json    # Configuración del sitio
│   │   ├── hotel.json         # Información del hotel
│   │   ├── rooms.json         # Datos de habitaciones
│   │   ├── tourism.json       # Destinos turísticos
│   │   ├── gastronomy.json    # Carta gastronómica
│   │   └── *.json             # Configuraciones varias
│   ├── i18n/             # Internacionalización
│   │   ├── es.json       # Traducciones español
│   │   ├── en.json       # Traducciones inglés
│   │   ├── translations.ts # Cargador de traducciones
│   │   └── useI18n.ts    # Hook de i18n
│   ├── layouts/          # Layouts de página
│   │   ├── BaseLayout.astro   # Layout base
│   │   └── HotelLayout.astro  # Layout específico del hotel
│   ├── lib/              # Utilidades y lógica
│   │   ├── api/          # Integraciones externas
│   │   └── utils/        # Funciones utilitarias
│   ├── pages/            # Páginas de Astro
│   │   ├── index.astro   # Página principal
│   │   ├── rooms/        # Páginas de habitaciones
│   │   ├── tourism/      # Páginas de turismo
│   │   ├── gastronomy.astro   # Página gastronómica
│   │   └── contact.astro      # Página de contacto
│   └── styles/           # Estilos CSS
├── .env.example          # Variables de entorno de ejemplo
├── astro.config.mjs      # Configuración de Astro
├── tailwind.config.cjs   # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
└── package.json          # Dependencias y scripts
```

## 🎨 Personalización

### Colores y Tema

Los colores principales están definidos en `tailwind.config.cjs`:

```javascript
colors: {
  hotel: {
    primary: '#2a4d69',    // Azul primario
    secondary: '#4b86b4',  // Azul secundario
    accent: '#c6d7eb'      // Azul claro
  }
}
```

### Fuentes

- **Principal**: Inter (Google Fonts)
- **Peso**: 300, 400, 500, 600, 700

### Breakpoints

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` basado en `.env.example`:

```env
# API Keys
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_mailgun_domain

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id

# Application Configuration
NODE_ENV=development
```

### Configuración de Astro

El archivo `astro.config.mjs` incluye:

- **Tailwind CSS** - Integración oficial
- **Preact** - Para componentes interactivos
- **Output estático** - Para mejor rendimiento

## 📊 Datos y Contenido

### Gestión de Datos

Los datos están organizados en archivos JSON en `src/data/`:

- `siteConfig.json` - Configuración general del sitio
- `hotel.json` - Información del hotel y amenidades
- `rooms.json` - Datos de habitaciones y precios
- `tourism.json` - Destinos turísticos
- `gastronomy.json` - Carta gastronómica

### Internacionalización

- Traducciones en `src/i18n/`
- Hook `useI18n()` para acceso fácil
- Soporte para múltiples idiomas

## 🚀 Despliegue

### Construcción para Producción

```bash
pnpm build
```

### Despliegue en Plataformas

#### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Desplegar
vercel --prod
```

#### Netlify
```bash
# Construir y desplegar
pnpm build
netlify deploy --prod --dir=dist
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
EXPOSE 4321
CMD ["pnpm", "preview"]
```

## 🔒 Seguridad

### Variables de Entorno

- Nunca commitear `.env` (está en `.gitignore`)
- Usar permisos mínimos para API keys
- Validar todas las entradas de usuario

### Configuración de Producción

- Configurar rate limiting
- Habilitar CORS apropiado
- Usar HTTPS en producción

## 📈 Rendimiento

### Optimizaciones Implementadas

- **Carga diferida** de imágenes
- **Componentes Preact** solo cuando es necesario
- **CSS optimizado** con Tailwind
- **Bundle splitting** automático con Astro

### Métricas Objetivo

- **Lighthouse Score**: 90+
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🛠️ Desarrollo

### Flujo de Trabajo

1. **Crear rama** para nuevas características
2. **Desarrollar** con `pnpm dev`
3. **Probar** en múltiples dispositivos
4. **Crear Pull Request**
5. **Revisión de código**
6. **Merge a main**

### Convenciones de Código

- **ESLint** para calidad de código
- **Prettier** para formateo
- **Commits convencionales**
- **Documentación** para funciones complejas

## 📱 Características Responsivas

### Diseño Mobile-First

- **Breakpoints** optimizados para móviles
- **Touch targets** de tamaño adecuado
- **Navegación** adaptativa
- **Imágenes** responsivas

### Navegación Móvil

- **Menú hamburguesa** en móviles
- **Navegación simplificada**
- **Botones táctiles** optimizados

## 🎯 Próximas Características

### Fase 2 (API Integration)
- [ ] Backend API para reservas reales
- [ ] Base de datos para contenido dinámico
- [ ] Sistema de gestión de contenido
- [ ] Panel administrativo

### Mejoras Futuras
- [ ] Chat en vivo con WhatsApp
- [ ] Mapa interactivo de ubicación
- [ ] Galería de fotos avanzada
- [ ] Sistema de reseñas

## 📞 Soporte

### Contacto

- **Email**: info@hotelensuenos.com
- **Teléfono**: +593 999 999 999
- **WhatsApp**: +593 999 999 999

### Documentación Adicional

- [Guía de Assets](ASSETS_README.md) - Gestión de imágenes e iconos
- [Contribución](CONTRIBUTING.md) - Guías para desarrolladores
- [API Documentation](API.md) - Documentación de APIs

## 📄 Licencia

Este proyecto es propiedad de Hotel Ensueños. Todos los derechos reservados.

---

**Desarrollado con ❤️ para Hotel Ensueños**
*Cuenca, Ecuador - 2024*