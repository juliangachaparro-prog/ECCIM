document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("logout");
    
    if (btnLogout) {
        btnLogout.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("usuario");
            window.location.href = "../login.html"; // Asegúrate de que esta ruta sea correcta
        });
    }
});