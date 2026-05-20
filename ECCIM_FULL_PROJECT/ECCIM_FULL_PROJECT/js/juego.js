import { supabase } from './supabase.js'

const params = new URLSearchParams(window.location.search)
const id_param = params.get("id")
const id_juego = isNaN(id_param) ? id_param : Number(id_param)

const banner = document.getElementById("bannerJuego")
const infoJuego = document.getElementById("infoJuego")
const contenedorResenas = document.querySelector(".resenas-section") 

// Captura exacta de los nuevos elementos técnicos en tu HTML
const txtDesarrollador = document.getElementById("nombreDesarrollador")
const txtCategoria = document.getElementById("nombre_categoria");
const txtDescripcionCat = document.getElementById("descripcion");
// Elemento nuevo para el historial de parches
const contenedorActualizaciones = document.getElementById("contenedorActualizaciones");

function obtenerDegradadoPorId(id) {
    const paletas = [
        "linear-gradient(135deg, #1e3a8a, #0f172a)", 
        "linear-gradient(135deg, #581c87, #0f172a)", 
        "linear-gradient(135deg, #064e3b, #0f172a)", 
        "linear-gradient(135deg, #7c2d12, #0f172a)", 
        "linear-gradient(135deg, #4c1d95, #111827)", 
        "linear-gradient(135deg, #831843, #0f172a)"  
    ];
    const indice = (parseInt(id) || 0) % paletas.length;
    return paletas[indice];
}

