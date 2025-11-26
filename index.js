/**
 * Punto de Entrada de la Aplicación
 * Configuración de Dependencias e Inicio del Servidor
 */
require('dotenv').config();
const express = require('express');
const config = require('./src/infrastructure/config/environment');

// Infrastructure
const GoogleCalendarAdapter = require('./src/infrastructure/adapters/GoogleCalendarAdapter');
const WhatsAppAdapter = require('./src/infrastructure/adapters/WhatsAppAdapter');

// Domain Services
const AvailabilityService = require('./src/domain/services/AvailabilityService');
const AppointmentService = require('./src/domain/services/AppointmentService');

// Application Use Cases
const GetAvailableSlots = require('./src/application/useCases/GetAvailableSlots');
const CreateAppointment = require('./src/application/useCases/CreateAppointment');
const HandleUserMessage = require('./src/application/useCases/HandleUserMessage');

// Presentation
const WhatsAppWebhook = require('./src/presentation/webhooks/WhatsAppWebhook');

// ============================================
// DEPENDENCY INJECTION
// ============================================

// Adapters
const calendarAdapter = new GoogleCalendarAdapter(config);
const whatsappAdapter = new WhatsAppAdapter(config);

// Domain Services
const availabilityService = new AvailabilityService(calendarAdapter, config);
const appointmentService = new AppointmentService(calendarAdapter, availabilityService);

// Use Cases
const getAvailableSlotsUseCase = new GetAvailableSlots(availabilityService);
const createAppointmentUseCase = new CreateAppointment(appointmentService, config);
const handleUserMessageUseCase = new HandleUserMessage(
    getAvailableSlotsUseCase,
    createAppointmentUseCase,
    whatsappAdapter,
    config,
    appointmentService
);

// Webhook
const whatsappWebhook = new WhatsAppWebhook(handleUserMessageUseCase, config);

// ============================================
// EXPRESS SERVER
// ============================================

const app = express();
app.use(express.json());

// Webhook Verification (GET)
app.get('/webhook', (req, res) => {
    whatsappWebhook.handleVerification(req, res);
});

// Webhook Messages (POST)
app.post('/webhook', async (req, res) => {
    await whatsappWebhook.handleIncomingMessage(req, res);
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start Server
app.listen(config.port, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${config.port}`);
    console.log(`📅 Duración de citas: ${config.appointments.duration} minutos`);
    console.log(`🔑 Palabra clave de disponibilidad: "${config.calendar.availabilityKeyword}"`);
});