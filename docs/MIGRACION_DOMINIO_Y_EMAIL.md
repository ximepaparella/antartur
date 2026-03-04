# Migración a antartur.tur.ar y correo con Google Workspace

Guía paso a paso para un developer: pasar el sitio al dominio definitivo en el nuevo VPS y configurar el correo con Google Workspace sin perder emails ni romper Outlook/celulares.

---

## 1. Resumen en pocas palabras

- **Situación actual:** El sitio nuevo (Next.js + Docker) está en el “nuevo VPS” con dominio **antartur.tur.ar**. El sitio viejo (WordPress) y los correos están en otro servidor (VPS antiguo con Ferozo), dominio **antartur.tur.ar**.
- **Objetivo:**  
  - Que **antartur.tur.ar** apunte al **nuevo VPS del cliente** y muestre el sitio Next.js (nginx + Docker).  
  - Que el **correo** de **@antartur.tur.ar** use **Google Workspace** (ya tenés dominio validado y casillas creadas).  
  - Que en **Outlook y celulares** sigan viendo todo el correo (viejo + nuevo) y puedan enviar/recibir con la cuenta de Google Workspace.

Para eso hacen falta dos cosas a nivel “internet”:

1. **DNS:** Decir “antartur.tur.ar va a esta IP” y “el correo de antartur.tur.ar lo recibe Google”.
2. **Migración de correo:** Pasar los emails existentes a Google (opcional pero recomendado) y después configurar Outlook/celulares para usar la cuenta de Google.

**Resultado final:** Te quedás con **un solo servidor de pago** (el nuevo VPS) + **Google Workspace** para el correo. El VPS viejo (Ferozo + WordPress + Apache) se puede **dar de baja** una vez terminada la migración, y así no pagar doble.

**Importante — Nuevo VPS de Don Web:** Ese servidor **no tiene panel Ferozo**. Solo tenés **acceso root por terminal** (SSH), con Ubuntu y Docker instalados. Todo lo que hagas en el nuevo VPS (clonar repo, .env, nginx, Certbot, docker compose) se hace por **terminal**. El panel Ferozo y el volumen/emails están en el **VPS viejo**, no en el de Don Web.

---

## 2. Qué es el DNS (en simple)

El DNS es como una guía: cuando alguien escribe **antartur.tur.ar** o envía un mail a **info@antartur.tur.ar**, los servidores preguntan “¿a qué IP / a qué servidor va esto?”. Esas respuestas se guardan en **registros DNS**.

- **Registro A:** “Para antartur.tur.ar (o www.antartur.tur.ar), ir a esta **IP**.”  
  → Lo usamos para que el **sitio web** apunte al nuevo VPS.
- **Registro MX:** “El correo de @antartur.tur.ar lo recibe **este servidor**.”  
  → Lo usamos para que **Google** reciba el correo (Google te da unos valores concretos).
- **Registros TXT (SPF, DKIM):** Sirven para que otros servidores confíen en que el correo que envía Google en nombre de @antartur.tur.ar es legítimo (menos spam, menos “no entregado”).

Quien **gestiona** esos registros es quien tiene la “zona DNS” del dominio. Puede ser:

- El **registrador** del dominio (donde compraste antartur.tur.ar), o  
- Un servicio de DNS (Don Web, Ferozo, Cloudflare, etc.) si en su momento configuraste que el dominio use **sus** servidores de nombres (NS).

Vos comentás que hoy el dominio “apunta a los DNS de Don Web” y que el **VPS viejo** (donde está el WordPress) tiene Ferozo, con volumen y panel. El **nuevo VPS de Don Web** no tiene Ferozo: solo terminal (root), Ubuntu y Docker. Habitualmente:

- Si el dominio usa **servidores DNS de Don Web**, los registros (A, MX, etc.) se editan en el **panel de Don Web** (gestión de DNS del dominio).
- Si el dominio usa **servidores DNS de Ferozo**, se editan en el **panel de Ferozo**.

No hace falta tocar nada “dentro” del VPS para “configurar la zona DNS”: la zona se configura siempre en ese panel (Don Web o Ferozo, el que esté como autoridad del dominio). En el **nuevo VPS** (Don Web) no hay panel web: solo preparás el sitio y el SSL por terminal; el DNS se hace desde Don Web o Ferozo, según donde esté la zona.

