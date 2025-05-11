const socket = io();

const listaSalas = document.getElementById('lista-salas');
const inputSala = document.getElementById('nueva-sala');
const btnCrearSala = document.getElementById('crear-sala');
const divMensajes = document.getElementById('mensajes');

// Mostrar las salas disponibles
socket.on('listaSalas', (salas) => {
  listaSalas.innerHTML = '';
  salas.forEach(nombre => {
    const li = document.createElement('li');
    li.textContent = nombre;
    li.style.cursor = 'pointer';
    li.onclick = () => unirseSala(nombre);
    listaSalas.appendChild(li);
  });
});

// Recibir mensajes de la sala
socket.on('mensaje', (msg) => {
  const p = document.createElement('p');
  p.textContent = msg;
  divMensajes.appendChild(p);
});

// Crear o unirse a una sala
btnCrearSala.onclick = () => {
  const nombre = inputSala.value.trim();
  if (nombre) {
    unirseSala(nombre);
    inputSala.value = '';
  }
};

function unirseSala(nombre) {
  socket.emit('unirseSala', nombre);
}

// Obtener nombre del usuario desde la sesión
fetch('/session')
  .then(res => {
    if (!res.ok) throw new Error('No autenticado');
    return res.json();
  })
  .then(data => {
    const bienvenida = document.getElementById('bienvenida');
    bienvenida.textContent = `Bienvenido, ${data.nombre}`;
  })
  .catch(() => {
    // Si no está autenticado, redirigir al login
    window.location.href = '/login.html';
  });
