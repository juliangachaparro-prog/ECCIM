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

// NUEVA FUNCIÓN: Comprueba si el usuario ya posee el juego o si está en su lista de deseos
async function verificarEstadoUsuario(idUsuario) {
    let yaComprado = false;
    let enListaDeseos = false;

    try {
        // 1. Verificar si ya existe en la biblioteca del usuario
        const { data: biblioteca, error: errorBib } = await supabase
            .from("biblioteca")
            .select("id_juego")
            .eq("id_usuario", idUsuario)
            .eq("id_juego", id_juego)
            .maybeSingle();
        
        if (!errorBib && biblioteca) yaComprado = true;

        // 2. Verificar si ya existe en su lista de deseos
        const { data: deseos, error: errorDes } = await supabase
            .from("lista_deseos")
            .select("id_lista")
            .eq("id_usuario", idUsuario)
            .eq("id_juego", id_juego)
            .maybeSingle();

        if (!errorDes && deseos) enListaDeseos = true;

    } catch (err) {
        console.error("Error al verificar estados previos del usuario:", err);
    }

    return { yaComprado, enListaDeseos };
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

    // Obtener datos del usuario local para la validación previa de botones
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
    let estado = { yaComprado: false, enListaDeseos: false };
    
    if (usuarioLogueado) {
        estado = await verificarEstadoUsuario(usuarioLogueado.id_usuario);
    }

    if (infoJuego) {
        const fecha = juego.fecha_lanzamiento 
            ? new Date(juego.fecha_lanzamiento).toLocaleDateString("es-CO") 
            : "No disponible"

        // Modificación: Si ya está comprado, el botón de compra nace deshabilitado
        const botonCompraHTML = estado.yaComprado 
            ? `<button id="btnComprar" disabled style="background-color: #1f2937; color: #9ca3af; cursor: not-allowed;">Ya tienes este juego</button>`
            : `<button id="btnComprar">Comprar Juego</button>`;

        infoJuego.innerHTML = `
            <div class="detalle-contenido">
                <h1>${juego.titulo}</h1>
                <p class="subtitle" style="text-align:left;">Fecha de lanzamiento: ${fecha}</p>
                <h2>$${juego.precio_base}</h2>
                ${botonCompraHTML}
            </div>
        `
        const botonComprar = document.getElementById("btnComprar")

        botonComprar.addEventListener("click", async () => {
            const usuarioLogueadoBtn = JSON.parse(localStorage.getItem("usuario"))

            if(!usuarioLogueadoBtn){
                alert("Debes iniciar sesión")
                return
            }

            // Bloqueo de seguridad extra en el clic por si acaso
            const reVerificar = await verificarEstadoUsuario(usuarioLogueadoBtn.id_usuario);
            if (reVerificar.yaComprado) {
                alert("Ya adquiriste este título anteriormente.");
                return;
            }

            // COMPRA
            const { data: compra } = await supabase
            .from("compras")
            .insert([{
                id_usuario: usuarioLogueadoBtn.id_usuario,
                fecha_compra: new Date(),
                total_compra: juego.precio_base
            }])
            .select()
            .single()

            // DETALLE
            await supabase
            .from("detalle_compras")
            .insert([{
                id_compra: compra.id_compra,
                id_juego,
                precio_unitario: juego.precio_base
            }])

            // PAGO
            await supabase
            .from("pagos")
            .insert([{
                id_compra: compra.id_compra,
                metodo_pago: "Digital",
                estado_pago: "Completado"
            }])

            // BIBLIOTECA
            await supabase
            .from("biblioteca")
            .insert([{
                id_usuario: usuarioLogueadoBtn.id_usuario,
                id_juego,
                horas_jugadas: 0,
                fecha_adquisicion: new Date()
            }])

            // Si estaba en la lista de deseos, puedes dejarlo ahí o limpiarlo. Por ahora se confirma la compra.
            alert("Compra realizada")
            window.location.href = "biblioteca.html"
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
        const { data: tablaIntermedia, error: errorIntermedio } = await supabase
            .from("juegos_categorias")
            .select("id_categoria")
            .eq("id_juego", id_juego);

        if (!errorIntermedio && tablaIntermedia && tablaIntermedia.length > 0) {
            const idCategoriaEncontrado = tablaIntermedia[0].id_categoria;

            if (idCategoriaEncontrado) {
                const { data: categoriaFinal, error: errorCat } = await supabase
                    .from("categorias")
                    .select("nombre_categoria, descripcion")
                    .eq("id_categoria", idCategoriaEncontrado)
                    .single();

                if (!errorCat && categoriaFinal) {
                    if (txtCategoria) txtCategoria.innerText = categoriaFinal.nombre_categoria;
                    if (txtDescripcionCat) txtDescripcionCat.innerText = categoriaFinal.descripcion;
                    console.log("Categoría vinculada y cargada con éxito.");
                } else {
                    marcarCategoriaPorDefecto();
                }
            } else {
                marcarCategoriaPorDefecto();
            }
        } else {
            marcarCategoriaPorDefecto();
        }
    } catch (err) {
        console.error("Error crítico al procesar la información de categorías:", err);
        marcarCategoriaPorDefecto();
    }

    function marcarCategoriaPorDefecto() {
        if (txtCategoria) txtCategoria.innerText = "General";
        if (txtDescripcionCat) txtDescripcionCat.innerText = "Este título no cuenta con una descripción de género asignada.";
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
        } else {
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
    }

    // ------------------------------------------------------------------
    // 5. CARGAR HISTORIAL DE ACTUALIZACIONES
    // ------------------------------------------------------------------
    try {
        const { data: actualizaciones, error: errorActualizaciones } = await supabase
            .from("actualizaciones")
            .select("id_actualizacion, version, notas_parche")
            .eq("id_juego", id_juego)
            .order("id_actualizacion", { ascending: false });

        if (errorActualizaciones) throw errorActualizaciones;

        if (contenedorActualizaciones) {
            contenedorActualizaciones.innerHTML = "";

            if (!actualizaciones || actualizaciones.length === 0) {
                contenedorActualizaciones.innerHTML = `<p class="subtitle" style="text-align: left; color: #9ca3af;">Este juego se encuentra en su versión de lanzamiento base. No hay parches registrados.</p>`;
            } else {
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
        }
    } catch (err) {
        cargarActualizacionesMayuscula(id_juego);
    }

    async function cargarActualizacionesMayuscula(idJuego) {
        const { data: actualizaciones } = await supabase
            .from("Actualizaciones")
            .select("id_actualizacion, version, notas_parche")
            .eq("id_juego", idJuego)
            .order("id_actualizacion", { ascending: false });

        if (contenedorActualizaciones) {
            contenedorActualizaciones.innerHTML = "";
            if (actualizaciones && actualizaciones.length > 0) {
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
                contenedorActualizaciones.innerHTML = `<p class="subtitle" style="text-align: left; color: #9ca3af;">Este juego se encuentra en su versión de lanzamiento base.</p>`;
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", cargarPantallaJuego);


// ==================================================================
// FUNCIONALIDAD: LISTA DE DESEOS (CON FILTRO DE ESTADO PREVIO ACTUALIZADO)
// ==================================================================
const observarInfoJuego = new MutationObserver(async (mutations, observer) => {
    const btnComprar = document.getElementById("btnComprar");
    
    if (btnComprar && !document.getElementById("btnDeseos")) {
        const usuarioLogueado = JSON.parse(localStorage.getItem("usuario"));
        let estado = { yaComprado: false, enListaDeseos: false };

        if (usuarioLogueado) {
            estado = await verificarEstadoUsuario(usuarioLogueado.id_usuario);
        }

        // Si el usuario ya compró el juego, no tiene sentido mostrar el botón de lista de deseos
        if (estado.yaComprado) {
            observer.disconnect();
            return;
        }

        const btnDeseos = document.createElement("button");
        btnDeseos.id = "btnDeseos";
        btnDeseos.style.marginLeft = "12px";

        // Configuración inicial del botón según si ya está guardado o no
        if (estado.enListaDeseos) {
            btnDeseos.innerText = "❤️ En tu Lista de Deseos";
            btnDeseos.disabled = true;
            btnDeseos.style.backgroundColor = "#1f2937";
            btnDeseos.style.color = "#9ca3af";
            btnDeseos.style.cursor = "not-allowed";
        } else {
            btnDeseos.innerText = "Añadir a lista de deseos";
            btnDeseos.style.backgroundColor = "#4b5563";
            btnDeseos.style.color = "#ffffff";
        }

        btnComprar.parentNode.appendChild(btnDeseos);

        btnDeseos.addEventListener("click", async () => {
            const usuarioLogueadoBtn = JSON.parse(localStorage.getItem("usuario"));

            if (!usuarioLogueadoBtn) {
                alert("Debes iniciar sesión para añadir este juego a tu lista de deseos.");
                return;
            }

            try {
                // Validación de seguridad de doble clic o solapamiento
                const reVerificar = await verificarEstadoUsuario(usuarioLogueadoBtn.id_usuario);
                
                if (reVerificar.yaComprado) {
                    alert("No puedes añadirlo: ¡Ya posees este juego en tu biblioteca!");
                    btnDeseos.remove(); // Desaparece el botón ya que no aplica
                    return;
                }

                if (reVerificar.enListaDeseos) {
                    alert("Este juego ya está en tu lista de deseos.");
                    return;
                }

                // Inserción limpia en Supabase
                const { error: errorInsert } = await supabase
                    .from("lista_deseos")
                    .insert([{
                        id_usuario: usuarioLogueadoBtn.id_usuario,
                        id_juego: id_juego,
                        notificar_oferta: true
                    }]);

                if (errorInsert) throw errorInsert;

                alert("¡Juego añadido a tu lista de deseos!");
                btnDeseos.innerText = "❤️ En tu Lista de Deseos";
                btnDeseos.disabled = true;
                btnDeseos.style.backgroundColor = "#1f2937";
                btnDeseos.style.color = "#9ca3af";
                btnDeseos.style.cursor = "not-allowed";

            } catch (err) {
                console.error("Error en la operación de lista_deseos:", err);
                alert("No se pudo completar la acción. Verifica la base de datos.");
            }
        });

        observer.disconnect();
    }
});

if (infoJuego) {
    observarInfoJuego.observe(infoJuego, { childList: true, subtree: true });
}