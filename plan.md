# he_web: Completar Refactorización Atomic Design — Plan de Implementación

> **Para Hermes:** Usar la skill `subagent-driven-development` para ejecutar este plan tarea por tarea.

**Objetivo:** Completar la extracción de lógica de átomos a composables (Fase 1) y centralizar utilidades de dominio (Fase 2), culminando con la verificación de calidad.

**Arquitectura:** Atomic Design estricto — átomos solo markup, lógica en `src/composables/` o `src/domain/`. Los adaptadores (`src/adapters/`) son la única fuente de verdad para construcción de mensajes y formatos externos.

**Stack técnico:** Astro 5.18.0, Preact, TypeScript, flatpickr, Biome, pnpm, Vite, Vitest.

---

## 📂 Estructura objetivo

```
src/
├── composables/           ← Toda lógica reutilizable de componentes
│   ├── useDatePicker.ts         ✅ hecho
│   ├── useSearchInput.ts        ✅ hecho
│   ├── useBookingForm.ts        ⚠️  necesita ampliación
│   ├── useWhatsAppButton.ts     🆕 crear
│   └── useBookingOptions.ts     🆕 crear (opciones de dropdowns)
├── domain/
│   └── booking/
│       ├── date.utils.ts        ✅ hecho
│       ├── types.ts             ⚠️  verificar
            
├── adapters/booking/
│   └── whatsapp.adapter.ts      ⚠️  ampliar con formatContactMessage
├── services/messages/
│   └── notifications.ts         ⚠️  delegar al adapter
└── components/atoms/
    ├── WhatsAppButton.astro     ⚠️  simplificar
    └── BookingForm.astro        ⚠️  simplificar (no es átomo, pero tiene lógica)
```

---

## 🗺️ Tareas

### Fase 1 — Átomos presentacionales puros

#### Task 1: Extraer lógica residual de WhatsAppButton

**Objetivo:** Mover la construcción de `phoneNumber` y `whatsappUrl` a un composable.

**Archivos:**
- Crear: `src/composables/useWhatsAppButton.ts`
- Modificar: `src/components/atoms/WhatsAppButton.astro` (borrar toda lógica inline)

**Paso 1: Leer WhatsAppButton.astro completo**

```bash
cat src/components/atoms/WhatsAppButton.astro
```

**Paso 2: Crear composable `src/composables/useWhatsAppButton.ts`**

```typescript
// src/composables/useWhatsAppButton.ts
import { buildContactMessage, buildWhatsAppUrl } from '@/adapters/booking/whatsapp.adapter';

export interface WhatsAppButtonOptions {
	config: SiteConfig;
}

/**
 * Composable: construye la URL de WhatsApp y mensaje para WhatsAppButton.
 * Recibe la config y devuelve todo lo necesario para el átomo.
 */
export function useWhatsAppButton(opts: WhatsAppButtonOptions) {
	const { whatsapp } = opts.config.contactInfo;
	const phoneNumber = whatsapp.replace(/\+/g, '');
	const message = buildContactMessage();
	const whatsappUrl = buildWhatsAppUrl(phoneNumber, message);

	return {
		phoneNumber,
		message,
		whatsappUrl,
	};
}
```

**Paso 3: Simplificar WhatsAppButton.astro**

Solo le quedará:

```astro
---
import Button from '@/components/atoms/button/Button.astro';
import { useWhatsAppButton } from '@/composables/useWhatsAppButton';
import config from '@/data/config.json';

const { whatsappUrl, message } = useWhatsAppButton({ config });
---

<Button
	_id="whatsapp-hero"
	variant="accent"
	icon="whatsapp"
	lblKey="booking.whatsapp"
	href={whatsappUrl}
	external
/>
```

**Paso 4: Verificar**

```bash
npm run build && echo "✅ Build OK"
npm run test:run && echo "✅ Tests OK"
```

**Paso 5: Commit**

```bash
git add src/composables/useWhatsAppButton.ts src/components/atoms/WhatsAppButton.astro
git commit -m "refactor(atomic): extraer lógica WhatsAppButton a useWhatsAppButton.ts"
```

---

#### Task 2: Extraer opciones de BookingForm a composable

**Objetivo:** Mover el mapeo de opciones (adultos, niños, habitaciones) fuera del componente, para que `BookingForm.astro` sea presentacional puro.

**Archivos:**
- Crear: `src/composables/useBookingOptions.ts`
- Modificar: `src/components/organisms/booking/BookingForm.astro`
- Modificar: `src/composables/useBookingForm.ts` (si recibe opciones)

**Paso 1: Leer BookingForm.astro (líneas 27–61)**

```bash
sed -n '27,61p' src/components/organisms/booking/BookingForm.astro
```

