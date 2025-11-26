/**
 * Interface: ICalendarRepository
 * Define el contrato para acceder al calendario
 */
class ICalendarRepository {
    /**
     * Obtiene eventos del calendario en un rango de fechas
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Promise<Array>} Lista de eventos
     */
    async getEvents(startDate, endDate) {
        throw new Error('Method not implemented');
    }

    /**
     * Obtiene eventos de disponibilidad (DISPONIBLE) en un rango
     * @param {Date} startDate 
     * @param {Date} endDate 
     * @returns {Promise<Array>} Lista de eventos de disponibilidad
     */
    async getAvailabilityEvents(startDate, endDate) {
        throw new Error('Method not implemented');
    }

    /**
     * Crea un evento de cita en el calendario
     * @param {Appointment} appointment 
     * @returns {Promise<Object>} Evento creado
     */
    async createAppointment(appointment) {
        throw new Error('Method not implemented');
    }

    /**
     * Elimina un evento del calendario
     * @param {string} eventId 
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        throw new Error('Method not implemented');
    }
    /**
     * Busca eventos que contengan un texto específico
     * @param {string} text 
     * @param {Date} startDate 
     * @returns {Promise<Array>}
     */
    async findEventsByText(text, startDate) {
        throw new Error('Method not implemented');
    }
}

module.exports = ICalendarRepository;
