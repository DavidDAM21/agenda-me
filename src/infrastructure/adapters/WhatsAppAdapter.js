const axios = require('axios');

/**
 * Adaptador de WhatsApp Cloud API
 * Maneja el envío de mensajes a través de WhatsApp
 */
class WhatsAppAdapter {
    constructor(config) {
        this.config = config;
        this.baseUrl = `https://graph.facebook.com/v21.0/${config.whatsapp.phoneNumberId}/messages`;
    }

    /**
     * Envía un mensaje de texto simple
     */
    async sendTextMessage(to, text) {
        try {
            await axios({
                method: 'POST',
                url: this.baseUrl,
                headers: {
                    'Authorization': `Bearer ${this.config.whatsapp.token}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'text',
                    text: { body: text }
                },
            });
            console.log(`Mensaje de texto enviado a ${to}`);
        } catch (error) {
            console.error('Error enviando mensaje:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envía un mensaje interactivo con botones
     */
    async sendInteractiveMessage(to, bodyText, buttons) {
        try {
            await axios({
                method: 'POST',
                url: this.baseUrl,
                headers: {
                    'Authorization': `Bearer ${this.config.whatsapp.token}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'button',
                        body: {
                            text: bodyText
                        },
                        action: {
                            buttons: buttons.map(btn => ({
                                type: 'reply',
                                reply: {
                                    id: btn.id,
                                    title: btn.title
                                }
                            }))
                        }
                    }
                },
            });
            console.log(`Mensaje interactivo enviado a ${to}`);
        } catch (error) {
            console.error('Error enviando mensaje interactivo:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envía un mensaje interactivo con lista de opciones (hasta 10)
     */
    async sendInteractiveListMessage(to, bodyText, buttonText, sections) {
        try {
            await axios({
                method: 'POST',
                url: this.baseUrl,
                headers: {
                    'Authorization': `Bearer ${this.config.whatsapp.token}`,
                    'Content-Type': 'application/json',
                },
                data: {
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'interactive',
                    interactive: {
                        type: 'list',
                        body: {
                            text: bodyText
                        },
                        action: {
                            button: buttonText,
                            sections: sections
                        }
                    }
                },
            });
            console.log(`Mensaje de lista enviado a ${to}`);
        } catch (error) {
            console.error('Error enviando mensaje de lista:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Envía mensaje de bienvenida
     */
    async sendWelcomeMessage(to) {
        await this.sendInteractiveMessage(
            to,
            '¡Hola! Soy Luis, tu peluquero de confianza💈\n\n¿Necesitas un corte? ¡Estoy aquí para ayudarte!',
            [{ id: 'btn_pedir_cita', title: '📅 Pedir Cita' }]
        );
    }

    /**
     * Envía opciones de servicios
     */
    async sendServiceOptions(to) {
        const services = this.config.appointments.services;
        const buttons = [
            { id: 'svc_corte', title: services.corte.name },
            { id: 'svc_corte_barba', title: services.corte_barba.name },
            { id: 'svc_completo', title: services.completo.name }
        ];

        await this.sendInteractiveMessage(
            to,
            '✂️ ¿Qué servicio necesitas hoy?',
            buttons
        );
    }

    /**
     * Envía opciones de día (con botón volver)
     * @param {string} to 
     * @param {Array<Date>} days - Lista de fechas disponibles
     * @param {string} serviceId 
     */
    async sendDayOptions(to, days, serviceId) {
        const options = days.map((date, index) => {
            const isToday = new Date().toDateString() === date.toDateString();
            const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === date.toDateString();

            let label = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });
            if (isToday) label = 'Hoy';
            if (isTomorrow) label = 'Mañana';

            // Capitalizar primera letra
            label = label.charAt(0).toUpperCase() + label.slice(1);

            // Calcular offset real en días desde hoy para mantener la lógica de IDs
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const dateNoTime = new Date(date);
            dateNoTime.setHours(0, 0, 0, 0);
            const diffTime = dateNoTime.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            return {
                id: `day_${diffDays}_${serviceId}`,
                title: label
            };
        });

        const backOption = { id: 'back_svc', title: '🔙 Volver' };

        // Si hay 3 opciones o menos (incluyendo volver), usamos botones
        if (options.length + 1 <= 3) {
            options.push(backOption);
            await this.sendInteractiveMessage(
                to,
                '📅 ¿Para qué día quieres la cita?',
                options
            );
        } else {
            // Si hay más, usamos lista
            // Añadimos volver a la lista
            options.push({
                id: backOption.id,
                title: backOption.title,
                description: 'Volver al menú anterior'
            });

            await this.sendInteractiveListMessage(
                to,
                '📅 ¿Para qué día quieres la cita?',
                'Ver Días',
                [
                    {
                        title: 'Días Disponibles',
                        rows: options
                    }
                ]
            );
        }
    }

    /**
     * Envía opciones de periodo (Mañana/Tarde)
     */
    async sendPeriodOptions(to, dayOffset, serviceId) {
        await this.sendInteractiveMessage(
            to,
            '🌞/🌜 ¿Prefieres por la mañana o por la tarde?',
            [
                { id: `per_m_${dayOffset}_${serviceId}`, title: 'Mañana (< 12h)' },
                { id: `per_t_${dayOffset}_${serviceId}`, title: 'Tarde (>= 12h)' },
                { id: `back_svc`, title: '🔙 Volver' } // Volver a servicios
            ]
        );
    }

    /**
     * Envía horarios disponibles
     */
    async sendTimeSlots(to, dayName, slots, serviceId, dayOffset, period) {
        const backButtonId = `back_day_${serviceId}`; // Volver a selección de día (o periodo)

        if (slots.length === 0) {
            await this.sendInteractiveMessage(
                to,
                `😔 Lo siento, no hay horarios disponibles por la ${period === 'm' ? 'mañana' : 'tarde'} para ese día.`,
                [{ id: backButtonId, title: '🔙 Volver' }]
            );
            return;
        }

        // Si hay 2 o menos, usamos botones normales + botón volver
        if (slots.length <= 2) {
            const buttons = slots.map(slot => ({
                id: slot.id,
                title: slot.title
            }));
            buttons.push({ id: backButtonId, title: '🔙 Volver' });

            await this.sendInteractiveMessage(
                to,
                `⏰ Horarios disponibles para ${dayName}:`,
                buttons
            );
        } else {
            // Si hay más de 2, usamos una lista
            const listRows = slots.slice(0, 9).map(slot => ({ // Max 10 rows total
                id: slot.id,
                title: slot.title
                // description: 'Disponible' // Eliminado por petición del usuario
            }));

            // Añadir opción de volver como un row especial o manejarlo de otra forma
            // En listas no se mezclan botones y rows fácilmente. 
            // Enviaremos la lista y luego un mensaje de texto con botón volver si es necesario, 
            // o incluimos "Volver" como una opción en la lista.
            listRows.push({
                id: backButtonId,
                title: '🔙 Volver Atrás',
                description: 'Elegir otro momento'
            });

            await this.sendInteractiveListMessage(
                to,
                `⏰ Hay ${slots.length} horarios disponibles. Selecciona uno:`,
                'Ver Horarios',
                [
                    {
                        title: 'Horarios Disponibles',
                        rows: listRows
                    }
                ]
            );
        }
    }

    /**
     * Envía confirmación de cita
     */
    async sendAppointmentConfirmation(to, appointment) {
        const formatted = appointment.format();
        const message = `✅ ¡Perfecto! Tu cita está confirmada:\n\n📅 ${formatted.date}\n⏰ ${formatted.time}\n✂️ Servicio: ${appointment.description}\n\n💈 Te espero en la peluquería. ¡Hasta pronto!`;
        await this.sendTextMessage(to, message);
    }
}

module.exports = WhatsAppAdapter;
