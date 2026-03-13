// --- CONFIGURACIÓN DE GOOGLE SHEETS ---
const CONFIG = {
    urlEventos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRt_g5UoWFYEMy_B6elUk2OIOmXkI1Q390OHbNLnubQK23i0fYVIms4FBf-XETmS_YG5J7Oc11qjEbx/pub?gid=0&single=true&output=csv",
    urlResultados: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRt_g5UoWFYEMy_B6elUk2OIOmXkI1Q390OHbNLnubQK23i0fYVIms4FBf-XETmS_YG5J7Oc11qjEbx/pub?gid=711844025&single=true&output=csv"
};

// Sistema de puntos F1: 1º al 10º puesto
const PUNTOS_F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const LISTA_MIEMBROS_INICIAL = [
    "Juan Carlos García", "Javier Balsero", "Daniel Rodríguez", "Mateo Núñez",
    "Simón Balsero", "Alvaro González", "Rafaél Santos", "Anderson Rodríguez",
    "Jaime Beltrán", "Diego Gutiérrez", "Richar Ávila", "Jaiber Dávila",
    "Tatán Bernal", "Carlos Aristizábal", "Carlos Bicicota", "Daniel Segura",
    "Fernando Segura", "Julián García", "Omar Mora", "Óscar Cuervo",
    "Sebastián García", "Yesid Barón", "Andrés Moreno"
];

let eventos = [];
let miembros = [];

/**
 * Convierte tiempo MM:SS o HH:MM:SS a segundos
 */
function tiempoASegundos(tiempo) {
    if (!tiempo || tiempo.trim() === "" || tiempo === "No aplica") return null;
    const partes = tiempo.split(":").map(Number);
    if (partes.length === 3) return (partes[0] * 3600) + (partes[1] * 60) + partes[2];
    if (partes.length === 2) return (partes[0] * 60) + partes[1];
    return null;
}

/**
 * Convierte segundos a formato MM:SS (con signo opcional)
 */
function segundosATiempo(segundos, mostrarSigno = false) {
    if (segundos === null || isNaN(segundos)) return "-";
    const signo = segundos < 0 ? "-" : (mostrarSigno ? "+" : "");
    const absSegundos = Math.abs(segundos);
    const m = Math.floor(absSegundos / 60);
    const s = Math.floor(absSegundos % 60);
    return `${signo}${m}:${s.toString().padStart(2, '0')}`;
}

function csvToJSON(csv) {
    const lines = csv.split("\n");
    if (lines.length === 0) return [];
    const result = [];
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ''));

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const currentline = line.split(",");
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = currentline[index] ? currentline[index].trim().replace(/"/g, '') : "";
        });
        result.push(obj);
    }
    return result;
}

async function cargarDatos() {
    try {
        console.log("Iniciando carga dinámica de datos...");
        const [resEv, resRes] = await Promise.all([
            fetch(CONFIG.urlEventos),
            fetch(CONFIG.urlResultados)
        ]);

        const eventosRaw = csvToJSON(await resEv.text());
        const resultadosRaw = csvToJSON(await resRes.text());

        const puntosHistoricos = {};
        LISTA_MIEMBROS_INICIAL.forEach(m => puntosHistoricos[m] = 0);

        eventos = eventosRaw.map(ev => {
            const esIndividual = ev.Modalidad.toLowerCase().includes("individual");
            const rawEvRes = resultadosRaw.filter(r => r.Evento_ID === ev.ID);

            let procesados = [];

            if (esIndividual) {
                // Cálculo Individual: Diferencia vs PR
                const porCiclista = {};
                rawEvRes.forEach(r => {
                    const ciclista = r.Ciclista;
                    if (!porCiclista[ciclista]) porCiclista[ciclista] = { nombre: ciclista, difTotal: 0, tiempos: [] };

                    const t = tiempoASegundos(r.Tiempo);
                    const pr = tiempoASegundos(r.PR);

                    if (t !== null && pr !== null) {
                        porCiclista[ciclista].difTotal += (t - pr);
                        porCiclista[ciclista].tiempos.push(segundosATiempo(t));
                    }
                });
                // Ganador: el que más tiempo descuente (menor diferencia total)
                procesados = Object.values(porCiclista).sort((a, b) => a.difTotal - b.difTotal);
            } else {
                // Cálculo Equipos: Suma de tiempos
                const porEquipo = {};
                rawEvRes.forEach(r => {
                    const eqNombre = r.Equipo || "Independiente";
                    if (!porEquipo[eqNombre]) porEquipo[eqNombre] = { nombre: eqNombre, tiempoTotal: 0, miembros: [] };

                    const t = tiempoASegundos(r.Tiempo);
                    if (t !== null) {
                        porEquipo[eqNombre].tiempoTotal += t;
                        porEquipo[eqNombre].miembros.push(r.Ciclista);
                    }
                });
                // Ganador: equipo con menor tiempo total
                procesados = Object.values(porEquipo).sort((a, b) => a.tiempoTotal - b.tiempoTotal);
            }

            // Asignar Posiciones y Puntos F1
            const resultadosFinales = [];
            procesados.forEach((p, i) => {
                const pts = PUNTOS_F1[i] || 0;
                if (esIndividual) {
                    resultadosFinales.push({
                        pos: i + 1,
                        nombre: p.nombre,
                        tiempo: p.tiempos.join(" / "),
                        infoExtra: segundosATiempo(p.difTotal, true), // Dif vs PR
                        puntos: pts
                    });
                    // Sumar a la general
                    if (puntosHistoricos[p.nombre] !== undefined) puntosHistoricos[p.nombre] += pts;
                } else {
                    // En equipos, todos los miembros reciben los puntos del equipo
                    p.miembros.forEach(m => {
                        if (puntosHistoricos[m] !== undefined) puntosHistoricos[m] += pts;
                    });
                    resultadosFinales.push({
                        pos: i + 1,
                        nombre: p.nombre, // Nombre del Equipo
                        integrantes: p.miembros.join(", "),
                        tiempo: segundosATiempo(p.tiempoTotal),
                        infoExtra: "Team Total",
                        puntos: pts
                    });
                }
            });

            // Procesar links
            const links = [];
            for (let i = 1; i <= 3; i++) {
                const n = ev[`Link ${i} Nombre`];
                const u = ev[`Link ${i} URL`];
                if (u && u.trim() !== "") links.push({ nombre: n || "Ver", url: u });
            }

            return {
                id: ev.ID,
                fecha: ev.Fecha,
                modalidad: ev.Modalidad,
                evento: ev.Evento,
                handicap: ev.Handicap,
                subida: ev.Subida,
                crono: ev.Crono,
                links,
                resultados: resultadosFinales
            };
        });

        // Generar ranking general
        miembros = Object.keys(puntosHistoricos).map(n => ({
            nombre: n,
            puntos: puntosHistoricos[n]
        })).sort((a, b) => b.puntos - a.puntos);

        console.log("Carga dinámica completada.");

    } catch (e) {
        console.error("Error en motor de datos:", e);
        usarDatosDePrueba();
    }
}

// Respaldo por si falla el fetch
function usarDatosDePrueba() {
    eventos = [];
    miembros = LISTA_MIEMBROS_INICIAL.map(m => ({ nombre: m, puntos: 0 }));
}

window.Z5Data = {
    init: cargarDatos,
    getEventos: () => eventos,
    getMiembros: () => miembros,
    getEventoById: (id) => eventos.find(e => e.id === id)
};
