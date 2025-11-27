/**
 * Caso de Uso: Manejar Mensaje de Usuario
 * Orquesta el flujo conversacional del bot
 */
class HandleUserMessage {
    constructor(getAvailableSlotsUseCase, createAppointmentUseCase, whatsappAdapter, config, appointmentService) {
        this.getAvailableSlotsUseCase = getAvailableSlotsUseCase;
        this.createAppointmentUseCase = createAppointmentUseCase;
        this.whatsappAdapter = whatsappAdapter;
        this.config = config;
        this.appointmentService = appointmentService;
    }

    /**
     * Maneja un mensaje de texto del usuario
     */
    async handleTextMessage(from) {
        try {
            console.log(`📩 Mensaje recibido de: ${from}`);
            // 1. Verificar si el usuario ya tiene citas futuras
            const appointments = await this.appointmentService.getUpcomingAppointments(from);

            if (appointments.length > 0) {
                console.log('🔄 Usuario tiene citas, mostrando menú de modificación');
                const nextAppointment = appointments[0]; // Tomamos la más próxima
                const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const dateStr = nextAppointment.start.toLocaleDateString('es-ES', dateOptions);

                await this.whatsappAdapter.sendInteractiveMessage(
                    from,
                    `👋 ¡Hola de nuevo! Tienes una cita programada para el *${dateStr}*.\n\n¿Qué te gustaría hacer?`,
                    [
                        { id: `cancel_${nextAppointment.id}`, title: '❌ Cancelar/Modificar' },
                        { id: 'btn_pedir_cita', title: '📅 Nueva Cita' }
                    ]
                );
            } else {
                // Si no tiene citas, mensaje de bienvenida normal
                await this.whatsappAdapter.sendWelcomeMessage(from);
            }
        } catch (error) {
            console.error('Error al verificar citas:', error);
            // Fallback a bienvenida normal si falla
            await this.whatsappAdapter.sendWelcomeMessage(from);
        }
    }

    /**
     * Maneja la respuesta de un botón o lista
     */
    async handleButtonResponse(from, buttonId) {
        console.log(`Interacción recibida: ${buttonId} por ${from}`);

        try {
            // 0. Cancelar cita existente (para modificar)
            if (buttonId.startsWith('cancel_')) {
                const appointmentId = buttonId.replace('cancel_', '');
                await this.appointmentService.cancelAppointment(appointmentId);
                await this.whatsappAdapter.sendTextMessage(from, '✅ Tu cita ha sido cancelada. Ahora puedes pedir una nueva.');
                await this.whatsappAdapter.sendServiceOptions(from);
            }

            // 1. Inicio: Pedir Cita -> Mostrar Servicios
            else if (buttonId === 'btn_pedir_cita' || buttonId === 'back_svc') {
                await this.whatsappAdapter.sendServiceOptions(from);
            }

            // 2. Selección de Servicio -> Mostrar Días (Inteligente)
            else if (buttonId.startsWith('svc_')) {
                const serviceId = buttonId.replace('svc_', '');
                await this._handleServiceSelection(from, serviceId);
            }

            // 3. Selección de Día -> Mostrar Periodos (Mañana/Tarde)
            else if (buttonId.startsWith('day_')) {
                // Formato: day_OFFSET_SERVICEID
                const parts = buttonId.split('_');
                const dayOffset = parseInt(parts[1]);
                const serviceId = parts.slice(2).join('_');

                await this.whatsappAdapter.sendPeriodOptions(from, dayOffset, serviceId);
            }

            // 4. Volver a selección de día
            else if (buttonId.startsWith('back_day_')) {
                const serviceId = buttonId.replace('back_day_', '');
                await this._handleServiceSelection(from, serviceId);
            }

            // 5. Selección de Periodo -> Mostrar Slots
            else if (buttonId.startsWith('per_')) {
                // Formato: per_PERIOD_OFFSET_SERVICEID
                const parts = buttonId.split('_');
                const period = parts[1]; // 'm' o 't'
                const dayOffset = parseInt(parts[2]);
                const serviceId = parts.slice(3).join('_');

                await this._handlePeriodSelection(from, period, dayOffset, serviceId);
            }

            // 6. Selección de Hora -> Confirmar Cita
            else if (buttonId.startsWith('sel_')) {
                // Formato: sel_OFFSET_HOUR_MINUTE_SERVICEID
                const parts = buttonId.split('_');
                const dayOffset = parseInt(parts[1]);
                const hour = parseInt(parts[2]);
                const minute = parseInt(parts[3]);
                const serviceId = parts.slice(4).join('_');

                await this._handleTimeSelection(from, dayOffset, hour, minute, serviceId);
            }

        } catch (error) {
            console.error('Error manejando interacción:', error);
            await this.whatsappAdapter.sendTextMessage(from, '❌ Ocurrió un error inesperado. Por favor, escribe "Hola" para empezar de nuevo.');
        }
    }

