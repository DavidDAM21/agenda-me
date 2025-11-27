require('dotenv').config();

console.log('--- ENV CHECK ---');
console.log('WHATSAPP_TOKEN exists:', !!process.env.WHATSAPP_TOKEN);
if (process.env.WHATSAPP_TOKEN) {
    console.log('WHATSAPP_TOKEN length:', process.env.WHATSAPP_TOKEN.length);
    console.log('WHATSAPP_TOKEN starts with:', process.env.WHATSAPP_TOKEN.substring(0, 10));
} else {
    console.log('WHATSAPP_TOKEN is MISSING or EMPTY');
}
console.log('--- END CHECK ---');