---

## 3. Dónde gestionar el DNS de antartur.tur.ar (y por qué no podés perderlo)

**Crítico:** Si hoy el DNS se gestiona desde el **panel del VPS viejo (Ferozo)**, al dar de baja ese servicio **perdés el panel y toda la configuración DNS**. El dominio quedaría sin control. El **primer paso** es que el DNS pase a un lugar que **sí vayas a mantener**: Don Web (donde tenés el nuevo VPS) o el registrador.

**3.1 Saber quién tiene la zona hoy** — En Don Web: Dominios → antartur.tur.ar → DNS / Zona. En el registrador del dominio suele decir "Servidores de nombres" (ej. ns1.ferozo.com o ns1.donweb.com). **Quien figure ahí tiene la zona.** Si son de Ferozo, la zona está en Ferozo; si son de Don Web, en Don Web.

**3.2 Si la zona está en Ferozo: migrar DNS a Don Web ANTES de dar de baja** — (1) En Don Web, prepará la zona DNS para antartur.tur.ar y anotá en Ferozo los registros actuales. (2) En el registrador del dominio, cambiá los **servidores de nombres** de antartur.tur.ar de Ferozo a los de **Don Web**. (3) En Don Web, cargá en la zona: A (y www) → IP del nuevo VPS; MX → Google Workspace; TXT si Google lo pide. (4) Esperá propagación. Recién **después** es seguro dar de baja el VPS viejo. Si no migrás la zona a Don Web antes de dar de baja Ferozo, al cancelar perdés el DNS.

**3.3 Si la zona ya está en Don Web** — Don Web → Dominios → antartur.tur.ar → DNS / Zona. Ahí agregás o modificás A, MX y TXT. Al dar de baja el VPS viejo, el DNS sigue en Don Web.

**3.4 IP del nuevo VPS** — La necesitás para los registros A. Es la **IP pública del nuevo VPS de Don Web** (Docker, Ubuntu), la que usás para SSH. Anotala: `__________` (completar con la IP real).

---

## 4. Orden recomendado (para hacer todo seguro)

0. **Si el DNS está hoy en Ferozo (panel del VPS viejo):** Primero **migrar la zona DNS a Don Web** (ver §3.2: cambiar nameservers en el registrador y cargar A, MX, TXT en Don Web). Si no hacés esto antes, al dar de baja el VPS viejo perdés el DNS.

1. **Primero correo (Google Workspace)**  
   - Cambiar los **MX** a los de Google.  
   - (Opcional) Migrar los emails viejos a Google.  
   - Reconfigurar Outlook y celulares para usar la cuenta de Google.  
   Así, cuando más adelante apaguemos el servidor viejo, el correo ya está en Google y nadie pierde nada.

2. **Después el sitio web**  
   - Cambiar los **A** (y si usás www, un CNAME o A de www) para que antartur.tur.ar y www apunten al nuevo VPS.  
   - En el nuevo VPS: configurar el sitio para antartur.tur.ar y pedir SSL (Certbot) para ese dominio.

Así evitás que, al cambiar el sitio, se corte el correo sin tener ya Google listo.

---

## 5. Paso a paso: DNS para correo (Google Workspace)

Google ya te dio los **registros MX** cuando validaste el dominio. Suelen ser algo así (los valores exactos los ves en Google Admin):

| Tipo | Nombre / Host           | Valor / Apunta a                    | Prioridad |
|------|-------------------------|-------------------------------------|-----------|
| MX   | @ (o antartur.tur.ar)   | aspmx.l.google.com                  | 5         |
| MX   | @                       | alt1.aspmx.l.google.com             | 10        |
| MX   | @                       | alt2.aspmx.l.google.com             | 10        |
| …    | (el resto que Google indique) | …                            | …         |

En el panel DNS:

1. Anotá los **MX actuales** (por si tenés que volver atrás).  
2. **Borrá** los MX viejos que apuntan al servidor de correo actual (Ferozo/servidor antiguo).  
3. **Creá** los MX que Google Admin te indica para antartur.tur.ar (suelen ser “@” o “antartur.tur.ar” como “nombre/host”).

La propagación puede tardar unos minutos hasta 48 horas. Después de eso, el correo **nuevo** que llegue a @antartur.tur.ar irá a Google. Los que ya están en Outlook/celular (descargados) no se borran; solo hay que “conectar” esas cuentas a Google (ver más abajo).

