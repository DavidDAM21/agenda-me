// Script para autorizar Google Calendar por primera vez
require('dotenv').config();
const calendar = require('./calendar');

async function testAuth() {
    console.log('🔐 Iniciando autorización con Google Calendar...\n');

    try {
        const auth = await calendar.authorize();
        console.log('\n✅ Autorización exitosa!');
        console.log('El token se ha guardado en token.json');
        console.log('\nProbando obtener eventos...');

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const events = await calendar.getEvents(today, tomorrow);
        console.log(`\n📅 Eventos encontrados: ${events.length}`);

        if (events.length > 0) {
            events.forEach(event => {
                console.log(`  - ${event.summary} (${event.start.dateTime || event.start.date})`);
            });
        }

        console.log('\n✅ ¡Todo funciona correctamente!');
        console.log('Ya puedes usar el bot de WhatsApp con Google Calendar integrado.');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }

    process.exit(0);
}

testAuth();
