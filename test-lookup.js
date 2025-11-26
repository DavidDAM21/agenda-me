/**
 * Script de prueba para verificar búsqueda de citas
 */
require('dotenv').config();
const config = require('./src/infrastructure/config/environment');
const GoogleCalendarAdapter = require('./src/infrastructure/adapters/GoogleCalendarAdapter');
const AppointmentService = require('./src/domain/services/AppointmentService');

async function testAppointmentLookup() {
    console.log('🧪 Probando búsqueda de citas...\n');

    // Número de teléfono a buscar (simulado)
    // Intenta usar uno que sepas que tiene cita, o usa un argumento
    const phoneNumber = process.argv[2] || '34600000000';
    console.log(`📞 Buscando citas para: ${phoneNumber}`);

    try {
        const calendarAdapter = new GoogleCalendarAdapter(config);
        // Mock availability service as it's not needed for this test
        const mockAvailabilityService = {};
        const appointmentService = new AppointmentService(calendarAdapter, mockAvailabilityService);

        const appointments = await appointmentService.getUpcomingAppointments(phoneNumber);

        console.log(`\n✅ Resultado: ${appointments.length} citas encontradas`);

        if (appointments.length > 0) {
            appointments.forEach(app => {
                console.log(`  - [${app.id}] ${app.summary} (${app.start.toLocaleString()})`);
            });
        } else {
            console.log('\n⚠️  No se encontraron citas.');
            console.log('Asegúrate de que el evento en Google Calendar contiene el número de teléfono en el título o descripción.');
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    }

    process.exit(0);
}

testAppointmentLookup();
