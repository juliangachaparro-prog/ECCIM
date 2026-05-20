import { supabase } from './supabase.js' // Asegúrate de que supabase.js esté en la misma carpeta /js
const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));

async function cargarBiblioteca() {
    const gridBiblioteca = document.getElementById("catalogo"); 
    if (!gridBiblioteca) return;

    // 1. Validar sesión
    if (!usuarioLogueado || !usuarioLogueado.id_usuario) {
        gridBiblioteca.innerHTML = `<p style="color: #ef4444;">Sesión no válida. Por favor, inicia sesión de nuevo.</p>`;
        return;
    }

    // 2. Consulta a Supabase con los campos reales de tu tabla juegos
    const { data: bibliotecaItems, error } = await supabase
        .from("biblioteca")
        .select(`
            id_biblioteca,
            id_usuario,
            id_juego,
            horas_jugadas,
            fecha_adquisicion,
            juegos (
                titulo,
                precio_base,
                fecha_lanzamiento
            )
        `)
        .eq("id_usuario", usuarioLogueado.id_usuario);

    // 3. Manejo de errores
    if (error) {
        console.error("Error detallado de Supabase:", error);
        gridBiblioteca.innerHTML = `<p style="color: #ef4444;">Error al conectar con tu biblioteca: ${error.message}</p>`;
        return;
    }

    // 4. Si no hay juegos
    if (!bibliotecaItems || bibliotecaItems.length === 0) {
        gridBiblioteca.innerHTML = `<p style="color: #9ca3af;">Aún no tienes juegos en tu biblioteca.</p>`;
        return;
    }

    // 5. Renderizar tarjetas (Sin buscar imágenes)
    gridBiblioteca.innerHTML = "";

    bibliotecaItems.forEach(item => {
        const juego = item.juegos;
        if (!juego) return; 

        const card = document.createElement("div");
        card.classList.add("game-card");
        
        // Estilo adaptado: Un diseño elegante basado en texto y bloques de información
        card.innerHTML = `
            <div class="game-card-info" style="padding: 20px;">
                <div style="background: #3b82f6; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 20px; margin-bottom: 12px; color: white;">
                    ${juego.titulo.charAt(0).toUpperCase()}
                </div>

                <h3 style="margin: 0 0 5px 0; font-size: 20px; color: #fff;">${juego.titulo}</h3>
                <p style="margin: 0 0 15px 0; font-size: 12px; color: #9ca3af;">Lanzamiento: ${new Date(juego.fecha_lanzamiento).toLocaleDateString()}</p>
                
                <div style="font-size: 11px; color: #9ca3af; line-height: 1.6; background: #1f2937; padding: 10px; border-radius: 6px; border: 1px solid #374151;">
                    <p style="margin: 2px 0;"><strong>ID Biblioteca:</strong> ${item.id_biblioteca}</p>
                    <p style="margin: 2px 0;"><strong>ID Usuario:</strong> ${item.id_usuario}</p>
                    <p style="margin: 2px 0;"><strong>ID Juego:</strong> ${item.id_juego}</p>
                    <p style="margin: 2px 0; color: #60a5fa;"><strong>Valor Base:</strong> $${juego.precio_base}</p>
                    <p style="margin: 2px 0; color: #34d399;"><strong>Horas jugadas:</strong> ${item.horas_jugadas || 0} hrs</p>
                    <p style="margin: 2px 0;"><strong>Adquirido el:</strong> ${new Date(item.fecha_adquisicion).toLocaleDateString()}</p>
                </div>
                
                <span class="precio" style="color: #10b981; font-size: 13px; display: block; margin-top: 12px; font-weight: bold;">✓ Comprado</span>
            </div>
        `;
        gridBiblioteca.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", cargarBiblioteca);