# Hotel Ensueños - Project Context & Documentation

## Overview
Hotel Ensueños is a boutique hotel website built with modern web technologies. The project implements a full-featured hotel booking system with multilingual support, located in the historic center of Cuenca, Ecuador.

## Project Information
- **Project Name**: Hotel Ensueños Web Application
- **Version**: 0.0.1
- **Primary Language**: Spanish (Español) with English support
- **Location**: Cuenca, Ecuador - Historic Center
- **Type**: Boutique Hotel Website with Booking System

## Technical Stack

### Core Framework
- **Astro 5.14.1**: Modern static site generator with server-side rendering
- **Preact 10.19.6**: Lightweight React alternative for interactive components
- **TypeScript 5.9.3**: Type-safe JavaScript development

### Styling & UI
- **Tailwind CSS 3.4.1**: Utility-first CSS framework
- **PostCSS**: CSS post-processing
- **Custom Icons**: SVG icon system with astro-icon integration

### Development Tools
- **Vite**: Fast build tool (via Astro)
- **ESLint**: Code linting (configured via Astro check)
- **Prettier**: Code formatting

### Deployment & Hosting
- **Vercel**: Production deployment platform
- **Node.js Adapter**: Development server adapter

## Architecture

### Project Structure
```
he_web/
├── public/                 # Static assets
├── src/
│   ├── actions/           # Server actions (API endpoints)
│   ├── components/        # Reusable UI components
│   │   ├── atoms/         # Basic building blocks
│   │   ├── molecules/     # Component combinations
│   │   ├── organisms/     # Complex UI sections
│   │   └── core/          # Layout components
│   ├── data/              # Static data and configuration
│   ├── i18n/              # Internationalization files
│   ├── icons/             # SVG icons
│   ├── layouts/           # Page layout templates
│   ├── pages/             # Route pages
│   ├── resources/         # Media assets (images, videos)
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── tools/                 # Development and build tools
└── docs/                  # Project documentation
```

### Component Architecture (Atomic Design)
The project follows the atomic design methodology:

1. **Atoms**: Basic building blocks (Button, Input, Label, etc.)
2. **Molecules**: Simple component combinations (Form fields, Cards)
3. **Organisms**: Complex UI sections (Header, Footer, Booking forms)
4. **Templates**: Page-level layout structures
5. **Pages**: Complete route implementations

## Features

### Core Features
- **🏨 Hotel Presentation**: About us, rooms, amenities
- **🎯 Booking System**: Room reservation functionality
- **🌍 Multilingual Support**: Spanish (primary) and English
- **💱 Currency Support**: USD and EUR
- **🖼️ Media Gallery**: Photo collages and carousels
- **📱 Responsive Design**: Mobile-first approach

### Content Sections
- **Accommodation**: Standard and Deluxe room types
- **Destinations**: Beach and Mountain categories
- **Tours**: City and Nature tour categories
- **Gastronomy**: Main courses and desserts
- **Contact**: Complete contact information and social links

### Technical Features
- **Server-Side Rendering**: Better SEO and performance
- **Partial Builds**: Optimized build process
- **Icon System**: Custom SVG icon integration
- **Form Handling**: Contact and booking forms
- **Video Support**: Background videos and media content

## Configuration

### Site Configuration (`src/data/config.json`)
- **Site Information**: Name, tagline, descriptions in both languages
- **Contact Details**: Address, WhatsApp, email, social media
- **Room Types**: Standard and Deluxe configurations
- **Categories**: Destinations, tours, and gastronomy categories
- **Supported Languages**: Spanish (es), English (en)
- **Supported Currencies**: USD ($), EUR (€)

### Astro Configuration (`astro.config.mjs`)
- **Site URL**: https://www.hotelensueños.com
- **Output Mode**: Server-side rendering
- **Integrations**: Preact, Tailwind CSS, Custom icons
- **Adapter**: Vercel (production) / Node.js (development)
- **Icon Configuration**: Custom SVG icon directory

## Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Development Tools
- **Video Optimization**: Batch and shell scripts for video processing
- **Code Quality**: Qodana configuration for code analysis
- **Environment**: Development and production environment configs

## Debugging & Logging

