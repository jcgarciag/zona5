// --- BASE DE DATOS DE EVENTOS ---
const eventos = [
    {
        id: "briceno",
        fecha: "15/03/26", modalidad: "Individual", evento: "Briceño", handicap: "Ventaja individual con el PR",
        subida: "No aplica", crono: "Biceño-Almaviva",
        links: [{nombre: "Ver Segmento Crono", url: "https://tinyurl.com/yyjanar6"}],
        resultados: [
            { pos: 1, nombre: "Jaime Beltrán", tiempo: "12:34", puntos: 50 },
            { pos: 2, nombre: "Sergio Esteban García", tiempo: "13:01", puntos: 40 },
            { pos: 3, nombre: "Simon Balsero", tiempo: "13:15", puntos: 30 }
        ]
    },
    {
        id: "chiquinquira",
        fecha: "05/04/26", modalidad: "Individual", evento: "Chiquinquirá", handicap: "Ventaja individual con el PR",
        subida: "Tierra Negra y Palestina", crono: "No aplica",
        links: [{nombre: "Enlace Subida 1", url: "https://tinyurl.com/nac7ypu5"}, {nombre: "Enlace Subida 2", url: "https://tinyurl.com/y9wbymev"}],
        resultados: []
    },
    {
        id: "neusa-margaritas",
        fecha: "17/05/26", modalidad: "Equipos", evento: "Neusa-Margaritas", handicap: "Suma de tiempos",
        subida: "Neusa", crono: "No aplica",
        links: [{nombre: "Enlace Subida", url: "https://tinyurl.com/mhjhcue3"}],
        resultados: []
    },
    {
        id: "colombia-challenge",
        fecha: "20/07/26", modalidad: "Individual", evento: "Colombia Challenge", handicap: "Ventaja individual con el PR",
        subida: "Romeral", crono: "No aplica",
        links: [{nombre: "Enlace Subida", url: "https://tinyurl.com/y79533x3"}],
        resultados: []
    },
    {
        id: "batalla-boyaca",
        fecha: "07/08/26", modalidad: "Individual", evento: "Batalla de Boyacá", handicap: "Ventaja individual con el PR",
        subida: "Sisga", crono: "Briceño-Almaviva",
        links: [{nombre: "Enlace Subida", url: "https://tinyurl.com/3jvmk6z4"}, {nombre: "Enlace Crono", url: "https://tinyurl.com/yyjanar6"}],
        resultados: []
    },
    {
        id: "cuchilla",
        fecha: "27/09/26", modalidad: "Equipos", evento: "Cuchilla", handicap: "Suma de tiempos",
        subida: "Cuchilla", crono: "Briceño-Almaviva",
        links: [{nombre: "Enlace Subida", url: "https://tinyurl.com/467vknex"}, {nombre: "Enlace Crono", url: "https://tinyurl.com/yyjanar6"}],
        resultados: []
    },
    {
        id: "la-vega",
        fecha: "18/10/26", modalidad: "Individual", evento: "La Vega", handicap: "Ventaja individual con el PR",
        subida: "La Vega", crono: "No aplica",
        links: [{nombre: "Enlace Subida", url: "https://tinyurl.com/mrxx5uny"}],
        resultados: []
    }
];

// --- BASE DE DATOS DE MIEMBROS ---
const miembros = [
    { nombre: "Jaime Beltrán", puntos: 150 },
    { nombre: "Sergio Esteban García", puntos: 120 },
    { nombre: "Simon Balsero", puntos: 90 },
    { nombre: "Javier Balsero", puntos: 0 },
    { nombre: "Mateo Nuñez", puntos: 0 },
    { nombre: "Juan Carlos García", puntos: 0 },
    { nombre: "Jonathan Bernal", puntos: 0 },
    { nombre: "Alvaro González", puntos: 0 },
    { nombre: "Daniel Rodriguez", puntos: 0 },
    { nombre: "Daniel Segura", puntos: 0 },
    { nombre: "Yesid Baron", puntos: 0 },
    { nombre: "Sebastián García Llano", puntos: 0 }
];

// Exportar para uso en módulos (si se llega a necesitar, aunque lo usaremos como script global por simplicidad)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { eventos, miembros };
}
