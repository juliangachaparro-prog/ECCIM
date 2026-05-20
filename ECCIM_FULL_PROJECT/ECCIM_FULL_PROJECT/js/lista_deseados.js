import { supabase } from './supabase.js' // Asegúrate de que supabase.js esté en la misma carpeta /js

const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

async function cargarListaDeseados() {
    const gridDeseos = document.getElementById("catalogo"); // Usamos 'catalogo' por tu estructura HTML
    if (!gridDeseos) return;

    // 1. Validar sesión
    if (!usuarioLogueado || !usuarioLogueado.id_usuario) {
        gridDeseos.innerHTML = `<p style="color: #ef4444;">Sesión no válida. Por favor, inicia sesión de nuevo.</p>`;
        return;
    }

    // 2. Consulta a Supabase cruzando con los campos reales de 'juegos'
    const { data: deseadosItems, error } = await supabase
        .from("lista_deseos") // Asegúrate de que en tu BD se llame así o 'lista_deseados'
        .select(`
            id_lista,
            id_usuario,
            id_juego,
            notificar_oferta,
            juegos (
                titulo,
                precio_base,
                fecha_lanzamiento
            )
        `)
        .eq("id_usuario", usuarioLogueado.id_usuario);

    // 3. Manejo de errores
    if (error) {
        console.error("Error en Lista de Deseos:", error);
        gridDeseos.innerHTML = `<p style="color: #ef4444;">Error al cargar la lista de deseos: ${error.message}</p>`;
        return;
    }

    // 4. Si está vacía
    if (!deseadosItems || deseadosItems.length === 0) {
        gridDeseos.innerHTML = `<p style="color: #9ca3af;">No tienes juegos en tu lista de deseos todavía.</p>`;
        return;
    }

    // 5. Renderizar tarjetas (Formato texto elegante)
    gridDeseos.innerHTML = "";

    deseadosItems.forEach(item => {
        const juego = item.juegos;
        if (!juego) return;

        const card = document.createElement("div");
        card.classList.add("game-card");

        card.innerHTML = `
            <div class="game-card-info" style="padding: 20px;">
                <div style="background: #f59e0b; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 20px; margin-bottom: 12px; color: white;">
                    ⭐
                </div>

                <h3 style="margin: 0 0 5px 0; font-size: 20px; color: #fff;">${juego.titulo}</h3>
                <p style="margin: 0 0 15px 0; font-size: 12px; color: #9ca3af;">Lanzamiento: ${new Date(juego.fecha_lanzamiento).toLocaleDateString()}</p>
                
                <div style="font-size: 11px; color: #9ca3af; line-height: 1.6; background: #1f2937; padding: 10px; border-radius: 6px; border: 1px solid #374151;">
                    <p style="margin: 2px 0;"><strong>ID Lista:</strong> ${item.id_lista}</p>
                    <p style="margin: 2px 0;"><strong>ID Usuario:</strong> ${item.id_usuario}</p>
                    <p style="margin: 2px 0;"><strong>ID Juego:</strong> ${item.id_juego}</p>
                    <p style="margin: 2px 0; color: #60a5fa;"><strong>Precio Base:</strong> $${juego.precio_base}</p>
                    <p style="margin: 2px 0; color: #eab308;"><strong>¿Notificar Ofertas?:</strong> ${item.notificar_oferta ? "Sí 🔔" : "No 🔕"}</p>
                </div>

                <span class="precio" style="color: #f59e0b; font-size: 13px; display: block; margin-top: 12px; font-weight: bold;">❤️ En mi lista</span>
            </div>
        `;
        gridDeseos.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", cargarListaDeseados);