    /**
     * Maneja la selección de servicio y busca días disponibles
     * @private
     */
    async _handleServiceSelection(from, serviceId) {
        try {
            const service = this.config.appointments.services[serviceId];
            const duration = service ? service.duration : 30;

            // Buscar los próximos 3 días con disponibilidad real
            // Nota: getAvailableSlotsUseCase usa AvailabilityService, pero aquí necesitamos acceder a 
            // AvailabilityService directamente para getNextAvailableDays. 
            // Lo ideal sería exponerlo a través del caso de uso o inyectar el servicio.
            // Como ya inyectamos appointmentService, podemos acceder a availabilityService a través de él
            // o mejor, inyectar availabilityService en HandleUserMessage también.
            // Por simplicidad y tiempo, usaremos this.getAvailableSlotsUseCase.availabilityService si es accesible,
            // o asumiremos que getAvailableSlotsUseCase tiene el método (no lo tiene).
            // Vamos a usar this.appointmentService.availabilityService que sí lo tiene.

            const startDate = new Date();
            const availableDays = await this.appointmentService.availabilityService.getNextAvailableDays(startDate, 5, duration);

            if (availableDays.length === 0) {
                await this.whatsappAdapter.sendTextMessage(from, '😔 Lo siento, no he encontrado huecos disponibles en los próximos días. Por favor, contacta con Luis directamente.');
                return;
            }

            await this.whatsappAdapter.sendDayOptions(from, availableDays, serviceId);

        } catch (error) {
            console.error('Error buscando días disponibles:', error);
            await this.whatsappAdapter.sendTextMessage(from, '❌ Error al buscar disponibilidad. Intenta de nuevo.');
        }
    }

    /**
     * Maneja la selección de periodo y muestra los slots filtrados
     * @private
     */
    async _handlePeriodSelection(from, period, dayOffset, serviceId) {
        try {
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + dayOffset);

            // Obtener duración del servicio seleccionado
            const service = this.config.appointments.services[serviceId];
            const duration = service ? service.duration : 30;

            console.log(`Buscando slots para ${targetDate.toLocaleDateString()} con duración ${duration} min`);

            // Obtener todos los slots disponibles con la duración correcta
            const slots = await this.getAvailableSlotsUseCase.execute(targetDate, duration);

            // Filtrar por periodo (Mañana < 12:00, Tarde >= 12:00)
            const filteredSlots = slots.filter(slot => {
                const hour = slot.startTime.getHours();
                if (period === 'm') return hour < 12;
                return hour >= 12;
            });

            const dayNames = ['hoy', 'mañana', 'pasado mañana'];
            // Nota: dayOffset ya no es 0,1,2 fijo, puede ser mayor.
            // Calculamos el nombre del día dinámicamente si es necesario, pero sendTimeSlots usa dayName solo para mostrar.
            const dayName = targetDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });

            // Formatear para botones/lista
            const formattedSlots = filteredSlots.map(slot => ({
                id: `sel_${dayOffset}_${slot.startTime.getHours()}_${slot.startTime.getMinutes()}_${serviceId}`,
                title: slot.formatted
            }));

            await this.whatsappAdapter.sendTimeSlots(from, dayName, formattedSlots, serviceId, dayOffset, period);

        } catch (error) {
            console.error('Error obteniendo slots:', error);
            await this.whatsappAdapter.sendTextMessage(from, '❌ Hubo un error al obtener los horarios. Por favor, intenta de nuevo.');
        }
    }

    /**
     * Maneja la selección de horario y crea la cita
     * @private
     */
    async _handleTimeSelection(from, dayOffset, hour, minute, serviceId) {
        try {
            const appointmentDate = new Date();
            // Cuidado: dayOffset es relativo a HOY.
            // Si el usuario seleccionó un día lejano, dayOffset será grande.
            // Aseguramos que la fecha base es HOY sin hora.
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            appointmentDate.setTime(today.getTime());
            appointmentDate.setDate(today.getDate() + dayOffset);
            appointmentDate.setHours(hour, minute, 0, 0);

            // Obtener detalles del servicio
            const service = this.config.appointments.services[serviceId];
            const duration = service ? service.duration : 30;
            const description = service ? service.name : 'Cita';

            const appointment = await this.createAppointmentUseCase.execute(
                from,
                appointmentDate,
                duration,
                description
            );

            await this.whatsappAdapter.sendAppointmentConfirmation(from, appointment);

            console.log(`Cita confirmada para ${from}: ${description} el ${appointment.format().fullText}`);
        } catch (error) {
            console.error('Error creando cita:', error);
            await this.whatsappAdapter.sendTextMessage(from, '❌ Hubo un error al crear tu cita. Es posible que el horario ya no esté disponible.');
        }
    }
}

module.exports = HandleUserMessage;
