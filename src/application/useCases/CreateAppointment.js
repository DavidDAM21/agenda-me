/**
 * Caso de Uso: Crear Cita
 * Orquesta la creación de una nueva cita
 */
class CreateAppointment {
    constructor(appointmentService, config) {
        this.appointmentService = appointmentService;
        this.config = config;
    }

    /**
     * Ejecuta el caso de uso
     * @param {string} customerPhone 
     * @param {Date} startTime 
     * @param {number} durationMinutes 
     * @param {string} description 
     * @returns {Promise<Appointment>}
     */
    async execute(customerPhone, startTime, durationMinutes, description) {
        // Usar duración pasada o la por defecto
        const duration = durationMinutes || this.config.appointments.duration;

        const appointment = await this.appointmentService.createAppointment(
            customerPhone,
            startTime,
            duration,
            description
        );

        return appointment;
    }
}

module.exports = CreateAppointment;
