window.onload = () => {
    const nombreUsuario = sessionStorage.getItem("nombre");

    if (!nombreUsuario) {
        // Si no hay nombre en session, redirigir a index
        window.location.href = "index.html";
        return;
    }

    // Mostrar nombre en el label
    document.getElementById("usuarioNombre").textContent = `Bienvenido, ${nombreUsuario}`;
};

// Botón salir
document.addEventListener("DOMContentLoaded", () => {
    const btnSalir = document.getElementById("btnSalir");

    btnSalir.addEventListener("click", () => {
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "index.html";
    });
});