/**
 * Configuración de Variables de Entorno
 */
require('dotenv').config();

const config = {
    // Server
    port: process.env.PORT || 3000,

    // WhatsApp
    whatsapp: {
        token: process.env.WHATSAPP_TOKEN,
        phoneNumberId: process.env.PHONE_NUMBER_ID,
        verifyToken: process.env.VERIFY_TOKEN,
    },

    // Google Calendar
    calendar: {
        calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
        availabilityKeyword: process.env.AVAILABILITY_EVENT_KEYWORD || 'DISPONIBLE',
    },

    // Appointments
    appointments: {
        duration: parseInt(process.env.APPOINTMENT_DURATION_MINUTES) || 30, // Default fallback
        services: {
            'corte': { name: 'Corte', duration: 30 },
            'corte_barba': { name: 'Corte + Barba', duration: 60 },
            'completo': { name: 'Completo', duration: 75 }
        }
    },
};

module.exports = config;
