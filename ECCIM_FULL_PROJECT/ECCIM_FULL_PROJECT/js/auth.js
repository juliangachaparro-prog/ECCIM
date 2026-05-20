const usuario = JSON.parse(localStorage.getItem('usuario'));
const paginaActual = window.location.pathname;

// 1. Si no hay sesión iniciada, todos van para afuera
if (!usuario) {
    window.location.href = '../login.html';
} else {
    // 2. Si la URL contiene "/admin/" pero el rol NO es 1 (Admin)
    if (paginaActual.includes('/admin/') && usuario.id_rol !== 1) {
        alert("Acceso denegado. No eres Administrador.");
        window.location.href = '../login.html';
    }
    
    // 3. Si la URL contiene "/usuario/" pero el rol NO es 2 (Usuario normal)
    else if (paginaActual.includes('/usuario/') && usuario.id_rol !== 2) {
        alert("Acceso denegado. Esta sección es para clientes.");
        window.location.href = '../login.html';
    }
    
    // 4. Si la URL contiene "/soporte/" pero el rol NO es 3 (Soporte)
    else if (paginaActual.includes('/soporte/') && usuario.id_rol !== 3) {
        alert("Acceso denegado. No perteneces al equipo de soporte.");
        window.location.href = '../login.html';
    }
}