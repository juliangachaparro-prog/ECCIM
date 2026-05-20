import { supabase }
from './supabase.js'

const form =
document.getElementById("formRegistro")

form.addEventListener("submit", async (e) => {

    e.preventDefault()

    const num_doc =
    document.getElementById("num_doc").value

    const username =
    document.getElementById("username").value

    const correo =
    document.getElementById("correo").value

    const password =
    document.getElementById("password").value

    // MD5
    const contrasena_hash =
    md5(password)

    const { error } =
    await supabase
    .from("usuarios")
    .insert([{

        num_doc,
        username,
        correo,
        contrasena_hash,

        id_rol: 2

    }])

    if(error){

        alert(error.message)
        return
    }

    alert("Usuario registrado")

    window.location.href =
    "login.html"

})