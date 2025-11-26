const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const ICalendarRepository = require('../../domain/repositories/ICalendarRepository');

/**
 * Adaptador de Google Calendar
 * Implementa ICalendarRepository usando la API de Google Calendar
 */
class GoogleCalendarAdapter extends ICalendarRepository {
    constructor(config) {
        super();
        this.config = config;
        this.SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.TOKEN_PATH = path.join(process.cwd(), 'token.json');
        this.CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
        this.authClient = null;
    }

    /**
     * Autoriza y obtiene el cliente OAuth2
     */
    async authorize() {
        if (this.authClient) {
            return this.authClient;
        }

        const credentials = JSON.parse(await fs.readFile(this.CREDENTIALS_PATH));
        const { client_secret, client_id, redirect_uris } = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

        try {
            const token = JSON.parse(await fs.readFile(this.TOKEN_PATH));
            oAuth2Client.setCredentials(token);
            this.authClient = oAuth2Client;
            return oAuth2Client;
        } catch (err) {
            throw new Error('No se encontró token.json. Ejecuta primero: node test-calendar.js');
        }
    }

    /**
     * Obtiene eventos del calendario en un rango de fechas
     */
    async getEvents(startDate, endDate) {
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: this.config.calendar.calendarId,
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
        });

        return response.data.items || [];
    }

    /**
     * Obtiene eventos de disponibilidad (DISPONIBLE)
     */
    async getAvailabilityEvents(startDate, endDate) {
        const allEvents = await this.getEvents(startDate, endDate);

        // Filtrar solo eventos que contengan la palabra clave de disponibilidad
        return allEvents.filter(event =>
            event.summary &&
            event.summary.toUpperCase().includes(this.config.calendar.availabilityKeyword.toUpperCase())
        );
    }

    /**
     * Crea un evento de cita en el calendario
     */
    async createAppointment(appointment) {
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });

        const event = {
            summary: `Cita - Cliente ${appointment.customerPhone}`,
            description: appointment.description,
            start: {
                dateTime: appointment.startTime.toISOString(),
                timeZone: 'Europe/Madrid',
            },
            end: {
                dateTime: appointment.endTime.toISOString(),
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
            calendarId: this.config.calendar.calendarId,
            resource: event,
        });

        return response.data;
    }

    /**
     * Elimina un evento del calendario
     */
    async deleteEvent(eventId) {
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });

        await calendar.events.delete({
            calendarId: this.config.calendar.calendarId,
            eventId: eventId,
        });
    }
    /**
     * Busca eventos que contengan un texto específico (ej: teléfono)
     */
    async findEventsByText(text, startDate) {
        console.log(`🔍 Buscando eventos en Calendar con texto: "${text}" desde ${startDate.toISOString()}`);
        const auth = await this.authorize();
        const calendar = google.calendar({ version: 'v3', auth });

        const response = await calendar.events.list({
            calendarId: this.config.calendar.calendarId,
            timeMin: startDate.toISOString(),
            q: text, // Búsqueda de texto libre
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items || [];
        console.log(`🔍 Encontrados ${events.length} eventos coincidentes`);
        return events;
    }
}

module.exports = GoogleCalendarAdapter;