Opcional pero recomendable: en Google Admin, en la sección de **verificación de dominio**, te pueden dar registros **TXT** (SPF, DKIM). Copiá esos en el mismo panel DNS (crear registro TXT con el nombre y valor que indique Google). Eso mejora la entrega y evita que tu correo vaya a spam.

---

## 6. Migración de los emails existentes (que no se pierdan)

Los correos que **ya están** en las PCs (Outlook) o en los celulares están guardados ahí como copia. Para no “perderlos” y tener todo en un solo lugar (Google):

**Opción A – Migración con herramienta de Google (recomendada)**  
Si el servidor de correo actual (Ferozo/antiguo) permite **IMAP**:

1. En **Google Admin** (admin.google.com) o en **Gmail** (cuenta de Workspace):  
   Configuración → “Ver toda la configuración” → “Cuentas e importación” → “Importar correo y contactos”.
2. Ahí ponés el servidor IMAP del correo viejo (usuario, contraseña, servidor IMAP que te dé Ferozo/Don Web).
3. Google se conecta y **copia** todos los correos a la cuenta de Google. Los de la PC y el celular no se borran; solo estás haciendo una **copia** en Google.

Después de eso, en Outlook y en el celular podés **reconfigurar** la cuenta para que use Google (IMAP/SMTP de Gmail) y verás en Google todo lo migrado + lo nuevo.

**Opción B – Sin migración**  
Si no querés migrar ahora: solo cambiás los MX a Google. El correo **nuevo** irá a Google. El correo **viejo** sigue solo en Outlook/celulares (no se pierde). Más adelante podés migrar o dejarlo solo como histórico en esos dispositivos.

---

## 7. Reconfigurar Outlook y celulares para Google Workspace

Objetivo: que sigan **recibiendo y enviando** con la misma dirección @antartur.tur.ar, pero usando la cuenta de Google (así no pierden nada y todo queda centralizado).

**En el celular (Android / iPhone):**  
1. Agregar cuenta: “Correo” o “Cuentas” → “Añadir cuenta”.  
2. Elegir **Google** e iniciar sesión con la cuenta de Workspace (ej. info@antartur.tur.ar).  
3. Activar correo (y si quieren, calendario y contactos).  
4. Opcional: si antes tenían configurada la cuenta “antigua” de antartur.tur.ar, pueden quitarla cuando ya no la usen (después de migrar y de estar seguros de que todo llega a Google).

**En Outlook (PC):**  
1. Agregar cuenta: Archivo → Agregar cuenta.  
2. Poner la dirección de Google Workspace (ej. info@antartur.tur.ar) y elegir “Iniciar sesión con Google” (o configurar manualmente como IMAP).  
3. Si Outlook pide servidor IMAP/SMTP de Gmail:
   - IMAP: imap.gmail.com, puerto 993 (SSL).  
   - SMTP: smtp.gmail.com, puerto 587 (TLS).  
   - Usuario: la cuenta completa (ej. info@antartur.tur.ar).  
   - Contraseña: en Google Workspace suele ser la contraseña de la cuenta, o una “contraseña de aplicación” si tienen 2 pasos activado (igual que en Gmail normal).

Los correos que ya tenían en Outlook/celular (descargados) siguen en el dispositivo. Los que migraste a Google aparecerán cuando abran la cuenta de Google en ese mismo Outlook/celular (porque ahora están en el servidor de Google).

---

## 8. Paso a paso: DNS para el sitio web (antartur.tur.ar al nuevo VPS)

Cuando quieras que **antartur.tur.ar** muestre el sitio del nuevo VPS:

1. En el **mismo** panel DNS donde tocaste los MX:
   - Buscá los registros **A** de **antartur.tur.ar** y de **www** (o el CNAME de www).
   - Anotá los valores actuales (IP del WordPress viejo).
   - **Modificá** (o creá si no existen):
     - **A** para **@** (o “antartur.tur.ar”) → IP del **nuevo VPS**.
     - **A** para **www** (o CNAME www → antartur.tur.ar) → misma IP del nuevo VPS (o CNAME a antartur.tur.ar, según cómo lo tengas).

