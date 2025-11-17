# Configuración de Google reCAPTCHA

Este documento explica cómo configurar Google reCAPTCHA para el formulario de contacto.

## Pasos para configurar reCAPTCHA

### 1. Registrarse en Google reCAPTCHA

1. Ve a [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en el botón **"+"** (Crear) para registrar un nuevo sitio

### 2. Configurar el sitio

Completa el formulario con la siguiente información:

- **Etiqueta**: Un nombre descriptivo (ej: "Antartur Contact Form")
- **Tipo de reCAPTCHA**: Selecciona **reCAPTCHA v2** → **"No soy un robot"**
- **Dominios**: 
  - Para desarrollo: `localhost`
  - Para producción: `antartur.tur.ar` (o tu dominio)
  - Puedes agregar múltiples dominios
- **Propietarios**: Tu email de Google
- **Términos de servicio**: Acepta los términos

### 3. Obtener las claves

Después de crear el sitio, Google te proporcionará dos claves:

1. **Site Key (Clave del sitio)**: Esta es pública y se usa en el frontend
2. **Secret Key (Clave secreta)**: Esta es privada y se usa en el backend

**⚠️ IMPORTANTE**: Nunca compartas la Secret Key públicamente.

### 4. Configurar variables de entorno

Crea o edita el archivo `.env.local` en la raíz del proyecto:

```env
# reCAPTCHA
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key_aqui
RECAPTCHA_SECRET_KEY=tu_secret_key_aqui

# Email (Gmail - Opción 1)
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=tu_contraseña_de_aplicacion

# O Email SMTP (Opción 2 - más flexible)
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASSWORD=tu_contraseña_smtp
SMTP_FROM=noreply@antartur.tur.ar
```

### 5. Configurar Gmail (si usas Gmail para enviar emails)

Si quieres usar Gmail para enviar los emails:

1. Ve a tu cuenta de Google: [myaccount.google.com](https://myaccount.google.com)
2. Ve a **Seguridad** → **Verificación en 2 pasos** (debe estar activada)
3. Ve a **Contraseñas de aplicaciones**
4. Genera una nueva contraseña de aplicación para "Correo"
5. Usa esa contraseña en `GMAIL_APP_PASSWORD`

**Nota**: No uses tu contraseña normal de Gmail, solo funciona con contraseñas de aplicación.

### 6. Alternativa: Usar un servicio SMTP

Si prefieres usar otro proveedor de email (como SendGrid, Mailgun, etc.):

1. Obtén las credenciales SMTP de tu proveedor
2. Configura las variables `SMTP_*` en `.env.local`
3. El código usará automáticamente la configuración SMTP en lugar de Gmail

## Verificación

Después de configurar todo:

1. Reinicia el servidor de desarrollo: `npm run dev`
2. Ve a la página de contacto: `http://localhost:3000/contacto`
3. Deberías ver el widget de reCAPTCHA en el formulario
4. Completa y envía el formulario
5. Verifica que recibas el email en `ximenapaparella@gmail.com`

## Solución de problemas

### El widget de reCAPTCHA no aparece

- Verifica que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` esté configurada correctamente
- Verifica que el dominio esté registrado en Google reCAPTCHA
- Revisa la consola del navegador para errores

### Error al enviar el formulario

- Verifica que `RECAPTCHA_SECRET_KEY` esté configurada
- Verifica las credenciales de email (Gmail o SMTP)
- Revisa los logs del servidor para más detalles

### Error "Invalid site key"

- Asegúrate de que el dominio en el que estás probando esté registrado en Google reCAPTCHA
- Para desarrollo local, debes agregar `localhost` como dominio permitido

## Producción

Cuando despliegues a producción:

1. Agrega tu dominio de producción a Google reCAPTCHA
2. Actualiza las variables de entorno en tu plataforma de hosting (Vercel, Netlify, etc.)
3. Asegúrate de que `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` y `RECAPTCHA_SECRET_KEY` estén configuradas en producción