The project includes a centralized logging service (`src/services/logger.ts`) to control console output during development. This system allows developers to enable, disable, and filter logs without affecting the production build.

### How It Works
- The logger is only active in **development mode** (`pnpm run dev`).
- It is controlled via an `.env` file in the root of the project.
- Logs can be filtered by a `context` string, which typically corresponds to the file or module name.

### Configuration (`.env` file)
To configure the logger, create or edit the `.env` file in the project root. **You must restart the development server** after making changes to this file.

**1. Create the `.env` file**
If it doesn't exist, create it in the root directory.

**2. Configure the variables**

```env
# ==================================================
#      CONFIGURACIÓN DE LOGS PARA DESARROLLO
# ==================================================

# --- Control Global ---
# Set to `false` to disable all logs. Defaults to `true` if commented out.
LOG_ENABLED=true

# --- Context Filtering ---
# Comma-separated list of contexts to display.
# Use `*` to show all logs.
# Example: LOG_CONTEXTS=Api,Translation,ModalBookingGroup
LOG_CONTEXTS=*
```

### Usage Examples

- **To disable all logs:**
  ```env
  LOG_ENABLED=false
  ```

- **To show logs from ALL contexts:**
  ```env
  LOG_CONTEXTS=*
  ```

- **To show logs ONLY from the API service:**
  ```env
  LOG_CONTEXTS=Api
  ```

- **To show logs from MULTIPLE contexts (API and Translations):**
  ```env
  LOG_CONTEXTS=Api,Translation
  ```

### How to Add Logs in Code
To add new logs, import the logger functions and use them with a specific context.

```typescript
import { log, warn, error } from '@/services/logger';

const CONTEXT = 'MyNewComponent';

log(CONTEXT, 'This is a standard log message.');
warn(CONTEXT, 'This is a warning.');
error(CONTEXT, 'This is an error message.');
```

## Deployment

### Production Deployment
- **Platform**: Vercel
- **Web Analytics**: Enabled
- **Build Optimization**: Partial builds enabled
- **Performance**: Server-side rendering with static optimization

### Environment Variables
- `.env.development`: Development environment configuration
- Production environment variables configured in Vercel

## Internationalization (i18n)

### Supported Languages
- **Spanish (es)**: Primary language
- **English (en)**: Secondary language

### Translation System
- **Translation Files**: JSON-based translation storage
- **Translation Utility**: Custom translation helper functions
- **Language Detection**: Browser language detection
- **Language Switching**: Dynamic language switcher component

## Content Management

### Data Structure
All content is managed through JSON configuration files:
- **Hotel Information**: About us, contact details
- **Room Data**: Types, descriptions, amenities
- **Tour Information**: Categories and descriptions
- **Media Assets**: Image and video references

### Media Assets
- **Images**: Hotel photos, room galleries, destination images
- **Videos**: Promotional videos, background media
- **Icons**: Custom SVG icon system

## Performance Considerations

### Optimization Features
- **Partial Builds**: Only rebuild changed content
- **Static Assets**: Optimized image and video delivery
- **Code Splitting**: Component-based code splitting
- **SSR**: Server-side rendering for better performance

### SEO Features
- **Meta Tags**: Proper meta tag implementation
- **Structured Data**: Hotel and business schema markup
- **Sitemap**: XML sitemap generation
- **Performance**: Fast loading times with modern tooling

## Future Enhancements

### Potential Improvements
- **CMS Integration**: Content management system for dynamic content
- **Payment Integration**: Online payment processing
- **Advanced Booking**: Calendar integration and availability management
- **Review System**: Guest reviews and ratings
- **Admin Dashboard**: Content management interface

## Development Notes

### Code Organization
The project follows modern best practices:
- **Component-based architecture**: Reusable, maintainable components
- **Type safety**: Full TypeScript implementation
- **Responsive design**: Mobile-first CSS approach
- **Accessibility**: WCAG-compliant markup and interactions

### Quality Assurance
- **Type checking**: TypeScript strict mode
- **Code analysis**: Qodana configuration for code quality
- **Performance monitoring**: Vercel analytics integration

---

**Last Updated**: October 12, 2025
**Project Status**: Active Development
**Documentation Version**: 1.0.0
