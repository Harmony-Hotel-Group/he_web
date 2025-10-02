1. Stack Tecnológico Principal 🚀
   El proyecto es una Página Web Estática construida con las siguientes tecnologías clave:

Framework: Astro (para el bundling y la estructura de la página).

Gestor de Paquetes: pnpm (utilizar siempre comandos de pnpm, ej: pnpm install, pnpm run dev).

Estilos (CSS): Tailwind CSS (utilizar clases de utilidad en lugar de archivos CSS modulares puros).

Componentes de UI: Preact (utilizar Functional Components y Hooks de Preact para la interactividad).

2. Arquitectura y Estructura del Código 🏗️
   El proyecto debe seguir una estructura modular, limpia y escalable.

Estructura de Carpetas:

/src/components/: Contiene todos los componentes de UI.

/src/layouts/: Contiene los layouts de Astro que definen la estructura base de las páginas.

/src/pages/: Contiene los archivos .astro que representan las rutas de la aplicación.

/src/data/: Contendrá los archivos JSON para datos dinámicos (NUEVO).

/src/styles/: Solo para archivos CSS globales o configuraciones de Tailwind.

Modularidad de Componentes:

Cada componente de UI debe estar en su propio archivo, preferiblemente .jsx o .tsx si usa TypeScript.

Atomic Design: Seguir una aproximación similar a Atomic Design o ITCSS. Los componentes simples (átomos) deben ser composables en estructuras más grandes (moléculas, organismos).

3. Principios de Desarrollo de Componentes Reusables ♻️
   Reusabilidad: Todos los componentes generados deben ser reutilizables y agnósticos al contexto de la página en la medida de lo posible.

Props: Utilizar props explícitas y bien definidas para la configuración y los datos. Evitar la codificación rígida (hardcoding) de contenido específico de la página.

Aislamiento: Los componentes de Preact deben gestionar su propio estado (state) y ciclo de vida de manera aislada.

Estilo: Aplicar las clases de Tailwind CSS directamente en la plantilla del componente (className).

4. Generación de Código ✍️
   Snippets: Al generar código, proporcionar el snippet completo, incluyendo las importaciones necesarias de Preact y Astro.

Ejemplo de Componente: Los componentes de Preact siempre deben exportarse como una función:

import { useState } from 'preact/hooks';

// Componente de Preact
export function Button({ text, onClick }) {
// ... lógica
return (
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onClick}>
{text}
</button>
);
}

5. Contexto Específico de la Aplicación 🗺️
   Estructura de Páginas/Navegación:

Las páginas principales del sitio son: habitaciones, destinos, tours, gastronomia y contactos.

La página de inicio (home) no debe aparecer en la barra de navegación principal, pero debe ser accesible dando clic en el logo.

Soporte de Datos (Temporal):

Toda la información dinámica (hotel, destinos, tours, gastronomía, etc.) será leída desde archivos JSON estáticos ubicados en el directorio /src/data/ hasta que se implemente una API. Al generar componentes, asume que los datos provienen de la importación de estos JSON.

Soporte Global:

Idioma (i18n): El sitio debe ser diseñado para soportar múltiples idiomas. Usar estructuras que faciliten la inyección de textos traducidos (ej: un objeto i18n pasado por props o un store global en Preact).

Moneda: Todos los componentes que muestren precios o tarifas deben ser diseñados para aceptar y mostrar el símbolo de moneda configurado globalmente.

6. Manejo de Recursos (Imágenes y Videos) 🖼️
   Componente Centralizado de Validación: En lugar de usar atributos onerror en el HTML, todo recurso visual (imágenes y videos) debe ser renderizado a través de un componente wrapper reusable (ejemplo: <ResourceValidator />).

Responsabilidad del Componente: Este componente (de Preact o Astro) debe contener la lógica para validar si el path del recurso (src) es válido o existe antes de intentar cargarlo.

Comportamiento Fallback (Imágenes y Videos): Si el componente validador determina que la ruta es incorrecta o no válida, debe mostrar una imagen de placeholder.

URL de Fallback (Imágenes):

[https://placehold.co/400x250?text=RECURSO+NO+ENCONTRADO](https://placehold.co/400x250?text=RECURSO+NO+ENCONTRADO)

Ejemplo Conceptual de Uso: Al generar código, usar la sintaxis del componente validador:

// Asegúrate de importar el componente validador en tu archivo
<ResourceValidator
src={urlDinamica}
alt="Descripción del recurso"
className="w-full h-auto object-cover rounded-lg"
/>