2. Guardá los cambios. La propagación suele ser entre unos minutos y 24–48 h.  
   Podés comprobar con: `ping antartur.tur.ar` (debería responder con la IP del nuevo VPS).

Cuando el dominio ya apunte al nuevo VPS, el **sitio** que se sirva será el que esté configurado en ese VPS (stack Docker: **nginx** como reverse proxy + Next.js). El WordPress del servidor viejo (Ferozo + Apache) dejará de ser accesible por antartur.tur.ar (pero podés dejarlo un tiempo en la IP vieja si necesitás consultar algo).

---

## 9. SSL en el nuevo VPS para antartur.tur.ar

El SSL del WordPress viejo está en el servidor viejo. En el **nuevo** VPS tenés que generar certificados **nuevos** para antartur.tur.ar (por ejemplo con Let’s Encrypt).

1. En el **nuevo VPS**, en el proyecto (ej. `/var/www/antartur`):
   - Asegurate de que en el **.env** (o en la config que use docker-compose) tengas:
     - `SITE_URL=https://antartur.tur.ar`  
     - (y si usás `NEXT_PUBLIC_SITE_URL`, también `https://antartur.tur.ar`).
   - Que **nginx** (o el proxy que use tu Docker) esté configurado para el **dominio** `antartur.tur.ar`. El repo incluye nginx y Certbot para antartur.tur.ar; si tu script o compose usa otro dominio para Certbot, cambialo a antartur.tur.ar.

2. **Solo cuando** el DNS de antartur.tur.ar ya apunte a la IP del nuevo VPS:
   - Ejecutá el script de SSL que usás (ej. el de la doc de deploy):
     ```bash
     # Ejemplo si tenés script
     ./scripts/init-ssl.sh
     ```
   - O, si usás Certbot a mano, algo como:
     ```bash
     certbot certonly --webroot -w /ruta/al/webroot -d antartur.tur.ar -d www.antartur.tur.ar
     ```
   - Luego recargar nginx para que use los certificados nuevos.

Si el script o el compose están pensados para “antartur.tur.ar”, verificá la config de nginx y el comando de Certbot en el repo.

---

## 10. Resumen de pasos y checklist

| Orden | Qué hacer | Dónde |
|-------|-----------|--------|
| 0 | Si el DNS está en Ferozo: migrar zona DNS a Don Web (nameservers + registros A, MX, TXT) antes de todo | Registrador + Don Web (§3.2) |
| 1 | Anotar IP del nuevo VPS | Panel Don Web / SSH |
| 2 | Entrar al panel DNS del dominio antartur.tur.ar (en Don Web, una vez migrada la zona) | Don Web |
| 3 | Reemplazar MX por los de Google Workspace | Panel DNS |
| 4 | (Opcional) Añadir TXT SPF/DKIM que indique Google | Panel DNS |
| 5 | (Opcional) Migrar correos viejos a Google (IMAP) | Gmail / Google Admin |
| 6 | Reconfigurar Outlook y celulares con cuenta Google Workspace | Cada PC y celular |
| 7 | Cambiar registros A (y www) de antartur.tur.ar a la IP del nuevo VPS | Panel DNS |
| 8 | En el nuevo VPS: .env con SITE_URL=https://antartur.tur.ar | SSH al VPS |
| 9 | En el repo y en el nuevo VPS: nginx + init-ssl con dominio antartur.tur.ar (ver §9.1 y §9.2) | Repo + SSH al nuevo VPS |
| 10 | Cuando el DNS ya apunte al nuevo VPS: generar SSL (init-ssl o certbot) | SSH al VPS |
| 11 | Rebuild/restart del stack Docker si hace falta | SSH al VPS |

---

## 11. Sobre “la zona DNS en el nuevo VPS”

La **zona DNS** (los registros A, MX, TXT) **no** se configura “dentro” del nuevo VPS. El VPS solo:

- Tiene una **IP pública**.
- Sirve el sitio con **nginx** (puertos 80 y 443) como reverse proxy hacia la app Next.js en Docker.

Vos, desde **fuera** del VPS (panel de Don Web o Ferozo), decidís “antartur.tur.ar → esta IP”. Eso es DNS. El nuevo VPS no “tiene” la zona DNS; solo **recibe** el tráfico cuando el DNS ya apunta a su IP.

