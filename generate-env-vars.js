#!/usr/bin/env node

/**
 * Script para generar las variables de entorno de Google
 * para usar en Render.com
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Generando variables de entorno para Render...\n');

try {
    // Leer credentials.json
    const credentialsPath = path.join(__dirname, 'credentials.json');
    const credentials = fs.readFileSync(credentialsPath, 'utf8');

    // Leer token.json
    const tokenPath = path.join(__dirname, 'token.json');
    const token = fs.readFileSync(tokenPath, 'utf8');

    console.log('✅ Archivos leídos correctamente\n');
    console.log('📋 Copia estas variables en Render.com:\n');
    console.log('='.repeat(80));
    console.log('\nGOOGLE_CREDENTIALS=');
    console.log(credentials.trim());
    console.log('\n' + '='.repeat(80));
    console.log('\nGOOGLE_TOKEN=');
    console.log(token.trim());
    console.log('\n' + '='.repeat(80));
    console.log('\n✨ Listo! Copia y pega estas variables en el panel de Render\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Asegúrate de que credentials.json y token.json existen en la raíz del proyecto');
    process.exit(1);
}
