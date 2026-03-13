// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
// Reemplaza estas URLs con tus enlaces de "Publicar en la Web" -> formato CSV
const CONFIG = {
    urlEventos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRt_g5UoWFYEMy_B6elUk2OIOmXkI1Q390OHbNLnubQK23i0fYVIms4FBf-XETmS_YG5J7Oc11qjEbx/pub?gid=0&single=true&output=csv",
    urlResultados: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRt_g5UoWFYEMy_B6elUk2OIOmXkI1Q390OHbNLnubQK23i0fYVIms4FBf-XETmS_YG5J7Oc11qjEbx/pub?gid=711844025&single=true&output=csv",
    // Si prefieres usar una hoja de ranking calculada en Sheets, pon la URL aquí.
    // Si no, el sistema la calculará automáticamente sumando puntos.
    urlRanking: ""
};

// --- LISTA MAESTRA DE MIEMBROS (FALLBACK) ---
const LISTA_MIEMBROS_INICIAL = [
    "Juan Carlos García", "Javier Balsero", "Daniel Rodríguez", "Mateo Núñez",
    "Simón Balsero", "Alvaro González", "Rafaél Santos", "Anderson Rodríguez",
    "Jaime Beltrán", "Diego Gutiérrez", "Richar Ávila", "Jaiber Dávila",
    "Tatán Bernal", "Carlos Aristizábal", "Carlos Bicicota", "Daniel Segura",
    "Fernando Segura", "Julián García", "Omar Mora", "Óscar Cuervo",
    "Sebastián García", "Yesid Barón", "Andrés Moreno"
];

// Variables globales que usará el sitio
let eventos = [];
let miembros = [];

/**
 * Función simple para convertir CSV a JSON
 */
function csvToJSON(csv) {
    const lines = csv.split("\n");
    const result = [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentline = lines[i].split(",");

        headers.forEach((header, index) => {
            let value = currentline[index] ? currentline[index].trim().replace(/"/g, '') : "";
            obj[header] = value;
        });
        result.push(obj);
    }
    return result;
}

/**
 * Carga todos los datos desde Google Sheets o usa locales si fallan
 */
async function cargarDatos() {
    try {
        console.log("Cargando datos desde Google Sheets...");

        // 1. Cargar Eventos
        const resEventos = await fetch(CONFIG.urlEventos);
        const csvEventos = await resEventos.text();
        const eventosRaw = csvToJSON(csvEventos);

        // 2. Cargar Resultados
        const resResultados = await fetch(CONFIG.urlResultados);
        const csvResultados = await resResultados.text();
        const resultadosRaw = csvToJSON(csvResultados);

        // 3. Procesar y Cruzar Datos
        eventos = eventosRaw.map(ev => {
            // Procesar links (soportamos hasta 3 links por evento)
            const links = [];
            for (let i = 1; i <= 3; i++) {
                const nombre = ev[`Link ${i} Nombre`];
                const url = ev[`Link ${i} URL`];
                if (url && url.trim() !== "") {
                    links.push({ nombre: nombre || "Ver", url: url });
                }
            }

            // Filtrar resultados para este evento
            let resultadosEv = resultadosRaw
                .filter(r => r.Evento_ID === ev.ID)
                .map(r => ({
                    nombre: r.Ciclista,
                    tiempo: r.Tiempo,
                    puntos: parseInt(r.Puntos) || 0,
                    pos: 0 // Se calculará abajo
                }))
                // Ordenar por puntos (desc) y luego por tiempo (asc)
                .sort((a, b) => {
                    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
                    return (a.tiempo || "99:99").localeCompare(b.tiempo || "99:99");
                });

            // Asignar posiciones basadas en el orden
            resultadosEv.forEach((r, i) => r.pos = i + 1);

            return {
                id: ev.ID,
                fecha: ev.Fecha,
                modalidad: ev.Modalidad,
                evento: ev.Evento,
                handicap: ev.Handicap,
                subida: ev.Subida,
                crono: ev.Crono,
                links: links,
                resultados: resultadosEv
            };
        });

        // 4. Calcular Ranking General
        const puntosPorMiembro = {};
        // Inicializar todos con 0
        LISTA_MIEMBROS_INICIAL.forEach(m => puntosPorMiembro[m] = 0);

        // Sumar puntos de todos los resultados
        resultadosRaw.forEach(r => {
            if (puntosPorMiembro[r.Ciclista] !== undefined) {
                puntosPorMiembro[r.Ciclista] += parseInt(r.Puntos) || 0;
            } else {
                // Si el ciclista no estaba en la lista inicial, lo agregamos
                puntosPorMiembro[r.Ciclista] = parseInt(r.Puntos) || 0;
            }
        });

        miembros = Object.keys(puntosPorMiembro).map(nombre => ({
            nombre: nombre,
            puntos: puntosPorMiembro[nombre]
        })).sort((a, b) => b.puntos - a.puntos);

        console.log("Datos cargados con éxito.");

    } catch (error) {
        console.warn("No se pudieron cargar los datos de Google Sheets. Usando datos locales de prueba.", error);
        // Aquí podrías poner una carga de respaldo si quisieras
        usarDatosDePrueba();
    }
}

// Función de respaldo para que el sitio no se vea vacío mientras se configuran las URLs
function usarDatosDePrueba() {
    eventos = [
        {
            id: "briceno",
            fecha: "15/03/26", modalidad: "Individual", evento: "Briceño (Demo)",
            handicap: "Ventaja individual con el PR", subida: "No aplica", crono: "Biceño-Almaviva",
            links: [{ nombre: "Ver Segmento", url: "#" }],
            resultados: [
                { pos: 1, nombre: "Jaime Beltrán", tiempo: "12:34", puntos: 50 },
                { pos: 2, nombre: "Simon Balsero", tiempo: "13:15", puntos: 30 }
            ]
        }
    ];
    miembros = LISTA_MIEMBROS_INICIAL.map(m => ({ nombre: m, puntos: m === "Jaime Beltrán" ? 50 : (m === "Simón Balsero" ? 30 : 0) }));
}

// Exportar para que los scripts de las páginas lo llamen
window.Z5Data = {
    init: cargarDatos,
    getEventos: () => eventos,
    getMiembros: () => miembros,
    getEventoById: (id) => eventos.find(e => e.id === id)
};
