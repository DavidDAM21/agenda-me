const TimeSlot = require('../entities/TimeSlot');

/**
 * Servicio de Dominio: AvailabilityService
 * Maneja la lógica de disponibilidad de horarios
 */
class AvailabilityService {
    constructor(calendarRepository, config) {
        this.calendarRepository = calendarRepository;
        this.config = config;
    }

    /**
     * Obtiene los slots disponibles para una fecha específica
     * @param {Date} date - Fecha para buscar disponibilidad
     * @param {number} durationMinutes - Duración de la cita en minutos
     * @returns {Promise<TimeSlot[]>} Lista de slots disponibles
     */
    async getAvailableSlots(date, durationMinutes = 30) {
        // 1. Definir inicio y fin del día
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        console.log(`🔍 Buscando disponibilidad para: ${date.toLocaleDateString('es-ES')}`);
        console.log(`   Rango: ${dayStart.toISOString()} - ${dayEnd.toISOString()}`);

        // 2. Obtener eventos de disponibilidad (DISPONIBLE)
        const availabilityEvents = await this.calendarRepository.getAvailabilityEvents(dayStart, dayEnd);

        console.log(`📅 Eventos DISPONIBLE encontrados: ${availabilityEvents.length}`);
        availabilityEvents.forEach(event => {
            console.log(`   - ${event.summary}: ${event.start.dateTime || event.start.date} - ${event.end.dateTime || event.end.date}`);
        });

        if (availabilityEvents.length === 0) {
            // No hay franjas configuradas para este día
            console.log('❌ No hay franjas DISPONIBLE para este día');
            return [];
        }

        // 3. Convertir eventos de disponibilidad a TimeSlots
        const availabilitySlots = this._convertEventsToTimeSlots(availabilityEvents);

        // 4. Dividir cada franja en slots de duración configurada
        const allPossibleSlots = this._divideIntoSlots(availabilitySlots, durationMinutes);
        console.log(`⏰ Slots generados: ${allPossibleSlots.length}`);

        // 5. Obtener citas existentes
        const existingAppointments = await this.calendarRepository.getEvents(dayStart, dayEnd);
        const bookedSlots = this._convertEventsToTimeSlots(
            existingAppointments.filter(event => event.summary !== this.config.calendar.availabilityKeyword)
        );
        console.log(`🔒 Slots ocupados: ${bookedSlots.length}`);

        // 6. Filtrar slots que no se solapen con citas existentes
        const availableSlots = allPossibleSlots.filter(slot => {
            return !bookedSlots.some(bookedSlot => slot.overlapsWith(bookedSlot));
        });

        console.log(`✅ Slots disponibles: ${availableSlots.length}`);
        availableSlots.slice(0, 3).forEach(slot => {
            console.log(`   - ${slot.format()}`);
        });

        return availableSlots;
    }

    /**
     * Convierte eventos del calendario a TimeSlots
     * @private
     */
    _convertEventsToTimeSlots(events) {
        return events.map(event => {
            const startTime = new Date(event.start.dateTime || event.start.date);
            const endTime = new Date(event.end.dateTime || event.end.date);
            return new TimeSlot(startTime, endTime, true);
        });
    }

    /**
     * Divide franjas de disponibilidad en slots de duración específica
     * @private
     */
    _divideIntoSlots(availabilitySlots, durationMinutes) {
        const slots = [];
        const slotDuration = durationMinutes; // en minutos

        console.log(`   Duración de slot solicitada: ${slotDuration} minutos`);

        availabilitySlots.forEach(availabilitySlot => {
            let currentTime = new Date(availabilitySlot.startTime);
            const endTime = availabilitySlot.endTime;

            console.log(`   Dividiendo franja: ${currentTime.toLocaleTimeString('es-ES')} - ${endTime.toLocaleTimeString('es-ES')}`);

            while (currentTime < endTime) {
                const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

                // Solo agregar si el slot completo cabe en la franja de disponibilidad
                if (slotEnd <= endTime) {
                    slots.push(new TimeSlot(new Date(currentTime), slotEnd, true));
                }

                currentTime = slotEnd;
            }
        });

        return slots;
    }

    /**
     * Verifica si un slot específico está disponible
     * @param {TimeSlot} slot 
     * @returns {Promise<boolean>}
     */
    async isSlotAvailable(slot) {
        const availableSlots = await this.getAvailableSlots(slot.startTime);
        return availableSlots.some(availableSlot =>
            availableSlot.startTime.getTime() === slot.startTime.getTime()
        );
    }

    /**
     * Busca los próximos N días con disponibilidad
     * @param {Date} startDate 
     * @param {number} count 
     * @param {number} duration 
     * @returns {Promise<Date[]>}
     */
    async getNextAvailableDays(startDate, count = 3, duration = 30) {
        const availableDays = [];
        let currentCheckDate = new Date(startDate);
        let checks = 0;
        const maxChecks = 14; // Límite de seguridad para no buclear infinitamente

        while (availableDays.length < count && checks < maxChecks) {
            const slots = await this.getAvailableSlots(currentCheckDate, duration);
            if (slots.length > 0) {
                availableDays.push(new Date(currentCheckDate));
            }
            currentCheckDate.setDate(currentCheckDate.getDate() + 1);
            checks++;
        }

        return availableDays;
    }
}

module.exports = AvailabilityService;
