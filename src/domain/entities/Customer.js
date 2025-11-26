/**
 * Entidad: Customer (Cliente)
 * Representa un cliente que interactúa con el bot
 */
class Customer {
    constructor(phoneNumber, name = null) {
        this.phoneNumber = phoneNumber;
        this.name = name;
        this.appointments = [];
    }

    /**
     * Agrega una cita al historial del cliente
     */
    addAppointment(appointment) {
        this.appointments.push(appointment);
    }

    /**
     * Obtiene las citas activas (no canceladas)
     */
    getActiveAppointments() {
        return this.appointments.filter(apt => apt.status !== 'cancelled');
    }

    /**
     * Obtiene el número de citas totales
     */
    getTotalAppointments() {
        return this.appointments.length;
    }

    /**
     * Convierte a objeto plano
     */
    toJSON() {
        return {
            phoneNumber: this.phoneNumber,
            name: this.name,
            totalAppointments: this.getTotalAppointments()
        };
    }
}

module.exports = Customer;
