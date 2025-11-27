# 🚀 Guía Paso a Paso: Desplegar en Render.com

## Paso 1: Preparar Variables de Entorno

Ya ejecuté el script que genera las variables. **Guarda este output en un lugar seguro** (Notepad, etc.):

```
GOOGLE_CREDENTIALS={...contenido...}
GOOGLE_TOKEN={...contenido...}
```

También necesitarás estas variables de tu archivo `.env`:
- `WHATSAPP_TOKEN`
- `PHONE_NUMBER_ID`
- `VERIFY_TOKEN`
- `GOOGLE_CALENDAR_ID`
- `APPOINTMENT_DURATION_MINUTES`
- `AVAILABILITY_EVENT_KEYWORD`

---

## Paso 2: Subir a GitHub

### 2.1 Inicializar Git (si no lo has hecho)

```bash
git init
git add .
git commit -m "Initial commit - WhatsApp Bot"
```

### 2.2 Crear repositorio en GitHub

1. Ve a [github.com](https://github.com)
2. Click en "+" → "New repository"
3. Nombre: `agendame-bot` (o el que prefieras)
4. **Importante:** Marca como **Privado** (para proteger tu código)
5. NO añadas README, .gitignore ni licencia (ya los tienes)
6. Click "Create repository"

### 2.3 Conectar y subir

GitHub te dará comandos. Usa estos:

```bash
git remote add origin https://github.com/TU_USUARIO/agendame-bot.git
git branch -M main
git push -u origin main
```

---

## Paso 3: Configurar Render.com

### 3.1 Crear cuenta

1. Ve a [render.com](https://render.com)
2. Regístrate (puedes usar tu cuenta de GitHub)

### 3.2 Crear Web Service

1. Click en "New +" → "Web Service"
2. Conecta tu cuenta de GitHub
3. Selecciona el repositorio `agendame-bot`
4. Click "Connect"

### 3.3 Configurar el servicio

**Name:** `agendame-bot`

**Region:** Frankfurt (o el más cercano a España)

**Branch:** `main`

**Root Directory:** (dejar vacío)

**Environment:** `Node`

**Build Command:** `npm install`

**Start Command:** `npm start`

**Plan:** `Free`

### 3.4 Variables de Entorno

Antes de crear el servicio, scroll down hasta "Environment Variables" y añade:

```
PORT=3000
WHATSAPP_TOKEN=<tu_token>
PHONE_NUMBER_ID=870699999463815
VERIFY_TOKEN=peluqueria_secret_123
GOOGLE_CALENDAR_ID=primary
APPOINTMENT_DURATION_MINUTES=30
AVAILABILITY_EVENT_KEYWORD=DISPONIBLE
GOOGLE_CREDENTIALS=<pegar el JSON completo>
GOOGLE_TOKEN=<pegar el JSON completo>
```

**⚠️ IMPORTANTE:** Para `GOOGLE_CREDENTIALS` y `GOOGLE_TOKEN`, pega el JSON completo en una sola línea (sin saltos de línea).

### 3.5 Crear y Desplegar

1. Click "Create Web Service"
2. Espera 3-5 minutos mientras se despliega
3. Verás logs en tiempo real

---

## Paso 4: Actualizar Webhook de WhatsApp

### 4.1 Obtener URL de Render

Una vez desplegado, Render te dará una URL tipo:
```
https://agendame-bot.onrender.com
```

### 4.2 Configurar en Meta Developers

1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Selecciona tu app de WhatsApp
3. Menú lateral: **WhatsApp** → **Configuración**
4. En "Webhook", click **Editar**
5. **URL de devolución de llamada:** `https://agendame-bot.onrender.com/webhook`
6. **Token de verificación:** `peluqueria_secret_123`
7. Click **Verificar y guardar**

---

## Paso 5: Generar Token Permanente (Opcional pero Recomendado)

Los tokens temporales caducan cada 24h. Para producción:

1. En Meta Developers, ve a **Configuración del sistema**
2. Click en **Tokens de acceso**
3. Genera un **Token de acceso del sistema**
4. Copia el token
5. En Render, actualiza la variable `WHATSAPP_TOKEN` con el nuevo token

---

## Paso 6: Probar

1. Envía "Hola" a tu número de WhatsApp
2. Debería responder Luis con el botón de "Pedir Cita"
3. Prueba el flujo completo

---

## 🎉 ¡Listo!

Tu bot ahora está funcionando 24/7 en la nube.

### Notas Importantes

- **Sleep Mode:** El plan gratuito se duerme tras 15 min de inactividad. Se despierta automáticamente (~30s).
- **Logs:** Puedes ver logs en tiempo real en el dashboard de Render.
- **Actualizaciones:** Cada vez que hagas `git push`, Render desplegará automáticamente.

### Comandos Útiles

```bash
# Ver logs en Render
# (desde el dashboard web)

# Actualizar código
git add .
git commit -m "Descripción del cambio"
git push

# Render desplegará automáticamente
```
