/**
 * Entidad: TimeSlot (Franja Horaria)
 * Representa un slot de tiempo disponible para reservas
 */
class TimeSlot {
    constructor(startTime, endTime, isAvailable = true) {
        this.startTime = startTime; // Date
        this.endTime = endTime;     // Date
        this.isAvailable = isAvailable;
    }

    /**
     * Obtiene la duración del slot en minutos
     */
    getDurationInMinutes() {
        return (this.endTime - this.startTime) / (1000 * 60);
    }

    /**
     * Verifica si este slot se solapa con otro
     */
    overlapsWith(otherSlot) {
        return this.startTime < otherSlot.endTime && this.endTime > otherSlot.startTime;
    }

    /**
     * Verifica si este slot contiene una fecha específica
     */
    contains(date) {
        return date >= this.startTime && date < this.endTime;
    }

    /**
     * Formatea el slot para mostrar al usuario
     */
    format() {
        const hours = this.startTime.getHours().toString().padStart(2, '0');
        const minutes = this.startTime.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Convierte a objeto plano
     */
    toJSON() {
        return {
            startTime: this.startTime.toISOString(),
            endTime: this.endTime.toISOString(),
            isAvailable: this.isAvailable,
            formatted: this.format()
        };
    }
}

module.exports = TimeSlot;
