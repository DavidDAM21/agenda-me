const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

// Configuración
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');

/**
 * Carga las credenciales del cliente desde el archivo
 */
async function loadCredentials() {
    const content = await fs.readFile(CREDENTIALS_PATH);
    return JSON.parse(content);
}

/**
 * Guarda el token de autorización
 */
async function saveToken(token) {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token));
}

/**
 * Carga el token guardado si existe
 */
async function loadToken() {
    try {
        const content = await fs.readFile(TOKEN_PATH);
        return JSON.parse(content);
    } catch (err) {
        return null;
    }
}

/**
 * Obtiene un cliente OAuth2 autenticado
 */
async function authorize() {
    const credentials = await loadCredentials();
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Intentar cargar token guardado
    const token = await loadToken();
    if (token) {
        oAuth2Client.setCredentials(token);
        return oAuth2Client;
    }

    // Si no hay token, necesitamos autorización
    return getNewToken(oAuth2Client);
}

/**
 * Obtiene un nuevo token de autorización
 */
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    console.log('\n🔐 AUTORIZACIÓN REQUERIDA');
    console.log('Por favor, abre este enlace en tu navegador:\n');
    console.log(authUrl);
    console.log('\nDespués de autorizar, copia el código de la URL y pégalo aquí.');
    console.log('Esperando código de autorización...\n');

    // En un entorno de producción, usarías readline o un servidor web
    // Por ahora, retornamos una promesa que se resolverá manualmente
    return new Promise((resolve, reject) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        readline.question('Ingresa el código de autorización: ', async (code) => {
            readline.close();
            try {
                const { tokens } = await oAuth2Client.getToken(code);
                oAuth2Client.setCredentials(tokens);
                await saveToken(tokens);
                console.log('✅ Token guardado exitosamente!');
                resolve(oAuth2Client);
            } catch (err) {
                console.error('❌ Error obteniendo token:', err);
                reject(err);
            }
        });
    });
}

/**
 * Obtiene eventos del calendario en un rango de fechas
 */
async function getEvents(startDate, endDate) {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    return response.data.items || [];
}

/**
 * Obtiene horarios disponibles para un día específico
 * @param {Date} date - Fecha para buscar horarios
 * @param {number} slotDuration - Duración de cada slot en minutos (default: 30)
 * @param {string} startHour - Hora de inicio (formato HH:MM, default: '09:00')
 * @param {string} endHour - Hora de fin (formato HH:MM, default: '20:00')
 */
async function getAvailableSlots(date, slotDuration = 30, startHour = '09:00', endHour = '20:00') {
    // Configurar inicio y fin del día
    const dayStart = new Date(date);
    const [startH, startM] = startHour.split(':');
    dayStart.setHours(parseInt(startH), parseInt(startM), 0, 0);

    const dayEnd = new Date(date);
    const [endH, endM] = endHour.split(':');
    dayEnd.setHours(parseInt(endH), parseInt(endM), 0, 0);

    // Obtener eventos existentes
    const events = await getEvents(dayStart, dayEnd);

    // Generar todos los slots posibles
    const allSlots = [];
    let currentSlot = new Date(dayStart);

    while (currentSlot < dayEnd) {
        allSlots.push(new Date(currentSlot));
        currentSlot = new Date(currentSlot.getTime() + slotDuration * 60000);
    }

    // Filtrar slots disponibles (que no se solapen con eventos)
    const availableSlots = allSlots.filter(slot => {
        const slotEnd = new Date(slot.getTime() + slotDuration * 60000);

        return !events.some(event => {
            const eventStart = new Date(event.start.dateTime || event.start.date);
            const eventEnd = new Date(event.end.dateTime || event.end.date);

            // Verificar si hay solapamiento
            return (slot < eventEnd && slotEnd > eventStart);
        });
    });

    return availableSlots;
}

/**
 * Crea un evento en el calendario
 */
async function createAppointment(summary, startTime, endTime, description = '') {
    const auth = await authorize();
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
        summary: summary,
        description: description,
        start: {
            dateTime: startTime.toISOString(),
            timeZone: 'Europe/Madrid',
        },
        end: {
            dateTime: endTime.toISOString(),
            timeZone: 'Europe/Madrid',
        },
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'popup', minutes: 60 },
            ],
        },
    };

    const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        resource: event,
    });

    return response.data;
}

module.exports = {
    authorize,
    getEvents,
    getAvailableSlots,
    createAppointment,
};
