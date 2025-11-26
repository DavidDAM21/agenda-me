const Appointment = require('../entities/Appointment');
const { v4: uuidv4 } = require('uuid');

/**
 * Servicio de Dominio: AppointmentService
 * Maneja la lógica de negocio de las citas
 */
class AppointmentService {
    constructor(calendarRepository, availabilityService) {
        this.calendarRepository = calendarRepository;
        this.availabilityService = availabilityService;
    }

    /**
     * Crea una nueva cita
     * @param {string} customerPhone 
     * @param {Date} startTime 
     * @param {number} durationMinutes 
     * @param {string} description
     * @returns {Promise<Appointment>}
     */
    async createAppointment(customerPhone, startTime, durationMinutes, description) {
        const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

        // Validar que el slot esté disponible
        const TimeSlot = require('../entities/TimeSlot');
        const requestedSlot = new TimeSlot(startTime, endTime);

        const isAvailable = await this.availabilityService.isSlotAvailable(requestedSlot);

        if (!isAvailable) {
            throw new Error('El horario seleccionado ya no está disponible');
        }

        // Crear la cita
        const appointment = new Appointment(
            uuidv4(),
            customerPhone,
            startTime,
            endTime,
            'confirmed',
            description || `Cita reservada vía WhatsApp para ${customerPhone}`
        );

        // Guardar en el calendario
        await this.calendarRepository.createAppointment(appointment);

        return appointment;
    }

    /**
     * Cancela una cita existente
     * @param {string} appointmentId 
     * @returns {Promise<void>}
     */
    async cancelAppointment(appointmentId) {
        await this.calendarRepository.deleteEvent(appointmentId);
    }

    /**
     * Obtiene citas futuras de un cliente
     * @param {string} customerPhone 
     * @returns {Promise<Array>}
     */
    async getUpcomingAppointments(customerPhone) {
        const now = new Date();
        console.log(`🔎 Buscando citas futuras para: ${customerPhone}`);
        const events = await this.calendarRepository.findEventsByText(customerPhone, now);

        // Filtrar eventos que sean realmente citas (por si acaso el texto coincide con otra cosa)
        // y convertir a objetos Appointment si es necesario, o devolver estructura simple
        const appointments = events.map(event => ({
            id: event.id,
            summary: event.summary,
            start: new Date(event.start.dateTime || event.start.date),
            end: new Date(event.end.dateTime || event.end.date),
            description: event.description
        }));

        console.log(`✅ Citas encontradas: ${appointments.length}`);
        return appointments;
    }
}

module.exports = AppointmentService;
