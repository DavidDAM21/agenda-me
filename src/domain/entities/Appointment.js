/**
 * Entidad: Appointment (Cita)
 * Representa una cita reservada por un cliente
 */
class Appointment {
    constructor(id, customerPhone, startTime, endTime, status = 'pending', description = '') {
        this.id = id;
        this.customerPhone = customerPhone;
        this.startTime = startTime; // Date
        this.endTime = endTime;     // Date
        this.status = status;       // pending, confirmed, cancelled
        this.description = description;
        this.createdAt = new Date();
    }

    /**
     * Confirma la cita
     */
    confirm() {
        this.status = 'confirmed';
    }

    /**
     * Cancela la cita
     */
    cancel() {
        this.status = 'cancelled';
    }

    /**
     * Verifica si la cita está confirmada
     */
    isConfirmed() {
        return this.status === 'confirmed';
    }

    /**
     * Obtiene la duración de la cita en minutos
     */
    getDurationInMinutes() {
        return (this.endTime - this.startTime) / (1000 * 60);
    }

    /**
     * Formatea la cita para mostrar al usuario
     */
    format() {
        const dateStr = this.startTime.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const timeStr = this.startTime.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        return {
            date: dateStr,
            time: timeStr,
            fullText: `${dateStr} a las ${timeStr}`
        };
    }

    /**
     * Convierte a objeto plano
     */
    toJSON() {
        return {
            id: this.id,
            customerPhone: this.customerPhone,
            startTime: this.startTime.toISOString(),
            endTime: this.endTime.toISOString(),
            status: this.status,
            description: this.description,
            createdAt: this.createdAt.toISOString()
        };
    }
}

module.exports = Appointment;
