# Configuración de Email para el Formulario de Contacto

## 📧 Modo Desarrollo (Sin Configuración)

**¡Buenas noticias!** El formulario ya funciona en modo desarrollo sin necesidad de configurar nada. 

Cuando no hay configuración de email, el sistema:
- ✅ Acepta el formulario correctamente
- ✅ Muestra mensaje de éxito al usuario
- ✅ Loguea el contenido del email en la consola del servidor (para que puedas ver qué se habría enviado)

**No necesitas configurar nada para desarrollo local.** El formulario funcionará y verás los emails en la consola.

---

## 🚀 Configuración para Producción (Opcional)

Si quieres que los emails se envíen realmente, tienes **2 opciones**:

### Opción 1: Gmail (Recomendado para empezar)

#### Paso 1: Activar verificación en 2 pasos
1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Ve a **Seguridad** → **Verificación en 2 pasos**
3. Actívala si no está activada

#### Paso 2: Generar contraseña de aplicación
1. En la misma página de Seguridad, busca **"Contraseñas de aplicaciones"**
2. O ve directamente a: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Selecciona **"Correo"** como aplicación
4. Selecciona **"Otro (nombre personalizado)"** como dispositivo
5. Escribe "Antartur Contact Form" o cualquier nombre
6. Haz clic en **"Generar"**
7. **Copia la contraseña de 16 caracteres** que aparece (se muestra solo una vez)

#### Paso 3: Configurar variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto (si no existe):

```env
# Email destinatario (requerido en producción)
CONTACT_RECIPIENT_EMAIL=tu_email_destinatario@gmail.com

# Gmail Configuration
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**⚠️ IMPORTANTE:**
- `CONTACT_RECIPIENT_EMAIL` es **requerido en producción**. En desarrollo, si no está configurado, se usa un valor por defecto.
- Usa la contraseña de aplicación de 16 caracteres (no tu contraseña normal de Gmail)
- Si la contraseña tiene espacios, puedes dejarlos o quitarlos
- El archivo `.env.local` ya está en `.gitignore`, así que no se subirá al repositorio

#### Paso 4: Reiniciar el servidor
```bash
# Detén el servidor (Ctrl+C) y vuelve a iniciarlo
npm run dev
```

---

### Opción 2: Servidor SMTP (Para producción profesional)

Si prefieres usar un servicio SMTP profesional (SendGrid, Mailgun, AWS SES, etc.):

#### Paso 1: Obtener credenciales SMTP
Obtén las credenciales de tu proveedor SMTP:
- **Host SMTP** (ej: `smtp.sendgrid.net`)
- **Puerto** (generalmente `587` o `465`)
- **Usuario** (tu usuario SMTP)
- **Contraseña** (tu contraseña SMTP)

#### Paso 2: Configurar variables de entorno
En `.env.local`:

```env
# Email destinatario (requerido en producción)
CONTACT_RECIPIENT_EMAIL=tu_email_destinatario@gmail.com

# SMTP Configuration
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASSWORD=tu_contraseña_smtp
SMTP_FROM=noreply@antartur.tur.ar
```

**⚠️ IMPORTANTE:**
- `CONTACT_RECIPIENT_EMAIL` es **requerido en producción**. En desarrollo, si no está configurado, se usa un valor por defecto.

#### Paso 3: Reiniciar el servidor
```bash
npm run dev
```

---

## 🔍 Verificar qué está configurado

El código verifica en este orden:
1. **Primero**: Si hay configuración SMTP → la usa
2. **Segundo**: Si hay configuración Gmail → la usa
3. **Tercero**: Si no hay nada → modo desarrollo (solo loguea)

---

## ❌ Solución de Problemas

### Error: "Application-specific password required"
- **Causa**: Estás usando tu contraseña normal de Gmail en lugar de una contraseña de aplicación
- **Solución**: Genera una contraseña de aplicación siguiendo el Paso 2 de la Opción 1

### Error: "EAUTH" o "Invalid login"
- **Causa**: Las credenciales están incorrectas
- **Solución**: 
  - Verifica que `GMAIL_USER` sea tu email completo
  - Verifica que `GMAIL_APP_PASSWORD` sea la contraseña de aplicación de 16 caracteres
  - Asegúrate de que la verificación en 2 pasos esté activada

### El email no se envía pero no hay error
- **Causa**: Puede que estés en modo desarrollo
- **Solución**: Revisa la consola del servidor, deberías ver un log con el contenido del email

### Quiero volver al modo desarrollo
- **Solución**: Elimina o comenta las variables de email en `.env.local`:
  ```env
  # GMAIL_USER=tu_email@gmail.com
  # GMAIL_APP_PASSWORD=xxxx
  ```
  Luego reinicia el servidor.

---

## 📝 Resumen Rápido

**Para desarrollo local:**
- ✅ No necesitas configurar nada
- ✅ El formulario funciona y loguea los emails en la consola
- ✅ `CONTACT_RECIPIENT_EMAIL` es opcional (usa valor por defecto)

**Para producción:**
- ⚠️ **REQUERIDO**: `CONTACT_RECIPIENT_EMAIL` debe estar configurado
- Opción A: Configura Gmail con contraseña de aplicación
- Opción B: Configura un servidor SMTP profesional

## 🔒 Seguridad y Rate Limiting

El endpoint incluye protección contra abuso:
- **Rate Limiting**: Máximo 5 requests por IP cada 15 minutos
- **reCAPTCHA**: Se recomienda habilitar en producción (ver `RECAPTCHA_SETUP.md`)
- **Validación**: Todos los campos requeridos son validados

Si recibes demasiadas solicitudes, recibirás un error 429. Esto protege contra spam y abuso.

---

## 🆘 ¿Necesitas ayuda?

Si tienes problemas:
1. Revisa la consola del servidor para ver los logs
2. Verifica que las variables de entorno estén correctamente escritas en `.env.local`
3. Asegúrate de haber reiniciado el servidor después de cambiar `.env.local`