**Paso 2: Crear `src/composables/useBookingOptions.ts`**

```typescript
// src/composables/useBookingOptions.ts
import { range } from '@/utils/math';
import type { Translations } from '@/i18n/translation';

/**
 * Composable: genera las opciones de los dropdowns del formulario de reserva.
 * Centraliza la lógica de mapeo para que BookingForm sea presentacional puro.
 */
export function useBookingOptions(t: Translations) {
	const adultsOptions = range(1, 9).map((i, index, array) => {
		if (index === array.length - 1) {
			return { value: 'group', label: t('booking.dropdown.optGroup') };
		}
		return { value: `${i}`, label: `${t('booking.dropdown.optAdults', { i, s: i > 1 ? 's' : '' })}` };
	});

	const childrenOptions = range(0, 8).map((i) => {
		const s = i === 0 ? 's' : i > 1 ? 's' : '';
		return { value: `${i}`, label: `${t('booking.dropdown.optChildren', { i: i === 0 ? 'Sin' : i, s })}` };
	});

	const roomsOptions = range(1, 5).map((i) => {
		return { value: `${i}`, label: `${t('booking.dropdown.optRooms', { i, s: i > 1 ? 'es' : '' })}` };
	});

	const distributionOptions = [
		{ value: 'shared_beds', label: 'Camas Compartidas' },
		{ value: 'shared_rooms', label: 'Habitaciones Compartidas' },
		{ value: 'individual_rooms', label: 'Habitaciones Individuales' },
	] as const;

	return { adultsOptions, childrenOptions, roomsOptions, distributionOptions };
}
```

**Paso 3: Modificar `BookingForm.astro`**

Reemplazar líneas 27–67 por:

```astro
---
import Button from '@/components/atoms/button/Button.astro';
import Icono from '@/components/atoms/Icono.astro';
import Label from '@/components/atoms/Label.astro';
import TextAreaInput from '@/components/atoms/TextAreaInput.astro';
import BookingSummaryModal from '@/components/molecules/booking/BookingSummaryModal.astro';
import DatePickerField from '@/components/molecules/forms/DatePickerField.astro';
import DropDownField from '@/components/molecules/forms/DropdownField.astro';
import NumberField from '@/components/molecules/forms/NumberField.astro';
import SwitchField from '@/components/molecules/forms/SwitchField.astro';
import { Translations } from '@/i18n/translation.ts';
import Grid from '@/layouts/GridLayout.astro';
import Row from '@/layouts/Row.astro';
import type { SiteConfig } from '@/types/config';
import { useBookingOptions } from '@/composables/useBookingOptions';
import BookingVehicleSection from './BookingVehicleSection.astro';

interface Props {
	lang: string;
	config: SiteConfig;
}
const { lang, config } = Astro.props;

const t = Translations(lang);
const { adultsOptions, childrenOptions, roomsOptions, distributionOptions } = useBookingOptions(t);

const whatsappNumber = config?.contactInfo?.whatsapp ?? '';
const email = config?.contactInfo?.email ?? '';
---
```

(Eliminar líneas 27–67; agrupar imports al tope; mantener el resto del componente intacto).

**Paso 4: Verificar**

```bash
npm run build && npm run test:run && echo "✅ Todo OK"
```

**Paso 5: Commit**

```bash
git add src/composables/useBookingOptions.ts src/components/organisms/booking/BookingForm.astro
git commit -m "refactor(atomic): extraer opciones de BookingForm a useBookingOptions.ts"
```

---

#### Task 3: Centralizar formateo de mensajes en adapter

**Objetivo:** Mover `formatContactMessage()` y `formatContactEmail()` desde `notifications.ts` a `whatsapp.adapter.ts`, para que el servicio de notificaciones solo se encargue de despachar canales.

**Archivos:**
- Modificar: `src/adapters/booking/whatsapp.adapter.ts` (agregar funciones de contacto)
- Modificar: `src/services/messages/notifications.ts` (importar desde adapter, eliminar funciones inline)

**Paso 1: Leer función actual en `notifications.ts`**

```bash
sed -n '171,205p' src/services/messages/notifications.ts
```

**Paso 2: Agregar funciones en `whatsapp.adapter.ts`**

Agregar al final del archivo (después de la línea 427 actual o en una nueva sección):

