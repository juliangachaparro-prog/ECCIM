import { supabase }
from './supabase.js'

const form =
document.getElementById("formLogin")

form.addEventListener("submit", async (e) => {

    e.preventDefault()

    const correo =
    document
    .getElementById("correo")
    .value
    .trim()

    const password =
    document
    .getElementById("password")
    .value
    .trim()

    // MD5
    const contrasena_hash =
    md5(password)

    console.log(contrasena_hash)

    // BUSCAR USUARIO
    const { data: usuario, error } =
    await supabase
    .from("usuarios")
    .select("*")
    .eq("correo", correo)
    .eq(
        "contrasena_hash",
        contrasena_hash
    )
    .single()

    if(error){

        console.log(error)

        alert("Credenciales incorrectas")

        return
    }

    // GUARDAR SESIÓN
    localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
    )

    // REDIRECCIÓN
    if(usuario.id_rol == 1){

        window.location.href =
        "./admin/dashboard.html"
    }

    else if(usuario.id_rol == 2){

        window.location.href =
        "./usuario/dashboard.html"
    }

    else if(usuario.id_rol == 3){

        window.location.href =
        "./soporte/dashboard.html"
    }

})