# 💈 AgendaMe - Bot de WhatsApp para Peluquería

Bot de WhatsApp automatizado para gestionar citas de peluquería usando Google Calendar.

## 🚀 Características

- ✂️ Selección de servicios (Corte, Corte + Barba, Completo)
- 📅 Búsqueda inteligente de días disponibles
- ⏰ Filtrado por mañana/tarde
- 🔄 Gestión de citas existentes
- 📱 Interfaz conversacional en WhatsApp

## 📋 Requisitos

- Node.js >= 18.0.0
- Cuenta de WhatsApp Business
- Cuenta de Google Calendar
- Cuenta de Meta Developers

## 🔧 Configuración Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crear archivo `.env`:

```env
PORT=3000
WHATSAPP_TOKEN=tu_token_de_whatsapp
PHONE_NUMBER_ID=tu_phone_number_id
VERIFY_TOKEN=tu_verify_token
GOOGLE_CALENDAR_ID=primary
APPOINTMENT_DURATION_MINUTES=30
AVAILABILITY_EVENT_KEYWORD=DISPONIBLE
```

### 3. Configurar Google Calendar

1. Seguir las instrucciones en `google_calendar_setup.md`
2. Obtener `credentials.json` y `token.json`
3. Colocarlos en la raíz del proyecto

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

## 🌐 Despliegue en Producción (Render.com)

### Variables de Entorno Requeridas

Además de las variables del `.env`, añadir:

```env
GOOGLE_CREDENTIALS={"installed":{...}}  # Contenido de credentials.json
GOOGLE_TOKEN={"access_token":"..."}     # Contenido de token.json
```

### Pasos

1. Subir código a GitHub
2. Crear Web Service en Render.com
3. Configurar variables de entorno
4. Actualizar webhook de WhatsApp con URL de Render

## 📝 Estructura del Proyecto

```
src/
├── domain/          # Lógica de negocio
├── application/     # Casos de uso
├── infrastructure/  # Adaptadores externos
└── presentation/    # Webhooks y controladores
```

## 🔐 Seguridad

- No subir `credentials.json`, `token.json` o `.env` a GitHub
- Usar variables de entorno en producción
- Mantener tokens de WhatsApp actualizados

## 📞 Soporte

Para problemas o preguntas, contactar al desarrollador.
