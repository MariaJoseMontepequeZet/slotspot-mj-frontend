export const CampusStorage = {
    init() {
        // Tipos de vehículos por defecto
        if (!localStorage.getItem('cp_types')) {
            const types = [
                { codigo: 'MOT', nombre: 'Moto', tarifa: '5.00' },
                { codigo: 'AUT', nombre: 'Automóvil', tarifa: '15.00' },
                { codigo: 'CAM', nombre: 'Camioneta', tarifa: '20.00' },
                { codigo: 'BIC', nombre: 'Bicicleta', tarifa: '2.00' },
                { codigo: 'SCO', nombre: 'Scooter', tarifa: '3.00' },
            ];
            localStorage.setItem('cp_types', JSON.stringify(types));
        }

        // Servicios vacíos
        if (!localStorage.getItem('cp_services')) localStorage.setItem('cp_services', '[]');

        // Usuario administrador por defecto
        if (!localStorage.getItem('cp_user')) {
            const user = {
                nombre: 'Administrador',
                email: 'admin@slotspotmj.com',
                password: 'Admin123',
            };
            localStorage.setItem('cp_user', JSON.stringify(user));
        }
    },
};
