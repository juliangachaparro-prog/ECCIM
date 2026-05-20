import { supabase }
from './supabase.js'

// HTML
const formTicket =
document.getElementById(
    "formTicket"
)

const listaTickets =
document.getElementById(
    "listaTickets"
)

// USUARIO
const usuario =
JSON.parse(
    localStorage.getItem(
        "usuario"
    )
)

// CREAR TICKET
formTicket.addEventListener(
"submit",
async (e) => {

    e.preventDefault()

    const asunto =
    document.getElementById(
        "asunto"
    ).value

    const { error }
    =
    await supabase
.from("tickets_soporte")
    .insert([{

        id_usuario:
        usuario.id_usuario,

        asunto,

        estado_ticket:
        "Pendiente"

    }])

    if(error){

        alert(
            "Error al crear ticket"
        )

        return
    }

    alert(
        "Ticket enviado"
    )

    formTicket.reset()

    cargarTickets()

})

// VER TICKETS
async function cargarTickets(){

    const { data }
    =
    await supabase
    .from("tickets_soporte")
    .select("*")
    .eq(
        "id_usuario",
        usuario.id_usuario
    )
    .order(
        "id_ticket",
        {
            ascending: false
        }
    )

    listaTickets.innerHTML = ""

    data.forEach(ticket => {

        listaTickets.innerHTML += `

        <div class="ticket-card">

            <h3>

                ${ticket.asunto}

            </h3>

            <p>

                Estado:
                ${ticket.estado_ticket}


            <p>

                Respuesta:
                ${ticket.respuesta_soporte}

            </p>

        </div>

        `
    })
}

cargarTickets()