```typescript
// ============== Mensajes de Contacto (formulario contacto) ==============

export interface ContactFormData {
	name: string;
	email: string;
	phone: string;
	subject: string;
	message: string;
}

/**
 * Formatea el mensaje de contacto para WhatsApp (con formato Markdown para WA).
 */
export function formatContactMessage(data: ContactFormData): string {
	const lines: string[] = [];
	lines.push('📧 *Nuevo mensaje de contacto — Hotel Ensueños*');
	lines.push('');
	lines.push(`👤 *Nombre:* ${data.name}`);
	lines.push(`📧 *Email:* ${data.email}`);
	lines.push(`📱 *Teléfono:* ${data.phone}`);
	lines.push(`📝 *Asunto:* ${data.subject}`);
	lines.push('');
	lines.push('💬 *Mensaje:*');
	lines.push(data.message);
	lines.push('');
	lines.push('_Enviado desde hotelensuenos.com_');
	return lines.join('\n');
}

/**
 * Formatea el mensaje de contacto para Email (texto plano).
 */
export function formatContactEmail(data: ContactFormData): string {
	const lines: string[] = [];
	lines.push('Nuevo mensaje de contacto desde el sitio web:');
	lines.push('');
	lines.push(`Nombre: ${data.name}`);
	lines.push(`Email: ${data.email}`);
	lines.push(`Teléfono: ${data.phone}`);
	lines.push(`Asunto: ${data.subject}`);
	lines.push('');
	lines.push('Mensaje:');
	lines.push(data.message);
	lines.push('');
	lines.push('Enviado desde hotelensuenos.com');
	return lines.join('\n');
}
```

**Paso 3: Modificar `notifications.ts`**

Eliminar líneas 171–205 (funciones `formatContactMessage` y `formatContactEmail`) y reemplazar el import:

```diff
- import { buildBookingNotificationMessage } from '@/adapters/booking/whatsapp.adapter';
+ import { buildBookingNotificationMessage, formatContactMessage, formatContactEmail } from '@/adapters/booking/whatsapp.adapter';
```

Opciones 210–215 cambiar a:

```typescript
const text = formatContactMessage(data);
const plainText = formatContactEmail(data);
```

**Paso 4: Verificar**

```bash
npm run build && npm run test:run && echo "✅ Todo OK"
```

**Paso 5: Commit**

```bash
git add src/adapters/booking/whatsapp.adapter.ts src/services/messages/notifications.ts
git commit -m "refactor(domain): centralizar formato de mensajes de contacto en whatsapp.adapter"
```

---

### Fase 2 — Limpieza final

#### Task 4: Ajustar buildBookingMessage si es necesario

**Objetivo:** Revisar si `buildBookingMessage()` y las funciones relacionadas en el adapter tienen lógica que ahora pertenece a composables o dominio. Si se detecta duplicación, eliminarla.

**Archivos:**
- Leer: `src/adapters/booking/whatsapp.adapter.ts` (todo)
- Modificar: eliminar código muerto si existe

**Criterio de salida:** El adapter solo contiene tipos + funciones de formatos de mensajes (booking y contacto), ninguna lógica de dominio o de formulario.

**Paso 1: Leer archivo completo**

```bash
wc -l src/adapters/booking/whatsapp.adapter.ts
sed -n '1,80p' src/adapters/booking/whatsapp.adapter.ts
# y revisar imports de otros módulos
grep -n "from '@/domain\|from '@/composables" src/adapters/booking/whatsapp.adapter.ts
```

**Paso 2: Limpiar y commit**

```bash
git add src/adapters/booking/whatsapp.adapter.ts
git commit -m "chore(cleanup): eliminar código muerto en whatsapp.adapter.ts"
```

---

#### Task 5: Build final + Tests + Lint + Push

**Objetivo:** Ejecutar la verificación de calidad completa y subir a `origin/dev`.

**Comandos:**

```bash
# 1. TypeScript check
npx astro check

# 2. Biome auto-fix (unsafe)
pnpm biome check src --write --unsafe 2>/dev/null || true

# 3. Build
npm run build

# 4. Tests
npm run test:run

# 5. Si todo conforme — push
git push origin dev
```

**Criterio de aceptación:**
- Build exitoso sin errores nuevos
- Tests 50/50 pasando
- Lint sin errores nuevos (errores pre-existentes en Header.astro y alias `@/` se ignoran — son falsos positivos)

---

## ✅ Checklist de finalización

- [ ] `useWhatsAppButton.ts` creado y WhatsAppButton simplificado
- [ ] `useBookingOptions.ts` creado y BookingForm limpio de lógica de opciones
- [ ] `formatContactMessage` y `formatContactEmail` movidos a `whatsapp.adapter.ts`
- [ ] `notifications.ts` limpio, delega al adapter
- [ ] `whatsapp.adapter.ts` revisado — código muerto eliminado
- [ ] `astro check` pasa sin errores nuevos
- [ ] `npm run build` exitoso
- [ ] `npm run test:run` 50/50
- [ ] Commit y push a `origin/dev`

---

*Generado: 2025-05-20 | Proyecto: he_web |
