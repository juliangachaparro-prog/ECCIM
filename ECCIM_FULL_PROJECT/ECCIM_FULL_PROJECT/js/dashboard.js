import { supabase } from './supabase.js' // Busca supabase.js en la misma carpeta /js

const gridJuegos = document.getElementById("catalogo")

async function cargarCatalogo() {
    console.log("Cargando catálogo desde Supabase...");

    const { data: juegos, error } = await supabase
        .from("juegos")
        .select("*")

    if (error) {
        console.error("Error al cargar el catálogo:", error)
        if (gridJuegos) gridJuegos.innerHTML = `<p class="error">No se pudo conectar con la base de datos.</p>`
        return
    }

    if (!juegos || juegos.length === 0) {
        if (gridJuegos) gridJuegos.innerHTML = `<p class="subtitle">No hay juegos disponibles.</p>`
        return
    }

    if (gridJuegos) {
        gridJuegos.innerHTML = ""

        juegos.forEach(juego => {
            const card = document.createElement("div")
            card.classList.add("card") // Usamos la clase estándar de tus estilos

            const imagenFondo = juego.url_imagen || "https://placehold.co/300x400/1f2937/9ca3af?text=" + encodeURIComponent(juego.titulo)

            card.innerHTML = `
                <img src="${imagenFondo}" alt="${juego.titulo}" class="card">
                <div class="card-content">
                    <h3>${juego.titulo}</h3>
                    <p class="precio">$${juego.precio_base}</p>
                </div>
            `

            // 1. PROCESAR LA FECHA DE LANZAMIENTO
            const fechaFormateada = juego.fecha_lanzamiento
                ? new Date(juego.fecha_lanzamiento).toLocaleDateString("es-CO", { year: 'numeric', month: 'short' }) 
                : "Sin fecha"

            // 2. INYECTAR LOS DATOS (Añadimos la etiqueta <span class="fecha">)
            card.innerHTML = `
                <img src="${imagenFondo}" alt="${juego.titulo}" class="card">
                <div class="card-content">
                    <h3>${juego.titulo}</h3>
                    <div class="card-detalles" style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span class="precio" style="font-weight: bold; color: #3b82f6;">$${juego.precio_base}</span>
                        <span class="fecha" style="font-size: 12px; color: #9ca3af;">${fechaFormateada}</span>
                    </div>
                </div>
            `
            // AL DAR CLIC: Como ya estamos en la carpeta /usuario, solo llamamos a juego.html directo
            card.onclick = () => {
                window.location.href = `juego.html?id=${juego.id_juego}`
            }

            gridJuegos.appendChild(card)
        })
    }
}

document.addEventListener("DOMContentLoaded", cargarCatalogo)