Si en Don Web al dar de alta el “nuevo cloud” te dieron solo el servidor (Ubuntu + Docker), la gestión del dominio antartur.tur.ar seguirá siendo donde hoy está (Don Web DNS o Ferozo). No hace falta instalar un “servidor DNS” en el VPS para este caso.

---

## 12. Dar de baja el VPS viejo (quedarse solo con el nuevo)

Sí, se puede y es el objetivo: **un solo VPS** (el nuevo) + **Google Workspace** para el correo. No hace falta mantener el VPS viejo.

### Por qué no lo necesitás después de migrar

- **Sitio web:** Una vez que los registros **A** de antartur.tur.ar apuntan al nuevo VPS, el tráfico va al nuevo. El WordPress del viejo deja de ser usado.
- **Correo:** Los **MX** apuntan a **Google**, no al VPS. El correo lo recibe y envía Google Workspace; el servidor de correo que estaba en el VPS viejo (Ferozo) ya no interviene. No hay que "hostear" correo en el nuevo VPS.

Así que, terminada la migración, el VPS viejo no cumple ningún rol: podés darlo de baja y dejar de pagar ese servicio.

### Antes de darlo de baja: qué guardar (opcional)

Por si en el futuro necesitás algo del WordPress o del servidor viejo:

1. **Backup del WordPress:** Export de la base de datos (MySQL/MariaDB) y copia de la carpeta del sitio (por ejemplo `wp-content`, temas, plugins). Podés usar el panel de Ferozo o SSH al VPS viejo y hacer un `mysqldump` + copia de archivos a tu PC o a un disco.
2. **Correos ya migrados:** Si hiciste la importación a Google (IMAP), los correos ya están en Google. Los que quedaron solo en Outlook/celulares están en esos dispositivos. Si querés un respaldo extra, exportá desde Outlook o desde el cliente de correo del servidor viejo (si Ferozo te da acceso) a archivos .pst o similar antes de cortar.

No hace falta guardar "el servidor entero"; solo lo que creas que podrías consultar más adelante (contenido del sitio viejo, por ejemplo).

### Cuándo está bien darlo de baja

- Los **MX** ya apuntan a Google y el equipo ya usa Google Workspace (reciben y envían bien).
- Los **A** (y www) ya apuntan al **nuevo VPS** y antartur.tur.ar abre el sitio Next.js con SSL.
- Opcional: ya hiciste el backup del WordPress / datos que quieras conservar.

Cuando eso esté verificado, podés dar de baja el VPS viejo desde el panel de Ferozo / Don Web (o quien lo facture). **Importante:** Solo es seguro dar de baja el VPS viejo si **antes** ya migraste el DNS a Don Web (§3.2). Si el DNS seguía en Ferozo, al cancelar perdés el panel y el control del dominio; por eso la migración de la zona DNS tiene que ser el primer paso.

### Resumen

| Qué | Dónde queda |
|-----|----------------|
| Sitio antartur.tur.ar | **Nuevo VPS** (nginx + Next.js en Docker) |
| Correo @antartur.tur.ar | **Google Workspace** (no en ningún VPS) |
| DNS del dominio | **Don Web** (tenés que migrarlo acá desde Ferozo antes de dar de baja el VPS viejo; ver §3.2) |
| VPS viejo | **Se da de baja** solo después de haber migrado el DNS a Don Web → dejas de pagar ese servicio |

---

## 13. Referencias en este repo

- Deploy general en el VPS: [VPS_DEPLOY.md](./VPS_DEPLOY.md)  
- Variables de entorno (incl. email y sitio): [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)  
- Configuración de email de la app (formulario de contacto, etc.): [EMAIL_SETUP.md](./EMAIL_SETUP.md)  

Para que la **app** envíe correos (formulario de contacto, reservas, etc.) desde el nuevo VPS usando Google Workspace, en el `.env` del servidor podés usar las mismas cuentas de Workspace con “Contraseña de aplicación” (como en EMAIL_SETUP) o SMTP de Google; eso es independiente de que la gente use Outlook/celular para leer su correo.

Si querés, en un siguiente paso podemos bajar esto a tu caso concreto: qué panel usás (Don Web / Ferozo) para el DNS de antartur.tur.ar, y los valores exactos que tenés que poner en cada registro (A, MX, TXT) con la IP del nuevo VPS del cliente.
