/**
 * Caso de Uso: Obtener Slots Disponibles
 * Orquesta la obtención de horarios disponibles para una fecha
 */
class GetAvailableSlots {
    constructor(availabilityService) {
        this.availabilityService = availabilityService;
    }

    /**
     * Ejecuta el caso de uso
     * @param {Date} date - Fecha para buscar disponibilidad
     * @param {number} duration - Duración en minutos (opcional)
     * @returns {Promise<Array>} Lista de slots disponibles formateados
     */
    async execute(date, duration = 30) {
        const slots = await this.availabilityService.getAvailableSlots(date, duration);

        // Formatear slots para la presentación
        return slots.map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            formatted: slot.format(),
            isAvailable: slot.isAvailable
        }));
    }
}

module.exports = GetAvailableSlots;
