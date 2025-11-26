/**
 * Script de prueba para verificar eventos DISPONIBLE
 */
require('dotenv').config();
const config = require('./src/infrastructure/config/environment');
const GoogleCalendarAdapter = require('./src/infrastructure/adapters/GoogleCalendarAdapter');
const AvailabilityService = require('./src/domain/services/AvailabilityService');

async function testAvailability() {
    console.log('🧪 Probando detección de eventos DISPONIBLE...\n');

    try {
        // Crear adaptador y servicio
        const calendarAdapter = new GoogleCalendarAdapter(config);
        const availabilityService = new AvailabilityService(calendarAdapter, config);

        // Probar para hoy
        const today = new Date();
        console.log(`📅 Fecha de prueba: ${today.toLocaleDateString('es-ES')}\n`);

        const slots = await availabilityService.getAvailableSlots(today);

        console.log(`\n✅ Resultado: ${slots.length} slots disponibles`);

        if (slots.length > 0) {
            console.log('\nPrimeros 5 slots:');
            slots.slice(0, 5).forEach(slot => {
                console.log(`  - ${slot.format()} (${slot.startTime.toLocaleString('es-ES')})`);
            });
        } else {
            console.log('\n⚠️  No se encontraron slots disponibles.');
            console.log('Verifica que:');
            console.log('  1. Tienes eventos "DISPONIBLE" en Google Calendar para hoy');
            console.log('  2. El archivo token.json existe (ejecuta: node test-calendar.js)');
            console.log('  3. La variable AVAILABILITY_EVENT_KEYWORD en .env es "DISPONIBLE"');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\nDetalles:', error);
    }

    process.exit(0);
}

testAvailability();
