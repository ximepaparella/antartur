# 🚀 Configuración Rápida para Vercel

## ⚠️ Error Actual

El error que estás viendo:
```
Error: An error occurred in the Server Components render
```

**Causa:** Falta la variable de entorno `DATABASE_URL` en Vercel.

---

## ✅ Solución: Configurar Variables de Entorno

### Paso 1: Ir a Vercel Dashboard

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **antartur**
3. Click en **Settings** (⚙️)
4. Click en **Environment Variables**

### Paso 2: Agregar Variables Requeridas

#### 🔴 **OBLIGATORIA** - Sin esto el sitio no funcionará:

**`DATABASE_URL`**
- **Valor:** Tu URL de conexión a PostgreSQL
- **Formato:** `postgresql://usuario:contraseña@host:puerto/base_de_datos`
- **Ejemplo:** `postgresql://antartur:password@db.railway.app:5432/antartur`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

**¿Dónde obtenerla?**
- **Railway:** Proyecto → PostgreSQL → Variables → `DATABASE_URL`
- **Supabase:** Project Settings → Database → Connection String → URI
- **Neon:** Dashboard → Connection String → Copiar URI
- **Vercel Postgres:** Se configura automáticamente

---

#### 🟡 **RECOMENDADAS** (Para funcionalidad completa):

**`CONTACT_RECIPIENT_EMAIL`**
- **Valor:** `agencias@antartur.tur.ar`
- **Uso:** Email donde recibirás mensajes del formulario de contacto
- **Environments:** ✅ Production, ✅ Preview

**Variables de Email** (Elige una opción):

**Opción A - Gmail:**
```
GMAIL_USER=tu_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
```

**Opción B - SMTP:**
```
SMTP_HOST=smtp.tu-servidor.com
SMTP_PORT=587
SMTP_USER=tu_usuario
SMTP_PASSWORD=tu_contraseña
SMTP_FROM=noreply@antartur.tur.ar
```

**`NEXT_PUBLIC_SITE_URL`**
- **Valor:** `https://antartur.tur.ar` (o tu dominio de Vercel)
- **Environments:** ✅ Production, ✅ Preview

---

### Paso 3: Redesplegar

Después de agregar las variables:

1. Ve a **Deployments**
2. Click en los **3 puntos** (⋯) del último deployment
3. Selecciona **Redeploy**

O simplemente haz un nuevo push a tu branch.

---

## ✅ Checklist

- [ ] `DATABASE_URL` configurada ⚠️ **OBLIGATORIA**
- [ ] `CONTACT_RECIPIENT_EMAIL` configurada
- [ ] Variables de Email configuradas (Gmail o SMTP)
- [ ] `NEXT_PUBLIC_SITE_URL` configurada
- [ ] Deployment redesplegado

---

## 🐛 Verificar que Funciona

Después de redesplegar, visita:
- `https://tu-proyecto.vercel.app/` - Debe cargar sin errores
- `https://tu-proyecto.vercel.app/api/test-db` - Debe mostrar conexión exitosa

---

## 📝 Notas

- Las variables se aplican **después** de redesplegar
- Puedes tener valores diferentes para Production y Preview
- `DATABASE_URL` debe ser accesible desde internet (no `localhost`)