async function cargarPantallaJuego() {
    if (!id_juego) {
        if (infoJuego) infoJuego.innerHTML = "<h1>Error: Enlace inválido.</h1>";
        return;
    }

    // ------------------------------------------------------------------
    // 1. CARGAR DATOS DEL JUEGO
    // ------------------------------------------------------------------
    const { data: juego, error: errorJuego } = await supabase
        .from("juegos")
        .select("*")
        .eq("id_juego", id_juego)
        .single()

    if (errorJuego || !juego) {
        console.error("Juego no encontrado:", errorJuego)
        if (infoJuego) infoJuego.innerHTML = "<h1>El juego no existe en nuestro catálogo.</h1>"
        return
    }

    if (banner) banner.style.background = obtenerDegradadoPorId(id_juego);

    if (infoJuego) {
        const fecha = juego.fecha_lanzamiento 
            ? new Date(juego.fecha_lanzamiento).toLocaleDateString("es-CO") 
            : "No disponible"

        // Mantenemos la clase ".detalle-contenido" para respetar tu hoja de estilos
        infoJuego.innerHTML = `
            <div class="detalle-contenido">
                <h1>${juego.titulo}</h1>
                <p class="subtitle" style="text-align:left;">Fecha de lanzamiento: ${fecha}</p>
                <h2>$${juego.precio_base}</h2>
                <button id="btnComprar">Comprar Juego</button>
            </div>
        `
        const botonComprar =
document.getElementById(
    "btnComprar"
)

botonComprar.addEventListener(
"click",
async () => {

    const usuarioLogueado =
    JSON.parse(
        localStorage.getItem(
            "usuario"
        )
    )

    if(!usuarioLogueado){

        alert(
            "Debes iniciar sesión"
        )

        return
    }

    // COMPRA
    const { data: compra }
    =
    await supabase
    .from("compras")
    .insert([{

        id_usuario:
        usuarioLogueado.id_usuario,

        fecha_compra:
        new Date(),

        total_compra:
        juego.precio_base

    }])
    .select()
    .single()

    // DETALLE
    await supabase
    .from("detalle_compras")
    .insert([{

        id_compra:
        compra.id_compra,

        id_juego,

        precio_unitario:
        juego.precio_base

    }])

    // PAGO
    await supabase
    .from("pagos")
    .insert([{

        id_compra:
        compra.id_compra,

        metodo_pago:
        "Digital",

        estado_pago:
        "Completado"

    }])

    // BIBLIOTECA
    await supabase
    .from("biblioteca")
    .insert([{

        id_usuario:
        usuarioLogueado.id_usuario,

        id_juego,

        horas_jugadas: 0,

        fecha_adquisicion:
        new Date()

    }])

    alert(
        "Compra realizada"
    )

    window.location.href =
    "biblioteca.html"

})



      
            
        
    }

    // ------------------------------------------------------------------
    // 2. BUSCAR EL DESARROLLADOR RELACIONADO (nombre_empresa)
    // ------------------------------------------------------------------
    if (juego.id_desarrollador) {
        const { data: dev, error: errorDev } = await supabase
            .from("desarrolladores")
            .select("nombre_empresa")
            .eq("id_desarrollador", juego.id_desarrollador)
            .single()

        if (!errorDev && dev && txtDesarrollador) {
            txtDesarrollador.innerText = dev.nombre_empresa;
        } else if (txtDesarrollador) {
            txtDesarrollador.innerText = "Estudio Independiente";
        }
    }
// ------------------------------------------------------------------
    // 3. BUSCAR LA CATEGORÍA Y DESCRIPCIÓN VÍA LAS 2 TABLAS EXACTAS
    // ------------------------------------------------------------------
    try {
        // TABLA 1: Cambiado a "Juegos Categorias" respetando mayúsculas y espacio del flujo original
        const { data: tablaIntermedia, error: errorIntermedio } = await supabase
            .from("juegos_categorias")
            .select("id_categoria")
            .eq("id_juego", id_juego);

        if (!errorIntermedio && tablaIntermedia && tablaIntermedia.length > 0) {
            const idCategoriaEncontrado = tablaIntermedia[0].id_categoria;

            if (idCategoriaEncontrado) {
                // TABLA 2: Consultamos la tabla principal 'categorias'
                const { data: categoriaFinal, error: errorCat } = await supabase
                    .from("categorias")
                    .select("nombre_categoria, descripcion")
                    .eq("id_categoria", idCategoriaEncontrado)
                    .single();

                if (!errorCat && categoriaFinal) {
                    // Inyectamos de forma directa usando tus constantes del DOM
                    if (txtCategoria) txtCategoria.innerText = categoriaFinal.nombre_categoria;
                    if (txtDescripcionCat) txtDescripcionCat.innerText = categoriaFinal.descripcion;
                    console.log("Categoría vinculada y cargada con éxito desde 'Juegos Categorias' y 'categorias'.");
                } else {
                    if (errorCat) console.error("Error al leer la tabla 'categorias':", errorCat);
                    marcarCategoriaPorDefecto();
                }
            } else {
                marcarCategoriaPorDefecto();
            }
        } else {
            if (errorIntermedio) console.error("Error al leer la tabla 'Juegos Categorias':", errorIntermedio);
            marcarCategoriaPorDefecto();
        }
    } catch (err) {
        console.error("Error crítico al procesar la información de categorías:", err);
        marcarCategoriaPorDefecto();
    }

    // Función de respaldo por si el juego no posee un registro asociado
    function marcarCategoriaPorDefecto() {
        if (txtCategoria) txtCategoria.innerText = "General";
        if (txtDescripcionCat) txtDescripcionCat.innerText = "Este título no cuenta con una descripción de género asignada en la base de datos.";
    }
    // ------------------------------------------------------------------
    // 4. CARGAR RESEÑAS DIRECTAMENTE DE SUPABASE
    // ------------------------------------------------------------------
    const { data: resenas, error: errorResenas } = await supabase
        .from("resenas") 
        .select("*")
        .eq("id_juego", id_juego)

    if (errorResenas) {
        console.error("Error al traer reseñas:", errorResenas)
        return
    }

    if (contenedorResenas) {
        contenedorResenas.innerHTML = `<h2>Reseñas de la Comunidad</h2>`

        if (!resenas || resenas.length === 0) {
            contenedorResenas.innerHTML += `<p class="subtitle">Este juego no tiene reseñas en Supabase aún. ¡Sé el primero!</p>`
            return
        }

        resenas.forEach(resena => {
            const numEstrellas = Math.min(Math.max(parseInt(resena.calificacion) || 0, 0), 5);
            const estrellas = "⭐".repeat(numEstrellas) || "Sin calificación";
            
            const resenaDiv = document.createElement("div")
            resenaDiv.classList.add("resena")
            resenaDiv.innerHTML = `
                <div class="resena-header">
                    <strong>Usuario #${resena.id_usuario}</strong>
                    <span>${estrellas}</span>
                </div>
                <p>${resena.comentario || 'Sin comentarios.'}</p>
            `
            contenedorResenas.appendChild(resenaDiv)
        })
    }
    // ------------------------------------------------------------------
    // 5. CARGAR HISTORIAL DE ACTUALIZACIONES (NUEVO)
    // ------------------------------------------------------------------
    try {
        // Consultamos la tabla basándonos en los campos de tu flujo
        const { data: actualizaciones, error: errorActualizaciones } = await supabase
            .from("actualizaciones") // Probamos en minúscula primero
            .select("id_actualizacion, version, notas_parche")
            .eq("id_juego", id_juego)
            .order("id_actualizacion", { ascending: false }); // Muestra la última versión primero

        if (errorActualizaciones) {
            // Si da error de caché por mayúsculas, intentamos con la 'A' mayúscula
            throw errorActualizaciones;
        }

        if (contenedorActualizaciones) {
            contenedorActualizaciones.innerHTML = "";

            if (!actualizaciones || actualizaciones.length === 0) {
                contenedorActualizaciones.innerHTML = `<p class="subtitle" style="text-align: left; color: #9ca3af;">Este juego se encuentra en su versión de lanzamiento base. No hay parches registrados.</p>`;
                return;
            }

            // Pintamos cada actualización de forma elegante
            actualizaciones.forEach(parche => {
                const parcheDiv = document.createElement("div");
                parcheDiv.style.backgroundColor = "#1f2937";
                parcheDiv.style.padding = "15px";
                parcheDiv.style.borderRadius = "8px";
                parcheDiv.style.marginBottom = "12px";
                parcheDiv.style.borderLeft = "4px solid #3b82f6";

                parcheDiv.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <strong style="color: #ffffff; font-size: 16px;">Versión ${parche.version}</strong>
                        <span style="color: #9ca3af; font-size: 12px;">ID Parche: #${parche.id_actualizacion}</span>
                    </div>
                    <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-line;">${parche.notas_parche || 'No se detallaron las notas de este parche.'}</p>
                `;
                contenedorActualizaciones.appendChild(parcheDiv);
            });
        }
    } catch (err) {
        console.warn("Fallo al cargar desde 'actualizaciones', reintentando con mayúscula...", err);
        // Plan B automático por si la tabla tiene la inicial en mayúscula en tu Supabase
        cargarActualizacionesMayuscula(id_juego);
    }

    // Función auxiliar para tolerar nombres de tabla como 'Actualizaciones'
    async function cargarActualizacionesMayuscula(idJuego) {
        const { data: actualizaciones, error } = await supabase
            .from("Actualizaciones")
            .select("id_actualizacion, version, notas_parche")
            .eq("id_juego", idJuego)
            .order("id_actualizacion", { ascending: false });

        if (contenedorActualizaciones) {
            if (!error && actualizaciones && actualizaciones.length > 0) {
                contenedorActualizaciones.innerHTML = "";
                actualizaciones.forEach(parche => {
                    const parcheDiv = document.createElement("div");
                    parcheDiv.style.backgroundColor = "#1f2937";
                    parcheDiv.style.padding = "15px";
                    parcheDiv.style.borderRadius = "8px";
                    parcheDiv.style.marginBottom = "12px";
                    parcheDiv.style.borderLeft = "4px solid #3b82f6";
                    parcheDiv.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: #ffffff; font-size: 16px;">Versión ${parche.version}</strong>
                            <span style="color: #9ca3af; font-size: 12px;">ID Parche: #${parche.id_actualizacion}</span>
                        </div>
                        <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin: 0; white-space: pre-line;">${parche.notas_parche}</p>
                    `;
                    contenedorActualizaciones.appendChild(parcheDiv);
                });
            } else {
                contenedorActualizaciones.innerHTML = `<p class="subtitle" style="text-align: left; color: #9ca3af;">Este juego se encuentra en su versión de lanzamiento base. No hay parches registrados.</p>`;
            }
        }
    }
}

// Aseguramos que cargue tras el árbol de renderizado del HTML
document.addEventListener("DOMContentLoaded", cargarPantallaJuego);