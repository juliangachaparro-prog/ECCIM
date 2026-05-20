import { supabase } from './supabase.js' // Asegúrate de que supabase.js esté en la misma carpeta /js


const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

async function cargarNotificaciones() {
    const gridNotif = document.getElementById("catalogo"); // Mismo contenedor
    if (!gridNotif) return;

    if (!usuarioLogueado || !usuarioLogueado.id_usuario) {
        gridNotif.innerHTML = `<p style="color: #ef4444;">Sesión no válida.</p>`;
        return;
    }

    // Consulta a la tabla notificaciones directa (no requiere cruzar con juegos)
    const { data: notificaciones, error } = await supabase
        .from("notificaciones")
        .select("id_notificacion, id_usuario, mensaje_alerta, leida")
        .eq("id_usuario", usuarioLogueado.id_usuario);

    if (error) {
        console.error("Error en Notificaciones:", error);
        gridNotif.innerHTML = `<p style="color: #ef4444;">Error al cargar alertas: ${error.message}</p>`;
        return;
    }

    if (!notificaciones || notificaciones.length === 0) {
        gridNotif.innerHTML = `<p style="color: #9ca3af;">No tienes alertas ni notificaciones.</p>`;
        return;
    }

    gridNotif.innerHTML = "";

    notificaciones.forEach(notif => {
        const card = document.createElement("div");
        card.classList.add("game-card");
        
        // Estilo adaptado: Cambia de color si la notificación ya fue leída
        const bgEstado = notif.leida ? "#1f2937" : "#2d3748";
        const bordeEstado = notif.leida ? "1px solid #4b5563" : "1px solid #3b82f6";

        card.innerHTML = `
            <div class="game-card-info" style="padding: 20px; background: ${bgEstado}; border: ${bordeEstado}; border-radius: 8px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <span style="font-size: 20px;">${notif.leida ? "📩" : "🔔"}</span>
                    <span style="font-size: 11px; padding: 2px 8px; border-radius: 12px; background: ${notif.leida ? '#4b5563' : '#3b82f6'}; color: white;">
                        ${notif.leida ? 'Leída' : 'Nueva'}
                    </span>
                </div>

                <p style="margin: 0 0 15px 0; font-size: 15px; color: #f3f4f6; font-weight: ${notif.leida ? 'normal' : 'bold'};">
                    ${notif.mensaje_alerta}
                </p>
                
                <div style="font-size: 11px; color: #9ca3af; line-height: 1.5; background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px;">
                    <p style="margin: 2px 0;"><strong>ID Notificación:</strong> ${notif.id_notificacion}</p>
                    <p style="margin: 2px 0;"><strong>ID Usuario:</strong> ${notif.id_usuario}</p>
                </div>
            </div>
        `;
        gridNotif.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", cargarNotificaciones);