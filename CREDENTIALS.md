# 🔐 CREDENCIALES DE PRODUCCIÓN - HOTEL ENSUEÑOS

## ⚠️ ADVERTENCIA DE SEGURIDAD

**ESTE DOCUMENTO CONTIENE INFORMACIÓN SENSIBLE**
- No compartir fuera del equipo de desarrollo
- No subir a repositorios públicos
- Rotar credenciales cada 90 días

---

## 📋 CREDENCIALES ACTUALES (GENERADAS: ABRIL 2026)

### Admin Dashboard

| Campo | Valor |
|-------|-------|
| **URL de Acceso** | `https://hotelensuenos.com/admin/login` |
| **Username** | `hoteladmin2026` |
| **Password Temporal** | `HotelEnsueños2026!Secure` |
| **Hash** | `SG90ZWxFbnN1ZcOxb3MyMDI2IVNlY3VyZQ==` |

### 🔴 ACCIÓN REQUERIDA

**Antes de producir:**
1. Cambiar el username en `.env` → `ADMIN_USERNAME`
2. Cambiar el password en `.env` → `ADMIN_PASSWORD_HASH`
3. Documentar nuevas credenciales en password manager

---

## 🔑 SECRETS GENERADOS

### Session & Security

```bash
SESSION_SECRET=dcb9a4c8f3b032c284c55c096d96a8bd46e74bbde01298c951bcd821196c8479
CSRF_SECRET=c5e139812dce745a59bd9fdb227f4fb8ad5d1632a2424a1d8e431ebdd75e7a7d
```

### Para generar nuevos secrets:

```bash
# Session/Csrf Secret (32 caracteres hex)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Password Hash (base64)
node -e "console.log(Buffer.from('tu_password').toString('base64'))"
```

---

## 📧 SERVICIOS EXTERNOS

### Mailgun (Email)

| Campo | Valor | Notas |
|-------|-------|-------|
| **Domain** | `mg.hotelensuenos.com` | Configurar en Mailgun |
| **API Key** | `key-XXXXXXXXXXXXXXXX` | Obtener de Mailgun Dashboard |
| **Sender Email** | `noreply@hotelensuenos.com` | Verificado en Mailgun |
| **Admin Email** | `admin@hotelensuenos.com` | Destino de notificaciones |

### WhatsApp Business

| Campo | Valor | Notas |
|-------|-------|-------|
| **Número** | `+593 97 888 8020` | Número de destino |
| **Phone ID** | (pendiente) | Configurar en Meta Developer |
| **Token** | (pendiente) | Configurar en Meta Developer |

### Telegram (Notificaciones)

| Campo | Valor | Notas |
|-------|-------|-------|
| **Bot Token** | (pendiente) | Crear bot con @BotFather |
| **Chat ID** | (pendiente) | Obtener con @userinfobot |

### Mixpanel (Analytics)

| Campo | Valor | Notas |
|-------|-------|-------|
| **Token** | `e040001aeb9bd7a07479c1d22231068d` | Ya configurado |

---

## 🚀 VARIABLES PARA VERCEL

Configurar en Vercel Dashboard → Project Settings → Environment Variables:

### Production

```
NODE_ENV=production
FORCE_HTTPS=true
SITE_URL=https://hotelensuenos.com

SESSION_SECRET=dcb9a4c8f3b032c284c55c096d96a8bd46e74bbde01298c951bcd821196c8479
CSRF_SECRET=c5e139812dce745a59bd9fdb227f4fb8ad5d1632a2424a1d8e431ebdd75e7a7d

ADMIN_USERNAME=hoteladmin2026
ADMIN_PASSWORD_HASH=SG90ZWxFbnN1ZcOxb3MyMDI2IVNlY3VyZQ==

MAILGUN_API_KEY=key-tu_api_key_aqui
MAILGUN_DOMAIN=mg.hotelensuenos.com
SENDER_EMAIL=noreply@hotelensuenos.com
ADMIN_EMAIL=admin@hotelensuenos.com

WHATSAPP_NUMBER=593978888020
WHATSAPP_DESTINATION_PHONE=593978888020

PUBLIC_MIXPANEL_TOKEN=e040001aeb9bd7a07479c1d22231068d

LOG_ENABLED=true
LOG_LEVEL=info
RATE_LIMIT_ENABLED=true
```

### Preview (opcional, mismo que production)

---

## 🔄 ROTACIÓN DE CREDENCIALES

### Cada 90 días:
1. [ ] Generar nuevo `SESSION_SECRET`
2. [ ] Generar nuevo `CSRF_SECRET`
3. [ ] Cambiar `ADMIN_USERNAME`
4. [ ] Cambiar `ADMIN_PASSWORD`
5. [ ] Actualizar en `.env` local
6. [ ] Actualizar en Vercel
7. [ ] Documentar nuevas credenciales
8. [ ] Notificar al equipo

### Después de incidente de seguridad:
1. [ ] Rotar TODAS las credenciales inmediatamente
2. [ ] Revisar logs de acceso
3. [ ] Auditar cambios recientes
4. [ ] Notificar a usuarios afectados (si aplica)

---

## 📞 CONTACTOS DE EMERGENCIA

| Rol | Contacto |
|-----|----------|
| **Dev Lead** | (agregar) |
| **SysAdmin** | (agregar) |
| **Security** | (agregar) |

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Antes de Producción:
- [ ] Todas las variables configuradas en `.env`
- [ ] Credenciales de admin cambiadas de default
- [ ] Variables configuradas en Vercel
- [ ] Mailgun configurado y verificado
- [ ] WhatsApp configurado (opcional)
- [ ] Telegram configurado (opcional)
- [ ] Mixpanel verificando eventos
- [ ] Tests de email funcionando
- [ ] Tests de login admin funcionando

### Después de Deploy:
- [ ] Login de admin funciona
- [ ] Logout funciona
- [ ] Dashboard carga
- [ ] Emails se envían
- [ ] Notificaciones Telegram llegan (si configurado)
- [ ] WhatsApp redirige correctamente
- [ ] Analytics trackeando eventos

---

**Última Actualización:** Abril 1, 2026  
**Próxima Rotación:** Julio 1, 2026  
**Responsable:** (asignar)
