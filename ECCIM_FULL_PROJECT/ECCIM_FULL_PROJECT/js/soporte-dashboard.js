import { supabase }
from './supabase.js'

// HTML
const listaTickets =
document.getElementById(
    "listaTickets"
)

// FUNCIONES GLOBALES
window.cambiarEstado =
async (id_ticket, estado) => {

    const { error }
    =
    await supabase
    .from("tickets_soporte")
    .update({

        estado_ticket:
        estado

    })
    .eq(
        "id_ticket",
        id_ticket
    )

    if(error){

        console.log(error)

        alert(
            "Error actualizando"
        )

        return
    }

    alert(
        "Estado actualizado"
    )

}

// RESPUESTA SOPORTE
window.guardarRespuesta =
async (id_ticket) => {

    const respuesta =
    document.getElementById(
        `respuesta-${id_ticket}`
    ).value

    const { error }
    =
    await supabase
    .from("tickets_soporte")
    .update({

        respuesta_soporte:
        respuesta

    })
    .eq(
        "id_ticket",
        id_ticket
    )

    if(error){

        console.log(error)

        alert(
            "Error guardando respuesta"
        )

        return
    }

    alert(
        "Respuesta enviada"
    )

}

// CARGAR TICKETS
async function cargarTickets(){

    const { data, error }
    =
    await supabase
    .from("tickets_soporte")
    .select("*")
    .order(
        "id_ticket",
        {
            ascending: false
        }
    )
    .limit(20)

    if(error){

        console.log(error)

        return
    }

    listaTickets.innerHTML = ""

    // SIN TICKETS
    if(data.length === 0){

        listaTickets.innerHTML = `

        <p>

            No hay tickets.

        </p>

        `

        return
    }

    // MOSTRAR
    data.forEach(ticket => {

        listaTickets.innerHTML += `

        <div class="ticket-card">

            <h2>

                Ticket #${ticket.id_ticket}

            </h2>

            <p>

                Usuario:
                ${ticket.id_usuario}

            </p>

            <p>

                ${ticket.asunto}

            </p>

            <p>

                Estado:
                ${ticket.estado_ticket}

            </p>

            <!-- ESTADO -->
            <select
            onchange="
            cambiarEstado(
                ${ticket.id_ticket},
                this.value
            )
            ">

                <option
                value="Pendiente"
                ${ticket.estado_ticket === "Pendiente"
                ? "selected"
                : ""}>

                    Pendiente

                </option>

                <option
                value="En proceso"
                ${ticket.estado_ticket === "En proceso"
                ? "selected"
                : ""}>

                    En proceso

                </option>

                <option
                value="Cerrado"
                ${ticket.estado_ticket === "Cerrado"
                ? "selected"
                : ""}>

                    Cerrado

                </option>

            </select>

            <!-- RESPUESTA -->
            <textarea
            id="respuesta-${ticket.id_ticket}"
            placeholder="Responder ticket...">

${ticket.respuesta_soporte || ""}

            </textarea>

            <button
            onclick="
            guardarRespuesta(
                ${ticket.id_ticket}
            )
            ">

                Guardar Respuesta

            </button>

        </div>

        `
    })

}

// INICIO
cargarTickets()