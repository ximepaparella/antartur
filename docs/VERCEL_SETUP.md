# 🚀 Guía de Configuración de Vercel

## 📋 Variables de Entorno Requeridas en Vercel

Para que tu aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### 🔴 **REQUERIDAS** (Críticas para que funcione)

#### 1. `DATABASE_URL` ⚠️ **OBLIGATORIA**
```
postgresql://usuario:contraseña@host:puerto/base_de_datos
```

**Ejemplo:**
```
postgresql://antartur:tu_password@db.railway.app:5432/antartur
```

**¿Dónde obtenerla?**
- Si usas **Railway**: Ve a tu proyecto → PostgreSQL → Variables → Copia `DATABASE_URL`
- Si usas **Supabase**: Ve a Project Settings → Database → Connection String → URI
- Si usas **Neon**: Ve a Dashboard → Connection String → Copia la URI
- Si usas **Vercel Postgres**: Se configura automáticamente, pero puedes verla en Variables

**⚠️ IMPORTANTE:** 
- Asegúrate de usar la URL de **producción**, no la de desarrollo
- La URL debe ser accesible desde internet (no `localhost`)

---

### 🟡 **OPCIONALES** (Recomendadas para funcionalidad completa)

#### 2. `CONTACT_RECIPIENT_EMAIL` (Recomendado)
```
tu_email@antartur.tur.ar
```

**Uso:** Email donde recibirás los mensajes del formulario de contacto.

---

#### 3. Variables de Email (Elige una opción)

**Opción A: Gmail (Más fácil)**
```
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Opción B: SMTP Genérico**
```
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario_smtp
SMTP_PASS=tu_contraseña_smtp
SMTP_FROM=noreply@antartur.tur.ar
```

**Nota:** Si no configuras estas variables, el formulario funcionará pero los emails solo se loguearán en consola.

---

#### 4. `NEXT_PUBLIC_SITE_URL` (Recomendado)
```
https://antartur.tur.ar
```

**Uso:** URL pública de tu sitio en producción. Vercel la puede detectar automáticamente, pero es mejor configurarla explícitamente.

---

#### 5. Variables de reCAPTCHA (Opcional)
```
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key
```

**Nota:** Solo necesarias si quieres validación anti-spam en el formulario de contacto.

---

## 🔧 Cómo Configurar Variables en Vercel

### Paso 1: Ir a la Configuración del Proyecto

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings** (Configuración)
3. Click en **Environment Variables** (Variables de Entorno)

### Paso 2: Agregar Variables

Para cada variable:

1. Click en **Add New** (Agregar Nueva)
2. **Name:** Ingresa el nombre de la variable (ej: `DATABASE_URL`)
3. **Value:** Ingresa el valor de la variable
4. **Environments:** Selecciona dónde aplica:
   - ✅ **Production** (Producción)
   - ✅ **Preview** (Preview/Feature branches)
   - ✅ **Development** (Desarrollo - opcional)

5. Click en **Save**

### Paso 3: Redesplegar

Después de agregar las variables:

1. Ve a **Deployments**
2. Click en los **3 puntos** del último deployment
3. Selecciona **Redeploy**

O simplemente haz un nuevo push a tu branch.

---

## ✅ Checklist de Configuración

Marca las que hayas configurado:

- [ ] `DATABASE_URL` - ⚠️ **OBLIGATORIA**
- [ ] `CONTACT_RECIPIENT_EMAIL` - Recomendado
- [ ] Variables de Email (Gmail o SMTP) - Opcional
- [ ] `NEXT_PUBLIC_SITE_URL` - Recomendado
- [ ] Variables de reCAPTCHA - Opcional

---

## 🐛 Solución de Problemas

### Error: "Can't reach database server"

**Causa:** `DATABASE_URL` no está configurada o es incorrecta.

**Solución:**
1. Verifica que `DATABASE_URL` esté configurada en Vercel
2. Verifica que la URL sea accesible desde internet (no `localhost`)
3. Verifica que la base de datos permita conexiones externas
4. Redesplega después de agregar la variable

---

### Error: "Server Components render error"

**Causa:** Generalmente relacionado con:
- Base de datos no disponible
- Variables de entorno faltantes
- Error en el código del servidor

**Solución:**
1. Verifica los logs de Vercel (Deployments → Click en el deployment → View Function Logs)
2. Asegúrate de que `DATABASE_URL` esté configurada
3. Verifica que todas las variables requeridas estén configuradas
4. Revisa los logs del servidor para más detalles

---

### Error: "Failed to load resource: 400"

**Causa:** Puede ser un error de API o de configuración.

**Solución:**
1. Revisa los logs de Vercel
2. Verifica que las variables de entorno estén correctamente configuradas
3. Verifica que la base de datos esté accesible

---

## 📝 Ejemplo Completo de Configuración

Aquí tienes un ejemplo de cómo deberían verse tus variables en Vercel:

```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
CONTACT_RECIPIENT_EMAIL=agencias@antartur.tur.ar
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
NEXT_PUBLIC_SITE_URL=https://antartur.tur.ar
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=tu_site_key
RECAPTCHA_SECRET_KEY=tu_secret_key
```

---

## 🔗 Recursos Adicionales

- [Documentación de Vercel sobre Variables de Entorno](https://vercel.com/docs/concepts/projects/environment-variables)
- [Configuración de PostgreSQL en Vercel](https://vercel.com/docs/storage/vercel-postgres)
- [Guía de Email Setup](./EMAIL_SETUP.md)

---

## 💡 Tips

1. **Usa valores diferentes para Production y Preview:** Puedes tener una DB de desarrollo para preview y otra para producción.

2. **No commitees `.env`:** Las variables sensibles nunca deben estar en el código.

3. **Verifica los logs:** Si algo falla, los logs de Vercel te darán más información.

4. **Redesplega después de cambios:** Después de agregar/modificar variables, siempre redesplega.

