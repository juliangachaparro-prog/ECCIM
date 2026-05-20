import { supabase }
from './supabase.js'

// HTML
const tablaContainer =
document.getElementById(
    "tablaContainer"
)

// PAGINACIÓN
let paginaActual = 1

const registrosPorPagina = 20

let tablaActual = ""

// CARGAR TABLA
window.cargarTabla =
async (tabla, pagina = 1) => {

    tablaActual = tabla

    paginaActual = pagina

    // PAGINACIÓN
    const desde =
    (pagina - 1)
    *
    registrosPorPagina

    const hasta =
    desde
    +
    registrosPorPagina
    -
    1

    // DETECTAR ID
    let columnaId = "id"

    if(tabla === "usuarios")
    columnaId = "id_usuario"

    if(tabla === "juegos")
    columnaId = "id_juego"

    if(tabla === "compras")
    columnaId = "id_compra"

    if(tabla === "detalle_compras")
    columnaId = "id_detalle"

    if(tabla === "pagos")
    columnaId = "id_pago"

    if(tabla === "biblioteca")
    columnaId = "id_biblioteca"

    if(tabla === "tickets_soporte")
    columnaId = "id_ticket"

    if(tabla === "resenas")
    columnaId = "id_resena"

    // CONSULTA
    const { data, error }
    =
    await supabase
    .from(tabla)
    .select("*")
    .order(
        columnaId,
        {
            ascending: false
        }
    )
    .range(
        desde,
        hasta
    )

    // ERROR
    if(error){

        console.log(error)

        tablaContainer.innerHTML =
        `
        <h2>
            Error cargando tabla
        </h2>
        `

        return
    }

    // SIN DATOS
    if(!data || data.length === 0){

        tablaContainer.innerHTML =
        `
        <h2>
            Sin registros
        </h2>
        `

        return
    }

    // COLUMNAS
    const columnas =
    Object.keys(data[0])

    // HTML
    let html = `

    <h1>

        Tabla:
        ${tabla}

    </h1>

    <div class="tabla-scroll">

    <table>

        <thead>

            <tr>

    `

    // ENCABEZADOS
    columnas.forEach(col => {

        html += `

        <th>

            ${col}

        </th>

        `
    })

    html += `

            </tr>

        </thead>

        <tbody>

    `

    // FILAS
    data.forEach(fila => {

        html += `<tr>`

        columnas.forEach(col => {

            html += `

            <td>

                ${fila[col]}

            </td>

            `
        })

        html += `</tr>`
    })

    html += `

        </tbody>

    </table>

    </div>

    <!-- PAGINACIÓN -->

    <div class="paginacion">

        <button
        onclick="
        cargarTabla(
            '${tabla}',
            ${paginaActual - 1}
        )
        "
        ${paginaActual <= 1
        ? "disabled"
        : ""}>

            Atrás

        </button>

        <span>

            Página
            ${paginaActual}

        </span>

        <button
        onclick="
        cargarTabla(
            '${tabla}',
            ${paginaActual + 1}
        )
        ">

            Siguiente

        </button>

    </div>

    `

    // PINTAR
    tablaContainer.innerHTML =
    html

}